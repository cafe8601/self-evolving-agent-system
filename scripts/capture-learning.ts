#!/usr/bin/env npx tsx
/**
 * 학습 캡처 CLI
 *
 * SuperClaude 명령어 실행 중 발견된 패턴을 쉽게 기록할 수 있습니다.
 * 이 스크립트는 Claude가 작업 중 호출하거나, 사용자가 수동으로 실행할 수 있습니다.
 *
 * 사용법:
 *   # 성공 패턴 기록
 *   npx tsx scripts/capture-learning.ts success "컨텍스트" "학습 내용" --tags "tag1,tag2"
 *
 *   # 실패 패턴 기록
 *   npx tsx scripts/capture-learning.ts failure "컨텍스트" "실패 원인" --tags "tag1,tag2"
 *
 *   # 경고 기록
 *   npx tsx scripts/capture-learning.ts warning "컨텍스트" "경고 내용"
 *
 *   # 발견 기록
 *   npx tsx scripts/capture-learning.ts discovery "컨텍스트" "발견 내용"
 *
 * 별칭:
 *   npm run learn:success "컨텍스트" "내용"
 *   npm run learn:failure "컨텍스트" "내용"
 */

import * as fs from 'fs';
import * as path from 'path';
import * as yaml from 'yaml';

const PROJECT_ROOT = path.resolve(__dirname, '..');
const PENDING_PATH = path.join(PROJECT_ROOT, '.opencode/brain/pending_patterns.yaml');

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

type LearningType = 'success' | 'failure' | 'warning' | 'discovery';

const TYPE_CONFIG: Record<LearningType, { status: 'SUCCESS_PATTERN' | 'FAILURE_PATTERN'; confidence: number; defaultTags: string[] }> = {
  success: {
    status: 'SUCCESS_PATTERN',
    confidence: 0.85,
    defaultTags: ['success', 'learned'],
  },
  failure: {
    status: 'FAILURE_PATTERN',
    confidence: 0.9,
    defaultTags: ['failure', 'avoid'],
  },
  warning: {
    status: 'FAILURE_PATTERN',
    confidence: 0.75,
    defaultTags: ['warning', 'caution'],
  },
  discovery: {
    status: 'SUCCESS_PATTERN',
    confidence: 0.8,
    defaultTags: ['discovery', 'insight'],
  },
};

function showHelp(): void {
  console.log(`
📚 학습 캡처 CLI

사용법:
  npx tsx scripts/capture-learning.ts <타입> <컨텍스트> <내용> [옵션]

타입:
  success    성공 패턴 기록 (추천 방식)
  failure    실패 패턴 기록 (회피해야 할 방식)
  warning    경고 기록 (주의해야 할 상황)
  discovery  발견 기록 (새로운 인사이트)

옵션:
  --tags, -t       태그 (쉼표로 구분)
  --files, -f      관련 파일 (쉼표로 구분)
  --confidence     신뢰도 (0.0-1.0)
  --command, -c    관련 SuperClaude 명령어

예시:
  # React 컴포넌트 최적화 성공 패턴
  npx tsx scripts/capture-learning.ts success \\
    "React 컴포넌트 최적화" \\
    "React.memo()와 useMemo()를 함께 사용하여 리렌더링 50% 감소" \\
    --tags "react,performance" \\
    --files "src/components/UserList.tsx"

  # API 타임아웃 실패 패턴
  npx tsx scripts/capture-learning.ts failure \\
    "외부 API 호출 타임아웃" \\
    "타임아웃 없이 외부 API 호출 시 무한 대기 발생" \\
    --tags "api,timeout" \\
    --command "/sc:implement"

  # 새로운 발견 기록
  npx tsx scripts/capture-learning.ts discovery \\
    "TypeScript 타입 추론" \\
    "as const 어설션으로 리터럴 타입 보존 가능"
`);
}

