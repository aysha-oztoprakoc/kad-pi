/**
 * Sofia v3 Canonical Knowledge Adapter & Dashboard View-Models
 *
 * Provides pure projection-to-view-model transforms for Sofia v3.
 *
 * Invariants:
 * 1. Zero canonical mutation authority.
 * 2. Complete provenance retention.
 * 3. Pure deterministic transformations independent of DOM/rendering libraries.
 * 4. Explicit graceful degradation on missing or malformed inputs.
 */

export const SOFIA_ADAPTER_SCHEMA = 'kad-sofia-adapter-v1';

export function parseSofiaRecord(record) {
  if (!record || !record.kad_id || !record.canonical_hash) {
    throw new Error('Malformed Sofia knowledge record: missing kad_id or canonical_hash');
  }
  return {
    id: record.kad_id,
    title: record.title || record.kad_id,
    path: record.canonical_path,
    hash: record.canonical_hash,
    revision: record.vault_revision,
    authority: record.authority || 'UNKNOWN',
    epistemic_class: record.epistemic_class || 'UNKNOWN',
    temporal_status: record.temporal_status || 'CURRENT',
    review_status: record.review_status || 'UNKNOWN',
    context_eligible: Boolean(record.context_eligible),
    excerpt: record.body_excerpt || ''
  };
}

export function createSofiaKnowledgeFeed(projection) {
  if (!projection || projection.schema !== 'kad-sofia-projection-v1') {
    throw new Error('Invalid Sofia projection schema');
  }

  const parsedRecords = (projection.records || []).map(parseSofiaRecord);
  const byId = new Map(parsedRecords.map(r => [r.id, r]));

  return {
    schema_version: SOFIA_ADAPTER_SCHEMA,
    source_vault_revision: projection.source_vault_revision,
    generated_at: projection.generated_at,
    total_records: parsedRecords.length,
    current_records: parsedRecords.filter(r => r.temporal_status === 'CURRENT'),
    historical_records: parsedRecords.filter(r => r.temporal_status === 'HISTORICAL' || r.temporal_status === 'SUPERSEDED'),
    getRecord(id) {
      return byId.get(id) || null;
    },
    listCurrent() {
      return parsedRecords.filter(r => r.temporal_status === 'CURRENT');
    }
  };
}

export function summarizeProjects(projection) {
  const list = projection && Array.isArray(projection.projects) ? projection.projects : [];
  const byClassification = {
    CORE: 0,
    ACTIVE_SUPPORTING: 0,
    EXPERIMENTAL: 0,
    REFERENCE: 0,
    LEGACY: 0,
    ARCHIVED: 0,
    UNRELATED: 0,
    UNKNOWN: 0
  };
  const byStatus = {};
  let activeCount = 0;

  for (const p of list) {
    const classification = p.role || p.classification || 'UNKNOWN';
    byClassification[classification] = (byClassification[classification] ?? 0) + 1;

    const status = p.status || 'UNKNOWN';
    byStatus[status] = (byStatus[status] ?? 0) + 1;
    if (status === 'ACTIVE') activeCount++;
  }

  return {
    total: list.length,
    byClassification,
    byStatus,
    activeCount,
    projects: list
  };
}

export function summarizeWorkpackages(projection) {
  const list = projection && Array.isArray(projection.workpackages) ? projection.workpackages : [];
  const byStatus = {
    PROPOSED: 0,
    READY: 0,
    CLAIMED: 0,
    IN_PROGRESS: 0,
    REVIEW: 0,
    ACCEPTED: 0,
    REJECTED: 0,
    SUPERSEDED: 0
  };

  for (const wp of list) {
    const status = wp.status || 'PROPOSED';
    byStatus[status] = (byStatus[status] ?? 0) + 1;
  }

  const accepted = byStatus.ACCEPTED || 0;
  const completionRate = list.length > 0 ? Math.round((accepted / list.length) * 100) : 0;

  return {
    total: list.length,
    byStatus,
    acceptedCount: accepted,
    inProgressCount: (byStatus.IN_PROGRESS || 0) + (byStatus.CLAIMED || 0),
    reviewCount: byStatus.REVIEW || 0,
    completionRate,
    workpackages: list
  };
}

