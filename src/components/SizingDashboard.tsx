import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  CartesianGrid
} from 'recharts';
import {
  Database,
  TrendingUp,
  Server,
  Activity,
  AlertTriangle,
  CheckCircle2,
  Sliders,
  Sparkles,
  ArrowRight,
  ShieldAlert,
  Building2,
  Edit3,
  UserCheck,
  Calendar
} from 'lucide-react';
import { DataSourceItem, Project } from '../types';
import {
  calculateGrandTotals,
  calculateCategorySummaries,
  calculateEpsFromGbDay
} from '../utils/calculations';

interface SizingDashboardProps {
  project: Project;
  onNavigateToGrid: () => void;
  onNavigateToRecommendations: () => void;
  onOpenMetadataModal?: () => void;
}

const CATEGORY_COLORS: Record<string, string> = {
  Cloud: '#0284c7',
  Server: '#0d9488',
  Storage: '#6366f1',
  Network: '#e11d48',
  Database: '#d97706',
  Application: '#8b5cf6',
  'End-User': '#10b981',
  'Testers & Developers': '#ec4899',
  'Security Systems': '#f59e0b',
  Fraud: '#ef4444',
  'OT/ICS Specific Systems': '#84cc16',
  'Business Services - Order Mgmt': '#3b82f6',
  'Business Services - Billing & Invoicing': '#14b8a6',
  'Business Services - Customer Service': '#a855f7',
  'Business Services - Procurement': '#f97316',
  'Business Services - Product Delivery': '#06b6d4',
};

