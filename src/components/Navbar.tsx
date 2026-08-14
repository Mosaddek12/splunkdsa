import React from 'react';
import {
  LayoutDashboard,
  TableProperties,
  ShieldCheck,
  Lightbulb,
  Compass,
  Download,
  Terminal,
  Layers,
  Sparkles,
  Printer,
  Sliders,
  History,
  Calculator,
  DollarSign,
  BookOpen,
  RotateCcw,
  Plus
} from 'lucide-react';
import { Project, ActiveView } from '../types';
import { calculateGrandTotals, calculateMaturityRollups, calculateEpsFromGbDay } from '../utils/calculations';

interface NavbarProps {
  project: Project;
  activeView: ActiveView;
  onSelectView: (view: ActiveView) => void;
  onOpenEpsModal: () => void;
  onOpenReportModal: () => void;
  onOpenSnapshotModal: () => void;
  onOpenPresetModal: () => void;
  onOpenCustomFieldsModal: () => void;
  onOpenSplModal: () => void;
  onOpenRunbooksModal: () => void;
  onOpenExportModal: () => void;
  onOpenCostModal: () => void;
  onResetDefaults: () => void;
  onUpdateMetadata?: (metadata: Project['metadata']) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  project,
  activeView,
  onSelectView,
  onOpenEpsModal,
  onOpenReportModal,
  onOpenSnapshotModal,
  onOpenPresetModal,
  onOpenCustomFieldsModal,
  onOpenSplModal,
  onOpenRunbooksModal,
  onOpenExportModal,
  onOpenCostModal,
  onResetDefaults,
  onUpdateMetadata
}) => {
  const dataSources = project.data_sources || [];
  const maturity = project.maturity || [];
  const metadata = project.metadata || { buffer_pct: 20, threshold_min_indexed_pct: 20, customer_name: '', owner_name: '', industry: '' };
  const epsConfig = project.eps_config || { min_bytes: 250, max_bytes: 750, pct_min: 0.55 };
  const snapshots = project.snapshots || [];

  const grandTotals = calculateGrandTotals(dataSources, metadata.buffer_pct || 20);
  const maturityRollups = calculateMaturityRollups(maturity);
  const eps = calculateEpsFromGbDay(
    grandTotals.totalProjectedGbDay,
    epsConfig.min_bytes,
    epsConfig.max_bytes,
    epsConfig.pct_min
  );

  const navItems: { id: ActiveView; label: string; icon: React.ReactNode; badge?: string }[] = [
    {
      id: 'sizing_dashboard',
      label: 'Sizing Dashboard',
      icon: <LayoutDashboard className="w-4 h-4" />
    },
    {
      id: 'sizing_grid',
      label: 'Sizing Grid',
      icon: <TableProperties className="w-4 h-4" />,
      badge: `${dataSources.length}`
    },
    {
      id: 'maturity',
      label: 'Security Maturity',
      icon: <ShieldCheck className="w-4 h-4" />,
      badge: `${maturityRollups.overallMaturityPct}%`
    },
    {
      id: 'recommendations',
      label: 'Recommendations',
      icon: <Lightbulb className="w-4 h-4" />
    },
    {
      id: 'content_explorer',
      label: 'Content & Detections',
      icon: <Compass className="w-4 h-4" />
    }
  ];

  return (
    <header className="bg-zinc-900 text-zinc-100 border-b border-zinc-800 sticky top-0 z-40 shadow-sm">
      {/* Primary Top Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 flex flex-wrap items-center justify-between gap-4">
        {/* Brand & Project Info */}
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center shadow-inner text-white font-bold tracking-wider text-sm shrink-0">
            DSA
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold tracking-tight text-zinc-100 text-base flex items-center gap-1.5">
                Splunk DSA Platform
                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-950/90 text-emerald-400 border border-emerald-800/60 font-mono">
                  v2.5
                </span>
              </span>
            </div>
            <div className="text-xs text-zinc-400 truncate max-w-[260px] sm:max-w-xs">
              {metadata.customer_name || 'Enterprise Assessment'} &bull; {metadata.industry || 'Financial Services'}
            </div>
          </div>
        </div>

        {/* Live Key Metrics Badges */}
        <div className="flex items-center gap-2 overflow-x-auto py-1">
          <div className="bg-zinc-800/90 border border-zinc-700/60 rounded-md px-2.5 py-1.5 flex flex-col items-start min-w-[105px]">
            <span className="text-[10px] uppercase font-semibold text-zinc-400 tracking-wider">Projected Ingest</span>
            <span className="text-xs sm:text-sm font-bold text-zinc-100 font-mono">
              {grandTotals.totalProjectedGbDay.toFixed(1)} <span className="text-[10px] font-normal text-zinc-400">GB/d</span>
            </span>
          </div>

          <div className="bg-zinc-800/90 border border-emerald-800/50 rounded-md px-2.5 py-1.5 flex flex-col items-start min-w-[115px]">
            <span className="text-[10px] uppercase font-semibold text-emerald-400 tracking-wider">
              +{metadata.buffer_pct}% Buffer
            </span>
            <span className="text-xs sm:text-sm font-bold text-emerald-300 font-mono">
              {grandTotals.bufferedProjectedGbDay.toFixed(1)} <span className="text-[10px] font-normal text-emerald-400/80">GB/d</span>
            </span>
          </div>

          <button
            id="btn-nav-eps-badge"
            onClick={onOpenEpsModal}
            className="bg-zinc-800/90 hover:bg-zinc-800 border border-zinc-700/60 hover:border-teal-700/60 rounded-md px-2.5 py-1.5 flex flex-col items-start min-w-[90px] text-left transition"
            title="Click to open EPS Calculator"
          >
            <span className="text-[10px] uppercase font-semibold text-zinc-400 tracking-wider flex items-center gap-1">
              Est. EPS <Calculator className="w-2.5 h-2.5 text-teal-400" />
            </span>
            <span className="text-xs sm:text-sm font-bold text-teal-300 font-mono">
              {eps.toLocaleString()} <span className="text-[10px] font-normal text-zinc-400">eps</span>
            </span>
          </button>

          <div className="bg-zinc-800/90 border border-zinc-700/60 rounded-md px-2.5 py-1.5 flex flex-col items-start min-w-[100px]">
            <span className="text-[10px] uppercase font-semibold text-zinc-400 tracking-wider">Maturity</span>
            <span className="text-xs sm:text-sm font-bold text-blue-300 font-mono">
              {maturityRollups.overallMaturityPct}% <span className="text-[10px] text-zinc-400 font-normal">/ 100</span>
            </span>
          </div>
        </div>

        {/* Global Action Toolbar */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            id="btn-industry-templates"
            onClick={onOpenPresetModal}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 transition"
            title="Load industry vertical benchmark presets"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden md:inline">Presets</span>
          </button>

          <button
            id="btn-cost-estimator"
            onClick={onOpenCostModal}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 transition"
            title="Estimate Splunk Cloud & On-Prem Licensing Costs"
          >
            <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden lg:inline">Cost Model</span>
          </button>

          <button
            id="btn-snapshots"
            onClick={onOpenSnapshotModal}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 transition"
            title="Manage and compare sizing version snapshots"
          >
            <History className="w-3.5 h-3.5 text-blue-400" />
            <span className="hidden md:inline">Snapshots ({snapshots.length})</span>
          </button>

          <button
            id="btn-splunk-spl"
            onClick={onOpenSplModal}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 transition"
            title="Splunk live validation SPL queries"
          >
            <Terminal className="w-3.5 h-3.5 text-purple-400" />
            <span className="hidden xl:inline">Audit SPL</span>
          </button>

          <button
            id="btn-ta-runbooks"
            onClick={onOpenRunbooksModal}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 transition"
            title="Technology Add-on (TA) Setup & Best Practices"
          >
            <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
            <span className="hidden xl:inline">TA Guides</span>
          </button>

          <button
            id="btn-custom-fields"
            onClick={onOpenCustomFieldsModal}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 transition"
            title="Configure custom table columns"
          >
            <Sliders className="w-3.5 h-3.5 text-zinc-300" />
            <span className="hidden xl:inline">Columns</span>
          </button>

          <button
            id="btn-executive-report"
            onClick={onOpenReportModal}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 transition"
            title="Executive presentation & printable report"
          >
            <Printer className="w-3.5 h-3.5 text-zinc-300" />
            <span className="hidden sm:inline">Executive Report</span>
          </button>

          <button
            id="btn-export-excel"
            onClick={onOpenExportModal}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm transition"
            title="Export Excel (.xlsx), CSV or JSON backup"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* Primary Navigation View Tabs */}
      <div className="bg-zinc-950/80 border-t border-zinc-800 px-4 sm:px-6 flex items-center justify-between gap-2 overflow-x-auto">
        <nav className="flex space-x-1 py-1.5" aria-label="Main Navigation">
          {navItems.map((item) => {
            const isActive = activeView === item.id;
            return (
              <button
                key={item.id}
                id={`nav-tab-${item.id}`}
                onClick={() => onSelectView(item.id)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 font-semibold'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
                {item.badge && (
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                      isActive
                        ? 'bg-emerald-500/30 text-emerald-300'
                        : 'bg-zinc-800 text-zinc-400'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        <div className="flex items-center gap-2 py-1 pl-2 shrink-0">
          <button
            id="btn-reset-defaults"
            onClick={onResetDefaults}
            className="text-[11px] text-zinc-500 hover:text-rose-400 flex items-center gap-1 px-2 py-1 rounded hover:bg-zinc-900 transition"
            title="Reset to default benchmark sizing"
          >
            <RotateCcw className="w-3 h-3" />
            <span className="hidden sm:inline">Reset Defaults</span>
          </button>
        </div>
      </div>
    </header>
  );
};