export function summarizeResearchCorpus(projection) {
  const corpus = projection && Array.isArray(projection.corpus) ? projection.corpus : [];
  let verifiedCount = 0;
  const yearSet = new Set();

  for (const paper of corpus) {
    if (paper.epistemic_verification === 'SOURCE_FACT_VERIFIED' || paper.epistemic_verification === 'VERIFIED') {
      verifiedCount++;
    }
    if (paper.year && typeof paper.year === 'number') {
      yearSet.add(paper.year);
    }
  }

  return {
    totalPapers: corpus.length,
    verifiedCount,
    years: [...yearSet].sort((a, b) => a - b),
    papers: corpus
  };
}

export function summarizeTechnologyRegistry(projection) {
  const technologies = projection && Array.isArray(projection.technologies) ? projection.technologies : [];
  const byDecision = {
    KEEP: 0,
    AUGMENT: 0,
    ADOPT: 0,
    EXPERIMENTAL: 0,
    RETIRE: 0
  };

  for (const tech of technologies) {
    const decision = tech.decision || 'KEEP';
    byDecision[decision] = (byDecision[decision] ?? 0) + 1;
  }

  return {
    total: technologies.length,
    byDecision,
    technologies
  };
}

export function buildWorkpackageStatusChartOptions(wpProjection) {
  const summary = summarizeWorkpackages(wpProjection);
  const data = Object.entries(summary.byStatus)
    .filter(([_, count]) => count > 0)
    .map(([status, count]) => ({
      name: status,
      value: count,
      itemStyle: {
        color: status === 'ACCEPTED' ? '#4ade80' :
               status === 'REVIEW' ? '#a78bfa' :
               status === 'IN_PROGRESS' ? '#00e5ff' :
               status === 'READY' ? '#ffd700' :
               status === 'SUPERSEDED' ? '#5a657b' : '#ff003c'
      }
    }));

  return {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'item',
      backgroundColor: '#0a0d12',
      borderColor: 'rgba(255, 255, 255, 0.15)',
      textStyle: { color: '#f0ede6', fontFamily: 'monospace' }
    },
    legend: {
      orient: 'horizontal',
      bottom: '0%',
      textStyle: { color: '#8b9bb4', fontSize: 11, fontFamily: 'monospace' }
    },
    series: [
      {
        name: 'Workpackages',
        type: 'pie',
        radius: ['45%', '70%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 4,
          borderColor: '#05070a',
          borderWidth: 2
        },
        label: {
          show: false,
          position: 'center'
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 14,
            fontWeight: 'bold',
            color: '#f0ede6'
          }
        },
        data: data.length ? data : [{ name: 'None', value: 0 }]
      }
    ]
  };
}

export function buildProjectClassificationChartOptions(projectsProjection) {
  const summary = summarizeProjects(projectsProjection);
  const categories = Object.keys(summary.byClassification).filter(k => summary.byClassification[k] > 0);
  const values = categories.map(k => summary.byClassification[k]);

  return {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'axis',
      backgroundColor: '#0a0d12',
      borderColor: 'rgba(255, 255, 255, 0.15)',
      textStyle: { color: '#f0ede6', fontFamily: 'monospace' }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '10%',
      top: '10%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: categories,
      axisLabel: { color: '#8b9bb4', fontSize: 10, fontFamily: 'monospace' },
      axisLine: { lineStyle: { color: 'rgba(255, 255, 255, 0.15)' } }
    },
    yAxis: {
      type: 'value',
      minInterval: 1,
      axisLabel: { color: '#8b9bb4', fontSize: 10, fontFamily: 'monospace' },
      splitLine: { lineStyle: { color: 'rgba(255, 255, 255, 0.05)' } }
    },
    series: [
      {
        name: 'Projects',
        type: 'bar',
        barWidth: '40%',
        data: values,
        itemStyle: {
          color: '#00e5ff',
          borderRadius: [4, 4, 0, 0]
        }
      }
    ]
  };
}

export function createDegradedDashboardState({ graphError = null, runtimeError = null, generalError = null } = {}) {
  const hasErrors = Boolean(graphError || runtimeError || generalError);
  return {
    status: hasErrors ? 'DEGRADED' : 'HEALTHY',
    graph: {
      available: !graphError,
      error: graphError
    },
    runtime: {
      available: !runtimeError,
      error: runtimeError
    },
    general: {
      error: generalError
    }
  };
}
