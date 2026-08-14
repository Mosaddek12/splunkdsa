import * as XLSX from 'xlsx';
import { Project, DataSourceItem, CapabilityItem } from '../types';
import {
  calculateGrandTotals,
  calculateCategorySummaries,
  calculateItemProjectedGbDay,
  calculateItemCurrentIndexedGbDay,
  calculateMaturityRollups,
  calculateEpsFromGbDay
} from './calculations';

export function exportProjectToExcel(project: Project) {
  const wb = XLSX.utils.book_new();

  // Sheet 1: DSA - Data Sources
  const dsRows: any[] = [];
  dsRows.push([
    'Category',
    'Configured Item / Data Source',
    'Total Items (Count)',
    '% Indexed',
    'Est. Log Size (MB/day)',
    'Multiplier',
    'Total Projected Data/Day (GB)',
    'Current Total Indexed (GB)',
    'Notes / Description Examples'
  ]);

  project.data_sources.forEach(ds => {
    const projGb = calculateItemProjectedGbDay(ds);
    const indGb = calculateItemCurrentIndexedGbDay(ds);
    dsRows.push([
      ds.category,
      ds.name,
      Number(ds.total_items) || 0,
      `${Number(ds.pct_indexed) || 0}%`,
      Number(ds.est_log_size_mb_per_day) || 0,
      Number(ds.multiplier) || 1,
      Number(projGb.toFixed(3)),
      Number(indGb.toFixed(3)),
      ds.description_examples || ds.notes || ''
    ]);
  });

  const dsWs = XLSX.utils.aoa_to_sheet(dsRows);
  XLSX.utils.book_append_sheet(wb, dsWs, 'DSA - Data Sources');

  // Sheet 2: DSA - Summary
  const grandTotals = calculateGrandTotals(project.data_sources, project.metadata.buffer_pct);
  const catSummaries = calculateCategorySummaries(project.data_sources);
  const eps = calculateEpsFromGbDay(
    grandTotals.totalProjectedGbDay,
    project.eps_config.min_bytes,
    project.eps_config.max_bytes,
    project.eps_config.pct_min
  );

  const summaryRows: any[] = [
    ['SPLUNK DATA SOURCE ASSESSMENT - EXECUTIVE SUMMARY'],
    ['Customer Name:', project.metadata.customer_name],
    ['Owner / SE:', project.metadata.owner_name, 'Email:', project.metadata.owner_email],
    ['Industry:', project.metadata.industry, 'Assessment Date:', new Date(project.metadata.updated_at).toLocaleDateString()],
    [],
    ['KEY SIZING METRICS', 'VALUE'],
    ['Total Projected Data / Day (GB):', Number(grandTotals.totalProjectedGbDay.toFixed(2))],
    [`Total with ${project.metadata.buffer_pct}% Headroom Buffer (GB):`, Number(grandTotals.bufferedProjectedGbDay.toFixed(2))],
    ['Current Total Indexed (GB):', Number(grandTotals.currentIndexedGbDay.toFixed(2))],
    ['Overall Ingestion Completeness (%):', `${grandTotals.overallPctIndexed.toFixed(1)}%`],
    ['Total Environment Assets / Items:', grandTotals.totalItemsCount],
    ['Estimated Ingest EPS:', eps],
    [],
    ['CATEGORY ROLLUP SUMMARY'],
    ['Category', 'Total Items', 'Active Items', 'Projected (GB/day)', 'Indexed (GB/day)', '% Indexed']
  ];

  catSummaries.forEach(cat => {
    summaryRows.push([
      cat.category,
      cat.total_items,
      cat.active_items,
      Number(cat.total_projected_gb_day.toFixed(2)),
      Number(cat.current_indexed_gb_day.toFixed(2)),
      `${cat.weighted_pct_indexed.toFixed(1)}%`
    ]);
  });

  const summaryWs = XLSX.utils.aoa_to_sheet(summaryRows);
  XLSX.utils.book_append_sheet(wb, summaryWs, 'DSA - Summary');

  // Sheet 3: PVP - Capabilities
  const capRows: any[] = [
    ['Stage', 'Capability Group', 'Capability', 'Current Status', 'Urgency Level (1-4)', 'Description / Guidance', 'Notes']
  ];

  project.maturity.forEach(cap => {
    capRows.push([
      cap.stage,
      cap.group,
      cap.capability,
      cap.status,
      `Level ${cap.urgency_level}`,
      cap.description,
      cap.notes || ''
    ]);
  });

  const capWs = XLSX.utils.aoa_to_sheet(capRows);
  XLSX.utils.book_append_sheet(wb, capWs, 'PVP - Capabilities');

  // Sheet 4: PVP - Maturity Results
  const maturityRollups = calculateMaturityRollups(project.maturity);
  const maturityRows: any[] = [
    ['SECURITY OPERATIONS MATURITY SCORECARD'],
    ['Overall Maturity Level (%):', `${maturityRollups.overallMaturityPct}%`],
    [],
    ['LIFECYCLE STAGE ROLLUPS'],
    ['Stage', 'Total Capabilities', 'Scored Capabilities', 'Average Score (0.0-1.0)', 'Maturity %']
  ];

  maturityRollups.stageSummaries.forEach(st => {
    maturityRows.push([
      st.stage,
      st.total_capabilities,
      st.scored_capabilities,
      Number(st.average_score.toFixed(2)),
      `${st.maturity_pct}%`
    ]);
  });

  maturityRows.push([]);
  maturityRows.push(['CAPABILITY GROUP BREAKDOWN']);
  maturityRows.push(['Stage', 'Capability Group', 'Capabilities', 'Maturity %']);

  maturityRollups.groupSummaries.forEach(grp => {
    maturityRows.push([
      grp.stage,
      grp.group,
      grp.total_capabilities,
      `${grp.maturity_pct}%`
    ]);
  });

  const maturityWs = XLSX.utils.aoa_to_sheet(maturityRows);
  XLSX.utils.book_append_sheet(wb, maturityWs, 'PVP - Maturity Results');

  // Sheet 5: EPS Calc
  const epsRows: any[] = [
    ['EPS CALCULATOR CONFIGURATION & SIZING'],
    ['Min Event Size (Bytes):', project.eps_config.min_bytes],
    ['Max Event Size (Bytes):', project.eps_config.max_bytes],
    ['Min Event % Distribution:', `${Math.round(project.eps_config.pct_min * 100)}%`],
    ['Max Event % Distribution:', `${Math.round((1 - project.eps_config.pct_min) * 100)}%`],
    ['Projected GB/Day Input:', Number(grandTotals.totalProjectedGbDay.toFixed(2))],
    ['Calculated Output EPS:', eps]
  ];

  const epsWs = XLSX.utils.aoa_to_sheet(epsRows);
  XLSX.utils.book_append_sheet(wb, epsWs, 'EPS Calc');

  const fileName = `Splunk_DSA_${project.metadata.customer_name.replace(/[^a-zA-Z0-9_-]/g, '_')}_${new Date().toISOString().slice(0, 10)}.xlsx`;
  XLSX.writeFile(wb, fileName);
}

export function exportProjectToJson(project: Project) {
  const jsonStr = JSON.stringify(project, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `Splunk_DSA_Backup_${project.metadata.customer_name.replace(/[^a-zA-Z0-9_-]/g, '_')}_${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export function exportDataSourcesToCsv(dataSources: DataSourceItem[]) {
  const headers = ['Category', 'Name', 'Total_Items', 'Pct_Indexed', 'Est_MB_Per_Day', 'Multiplier', 'Projected_GB_Day', 'Indexed_GB_Day'];
  const rows = dataSources.map(d => [
    `"${d.category}"`,
    `"${d.name}"`,
    d.total_items,
    d.pct_indexed,
    d.est_log_size_mb_per_day,
    d.multiplier,
    calculateItemProjectedGbDay(d).toFixed(3),
    calculateItemCurrentIndexedGbDay(d).toFixed(3)
  ]);
  const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `Splunk_Data_Sources_${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}
