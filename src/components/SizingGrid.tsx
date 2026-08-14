import React, { useState, useMemo, useRef } from 'react';
import {
  Search,
  Plus,
  Trash2,
  ChevronDown,
  ChevronRight,
  Filter,
  ArrowUpDown,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Sparkles,
  SlidersHorizontal,
  Copy,
  Info
} from 'lucide-react';
import { DataSourceItem, CustomFieldDefinition } from '../types';
import {
  calculateItemProjectedGbDay,
  calculateItemCurrentIndexedGbDay,
  calculateCategorySummaries,
  calculateGrandTotals
} from '../utils/calculations';

interface SizingGridProps {
  dataSources: DataSourceItem[];
  customColumns: CustomFieldDefinition[];
  bufferPct: number;
  thresholdPct: number;
  onUpdateDataSource: (id: string, updates: Partial<DataSourceItem>) => void;
  onAddDataSource: (category: string) => void;
  onAddCategory: (categoryName: string) => void;
  onDeleteDataSource: (id: string) => void;
  onBulkUpdateCategory: (category: string, updates: Partial<DataSourceItem>) => void;
}

export const SizingGrid: React.FC<SizingGridProps> = ({
  dataSources = [],
  customColumns = [],
  bufferPct = 20,
  thresholdPct = 20,
  onUpdateDataSource,
  onAddDataSource,
  onAddCategory,
  onDeleteDataSource,
  onBulkUpdateCategory
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('ALL');
  const [collapsedCategories, setCollapsedCategories] = useState<Record<string, boolean>>({});
  const [showOnlyActive, setShowOnlyActive] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [copiedNotification, setCopiedNotification] = useState(false);

  // Group items by category
  const categoriesList = useMemo(() => {
    const set = new Set<string>();
    dataSources.forEach((d) => set.add(d.category));
    return Array.from(set);
  }, [dataSources]);

  const grandTotals = useMemo(() => {
    return calculateGrandTotals(dataSources, bufferPct);
  }, [dataSources, bufferPct]);

  const categorySummariesMap = useMemo(() => {
    const summs = calculateCategorySummaries(dataSources);
    const map = new Map<string, typeof summs[0]>();
    summs.forEach((s) => map.set(s.category, s));
    return map;
  }, [dataSources]);

  const filteredData = useMemo(() => {
    return dataSources.filter((item) => {
      if (selectedCategoryFilter !== 'ALL' && item.category !== selectedCategoryFilter) {
        return false;
      }
      if (showOnlyActive && (Number(item.total_items) || 0) === 0) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = item.name.toLowerCase().includes(q);
        const matchCat = item.category.toLowerCase().includes(q);
        const matchDesc = item.description_examples?.toLowerCase().includes(q);
        const matchNotes = item.notes?.toLowerCase().includes(q);
        if (!matchName && !matchCat && !matchDesc && !matchNotes) {
          return false;
        }
      }
      return true;
    });
  }, [dataSources, selectedCategoryFilter, showOnlyActive, searchQuery]);

  // Group filtered items by category
  const groupedData = useMemo(() => {
    const groups: Record<string, DataSourceItem[]> = {};
    for (const item of filteredData) {
      if (!groups[item.category]) {
        groups[item.category] = [];
      }
      groups[item.category].push(item);
    }
    return groups;
  }, [filteredData]);

  const toggleCategoryCollapse = (cat: string) => {
    setCollapsedCategories((prev) => ({
      ...prev,
      [cat]: !prev[cat],
    }));
  };

  const collapseAll = () => {
    const next: Record<string, boolean> = {};
    categoriesList.forEach((c) => (next[c] = true));
    setCollapsedCategories(next);
  };

  const expandAll = () => {
    setCollapsedCategories({});
  };

  const handlePasteColumn = (e: React.ClipboardEvent<HTMLInputElement>, startItem: DataSourceItem, field: 'total_items' | 'pct_indexed' | 'est_log_size_mb_per_day') => {
    const clipboardData = e.clipboardData.getData('text');
    if (!clipboardData || !clipboardData.includes('\n')) return;

    const lines = clipboardData.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
    if (lines.length > 1) {
      e.preventDefault();
      // find index of startItem in filteredData
      const startIdx = filteredData.findIndex((d) => d.id === startItem.id);
      if (startIdx >= 0) {
        lines.forEach((val, offset) => {
          const target = filteredData[startIdx + offset];
          if (target) {
            const num = parseFloat(val.replace(/[^0-9.-]/g, ''));
            if (!isNaN(num)) {
              onUpdateDataSource(target.id, { [field]: num });
            }
          }
        });
      }
    }
  };

  const handleCreateNewCategory = () => {
    if (!newCatName.trim()) return;
    onAddCategory(newCatName.trim());
    setNewCatName('');
    setIsAddingCategory(false);
  };

  return (
    <div className="space-y-4">
      {/* Control / Filter Bar */}
      <div className="bg-white rounded-lg border border-zinc-200 p-3.5 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3 flex-1 min-w-[280px]">
          {/* Search box */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              id="grid-search-input"
              type="text"
              placeholder="Search data source, sourcetype, vendor, or category..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-zinc-50 border border-zinc-200 rounded-md focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-zinc-400 hover:text-zinc-600"
              >
                ×
              </button>
            )}
          </div>

          {/* Category dropdown filter */}
          <div className="flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-zinc-500" />
            <select
              id="grid-category-filter"
              aria-label="Filter by Data Source Category"
              value={selectedCategoryFilter}
              onChange={(e) => setSelectedCategoryFilter(e.target.value)}
              className="text-xs bg-zinc-50 border border-zinc-200 rounded-md px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-emerald-500 text-zinc-700"
            >
              <option value="ALL">All Categories ({categoriesList.length})</option>
              {categoriesList.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* Active only checkbox */}
          <label className="flex items-center gap-1.5 text-xs text-zinc-600 cursor-pointer select-none">
            <input
              id="grid-active-only-checkbox"
              type="checkbox"
              checked={showOnlyActive}
              onChange={(e) => setShowOnlyActive(e.target.checked)}
              className="rounded border-zinc-300 text-emerald-600 focus:ring-emerald-500 h-3.5 w-3.5"
            />
            <span>Active items only ({dataSources.filter(d => (Number(d.total_items)||0) > 0).length})</span>
          </label>
        </div>

        {/* View toggles & Add actions */}
        <div className="flex items-center gap-2">
          <div className="flex items-center border border-zinc-200 rounded-md overflow-hidden text-xs">
            <button
              id="btn-expand-all"
              onClick={expandAll}
              className="px-2.5 py-1 text-zinc-600 hover:bg-zinc-100 transition border-r border-zinc-200"
            >
              Expand All
            </button>
            <button
              id="btn-collapse-all"
              onClick={collapseAll}
              className="px-2.5 py-1 text-zinc-600 hover:bg-zinc-100 transition"
            >
              Collapse All
            </button>
          </div>

          {isAddingCategory ? (
            <div className="flex items-center gap-1.5">
              <input
                id="input-new-category-name"
                type="text"
                placeholder="New category name"
                value={newCatName}
                onChange={(e) => setNewCatName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleCreateNewCategory()}
                className="text-xs px-2.5 py-1 border border-zinc-300 rounded focus:outline-none focus:ring-1 focus:ring-emerald-500"
                autoFocus
              />
              <button
                id="btn-save-new-category"
                onClick={handleCreateNewCategory}
                className="px-2 py-1 text-xs bg-emerald-600 text-white rounded hover:bg-emerald-500"
              >
                Add
              </button>
              <button
                id="btn-cancel-new-category"
                onClick={() => setIsAddingCategory(false)}
                className="px-2 py-1 text-xs text-zinc-500 hover:text-zinc-700"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              id="btn-add-category"
              onClick={() => setIsAddingCategory(true)}
              className="flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-medium bg-zinc-100 hover:bg-zinc-200 text-zinc-700 border border-zinc-200 transition"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Category</span>
            </button>
          )}
        </div>
      </div>

      {/* Sizing Grid Table Container */}
      <div className="bg-white rounded-lg border border-zinc-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto max-h-[calc(100vh-230px)]">
          <table className="w-full text-left text-xs border-collapse">
            {/* Header */}
            <thead className="bg-zinc-100/90 text-zinc-700 font-semibold border-b border-zinc-300 sticky top-0 z-20 backdrop-blur-xs">
              <tr>
                <th className="py-2.5 px-3 w-10 text-center">#</th>
                <th className="py-2.5 px-3 min-w-[240px]">Configured Item / Data Source</th>
                <th className="py-2.5 px-3 min-w-[200px] text-zinc-500 font-normal">Examples / Sourcetype Hint</th>
                <th className="py-2.5 px-3 w-28 text-right bg-emerald-50/50">
                  <div className="flex flex-col items-end">
                    <span>Total Items</span>
                    <span className="text-[10px] font-normal text-emerald-700">Count</span>
                  </div>
                </th>
                <th className="py-2.5 px-3 w-28 text-right bg-emerald-50/50">
                  <div className="flex flex-col items-end">
                    <span>% Indexed</span>
                    <span className="text-[10px] font-normal text-emerald-700">0 - 100%</span>
                  </div>
                </th>
                <th className="py-2.5 px-3 w-28 text-right">
                  <div className="flex flex-col items-end">
                    <span>Est. MB/Day</span>
                    <span className="text-[10px] font-normal text-zinc-400">per item</span>
                  </div>
                </th>
                <th className="py-2.5 px-3 w-20 text-right">
                  <div className="flex flex-col items-end">
                    <span>Multiplier</span>
                    <span className="text-[10px] font-normal text-zinc-400">factor</span>
                  </div>
                </th>
                <th className="py-2.5 px-3 w-32 text-right bg-zinc-50 font-bold text-zinc-800">
                  <div className="flex flex-col items-end">
                    <span>Projected</span>
                    <span className="text-[10px] font-normal text-zinc-500">GB / Day</span>
                  </div>
                </th>
                <th className="py-2.5 px-3 w-32 text-right bg-emerald-50 font-bold text-emerald-900">
                  <div className="flex flex-col items-end">
                    <span>Indexed</span>
                    <span className="text-[10px] font-normal text-emerald-700">GB / Day</span>
                  </div>
                </th>
                {customColumns.map((col) => (
                  <th key={col.id} className="py-2.5 px-3 min-w-[110px] text-zinc-600">
                    {col.name}
                  </th>
                ))}
                <th className="py-2.5 px-3 w-16 text-center text-zinc-400">Actions</th>
              </tr>
            </thead>

            {/* Body */}
            <tbody>
              {Object.keys(groupedData).length === 0 ? (
                <tr>
                  <td colSpan={10 + customColumns.length} className="text-center py-12 text-zinc-400">
                    <AlertCircle className="w-8 h-8 mx-auto mb-2 text-zinc-300" />
                    <p className="font-medium text-zinc-600">No data sources match your current filter.</p>
                    <p className="text-xs text-zinc-400 mt-1">Try clearing search or toggling "Active items only".</p>
                  </td>
                </tr>
              ) : (
                (Object.entries(groupedData) as [string, DataSourceItem[]][]).map(([category, items]) => {
                  const isCollapsed = !!collapsedCategories[category];
                  const catSummary = categorySummariesMap.get(category);

                  const catItemsCount = catSummary?.total_items || 0;
                  const catProjGb = catSummary?.total_projected_gb_day || 0;
                  const catIndexedGb = catSummary?.current_indexed_gb_day || 0;
                  const catWeightedPct = catSummary?.weighted_pct_indexed || 0;

                  return (
                    <React.Fragment key={category}>
                      {/* Category Header Row */}
                      <tr className="bg-zinc-100 border-t-2 border-b border-zinc-200 font-medium text-zinc-800 hover:bg-zinc-200/70 transition">
                        <td className="py-2 px-3 text-center">
                          <button
                            onClick={() => toggleCategoryCollapse(category)}
                            className="text-zinc-500 hover:text-zinc-800 p-0.5 rounded"
                          >
                            {isCollapsed ? (
                              <ChevronRight className="w-4 h-4" />
                            ) : (
                              <ChevronDown className="w-4 h-4" />
                            )}
                          </button>
                        </td>
                        <td colSpan={2} className="py-2 px-3">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-zinc-900 text-sm tracking-tight">{category}</span>
                            <span className="text-[11px] px-2 py-0.5 rounded bg-zinc-200/80 text-zinc-600 font-mono">
                              {items.length} sources
                            </span>
                            {catItemsCount === 0 && (
                              <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 border border-amber-300 flex items-center gap-1">
                                <Info className="w-3 h-3" /> Unconfigured (0 items)
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Category Subtotal for Total Items */}
                        <td className="py-2 px-3 text-right font-mono font-bold text-zinc-800 bg-emerald-50/40">
                          {catItemsCount.toLocaleString()}
                        </td>

                        {/* Category Weighted % */}
                        <td className="py-2 px-3 text-right font-mono text-xs">
                          <div className="flex items-center justify-end gap-1.5">
                            <span
                              className={`px-1.5 py-0.5 rounded text-[11px] font-bold ${
                                catWeightedPct >= 80
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : catWeightedPct >= 20
                                  ? 'bg-amber-100 text-amber-800'
                                  : 'bg-zinc-100 text-zinc-600'
                              }`}
                            >
                              {catWeightedPct.toFixed(0)}%
                            </span>
                          </div>
                        </td>

                        {/* Category MB/day (blank for group) */}
                        <td className="py-2 px-3 text-right text-zinc-400 text-[11px]">—</td>
                        <td className="py-2 px-3 text-right text-zinc-400 text-[11px]">—</td>

                        {/* Category Subtotal Projected GB/d */}
                        <td className="py-2 px-3 text-right font-mono font-bold text-zinc-800 bg-zinc-100">
                          {catProjGb.toFixed(2)}
                        </td>

                        {/* Category Subtotal Indexed GB/d */}
                        <td className="py-2 px-3 text-right font-mono font-bold text-emerald-800 bg-emerald-100/60">
                          {catIndexedGb.toFixed(2)}
                        </td>

                        {customColumns.map((col) => (
                          <td key={col.id} className="py-2 px-3"></td>
                        ))}

                        {/* Category Quick Actions */}
                        <td className="py-2 px-3 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              id={`btn-add-ds-to-${category.toLowerCase().replace(/[^a-z0-9]/g, '-')}`}
                              onClick={() => onAddDataSource(category)}
                              title={`Add new data source into ${category}`}
                              className="p-1 text-zinc-500 hover:text-emerald-600 hover:bg-emerald-50 rounded transition"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => onBulkUpdateCategory(category, { pct_indexed: 100 })}
                              title="Set all in this category to 100% indexed"
                              className="p-1 text-zinc-400 hover:text-emerald-600 hover:bg-emerald-50 rounded transition"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>

                      {/* Items rows inside category */}
                      {!isCollapsed &&
                        items.map((item, index) => {
                          const projGb = calculateItemProjectedGbDay(item);
                          const indGb = calculateItemCurrentIndexedGbDay(item);
                          const isHealthy = Number(item.pct_indexed) >= 80;
                          const isWarning = Number(item.pct_indexed) < 80 && Number(item.pct_indexed) >= thresholdPct;
                          const isLow = Number(item.pct_indexed) < thresholdPct;
                          const hasItems = Number(item.total_items) > 0;

                          return (
                            <tr
                              key={item.id}
                              className={`border-b border-zinc-100 hover:bg-emerald-50/20 transition ${
                                hasItems ? 'bg-white font-normal' : 'bg-zinc-50/40 text-zinc-500'
                              }`}
                            >
                              {/* Row index */}
                              <td className="py-2 px-3 text-center text-zinc-400 text-[11px] font-mono">
                                {index + 1}
                              </td>

                              {/* Data Source Name */}
                              <td className="py-2 px-3 font-medium text-zinc-800">
                                {item.isCustom ? (
                                  <input
                                    type="text"
                                    value={item.name}
                                    onChange={(e) => onUpdateDataSource(item.id, { name: e.target.value })}
                                    className="w-full text-xs font-semibold text-zinc-900 bg-white border border-zinc-300 rounded px-1.5 py-0.5 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                                  />
                                ) : (
                                  <div className="flex items-center gap-1.5">
                                    <span className="hover:text-emerald-700 cursor-default">{item.name}</span>
                                    {hasItems && isLow && (
                                      <span
                                        className="h-1.5 w-1.5 rounded-full bg-rose-500 inline-block"
                                        title={`Below threshold (${thresholdPct}%)`}
                                      />
                                    )}
                                  </div>
                                )}
                              </td>

                              {/* Description / Examples */}
                              <td className="py-2 px-3 text-zinc-500 truncate max-w-[220px]" title={item.description_examples || ''}>
                                <input
                                  type="text"
                                  value={item.description_examples || ''}
                                  onChange={(e) => onUpdateDataSource(item.id, { description_examples: e.target.value })}
                                  placeholder="e.g. logs, vendor, sourcetype..."
                                  className="w-full bg-transparent hover:bg-zinc-100/70 focus:bg-white text-zinc-500 focus:text-zinc-800 px-1 py-0.5 rounded border border-transparent focus:border-zinc-300 text-xs focus:outline-none"
                                />
                              </td>

                              {/* Total Items (Editable) */}
                              <td className="py-1 px-3 text-right bg-emerald-50/20">
                                <input
                                  id={`input-items-${item.id}`}
                                  type="number"
                                  min="0"
                                  step="1"
                                  value={item.total_items === 0 ? '' : item.total_items}
                                  placeholder="0"
                                  onPaste={(e) => handlePasteColumn(e, item, 'total_items')}
                                  onChange={(e) => {
                                    const val = e.target.value === '' ? 0 : parseInt(e.target.value, 10);
                                    onUpdateDataSource(item.id, { total_items: isNaN(val) ? 0 : Math.max(0, val) });
                                  }}
                                  className="w-20 text-right font-mono text-xs px-1.5 py-1 rounded bg-zinc-50/80 border border-zinc-200 focus:bg-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:outline-none font-semibold text-zinc-900"
                                />
                              </td>

                              {/* % Indexed (Editable) */}
                              <td className="py-1 px-3 text-right bg-emerald-50/20">
                                <div className="flex items-center justify-end gap-1">
                                  <input
                                    id={`input-pct-${item.id}`}
                                    type="number"
                                    min="0"
                                    max="100"
                                    step="5"
                                    value={item.pct_indexed}
                                    onPaste={(e) => handlePasteColumn(e, item, 'pct_indexed')}
                                    onChange={(e) => {
                                      const val = parseFloat(e.target.value);
                                      onUpdateDataSource(item.id, {
                                        pct_indexed: isNaN(val) ? 0 : Math.max(0, Math.min(100, val)),
                                      });
                                    }}
                                    className={`w-14 text-right font-mono text-xs px-1 py-1 rounded border focus:outline-none focus:ring-1 focus:ring-emerald-500 ${
                                      isHealthy
                                        ? 'bg-emerald-50/60 border-emerald-300 text-emerald-800 font-bold'
                                        : isWarning
                                        ? 'bg-amber-50/60 border-amber-300 text-amber-800'
                                        : 'bg-zinc-50 border-zinc-200 text-zinc-700'
                                    }`}
                                  />
                                  <span className="text-zinc-400 font-mono text-[11px]">%</span>
                                </div>
                              </td>

                              {/* Est. MB / Day per Item (Editable) */}
                              <td className="py-1 px-3 text-right">
                                <input
                                  id={`input-mb-${item.id}`}
                                  type="number"
                                  min="0"
                                  step="5"
                                  value={item.est_log_size_mb_per_day}
                                  onPaste={(e) => handlePasteColumn(e, item, 'est_log_size_mb_per_day')}
                                  onChange={(e) => {
                                    const val = parseFloat(e.target.value);
                                    onUpdateDataSource(item.id, {
                                      est_log_size_mb_per_day: isNaN(val) ? 0 : Math.max(0, val),
                                    });
                                  }}
                                  className="w-16 text-right font-mono text-xs px-1.5 py-1 rounded bg-zinc-50 border border-zinc-200 focus:bg-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:outline-none text-zinc-700"
                                />
                              </td>

                              {/* Multiplier (Editable) */}
                              <td className="py-1 px-3 text-right">
                                <input
                                  id={`input-mult-${item.id}`}
                                  type="number"
                                  min="0.1"
                                  max="10"
                                  step="0.1"
                                  value={item.multiplier || 1.0}
                                  onChange={(e) => {
                                    const val = parseFloat(e.target.value);
                                    onUpdateDataSource(item.id, {
                                      multiplier: isNaN(val) ? 1.0 : Math.max(0.1, val),
                                    });
                                  }}
                                  className="w-12 text-right font-mono text-xs px-1 py-1 rounded bg-zinc-50 border border-zinc-200 focus:bg-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:outline-none text-zinc-600"
                                />
                              </td>

                              {/* Projected GB / Day (Calculated) */}
                              <td className="py-2 px-3 text-right font-mono font-medium text-zinc-800 bg-zinc-50/60">
                                {projGb > 0 ? projGb.toFixed(2) : <span className="text-zinc-300">0.00</span>}
                              </td>

                              {/* Current Indexed GB / Day (Calculated) */}
                              <td className="py-2 px-3 text-right font-mono font-bold text-emerald-700 bg-emerald-50/40">
                                {indGb > 0 ? indGb.toFixed(2) : <span className="text-zinc-300">0.00</span>}
                              </td>

                              {/* Custom columns */}
                              {customColumns.map((col) => {
                                const val = item.custom_fields?.[col.id] ?? col.defaultValue ?? '';
                                return (
                                  <td key={col.id} className="py-1 px-3">
                                    {col.type === 'select' ? (
                                      <select
                                        value={val}
                                        onChange={(e) =>
                                          onUpdateDataSource(item.id, {
                                            custom_fields: { ...item.custom_fields, [col.id]: e.target.value },
                                          })
                                        }
                                        className="text-xs bg-zinc-50 border border-zinc-200 rounded px-1.5 py-1 w-full focus:outline-none focus:ring-1 focus:ring-emerald-500"
                                      >
                                        <option value="">--</option>
                                        {col.options?.map((opt) => (
                                          <option key={opt} value={opt}>
                                            {opt}
                                          </option>
                                        ))}
                                      </select>
                                    ) : (
                                      <input
                                        type={col.type === 'number' || col.type === 'percentage' ? 'number' : 'text'}
                                        value={val}
                                        onChange={(e) =>
                                          onUpdateDataSource(item.id, {
                                            custom_fields: { ...item.custom_fields, [col.id]: e.target.value },
                                          })
                                        }
                                        placeholder="—"
                                        className="w-full text-xs px-1.5 py-1 rounded bg-zinc-50 border border-zinc-200 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                                      />
                                    )}
                                  </td>
                                );
                              })}

                              {/* Actions */}
                              <td className="py-1 px-3 text-center">
                                <button
                                  id={`btn-delete-${item.id}`}
                                  onClick={() => onDeleteDataSource(item.id)}
                                  title="Delete this data source"
                                  className="p-1 text-zinc-300 hover:text-rose-600 hover:bg-rose-50 rounded transition"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                    </React.Fragment>
                  );
                })
              )}
            </tbody>

            {/* Grand Total Footer */}
            <tfoot className="bg-zinc-900 text-white font-bold border-t-2 border-zinc-800 sticky bottom-0 z-20 shadow-md">
              <tr>
                <td className="py-3 px-3 text-center text-emerald-400 font-mono">Σ</td>
                <td colSpan={2} className="py-3 px-3">
                  <div className="flex items-center gap-2">
                    <span className="text-sm tracking-wide">GRAND TOTAL (ENVIRONMENT INGEST)</span>
                    <span className="text-xs px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 font-normal">
                      {grandTotals.activeSourcesCount} active / {grandTotals.totalConfiguredSourcesCount} sources
                    </span>
                  </div>
                </td>
                <td className="py-3 px-3 text-right font-mono text-emerald-300 text-sm">
                  {grandTotals.totalItemsCount.toLocaleString()}
                </td>
                <td className="py-3 px-3 text-right font-mono text-emerald-300 text-sm">
                  {grandTotals.overallPctIndexed.toFixed(1)}%
                </td>
                <td colSpan={2} className="py-3 px-3 text-right text-xs text-zinc-400 font-normal">
                  Weighted Ingest Rollup
                </td>
                <td className="py-3 px-3 text-right font-mono text-white text-sm">
                  {grandTotals.totalProjectedGbDay.toFixed(2)}
                </td>
                <td className="py-3 px-3 text-right font-mono text-emerald-400 text-sm">
                  {grandTotals.currentIndexedGbDay.toFixed(2)}
                </td>
                {customColumns.map((col) => (
                  <td key={col.id} className="py-3 px-3"></td>
                ))}
                <td className="py-3 px-3 text-center"></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
};
