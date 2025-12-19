#!/usr/bin/env npx tsx
/**
 * SuperClaude 명령어 Hook 처리기
 *
 * PostToolUse Hook에서 stdin으로 전달된 JSON을 파싱하여
 * /sc:* 명령어 실행 결과를 분석하고 패턴을 추출합니다.
 *
 * 입력 (stdin JSON):
 * {
 *   "tool_name": "SlashCommand",
 *   "tool_input": { "command": "/sc:implement ..." },
 *   "tool_response": { ... }
 * }
 *
 * 환경변수:
 *   SC_RESULT - 명령어 실행 결과 (success/failure)
 */

import * as fs from 'fs';
import * as path from 'path';
import * as yaml from 'yaml';
import * as readline from 'readline';

const PROJECT_ROOT = path.resolve(__dirname, '..');
const PENDING_PATH = path.join(PROJECT_ROOT, '.opencode/brain/pending_patterns.yaml');
const LOG_PATH = path.join(PROJECT_ROOT, '.opencode/brain/sc_log.yaml');

// SuperClaude 명령어 → 학습 카테고리 매핑
const COMMAND_CATEGORIES: Record<string, { tags: string[]; learningFocus: string }> = {
  '/sc:analyze': {
    tags: ['analysis', 'code-quality'],
    learningFocus: '코드 분석 패턴',
  },
  '/sc:implement': {
    tags: ['implementation', 'coding'],
    learningFocus: '구현 패턴',
  },
  '/sc:design': {
    tags: ['architecture', 'design'],
    learningFocus: '설계 패턴',
  },
  '/sc:test': {
    tags: ['testing', 'quality'],
    learningFocus: '테스트 패턴',
  },
  '/sc:refactor': {
    tags: ['refactoring', 'code-quality'],
    learningFocus: '리팩토링 패턴',
  },
  '/sc:document': {
    tags: ['documentation'],
    learningFocus: '문서화 패턴',
  },
  '/sc:git': {
    tags: ['git', 'version-control'],
    learningFocus: 'Git 워크플로우 패턴',
  },
  '/sc:troubleshoot': {
    tags: ['debugging', 'troubleshooting'],
    learningFocus: '트러블슈팅 패턴',
  },
  '/sc:build': {
    tags: ['build', 'deployment'],
    learningFocus: '빌드 패턴',
  },
  '/sc:research': {
    tags: ['research', 'investigation'],
    learningFocus: '리서치 패턴',
  },
  '/sc:workflow': {
    tags: ['workflow', 'automation'],
    learningFocus: '워크플로우 패턴',
  },
  '/sc:improve': {
    tags: ['improvement', 'optimization'],
    learningFocus: '개선 패턴',
  },
  '/sc:cleanup': {
    tags: ['cleanup', 'maintenance'],
    learningFocus: '정리 패턴',
  },
  '/sc:explain': {
    tags: ['explanation', 'documentation'],
    learningFocus: '설명 패턴',
  },
  '/sc:estimate': {
    tags: ['estimation', 'planning'],
    learningFocus: '추정 패턴',
  },
  '/sc:brainstorm': {
    tags: ['brainstorming', 'ideation'],
    learningFocus: '브레인스토밍 패턴',
  },
  '/sc:spec-panel': {
    tags: ['specification', 'review'],
    learningFocus: '스펙 리뷰 패턴',
  },
  '/sc:help': {
    tags: ['help', 'reference'],
    learningFocus: '도움말 참조',
  },
};

interface HookInput {
  session_id?: string;
  transcript_path?: string;
  cwd?: string;
  hook_event_name?: string;
  tool_name?: string;
  tool_input?: {
    command?: string;  // SlashCommand tool
    skill?: string;    // Skill tool
    [key: string]: unknown;
  };
  tool_response?: unknown;
  tool_use_id?: string;
}

interface PendingPattern {
  id: string;
  context: string;
  status: 'SUCCESS_PATTERN' | 'FAILURE_PATTERN';
  content: string;
  confidence?: number;
  tags: string[];
  related_files: string[];
}

