import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  ShieldCheck,
  Lock,
  Unlock,
  Sparkles,
  Layers,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  ChevronDown,
  Info
} from 'lucide-react';
import { DetectionRule, DataSourceItem } from '../types';
import { SEED_DETECTIONS } from '../data/seedDetections';
import { calculateDetectionCoverage } from '../utils/calculations';

interface ContentMappingExplorerProps {
  dataSources: DataSourceItem[];
  thresholdPct: number;
}

export const ContentMappingExplorer: React.FC<ContentMappingExplorerProps> = ({
  dataSources,
  thresholdPct
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTactic, setSelectedTactic] = useState<string>('ALL');
  const [selectedDomain, setSelectedDomain] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'UNLOCKED' | 'LOCKED'>('ALL');

  const coverage = useMemo(() => {
    return calculateDetectionCoverage(dataSources, SEED_DETECTIONS, thresholdPct);
  }, [dataSources, thresholdPct]);

  // Unique lists for dropdowns
  const tactics = useMemo(() => {
    const set = new Set<string>();
    SEED_DETECTIONS.forEach((d) => set.add(d.mitre_tactic));
    return Array.from(set);
  }, []);

  const domains = useMemo(() => {
    const set = new Set<string>();
    SEED_DETECTIONS.forEach((d) => set.add(d.security_domain));
    return Array.from(set);
  }, []);

  const filteredRules = useMemo(() => {
    return coverage.detectionResults.filter(({ rule, isFullyUnlocked }) => {
      if (selectedTactic !== 'ALL' && rule.mitre_tactic !== selectedTactic) return false;
      if (selectedDomain !== 'ALL' && rule.security_domain !== selectedDomain) return false;
      if (statusFilter === 'UNLOCKED' && !isFullyUnlocked) return false;
      if (statusFilter === 'LOCKED' && isFullyUnlocked) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const mTitle = rule.title.toLowerCase().includes(q);
        const mDesc = rule.description.toLowerCase().includes(q);
        const mTech = rule.mitre_technique_name.toLowerCase().includes(q);
        const mTechId = rule.mitre_technique_id.toLowerCase().includes(q);
        const mCim = rule.cim_data_model.toLowerCase().includes(q);
        if (!mTitle && !mDesc && !mTech && !mTechId && !mCim) return false;
      }
      return true;
    });
  }, [coverage.detectionResults, selectedTactic, selectedDomain, statusFilter, searchQuery]);

  return (
    <div className="space-y-6">
      {/* Header with KPI Cards */}
      <div className="bg-white rounded-xl border border-zinc-200 p-5 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-zinc-900 tracking-tight">
                Splunk Enterprise Security (ES) Content & MITRE Mapping
              </h2>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold font-mono">
                CIM Accelerated
              </span>
            </div>
            <p className="text-xs text-zinc-500 mt-1">
              Explore out-of-the-box ESCU detection rules, Common Information Model (CIM) data models, and MITRE ATT&CK technique alignments.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="bg-zinc-50 border border-zinc-200 rounded-lg px-3.5 py-2 text-right">
              <span className="text-[10px] uppercase font-semibold text-zinc-500 block">Unlocked Rules</span>
              <span className="text-lg font-bold text-emerald-700 font-mono">
                {coverage.unlockedCount} / {coverage.totalDetections}
              </span>
            </div>
            <div className="bg-emerald-50 border border-emerald-200 rounded-lg px-3.5 py-2 text-right">
              <span className="text-[10px] uppercase font-semibold text-emerald-800 block">Coverage Ratio</span>
              <span className="text-lg font-bold text-emerald-900 font-mono">{coverage.coveragePct}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filter / Search Bar */}
      <div className="bg-white rounded-lg border border-zinc-200 p-3 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3 flex-1 min-w-[260px]">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search detection title, MITRE ID (e.g. T1059), CIM model..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-zinc-50 border border-zinc-200 rounded-md focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="text-xs bg-zinc-50 border border-zinc-200 rounded-md px-2.5 py-1.5 text-zinc-700 focus:outline-none"
          >
            <option value="ALL">All Statuses ({coverage.totalDetections})</option>
            <option value="UNLOCKED">Unlocked (Ready) ({coverage.unlockedCount})</option>
            <option value="LOCKED">Requires Data Source ({coverage.totalDetections - coverage.unlockedCount})</option>
          </select>

          {/* MITRE Tactic */}
          <select
            value={selectedTactic}
            onChange={(e) => setSelectedTactic(e.target.value)}
            className="text-xs bg-zinc-50 border border-zinc-200 rounded-md px-2.5 py-1.5 text-zinc-700 focus:outline-none"
          >
            <option value="ALL">All MITRE Tactics</option>
            {tactics.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>

          {/* Security Domain */}
          <select
            value={selectedDomain}
            onChange={(e) => setSelectedDomain(e.target.value)}
            className="text-xs bg-zinc-50 border border-zinc-200 rounded-md px-2.5 py-1.5 text-zinc-700 focus:outline-none"
          >
            <option value="ALL">All Domains</option>
            {domains.map((d) => (
              <option key={d} value={d}>
                {d} Domain
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Detections List */}
      <div className="space-y-3">
        {filteredRules.map(({ rule, isFullyUnlocked, isPartiallyUnlocked, matchedSources, missingSources }) => (
          <div
            key={rule.id}
            className={`bg-white rounded-xl border p-4 shadow-xs transition ${
              isFullyUnlocked
                ? 'border-emerald-200 bg-gradient-to-r from-white to-emerald-50/20'
                : 'border-zinc-200 hover:border-zinc-300'
            }`}
          >
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
              <div className="space-y-1.5 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-mono text-xs font-bold text-zinc-500 bg-zinc-100 px-2 py-0.5 rounded">
                    {rule.id}
                  </span>
                  <h3 className="font-bold text-zinc-900 text-xs sm:text-sm">{rule.title}</h3>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 font-mono font-medium">
                    {rule.mitre_technique_id} • {rule.mitre_tactic}
                  </span>
                </div>

                <p className="text-xs text-zinc-600 leading-relaxed">{rule.description}</p>

                <div className="flex items-center gap-4 text-xs text-zinc-500 pt-1 flex-wrap">
                  <span>
                    CIM Model: <strong className="text-zinc-700 font-mono">{rule.cim_data_model}</strong>
                  </span>
                  <span>
                    Domain: <strong className="text-zinc-700">{rule.security_domain}</strong>
                  </span>
                  <span>
                    MITRE Technique: <strong className="text-zinc-700">{rule.mitre_technique_name}</strong>
                  </span>
                </div>
              </div>

              {/* Status Badge */}
              <div className="shrink-0 flex flex-col items-start lg:items-end gap-1.5">
                {isFullyUnlocked ? (
                  <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 font-bold text-xs flex items-center gap-1.5 border border-emerald-300">
                    <Unlock className="w-3.5 h-3.5 text-emerald-700" />
                    <span>Unlocked & Ready</span>
                  </span>
                ) : isPartiallyUnlocked ? (
                  <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-800 font-bold text-xs flex items-center gap-1.5 border border-amber-300">
                    <Lock className="w-3.5 h-3.5 text-amber-700" />
                    <span>Partial ({matchedSources.length}/{rule.required_sources.length} sources)</span>
                  </span>
                ) : (
                  <span className="px-3 py-1 rounded-full bg-zinc-100 text-zinc-600 font-medium text-xs flex items-center gap-1.5 border border-zinc-200">
                    <Lock className="w-3.5 h-3.5 text-zinc-400" />
                    <span>Source Required</span>
                  </span>
                )}

                {/* Missing sources indicator */}
                {missingSources.length > 0 && (
                  <span className="text-[11px] text-rose-600">
                    Requires: {missingSources.join(', ')}
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
