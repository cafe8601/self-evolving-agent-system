#!/usr/bin/env npx tsx
/**
 * Brain 동기화 스크립트
 *
 * pending_patterns.yaml의 내용을 project_brain.yaml에 병합합니다.
 * Claude Code의 Stop hook에서 자동 실행됩니다.
 *
 * 실행: npx tsx scripts/sync-brain.ts
 */

import * as fs from 'fs';
import * as path from 'path';
import * as yaml from 'yaml';

// 경로 설정
const PROJECT_ROOT = path.resolve(__dirname, '..');
const BRAIN_PATH = path.join(PROJECT_ROOT, '.opencode/brain/project_brain.yaml');
const PENDING_PATH = path.join(PROJECT_ROOT, '.opencode/brain/pending_patterns.yaml');

// 타입 정의
interface Pattern {
  id: string;
  context: string;
  status: 'SUCCESS_PATTERN' | 'FAILURE_PATTERN';
  content: string;
  model_used?: string;
  learned_at: string;
  confidence: number;
  tags: string[];
  related_files: string[];
}

interface Workflow {
  workflow: string;
  task: string;
  started_at: string;
  completed_at: string;
  status: 'success' | 'failed';
  patterns_applied: string[];
  patterns_learned: string[];
  files_created?: string[];
  files_modified?: string[];
}

