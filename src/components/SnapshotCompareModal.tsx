import React, { useState } from 'react';
import {
  X,
  History,
  Camera,
  GitCompare,
  Trash2,
  CheckCircle2,
  TrendingUp,
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { Project, ProjectSnapshot } from '../types';
import { calculateGrandTotals, calculateMaturityRollups } from '../utils/calculations';

interface SnapshotCompareModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: Project;
  onTakeSnapshot: (name: string, description: string) => void;
  onRestoreSnapshot: (snapshot: ProjectSnapshot) => void;
  onDeleteSnapshot: (snapshotId: string) => void;
}

export const SnapshotCompareModal: React.FC<SnapshotCompareModalProps> = ({
  isOpen,
  onClose,
  project,
  onTakeSnapshot,
  onRestoreSnapshot,
  onDeleteSnapshot,
}) => {
  const snapshots = project.snapshots || [];
  const [newSnapshotName, setNewSnapshotName] = useState('');
  const [newSnapshotDesc, setNewSnapshotDesc] = useState('');
  const [selectedSnapshotA, setSelectedSnapshotA] = useState<string>('current');
  const [selectedSnapshotB, setSelectedSnapshotB] = useState<string>(
    snapshots[0]?.id || 'current'
  );

  if (!isOpen) return null;

  const currentTotals = calculateGrandTotals(project.data_sources || [], project.metadata.buffer_pct || 20);
  const currentMaturity = calculateMaturityRollups(project.maturity || []);

  const getSnapshotData = (id: string) => {
    if (id === 'current') {
      return {
        name: 'Current Live State',
        timestamp: new Date().toISOString(),
        total_projected_gb_day: currentTotals.totalProjectedGbDay,
        current_indexed_gb_day: currentTotals.currentIndexedGbDay,
        buffered_gb_day: currentTotals.bufferedProjectedGbDay,
        overall_pct_indexed: currentTotals.overallPctIndexed,
        maturity_score_pct: currentMaturity.overallMaturityPct,
        active_sources: currentTotals.activeSourcesCount,
      };
    }
    const snap = snapshots.find((s) => s.id === id);
    if (!snap) return null;
    const totals = calculateGrandTotals(snap.data_sources || [], snap.buffer_pct || 20);
    const mat = calculateMaturityRollups(snap.maturity || []);
    return {
      name: snap.name,
      timestamp: snap.timestamp,
      total_projected_gb_day: totals.totalProjectedGbDay,
      current_indexed_gb_day: totals.currentIndexedGbDay,
      buffered_gb_day: totals.bufferedProjectedGbDay,
      overall_pct_indexed: totals.overallPctIndexed,
      maturity_score_pct: mat.overallMaturityPct,
      active_sources: totals.activeSourcesCount,
    };
  };

  const dataA = getSnapshotData(selectedSnapshotA);
  const dataB = getSnapshotData(selectedSnapshotB);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSnapshotName.trim()) return;
    onTakeSnapshot(newSnapshotName.trim(), newSnapshotDesc.trim());
    setNewSnapshotName('');
    setNewSnapshotDesc('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl border border-zinc-200 shadow-xl max-w-4xl w-full overflow-hidden">
        {/* Header */}
        <div className="bg-zinc-900 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-blue-500/20 text-blue-400 border border-blue-500/30">
              <History className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base tracking-tight">Version Snapshots & Architecture Comparison</h3>
              <p className="text-xs text-zinc-400">Save point-in-time assessment versions and compare diffs</p>
            </div>
          </div>
          <button onClick={onClose} className="text-zinc-400 hover:text-white p-1 rounded">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          {/* Create New Snapshot Form */}
          <form onSubmit={handleCreate} className="bg-zinc-50 border border-zinc-200 rounded-xl p-4 space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-700 flex items-center gap-1.5">
              <Camera className="w-4 h-4 text-emerald-600" />
              Capture Point-in-Time Snapshot
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <input
                type="text"
                placeholder="Snapshot Name (e.g. Baseline Discovery)"
                value={newSnapshotName}
                onChange={(e) => setNewSnapshotName(e.target.value)}
                className="text-xs px-3 py-2 bg-white border border-zinc-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 sm:col-span-1"
                required
              />
              <input
                type="text"
                placeholder="Optional description (e.g. Pre-EDR rollout state)"
                value={newSnapshotDesc}
                onChange={(e) => setNewSnapshotDesc(e.target.value)}
                className="text-xs px-3 py-2 bg-white border border-zinc-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 sm:col-span-1"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold shadow-xs flex items-center justify-center gap-1.5 transition"
              >
                <Camera className="w-3.5 h-3.5" />
                <span>Save Current Snapshot</span>
              </button>
            </div>
          </form>

          {/* Side-by-side comparison selector */}
          <div className="border border-zinc-200 rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-700 flex items-center gap-1.5">
                <GitCompare className="w-4 h-4 text-blue-600" />
                Side-by-Side Version Diff
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-zinc-500 font-medium block mb-1">Select Version A</label>
                <select
                  value={selectedSnapshotA}
                  onChange={(e) => setSelectedSnapshotA(e.target.value)}
                  className="w-full text-xs bg-zinc-50 border border-zinc-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="current">Current Live State</option>
                  {snapshots.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({new Date(s.timestamp).toLocaleDateString()})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs text-zinc-500 font-medium block mb-1">Select Version B</label>
                <select
                  value={selectedSnapshotB}
                  onChange={(e) => setSelectedSnapshotB(e.target.value)}
                  className="w-full text-xs bg-zinc-50 border border-zinc-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="current">Current Live State</option>
                  {snapshots.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({new Date(s.timestamp).toLocaleDateString()})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Comparison Metrics Grid */}
            {dataA && dataB && (
              <div className="grid grid-cols-2 gap-4 pt-2">
                {/* Column A */}
                <div className="bg-zinc-50 rounded-xl p-4 border border-zinc-200 space-y-3">
                  <h4 className="font-bold text-xs text-zinc-800 border-b border-zinc-200 pb-2">{dataA.name}</h4>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-zinc-500">Projected Ingest:</span>
                      <span className="font-mono font-bold">{dataA.total_projected_gb_day.toFixed(1)} GB/d</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-500">Currently Indexed:</span>
                      <span className="font-mono font-bold text-emerald-700">{dataA.current_indexed_gb_day.toFixed(1)} GB/d</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-500">Buffered Target:</span>
                      <span className="font-mono font-bold text-zinc-900">{dataA.buffered_gb_day.toFixed(1)} GB/d</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-500">Maturity Score:</span>
                      <span className="font-mono font-bold text-blue-700">{dataA.maturity_score_pct}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-500">Active Sources:</span>
                      <span className="font-mono">{dataA.active_sources}</span>
                    </div>
                  </div>
                </div>

                {/* Column B */}
                <div className="bg-blue-50/40 rounded-xl p-4 border border-blue-200 space-y-3">
                  <div className="flex items-center justify-between border-b border-blue-200 pb-2">
                    <h4 className="font-bold text-xs text-blue-950">{dataB.name}</h4>
                    {selectedSnapshotB !== 'current' && (
                      <button
                        onClick={() => {
                          const snap = project.snapshots.find((s) => s.id === selectedSnapshotB);
                          if (snap) onRestoreSnapshot(snap);
                        }}
                        className="text-[10px] text-blue-700 hover:underline font-semibold"
                      >
                        Restore Version
                      </button>
                    )}
                  </div>

                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between items-center">
                      <span className="text-zinc-500">Projected Ingest:</span>
                      <div className="flex items-center gap-1.5 font-mono">
                        <span className="font-bold">{dataB.total_projected_gb_day.toFixed(1)} GB/d</span>
                        <DeltaBadge diff={dataB.total_projected_gb_day - dataA.total_projected_gb_day} unit="GB" />
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-zinc-500">Currently Indexed:</span>
                      <div className="flex items-center gap-1.5 font-mono">
                        <span className="font-bold text-emerald-700">{dataB.current_indexed_gb_day.toFixed(1)} GB/d</span>
                        <DeltaBadge diff={dataB.current_indexed_gb_day - dataA.current_indexed_gb_day} unit="GB" />
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-zinc-500">Buffered Target:</span>
                      <div className="flex items-center gap-1.5 font-mono">
                        <span className="font-bold text-zinc-900">{dataB.buffered_gb_day.toFixed(1)} GB/d</span>
                        <DeltaBadge diff={dataB.buffered_gb_day - dataA.buffered_gb_day} unit="GB" />
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-zinc-500">Maturity Score:</span>
                      <div className="flex items-center gap-1.5 font-mono">
                        <span className="font-bold text-blue-700">{dataB.maturity_score_pct}%</span>
                        <DeltaBadge diff={dataB.maturity_score_pct - dataA.maturity_score_pct} unit="%" />
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-zinc-500">Active Sources:</span>
                      <div className="flex items-center gap-1.5 font-mono">
                        <span>{dataB.active_sources}</span>
                        <DeltaBadge diff={dataB.active_sources - dataA.active_sources} unit="" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Saved Snapshots List */}
          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-500 block">
              Snapshot Repository ({snapshots.length})
            </span>
            {snapshots.length === 0 ? (
              <p className="text-xs text-zinc-400 italic">No snapshots captured yet for this project.</p>
            ) : (
              snapshots.map((snap) => (
                <div
                  key={snap.id}
                  className="p-3 bg-zinc-50 rounded-lg border border-zinc-200 flex items-center justify-between gap-3 text-xs"
                >
                  <div>
                    <span className="font-semibold text-zinc-900">{snap.name}</span>
                    <span className="text-[11px] text-zinc-400 ml-2">
                      {new Date(snap.timestamp).toLocaleString()}
                    </span>
                    {snap.description && <p className="text-zinc-500 text-[11px] mt-0.5">{snap.description}</p>}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onRestoreSnapshot(snap)}
                      className="px-2.5 py-1 bg-white hover:bg-zinc-100 border border-zinc-300 rounded text-zinc-700 font-medium text-xs transition"
                    >
                      Restore
                    </button>
                    <button
                      onClick={() => onDeleteSnapshot(snap.id)}
                      className="p-1 text-zinc-400 hover:text-rose-600 transition"
                      title="Delete Snapshot"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="bg-zinc-50 border-t border-zinc-200 px-6 py-3.5 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-xs font-semibold text-zinc-600 hover:bg-zinc-200 transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

const DeltaBadge: React.FC<{ diff: number; unit: string }> = ({ diff, unit }) => {
  if (Math.abs(diff) < 0.01) return null;
  const isPositive = diff > 0;
  return (
    <span
      className={`text-[10px] px-1.5 py-0.2 rounded font-bold ${
        isPositive ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
      }`}
    >
      {isPositive ? '+' : ''}
      {diff.toFixed(1)}
      {unit}
    </span>
  );
};
