export interface SplQueryTemplate {
  id: string;
  title: string;
  category: string;
  description: string;
  query: string;
  notes: string;
}

export const SPL_TEMPLATES: SplQueryTemplate[] = [
  {
    id: "license_usage_by_sourcetype",
    title: "Daily License Usage (GB) by Sourcetype",
    category: "License & Sizing",
    description: "Calculates actual indexed volume per sourcetype over the last 30 days to validate customer estimates.",
    query: `index=_internal source=*license_usage.log type="Usage"
| eval GB = b / 1024 / 1024 / 1024
| stats sum(GB) as DailyGB by st, date_mday, date_month
| stats avg(DailyGB) as AvgDailyGB, max(DailyGB) as PeakDailyGB by st
| eval AvgDailyGB = round(AvgDailyGB, 2), PeakDailyGB = round(PeakDailyGB, 2)
| sort - AvgDailyGB`,
    notes: "Run in the Search & Reporting app with TimeRange = Last 30 days."
  },
  {
    id: "license_usage_by_index_host",
    title: "License Usage Breakdown by Index and Host",
    category: "License & Sizing",
    description: "Reveals data distribution by storage index and reporting forwarder/host.",
    query: `index=_internal source=*license_usage.log type="Usage"
| bin _time span=1d
| stats sum(b) as bytes by _time, idx, h
| eval GB = round(bytes/1024/1024/1024, 3)
| chart sum(GB) over idx by h`,
    notes: "Helps identify high-volume rogue hosts or chatty loggers."
  },
  {
    id: "active_eps_live",
    title: "Real-time Live EPS (Events Per Second) Estimator",
    category: "EPS & Performance",
    description: "Measures actual live event ingestion rate across indexers in 1-minute sampling buckets.",
    query: `| tstats count where index=* by _time span=1m
| eval EPS = round(count / 60, 0)
| timechart avg(EPS) as AvgEPS, max(EPS) as PeakEPS`,
    notes: "Requires fast tstats permissions. Run over last 24 hours."
  },
  {
    id: "cim_data_model_acceleration_audit",
    title: "CIM Data Model Acceleration & Volume Audit",
    category: "Security ES",
    description: "Checks which CIM data models are accelerated and their TSIDX size in Enterprise Security.",
    query: `| rest /services/admin/summarization by_subpath=true
| search id="*DM_*"
| eval size_MB = round('summary.size'/1024/1024, 2), complete_pct = round('summary.complete'*100, 1)
| table title, "summary.earliest_time", "summary.latest_time", complete_pct, size_MB, "summary.is_inprogress"
| rename title as DataModel, complete_pct as "Complete %", size_MB as "TSIDX Size (MB)"`,
    notes: "Essential before deploying Enterprise Security correlation searches."
  },
  {
    id: "sourcetype_host_inventory",
    title: "Host Count Inventory per Sourcetype",
    category: "Inventory & Discovery",
    description: "Counts the number of distinct hosts feeding into each sourcetype (for comparison with Total Items in DSA).",
    query: `| metadata type=sourcetypes index=*
| eval count_hosts = totalCount
| table sourcetype, totalCount, firstTime, lastTime
| convert ctime(firstTime) ctime(lastTime)
| sort - totalCount`,
    notes: "Matches the 'Total Items' count in the DSA sizing grid."
  }
];

export function generateCustomSplunkInventoryScript(dataSources: { name: string; category: string }[]): string {
  return `\`\`\`
  Splunk DSA Automated Inventory Script
  Generated for assessment reconciliation
\`\`\`
| tstats count distinct(host) as HostCount where index=* by sourcetype, index
| eval EstDailyEvents = round(count / 30, 0)
| sort - count`;
}