export const SizingDashboard: React.FC<SizingDashboardProps> = ({
  project,
  onNavigateToGrid,
  onNavigateToRecommendations,
  onOpenMetadataModal
}) => {
  const [scenarioIncreasePct, setScenarioIncreasePct] = useState<number>(0);
  const metadata = project.metadata || {
    prepared_by_org: 'Thakral Information Systems LTD',
    customer_name: 'Client Organization',
    owner_name: 'Principal Security Architect',
    industry: 'Financial Services',
    buffer_pct: 20
  };

  const preparedByOrg = metadata.prepared_by_org || 'Thakral Information Systems LTD';
  const customerName = metadata.customer_name || 'Client Organization';

  const grandTotals = useMemo(() => {
    return calculateGrandTotals(project.data_sources, project.metadata.buffer_pct);
  }, [project.data_sources, project.metadata.buffer_pct]);

  const categorySummaries = useMemo(() => {
    return calculateCategorySummaries(project.data_sources);
  }, [project.data_sources]);

  const eps = useMemo(() => {
    return calculateEpsFromGbDay(
      grandTotals.totalProjectedGbDay,
      project.eps_config.min_bytes,
      project.eps_config.max_bytes,
      project.eps_config.pct_min
    );
  }, [grandTotals.totalProjectedGbDay, project.eps_config]);

  // Incomplete categories (0 items configured)
  const incompleteCategories = useMemo(() => {
    return categorySummaries.filter((c) => c.total_items === 0);
  }, [categorySummaries]);

  // Chart data: categories sorted by projected GB/day descending
  const chartData = useMemo(() => {
    return categorySummaries
      .filter((c) => c.total_projected_gb_day > 0)
      .sort((a, b) => b.total_projected_gb_day - a.total_projected_gb_day)
      .map((c) => ({
        name: c.category.length > 18 ? `${c.category.slice(0, 16)}...` : c.category,
        fullName: c.category,
        projected: Number(c.total_projected_gb_day.toFixed(2)),
        indexed: Number(c.current_indexed_gb_day.toFixed(2)),
        unindexed: Number(Math.max(0, c.total_projected_gb_day - c.current_indexed_gb_day).toFixed(2)),
        pctIndexed: Math.round(c.weighted_pct_indexed),
        items: c.total_items,
        color: CATEGORY_COLORS[c.category] || '#64748b',
      }));
  }, [categorySummaries]);

  // Pie chart data
  const pieData = useMemo(() => {
    const active = chartData.filter((c) => c.projected > 0);
    const total = active.reduce((acc, curr) => acc + curr.projected, 0);
    return active.map((c) => ({
      name: c.fullName,
      value: c.projected,
      pctOfTotal: total > 0 ? ((c.projected / total) * 100).toFixed(1) : '0',
      color: c.color,
    }));
  }, [chartData]);

  // Scenario Simulator calculations
  const scenarioResults = useMemo(() => {
    if (scenarioIncreasePct === 0) return null;
    let newIndexedGb = 0;
    for (const ds of project.data_sources) {
      const proj = (Number(ds.est_log_size_mb_per_day) * Number(ds.total_items)) / 1024;
      const currentPct = Number(ds.pct_indexed) || 0;
      const simPct = Math.min(100, currentPct + scenarioIncreasePct);
      const mult = Number(ds.multiplier) > 0 ? Number(ds.multiplier) : 1;
      newIndexedGb += proj * (simPct / 100) * mult;
    }
    const newOverallPct = grandTotals.totalProjectedGbDay > 0
      ? (newIndexedGb / grandTotals.totalProjectedGbDay) * 100
      : 0;
    const additionalGb = Math.max(0, newIndexedGb - grandTotals.currentIndexedGbDay);

    return {
      newIndexedGb,
      newOverallPct,
      additionalGb,
      bufferedNewIndexedGb: newIndexedGb * (1 + project.metadata.buffer_pct / 100),
    };
  }, [project.data_sources, scenarioIncreasePct, grandTotals, project.metadata.buffer_pct]);

  return (
    <div className="space-y-6">
      {/* Client Engagement & Document Scope Banner */}
      <div className="bg-gradient-to-r from-zinc-900 via-zinc-850 to-zinc-900 text-white rounded-2xl border border-zinc-800 p-5 shadow-md flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
              {preparedByOrg}
            </span>
            <span className="text-zinc-500 text-xs">&bull;</span>
            <span className="text-zinc-300 text-xs font-semibold">
              {metadata.project_name || 'Splunk Security Sizing & Data Source Assessment'}
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs">
            <div className="flex items-center gap-1.5 text-zinc-300">
              <span className="text-zinc-400">Prepared For:</span>
              <strong className="text-emerald-400 font-bold text-sm">{customerName}</strong>
              {metadata.industry && <span className="text-zinc-400">({metadata.industry})</span>}
            </div>
            {metadata.prepared_for_recipient && (
              <div className="flex items-center gap-1 text-zinc-300">
                <span className="text-zinc-500">&bull;</span>
                <span className="text-zinc-400">Attention:</span>
                <strong className="text-zinc-200">{metadata.prepared_for_recipient}</strong>
              </div>
            )}
            <div className="flex items-center gap-1 text-zinc-300">
              <span className="text-zinc-500">&bull;</span>
              <span className="text-zinc-400">Lead Architect:</span>
              <span className="text-zinc-200 font-medium">{metadata.owner_name || 'Solutions Engineering'}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {onOpenMetadataModal && (
            <button
              onClick={onOpenMetadataModal}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 transition"
              title="Edit Target Client Name, Organization, Attention, and Scope"
            >
              <Edit3 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Edit Client Details</span>
            </button>
          )}
        </div>
      </div>

      {/* Big-Number Executive KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Card 1: Total Projected */}
        <div className="bg-white rounded-xl border border-zinc-200 p-4 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase text-zinc-500 tracking-wider">Total Projected</span>
            <div className="p-2 rounded-lg bg-zinc-100 text-zinc-700">
              <Database className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-zinc-900 font-mono tracking-tight">
              {grandTotals.totalProjectedGbDay.toFixed(1)}
            </span>
            <span className="text-xs font-medium text-zinc-500 font-mono">GB / day</span>
          </div>
          <div className="mt-2 text-xs text-zinc-500 flex items-center justify-between">
            <span>Raw unbuffered volume</span>
            <span className="font-mono font-medium text-zinc-700">{(grandTotals.totalProjectedGbDay * 30 / 1024).toFixed(2)} TB/mo</span>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-zinc-400" />
        </div>

        {/* Card 2: Buffered Headroom */}
        <div className="bg-white rounded-xl border border-emerald-200 p-4 shadow-xs relative overflow-hidden bg-gradient-to-b from-white to-emerald-50/20">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase text-emerald-800 tracking-wider">
              Buffered ({project.metadata.buffer_pct}% Headroom)
            </span>
            <div className="p-2 rounded-lg bg-emerald-100 text-emerald-800">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-emerald-900 font-mono tracking-tight">
              {grandTotals.bufferedProjectedGbDay.toFixed(1)}
            </span>
            <span className="text-xs font-semibold text-emerald-700 font-mono">GB / day</span>
          </div>
          <div className="mt-2 text-xs text-emerald-700 flex items-center justify-between">
            <span>License sizing target</span>
            <span className="font-mono font-bold text-emerald-800">{(grandTotals.bufferedProjectedGbDay * 30 / 1024).toFixed(2)} TB/mo</span>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-emerald-500" />
        </div>

        {/* Card 3: Currently Indexed */}
        <div className="bg-white rounded-xl border border-zinc-200 p-4 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase text-zinc-500 tracking-wider">Currently Indexed</span>
            <div className="p-2 rounded-lg bg-blue-50 text-blue-700">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-blue-900 font-mono tracking-tight">
              {grandTotals.currentIndexedGbDay.toFixed(1)}
            </span>
            <span className="text-xs font-medium text-zinc-500 font-mono">GB / day</span>
          </div>
          <div className="mt-2 text-xs text-zinc-500 flex items-center justify-between">
            <span>Overall ingestion rate</span>
            <span className="font-mono font-bold text-blue-700">{grandTotals.overallPctIndexed.toFixed(1)}%</span>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-blue-500" />
        </div>

        {/* Card 4: Total Assets */}
        <div className="bg-white rounded-xl border border-zinc-200 p-4 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase text-zinc-500 tracking-wider">Total Assets</span>
            <div className="p-2 rounded-lg bg-purple-50 text-purple-700">
              <Server className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-purple-950 font-mono tracking-tight">
              {grandTotals.totalItemsCount.toLocaleString()}
            </span>
            <span className="text-xs font-medium text-zinc-500">items</span>
          </div>
          <div className="mt-2 text-xs text-zinc-500 flex items-center justify-between">
            <span>Active sources</span>
            <span className="font-mono font-medium text-zinc-700">
              {grandTotals.activeSourcesCount} / {grandTotals.totalConfiguredSourcesCount}
            </span>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-purple-500" />
        </div>

        {/* Card 5: Estimated EPS */}
        <div className="bg-white rounded-xl border border-zinc-200 p-4 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase text-zinc-500 tracking-wider">Est. Peak Ingest</span>
            <div className="p-2 rounded-lg bg-teal-50 text-teal-700">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-teal-900 font-mono tracking-tight">
              {eps.toLocaleString()}
            </span>
            <span className="text-xs font-medium text-teal-700 font-mono">EPS</span>
          </div>
          <div className="mt-2 text-xs text-zinc-500 flex items-center justify-between">
            <span>Daily event count</span>
            <span className="font-mono font-medium text-zinc-700">{(eps * 86400 / 1000000).toFixed(1)}M / d</span>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-teal-500" />
        </div>
      </div>

      {/* Incomplete Data Banner (if any category has 0 items) */}
      {incompleteCategories.length > 0 && (
        <div className="bg-amber-50/90 border border-amber-300/80 rounded-xl p-4 flex items-start justify-between gap-4 text-xs text-amber-900 shadow-xs">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-amber-950 text-sm">
                Incomplete Assessment Data: {incompleteCategories.length} Categories Have Zero Assets Configured
              </p>
              <p className="mt-1 text-amber-800 leading-relaxed">
                To generate an accurate Splunk sizing recommendation, enter estimated asset counts for:{' '}
                <span className="font-semibold">
                  {incompleteCategories.slice(0, 5).map((c) => c.category).join(', ')}
                  {incompleteCategories.length > 5 && ` and ${incompleteCategories.length - 5} more`}.
                </span>
              </p>
            </div>
          </div>
          <button
            onClick={onNavigateToGrid}
            className="px-3 py-1.5 rounded-md bg-amber-600 hover:bg-amber-700 text-white font-medium shrink-0 flex items-center gap-1.5 transition"
          >
            <span>Fill Missing Sources</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart 1: Category Volume Breakdown (Stacked Bar) */}
        <div className="bg-white rounded-xl border border-zinc-200 p-5 shadow-xs lg:col-span-2 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-zinc-900 text-sm">Projected Ingest Volume by Category (GB/day)</h3>
                <p className="text-xs text-zinc-500 mt-0.5">
                  Comparison between Indexed Volume vs. Unindexed Gap across active categories
                </p>
              </div>
            </div>

            <div className="h-72 mt-4">
              {chartData.length === 0 ? (
                <div className="h-full flex items-center justify-center text-zinc-400 text-xs">
                  No active data sources with item counts yet.
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 40 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis
                      dataKey="name"
                      angle={-30}
                      textAnchor="end"
                      interval={0}
                      tick={{ fontSize: 11, fill: '#64748b' }}
                    />
                    <YAxis tick={{ fontSize: 11, fill: '#64748b' }} unit=" GB" />
                    <Tooltip
                      formatter={(value: any, name: any) => [
                        `${Number(value).toFixed(2)} GB/day`,
                        name === 'indexed' ? 'Currently Indexed' : 'Unindexed Gap',
                      ]}
                      labelFormatter={(label: any) => `Category: ${label}`}
                      contentStyle={{ backgroundColor: '#18181b', color: '#f4f4f5', borderRadius: '8px', fontSize: '12px', border: 'none' }}
                    />
                    <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                    <Bar dataKey="indexed" name="Currently Indexed" stackId="a" fill="#10b981" radius={[0, 0, 0, 0]} />
                    <Bar dataKey="unindexed" name="Unindexed Gap" stackId="a" fill="#cbd5e1" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          <div className="mt-2 pt-3 border-t border-zinc-100 flex items-center justify-between text-xs text-zinc-500">
            <span>Showing top {chartData.length} contributing categories</span>
            <button
              onClick={onNavigateToRecommendations}
              className="text-emerald-700 font-semibold hover:underline flex items-center gap-1"
            >
              View Onboarding Recommendations <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Chart 2: Category Share Distribution (Pie / Donut) */}
        <div className="bg-white rounded-xl border border-zinc-200 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-zinc-900 text-sm">Volume Share by Category</h3>
            <p className="text-xs text-zinc-500 mt-0.5">Proportional share of total projected environment data</p>

            <div className="h-56 mt-2 relative">
              {pieData.length === 0 ? (
                <div className="h-full flex items-center justify-center text-zinc-400 text-xs">
                  No data to display.
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(val: any, name: any, item: any) => [
                        `${Number(val).toFixed(2)} GB/day (${item.payload.pctOfTotal}%)`,
                        item.payload.name,
                      ]}
                      contentStyle={{ backgroundColor: '#18181b', color: '#f4f4f5', borderRadius: '8px', fontSize: '12px' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Mini legend list */}
          <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1 text-xs border-t border-zinc-100 pt-3">
            {pieData.slice(0, 6).map((item) => (
              <div key={item.name} className="flex items-center justify-between text-zinc-600">
                <div className="flex items-center gap-1.5 truncate max-w-[170px]">
                  <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                  <span className="truncate">{item.name}</span>
                </div>
                <span className="font-mono font-medium text-zinc-800">{item.pctOfTotal}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* What-If Scenario Simulator */}
      <div className="bg-gradient-to-r from-zinc-900 to-zinc-950 rounded-xl p-5 text-white shadow-md border border-zinc-800">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                What-If Onboarding Simulator
                <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800 font-mono">
                  Interactive
                </span>
              </h3>
              <p className="text-xs text-zinc-400 mt-0.5">
                Simulate the impact of expanding data source onboarding by an additional percentage across the environment.
              </p>
            </div>
          </div>

          {/* Slider Control */}
          <div className="flex items-center gap-3 bg-zinc-800/80 px-4 py-2 rounded-lg border border-zinc-700">
            <span className="text-xs text-zinc-400">Onboarding Boost:</span>
            <input
              type="range"
              min="0"
              max="100"
              step="5"
              value={scenarioIncreasePct}
              onChange={(e) => setScenarioIncreasePct(parseInt(e.target.value, 10))}
              className="w-36 accent-emerald-500 cursor-pointer"
            />
            <span className="font-mono font-bold text-emerald-400 text-sm min-w-[45px] text-right">
              +{scenarioIncreasePct}%
            </span>
          </div>
        </div>

        {scenarioIncreasePct > 0 && scenarioResults && (
          <div className="mt-4 pt-4 border-t border-zinc-800 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-zinc-800/60 rounded-lg p-3 border border-zinc-700/60">
              <span className="text-[11px] text-zinc-400 uppercase tracking-wider font-semibold">Simulated Ingest</span>
              <div className="mt-1 flex items-baseline gap-2">
                <span className="text-xl font-bold text-emerald-400 font-mono">
                  {scenarioResults.newIndexedGb.toFixed(1)}
                </span>
                <span className="text-xs text-zinc-400">GB / day</span>
              </div>
              <p className="text-[11px] text-zinc-400 mt-0.5">
                (+{scenarioResults.additionalGb.toFixed(1)} GB/d increase)
              </p>
            </div>

            <div className="bg-zinc-800/60 rounded-lg p-3 border border-zinc-700/60">
              <span className="text-[11px] text-zinc-400 uppercase tracking-wider font-semibold">Simulated Completeness</span>
              <div className="mt-1 flex items-baseline gap-2">
                <span className="text-xl font-bold text-blue-400 font-mono">
                  {scenarioResults.newOverallPct.toFixed(1)}%
                </span>
                <span className="text-xs text-zinc-400">of total environment</span>
              </div>
              <p className="text-[11px] text-zinc-400 mt-0.5">
                Up from baseline {grandTotals.overallPctIndexed.toFixed(1)}%
              </p>
            </div>

            <div className="bg-zinc-800/60 rounded-lg p-3 border border-zinc-700/60">
              <span className="text-[11px] text-zinc-400 uppercase tracking-wider font-semibold">Buffered License Target</span>
              <div className="mt-1 flex items-baseline gap-2">
                <span className="text-xl font-bold text-teal-300 font-mono">
                  {scenarioResults.bufferedNewIndexedGb.toFixed(1)}
                </span>
                <span className="text-xs text-zinc-400">GB / day</span>
              </div>
              <p className="text-[11px] text-zinc-400 mt-0.5">
                With {project.metadata.buffer_pct}% headroom
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Category Rollup Table */}
      <div className="bg-white rounded-xl border border-zinc-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-zinc-200 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-zinc-900 text-sm">Category Ingest Rollups</h3>
            <p className="text-xs text-zinc-500">Summary aggregates across all 16 data categories</p>
          </div>
          <button
            onClick={onNavigateToGrid}
            className="text-xs font-semibold text-emerald-700 hover:underline flex items-center gap-1"
          >
            Open Spreadsheet View <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-zinc-50 text-zinc-600 font-semibold border-b border-zinc-200">
              <tr>
                <th className="py-2.5 px-4">Category</th>
                <th className="py-2.5 px-4 text-right">Total Assets</th>
                <th className="py-2.5 px-4 text-right">Active Sources</th>
                <th className="py-2.5 px-4 text-right">Projected (GB/day)</th>
                <th className="py-2.5 px-4 text-right">Indexed (GB/day)</th>
                <th className="py-2.5 px-4 text-right">% Indexed</th>
                <th className="py-2.5 px-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {categorySummaries.map((cat) => (
                <tr key={cat.category} className="hover:bg-zinc-50/80 transition">
                  <td className="py-2.5 px-4 font-semibold text-zinc-800">{cat.category}</td>
                  <td className="py-2.5 px-4 text-right font-mono text-zinc-700">{cat.total_items.toLocaleString()}</td>
                  <td className="py-2.5 px-4 text-right font-mono text-zinc-600">{cat.active_items}</td>
                  <td className="py-2.5 px-4 text-right font-mono font-medium text-zinc-900">
                    {cat.total_projected_gb_day.toFixed(2)}
                  </td>
                  <td className="py-2.5 px-4 text-right font-mono font-bold text-emerald-700">
                    {cat.current_indexed_gb_day.toFixed(2)}
                  </td>
                  <td className="py-2.5 px-4 text-right font-mono font-bold">
                    <span
                      className={`px-2 py-0.5 rounded text-[11px] ${
                        cat.weighted_pct_indexed >= 80
                          ? 'bg-emerald-100 text-emerald-800'
                          : cat.weighted_pct_indexed >= 20
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-zinc-100 text-zinc-600'
                      }`}
                    >
                      {cat.weighted_pct_indexed.toFixed(1)}%
                    </span>
                  </td>
                  <td className="py-2.5 px-4 text-center">
                    {cat.total_items === 0 ? (
                      <span className="text-[10px] px-2 py-0.5 rounded bg-zinc-100 text-zinc-500 font-medium">
                        Unconfigured
                      </span>
                    ) : cat.weighted_pct_indexed >= 80 ? (
                      <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-semibold border border-emerald-200">
                        Healthy
                      </span>
                    ) : (
                      <span className="text-[10px] px-2 py-0.5 rounded bg-amber-50 text-amber-700 font-semibold border border-amber-200">
                        Gap Identified
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
