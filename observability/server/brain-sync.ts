// Brain Integration for Observability
import * as fs from 'fs';
import * as path from 'path';
import * as yaml from 'js-yaml';
import type { BrainState, WorkflowStats } from './types';

// Use absolute path based on import.meta.url (Bun compatible)
const __dirname = path.dirname(new URL(import.meta.url).pathname);
const PROJECT_ROOT = path.resolve(__dirname, '../..');
const BRAIN_PATH = path.join(PROJECT_ROOT, '.opencode/brain/project_brain.yaml');

interface ProjectBrain {
  project_context: {
    name: string;
    version: string;
  };
  learned_patterns: Array<{
    id: string;
    context: string;
    status: string;
    content: string;
    confidence: number;
    learned_at: string;
    tags?: string[];
  }>;
  workflow_history: {
    last_sync: string;
    total_tasks: number;
    successful_tasks: number;
    failed_tasks: number;
    success_rate: number;
    model_usage: Record<string, number>;
    recent_workflows: Array<{
      workflow: string;
      task: string;
      started_at: string;
      completed_at: string;
      status: string;
      patterns_applied: string[];
      patterns_learned: string[];
    }>;
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
  };
}

export function loadBrain(): ProjectBrain | null {
  try {
    if (!fs.existsSync(BRAIN_PATH)) {
      console.warn('Brain file not found:', BRAIN_PATH);
      return null;
    }
    const content = fs.readFileSync(BRAIN_PATH, 'utf-8');
    return yaml.load(content) as ProjectBrain;
  } catch (error) {
    console.error('Failed to load brain:', error);
    return null;
  }
}

export function getBrainState(): BrainState {
  const brain = loadBrain();

  if (!brain) {
    return {
      total_patterns: 0,
      patterns_count: 0,
      success_patterns: 0,
      failure_patterns: 0,
      avg_confidence: 0,
      last_sync: 'never',
      evolution_cycles: 0,
      recent_patterns: [],
      recent_workflows: []
    };
  }

  const patterns = brain.learned_patterns || [];
  const successPatterns = patterns.filter(p => p.status === 'SUCCESS_PATTERN');
  const failurePatterns = patterns.filter(p => p.status === 'FAILURE_PATTERN');
  const avgConfidence = patterns.length > 0
    ? patterns.reduce((sum, p) => sum + (p.confidence || 0), 0) / patterns.length
    : 0;

  // Get recent patterns (last 10, sorted by learned_at desc)
  const recentPatterns = patterns
    .sort((a, b) => new Date(b.learned_at).getTime() - new Date(a.learned_at).getTime())
    .slice(0, 10)
    .map(p => ({
      id: p.id,
      context: p.context,
      status: p.status,
      content: p.content,
      confidence: p.confidence || 0,
      learned_at: p.learned_at,
      tags: p.tags || []
    }));

  // Get recent workflows
  const recentWorkflows = (brain.workflow_history?.recent_workflows || [])
    .slice(0, 5)
    .map(wf => ({
      workflow: wf.workflow,
      task: wf.task,
      started_at: wf.started_at,
      completed_at: wf.completed_at,
      status: wf.status,
      patterns_applied: wf.patterns_applied || [],
      patterns_learned: wf.patterns_learned || []
    }));

  return {
    total_patterns: patterns.length,
    patterns_count: patterns.length,
    success_patterns: successPatterns.length,
    failure_patterns: failurePatterns.length,
    avg_confidence: Math.round(avgConfidence * 100) / 100,
    last_sync: brain.workflow_history?.last_sync || 'never',
    evolution_cycles: brain.metrics?.evolution_cycles || 0,
    recent_patterns: recentPatterns,
    recent_workflows: recentWorkflows
  };
}

