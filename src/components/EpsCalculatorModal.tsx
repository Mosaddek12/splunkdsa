import React, { useState, useEffect } from 'react';
import { X, RefreshCw, Zap, ArrowRightLeft, Info } from 'lucide-react';
import { EpsCalcConfig } from '../types';
import {
  calculateAverageEventBytes,
  calculateEpsFromGbDay,
  calculateGbDayFromEps
} from '../utils/calculations';

interface EpsCalculatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  epsConfig: EpsCalcConfig;
  liveProjectGbDay: number;
  onSaveConfig: (config: EpsCalcConfig) => void;
}

export const EpsCalculatorModal: React.FC<EpsCalculatorModalProps> = ({
  isOpen,
  onClose,
  epsConfig,
  liveProjectGbDay,
  onSaveConfig
}) => {
  const [minBytes, setMinBytes] = useState(epsConfig.min_bytes || 250);
  const [maxBytes, setMaxBytes] = useState(epsConfig.max_bytes || 750);
  const [pctMin, setPctMin] = useState(epsConfig.pct_min || 0.55);

  const [inputGbDay, setInputGbDay] = useState<number>(liveProjectGbDay || 100);
  const [outputEps, setOutputEps] = useState<number>(0);

  const [calcMode, setCalcMode] = useState<'gb_to_eps' | 'eps_to_gb'>('gb_to_eps');
  const [inputEps, setInputEps] = useState<number>(1000);
  const [outputGbDay, setOutputGbDay] = useState<number>(0);

  const avgEventBytes = calculateAverageEventBytes(minBytes, maxBytes, pctMin);

  useEffect(() => {
    if (calcMode === 'gb_to_eps') {
      const calc = calculateEpsFromGbDay(inputGbDay, minBytes, maxBytes, pctMin);
      setOutputEps(calc);
    } else {
      const calc = calculateGbDayFromEps(inputEps, minBytes, maxBytes, pctMin);
      setOutputGbDay(calc);
    }
  }, [inputGbDay, inputEps, minBytes, maxBytes, pctMin, calcMode]);

  if (!isOpen) return null;

  const handleUseProjectTotal = () => {
    setCalcMode('gb_to_eps');
    setInputGbDay(Number(liveProjectGbDay.toFixed(2)));
  };

  const handleSaveDefaults = () => {
    onSaveConfig({
      min_bytes: minBytes,
      max_bytes: maxBytes,
      pct_min: pctMin,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl border border-zinc-200 shadow-xl max-w-xl w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="bg-zinc-900 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-teal-500/20 text-teal-400 border border-teal-500/30">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base tracking-tight">Bidirectional EPS ⇄ GB/Day Sizing Engine</h3>
              <p className="text-xs text-zinc-400">Excel 'EPS Calc' formula replication</p>
            </div>
          </div>
          <button onClick={onClose} className="text-zinc-400 hover:text-white p-1 rounded">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Mode Switcher */}
          <div className="flex items-center justify-center gap-2 bg-zinc-100 p-1 rounded-xl text-xs font-semibold">
            <button
              onClick={() => setCalcMode('gb_to_eps')}
              className={`flex-1 py-2 rounded-lg transition ${
                calcMode === 'gb_to_eps' ? 'bg-white text-zinc-900 shadow-xs' : 'text-zinc-500 hover:text-zinc-800'
              }`}
            >
              Input GB/Day → Calculate EPS
            </button>
            <button
              onClick={() => setCalcMode('eps_to_gb')}
              className={`flex-1 py-2 rounded-lg transition ${
                calcMode === 'eps_to_gb' ? 'bg-white text-zinc-900 shadow-xs' : 'text-zinc-500 hover:text-zinc-800'
              }`}
            >
              Input EPS → Calculate GB/Day
            </button>
          </div>

          {/* Interactive Calculator Section */}
          {calcMode === 'gb_to_eps' ? (
            <div className="bg-emerald-50/50 border border-emerald-200 rounded-xl p-5 space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-zinc-800 uppercase tracking-wider">
                  Ingest Volume (GB / Day)
                </label>
                <button
                  onClick={handleUseProjectTotal}
                  className="text-xs font-semibold text-emerald-700 hover:underline flex items-center gap-1"
                >
                  <RefreshCw className="w-3 h-3" />
                  Use Project Total ({liveProjectGbDay.toFixed(1)} GB/d)
                </button>
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="number"
                  min="0"
                  step="10"
                  value={inputGbDay}
                  onChange={(e) => setInputGbDay(Math.max(0, parseFloat(e.target.value) || 0))}
                  className="w-full text-2xl font-bold font-mono px-3 py-2 bg-white border border-emerald-300 rounded-lg text-emerald-950 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <span className="text-sm font-bold text-emerald-800 font-mono">GB/d</span>
              </div>

              <div className="pt-3 border-t border-emerald-200/80 flex items-center justify-between">
                <span className="text-xs text-emerald-800 font-medium">Calculated Peak Event Rate:</span>
                <div className="text-right">
                  <span className="text-3xl font-extrabold font-mono text-emerald-900">
                    {outputEps.toLocaleString()}
                  </span>
                  <span className="text-xs text-emerald-700 font-bold ml-1 font-mono">EPS</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-blue-50/50 border border-blue-200 rounded-xl p-5 space-y-4">
              <label className="text-xs font-bold text-zinc-800 uppercase tracking-wider block">
                Peak Event Rate (EPS)
              </label>

              <div className="flex items-center gap-3">
                <input
                  type="number"
                  min="0"
                  step="500"
                  value={inputEps}
                  onChange={(e) => setInputEps(Math.max(0, parseInt(e.target.value, 10) || 0))}
                  className="w-full text-2xl font-bold font-mono px-3 py-2 bg-white border border-blue-300 rounded-lg text-blue-950 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <span className="text-sm font-bold text-blue-800 font-mono">EPS</span>
              </div>

              <div className="pt-3 border-t border-blue-200/80 flex items-center justify-between">
                <span className="text-xs text-blue-800 font-medium">Calculated Daily Volume:</span>
                <div className="text-right">
                  <span className="text-3xl font-extrabold font-mono text-blue-950">
                    {outputGbDay.toFixed(2)}
                  </span>
                  <span className="text-xs text-blue-700 font-bold ml-1 font-mono">GB / day</span>
                </div>
              </div>
            </div>
          )}

          {/* Sizing Assumptions / Sliders */}
          <div className="bg-zinc-50 border border-zinc-200 rounded-xl p-4 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-zinc-800 uppercase tracking-wider">
                Event Size Distribution Assumptions
              </span>
              <span className="text-xs font-mono text-zinc-600">
                Avg Size: <strong className="text-zinc-900">{avgEventBytes.toFixed(0)} bytes</strong>
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[11px] text-zinc-500 font-medium block">Min Event Size (Bytes)</label>
                <input
                  type="number"
                  value={minBytes}
                  onChange={(e) => setMinBytes(Math.max(50, parseInt(e.target.value, 10) || 250))}
                  className="w-full text-xs font-mono px-2.5 py-1.5 bg-white border border-zinc-300 rounded mt-1 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="text-[11px] text-zinc-500 font-medium block">Max Event Size (Bytes)</label>
                <input
                  type="number"
                  value={maxBytes}
                  onChange={(e) => setMaxBytes(Math.max(minBytes, parseInt(e.target.value, 10) || 750))}
                  className="w-full text-xs font-mono px-2.5 py-1.5 bg-white border border-zinc-300 rounded mt-1 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between text-xs text-zinc-600 mb-1">
                <span>Weighting Ratio:</span>
                <span className="font-mono font-medium">
                  {Math.round(pctMin * 100)}% Min / {Math.round((1 - pctMin) * 100)}% Max
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={pctMin}
                onChange={(e) => setPctMin(parseFloat(e.target.value))}
                className="w-full accent-emerald-600 cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-zinc-50 border-t border-zinc-200 px-6 py-3.5 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-xs font-semibold text-zinc-600 hover:bg-zinc-200 transition"
          >
            Close
          </button>
          <button
            onClick={handleSaveDefaults}
            className="px-4 py-2 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white shadow-xs transition"
          >
            Save Assumptions to Project
          </button>
        </div>
      </div>
    </div>
  );
};
