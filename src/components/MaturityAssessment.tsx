import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Legend
} from 'recharts';
import {
  ShieldCheck,
  CheckCircle2,
  Clock,
  Calendar,
  AlertCircle,
  HelpCircle,
  Sparkles,
  Layers,
  ChevronRight,
  Filter,
  Check
} from 'lucide-react';
import { CapabilityItem, MaturityStatus, UrgencyLevel } from '../types';
import {
  STATUS_SCORE_MAP,
  STATUS_LABEL_MAP,
  STATUS_COLOR_MAP,
  calculateMaturityRollups
} from '../utils/calculations';

interface MaturityAssessmentProps {
  capabilities: CapabilityItem[];
  onUpdateCapability: (id: string, updates: Partial<CapabilityItem>) => void;
  onBulkUpdateStage: (stage: string, status: MaturityStatus) => void;
}

const STAGES = ['Ingest', 'Monitor', 'Analyze & Investigate', 'Act'] as const;

const URGENCY_LABELS: Record<UrgencyLevel, { label: string; time: string; color: string; border: string }> = {
  1: { label: 'Immediate', time: '< 3 Months', color: 'bg-rose-50 text-rose-700', border: 'border-rose-300' },
  2: { label: 'Phase 1', time: '< 9 Months', color: 'bg-amber-50 text-amber-700', border: 'border-amber-300' },
  3: { label: 'Phase 2', time: '< 18 Months', color: 'bg-blue-50 text-blue-700', border: 'border-blue-300' },
  4: { label: 'Phase 3', time: '< 27 Months', color: 'bg-purple-50 text-purple-700', border: 'border-purple-300' },
};

