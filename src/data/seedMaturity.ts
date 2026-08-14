import { CapabilityItem, MaturityStatus, UrgencyLevel } from '../types';

const rawMaturityCapabilities: Array<{
  stage: 'Ingest' | 'Monitor' | 'Analyze & Investigate' | 'Act';
  group: string;
  capability: string;
  description: string;
  status_default: string;
  urgency_level_default: number;
}> = [
  {
    stage: "Ingest",
    group: "Data Availability / Retention",
    capability: "Centralized Visibility for Essential Security Data",
    description: "\"Bread & Butter\" data source types for IT-Security use cases are onboarded",
    status_default: "not_in_place",
    urgency_level_default: 1
  },
  {
    stage: "Ingest",
    group: "Data Availability / Retention",
    capability: "Data Retention",
    description: "Data retained in an easily accessible storage mechanism",
    status_default: "not_in_place",
    urgency_level_default: 1
  },
  {
    stage: "Ingest",
    group: "Data Availability / Retention",
    capability: "Cloud Visibility",
    description: "Public Cloud Services data (e.g. AWS/GCP/Azure) integrated alongside traditional on-prem sources",
    status_default: "not_in_place",
    urgency_level_default: 1
  },
  {
    stage: "Ingest",
    group: "Data Availability / Retention",
    capability: "Protect Machine Data At Rest and In-Flight",
    description: "Integrity of data ensured in transmission and at storage time",
    status_default: "not_in_place",
    urgency_level_default: 1
  },
  {
    stage: "Ingest",
    group: "Data Availability / Retention",
    capability: "OT / ICS Visibility",
    description: "Ingestion of Operations Technology (OT) and Industrial Control Systems (ICS) data sources for an IT/OT SOC convergence",
    status_default: "not_in_place",
    urgency_level_default: 1
  },
  {
    stage: "Ingest",
    group: "Data Availability / Retention",
    capability: "DevOps Visibility for DevSecOps practices",
    description: "Create visibility for the entire SW development Lifecycle in order to secure it and its outcomes (DevSecOps)",
    status_default: "not_in_place",
    urgency_level_default: 1
  },
  {
    stage: "Ingest",
    group: "Normalization",
    capability: "Data Normalization",
    description: "Log data normalized and ready for correlation (CIM compliance)",
    status_default: "not_in_place",
    urgency_level_default: 1
  },
  {
    stage: "Ingest",
    group: "Enrichment",
    capability: "Asset and Identity Data Integrated",
    description: "Normalized asset and identity data centralized for search and enrichment",
    status_default: "not_in_place",
    urgency_level_default: 1
  },
  {
    stage: "Ingest",
    group: "Enrichment",
    capability: "Threat Intelligence (TI)",
    description: "External TI combined with internally generated TI to correlate with events and enable threat hunting",
    status_default: "not_in_place",
    urgency_level_default: 1
  },
  {
    stage: "Ingest",
    group: "Enrichment",
    capability: "Alert Enrichment",
    description: "Information is automatically gathered from external tools, enriching incident handling",
    status_default: "not_in_place",
    urgency_level_default: 1
  },
  {
    stage: "Ingest",
    group: "Stream Processing",
    capability: "Transform and Take Action on Data in Motion",
    description: "Interact with, aggregate, enrich, transform data before they reach their final destination (Edge Processor / Ingest Actions)",
    status_default: "not_in_place",
    urgency_level_default: 1
  },
  {
    stage: "Ingest",
    group: "Stream Processing",
    capability: "Stream Analytics",
    description: "Analyze and accelerate reaction time with in-memory, millisecond speed processing",
    status_default: "not_in_place",
    urgency_level_default: 1
  },
  {
    stage: "Monitor",
    group: "Security Use Cases",
    capability: "Use of Pre-built Content",
    description: "Pre-built, out-of-the-box detections have been identified and deployed for alerting and threat hunting.",
    status_default: "not_in_place",
    urgency_level_default: 1
  },
  {
    stage: "Monitor",
    group: "Security Use Cases",
    capability: "Attack Simulation",
    description: "Simulate attacks in order to generate real attack data and integrate it seamlessly into use case CI/CD pipeline",
    status_default: "not_in_place",
    urgency_level_default: 1
  },
  {
    stage: "Monitor",
    group: "Security Posture Dashboards & Reports",
    capability: "Quick Access to Common Searches",
    description: "Common queries for given scenarios are codified so analysts need only to open a dashboard",
    status_default: "not_in_place",
    urgency_level_default: 1
  },
  {
    stage: "Monitor",
    group: "Security Posture Dashboards & Reports",
    capability: "Simple Dashboards",
    description: "Dashboards created that provide basic counts or aggregate data",
    status_default: "not_in_place",
    urgency_level_default: 1
  },
  {
    stage: "Monitor",
    group: "Security Posture Dashboards & Reports",
    capability: "Advanced Dashboarding",
    description: "Dashboards created with advanced analytics and enrichment, usually designed for specific users or teams",
    status_default: "not_in_place",
    urgency_level_default: 1
  },
  {
    stage: "Monitor",
    group: "Security Posture Dashboards & Reports",
    capability: "Management Reporting",
    description: "Managers have dashboards showing the operational metrics of the analyst's workload and response process",
    status_default: "not_in_place",
    urgency_level_default: 1
  },
  {
    stage: "Monitor",
    group: "Security Posture Dashboards & Reports",
    capability: "Risk Reporting",
    description: "Overall level of risk for the organization presented to managers, and influences ongoing event prioritization",
    status_default: "not_in_place",
    urgency_level_default: 1
  },
  {
    stage: "Monitor",
    group: "Alerting",
    capability: "Alerting",
    description: "Analysts notified of events proactively, rather than by checking dashboards",
    status_default: "not_in_place",
    urgency_level_default: 1
  },
  {
    stage: "Monitor",
    group: "Alerting",
    capability: "Single User Interface",
    description: "Security Analysts, Threat Hunters and Engineers have one place to view and work on notable events from multiple SIEM/Log Mngmnt. instances",
    status_default: "not_in_place",
    urgency_level_default: 1
  },
  {
    stage: "Monitor",
    group: "Alert Prioritization",
    capability: "Alert Prioritization",
    description: "Security events are automatically prioritized based on the impacted assets and identities",
    status_default: "not_in_place",
    urgency_level_default: 1
  },
  {
    stage: "Monitor",
    group: "Alert Prioritization",
    capability: "Risk Awareness",
    description: "Assets and identities prioritized by their overall level of risk across all activities",
    status_default: "not_in_place",
    urgency_level_default: 1
  },
  {
    stage: "Monitor",
    group: "Alert Prioritization",
    capability: "Track Progressive Attacks",
    description: "Sequences of events at multiple steps in an attack from the same entities create alerts",
    status_default: "not_in_place",
    urgency_level_default: 1
  },
  {
    stage: "Monitor",
    group: "Alert Prioritization",
    capability: "Risk Based Alerting",
    description: "Address alert fatigue via risk attributions (RBA) to increase alert fidelity and proactive detection",
    status_default: "not_in_place",
    urgency_level_default: 1
  },
  {
    stage: "Analyze & Investigate",
    group: "Incident Collaboration",
    capability: "Incident Collaboration",
    description: "Multiple users efficiently collaborate on the same alert / incident",
    status_default: "not_in_place",
    urgency_level_default: 1
  },
  {
    stage: "Analyze & Investigate",
    group: "Incident Collaboration",
    capability: "Centralized Incident Investigation",
    description: "Security Analysts can access and investigate all data via one system and one query language",
    status_default: "not_in_place",
    urgency_level_default: 1
  },
  {
    stage: "Analyze & Investigate",
    group: "Behaviour Analysis & ML",
    capability: "Advanced Detection using Machine Learning (ML)",
    description: "ML finds unexpected activities that the security team didn't know to anticipate",
    status_default: "not_in_place",
    urgency_level_default: 1
  },
  {
    stage: "Analyze & Investigate",
    group: "Behaviour Analysis & ML",
    capability: "Detection of Unknown Patterns or Risks",
    description: "Detections will look for unfamiliar actions, as opposed to just known bad activities",
    status_default: "not_in_place",
    urgency_level_default: 1
  },
  {
    stage: "Analyze & Investigate",
    group: "Behaviour Analysis & ML",
    capability: "Insider Threat Detection",
    description: "Behavioral analysis on Users and Entities (Endpoints, Apps, Protocols) to detect insider threats",
    status_default: "not_in_place",
    urgency_level_default: 1
  },
  {
    stage: "Analyze & Investigate",
    group: "Behaviour Analysis & ML",
    capability: "Generation of Custom ML Models",
    description: "Organizational-specific ML detection methods employed (DSDL / MLTK)",
    status_default: "not_in_place",
    urgency_level_default: 1
  },
  {
    stage: "Analyze & Investigate",
    group: "Compliance",
    capability: "General Compliance Reporting",
    description: "Compliance teams have reports mapping relevant data to required compliance standards and frameworks (PCI, HIPAA, SOC2, NIST)",
    status_default: "not_in_place",
    urgency_level_default: 1
  },
  {
    stage: "Analyze & Investigate",
    group: "Compliance",
    capability: "Data Processing Reporting",
    description: "Reports available for personal data processing including access, storage, and proper deletion of data (GDPR/CCPA)",
    status_default: "not_in_place",
    urgency_level_default: 1
  },
  {
    stage: "Analyze & Investigate",
    group: "Fraud",
    capability: "Fraud Detection",
    description: "Detect fraudulent activities like account takeovers, click speed / land speed violations, outliers etc.",
    status_default: "not_in_place",
    urgency_level_default: 1
  },
  {
    stage: "Analyze & Investigate",
    group: "Fraud",
    capability: "Integration",
    description: "Cross-functional tooling and user-visibility integrated to improve overall program in heterogeneous environments",
    status_default: "not_in_place",
    urgency_level_default: 1
  },
  {
    stage: "Analyze & Investigate",
    group: "Fraud",
    capability: "Machine Learning (ML) for Fraud",
    description: "ML used to cluster data and spot outliers in transaction pipelines",
    status_default: "not_in_place",
    urgency_level_default: 1
  },
  {
    stage: "Analyze & Investigate",
    group: "Threat Hunting",
    capability: "Detection of New Entities",
    description: "New combinations of user, host, website, DNS names etc. recorded and used for correlation and hunting",
    status_default: "not_in_place",
    urgency_level_default: 1
  },
  {
    stage: "Analyze & Investigate",
    group: "Threat Hunting",
    capability: "Detect New Activities",
    description: "Alerts created when users do things they've never done before",
    status_default: "not_in_place",
    urgency_level_default: 1
  },
  {
    stage: "Analyze & Investigate",
    group: "Threat Hunting",
    capability: "Leverage Data Science Models for Threat Hunting",
    description: "Leveraging Machine Learning Models to detect yet unknown patterns for indicators of compromise",
    status_default: "not_in_place",
    urgency_level_default: 1
  },
  {
    stage: "Analyze & Investigate",
    group: "Forensics",
    capability: "Integrated Forensic Data Analysis",
    description: "Data from traditional 3rd party forensics tools integrated into investigation workflows",
    status_default: "not_in_place",
    urgency_level_default: 1
  },
  {
    stage: "Act",
    group: "Orchestration and Automation",
    capability: "Identified Standard Operating Procedures (SOP)",
    description: "The organization has desired runbooks/playbooks to respond to security events",
    status_default: "not_in_place",
    urgency_level_default: 1
  },
  {
    stage: "Act",
    group: "Orchestration and Automation",
    capability: "Investigative Searches Run for Common Alerts are Automated",
    description: "Standard searches for well-understood alerts are automatically run",
    status_default: "not_in_place",
    urgency_level_default: 1
  },
  {
    stage: "Act",
    group: "Orchestration and Automation",
    capability: "Multiple Automated Actions Orchestrated",
    description: "Based on the output of earlier actions, additional actions can be taken (or avoided) via SOAR",
    status_default: "not_in_place",
    urgency_level_default: 1
  },
  {
    stage: "Act",
    group: "Orchestration and Automation",
    capability: "Integrations with Custom Tools",
    description: "Flexibility provided to integrate with custom software across investigation and remediation",
    status_default: "not_in_place",
    urgency_level_default: 1
  },
  {
    stage: "Act",
    group: "Orchestration and Automation",
    capability: "Modular automation library",
    description: "Actions, functions and playbooks are modular and can be reused",
    status_default: "not_in_place",
    urgency_level_default: 1
  },
  {
    stage: "Act",
    group: "Response",
    capability: "Integrated Workflows",
    description: "Analysts directed to other systems or other searches with simple clicks and without copy-paste",
    status_default: "not_in_place",
    urgency_level_default: 1
  },
  {
    stage: "Act",
    group: "Response",
    capability: "Breach Response",
    description: "Mean time to detect (MTTD), contain, and respond (MTTR) tracked and analyzed in the context of compliance requirements",
    status_default: "not_in_place",
    urgency_level_default: 1
  },
  {
    stage: "Act",
    group: "Response",
    capability: "Combined Human and Machine based decision making",
    description: "Ability to include the analyst into the loop with interactive prompts in SOAR playbooks",
    status_default: "not_in_place",
    urgency_level_default: 1
  },
  {
    stage: "Act",
    group: "Collaboration / Case Management",
    capability: "Case Management Workflow",
    description: "Events can be turned into incident cases for collaboration and evidentiary logging",
    status_default: "not_in_place",
    urgency_level_default: 1
  },
  {
    stage: "Act",
    group: "Collaboration / Case Management",
    capability: "Custom Case Templates",
    description: "Incident Case and Response workflow templates are deployed for ransomware, phishing, insider threat, etc.",
    status_default: "not_in_place",
    urgency_level_default: 1
  },
  {
    stage: "Act",
    group: "Collaboration / Case Management",
    capability: "Tickets Can Be Resolved Automatically",
    description: "After an automated investigation, remediation activities automatically completed and tickets closed",
    status_default: "not_in_place",
    urgency_level_default: 1
  }
];

export function getInitialMaturityCapabilities(): CapabilityItem[] {
  return rawMaturityCapabilities.map((item, idx) => {
    // Distribute default urgency levels realistically across stages/capabilities (1: Immediate, 2: <9mo, 3: <18mo, 4: <27mo)
    let urgency: UrgencyLevel = 1;
    if (idx % 4 === 1) urgency = 2;
    else if (idx % 4 === 2) urgency = 3;
    else if (idx % 4 === 3) urgency = 4;

    return {
      id: `cap-${idx + 1}-${item.capability.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
      stage: item.stage,
      group: item.group,
      capability: item.capability,
      description: item.description,
      status: 'not_in_place' as MaturityStatus,
      urgency_level: urgency,
      notes: '',
    };
  });
}

export const SEED_MATURITY_CAPABILITIES = getInitialMaturityCapabilities();

