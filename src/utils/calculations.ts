import {
  DataSourceItem,
  CategorySummary,
  CapabilityItem,
  MaturityStatus,
  MaturityStageSummary,
  MaturityGroupSummary,
  DetectionRule
} from '../types';

export const STATUS_SCORE_MAP: Record<MaturityStatus, number | null> = {
  not_needed: null, // Excluded from averages
  choose_one: 0,
  not_in_place: 0,
  just_getting_started: 0.25,
  partially_in_place: 0.5,
  almost_there: 0.75,
  fully_in_place: 1.0,
};

export const STATUS_LABEL_MAP: Record<MaturityStatus, string> = {
  not_needed: 'Not Needed (X)',
  choose_one: 'Choose One (0%)',
  not_in_place: 'Not in Place (0%)',
  just_getting_started: 'Just Getting Started (25%)',
  partially_in_place: 'Partially in Place (50%)',
  almost_there: 'Almost There (75%)',
  fully_in_place: 'Fully in Place (100%)',
};

export const STATUS_COLOR_MAP: Record<MaturityStatus, { bg: string; text: string; border: string }> = {
  not_needed: { bg: 'bg-zinc-100 text-zinc-500', text: 'text-zinc-500', border: 'border-zinc-300' },
  choose_one: { bg: 'bg-zinc-50 text-zinc-400', text: 'text-zinc-400', border: 'border-zinc-200' },
  not_in_place: { bg: 'bg-rose-50 text-rose-700', text: 'text-rose-700', border: 'border-rose-200' },
  just_getting_started: { bg: 'bg-amber-50 text-amber-700', text: 'text-amber-700', border: 'border-amber-200' },
  partially_in_place: { bg: 'bg-blue-50 text-blue-700', text: 'text-blue-700', border: 'border-blue-200' },
  almost_there: { bg: 'bg-teal-50 text-teal-700', text: 'text-teal-700', border: 'border-teal-200' },
  fully_in_place: { bg: 'bg-emerald-50 text-emerald-700', text: 'text-emerald-700', border: 'border-emerald-200' },
};

/**
 * Calculates raw projected GB/day for a single data source item
 */
export function calculateItemProjectedGbDay(item: DataSourceItem): number {
  const mbDay = (Number(item.est_log_size_mb_per_day) || 0) * (Number(item.total_items) || 0);
  return mbDay / 1024;
}

/**
 * Calculates current indexed GB/day for a single data source item
 */
export function calculateItemCurrentIndexedGbDay(item: DataSourceItem): number {
  const projected = calculateItemProjectedGbDay(item);
  const pct = Math.max(0, Math.min(100, Number(item.pct_indexed) || 0)) / 100;
  const mult = Number(item.multiplier) > 0 ? Number(item.multiplier) : 1;
  return projected * pct * mult;
}

/**
 * Aggregates all data sources by category
 */
export function calculateCategorySummaries(dataSources: DataSourceItem[]): CategorySummary[] {
  const map = new Map<string, {
    total_items: number;
    active_items: number;
    projected_gb: number;
    indexed_gb: number;
  }>();

  for (const ds of dataSources) {
    const cat = ds.category || 'Uncategorized';
    if (!map.has(cat)) {
      map.set(cat, { total_items: 0, active_items: 0, projected_gb: 0, indexed_gb: 0 });
    }
    const rec = map.get(cat)!;
    const items = Number(ds.total_items) || 0;
    rec.total_items += items;
    if (items > 0) {
      rec.active_items += 1;
    }
    const proj = calculateItemProjectedGbDay(ds);
    const ind = calculateItemCurrentIndexedGbDay(ds);
    rec.projected_gb += proj;
    rec.indexed_gb += ind;
  }

  const result: CategorySummary[] = [];
  map.forEach((val, category) => {
    const weighted_pct = val.projected_gb > 0 ? (val.indexed_gb / val.projected_gb) * 100 : 0;
    result.push({
      category,
      total_items: val.total_items,
      active_items: val.active_items,
      total_projected_gb_day: val.projected_gb,
      current_indexed_gb_day: val.indexed_gb,
      weighted_pct_indexed: Math.min(100, Math.max(0, weighted_pct)),
      is_complete: val.total_items > 0,
    });
  });

  return result;
}

