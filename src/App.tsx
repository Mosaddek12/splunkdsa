import React, { useState, useEffect, useMemo } from 'react';
import {
  Project,
  DataSourceItem,
  CapabilityItem,
  ActiveView,
  ProjectSnapshot,
  CustomFieldDefinition,
  EpsCalcConfig,
  MaturityStatus
} from './types';
import { SEED_DATA_SOURCES } from './data/seedDataSources';
import { SEED_MATURITY_CAPABILITIES } from './data/seedMaturity';
import { IndustryTemplate } from './data/industryTemplates';
import { calculateGrandTotals } from './utils/calculations';

import { Navbar } from './components/Navbar';
import { SizingGrid } from './components/SizingGrid';
import { SizingDashboard } from './components/SizingDashboard';
import { MaturityAssessment } from './components/MaturityAssessment';
import { RecommendationsView } from './components/RecommendationsView';
import { ContentMappingExplorer } from './components/ContentMappingExplorer';

import { EpsCalculatorModal } from './components/EpsCalculatorModal';
import { ExecutiveReportModal } from './components/ExecutiveReportModal';
import { SnapshotCompareModal } from './components/SnapshotCompareModal';
import { IndustryPresetModal } from './components/IndustryPresetModal';
import { CustomFieldsModal } from './components/CustomFieldsModal';
import { SplunkSPLModal } from './components/SplunkSPLModal';
import { TARunbooksModal } from './components/TARunbooksModal';
import { ExportModal } from './components/ExportModal';
import { CostEstimatorModal } from './components/CostEstimatorModal';
import { ProjectMetadataModal } from './components/ProjectMetadataModal';

const STORAGE_KEY = 'splunk_dsa_active_project_v1';

const createInitialProject = (): Project => ({
  id: `proj-${Date.now()}`,
  metadata: {
    prepared_by_org: 'Thakral Information Systems LTD',
    customer_name: 'Apex Financial Services Corp.',
    prepared_for_recipient: 'Head of Information Security & SOC Operations',
    project_name: 'Enterprise Splunk Security Sizing & Maturity Assessment',
    owner_name: 'Principal Solutions Architect',
    owner_email: 'security.solutions@thakral.com',
    industry: 'Financial Services',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    buffer_pct: 20,
    retention_days_hot: 90,
    retention_days_cold: 365,
    threshold_min_indexed_pct: 20,
  },
  data_sources: SEED_DATA_SOURCES,
  maturity: SEED_MATURITY_CAPABILITIES,
  custom_columns: [
    { id: 'cf-cloud-env', name: 'Environment', type: 'select', options: ['AWS', 'Azure', 'GCP', 'On-Prem'] },
    { id: 'cf-tier', name: 'Priority Tier', type: 'select', options: ['Tier 1 (Critical)', 'Tier 2 (Standard)', 'Tier 3 (Low)'] },
  ],
  eps_config: {
    min_bytes: 250,
    max_bytes: 750,
    pct_min: 0.55,
  },
  snapshots: [],
});