interface PendingData {
  pending_patterns: Array<Omit<Pattern, 'id' | 'learned_at' | 'model_used' | 'confidence'> & {
    id?: string;
    confidence?: number;
  }>;
  pending_workflows: Array<Omit<Workflow, 'workflow' | 'started_at' | 'completed_at'> & {
    started_at?: string;
  }>;
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

interface BrainData {
  project_context: Record<string, unknown>;
  learned_patterns: Pattern[];
  skill_integration: Record<string, unknown>;
  workflow_history: {
    last_sync: string;
    total_tasks: number;
    successful_tasks: number;
    failed_tasks: number;
    success_rate: number;
    model_usage: Record<string, number>;
    recent_workflows: Workflow[];
  };
  metrics: {
    patterns_learned: number;
    patterns_applied: number;
    evolution_cycles: number;
    confidence_average: number;
    by_status: {
      success_patterns: number;
      failure_patterns: number;
    };
    by_tag: Record<string, number>;
  };
  config: Record<string, unknown>;
}

/**
 * 다음 패턴 ID 생성
 */
function getNextPatternId(existingPatterns: Pattern[]): string {
  const maxId = existingPatterns.reduce((max, p) => {
    const match = p.id.match(/LP-(\d+)/);
    if (match) {
      return Math.max(max, parseInt(match[1], 10));
    }
    return max;
  }, 0);
  return `LP-${String(maxId + 1).padStart(3, '0')}`;
}

/**
 * 평균 confidence 계산
 */
function calculateAverageConfidence(patterns: Pattern[]): number {
  if (patterns.length === 0) return 0;
  const sum = patterns.reduce((acc, p) => acc + p.confidence, 0);
  return Math.round((sum / patterns.length) * 1000) / 1000;
}

/**
 * 태그별 카운트 업데이트
 */
function updateTagCounts(existingCounts: Record<string, number>, newPatterns: Pattern[]): Record<string, number> {
  const counts = { ...existingCounts };
  for (const pattern of newPatterns) {
    for (const tag of pattern.tags) {
      counts[tag] = (counts[tag] || 0) + 1;
    }
  }
  return counts;
}

/**
 * 메인 동기화 함수
 */
async function syncBrain(): Promise<void> {
  console.log('🧠 Brain 동기화 시작...\n');

  // 파일 존재 확인
  if (!fs.existsSync(BRAIN_PATH)) {
    console.error('❌ project_brain.yaml 파일을 찾을 수 없습니다.');
    process.exit(1);
  }

  if (!fs.existsSync(PENDING_PATH)) {
    console.error('❌ pending_patterns.yaml 파일을 찾을 수 없습니다.');
    process.exit(1);
  }

  // 파일 읽기
  const brainContent = fs.readFileSync(BRAIN_PATH, 'utf-8');
  const pendingContent = fs.readFileSync(PENDING_PATH, 'utf-8');

  const brain: BrainData = yaml.parse(brainContent);
  const pending: PendingData = yaml.parse(pendingContent);

  // 대기 중인 항목 확인
  const hasPendingPatterns = pending.pending_patterns && pending.pending_patterns.length > 0;
  const hasPendingWorkflows = pending.pending_workflows && pending.pending_workflows.length > 0;
  const hasPendingMetrics = pending.pending_metrics &&
    (pending.pending_metrics.patterns_applied > 0 ||
     pending.pending_metrics.tasks_completed > 0 ||
     pending.pending_metrics.tasks_failed > 0);

  if (!hasPendingPatterns && !hasPendingWorkflows && !hasPendingMetrics) {
    console.log('✅ 동기화할 항목이 없습니다.\n');
    return;
  }

  let patternsAdded = 0;
  let workflowsAdded = 0;
  const newPatternIds: string[] = [];

  // 1. 패턴 병합
  if (hasPendingPatterns) {
    console.log(`📝 ${pending.pending_patterns.length}개 패턴 병합 중...`);

    for (const pendingPattern of pending.pending_patterns) {
      const newId = pendingPattern.id === 'auto'
        ? getNextPatternId(brain.learned_patterns)
        : pendingPattern.id || getNextPatternId(brain.learned_patterns);

      const newPattern: Pattern = {
        id: newId,
        context: pendingPattern.context,
        status: pendingPattern.status,
        content: pendingPattern.content,
        model_used: 'claude-opus-4-5',
        learned_at: new Date().toISOString(),
        confidence: pendingPattern.confidence || 0.8,
        tags: pendingPattern.tags || [],
        related_files: pendingPattern.related_files || [],
      };

      brain.learned_patterns.push(newPattern);
      newPatternIds.push(newId);
      patternsAdded++;
      console.log(`   ✅ ${newId}: ${pendingPattern.context}`);
    }
  }

  // 2. 워크플로우 병합
  if (hasPendingWorkflows) {
    console.log(`\n📋 ${pending.pending_workflows.length}개 워크플로우 기록 중...`);

    for (const pendingWorkflow of pending.pending_workflows) {
      const newWorkflow: Workflow = {
        workflow: 'evolve',
        task: pendingWorkflow.task,
        started_at: pendingWorkflow.started_at || new Date().toISOString(),
        completed_at: new Date().toISOString(),
        status: pendingWorkflow.status,
        patterns_applied: pendingWorkflow.patterns_applied || [],
        patterns_learned: pendingWorkflow.patterns_learned?.map(id =>
          id === 'auto' ? newPatternIds.shift() || id : id
        ) || [],
        files_created: pendingWorkflow.files_created,
        files_modified: pendingWorkflow.files_modified,
      };

      // 최근 워크플로우 목록에 추가 (최대 10개 유지)
      brain.workflow_history.recent_workflows.unshift(newWorkflow);
      if (brain.workflow_history.recent_workflows.length > 10) {
        brain.workflow_history.recent_workflows.pop();
      }

      workflowsAdded++;
      console.log(`   ✅ ${pendingWorkflow.task}`);
    }
  }

  // 3. 메트릭스 업데이트
  if (hasPendingMetrics || patternsAdded > 0 || workflowsAdded > 0) {
    console.log('\n📊 메트릭스 업데이트 중...');

    // 워크플로우 히스토리 업데이트
    brain.workflow_history.total_tasks += pending.pending_metrics.tasks_completed + pending.pending_metrics.tasks_failed;
    brain.workflow_history.successful_tasks += pending.pending_metrics.tasks_completed;
    brain.workflow_history.failed_tasks += pending.pending_metrics.tasks_failed;
    brain.workflow_history.success_rate = brain.workflow_history.total_tasks > 0
      ? Math.round((brain.workflow_history.successful_tasks / brain.workflow_history.total_tasks) * 100) / 100
      : 0;
    brain.workflow_history.last_sync = new Date().toISOString();
    brain.workflow_history.model_usage['claude-opus-4-5'] =
      (brain.workflow_history.model_usage['claude-opus-4-5'] || 0) + 1;

    // 전체 메트릭스 업데이트
    brain.metrics.patterns_learned = brain.learned_patterns.length;
    brain.metrics.patterns_applied += pending.pending_metrics.patterns_applied;
    brain.metrics.evolution_cycles += 1;
    brain.metrics.confidence_average = calculateAverageConfidence(brain.learned_patterns);

    // 상태별 카운트
    brain.metrics.by_status.success_patterns = brain.learned_patterns.filter(
      p => p.status === 'SUCCESS_PATTERN'
    ).length;
    brain.metrics.by_status.failure_patterns = brain.learned_patterns.filter(
      p => p.status === 'FAILURE_PATTERN'
    ).length;

    // 태그별 카운트 재계산
    const tagCounts: Record<string, number> = {};
    for (const pattern of brain.learned_patterns) {
      for (const tag of pattern.tags) {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1;
      }
    }
    brain.metrics.by_tag = tagCounts;

    console.log(`   ✅ 패턴 수: ${brain.metrics.patterns_learned}`);
    console.log(`   ✅ 진화 사이클: ${brain.metrics.evolution_cycles}`);
    console.log(`   ✅ 평균 신뢰도: ${brain.metrics.confidence_average}`);
  }

  // 4. Brain 파일 저장
  const newBrainContent = yaml.stringify(brain, {
    lineWidth: 0,
    defaultKeyType: 'PLAIN',
    defaultStringType: 'PLAIN',
  });
  fs.writeFileSync(BRAIN_PATH, newBrainContent, 'utf-8');
  console.log('\n💾 project_brain.yaml 저장 완료');

  // 5. Pending 파일 초기화
  const emptyPending: PendingData = {
    pending_patterns: [],
    pending_workflows: [],
    pending_metrics: {
      patterns_applied: 0,
      tasks_completed: 0,
      tasks_failed: 0,
    },
    metadata: {
      last_updated: new Date().toISOString(),
      session_id: null,
      auto_sync: true,
    },
  };

  const pendingHeader = `# Pending Patterns - 자동 학습 중간 파일
#
# Claude가 작업 중 발견한 패턴을 여기에 기록합니다.
# 세션 종료 시 Hook이 이 파일을 읽어 project_brain.yaml에 병합합니다.
#
# 마지막 동기화: ${new Date().toISOString()}

`;

  fs.writeFileSync(
    PENDING_PATH,
    pendingHeader + yaml.stringify(emptyPending),
    'utf-8'
  );
  console.log('🔄 pending_patterns.yaml 초기화 완료');

  // 6. 결과 요약
  console.log('\n' + '═'.repeat(50));
  console.log('✅ Brain 동기화 완료!');
  console.log('═'.repeat(50));
  console.log(`   📝 추가된 패턴: ${patternsAdded}개`);
  console.log(`   📋 기록된 워크플로우: ${workflowsAdded}개`);
  console.log(`   🧠 총 패턴 수: ${brain.metrics.patterns_learned}개`);
  console.log(`   🔄 진화 사이클: ${brain.metrics.evolution_cycles}회`);
  console.log('');
}

// 실행
syncBrain().catch(error => {
  console.error('❌ 동기화 중 오류 발생:', error);
  process.exit(1);
});
