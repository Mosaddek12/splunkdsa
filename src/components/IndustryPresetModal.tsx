import React from 'react';
import { X, Sparkles, Building2, Shield, HeartPulse, Cloud, Factory, Check } from 'lucide-react';
import { INDUSTRY_TEMPLATES, IndustryTemplate } from '../data/industryTemplates';

interface IndustryPresetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyTemplate: (template: IndustryTemplate) => void;
}

const TEMPLATE_ICONS: Record<string, React.ReactNode> = {
  fintech_banking: <Shield className="w-5 h-5 text-blue-600" />,
  healthcare: <HeartPulse className="w-5 h-5 text-emerald-600" />,
  cloud_saas: <Cloud className="w-5 h-5 text-purple-600" />,
  manufacturing_ot: <Factory className="w-5 h-5 text-amber-600" />,
};

export const IndustryPresetModal: React.FC<IndustryPresetModalProps> = ({
  isOpen,
  onClose,
  onApplyTemplate
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl border border-zinc-200 shadow-xl max-w-2xl w-full overflow-hidden">
        {/* Header */}
        <div className="bg-zinc-900 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base tracking-tight">Industry Benchmark Presets</h3>
              <p className="text-xs text-zinc-400">
                Populate baseline asset counts and maturity benchmarks for standard vertical architectures
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-zinc-400 hover:text-white p-1 rounded">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* List of Templates */}
        <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
          {INDUSTRY_TEMPLATES.map((tmpl) => (
            <div
              key={tmpl.id}
              className="border border-zinc-200 rounded-xl p-4 hover:border-emerald-500/80 hover:bg-emerald-50/20 transition flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="flex items-start gap-3.5">
                <div className="p-2.5 rounded-xl bg-zinc-100 border border-zinc-200 shrink-0">
                  {TEMPLATE_ICONS[tmpl.id] || <Building2 className="w-5 h-5 text-zinc-600" />}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-sm text-zinc-900">{tmpl.name}</h4>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-zinc-100 text-zinc-700 font-mono">
                      {tmpl.badge}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-500 mt-1 leading-relaxed">{tmpl.description}</p>
                  <span className="text-[11px] font-mono text-emerald-700 font-semibold mt-1.5 inline-block">
                    Typical Ingest Range: {tmpl.estimated_range}
                  </span>
                </div>
              </div>

              <button
                id={`btn-apply-template-${tmpl.id}`}
                onClick={() => {
                  onApplyTemplate(tmpl);
                  onClose();
                }}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold shrink-0 shadow-xs flex items-center justify-center gap-1.5 transition"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Apply Preset</span>
              </button>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="bg-zinc-50 border-t border-zinc-200 px-6 py-3.5 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-xs font-semibold text-zinc-600 hover:bg-zinc-200 transition"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};