export default function App() {
  const [project, setProject] = useState<Project>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && Array.isArray(parsed.data_sources) && Array.isArray(parsed.maturity)) {
          const init = createInitialProject();
          return {
            ...init,
            ...parsed,
            metadata: {
              ...init.metadata,
              ...(parsed.metadata || {}),
            },
            data_sources: parsed.data_sources || init.data_sources,
            maturity: parsed.maturity || init.maturity,
            custom_columns: parsed.custom_columns || init.custom_columns,
            eps_config: parsed.eps_config || init.eps_config,
            snapshots: parsed.snapshots || [],
          };
        }
      }
    } catch (e) {
      console.warn('Failed to restore saved project state, initializing defaults.');
    }
    return createInitialProject();
  });

  const [activeView, setActiveView] = useState<ActiveView>('sizing_dashboard');

  // Modal visibility states
  const [isMetadataModalOpen, setIsMetadataModalOpen] = useState(false);
  const [isEpsModalOpen, setIsEpsModalOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isSnapshotModalOpen, setIsSnapshotModalOpen] = useState(false);
  const [isPresetModalOpen, setIsPresetModalOpen] = useState(false);
  const [isCustomFieldsModalOpen, setIsCustomFieldsModalOpen] = useState(false);
  const [isSplModalOpen, setIsSplModalOpen] = useState(false);
  const [isRunbooksModalOpen, setIsRunbooksModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isCostModalOpen, setIsCostModalOpen] = useState(false);

  // Save to local storage on changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(project));
    } catch (e) {
      console.error('Failed to save project to localStorage', e);
    }
  }, [project]);

  // Project update handlers
  const handleUpdateMetadata = (updates: Partial<Project['metadata']>) => {
    setProject((prev) => ({
      ...prev,
      metadata: {
        ...prev.metadata,
        ...updates,
        updated_at: new Date().toISOString(),
      },
    }));
  };

  const handleUpdateDataSource = (id: string, updates: Partial<DataSourceItem>) => {
    setProject((prev) => ({
      ...prev,
      metadata: { ...prev.metadata, updated_at: new Date().toISOString() },
      data_sources: prev.data_sources.map((ds) => (ds.id === id ? { ...ds, ...updates } : ds)),
    }));
  };

  const handleBulkUpdateDataSources = (ids: string[], updates: Partial<DataSourceItem>) => {
    setProject((prev) => ({
      ...prev,
      metadata: { ...prev.metadata, updated_at: new Date().toISOString() },
      data_sources: prev.data_sources.map((ds) => (ids.includes(ds.id) ? { ...ds, ...updates } : ds)),
    }));
  };

  const handleBulkUpdateCategory = (category: string, updates: Partial<DataSourceItem>) => {
    setProject((prev) => ({
      ...prev,
      metadata: { ...prev.metadata, updated_at: new Date().toISOString() },
      data_sources: prev.data_sources.map((ds) => (ds.category === category ? { ...ds, ...updates } : ds)),
    }));
  };

  const handleAddDataSource = (categoryOrItem: string | Omit<DataSourceItem, 'id'>) => {
    const newItem: DataSourceItem = typeof categoryOrItem === 'string' ? {
      id: `ds-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      name: `Custom ${categoryOrItem} Source`,
      category: categoryOrItem,
      description_examples: `Custom log source for ${categoryOrItem}`,
      default_mb_per_day: 500,
      est_log_size_mb_per_day: 500,
      total_items: 10,
      pct_indexed: 100,
      multiplier: 1.0,
      isCustom: true,
    } : {
      ...categoryOrItem,
      id: `ds-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
    };

    setProject((prev) => ({
      ...prev,
      metadata: { ...prev.metadata, updated_at: new Date().toISOString() },
      data_sources: [newItem, ...prev.data_sources],
    }));
  };

  const handleAddCategory = (categoryName: string) => {
    handleAddDataSource(categoryName);
  };

  const handleDeleteDataSource = (id: string) => {
    setProject((prev) => ({
      ...prev,
      metadata: { ...prev.metadata, updated_at: new Date().toISOString() },
      data_sources: prev.data_sources.filter((ds) => ds.id !== id),
    }));
  };

  const handleUpdateCapability = (id: string, updates: Partial<CapabilityItem>) => {
    setProject((prev) => ({
      ...prev,
      metadata: { ...prev.metadata, updated_at: new Date().toISOString() },
      maturity: prev.maturity.map((cap) => (cap.id === id ? { ...cap, ...updates } : cap)),
    }));
  };

  const handleBulkUpdateStage = (stage: string, status: MaturityStatus) => {
    setProject((prev) => ({
      ...prev,
      metadata: { ...prev.metadata, updated_at: new Date().toISOString() },
      maturity: prev.maturity.map((cap) => (cap.stage === stage ? { ...cap, status } : cap)),
    }));
  };

  const handleTakeSnapshot = (name: string, description: string) => {
    const newSnapshot: ProjectSnapshot = {
      id: `snap-${Date.now()}`,
      name,
      timestamp: new Date().toISOString(),
      description,
      data_sources: JSON.parse(JSON.stringify(project.data_sources)),
      maturity: JSON.parse(JSON.stringify(project.maturity)),
      buffer_pct: project.metadata.buffer_pct,
    };
    setProject((prev) => ({
      ...prev,
      snapshots: [newSnapshot, ...prev.snapshots],
    }));
  };

  const handleRestoreSnapshot = (snapshot: ProjectSnapshot) => {
    setProject((prev) => ({
      ...prev,
      metadata: {
        ...prev.metadata,
        buffer_pct: snapshot.buffer_pct,
        updated_at: new Date().toISOString(),
      },
      data_sources: JSON.parse(JSON.stringify(snapshot.data_sources)),
      maturity: JSON.parse(JSON.stringify(snapshot.maturity)),
    }));
  };

  const handleDeleteSnapshot = (snapshotId: string) => {
    setProject((prev) => ({
      ...prev,
      snapshots: prev.snapshots.filter((s) => s.id !== snapshotId),
    }));
  };

  const handleApplyIndustryTemplate = (template: IndustryTemplate) => {
    setProject((prev) => {
      const updatedSources = prev.data_sources.map((ds) => {
        const tVal = template.itemOverrides[ds.name];
        if (tVal) {
          return {
            ...ds,
            total_items: tVal.total_items,
            pct_indexed: tVal.pct_indexed !== undefined ? tVal.pct_indexed : ds.pct_indexed,
          };
        }
        return ds;
      });

      const updatedMaturity = prev.maturity.map((cap) => {
        const capLower = cap.capability.toLowerCase();
        for (const [k, v] of Object.entries(template.maturityOverrides)) {
          if (capLower.includes(k.toLowerCase())) {
            return { ...cap, status: v as MaturityStatus };
          }
        }
        return cap;
      });

      return {
        ...prev,
        metadata: {
          ...prev.metadata,
          industry: template.name,
          updated_at: new Date().toISOString(),
        },
        data_sources: updatedSources,
        maturity: updatedMaturity,
      };
    });
  };

  const handleAddCustomColumn = (col: CustomFieldDefinition) => {
    setProject((prev) => ({
      ...prev,
      custom_columns: [...prev.custom_columns, col],
    }));
  };

  const handleDeleteCustomColumn = (id: string) => {
    setProject((prev) => ({
      ...prev,
      custom_columns: prev.custom_columns.filter((c) => c.id !== id),
      data_sources: prev.data_sources.map((ds) => {
        if (ds.custom_fields && ds.custom_fields[id] !== undefined) {
          const nextCf = { ...ds.custom_fields };
          delete nextCf[id];
          return { ...ds, custom_fields: nextCf };
        }
        return ds;
      }),
    }));
  };

  const handleResetToDefaults = () => {
    if (window.confirm('Reset all project data sources and maturity scores back to default benchmark values?')) {
      const init = createInitialProject();
      setProject(init);
      localStorage.removeItem(STORAGE_KEY);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-100/70 text-zinc-900 flex flex-col font-sans selection:bg-emerald-500 selection:text-white">
      {/* Global Navigation Bar */}
      <Navbar
        project={project}
        activeView={activeView}
        onSelectView={setActiveView}
        onOpenEpsModal={() => setIsEpsModalOpen(true)}
        onOpenReportModal={() => setIsReportModalOpen(true)}
        onOpenSnapshotModal={() => setIsSnapshotModalOpen(true)}
        onOpenPresetModal={() => setIsPresetModalOpen(true)}
        onOpenCustomFieldsModal={() => setIsCustomFieldsModalOpen(true)}
        onOpenSplModal={() => setIsSplModalOpen(true)}
        onOpenRunbooksModal={() => setIsRunbooksModalOpen(true)}
        onOpenExportModal={() => setIsExportModalOpen(true)}
        onOpenCostModal={() => setIsCostModalOpen(true)}
        onOpenMetadataModal={() => setIsMetadataModalOpen(true)}
        onResetDefaults={handleResetToDefaults}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        {activeView === 'sizing_dashboard' && (
          <SizingDashboard
            project={project}
            onNavigateToGrid={() => setActiveView('sizing_grid')}
            onNavigateToRecommendations={() => setActiveView('recommendations')}
            onOpenMetadataModal={() => setIsMetadataModalOpen(true)}
          />
        )}

        {activeView === 'sizing_grid' && (
          <SizingGrid
            dataSources={project.data_sources || []}
            customColumns={project.custom_columns || []}
            bufferPct={project.metadata.buffer_pct || 20}
            thresholdPct={project.metadata.threshold_min_indexed_pct || 20}
            onUpdateDataSource={handleUpdateDataSource}
            onAddDataSource={handleAddDataSource}
            onAddCategory={handleAddCategory}
            onDeleteDataSource={handleDeleteDataSource}
            onBulkUpdateCategory={handleBulkUpdateCategory}
          />
        )}

        {activeView === 'maturity' && (
          <MaturityAssessment
            capabilities={project.maturity}
            onUpdateCapability={handleUpdateCapability}
            onBulkUpdateStage={handleBulkUpdateStage}
          />
        )}

        {activeView === 'recommendations' && (
          <RecommendationsView
            dataSources={project.data_sources}
            thresholdPct={project.metadata.threshold_min_indexed_pct || 20}
            onUpdateDataSource={handleUpdateDataSource}
            onNavigateToContentExplorer={() => setActiveView('content_explorer')}
          />
        )}

        {activeView === 'content_explorer' && (
          <ContentMappingExplorer
            dataSources={project.data_sources}
            thresholdPct={project.metadata.threshold_min_indexed_pct || 20}
          />
        )}
      </main>

      {/* Modal Dialogs */}
      <ProjectMetadataModal
        isOpen={isMetadataModalOpen}
        onClose={() => setIsMetadataModalOpen(false)}
        metadata={project.metadata}
        onSaveMetadata={handleUpdateMetadata}
      />

      <EpsCalculatorModal
        isOpen={isEpsModalOpen}
        onClose={() => setIsEpsModalOpen(false)}
        epsConfig={project.eps_config}
        liveProjectGbDay={useMemo(() => {
          return calculateGrandTotals(project.data_sources || []).totalProjectedGbDay;
        }, [project.data_sources])}
        onSaveConfig={(cfg) => setProject((prev) => ({ ...prev, eps_config: cfg }))}
      />

      <ExecutiveReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        project={project}
        onOpenMetadataModal={() => setIsMetadataModalOpen(true)}
      />

      <SnapshotCompareModal
        isOpen={isSnapshotModalOpen}
        onClose={() => setIsSnapshotModalOpen(false)}
        project={project}
        onTakeSnapshot={handleTakeSnapshot}
        onRestoreSnapshot={handleRestoreSnapshot}
        onDeleteSnapshot={handleDeleteSnapshot}
      />

      <IndustryPresetModal
        isOpen={isPresetModalOpen}
        onClose={() => setIsPresetModalOpen(false)}
        onApplyTemplate={handleApplyIndustryTemplate}
      />

      <CustomFieldsModal
        isOpen={isCustomFieldsModalOpen}
        onClose={() => setIsCustomFieldsModalOpen(false)}
        customColumns={project.custom_columns}
        onAddColumn={handleAddCustomColumn}
        onDeleteColumn={handleDeleteCustomColumn}
      />

      <SplunkSPLModal
        isOpen={isSplModalOpen}
        onClose={() => setIsSplModalOpen(false)}
      />

      <TARunbooksModal
        isOpen={isRunbooksModalOpen}
        onClose={() => setIsRunbooksModalOpen(false)}
      />

      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        project={project}
        onOpenReportModal={() => setIsReportModalOpen(true)}
        onImportJson={(imported) => setProject(imported)}
      />

      <CostEstimatorModal
        isOpen={isCostModalOpen}
        onClose={() => setIsCostModalOpen(false)}
        project={project}
      />
    </div>
  );
}
