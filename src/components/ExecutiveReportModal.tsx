import React, { useRef } from 'react';
import {
  X,
  Printer,
  Download,
  ShieldCheck,
  CheckCircle2,
  FileSpreadsheet,
  Layers,
  Sparkles
} from 'lucide-react';
import {
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  BarChart,
  Bar,
  XAxis,
  YAxis
} from 'recharts';
import { Project } from '../types';
import {
  calculateGrandTotals,
  calculateCategorySummaries,
  calculateMaturityRollups,
  calculateEpsFromGbDay
} from '../utils/calculations';

interface ExecutiveReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: Project;
}

export const ExecutiveReportModal: React.FC<ExecutiveReportModalProps> = ({
  isOpen,
  onClose,
  project
}) => {
  const printRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  const grandTotals = calculateGrandTotals(project.data_sources, project.metadata.buffer_pct);
  const categorySummaries = calculateCategorySummaries(project.data_sources);
  const maturityRollups = calculateMaturityRollups(project.maturity);
  const eps = calculateEpsFromGbDay(
    grandTotals.totalProjectedGbDay,
    project.eps_config.min_bytes,
    project.eps_config.max_bytes,
    project.eps_config.pct_min
  );

  const radarData = maturityRollups.stageSummaries.map((s) => ({
    subject: s.stage,
    maturity: s.maturity_pct,
    fullMark: 100,
  }));

  const activeCategories = categorySummaries
    .filter((c) => c.total_projected_gb_day > 0)
    .sort((a, b) => b.total_projected_gb_day - a.total_projected_gb_day);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 overflow-y-auto print:p-0 print:bg-white">
      <div className="bg-white rounded-2xl border border-zinc-200 shadow-2xl max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden print:max-w-none print:max-h-none print:border-none print:shadow-none">
        {/* Modal Controls (Hidden in Print) */}
        <div className="bg-zinc-900 text-white p-4 flex items-center justify-between print:hidden">
          <div className="flex items-center gap-2">
            <Printer className="w-5 h-5 text-emerald-400" />
            <h3 className="font-bold text-sm">Executive Presentation & Assessment Summary</h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1.5 transition"
            >
              <Printer className="w-4 h-4" />
              <span>Print / Save as PDF</span>
            </button>
            <button onClick={onClose} className="text-zinc-400 hover:text-white p-1 rounded">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Document Body */}
        <div ref={printRef} className="p-8 space-y-8 overflow-y-auto flex-1 bg-white text-zinc-900 font-sans print:p-0">
          {/* Header & Title */}
          <div className="border-b-2 border-zinc-900 pb-5 flex flex-wrap items-end justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-widest text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                  Splunk Security Sizing & Maturity
                </span>
              </div>
              <h1 className="text-2xl font-extrabold text-zinc-950 mt-1 tracking-tight">
                Data Source Assessment & Architecture Recommendation
              </h1>
              <p className="text-xs text-zinc-500 mt-0.5">
                Prepared for <strong className="text-zinc-900">{project.metadata.customer_name || 'Client Organization'}</strong> ({project.metadata.industry || 'Enterprise'})
              </p>
            </div>

            <div className="text-right text-xs text-zinc-500 space-y-0.5">
              <p>Lead Engineer: <strong className="text-zinc-800">{project.metadata.owner_name || 'Sales Engineering'}</strong></p>
              <p>Assessment Date: <strong className="text-zinc-800">{new Date(project.metadata.updated_at).toLocaleDateString()}</strong></p>
              <p>Framework Version: <strong className="text-zinc-800">DSA v2.5 / CIM 5.0</strong></p>
            </div>
          </div>

          {/* Section 1: Executive KPI Grid */}
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-3">1. Executive Sizing Summary</h2>
            <div className="grid grid-cols-4 gap-3 border border-zinc-200 rounded-xl p-4 bg-zinc-50/50">
              <div className="border-r border-zinc-200 pr-3">
                <span className="text-[10px] text-zinc-500 uppercase font-semibold">Total Projected</span>
                <div className="text-xl font-bold font-mono text-zinc-900 mt-1">
                  {grandTotals.totalProjectedGbDay.toFixed(1)} <span className="text-xs font-normal text-zinc-500">GB/d</span>
                </div>
                <span className="text-[11px] text-zinc-500">{(grandTotals.totalProjectedGbDay * 30 / 1024).toFixed(1)} TB/mo raw</span>
              </div>

              <div className="border-r border-zinc-200 pr-3">
                <span className="text-[10px] text-emerald-800 uppercase font-bold">Buffered Target</span>
                <div className="text-xl font-bold font-mono text-emerald-800 mt-1">
                  {grandTotals.bufferedProjectedGbDay.toFixed(1)} <span className="text-xs font-normal text-emerald-700">GB/d</span>
                </div>
                <span className="text-[11px] text-emerald-700">+{project.metadata.buffer_pct}% license headroom</span>
              </div>

              <div className="border-r border-zinc-200 pr-3">
                <span className="text-[10px] text-zinc-500 uppercase font-semibold">Peak Event Rate</span>
                <div className="text-xl font-bold font-mono text-zinc-900 mt-1">
                  {eps.toLocaleString()} <span className="text-xs font-normal text-zinc-500">EPS</span>
                </div>
                <span className="text-[11px] text-zinc-500">{(eps * 86400 / 1000000).toFixed(1)}M daily events</span>
              </div>

              <div>
                <span className="text-[10px] text-blue-800 uppercase font-bold">SOC Maturity Score</span>
                <div className="text-xl font-bold font-mono text-blue-900 mt-1">
                  {maturityRollups.overallMaturityPct}% <span className="text-xs font-normal text-zinc-400">/ 100</span>
                </div>
                <span className="text-[11px] text-blue-700">5-Stage Security Lifecycle</span>
              </div>
            </div>
          </div>

          {/* Section 2: Visual Comparison (Category Distribution & Radar) */}
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-3">2. Architectural Posture & Ingestion Profile</h2>
            <div className="grid grid-cols-2 gap-4">
              {/* Radar chart */}
              <div className="border border-zinc-200 rounded-xl p-4 flex flex-col items-center">
                <h3 className="font-bold text-xs text-zinc-800 text-center mb-1">Maturity Lifecycle Posture</h3>
                <div className="h-56 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                      <PolarGrid stroke="#e2e8f0" />
                      <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10, fill: '#334155', fontWeight: 600 }} />
                      <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 9, fill: '#94a3b8' }} />
                      <Radar name="Maturity" dataKey="maturity" stroke="#059669" fill="#10b981" fillOpacity={0.4} />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Stage breakdown list */}
              <div className="border border-zinc-200 rounded-xl p-4 flex flex-col justify-between">
                <h3 className="font-bold text-xs text-zinc-800 mb-2">Stage Maturity Summary</h3>
                <div className="space-y-3">
                  {maturityRollups.stageSummaries.map((s) => (
                    <div key={s.stage} className="text-xs">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium text-zinc-700">{s.stage}</span>
                        <span className="font-mono font-bold text-emerald-800">{s.maturity_pct}%</span>
                      </div>
                      <div className="w-full bg-zinc-100 rounded-full h-1.5 overflow-hidden">
                        <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${s.maturity_pct}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
                <p className="text-[11px] text-zinc-400 mt-2 italic">
                  Overall environment rated at {maturityRollups.overallMaturityPct}% readiness across {maturityRollups.grandTotalCapabilities} capabilities.
                </p>
              </div>
            </div>
          </div>

          {/* Section 3: Ingestion Rollup by Category */}
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-3">3. Category Ingestion Volume Rollup</h2>
            <div className="border border-zinc-200 rounded-xl overflow-hidden">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-zinc-100 text-zinc-700 font-semibold border-b border-zinc-200">
                  <tr>
                    <th className="py-2 px-3">Data Category</th>
                    <th className="py-2 px-3 text-right">Configured Assets</th>
                    <th className="py-2 px-3 text-right">Projected Volume (GB/d)</th>
                    <th className="py-2 px-3 text-right">Current Indexed (GB/d)</th>
                    <th className="py-2 px-3 text-right">% Indexed</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {activeCategories.map((cat) => (
                    <tr key={cat.category}>
                      <td className="py-2 px-3 font-semibold text-zinc-800">{cat.category}</td>
                      <td className="py-2 px-3 text-right font-mono">{cat.total_items.toLocaleString()}</td>
                      <td className="py-2 px-3 text-right font-mono">{cat.total_projected_gb_day.toFixed(2)}</td>
                      <td className="py-2 px-3 text-right font-mono font-bold text-emerald-700">
                        {cat.current_indexed_gb_day.toFixed(2)}
                      </td>
                      <td className="py-2 px-3 text-right font-mono">{cat.weighted_pct_indexed.toFixed(0)}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Signoff Footer */}
          <div className="border-t border-zinc-200 pt-6 flex items-center justify-between text-xs text-zinc-400">
            <span>Generated via Splunk DSA Platform</span>
            <span>Confidential — Prepared for Customer Evaluation</span>
          </div>
        </div>
      </div>
    </div>
  );
};
