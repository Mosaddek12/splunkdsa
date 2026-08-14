export interface IndustryTemplate {
  id: string;
  name: string;
  badge: string;
  description: string;
  estimated_range: string;
  itemOverrides: Record<string, { total_items: number; pct_indexed?: number }>;
  maturityOverrides: Record<string, string>; // capability substring / key -> status
}

export const INDUSTRY_TEMPLATES: IndustryTemplate[] = [
  {
    id: "fintech_banking",
    name: "Financial Services & Banking",
    badge: "PCI-DSS / Tier 1 SOC",
    description: "High volume transaction logs, strict compliance requirements, large firewall/proxy footprint, and advanced fraud detection.",
    estimated_range: "800 - 2,500 GB/day",
    itemOverrides: {
      "Windows Servers (physical and virtual)": { total_items: 650, pct_indexed: 90 },
      "Linux / Unix Servers (physical and virtual)": { total_items: 1200, pct_indexed: 95 },
      "Firewalls (and NextGen Firewalls)": { total_items: 45, pct_indexed: 100 },
      "Active Directories; Domain Controlers": { total_items: 24, pct_indexed: 100 },
      "Database Instances": { total_items: 180, pct_indexed: 80 },
      "EDR (Endpoint Detection & Response)": { total_items: 4500, pct_indexed: 90 },
      "User Authentication (Single Sign-On (SSO) / PAM / IAM)": { total_items: 12, pct_indexed: 100 },
      "Customer fraud logs": { total_items: 4, pct_indexed: 85 },
      "IaaS": { total_items: 25, pct_indexed: 75 },
      "Proxy Systems (Web Proxies)": { total_items: 16, pct_indexed: 90 },
      "Key Transaction Activity Logs": { total_items: 30, pct_indexed: 85 },
      "WAF (Web Application Firewall)": { total_items: 12, pct_indexed: 90 },
    },
    maturityOverrides: {
      "centralized visibility": "fully_in_place",
      "data retention": "fully_in_place",
      "general compliance reporting": "fully_in_place",
      "fraud detection": "partially_in_place",
      "alerting": "fully_in_place",
      "risk based alerting": "almost_there",
      "threat intelligence": "partially_in_place"
    }
  },
  {
    id: "healthcare",
    name: "Healthcare & Life Sciences",
    badge: "HIPAA / HITRUST",
    description: "Electronic medical records (EMR/EHR), biomedical devices, workstation security, and patient data audit logging.",
    estimated_range: "400 - 1,200 GB/day",
    itemOverrides: {
      "Electronic Medical Record System": { total_items: 8, pct_indexed: 80 },
      "Desktops / Workstations": { total_items: 3200, pct_indexed: 75 },
      "Windows Servers (physical and virtual)": { total_items: 380, pct_indexed: 85 },
      "Active Directories; Domain Controlers": { total_items: 16, pct_indexed: 90 },
      "Email Servers / Email Gateways": { total_items: 6, pct_indexed: 100 },
      "Firewalls (and NextGen Firewalls)": { total_items: 22, pct_indexed: 90 },
      "VPNs": { total_items: 10, pct_indexed: 100 },
      "EDR (Endpoint Detection & Response)": { total_items: 3400, pct_indexed: 80 },
      "Physical Card Readers": { total_items: 120, pct_indexed: 70 },
      "Data Loss/Leakage Prevention (DLP)": { total_items: 8, pct_indexed: 60 }
    },
    maturityOverrides: {
      "data processing reporting": "fully_in_place",
      "general compliance reporting": "fully_in_place",
      "single user interface": "partially_in_place",
      "incident collaboration": "almost_there"
    }
  },
  {
    id: "cloud_saas",
    name: "Cloud-Native / SaaS Tech",
    badge: "DevSecOps / AWS & K8s",
    description: "Cloud IaaS/PaaS, Kubernetes, CI/CD pipelines, modern SSO, and containerized microservices.",
    estimated_range: "500 - 1,800 GB/day",
    itemOverrides: {
      "IaaS": { total_items: 40, pct_indexed: 100 },
      "PaaS": { total_items: 60, pct_indexed: 95 },
      "SSO (Users)": { total_items: 1500, pct_indexed: 100 },
      "Office (Users)": { total_items: 1500, pct_indexed: 100 },
      "Build Systems": { total_items: 20, pct_indexed: 80 },
      "Automated Configuration and Deployment tools": { total_items: 15, pct_indexed: 85 },
      "Web Servers": { total_items: 80, pct_indexed: 90 },
      "APM (Application Performance Monitoring)": { total_items: 12, pct_indexed: 80 },
      "EDR (Endpoint Detection & Response)": { total_items: 1600, pct_indexed: 95 },
      "WAF (Web Application Firewall)": { total_items: 8, pct_indexed: 100 },
    },
    maturityOverrides: {
      "cloud visibility": "fully_in_place",
      "devops visibility": "almost_there",
      "modular automation library": "partially_in_place",
      "advanced detection using machine learning": "partially_in_place"
    }
  },
  {
    id: "manufacturing_ot",
    name: "Manufacturing & Critical OT/ICS",
    badge: "IEC 62443 / IT-OT SOC",
    description: "SCADA systems, historians, industrial firewalls, physical security, and MES manufacturing execution logs.",
    estimated_range: "350 - 900 GB/day",
    itemOverrides: {
      "ICS Logs": { total_items: 14, pct_indexed: 70 },
      "OT Specific Firewall": { total_items: 18, pct_indexed: 85 },
      "Historian Access Logs": { total_items: 6, pct_indexed: 90 },
      "MES/ERP Logs": { total_items: 8, pct_indexed: 75 },
      "OT Security Solutions": { total_items: 10, pct_indexed: 80 },
      "SCADA Security Solution": { total_items: 8, pct_indexed: 75 },
      "Windows Servers (physical and virtual)": { total_items: 220, pct_indexed: 80 },
      "Firewalls (and NextGen Firewalls)": { total_items: 25, pct_indexed: 95 },
      "Physical Card Readers": { total_items: 85, pct_indexed: 90 },
    },
    maturityOverrides: {
      "ot / ics visibility": "almost_there",
      "protect machine data at rest and in-flight": "fully_in_place",
      "identified standard operating procedures": "partially_in_place"
    }
  }
];
