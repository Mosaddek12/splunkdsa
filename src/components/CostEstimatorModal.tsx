import React, { useState } from 'react';
import { X, DollarSign, Calculator, Info, Shield, Server, Check } from 'lucide-react';
import { Project } from '../types';
import { calculateGrandTotals } from '../utils/calculations';

interface CostEstimatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: Project;
}

export const CostEstimatorModal: React.FC<CostEstimatorModalProps> = ({ isOpen, onClose, project }) => {
  const [pricingModel, setPricingModel] = useState<'ingest' | 'workload'>('ingest');
  const [ratePerGb, setRatePerGb] = useState<number>(4.5); // ~$4.50/GB/day list estimate
  const [retentionDaysHot, setRetentionDaysHot] = useState<number>(90);
  const [retentionDaysCold, setRetentionDaysCold] = useState<number>(365);
  const [coldStorageRatePerGbMonth, setColdStorageRatePerGbMonth] = useState<number>(0.05); // DDAA/DDSS

  if (!isOpen) return null;

  const grandTotals = calculateGrandTotals(project.data_sources, project.metadata.buffer_pct);
  const targetGbDay = grandTotals.bufferedProjectedGbDay;

  // Monthly ingest calculations
  const monthlyGb = targetGbDay * 30;
  const annualGb = targetGbDay * 365;

  // Pricing calculations
  const annualIngestLicenseCost = targetGbDay * ratePerGb * 365;
  const monthlyIngestLicenseCost = annualIngestLicenseCost / 12;

  // Storage footprint (assuming ~50% compression raw-to-indexed)
  const compressedDailyGb = targetGbDay * 0.5;
  const hotStorageTb = (compressedDailyGb * retentionDaysHot) / 1024;
  const coldStorageTb = (compressedDailyGb * Math.max(0, retentionDaysCold - retentionDaysHot)) / 1024;
  const monthlyColdStorageCost = (coldStorageTb * 1024) * coldStorageRatePerGbMonth;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl border border-zinc-200 shadow-xl max-w-xl w-full overflow-hidden">
        {/* Header */}
        <div className="bg-zinc-900 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <DollarSign className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base tracking-tight">Splunk Cloud Cost & License Estimator</h3>
              <p className="text-xs text-zinc-400">Model ingest pricing tiers and long-term retention economics</p>
            </div>
          </div>
          <button onClick={onClose} className="text-zinc-400 hover:text-white p-1 rounded">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Sizing inputs summary */}
          <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-4 flex items-center justify-between">
            <div>
              <span className="text-[11px] uppercase font-bold text-emerald-800">Buffered Ingest Baseline</span>
              <div className="text-2xl font-bold font-mono text-emerald-950 mt-0.5">
                {targetGbDay.toFixed(1)} <span className="text-xs font-normal">GB / day</span>
              </div>
            </div>
            <div className="text-right text-xs text-emerald-800">
              <p>Monthly: <strong>{(monthlyGb / 1024).toFixed(1)} TB</strong></p>
              <p>Annual: <strong>{(annualGb / 1024).toFixed(1)} TB</strong></p>
            </div>
          </div>

          {/* Pricing Parameters */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-zinc-600 block mb-1">
                Estimated Ingest Rate ($/GB/day/yr)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 text-xs">$</span>
                <input
                  type="number"
                  step="0.5"
                  value={ratePerGb}
                  onChange={(e) => setRatePerGb(parseFloat(e.target.value) || 0)}
                  className="w-full pl-7 pr-3 py-1.5 text-xs bg-zinc-50 border border-zinc-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 font-mono"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-zinc-600 block mb-1">
                Hot Searchable Retention
              </label>
              <select
                value={retentionDaysHot}
                onChange={(e) => setRetentionDaysHot(parseInt(e.target.value, 10))}
                className="w-full px-3 py-1.5 text-xs bg-zinc-50 border border-zinc-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500"
              >
                <option value={30}>30 Days (Standard)</option>
                <option value={60}>60 Days</option>
                <option value={90}>90 Days (Enterprise Security Standard)</option>
                <option value={180}>180 Days</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-medium text-zinc-600 block mb-1">
                Total Compliance Retention (DDAA)
              </label>
              <select
                value={retentionDaysCold}
                onChange={(e) => setRetentionDaysCold(parseInt(e.target.value, 10))}
                className="w-full px-3 py-1.5 text-xs bg-zinc-50 border border-zinc-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500"
              >
                <option value={90}>90 Days</option>
                <option value={365}>1 Year (365 Days - PCI/HIPAA)</option>
                <option value={730}>2 Years</option>
                <option value={1095}>3 Years</option>
                <option value={2555}>7 Years (Financial Audit)</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-medium text-zinc-600 block mb-1">
                Archive Storage ($/GB/mo)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 text-xs">$</span>
                <input
                  type="number"
                  step="0.01"
                  value={coldStorageRatePerGbMonth}
                  onChange={(e) => setColdStorageRatePerGbMonth(parseFloat(e.target.value) || 0)}
                  className="w-full pl-7 pr-3 py-1.5 text-xs bg-zinc-50 border border-zinc-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 font-mono"
                />
              </div>
            </div>
          </div>

          {/* Results Summary */}
          <div className="bg-zinc-50 border border-zinc-200 rounded-xl p-4 space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-700 block">
              Estimated Budgetary Summary (Indicative)
            </span>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-zinc-600">Annual Core Ingestion License:</span>
                <span className="font-mono font-bold text-zinc-900">
                  ${Math.round(annualIngestLicenseCost).toLocaleString()} / yr
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-zinc-600">Monthly Ingestion Equiv:</span>
                <span className="font-mono text-zinc-700">
                  ${Math.round(monthlyIngestLicenseCost).toLocaleString()} / mo
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-zinc-600">Searchable Hot Tier ({retentionDaysHot}d):</span>
                <span className="font-mono text-zinc-700">{hotStorageTb.toFixed(1)} TB compressed</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-zinc-600">DDAA Archive Tier ({retentionDaysCold}d):</span>
                <span className="font-mono text-zinc-700">
                  {coldStorageTb.toFixed(1)} TB (${Math.round(monthlyColdStorageCost).toLocaleString()}/mo)
                </span>
              </div>
            </div>
          </div>

          <p className="text-[11px] text-zinc-400 italic">
            * Note: These are budgetary estimates for planning purposes only. Splunk Cloud pricing is subject to volume tiers, multi-year commitments, and workload SVC options.
          </p>
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