/**
 * Calculates Grand Totals across all data sources
 */
export function calculateGrandTotals(dataSources: DataSourceItem[], bufferPct = 20) {
  let totalProjectedGbDay = 0;
  let currentIndexedGbDay = 0;
  let totalItemsCount = 0;
  let totalConfiguredSourcesCount = 0;
  let activeSourcesCount = 0;

  for (const ds of dataSources) {
    totalConfiguredSourcesCount += 1;
    const items = Number(ds.total_items) || 0;
    totalItemsCount += items;
    if (items > 0) {
      activeSourcesCount += 1;
    }
    totalProjectedGbDay += calculateItemProjectedGbDay(ds);
    currentIndexedGbDay += calculateItemCurrentIndexedGbDay(ds);
  }

  const bufferMultiplier = 1 + (bufferPct / 100);
  const bufferedProjectedGbDay = totalProjectedGbDay * bufferMultiplier;
  const bufferedCurrentIndexedGbDay = currentIndexedGbDay * bufferMultiplier;
  const overallPctIndexed = totalProjectedGbDay > 0
    ? (currentIndexedGbDay / totalProjectedGbDay) * 100
    : 0;

  return {
    totalProjectedGbDay,
    currentIndexedGbDay,
    bufferedProjectedGbDay,
    bufferedCurrentIndexedGbDay,
    overallPctIndexed: Math.min(100, Math.max(0, overallPctIndexed)),
    totalItemsCount,
    totalConfiguredSourcesCount,
    activeSourcesCount,
    bufferPct,
  };
}

/**
 * Bidirectional EPS calculations
 * Event Average Size (bytes) = (MaxSize * %Max) + (MinSize * %Min)
 * Events/Day = GB/day * 1024^3 / Event Average Size
 * EPS = Events/Day / 86400
 */
export function calculateAverageEventBytes(minBytes = 250, maxBytes = 750, pctMin = 0.55): number {
  const pMin = Math.max(0, Math.min(1, pctMin));
  const pMax = 1 - pMin;
  return (minBytes * pMin) + (maxBytes * pMax);
}

export function calculateEpsFromGbDay(gbDay: number, minBytes = 250, maxBytes = 750, pctMin = 0.55): number {
  if (gbDay <= 0) return 0;
  const avgBytes = calculateAverageEventBytes(minBytes, maxBytes, pctMin);
  if (avgBytes <= 0) return 0;
  const bytesPerDay = gbDay * Math.pow(1024, 3);
  const eventsPerDay = bytesPerDay / avgBytes;
  return Math.round(eventsPerDay / 86400);
}

export function calculateGbDayFromEps(eps: number, minBytes = 250, maxBytes = 750, pctMin = 0.55): number {
  if (eps <= 0) return 0;
  const avgBytes = calculateAverageEventBytes(minBytes, maxBytes, pctMin);
  const eventsPerDay = eps * 86400;
  const bytesPerDay = eventsPerDay * avgBytes;
  return bytesPerDay / Math.pow(1024, 3);
}

/**
 * Maturity calculations
 */