function parseArgs(): {
  type: LearningType;
  context: string;
  content: string;
  tags: string[];
  files: string[];
  confidence?: number;
  command?: string;
} | null {
  const args = process.argv.slice(2);

  if (args.length < 3 || args[0] === '--help' || args[0] === '-h') {
    return null;
  }

  const typeArg = args[0].toLowerCase() as LearningType;
  if (!['success', 'failure', 'warning', 'discovery'].includes(typeArg)) {
    console.error(`❌ 알 수 없는 타입: ${args[0]}`);
    console.error('   유효한 타입: success, failure, warning, discovery');
    return null;
  }

  const result = {
    type: typeArg,
    context: args[1],
    content: args[2],
    tags: [] as string[],
    files: [] as string[],
    confidence: undefined as number | undefined,
    command: undefined as string | undefined,
  };

  // 추가 옵션 파싱
  for (let i = 3; i < args.length; i++) {
    switch (args[i]) {
      case '--tags':
      case '-t':
        result.tags = (args[++i] || '').split(',').map(t => t.trim()).filter(Boolean);
        break;
      case '--files':
      case '-f':
        result.files = (args[++i] || '').split(',').map(f => f.trim()).filter(Boolean);
        break;
      case '--confidence':
        result.confidence = parseFloat(args[++i]) || undefined;
        break;
      case '--command':
      case '-c':
        result.command = args[++i];
        break;
    }
  }

  return result;
}

function captureLeaning(): void {
  const parsed = parseArgs();

  if (!parsed) {
    showHelp();
    process.exit(1);
  }

  const { type, context, content, tags, files, confidence, command } = parsed;
  const config = TYPE_CONFIG[type];

  // pending_patterns.yaml 읽기
  if (!fs.existsSync(PENDING_PATH)) {
    console.error('❌ pending_patterns.yaml 파일을 찾을 수 없습니다.');
    console.error(`   경로: ${PENDING_PATH}`);
    process.exit(1);
  }

  const pendingContent = fs.readFileSync(PENDING_PATH, 'utf-8');
  const pending: PendingData = yaml.parse(pendingContent);

  // 패턴 생성
  const allTags = [...new Set([...config.defaultTags, ...tags])];
  if (command) {
    const commandTag = command.replace('/sc:', 'sc-');
    allTags.push(commandTag);
  }

  const newPattern: PendingPattern = {
    id: 'auto',
    context,
    status: config.status,
    content,
    confidence: confidence || config.confidence,
    tags: allTags,
    related_files: files,
  };

  // 패턴 추가
  if (!pending.pending_patterns) {
    pending.pending_patterns = [];
  }
  pending.pending_patterns.push(newPattern);
  pending.metadata.last_updated = new Date().toISOString();

  // 메트릭스 업데이트
  if (type === 'success' || type === 'discovery') {
    pending.pending_metrics.tasks_completed++;
  } else {
    pending.pending_metrics.tasks_failed++;
  }

  // 파일 저장
  const header = `# Pending Patterns - 자동 학습 중간 파일
#
# Claude가 작업 중 발견한 패턴을 여기에 기록합니다.
# 세션 종료 시 Hook이 이 파일을 읽어 project_brain.yaml에 병합합니다.

`;

  fs.writeFileSync(PENDING_PATH, header + yaml.stringify(pending), 'utf-8');

  // 결과 출력
  const emoji = {
    success: '✅',
    failure: '❌',
    warning: '⚠️',
    discovery: '💡',
  }[type];

  console.log(`${emoji} 학습 캡처 완료!`);
  console.log(`   타입: ${type.toUpperCase()}`);
  console.log(`   컨텍스트: ${context}`);
  console.log(`   상태: ${config.status}`);
  console.log(`   태그: ${allTags.join(', ')}`);
  console.log(`   대기 중인 패턴: ${pending.pending_patterns.length}개`);
  console.log('');
  console.log('💡 세션 종료 시 자동으로 project_brain.yaml에 병합됩니다.');
  console.log('   수동 병합: npx tsx scripts/sync-brain.ts');
}

captureLeaning();