export const MaturityAssessment: React.FC<MaturityAssessmentProps> = ({
  capabilities,
  onUpdateCapability,
  onBulkUpdateStage
}) => {
  const [activeStageTab, setActiveStageTab] = useState<'ALL' | typeof STAGES[number]>('Ingest');
  const [activeView, setActiveView] = useState<'assessment' | 'roadmap' | 'scorecard'>('assessment');
  const [searchQuery, setSearchQuery] = useState('');
  const [urgencyFilter, setUrgencyFilter] = useState<string>('ALL');

  const maturityRollups = useMemo(() => {
    return calculateMaturityRollups(capabilities);
  }, [capabilities]);

  // Radar chart data
  const radarData = useMemo(() => {
    return maturityRollups.stageSummaries.map((s) => ({
      subject: s.stage,
      maturity: s.maturity_pct,
      fullMark: 100,
    }));
  }, [maturityRollups]);

  // Stacked distribution data for bar chart
  const distributionData = useMemo(() => {
    return maturityRollups.stageSummaries.map((s) => ({
      stage: s.stage,
      'Fully in Place': s.status_counts.fully_in_place,
      'Almost There': s.status_counts.almost_there,
      'Partially in Place': s.status_counts.partially_in_place,
      'Just Getting Started': s.status_counts.just_getting_started,
      'Not in Place': s.status_counts.not_in_place,
      'Not Needed': s.status_counts.not_needed,
    }));
  }, [maturityRollups]);

  // Filter capabilities
  const filteredCapabilities = useMemo(() => {
    return capabilities.filter((cap) => {
      if (activeStageTab !== 'ALL' && cap.stage !== activeStageTab) {
        return false;
      }
      if (urgencyFilter !== 'ALL' && String(cap.urgency_level) !== urgencyFilter) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const mCap = cap.capability.toLowerCase().includes(q);
        const mGrp = cap.group.toLowerCase().includes(q);
        const mDesc = cap.description.toLowerCase().includes(q);
        if (!mCap && !mGrp && !mDesc) return false;
      }
      return true;
    });
  }, [capabilities, activeStageTab, urgencyFilter, searchQuery]);

  // Group capabilities by group name
  const groupedCapabilities = useMemo(() => {
    const map = new Map<string, CapabilityItem[]>();
    for (const cap of filteredCapabilities) {
      const key = `${cap.stage} > ${cap.group}`;
      if (!map.has(key)) {
        map.set(key, []);
      }
      map.get(key)!.push(cap);
    }
    return Array.from(map.entries());
  }, [filteredCapabilities]);

  // Roadmap buckets
  const roadmapBuckets = useMemo(() => {
    const buckets: Record<UrgencyLevel, CapabilityItem[]> = { 1: [], 2: [], 3: [], 4: [] };
    capabilities.forEach((c) => {
      if (c.status !== 'not_needed' && c.status !== 'fully_in_place') {
        buckets[c.urgency_level]?.push(c);
      }
    });
    return buckets;
  }, [capabilities]);

  return (
    <div className="space-y-6">
      {/* Top Banner & View Switcher */}
      <div className="bg-white rounded-xl border border-zinc-200 p-4 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-zinc-900 tracking-tight">
              Security Operations Maturity (PVP Framework)
            </h2>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 font-bold font-mono">
              Overall: {maturityRollups.overallMaturityPct}% Maturity
            </span>
          </div>
          <p className="text-xs text-zinc-500 mt-1">
            5-stage security lifecycle assessment mapping capabilities across Ingest, Normalize/Enrich, Monitor, Investigate, and Orchestrate/Act.
          </p>
        </div>

        {/* View Switcher Buttons */}
        <div className="flex items-center gap-1 bg-zinc-100 p-1 rounded-lg border border-zinc-200 text-xs">
          <button
            id="tab-maturity-assessment"
            onClick={() => setActiveView('assessment')}
            className={`px-3 py-1.5 rounded-md font-medium transition ${
              activeView === 'assessment' ? 'bg-white text-zinc-900 shadow-xs' : 'text-zinc-600 hover:text-zinc-900'
            }`}
          >
            Assessment Wizard
          </button>
          <button
            id="tab-maturity-scorecard"
            onClick={() => setActiveView('scorecard')}
            className={`px-3 py-1.5 rounded-md font-medium transition ${
              activeView === 'scorecard' ? 'bg-white text-zinc-900 shadow-xs' : 'text-zinc-600 hover:text-zinc-900'
            }`}
          >
            Radar & Scorecard
          </button>
          <button
            id="tab-maturity-roadmap"
            onClick={() => setActiveView('roadmap')}
            className={`px-3 py-1.5 rounded-md font-medium transition ${
              activeView === 'roadmap' ? 'bg-white text-zinc-900 shadow-xs' : 'text-zinc-600 hover:text-zinc-900'
            }`}
          >
            Strategic Roadmap
          </button>
        </div>
      </div>

      {/* Stage Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {maturityRollups.stageSummaries.map((stage) => {
          const isSelected = activeStageTab === stage.stage && activeView === 'assessment';
          return (
            <button
              key={stage.stage}
              id={`stage-card-${stage.stage.toLowerCase().replace(/[^a-z0-9]/g, '-')}`}
              onClick={() => {
                setActiveStageTab(stage.stage as any);
                if (activeView !== 'assessment') setActiveView('assessment');
              }}
              className={`text-left rounded-xl p-4 border transition cursor-pointer shadow-xs ${
                isSelected
                  ? 'bg-emerald-50/60 border-emerald-500 ring-2 ring-emerald-500/20'
                  : 'bg-white border-zinc-200 hover:border-zinc-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-zinc-800 tracking-tight">{stage.stage}</span>
                <span className="font-mono font-bold text-sm text-emerald-800 bg-emerald-100/80 px-2 py-0.5 rounded">
                  {stage.maturity_pct}%
                </span>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-zinc-100 rounded-full h-2 mt-3 overflow-hidden">
                <div
                  className="bg-emerald-500 h-full rounded-full transition-all duration-300"
                  style={{ width: `${stage.maturity_pct}%` }}
                />
              </div>

              <div className="mt-2.5 flex items-center justify-between text-[11px] text-zinc-500">
                <span>{stage.total_capabilities} capabilities</span>
                <span>{stage.status_counts.fully_in_place} completed</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* VIEW 1: Assessment Wizard */}
      {activeView === 'assessment' && (
        <div className="space-y-4">
          {/* Subheader & Stage Filters */}
          <div className="bg-white rounded-lg border border-zinc-200 p-3 shadow-xs flex flex-wrap items-center justify-between gap-3">
            {/* Stage Tabs */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <button
                onClick={() => setActiveStageTab('ALL')}
                className={`px-3 py-1 rounded-md text-xs font-medium transition ${
                  activeStageTab === 'ALL'
                    ? 'bg-zinc-900 text-white'
                    : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
                }`}
              >
                All Stages ({capabilities.length})
              </button>
              {STAGES.map((s) => (
                <button
                  key={s}
                  onClick={() => setActiveStageTab(s)}
                  className={`px-3 py-1 rounded-md text-xs font-medium transition ${
                    activeStageTab === s
                      ? 'bg-emerald-600 text-white'
                      : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>

            {/* Quick bulk stage action */}
            {activeStageTab !== 'ALL' && (
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-zinc-400">Bulk set {activeStageTab}:</span>
                <button
                  onClick={() => onBulkUpdateStage(activeStageTab, 'partially_in_place')}
                  className="px-2 py-0.5 rounded text-[11px] bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200"
                >
                  Set 50%
                </button>
                <button
                  onClick={() => onBulkUpdateStage(activeStageTab, 'fully_in_place')}
                  className="px-2 py-0.5 rounded text-[11px] bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200"
                >
                  Set 100%
                </button>
              </div>
            )}
          </div>

          {/* Capabilities Group List */}
          <div className="space-y-4">
            {groupedCapabilities.map(([groupKey, caps]) => (
              <div key={groupKey} className="bg-white rounded-xl border border-zinc-200 shadow-xs overflow-hidden">
                <div className="bg-zinc-50/80 px-4 py-2.5 border-b border-zinc-200 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Layers className="w-4 h-4 text-zinc-500" />
                    <h3 className="font-bold text-zinc-900 text-xs tracking-tight">{groupKey}</h3>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-zinc-200 text-zinc-700 font-mono">
                      {caps.length} items
                    </span>
                  </div>
                </div>

                <div className="divide-y divide-zinc-100">
                  {caps.map((cap) => {
                    const score = STATUS_SCORE_MAP[cap.status];
                    const isNotNeeded = cap.status === 'not_needed';

                    return (
                      <div
                        key={cap.id}
                        className={`p-4 transition hover:bg-zinc-50/60 ${
                          isNotNeeded ? 'opacity-50 bg-zinc-50/30' : ''
                        }`}
                      >
                        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                          {/* Capability Info */}
                          <div className="flex-1 min-w-[280px]">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-semibold text-zinc-900 text-xs">{cap.capability}</span>
                              {/* Urgency Selector */}
                              <select
                                value={cap.urgency_level}
                                onChange={(e) =>
                                  onUpdateCapability(cap.id, {
                                    urgency_level: parseInt(e.target.value, 10) as UrgencyLevel,
                                  })
                                }
                                className={`text-[10px] px-2 py-0.5 rounded border font-medium focus:outline-none ${
                                  URGENCY_LABELS[cap.urgency_level].color
                                } ${URGENCY_LABELS[cap.urgency_level].border}`}
                              >
                                <option value={1}>Immediate (&lt; 3mo)</option>
                                <option value={2}>Phase 1 (&lt; 9mo)</option>
                                <option value={3}>Phase 2 (&lt; 18mo)</option>
                                <option value={4}>Phase 3 (&lt; 27mo)</option>
                              </select>
                            </div>
                            <p className="text-xs text-zinc-500 mt-1 leading-relaxed">{cap.description}</p>
                          </div>

                          {/* Status Picker (Segmented or Select) */}
                          <div className="flex items-center gap-2 shrink-0">
                            <select
                              id={`cap-status-${cap.id}`}
                              value={cap.status}
                              onChange={(e) =>
                                onUpdateCapability(cap.id, {
                                  status: e.target.value as MaturityStatus,
                                })
                              }
                              className={`text-xs font-semibold px-3 py-1.5 rounded-lg border focus:outline-none focus:ring-1 focus:ring-emerald-500 shadow-2xs ${
                                STATUS_COLOR_MAP[cap.status].bg
                              } ${STATUS_COLOR_MAP[cap.status].border}`}
                            >
                              <option value="choose_one">Choose Status (0%)</option>
                              <option value="not_in_place">Not in Place (0%)</option>
                              <option value="just_getting_started">Just Getting Started (25%)</option>
                              <option value="partially_in_place">Partially in Place (50%)</option>
                              <option value="almost_there">Almost There (75%)</option>
                              <option value="fully_in_place">Fully in Place (100%)</option>
                              <option value="not_needed">Not Needed (Excluded X)</option>
                            </select>
                          </div>
                        </div>

                        {/* Notes input */}
                        <div className="mt-2.5 pt-2 border-t border-zinc-100 flex items-center gap-2">
                          <span className="text-[10px] uppercase font-semibold text-zinc-400">Notes:</span>
                          <input
                            type="text"
                            placeholder="Add implementation notes, tool name, or constraints..."
                            value={cap.notes || ''}
                            onChange={(e) => onUpdateCapability(cap.id, { notes: e.target.value })}
                            className="text-xs text-zinc-600 bg-transparent hover:bg-zinc-100/50 focus:bg-white px-2 py-0.5 rounded border border-transparent focus:border-zinc-300 w-full focus:outline-none"
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* VIEW 2: Radar Chart & Stage Scorecard */}
      {activeView === 'scorecard' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Radar Chart */}
          <div className="bg-white rounded-xl border border-zinc-200 p-5 shadow-xs flex flex-col justify-between">
            <div>
              <h3 className="font-bold text-zinc-900 text-sm">Security Maturity Spider/Radar Diagram</h3>
              <p className="text-xs text-zinc-500 mt-0.5">
                Multi-axis posture rating across Ingest, Monitor, Analyze/Investigate, and Act lifecycle stages
              </p>

              <div className="h-80 mt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="75%" data={radarData}>
                    <PolarGrid stroke="#e2e8f0" />
                    <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11, fill: '#334155', fontWeight: 600 }} />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 10, fill: '#94a3b8' }} />
                    <Radar
                      name="Maturity %"
                      dataKey="maturity"
                      stroke="#059669"
                      fill="#10b981"
                      fillOpacity={0.45}
                    />
                    <Tooltip
                      formatter={(val: any) => [`${val}% Maturity`, 'Current Score']}
                      contentStyle={{ backgroundColor: '#18181b', color: '#f4f4f5', borderRadius: '8px', fontSize: '12px' }}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-zinc-100 flex items-center justify-between text-xs text-zinc-500">
              <span>Overall Average: <strong className="text-emerald-700">{maturityRollups.overallMaturityPct}%</strong></span>
              <span>Scored: {maturityRollups.grandScoredCapabilities} / {maturityRollups.grandTotalCapabilities}</span>
            </div>
          </div>

          {/* Stacked Status Distribution Chart */}
          <div className="bg-white rounded-xl border border-zinc-200 p-5 shadow-xs flex flex-col justify-between">
            <div>
              <h3 className="font-bold text-zinc-900 text-sm">Status Distribution per Stage</h3>
              <p className="text-xs text-zinc-500 mt-0.5">
                Count of capabilities in each implementation readiness bucket
              </p>

              <div className="h-80 mt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={distributionData} layout="vertical" margin={{ top: 10, right: 10, left: 30, bottom: 20 }}>
                    <XAxis type="number" tick={{ fontSize: 11, fill: '#64748b' }} />
                    <YAxis type="category" dataKey="stage" tick={{ fontSize: 11, fill: '#334155', fontWeight: 600 }} width={80} />
                    <Tooltip contentStyle={{ backgroundColor: '#18181b', color: '#f4f4f5', borderRadius: '8px', fontSize: '12px' }} />
                    <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                    <Bar dataKey="Fully in Place" stackId="a" fill="#10b981" />
                    <Bar dataKey="Almost There" stackId="a" fill="#14b8a6" />
                    <Bar dataKey="Partially in Place" stackId="a" fill="#3b82f6" />
                    <Bar dataKey="Just Getting Started" stackId="a" fill="#f59e0b" />
                    <Bar dataKey="Not in Place" stackId="a" fill="#ef4444" />
                    <Bar dataKey="Not Needed" stackId="a" fill="#cbd5e1" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-zinc-100 text-xs text-zinc-500 flex items-center justify-between">
              <span>Goal: Expand Fully in Place (green) tier</span>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 3: Strategic Implementation Roadmap */}
      {activeView === 'roadmap' && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-zinc-200 p-4 shadow-xs">
            <h3 className="font-bold text-zinc-900 text-sm">Security Capability Remediation Roadmap</h3>
            <p className="text-xs text-zinc-500 mt-1">
              Gaps and partial capabilities organized by Urgency Level to guide client SOC modernization milestones.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {([1, 2, 3, 4] as UrgencyLevel[]).map((urgency) => {
              const uMeta = URGENCY_LABELS[urgency];
              const bucketItems = roadmapBuckets[urgency] || [];

              return (
                <div key={urgency} className="bg-white rounded-xl border border-zinc-200 shadow-xs flex flex-col">
                  {/* Header */}
                  <div className={`p-3.5 border-b border-zinc-200 rounded-t-xl ${uMeta.color}`}>
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs uppercase tracking-wider">{uMeta.label}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/80 font-bold font-mono">
                        {uMeta.time}
                      </span>
                    </div>
                    <p className="text-[11px] mt-1 opacity-90">{bucketItems.length} capabilities to address</p>
                  </div>

                  {/* Body list */}
                  <div className="p-3 flex-1 space-y-2.5 overflow-y-auto max-h-[500px]">
                    {bucketItems.length === 0 ? (
                      <div className="text-center py-8 text-zinc-400 text-xs">
                        <CheckCircle2 className="w-6 h-6 mx-auto mb-1 text-emerald-500" />
                        <span>All clear for this phase!</span>
                      </div>
                    ) : (
                      bucketItems.map((item) => (
                        <div
                          key={item.id}
                          className="bg-zinc-50 p-2.5 rounded-lg border border-zinc-200/80 text-xs hover:bg-zinc-100 transition"
                        >
                          <div className="flex items-start justify-between gap-1.5">
                            <span className="font-semibold text-zinc-900 leading-snug">{item.capability}</span>
                          </div>
                          <span className="text-[10px] text-zinc-500 block mt-0.5">{item.stage} › {item.group}</span>
                          <div className="mt-2 flex items-center justify-between pt-1 border-t border-zinc-200/60">
                            <span
                              className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${
                                STATUS_COLOR_MAP[item.status].bg
                              }`}
                            >
                              {STATUS_LABEL_MAP[item.status]}
                            </span>
                            <button
                              onClick={() => onUpdateCapability(item.id, { status: 'fully_in_place' })}
                              title="Mark Fully in Place"
                              className="text-[10px] text-emerald-700 hover:underline flex items-center gap-0.5"
                            >
                              <Check className="w-3 h-3" /> Done
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