export function calculateMaturityRollups(capabilities: CapabilityItem[]) {
  const stageMap = new Map<string, {
    total: number;
    scored_count: number;
    score_sum: number;
    status_counts: Record<MaturityStatus, number>;
  }>();

  const groupMap = new Map<string, {
    stage: string;
    total: number;
    scored_count: number;
    score_sum: number;
  }>();

  const defaultStatusCounts = (): Record<MaturityStatus, number> => ({
    not_needed: 0,
    choose_one: 0,
    not_in_place: 0,
    just_getting_started: 0,
    partially_in_place: 0,
    almost_there: 0,
    fully_in_place: 0,
  });

  const stages = ['Ingest', 'Monitor', 'Analyze & Investigate', 'Act'] as const;
  for (const s of stages) {
    stageMap.set(s, {
      total: 0,
      scored_count: 0,
      score_sum: 0,
      status_counts: defaultStatusCounts(),
    });
  }

  let grandTotalScored = 0;
  let grandScoreSum = 0;
  let grandTotal = 0;

  for (const cap of capabilities) {
    grandTotal += 1;
    const stageRec = stageMap.get(cap.stage) || {
      total: 0,
      scored_count: 0,
      score_sum: 0,
      status_counts: defaultStatusCounts(),
    };
    stageMap.set(cap.stage, stageRec);

    stageRec.total += 1;
    stageRec.status_counts[cap.status] = (stageRec.status_counts[cap.status] || 0) + 1;

    // Group
    const groupKey = `${cap.stage}:::${cap.group}`;
    if (!groupMap.has(groupKey)) {
      groupMap.set(groupKey, {
        stage: cap.stage,
        total: 0,
        scored_count: 0,
        score_sum: 0,
      });
    }
    const groupRec = groupMap.get(groupKey)!;
    groupRec.total += 1;

    const numericScore = STATUS_SCORE_MAP[cap.status];
    if (numericScore !== null) {
      stageRec.scored_count += 1;
      stageRec.score_sum += numericScore;

      groupRec.scored_count += 1;
      groupRec.score_sum += numericScore;

      grandTotalScored += 1;
      grandScoreSum += numericScore;
    }
  }

  const stageSummaries: MaturityStageSummary[] = [];
  stageMap.forEach((data, stage) => {
    const avg = data.scored_count > 0 ? data.score_sum / data.scored_count : 0;
    stageSummaries.push({
      stage,
      total_capabilities: data.total,
      scored_capabilities: data.scored_count,
      average_score: avg,
      maturity_pct: Math.round(avg * 100),
      status_counts: data.status_counts,
    });
  });

  const groupSummaries: MaturityGroupSummary[] = [];
  groupMap.forEach((data, key) => {
    const groupName = key.split(':::')[1];
    const avg = data.scored_count > 0 ? data.score_sum / data.scored_count : 0;
    groupSummaries.push({
      group: groupName,
      stage: data.stage,
      total_capabilities: data.total,
      scored_capabilities: data.scored_count,
      average_score: avg,
      maturity_pct: Math.round(avg * 100),
    });
  });

  const overallMaturityPct = grandTotalScored > 0
    ? Math.round((grandScoreSum / grandTotalScored) * 100)
    : 0;

  return {
    stageSummaries,
    groupSummaries,
    overallMaturityPct,
    grandTotalCapabilities: grandTotal,
    grandScoredCapabilities: grandTotalScored,
  };
}

/**
 * Calculates Detection Rules coverage based on currently indexed sources (>= threshold indexed)
 */
export function calculateDetectionCoverage(
  dataSources: DataSourceItem[],
  detections: DetectionRule[],
  thresholdPct = 20
) {
  // Build a set of sources that are active and indexed above threshold
  const readySourceNames = new Set<string>();
  const activeSources = dataSources.filter(d => (Number(d.total_items) || 0) > 0);

  for (const ds of activeSources) {
    if (Number(ds.pct_indexed) >= thresholdPct) {
      readySourceNames.add(ds.name);
    }
  }

  let unlockedCount = 0;
  const detectionResults = detections.map(det => {
    const required = det.required_sources || [];
    // If at least one primary required source is indexed >= threshold, or all required
    const matchedSources = required.filter(r => readySourceNames.has(r));
    const isFullyUnlocked = required.length > 0 && matchedSources.length === required.length;
    const isPartiallyUnlocked = matchedSources.length > 0 && !isFullyUnlocked;
    if (isFullyUnlocked) {
      unlockedCount += 1;
    }
    return {
      rule: det,
      isFullyUnlocked,
      isPartiallyUnlocked,
      matchedSources,
      missingSources: required.filter(r => !readySourceNames.has(r)),
    };
  });

  const totalDetections = detections.length;
  const coveragePct = totalDetections > 0 ? Math.round((unlockedCount / totalDetections) * 100) : 0;

  return {
    unlockedCount,
    totalDetections,
    coveragePct,
    detectionResults,
  };
}
