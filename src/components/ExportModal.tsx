import React, { useRef } from 'react';
import {
  X,
  Download,
  FileSpreadsheet,
  FileText,
  FileCode,
  Printer,
  Upload,
  Sparkles
} from 'lucide-react';
import { Project } from '../types';
import { exportProjectToExcel, exportProjectToJson, exportDataSourcesToCsv } from '../utils/exportUtils';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: Project;
  onOpenReportModal: () => void;
  onImportJson: (project: Project) => void;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  project,
  onOpenReportModal,
  onImportJson
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed?.metadata && parsed?.data_sources && parsed?.maturity) {
          onImportJson(parsed);
          onClose();
        } else {
          alert('Invalid DSA project backup file format.');
        }
      } catch (err) {
        alert('Failed to parse JSON file.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl border border-zinc-200 shadow-xl max-w-lg w-full overflow-hidden">
        {/* Header */}
        <div className="bg-zinc-900 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base tracking-tight">Export & Data Interchange</h3>
              <p className="text-xs text-zinc-400">Generate formatted workbooks, CSV tables, or JSON backups</p>
            </div>
          </div>
          <button onClick={onClose} className="text-zinc-400 hover:text-white p-1 rounded">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {/* Option 1: Excel */}
          <button
            onClick={() => {
              exportProjectToExcel(project);
              onClose();
            }}
            className="w-full text-left p-4 rounded-xl border border-zinc-200 hover:border-emerald-500 hover:bg-emerald-50/20 transition flex items-center justify-between group"
          >
            <div className="flex items-center gap-3.5">
              <div className="p-2.5 rounded-lg bg-emerald-100 text-emerald-800">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-zinc-900 group-hover:text-emerald-900">
                  Microsoft Excel Workbook (.xlsx)
                </h4>
                <p className="text-xs text-zinc-500 mt-0.5">
                  Full 5-sheet workbook: Data Sources, Sizing Summary, PVP Capabilities, Maturity Results, and EPS Calc.
                </p>
              </div>
            </div>
            <Download className="w-4 h-4 text-zinc-400 group-hover:text-emerald-600" />
          </button>

          {/* Option 2: Executive PDF Report */}
          <button
            onClick={() => {
              onClose();
              onOpenReportModal();
            }}
            className="w-full text-left p-4 rounded-xl border border-zinc-200 hover:border-blue-500 hover:bg-blue-50/20 transition flex items-center justify-between group"
          >
            <div className="flex items-center gap-3.5">
              <div className="p-2.5 rounded-lg bg-blue-100 text-blue-800">
                <Printer className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-zinc-900 group-hover:text-blue-900">
                  Executive PDF / Print Presentation
                </h4>
                <p className="text-xs text-zinc-500 mt-0.5">
                  Clean presentation summary with executive metrics, radar posture diagram, and category table.
                </p>
              </div>
            </div>
            <Printer className="w-4 h-4 text-zinc-400 group-hover:text-blue-600" />
          </button>

          {/* Option 3: CSV */}
          <button
            onClick={() => {
              exportDataSourcesToCsv(project.data_sources);
              onClose();
            }}
            className="w-full text-left p-4 rounded-xl border border-zinc-200 hover:border-zinc-400 hover:bg-zinc-50 transition flex items-center justify-between group"
          >
            <div className="flex items-center gap-3.5">
              <div className="p-2.5 rounded-lg bg-zinc-100 text-zinc-700">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-zinc-900">Raw Data Sources (CSV)</h4>
                <p className="text-xs text-zinc-500 mt-0.5">Comma-separated table of all configured data sources.</p>
              </div>
            </div>
            <Download className="w-4 h-4 text-zinc-400 group-hover:text-zinc-700" />
          </button>

          {/* Option 4: Full JSON Backup */}
          <button
            onClick={() => {
              exportProjectToJson(project);
              onClose();
            }}
            className="w-full text-left p-4 rounded-xl border border-zinc-200 hover:border-purple-500 hover:bg-purple-50/20 transition flex items-center justify-between group"
          >
            <div className="flex items-center gap-3.5">
              <div className="p-2.5 rounded-lg bg-purple-100 text-purple-800">
                <FileCode className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-zinc-900 group-hover:text-purple-900">
                  Full Project Backup (JSON)
                </h4>
                <p className="text-xs text-zinc-500 mt-0.5">
                  Export complete snapshot containing metadata, custom columns, and maturity scores.
                </p>
              </div>
            </div>
            <Download className="w-4 h-4 text-zinc-400 group-hover:text-purple-600" />
          </button>

          {/* Import JSON */}
          <div className="pt-2 border-t border-zinc-100">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".json"
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full py-2.5 px-4 rounded-xl border border-dashed border-zinc-300 hover:border-zinc-400 bg-zinc-50 hover:bg-zinc-100 text-xs font-semibold text-zinc-700 flex items-center justify-center gap-2 transition"
            >
              <Upload className="w-4 h-4 text-zinc-500" />
              <span>Import / Restore Project from JSON</span>
            </button>
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
