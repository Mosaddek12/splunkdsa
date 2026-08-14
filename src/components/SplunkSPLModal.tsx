import React, { useState } from 'react';
import { X, Terminal, Copy, Check, Info, FileCode } from 'lucide-react';
import { SPL_TEMPLATES, SplQueryTemplate } from '../utils/splGenerator';

interface SplunkSPLModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SplunkSPLModal: React.FC<SplunkSPLModalProps> = ({ isOpen, onClose }) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl border border-zinc-200 shadow-xl max-w-3xl w-full overflow-hidden">
        {/* Header */}
        <div className="bg-zinc-900 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-purple-500/20 text-purple-400 border border-purple-500/30">
              <Terminal className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base tracking-tight">Splunk Live Ingestion Audit Queries (SPL)</h3>
              <p className="text-xs text-zinc-400">
                Production SPL queries to run inside customer Splunk instances to reconcile manual estimates
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-zinc-400 hover:text-white p-1 rounded">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Query List */}
        <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
          {SPL_TEMPLATES.map((tmpl) => (
            <div key={tmpl.id} className="border border-zinc-200 rounded-xl p-4 bg-zinc-50/50 space-y-2.5">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-purple-700 bg-purple-100 px-2 py-0.5 rounded font-mono">
                    {tmpl.category}
                  </span>
                  <h4 className="font-bold text-sm text-zinc-900 mt-1">{tmpl.title}</h4>
                </div>
                <button
                  onClick={() => handleCopy(tmpl.id, tmpl.query)}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-zinc-900 hover:bg-zinc-800 text-white flex items-center gap-1.5 transition shadow-xs"
                >
                  {copiedId === tmpl.id ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy SPL</span>
                    </>
                  )}
                </button>
              </div>

              <p className="text-xs text-zinc-600 leading-relaxed">{tmpl.description}</p>

              {/* Code Snippet Box */}
              <div className="bg-zinc-950 text-emerald-400 p-3.5 rounded-lg font-mono text-xs overflow-x-auto border border-zinc-800 leading-relaxed">
                <pre>{tmpl.query}</pre>
              </div>

              <div className="flex items-center gap-1.5 text-[11px] text-zinc-500 italic">
                <Info className="w-3.5 h-3.5 shrink-0 text-zinc-400" />
                <span>{tmpl.notes}</span>
              </div>
            </div>
          ))}
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
