import { DataSourceItem } from '../types';

const rawDataSources = [
  {
    category: "Cloud",
    name: "IaaS",
    description_examples: "AWS; Azure; GCP; Any Other Cloud Platforms IaaS logs",
    default_mb_per_day: 250,
    total_items_default: 0,
    pct_indexed_default: 100
  },
  {
    category: "Cloud",
    name: "PaaS",
    description_examples: "AWS; Azure; GCP; Any Other Cloud Platforms PaaS logs",
    default_mb_per_day: 150,
    total_items_default: 0,
    pct_indexed_default: 100
  },
  {
    category: "Cloud",
    name: "SaaS (Users)",
    description_examples: "Cloud Services like O365; Web Conferencing etc.",
    default_mb_per_day: 150,
    total_items_default: 0,
    pct_indexed_default: 100
  },
  {
    category: "Cloud",
    name: "Office (Users)",
    description_examples: "MS Office 365; G-Suite",
    default_mb_per_day: 5,
    total_items_default: 0,
    pct_indexed_default: 100
  },
  {
    category: "Cloud",
    name: "CRM (Users)",
    description_examples: "Salesforce; HubSpot; Zendesk",
    default_mb_per_day: 5,
    total_items_default: 0,
    pct_indexed_default: 100
  },
  {
    category: "Cloud",
    name: "SSO (Users)",
    description_examples: "Okta; Microsoft Entra ID; Ping",
    default_mb_per_day: 5,
    total_items_default: 0,
    pct_indexed_default: 100
  },
  {
    category: "Cloud",
    name: "Web Conferencing (Users)",
    description_examples: "Zoom; Slack; MS Teams; Webex",
    default_mb_per_day: 5,
    total_items_default: 0,
    pct_indexed_default: 100
  },
  {
    category: "Cloud",
    name: "File Sharing (Users)",
    description_examples: "Box; Dropbox; Gdrive; Sharepoint",
    default_mb_per_day: 5,
    total_items_default: 0,
    pct_indexed_default: 100
  },
  {
    category: "Server",
    name: "Windows Servers (physical and virtual)",
    description_examples: "perfmon; event logs; snare; antivirus; patch logs; etc",
    default_mb_per_day: 150,
    total_items_default: 0,
    pct_indexed_default: 100
  },
  {
    category: "Server",
    name: "Windows Servers - Non Prod (Dev; Test; etc)",
    description_examples: "perfmon; event logs; snare; antivirus; patch logs; etc",
    default_mb_per_day: 150,
    total_items_default: 0,
    pct_indexed_default: 100
  },
  {
    category: "Server",
    name: "Linux / Unix Servers (physical and virtual)",
    description_examples: "syslog; top; iostat; netstat; securelog; snare; antivirus; sar; patch logs",
    default_mb_per_day: 150,
    total_items_default: 0,
    pct_indexed_default: 100
  },
  {
    category: "Server",
    name: "Linux / Unix Servers - Non Prod (Dev; Test; etc)",
    description_examples: "syslog; top; iostat; netstat; securelog; snare; antivirus; sar; patch logs",
    default_mb_per_day: 150,
    total_items_default: 0,
    pct_indexed_default: 100
  },
  {
    category: "Server",
    name: "Virtual Infrastructure Servers (Hypervisor)",
    description_examples: "VMWare ESX servers; vCenter servers; HyperV",
    default_mb_per_day: 50,
    total_items_default: 0,
    pct_indexed_default: 100
  },
  {
    category: "Storage",
    name: "Storage Arrays with High IOPS",
    description_examples: "Logs from SAN; NAS; EMC VNX; NetApp Data ONTAP; Pure Storage",
    default_mb_per_day: 250,
    total_items_default: 0,
    pct_indexed_default: 100
  },
  {
    category: "Storage",
    name: "Storage Arrays with Moderate/Low IOPS",
    description_examples: "Logs from SAN; NAS; EMC VNX; NetApp Data ONTAP; etc.",
    default_mb_per_day: 150,
    total_items_default: 0,
    pct_indexed_default: 100
  },
  {
    category: "Storage",
    name: "SAN Switches",
    description_examples: "Brocade; Cisco MDS SAN Fabric switches",
    default_mb_per_day: 50,
    total_items_default: 0,
    pct_indexed_default: 100
  },
  {
    category: "Storage",
    name: "Storage Arrays - Non-Production",
    description_examples: "Dev/Test SAN storage volumes",
    default_mb_per_day: 150,
    total_items_default: 0,
    pct_indexed_default: 100
  },
  {
    category: "Storage",
    name: "Backup Systems",
    description_examples: "Veeam; Commvault; Cohesity; Rubrik; Tape Backup",
    default_mb_per_day: 50,
    total_items_default: 0,
    pct_indexed_default: 100
  },
  {
    category: "Network",
    name: "Switches",
    description_examples: "Ethernet and virtual switch logs; netflow data; Cisco Catalyst; Arista",
    default_mb_per_day: 150,
    total_items_default: 0,
    pct_indexed_default: 100
  },
  {
    category: "Network",
    name: "Routers",
    description_examples: "cisco_cdr; cisco:asa; cisco_syslog; clavister; netflow; Juniper",
    default_mb_per_day: 250,
    total_items_default: 0,
    pct_indexed_default: 100
  },
  {
    category: "Network",
    name: "Firewalls (and NextGen Firewalls)",
    description_examples: "Palo Alto Networks; Cisco ASA/FTD; Check Point; Fortinet FortiGate",
    default_mb_per_day: 1000,
    total_items_default: 0,
    pct_indexed_default: 100
  },
  {
    category: "Network",
    name: "DDoS Protection",
    description_examples: "Akamai; Arbor; Netscout; Cloudflare; A10 Networks; Corero",
    default_mb_per_day: 150,
    total_items_default: 0,
    pct_indexed_default: 100
  },
  {
    category: "Network",
    name: "VPNs",
    description_examples: "Citrix Gateway; Cisco AnyConnect; Palo Alto GlobalProtect; Pulse Secure",
    default_mb_per_day: 250,
    total_items_default: 0,
    pct_indexed_default: 100
  },
  {
    category: "Network",
    name: "Proxy Systems (Web Proxies)",
    "description_examples": "Bluecoat Proxy; Zscaler; Fortinet; Netscreen; McAfee Web Gateway",
    default_mb_per_day: 250,
    total_items_default: 0,
    pct_indexed_default: 100
  },
  {
    category: "Network",
    name: "Network Access Control (NAC)",
    description_examples: "Aruba ClearPass; Cisco ACS; Cisco ISE; Forescout",
    default_mb_per_day: 250,
    total_items_default: 0,
    pct_indexed_default: 100
  },
  {
    category: "Network",
    name: "Wireless Access Points",
    description_examples: "Cisco Meraki; Aruba; Ruckus; Ubiquiti",
    default_mb_per_day: 50,
    total_items_default: 0,
    pct_indexed_default: 100
  },
  {
    category: "Network",
    name: "LDAP Directory Services",
    description_examples: "OpenLDAP; 389 Directory Server; Apache Directory",
    default_mb_per_day: 250,
    total_items_default: 0,
    pct_indexed_default: 100
  },
  {
    category: "Network",
    name: "FTP Servers",
    description_examples: "vsftpd; ProFTPD; FileZilla Server; SFTP gateways",
    default_mb_per_day: 250,
    total_items_default: 0,
    pct_indexed_default: 100
  },
  {
    category: "Network",
    name: "DNS",
    description_examples: "Splunk Stream; BIND; PowerDNS; Unbound; Dnsmasq; Infoblox",
    default_mb_per_day: 150,
    total_items_default: 0,
    pct_indexed_default: 100
  },
  {
    category: "Network",
    name: "SNMP systems",
    description_examples: "LogicMonitor; ManageEngine; Spiceworks; Ruckus Idera",
    default_mb_per_day: 100,
    total_items_default: 0,
    pct_indexed_default: 100
  },
  {
    category: "Network",
    name: "Deep Packet Inspection systems",
    description_examples: "Splunk Stream; PCAP; Zeek (Bro); Suricata",
    default_mb_per_day: 100,
    total_items_default: 0,
    pct_indexed_default: 100
  },
  {
    category: "Network",
    name: "DHCP",
    description_examples: "DHCP Insight; Linux DHCP; Infoblox; Windows DHCP",
    default_mb_per_day: 100,
    total_items_default: 0,
    pct_indexed_default: 100
  },
  {
    category: "Network",
    name: "Loadbalancer",
    description_examples: "Citrix NetScaler; F5 Big-IP; NGINX Plus; HAProxy; AWS ALB",
    default_mb_per_day: 100,
    total_items_default: 0,
    pct_indexed_default: 100
  },
  {
    category: "Database",
    name: "Database Instances",
    description_examples: "Oracle; SQL/Server; MySQL; PostgreSQL; MongoDB; RDBMS audit logs",
    default_mb_per_day: 150,
    total_items_default: 0,
    pct_indexed_default: 100
  },
  {
    category: "Database",
    name: "Database Instances - Non-Production (Dev; Test; etc)",
    description_examples: "Oracle; SQL/Server; MySQL; RDBMS logs in non-prod",
    default_mb_per_day: 50,
    total_items_default: 0,
    pct_indexed_default: 100
  },
  {
    category: "Application",
    name: "Web Servers",
    description_examples: "Apache; IIS; NGINX; Node.js; debug & access logs",
    default_mb_per_day: 250,
    total_items_default: 0,
    pct_indexed_default: 100
  },
  {
    category: "Application",
    name: "Application Servers",
    description_examples: "J2EE; .NET; Tomcat; WebSphere; WebLogic; Spring Boot; debug logs",
    default_mb_per_day: 250,
    total_items_default: 0,
    pct_indexed_default: 100
  },
  {
    category: "Application",
    name: "Middleware Services",
    description_examples: "Kafka; RabbitMQ; JSON; SOAP; MSMQ; TIBCO; SonicMQ; Software AG",
    default_mb_per_day: 250,
    total_items_default: 0,
    pct_indexed_default: 100
  },
  {
    category: "Application",
    name: "Key Transaction Activity Logs",
    description_examples: "Payment gateway status; batch uploads; order processing; ledger logs",
    default_mb_per_day: 250,
    total_items_default: 0,
    pct_indexed_default: 100
  },
  {
    category: "Application",
    name: "Mobile Devices - Running Apps",
    description_examples: "iOS/Android app raw telemetry; crash logs; API calls; Splunk MINT",
    default_mb_per_day: 5,
    total_items_default: 0,
    pct_indexed_default: 100
  },
  {
    category: "Application",
    name: "Splunk Forwarders; Indexers; Search Heads",
    description_examples: "audit.log; btool.log; conf.log; crash.log; metrics.log; search.log; splunkd.log",
    default_mb_per_day: 100,
    total_items_default: 0,
    pct_indexed_default: 100
  },
  {
    category: "Application",
    name: "APM (Application Performance Monitoring)",
    description_examples: "Splunk APM; Dynatrace; New Relic; AppDynamics; Datadog",
    default_mb_per_day: 100,
    total_items_default: 0,
    pct_indexed_default: 100
  },
  {
    category: "Application",
    name: "Print Servers",
    description_examples: "Windows Print spooler logs; CUPS print audit",
    default_mb_per_day: 100,
    total_items_default: 0,
    pct_indexed_default: 100
  },
  {
    category: "Application",
    name: "SAP",
    description_examples: "SAP NetWeaver; SAP S/4HANA; SAP Security Audit Log",
    default_mb_per_day: 250,
    total_items_default: 0,
    pct_indexed_default: 100
  },
  {
    category: "End-User",
    name: "Desktops / Workstations",
    description_examples: "MS Windows 10/11; macOS; Linux endpoints; Sysmon; patch data",
    default_mb_per_day: 10,
    total_items_default: 0,
    pct_indexed_default: 100
  },
  {
    category: "End-User",
    name: "User Authentication (Single Sign-On (SSO) / PAM / IAM)",
    description_examples: "Identity Management logs; CyberArk; Delinea; Okta; Ping Identity; SailPoint",
    default_mb_per_day: 250,
    total_items_default: 0,
    pct_indexed_default: 100
  },
  {
    category: "End-User",
    name: "Active Directories; Domain Controlers",
    description_examples: "Microsoft Active Directory; Entra Connect; Kerberos authentication logs",
    default_mb_per_day: 250,
    total_items_default: 0,
    pct_indexed_default: 100
  },
  {
    category: "End-User",
    name: "Email Servers / Email Gateways",
    description_examples: "MS Exchange; Proofpoint; Mimecast; IronPort; Zimbra; Google Workspace",
    default_mb_per_day: 250,
    total_items_default: 0,
    pct_indexed_default: 100
  },
  {
    category: "End-User",
    name: "Telephone System",
    description_examples: "PBX call detail records; ShoreTel; Twilio; Cisco Unified Communications Mgr",
    default_mb_per_day: 250,
    total_items_default: 0,
    pct_indexed_default: 100
  },
  {
    category: "End-User",
    name: "VoIP System",
    description_examples: "Asterisk CDR; SIP session records; FreePBX events",
    default_mb_per_day: 200,
    total_items_default: 0,
    pct_indexed_default: 100
  },
  {
    category: "End-User",
    name: "User Experience Monitoring",
    description_examples: "Splunk RUM; Nexthink; Lakeside SysTrack; Aternity",
    default_mb_per_day: 200,
    total_items_default: 0,
    pct_indexed_default: 100
  },
  {
    category: "End-User",
    name: "Social Media Feeds",
    description_examples: "Brand sentiment; API feeds from Twitter/X, LinkedIn, Facebook",
    default_mb_per_day: 150,
    total_items_default: 0,
    pct_indexed_default: 100
  },
  {
    category: "End-User",
    name: "Electronic Medical Record System",
    description_examples: "Epic Systems; Cerner; Allscripts; MEDITECH audit access logs",
    default_mb_per_day: 150,
    total_items_default: 0,
    pct_indexed_default: 100
  },
  {
    category: "Testers & Developers",
    name: "Web Servers - Non-Production",
    description_examples: "Dev/Staging Apache; IIS; NGINX logs",
    default_mb_per_day: 150,
    total_items_default: 0,
    pct_indexed_default: 100
  },
  {
    category: "Testers & Developers",
    name: "Application Servers - Non-Production",
    description_examples: "Dev/Test Tomcat; J2EE; Node.js logs",
    default_mb_per_day: 150,
    total_items_default: 0,
    pct_indexed_default: 100
  },
  {
    category: "Testers & Developers",
    name: "Middleware Services - Non-Production",
    description_examples: "Dev Kafka; RabbitMQ; Mock APIs",
    default_mb_per_day: 150,
    total_items_default: 0,
    pct_indexed_default: 100
  },
  {
    category: "Testers & Developers",
    name: "QA Test Run Systems",
    description_examples: "SonarQube; Tox; PyTest; Selenium; Cypress; Jest logs",
    default_mb_per_day: 250,
    total_items_default: 0,
    pct_indexed_default: 100
  },
  {
    category: "Testers & Developers",
    name: "Automated Configuration and Deployment tools",
    description_examples: "Puppet; Jira; GitHub; GitLab; Chef; Docker; Ansible Tower; Terraform",
    default_mb_per_day: 100,
    total_items_default: 0,
    pct_indexed_default: 100
  },
  {
    category: "Testers & Developers",
    name: "Build Systems",
    description_examples: "Jenkins; Bamboo; GitHub Actions; Travis CI; TeamCity; CircleCI",
    default_mb_per_day: 250,
    total_items_default: 0,
    pct_indexed_default: 100
  },
  {
    category: "Security Systems",
    name: "Vulnerability Management (VM)",
    description_examples: "Tenable Nessus; Qualys VMDR; Rapid7 Nexpose; Tripwire IP360",
    default_mb_per_day: 150,
    total_items_default: 0,
    pct_indexed_default: 100
  },
  {
    category: "Security Systems",
    name: "Penetration Test Systems/Services",
    description_examples: "Metasploit Pro; Cobalt Strike; Burp Suite audit logs",
    default_mb_per_day: 150,
    total_items_default: 0,
    pct_indexed_default: 100
  },
  {
    category: "Security Systems",
    name: "Network and Security Traffic Analysis",
    description_examples: "NetFlow; IPFIX; sFlow; Corelight; Zeek sensor telemetry",
    default_mb_per_day: 250,
    total_items_default: 0,
    pct_indexed_default: 100
  },
  {
    category: "Security Systems",
    name: "Intrusion Prevention/Detection Systems (IPS/IDS)",
    description_examples: "Snort; Suricata; Cisco Firepower; Trend Micro TippingPoint; Palo Alto IPS",
    default_mb_per_day: 150,
    total_items_default: 0,
    pct_indexed_default: 100
  },
  {
    category: "Security Systems",
    name: "Threat Intelligence Feeds",
    description_examples: "Anomali ThreatStream; CrowdStrike Falcon Intel; Recorded Future; MISP",
    default_mb_per_day: 50,
    total_items_default: 0,
    pct_indexed_default: 100
  },
  {
    category: "Security Systems",
    name: "Automated Malware Anaylsis (Sandbox)",
    description_examples: "Cisco AMP; FireEye; Check Point SandBlast; Cuckoo; Joe Sandbox",
    default_mb_per_day: 150,
    total_items_default: 0,
    pct_indexed_default: 100
  },
  {
    category: "Security Systems",
    name: "Source Code Vulnerability Analysis Systems",
    description_examples: "Checkmarx; Veracode; Snyk; Fortify; GitHub Advanced Security",
    default_mb_per_day: 150,
    total_items_default: 0,
    pct_indexed_default: 100
  },
  {
    category: "Security Systems",
    name: "Physical Card Readers",
    description_examples: "HID Global; Lenel OnGuard; Software House C-CURE; Honeywell access control",
    default_mb_per_day: 25,
    total_items_default: 0,
    pct_indexed_default: 100
  },
  {
    category: "Security Systems",
    name: "Block-, Allow-, Watch-Lists",
    description_examples: "Dynamic block lists; prohibited processes, malicious hash repositories",
    default_mb_per_day: 1,
    total_items_default: 0,
    pct_indexed_default: 100
  },
  {
    category: "Security Systems",
    name: "User Behavior Analytics (UBA) Systems",
    description_examples: "Splunk UBA; Exabeam; Securonix",
    default_mb_per_day: 150,
    total_items_default: 0,
    pct_indexed_default: 100
  },
  {
    category: "Security Systems",
    name: "Asset & Identity Lists (from CMDB, AD, LDAP, GRC etc.)",
    description_examples: "ServiceNow CMDB; Active Directory dumps; Archer GRC; Axonius",
    default_mb_per_day: 25,
    total_items_default: 0,
    pct_indexed_default: 100
  },
  {
    category: "Security Systems",
    name: "Data Loss/Leakage Prevention (DLP)",
    description_examples: "Symantec DLP; Microsoft Purview DLP; Forcepoint; Digital Guardian",
    default_mb_per_day: 50,
    total_items_default: 0,
    pct_indexed_default: 100
  },
  {
    category: "Security Systems",
    name: "EDR (Endpoint Detection & Response)",
    description_examples: "CrowdStrike Falcon; Microsoft Defender for Endpoint; SentinelOne; Tanium; Carbon Black",
    default_mb_per_day: 20,
    total_items_default: 0,
    pct_indexed_default: 100
  },
  {
    category: "Security Systems",
    name: "NDR (Network Detection & Response)",
    description_examples: "Vectra AI; Darktrace; ExtraHop Reveal(x); Corelight",
    default_mb_per_day: 150,
    total_items_default: 0,
    pct_indexed_default: 100
  },
  {
    category: "Security Systems",
    name: "WAF (Web Application Firewall)",
    description_examples: "Cloudflare WAF; AWS WAF; Imperva; F5 Advanced WAF; Akamai Kona",
    default_mb_per_day: 250,
    total_items_default: 0,
    pct_indexed_default: 100
  },
  {
    category: "Fraud",
    name: "Customer fraud logs",
    description_examples: "Account takeover telemetry; credit card check patterns; velocity checks",
    default_mb_per_day: 500,
    total_items_default: 0,
    pct_indexed_default: 100
  },
  {
    category: "OT/ICS Specific Systems",
    name: "ICS Logs",
    description_examples: "Honeywell Experion; Wonderware; OASyS DNA; ClearSCADA; Ignition SCADA",
    default_mb_per_day: 150,
    total_items_default: 0,
    pct_indexed_default: 100
  },
  {
    category: "OT/ICS Specific Systems",
    name: "OT Specific Firewall",
    description_examples: "Tofino Security; Hirschmann; Fortinet Ruggedized; Check Point Rugged",
    default_mb_per_day: 150,
    total_items_default: 0,
    pct_indexed_default: 100
  },
  {
    category: "OT/ICS Specific Systems",
    name: "Historian Access Logs",
    description_examples: "OSIsoft PI System; Wonderware Historian; GE Proficy Historian",
    default_mb_per_day: 250,
    total_items_default: 0,
    pct_indexed_default: 100
  },
  {
    category: "OT/ICS Specific Systems",
    name: "MES/ERP Logs",
    description_examples: "GE Proficy; Rockwell FactoryTalk; SAP EAM; Infor LN",
    default_mb_per_day: 150,
    total_items_default: 0,
    pct_indexed_default: 100
  },
  {
    category: "OT/ICS Specific Systems",
    name: "Asset Management",
    description_examples: "IBM Maximo; Infor EAM; SAP Plant Maintenance",
    default_mb_per_day: 50,
    total_items_default: 0,
    pct_indexed_default: 100
  },
  {
    category: "OT/ICS Specific Systems",
    name: "OT Security Solutions",
    description_examples: "Dragos Platform; Nozomi Networks Guardian; Claroty xDome; Armis",
    default_mb_per_day: 150,
    total_items_default: 0,
    pct_indexed_default: 100
  },
  {
    category: "OT/ICS Specific Systems",
    name: "Server Management Platforms",
    description_examples: "HPE iLO; Dell iDRAC; Cisco IMC; Supermicro IPMI",
    default_mb_per_day: 20,
    total_items_default: 0,
    pct_indexed_default: 100
  },
  {
    category: "OT/ICS Specific Systems",
    name: "Screen Sharing Software",
    description_examples: "VNC; DameWare; TeamViewer; AnyDesk remote maintenance",
    default_mb_per_day: 25,
    total_items_default: 0,
    pct_indexed_default: 100
  },
  {
    category: "OT/ICS Specific Systems",
    name: "Secure File Transfer Logs",
    description_examples: "SFTP; Honeywell Next9 secure gateway; FTPS audit",
    default_mb_per_day: 1,
    total_items_default: 0,
    pct_indexed_default: 100
  },
  {
    category: "OT/ICS Specific Systems",
    name: "SCADA Security Solution",
    description_examples: "Industrial Defender; Schneider StruxureWare; Siemens PCS7 Security",
    default_mb_per_day: 150,
    total_items_default: 0,
    pct_indexed_default: 100
  },
  {
    category: "Business Services - Order Mgmt",
    name: "Business service transaction logs",
    description_examples: "Oracle Apps logs; SAP data logs; SalesForce; ERP order processing",
    default_mb_per_day: 100,
    total_items_default: 0,
    pct_indexed_default: 100
  },
  {
    category: "Business Services - Order Mgmt",
    name: "Business service performance and APM logs",
    description_examples: "Dynatrace; New Relic; AppDynamics; Splunk ITSI order service health",
    default_mb_per_day: 100,
    total_items_default: 0,
    pct_indexed_default: 100
  },
  {
    category: "Business Services - Order Mgmt",
    name: "Batch logs",
    description_examples: "Batch upload status logs; overnight sync reconciliations",
    default_mb_per_day: 25,
    total_items_default: 0,
    pct_indexed_default: 100
  },
  {
    category: "Business Services - Order Mgmt",
    name: "Large transaction log for e-commerce",
    description_examples: "High volume shopping cart & checkout pipeline logs",
    default_mb_per_day: 1000,
    total_items_default: 0,
    pct_indexed_default: 100
  },
  {
    category: "Business Services - Order Mgmt",
    name: "Point of sale systems",
    description_examples: "Lightspeed; NCR; Revel Systems; Square; Toshiba; Vend POS terminals",
    default_mb_per_day: 25,
    total_items_default: 0,
    pct_indexed_default: 100
  },
  {
    category: "Business Services - Billing & Invoicing",
    name: "Business service transaction logs",
    description_examples: "Billing run logs; Stripe/Zuora billing API feeds; SAP FI/CO",
    default_mb_per_day: 100,
    total_items_default: 0,
    pct_indexed_default: 100
  },
  {
    category: "Business Services - Billing & Invoicing",
    name: "Business service performance and APM logs",
    description_examples: "Billing latency APM; invoice gateway errors",
    default_mb_per_day: 100,
    total_items_default: 0,
    pct_indexed_default: 100
  },
  {
    category: "Business Services - Billing & Invoicing",
    name: "Batch logs",
    description_examples: "Invoice generation batch runs; accounting reconciliation",
    default_mb_per_day: 25,
    total_items_default: 0,
    pct_indexed_default: 100
  },
  {
    category: "Business Services - Customer Service",
    name: "Business service transaction logs",
    description_examples: "Zendesk; ServiceNow CSM; Salesforce Service Cloud ticket actions",
    default_mb_per_day: 100,
    total_items_default: 0,
    pct_indexed_default: 100
  },
  {
    category: "Business Services - Customer Service",
    name: "Business service performance and APM logs",
    description_examples: "Contact center SLA performance telemetry",
    default_mb_per_day: 100,
    total_items_default: 0,
    pct_indexed_default: 100
  },
  {
    category: "Business Services - Customer Service",
    name: "Batch logs",
    description_examples: "Customer survey batch imports; ticket archival jobs",
    default_mb_per_day: 25,
    total_items_default: 0,
    pct_indexed_default: 100
  },
  {
    category: "Business Services - Procurement",
    name: "Business service transaction logs",
    description_examples: "Coupa; SAP Ariba; Workday Procurement vendor requests",
    default_mb_per_day: 100,
    total_items_default: 0,
    pct_indexed_default: 100
  },
  {
    category: "Business Services - Procurement",
    name: "Business service performance and APM logs",
    description_examples: "Purchase order approval latency and backend sync",
    default_mb_per_day: 100,
    total_items_default: 0,
    pct_indexed_default: 100
  },
  {
    category: "Business Services - Procurement",
    name: "Batch logs",
    description_examples: "Vendor catalog pricing feed updates",
    default_mb_per_day: 25,
    total_items_default: 0,
    pct_indexed_default: 100
  },
  {
    category: "Business Services - Product Delivery",
    name: "Business service transaction logs",
    description_examples: "Supply chain fulfillment, warehouse dispatch, tracking updates",
    default_mb_per_day: 100,
    total_items_default: 0,
    pct_indexed_default: 100
  },
  {
    category: "Business Services - Product Delivery",
    name: "Business service performance and APM logs",
    description_examples: "Logistics routing engine APM and queue metrics",
    default_mb_per_day: 100,
    total_items_default: 0,
    pct_indexed_default: 100
  },
  {
    category: "Business Services - Product Delivery",
    name: "Batch logs",
    description_examples: "Delivery manifest generation batch logs",
    default_mb_per_day: 25,
    total_items_default: 0,
    pct_indexed_default: 100
  }
];

export function getInitialDataSources(): DataSourceItem[] {
  return rawDataSources.map((item, idx) => ({
    id: `ds-${idx + 1}-${item.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
    category: item.category,
    name: item.name,
    description_examples: item.description_examples,
    default_mb_per_day: item.default_mb_per_day,
    est_log_size_mb_per_day: item.default_mb_per_day,
    total_items: item.total_items_default,
    pct_indexed: item.pct_indexed_default,
    multiplier: 1.0,
    notes: '',
    custom_fields: {},
  }));
}

export const SEED_DATA_SOURCES = getInitialDataSources();