interface PendingData {
  pending_patterns: PendingPattern[];
  pending_workflows: unknown[];
  pending_metrics: {
    patterns_applied: number;
    tasks_completed: number;
    tasks_failed: number;
  };
  metadata: {
    last_updated: string | null;
    session_id: string | null;
    auto_sync: boolean;
  };
}

interface SCLogEntry {
  timestamp: string;
  command: string;
  result: 'success' | 'failure';
  tool_name?: string;
  pattern_generated: boolean;
}

interface SCLog {
  entries: SCLogEntry[];
  stats: {
    total_commands: number;
    success_count: number;
    failure_count: number;
    patterns_generated: number;
  };
}

/**
 * stdin에서 JSON 읽기
 */
async function readStdin(): Promise<string> {
  return new Promise((resolve) => {
    let data = '';

    // 타임아웃 설정 (stdin이 없으면 빈 문자열 반환)
    const timeout = setTimeout(() => {
      resolve(data);
    }, 100);

    if (process.stdin.isTTY) {
      clearTimeout(timeout);
      resolve('');
      return;
    }

    process.stdin.setEncoding('utf8');
    process.stdin.on('data', (chunk) => {
      data += chunk;
    });
    process.stdin.on('end', () => {
      clearTimeout(timeout);
      resolve(data);
    });
    process.stdin.on('error', () => {
      clearTimeout(timeout);
      resolve('');
    });
  });
}

/**
 * 명령어에서 기본 명령어 추출 ("/sc:analyze --think" -> "/sc:analyze")
 */
function extractBaseCommand(command: string): string {
  const match = command.match(/^(\/sc:[a-z-]+)/i);
  return match ? match[1].toLowerCase() : command;
}

/**
 * 패턴 생성 여부 결정
 */
function shouldGeneratePattern(
  command: string,
  result: 'success' | 'failure'
): boolean {
  // 실패는 항상 학습
  if (result === 'failure') {
    return true;
  }

  // 특정 명령어는 성공 시에도 학습
  const alwaysLearnCommands = [
    '/sc:implement',
    '/sc:design',
    '/sc:refactor',
    '/sc:troubleshoot',
    '/sc:workflow',
    '/sc:build',
    '/sc:test',
  ];

  const baseCommand = extractBaseCommand(command);
  return alwaysLearnCommands.includes(baseCommand);
}

/**
 * 로그 파일 업데이트
 */
function updateLog(entry: SCLogEntry): void {
  let log: SCLog = {
    entries: [],
    stats: {
      total_commands: 0,
      success_count: 0,
      failure_count: 0,
      patterns_generated: 0,
    },
  };

  if (fs.existsSync(LOG_PATH)) {
    try {
      log = yaml.parse(fs.readFileSync(LOG_PATH, 'utf-8')) || log;
    } catch {
      // 파싱 실패 시 새 로그 생성
    }
  }

  // 엔트리 추가 (최대 100개 유지)
  log.entries.unshift(entry);
  if (log.entries.length > 100) {
    log.entries = log.entries.slice(0, 100);
  }

  // 통계 업데이트
  log.stats.total_commands++;
  if (entry.result === 'success') {
    log.stats.success_count++;
  } else {
    log.stats.failure_count++;
  }
  if (entry.pattern_generated) {
    log.stats.patterns_generated++;
  }

  const header = `# SuperClaude 명령어 실행 로그
# 최근 100개 명령어 기록
# 마지막 업데이트: ${new Date().toISOString()}

`;

  fs.writeFileSync(LOG_PATH, header + yaml.stringify(log), 'utf-8');
}

/**
 * 메인 함수
 */
