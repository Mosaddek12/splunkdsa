import React, { useState } from 'react';
import { X, BookOpen, Copy, Check, Info, Server, Shield, CheckCircle2 } from 'lucide-react';
import { ONBOARDING_RUNBOOKS } from '../data/onboardingRunbooks';

interface TARunbooksModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TARunbooksModal: React.FC<TARunbooksModalProps> = ({ isOpen, onClose }) => {
  const [selectedKey, setSelectedKey] = useState<string>(Object.keys(ONBOARDING_RUNBOOKS)[0]);
  const [copiedConf, setCopiedConf] = useState(false);
  const [copiedQuery, setCopiedQuery] = useState(false);

  if (!isOpen) return null;

  const currentRunbook = ONBOARDING_RUNBOOKS[selectedKey];

  const handleCopy = (text: string, isConf: boolean) => {
    navigator.clipboard.writeText(text);
    if (isConf) {
      setCopiedConf(true);
      setTimeout(() => setCopiedConf(false), 2000);
    } else {
      setCopiedQuery(true);
      setTimeout(() => setCopiedQuery(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl border border-zinc-200 shadow-xl max-w-4xl w-full max-h-[85vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-zinc-900 text-white p-5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base tracking-tight">Splunk Technical Add-on (TA) Onboarding Runbooks</h3>
              <p className="text-xs text-zinc-400">
                Official configuration stanzas, sourcetypes, and ingestion best practices
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-zinc-400 hover:text-white p-1 rounded">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body (Left selector + Right detail) */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          {/* Left list */}
          <div className="w-full md:w-64 border-r border-zinc-200 bg-zinc-50 p-3 space-y-1 overflow-y-auto shrink-0">
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 px-2 block mb-2">
              Select Data Source Type
            </span>
            {Object.keys(ONBOARDING_RUNBOOKS).map((key) => {
              const rb = ONBOARDING_RUNBOOKS[key];
              const isSelected = selectedKey === key;
              return (
                <button
                  key={key}
                  onClick={() => setSelectedKey(key)}
                  className={`w-full text-left p-2.5 rounded-lg text-xs font-medium transition flex flex-col ${
                    isSelected
                      ? 'bg-emerald-600 text-white font-semibold shadow-xs'
                      : 'text-zinc-700 hover:bg-zinc-200/70'
                  }`}
                >
                  <span className="truncate">{key}</span>
                  <span className={`text-[10px] mt-0.5 ${isSelected ? 'text-emerald-100' : 'text-zinc-400'}`}>
                    {rb.category}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Right detail view */}
          {currentRunbook && (
            <div className="flex-1 p-6 space-y-6 overflow-y-auto bg-white">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-zinc-100 text-zinc-700">
                    {currentRunbook.category}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-zinc-950 mt-1">{selectedKey}</h3>
              </div>

              {/* Recommended TA & Sourcetypes */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-zinc-50 rounded-xl p-4 border border-zinc-200 text-xs">
                <div>
                  <span className="text-zinc-400 font-medium block text-[11px]">Recommended Splunk Add-on:</span>
                  <span className="font-semibold text-zinc-900 mt-0.5 block">{currentRunbook.spl_ta_name}</span>
                </div>
                <div>
                  <span className="text-zinc-400 font-medium block text-[11px]">Target Sourcetype(s):</span>
                  <span className="font-mono font-semibold text-emerald-800 mt-0.5 block">{currentRunbook.sourcetype}</span>
                </div>
              </div>

              {/* Sample inputs.conf */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-zinc-700">
                    Sample inputs.conf Stanza
                  </span>
                  <button
                    onClick={() => handleCopy(currentRunbook.sample_inputs_conf, true)}
                    className="text-xs text-emerald-700 hover:underline font-semibold flex items-center gap-1"
                  >
                    {copiedConf ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    {copiedConf ? 'Copied' : 'Copy Stanza'}
                  </button>
                </div>
                <div className="bg-zinc-950 text-emerald-400 p-4 rounded-xl font-mono text-xs overflow-x-auto border border-zinc-800">
                  <pre>{currentRunbook.sample_inputs_conf}</pre>
                </div>
              </div>

              {/* Validation Query */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-zinc-700">
                    Verification Search Query (SPL)
                  </span>
                  <button
                    onClick={() => handleCopy(currentRunbook.validation_query, false)}
                    className="text-xs text-emerald-700 hover:underline font-semibold flex items-center gap-1"
                  >
                    {copiedQuery ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    {copiedQuery ? 'Copied' : 'Copy SPL'}
                  </button>
                </div>
                <div className="bg-zinc-900 text-zinc-200 p-3.5 rounded-xl font-mono text-xs overflow-x-auto border border-zinc-700">
                  <pre>{currentRunbook.validation_query}</pre>
                </div>
              </div>

              {/* Architecture Best Practices */}
              <div className="space-y-2 pt-2 border-t border-zinc-100">
                <span className="text-xs font-bold uppercase tracking-wider text-zinc-700 block">
                  Best Practice Recommendations
                </span>
                <ul className="space-y-1.5 text-xs text-zinc-600">
                  {currentRunbook.best_practices.map((bp, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{bp}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-zinc-50 border-t border-zinc-200 px-6 py-3.5 flex justify-end shrink-0">
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
