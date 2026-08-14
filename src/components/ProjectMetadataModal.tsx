import React, { useState } from 'react';
import {
  X,
  Building2,
  User,
  Briefcase,
  Calendar,
  Layers,
  FileText,
  Mail,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  Sliders
} from 'lucide-react';
import { ProjectMetadata } from '../types';

interface ProjectMetadataModalProps {
  isOpen: boolean;
  onClose: () => void;
  metadata: ProjectMetadata;
  onSaveMetadata: (updated: ProjectMetadata) => void;
}

const COMMON_INDUSTRIES = [
  'Financial Services & Banking',
  'Telecommunications',
  'Government & Public Sector',
  'Healthcare & Pharmaceuticals',
  'Energy, Oil & Utilities',
  'E-Commerce & Retail',
  'Manufacturing & Logistics',
  'Technology & Software',
  'Education & Research'
];

export const ProjectMetadataModal: React.FC<ProjectMetadataModalProps> = ({
  isOpen,
  onClose,
  metadata,
  onSaveMetadata
}) => {
  const [formData, setFormData] = useState<ProjectMetadata>({
    ...metadata,
    prepared_by_org: metadata.prepared_by_org || 'Thakral Information Systems LTD',
    customer_name: metadata.customer_name || '',
    prepared_for_recipient: metadata.prepared_for_recipient || '',
    project_name: metadata.project_name || 'Splunk Security Sizing & Data Source Assessment',
    owner_name: metadata.owner_name || 'Principal Security Solutions Architect',
    owner_email: metadata.owner_email || 'security@thakral-bd.com',
    industry: metadata.industry || 'Financial Services & Banking',
    buffer_pct: metadata.buffer_pct ?? 20,
    threshold_min_indexed_pct: metadata.threshold_min_indexed_pct ?? 20,
    retention_days_hot: metadata.retention_days_hot ?? 90,
    retention_days_cold: metadata.retention_days_cold ?? 365,
    notes: metadata.notes || '',
    target_date: metadata.target_date || new Date().toISOString().slice(0, 10),
  });

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveMetadata({
      ...formData,
      updated_at: new Date().toISOString(),
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl border border-zinc-200 shadow-2xl max-w-2xl w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="bg-zinc-900 text-white p-5 flex items-center justify-between border-b border-zinc-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base tracking-tight">Client & Document Metadata Setup</h3>
              <p className="text-xs text-zinc-400">
                Configure document recipient, preparing organization, and assessment scope
              </p>
            </div>
          </div>
          <button
            id="btn-close-metadata-modal"
            onClick={onClose}
            className="text-zinc-400 hover:text-white p-1 rounded-lg hover:bg-zinc-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          {/* Organization & Recipient Box */}
          <div className="p-4 bg-emerald-50/50 border border-emerald-200/80 rounded-xl space-y-4">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-900">
              <Building2 className="w-4 h-4 text-emerald-700" />
              <span>Document Parties & Organizations</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Prepared By (Our Org) */}
              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">
                  Our Organization <span className="text-zinc-400 font-normal">(Prepared By)</span>
                </label>
                <input
                  id="input-prepared-by-org"
                  type="text"
                  required
                  value={formData.prepared_by_org || 'Thakral Information Systems LTD'}
                  onChange={(e) => setFormData({ ...formData, prepared_by_org: e.target.value })}
                  placeholder="e.g. Thakral Information Systems LTD"
                  className="w-full text-xs bg-white border border-emerald-300 rounded-lg px-3 py-2 text-zinc-900 font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-xs"
                />
                <span className="text-[10px] text-emerald-700 mt-1 block">
                  Authoring Partner Organization (Thakral Information Systems LTD)
                </span>
              </div>

              {/* Prepared For (Client Name) */}
              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">
                  Client / Customer Organization <span className="text-emerald-700 font-bold">* (Prepared For)</span>
                </label>
                <input
                  id="input-customer-name"
                  type="text"
                  required
                  value={formData.customer_name}
                  onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })}
                  placeholder="e.g. Standard Chartered Bank, Robi Axiata, Biman"
                  className="w-full text-xs bg-white border border-emerald-400 rounded-lg px-3 py-2 text-zinc-950 font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-xs"
                />
                <span className="text-[10px] text-zinc-500 mt-1 block">
                  Target client organization receiving this proposal/sizing
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
              {/* Attention / Recipient Contact */}
              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">
                  Attention / Target Recipient <span className="text-zinc-400 font-normal">(Designation/Name)</span>
                </label>
                <input
                  id="input-recipient-name"
                  type="text"
                  value={formData.prepared_for_recipient || ''}
                  onChange={(e) => setFormData({ ...formData, prepared_for_recipient: e.target.value })}
                  placeholder="e.g. Head of Information Security / CISO"
                  className="w-full text-xs bg-white border border-zinc-300 rounded-lg px-3 py-2 text-zinc-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-xs"
                />
              </div>

              {/* Industry */}
              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">
                  Client Industry Vertical
                </label>
                <div className="relative">
                  <input
                    id="input-industry-vertical"
                    type="text"
                    list="industry-options"
                    value={formData.industry || ''}
                    onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                    placeholder="Select or type industry..."
                    className="w-full text-xs bg-white border border-zinc-300 rounded-lg px-3 py-2 text-zinc-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-xs"
                  />
                  <datalist id="industry-options">
                    {COMMON_INDUSTRIES.map((ind) => (
                      <option key={ind} value={ind} />
                    ))}
                  </datalist>
                </div>
              </div>
            </div>
          </div>

          {/* Assessment & Project Scope */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-zinc-600">
              <FileText className="w-4 h-4 text-zinc-500" />
              <span>Assessment & Document Information</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Document Title */}
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-zinc-700 mb-1">
                  Document / Assessment Title
                </label>
                <input
                  id="input-project-name"
                  type="text"
                  value={formData.project_name || ''}
                  onChange={(e) => setFormData({ ...formData, project_name: e.target.value })}
                  placeholder="e.g. Splunk Security Sizing, Data Source Assessment & Architecture Recommendation"
                  className="w-full text-xs bg-zinc-50 border border-zinc-300 rounded-lg px-3 py-2 text-zinc-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* Lead Consultant / Architect */}
              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">
                  Lead Solution Architect / Author
                </label>
                <input
                  id="input-owner-name"
                  type="text"
                  value={formData.owner_name || ''}
                  onChange={(e) => setFormData({ ...formData, owner_name: e.target.value })}
                  placeholder="e.g. Solution Architect - Thakral"
                  className="w-full text-xs bg-zinc-50 border border-zinc-300 rounded-lg px-3 py-2 text-zinc-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* Consultant Email */}
              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">
                  Architect / Team Contact Email
                </label>
                <input
                  id="input-owner-email"
                  type="email"
                  value={formData.owner_email || ''}
                  onChange={(e) => setFormData({ ...formData, owner_email: e.target.value })}
                  placeholder="e.g. security@thakral-bd.com"
                  className="w-full text-xs bg-zinc-50 border border-zinc-300 rounded-lg px-3 py-2 text-zinc-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>
          </div>

          {/* Sizing Parameters & Headroom */}
          <div className="p-4 bg-zinc-50 border border-zinc-200 rounded-xl space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-zinc-600">
              <Sliders className="w-4 h-4 text-zinc-500" />
              <span>Sizing & Retention Parameters</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-zinc-700 mb-1">
                  Headroom License Buffer (%)
                </label>
                <div className="flex items-center gap-1.5">
                  <input
                    id="input-buffer-pct"
                    type="number"
                    min="0"
                    max="100"
                    value={formData.buffer_pct}
                    onChange={(e) => setFormData({ ...formData, buffer_pct: Number(e.target.value) || 0 })}
                    className="w-full text-xs font-mono font-bold bg-white border border-zinc-300 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-right"
                  />
                  <span className="text-xs text-zinc-500 font-mono">%</span>
                </div>
                <span className="text-[10px] text-zinc-400 mt-0.5 block">Recommended: 20-25%</span>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-zinc-700 mb-1">
                  Hot / Warm Retention (Days)
                </label>
                <div className="flex items-center gap-1.5">
                  <input
                    id="input-retention-hot"
                    type="number"
                    min="1"
                    max="3650"
                    value={formData.retention_days_hot || 90}
                    onChange={(e) => setFormData({ ...formData, retention_days_hot: Number(e.target.value) || 90 })}
                    className="w-full text-xs font-mono bg-white border border-zinc-300 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-right"
                  />
                  <span className="text-xs text-zinc-500">days</span>
                </div>
                <span className="text-[10px] text-zinc-400 mt-0.5 block">Default: 90 days</span>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-zinc-700 mb-1">
                  Cold / Archive Retention (Days)
                </label>
                <div className="flex items-center gap-1.5">
                  <input
                    id="input-retention-cold"
                    type="number"
                    min="1"
                    max="3650"
                    value={formData.retention_days_cold || 365}
                    onChange={(e) => setFormData({ ...formData, retention_days_cold: Number(e.target.value) || 365 })}
                    className="w-full text-xs font-mono bg-white border border-zinc-300 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-right"
                  />
                  <span className="text-xs text-zinc-500">days</span>
                </div>
                <span className="text-[10px] text-zinc-400 mt-0.5 block">Default: 365 days</span>
              </div>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-zinc-700 mb-1">
              Assessment Scope & Customer Notes
            </label>
            <textarea
              id="input-project-notes"
              rows={2}
              value={formData.notes || ''}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="e.g. Scope includes Core Banking logs, NextGen Firewalls, Cloud workloads in AWS, and Active Directory domains..."
              className="w-full text-xs bg-zinc-50 border border-zinc-300 rounded-lg p-2.5 text-zinc-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Modal Actions */}
          <div className="pt-3 border-t border-zinc-200 flex items-center justify-between">
            <button
              type="button"
              onClick={() => {
                setFormData({
                  ...formData,
                  prepared_by_org: 'Thakral Information Systems LTD',
                  customer_name: 'Commercial Bank of Asia',
                  prepared_for_recipient: 'Chief Information Security Officer (CISO)',
                  industry: 'Financial Services & Banking',
                  project_name: 'Splunk Security Sizing & Architecture Proposal',
                  owner_name: 'Principal Security Solutions Architect',
                  owner_email: 'security@thakral-bd.com',
                });
              }}
              className="text-xs text-zinc-500 hover:text-emerald-700 flex items-center gap-1 transition"
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              <span>Fill Example Template</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-zinc-700 hover:bg-zinc-100 rounded-lg transition"
              >
                Cancel
              </button>
              <button
                id="btn-save-project-metadata"
                type="submit"
                className="px-5 py-2 text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg shadow-sm flex items-center gap-1.5 transition"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Save Client & Project Details</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