async function main(): Promise<void> {
  const result = (process.env.SC_RESULT?.toLowerCase() === 'failure' ? 'failure' : 'success') as 'success' | 'failure';

  // stdin에서 JSON 읽기
  const stdinData = await readStdin();

  let hookInput: HookInput = {};
  let command = '';

  // stdin JSON 파싱 시도
  if (stdinData.trim()) {
    try {
      hookInput = JSON.parse(stdinData);
      // SlashCommand 도구는 command 필드, Skill 도구는 skill 필드 사용
      command = hookInput.tool_input?.command || hookInput.tool_input?.skill || '';
    } catch (e) {
      // JSON 파싱 실패 - 환경변수에서 가져오기 시도
      command = process.env.SC_COMMAND || '';
    }
  } else {
    // stdin 없음 - 환경변수에서 가져오기
    command = process.env.SC_COMMAND || '';
  }

  // /sc: 명령어인지 확인
  if (!command || !command.startsWith('/sc:')) {
    // SuperClaude 명령어가 아님 - 종료
    return;
  }

  console.log(`🔍 SuperClaude Hook 처리 중...`);
  console.log(`   명령어: ${command}`);
  console.log(`   결과: ${result}`);
  console.log(`   도구: ${hookInput.tool_name || 'unknown'}`);

  const baseCommand = extractBaseCommand(command);
  const category = COMMAND_CATEGORIES[baseCommand] || {
    tags: ['general'],
    learningFocus: '일반 패턴',
  };

  // 패턴 생성 여부 결정
  const generatePattern = shouldGeneratePattern(command, result);

  // 로그 엔트리 생성
  const logEntry: SCLogEntry = {
    timestamp: new Date().toISOString(),
    command,
    result,
    tool_name: hookInput.tool_name,
    pattern_generated: generatePattern,
  };

  // 로그 업데이트
  updateLog(logEntry);
  console.log(`   📋 로그 기록 완료`);

  // 패턴 생성
  if (generatePattern) {
    if (!fs.existsSync(PENDING_PATH)) {
      console.error('❌ pending_patterns.yaml 파일을 찾을 수 없습니다.');
      return;
    }

    const pendingContent = fs.readFileSync(PENDING_PATH, 'utf-8');
    const pending: PendingData = yaml.parse(pendingContent);

    const patternContent = result === 'success'
      ? `${category.learningFocus}: ${command} 명령어 실행 성공`
      : `${category.learningFocus}: ${command} 명령어 실패 - 회피 패턴으로 기록`;

    const newPattern: PendingPattern = {
      id: 'auto',
      context: `SuperClaude ${baseCommand} 자동 캡처`,
      status: result === 'success' ? 'SUCCESS_PATTERN' : 'FAILURE_PATTERN',
      content: patternContent,
      confidence: result === 'success' ? 0.85 : 0.9,
      tags: [...category.tags, 'superclaude', 'auto-captured'],
      related_files: [],
    };

    if (!pending.pending_patterns) {
      pending.pending_patterns = [];
    }
    pending.pending_patterns.push(newPattern);
    pending.metadata.last_updated = new Date().toISOString();

    // 메트릭스 업데이트
    if (result === 'success') {
      pending.pending_metrics.tasks_completed++;
    } else {
      pending.pending_metrics.tasks_failed++;
    }

    const header = `# Pending Patterns - 자동 학습 중간 파일
#
# Claude가 작업 중 발견한 패턴을 여기에 기록합니다.
# 세션 종료 시 Hook이 이 파일을 읽어 project_brain.yaml에 병합합니다.

`;

    fs.writeFileSync(PENDING_PATH, header + yaml.stringify(pending), 'utf-8');
    console.log(`   ✅ 패턴 추가 완료: ${newPattern.context}`);
  } else {
    console.log(`   ⏭️ 패턴 생성 건너뜀 (조건 미충족: ${baseCommand})`);
  }

  console.log(`✅ SuperClaude Hook 처리 완료`);
}

main().catch(error => {
  console.error('❌ Hook 처리 중 오류:', error);
  process.exit(0); // 에러가 있어도 0으로 종료 (Hook 실패가 Claude를 중단시키지 않도록)
});
