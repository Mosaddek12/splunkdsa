export type UrgencyLevel = 1 | 2 | 3 | 4;

export type ActiveView =
  | 'sizing_dashboard'
  | 'sizing_grid'
  | 'maturity'
  | 'recommendations'
  | 'content_explorer';

export type MaturityStatus =
  | 'not_needed'
  | 'choose_one'
  | 'not_in_place'
  | 'just_getting_started'
  | 'partially_in_place'
  | 'almost_there'
  | 'fully_in_place';

export interface CustomFieldDefinition {
  id: string;
  name: string;
  type: 'text' | 'number' | 'percentage' | 'select';
  options?: string[]; // for select
  defaultValue?: string | number;
}

export interface DataSourceItem {
  id: string;
  category: string;
  name: string;
  description_examples: string | null;
  default_mb_per_day: number;
  est_log_size_mb_per_day: number;
  total_items: number;
  pct_indexed: number;
  multiplier: number; // default 1.0
  notes?: string;
  custom_fields?: Record<string, any>;
  isCustom?: boolean;
}

export interface CapabilityItem {
  id: string;
  stage: 'Ingest' | 'Monitor' | 'Analyze & Investigate' | 'Act';
  group: string;
  capability: string;
  description: string;
  status: MaturityStatus;
  urgency_level: UrgencyLevel; // 1 = Immediate, 2 = <9mo, 3 = <18mo, 4 = <27mo
  notes?: string;
}

export interface EpsCalcConfig {
  min_bytes: number;
  max_bytes: number;
  pct_min: number; // 0.0 - 1.0
  custom_gb_per_day?: number;
  custom_eps?: number;
}

export interface ProjectMetadata {
  id?: string;
  customer_name: string;
  project_name?: string;
  opportunity_id?: string;
  owner_name?: string;
  owner_email?: string;
  industry?: string;
  target_date?: string;
  notes?: string;
  buffer_pct: number; // default 20%
  threshold_min_indexed_pct?: number; // default 20%
  retention_days_hot?: number;
  retention_days_cold?: number;
  created_at: string;
  updated_at: string;
}

export interface ProjectSnapshot {
  id: string;
  name: string;
  timestamp: string;
  description?: string;
  data_sources: DataSourceItem[];
  maturity: CapabilityItem[];
  buffer_pct: number;
  total_projected_gb_day?: number;
  current_indexed_gb_day?: number;
  maturity_score_pct?: number;
}

export interface Project {
  id?: string;
  metadata: ProjectMetadata;
  data_sources: DataSourceItem[];
  custom_columns: CustomFieldDefinition[];
  maturity: CapabilityItem[];
  eps_config: EpsCalcConfig;
  snapshots: ProjectSnapshot[];
  pricing_config?: {
    cloud_gb_rate: number;
    svc_rate: number;
    retention_days: number;
  };
}

export interface DetectionRule {
  id: string;
  title: string;
  description: string;
  category: string;
  cim_data_model: string;
  data_types: string[];
  required_sources: string[]; // e.g. ["Firewalls", "Windows Servers", "EDR"]
  mitre_tactic: string;
  mitre_technique_id: string;
  mitre_technique_name: string;
  confidence: 'High' | 'Medium' | 'Low';
  security_domain: 'Endpoint' | 'Network' | 'Cloud' | 'Identity' | 'Application' | 'Threat';
}

export interface CategorySummary {
  category: string;
  total_items: number;
  active_items: number;
  total_projected_gb_day: number;
  current_indexed_gb_day: number;
  weighted_pct_indexed: number;
  is_complete: boolean;
}

export interface MaturityGroupSummary {
  group: string;
  stage: string;
  total_capabilities: number;
  scored_capabilities: number;
  average_score: number;
  maturity_pct: number;
}

export interface MaturityStageSummary {
  stage: string;
  total_capabilities: number;
  scored_capabilities: number;
  average_score: number;
  maturity_pct: number;
  status_counts: Record<MaturityStatus, number>;
}
