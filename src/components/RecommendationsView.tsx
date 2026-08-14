import React, { useMemo } from 'react';
import {
  Sparkles,
  ShieldCheck,
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Lock,
  Unlock,
  TrendingUp,
  Zap
} from 'lucide-react';
import { DataSourceItem, DetectionRule } from '../types';
import { SEED_DETECTIONS } from '../data/seedDetections';
import {
  calculateItemProjectedGbDay,
  calculateItemCurrentIndexedGbDay,
  calculateDetectionCoverage
} from '../utils/calculations';

interface RecommendationsViewProps {
  dataSources: DataSourceItem[];
  thresholdPct: number;
  onUpdateDataSource: (id: string, updates: Partial<DataSourceItem>) => void;
  onNavigateToContentExplorer: () => void;
}

export const RecommendationsView: React.FC<RecommendationsViewProps> = ({
  dataSources,
  thresholdPct,
  onUpdateDataSource,
  onNavigateToContentExplorer
}) => {
  const coverage = useMemo(() => {
    return calculateDetectionCoverage(dataSources, SEED_DETECTIONS, thresholdPct);
  }, [dataSources, thresholdPct]);

  // Identify prioritized recommendations:
  // Sources that have total_items > 0, but pct_indexed < thresholdPct (or 80% best practice)
  const recommendations = useMemo(() => {
    const lowSources = dataSources.filter((ds) => {
      const items = Number(ds.total_items) || 0;
      const pct = Number(ds.pct_indexed) || 0;
      return items > 0 && pct < 80;
    });

    return lowSources.map((ds) => {
      const projGb = calculateItemProjectedGbDay(ds);
      const indGb = calculateItemCurrentIndexedGbDay(ds);
      const gapGb = Math.max(0, projGb - indGb);

      // Count detections unlocked if this source is onboarded to 100%
      const detectionsUnlockedByThis = SEED_DETECTIONS.filter((rule) =>
        rule.required_sources.includes(ds.name)
      ).length;

      let priority: 'Critical' | 'High' | 'Medium' = 'Medium';
      if (detectionsUnlockedByThis >= 3 || Number(ds.pct_indexed) === 0) {
        priority = 'Critical';
      } else if (detectionsUnlockedByThis >= 1 || Number(ds.pct_indexed) < thresholdPct) {
        priority = 'High';
      }

      return {
        item: ds,
        projectedGb: projGb,
        indexedGb: indGb,
        gapGb,
        currentPct: Number(ds.pct_indexed) || 0,
        detectionsUnlocked: detectionsUnlockedByThis,
        priority,
      };
    }).sort((a, b) => {
      // Sort by priority (Critical > High > Medium), then detections unlocked, then gap GB
      const pWeight = { Critical: 3, High: 2, Medium: 1 };
      if (pWeight[b.priority] !== pWeight[a.priority]) {
        return pWeight[b.priority] - pWeight[a.priority];
      }
      if (b.detectionsUnlocked !== a.detectionsUnlocked) {
        return b.detectionsUnlocked - a.detectionsUnlocked;
      }
      return b.gapGb - a.gapGb;
    });
  }, [dataSources, thresholdPct]);

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-emerald-900 to-teal-950 text-white rounded-xl p-5 shadow-sm border border-emerald-800/80">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
              <Zap className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold tracking-tight text-white flex items-center gap-2">
                Prioritized Onboarding Recommendations
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-800/80 text-emerald-200 font-mono">
                  {recommendations.length} Actionable Gaps
                </span>
              </h2>
              <p className="text-xs text-emerald-200/90 mt-1 max-w-2xl">
                Data sources prioritized based on their direct impact on Enterprise Security (ES) detection coverage and MITRE ATT&CK kill-chain visibility.
              </p>
            </div>
          </div>

          {/* Detection Coverage KPI */}
          <div className="bg-emerald-950/80 border border-emerald-700/60 rounded-xl p-3.5 flex items-center gap-4">
            <div>
              <span className="text-[11px] uppercase tracking-wider text-emerald-300 font-semibold">ES Detections Ready</span>
              <div className="flex items-baseline gap-1.5 mt-0.5">
                <span className="text-2xl font-bold font-mono text-white">{coverage.unlockedCount}</span>
                <span className="text-xs text-emerald-300">/ {coverage.totalDetections} ({coverage.coveragePct}%)</span>
              </div>
            </div>
            <button
              onClick={onNavigateToContentExplorer}
              className="px-3 py-1.5 rounded-md bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1 transition"
            >
              <span>Explore Content</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>

      {/* Recommendations Cards List */}
      <div className="space-y-4">
        {recommendations.length === 0 ? (
          <div className="bg-white rounded-xl border border-zinc-200 p-12 text-center shadow-xs">
            <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
            <h3 className="text-base font-bold text-zinc-900">All Configured Sources Are Fully Onboarded!</h3>
            <p className="text-xs text-zinc-500 max-w-md mx-auto mt-1">
              Every active data source has met or exceeded the 80% best-practice indexing threshold.
            </p>
          </div>
        ) : (
          recommendations.map(({ item, projectedGb, indexedGb, gapGb, currentPct, detectionsUnlocked, priority }) => {
            const isCritical = priority === 'Critical';
            const isHigh = priority === 'High';

            return (
              <div
                key={item.id}
                className="bg-white rounded-xl border border-zinc-200 p-4 shadow-xs hover:border-zinc-300 transition flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                {/* Left info */}
                <div className="space-y-1.5 flex-1 min-w-[280px]">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-wider ${
                        isCritical
                          ? 'bg-rose-100 text-rose-800 border border-rose-200'
                          : isHigh
                          ? 'bg-amber-100 text-amber-800 border border-amber-200'
                          : 'bg-blue-100 text-blue-800 border border-blue-200'
                      }`}
                    >
                      {priority} Priority
                    </span>
                    <span className="text-xs font-semibold text-zinc-500">{item.category}</span>
                    <span className="text-xs font-bold text-zinc-900 text-sm">{item.name}</span>
                  </div>

                  <p className="text-xs text-zinc-500 leading-relaxed">
                    {item.description_examples || 'Standard log source for threat detection and compliance correlation.'}
                  </p>

                  <div className="flex items-center gap-4 text-xs text-zinc-600 pt-1">
                    <span>
                      Active count: <strong className="text-zinc-800 font-mono">{item.total_items}</strong> items
                    </span>
                    <span>
                      Gap volume: <strong className="text-emerald-700 font-mono">+{gapGb.toFixed(2)} GB/day</strong>
                    </span>
                    {detectionsUnlocked > 0 && (
                      <span className="text-emerald-700 font-semibold flex items-center gap-1">
                        <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                        Unlocks {detectionsUnlocked} ES Detections
                      </span>
                    )}
                  </div>
                </div>

                {/* Right Progress & Quick Actions */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 shrink-0">
                  <div className="text-right">
                    <div className="text-xs font-mono text-zinc-500">Current Ingest</div>
                    <div className="text-base font-bold font-mono text-zinc-900">
                      {currentPct}% <span className="text-xs text-zinc-400">({indexedGb.toFixed(1)} / {projectedGb.toFixed(1)} GB)</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      id={`btn-onboard-80-${item.id}`}
                      onClick={() => onUpdateDataSource(item.id, { pct_indexed: 80 })}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-zinc-100 hover:bg-zinc-200 text-zinc-800 border border-zinc-300 transition"
                    >
                      Target 80%
                    </button>
                    <button
                      id={`btn-onboard-100-${item.id}`}
                      onClick={() => onUpdateDataSource(item.id, { pct_indexed: 100 })}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white shadow-2xs transition flex items-center gap-1"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>100% Ingest</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
