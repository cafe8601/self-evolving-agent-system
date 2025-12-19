#!/usr/bin/env npx tsx
/**
 * 패턴 추가 헬퍼 스크립트
 *
 * pending_patterns.yaml에 새 패턴을 추가합니다.
 * Claude가 작업 중 이 스크립트를 호출하여 학습 내용을 기록합니다.
 *
 * 사용법:
 *   npx tsx scripts/add-pattern.ts --context "컨텍스트" --status SUCCESS --content "내용" --tags "tag1,tag2"
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

function parseArgs(): {
  context: string;
  status: 'SUCCESS_PATTERN' | 'FAILURE_PATTERN';
  content: string;
  confidence: number;
  tags: string[];
  files: string[];
} {
  const args = process.argv.slice(2);
  const result = {
    context: '',
    status: 'SUCCESS_PATTERN' as const,
    content: '',
    confidence: 0.8,
    tags: [] as string[],
    files: [] as string[],
  };

  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case '--context':
      case '-c':
        result.context = args[++i] || '';
        break;
      case '--status':
      case '-s':
        const status = args[++i]?.toUpperCase();
        if (status === 'SUCCESS' || status === 'SUCCESS_PATTERN') {
          result.status = 'SUCCESS_PATTERN';
        } else if (status === 'FAILURE' || status === 'FAILURE_PATTERN') {
          result.status = 'FAILURE_PATTERN';
        }
        break;
      case '--content':
      case '-m':
        result.content = args[++i] || '';
        break;
      case '--confidence':
        result.confidence = parseFloat(args[++i]) || 0.8;
        break;
      case '--tags':
      case '-t':
        result.tags = (args[++i] || '').split(',').map(t => t.trim()).filter(Boolean);
        break;
      case '--files':
      case '-f':
        result.files = (args[++i] || '').split(',').map(f => f.trim()).filter(Boolean);
        break;
    }
  }

  return result;
}

function addPattern(): void {
  const { context, status, content, confidence, tags, files } = parseArgs();

  if (!context || !content) {
    console.log(`
📝 패턴 추가 스크립트

사용법:
  npx tsx scripts/add-pattern.ts [옵션]

옵션:
  -c, --context     패턴 컨텍스트 (필수)
  -s, --status      SUCCESS 또는 FAILURE (기본: SUCCESS)
  -m, --content     패턴 내용 (필수)
  --confidence      신뢰도 0.0-1.0 (기본: 0.8)
  -t, --tags        태그 (쉼표로 구분)
  -f, --files       관련 파일 (쉼표로 구분)

예시:
  npx tsx scripts/add-pattern.ts \\
    -c "React 컴포넌트 최적화" \\
    -s SUCCESS \\
    -m "React.memo()로 불필요한 리렌더링 방지" \\
    -t "react,performance" \\
    -f "components/UserList.tsx"
`);
    process.exit(1);
  }

  // 파일 읽기
  if (!fs.existsSync(PENDING_PATH)) {
    console.error('❌ pending_patterns.yaml 파일을 찾을 수 없습니다.');
    process.exit(1);
  }

  const pendingContent = fs.readFileSync(PENDING_PATH, 'utf-8');
  const pending: PendingData = yaml.parse(pendingContent);

  // 새 패턴 추가
  const newPattern: PendingPattern = {
    id: 'auto',
    context,
    status,
    content,
    confidence,
    tags,
    related_files: files,
  };

  if (!pending.pending_patterns) {
    pending.pending_patterns = [];
  }
  pending.pending_patterns.push(newPattern);
  pending.metadata.last_updated = new Date().toISOString();

  // 파일 저장
  const header = `# Pending Patterns - 자동 학습 중간 파일
#
# Claude가 작업 중 발견한 패턴을 여기에 기록합니다.
# 세션 종료 시 Hook이 이 파일을 읽어 project_brain.yaml에 병합합니다.

`;

  fs.writeFileSync(PENDING_PATH, header + yaml.stringify(pending), 'utf-8');

  console.log(`✅ 패턴 추가 완료!`);
  console.log(`   컨텍스트: ${context}`);
  console.log(`   상태: ${status}`);
  console.log(`   대기 중인 패턴 수: ${pending.pending_patterns.length}`);
}

addPattern();