export function getWorkflowStats(): WorkflowStats[] {
  const brain = loadBrain();

  if (!brain || !brain.workflow_history?.recent_workflows) {
    return [];
  }

  // Aggregate by workflow name
  const statsMap = new Map<string, WorkflowStats>();

  for (const wf of brain.workflow_history.recent_workflows) {
    const name = wf.workflow;
    const existing = statsMap.get(name) || {
      workflow_name: name,
      total_runs: 0,
      success_count: 0,
      avg_duration_ms: 0,
      patterns_applied: 0,
      patterns_learned: 0
    };

    existing.total_runs++;
    if (wf.status === 'success') {
      existing.success_count++;
    }
    existing.patterns_applied += (wf.patterns_applied?.length || 0);
    existing.patterns_learned += (wf.patterns_learned?.length || 0);

    // Calculate duration if timestamps available
    if (wf.started_at && wf.completed_at) {
      const start = new Date(wf.started_at).getTime();
      const end = new Date(wf.completed_at).getTime();
      const duration = end - start;
      existing.avg_duration_ms = (existing.avg_duration_ms * (existing.total_runs - 1) + duration) / existing.total_runs;
    }

    statsMap.set(name, existing);
  }

  return Array.from(statsMap.values());
}

export function getRecentPatterns(limit: number = 10): Array<{ id: string; context: string; status: string; learned_at: string }> {
  const brain = loadBrain();

  if (!brain || !brain.learned_patterns) {
    return [];
  }

  return brain.learned_patterns
    .sort((a, b) => new Date(b.learned_at).getTime() - new Date(a.learned_at).getTime())
    .slice(0, limit)
    .map(p => ({
      id: p.id,
      context: p.context,
      status: p.status,
      learned_at: p.learned_at
    }));
}

export function updateBrainMetrics(metrics: {
  total_tasks?: number;
  successful_tasks?: number;
  evolution_cycles?: number;
}): boolean {
  try {
    const brain = loadBrain();
    if (!brain) return false;

    // Update workflow history
    if (metrics.total_tasks !== undefined) {
      brain.workflow_history.total_tasks = metrics.total_tasks;
    }
    if (metrics.successful_tasks !== undefined) {
      brain.workflow_history.successful_tasks = metrics.successful_tasks;
      brain.workflow_history.success_rate =
        brain.workflow_history.total_tasks > 0
          ? metrics.successful_tasks / brain.workflow_history.total_tasks
          : 0;
    }

    // Update metrics
    if (metrics.evolution_cycles !== undefined) {
      brain.metrics.evolution_cycles = metrics.evolution_cycles;
    }

    brain.workflow_history.last_sync = new Date().toISOString();

    // Write back
    fs.writeFileSync(BRAIN_PATH, yaml.dump(brain, { lineWidth: -1 }));
    return true;
  } catch (error) {
    console.error('Failed to update brain metrics:', error);
    return false;
  }
}

export function recordObservabilityPattern(pattern: {
  context: string;
  status: 'SUCCESS_PATTERN' | 'FAILURE_PATTERN';
  content: string;
  confidence: number;
  tags?: string[];
}): string | null {
  try {
    const brain = loadBrain();
    if (!brain) return null;

    // Generate new pattern ID
    const existingIds = brain.learned_patterns.map(p => p.id);
    const maxNum = existingIds
      .map(id => parseInt(id.replace('LP-', ''), 10))
      .filter(n => !isNaN(n))
      .reduce((max, n) => Math.max(max, n), 0);

    const newId = `LP-${String(maxNum + 1).padStart(3, '0')}`;

    const newPattern = {
      id: newId,
      context: pattern.context,
      status: pattern.status,
      content: pattern.content,
      model_used: 'observability-system',
      learned_at: new Date().toISOString(),
      confidence: pattern.confidence,
      tags: pattern.tags || ['observability', 'auto-detected']
    };

    brain.learned_patterns.push(newPattern);
    brain.metrics.patterns_learned++;
    brain.metrics.evolution_cycles++;

    if (pattern.status === 'SUCCESS_PATTERN') {
      brain.metrics.by_status.success_patterns++;
    } else {
      brain.metrics.by_status.failure_patterns++;
    }

    // Recalculate average confidence
    const confidences = brain.learned_patterns.map(p => p.confidence || 0);
    brain.metrics.confidence_average =
      Math.round((confidences.reduce((a, b) => a + b, 0) / confidences.length) * 1000) / 1000;

    fs.writeFileSync(BRAIN_PATH, yaml.dump(brain, { lineWidth: -1 }));

    return newId;
  } catch (error) {
    console.error('Failed to record pattern:', error);
    return null;
  }
}
