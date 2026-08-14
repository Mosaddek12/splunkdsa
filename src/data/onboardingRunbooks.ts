export interface OnboardingRunbook {
  category: string;
  sourcePattern: string;
  spl_ta_name: string;
  sourcetype: string;
  index: string;
  sample_inputs_conf: string;
  validation_query: string;
  best_practices: string[];
}

export const ONBOARDING_RUNBOOKS: Record<string, OnboardingRunbook> = {
  "Windows Servers (physical and virtual)": {
    category: "Server",
    sourcePattern: "Windows",
    spl_ta_name: "Splunk Add-on for Microsoft Windows (Splunk_TA_windows)",
    sourcetype: "WinEventLog:Security, WinEventLog:System, XmlWinEventLog:Microsoft-Windows-Sysmon/Operational",
    index: "wineventlog / os",
    sample_inputs_conf: `[WinEventLog://Security]
disabled = 0
start_from = newest
current_only = 0
evt_resolve_ad_obj = 1
checkpointInterval = 5
renderXml = true
index = wineventlog

[WinEventLog://Microsoft-Windows-Sysmon/Operational]
disabled = 0
renderXml = true
index = sysmon`,
    validation_query: `index=wineventlog (sourcetype="WinEventLog:Security" OR sourcetype="XmlWinEventLog:*") | stats count by EventCode, ComputerName, sourcetype | sort - count`,
    best_practices: [
      "Use renderXml = true on universal forwarders for 40% higher parsing throughput.",
      "Deploy Sysmon with SwiftOnSecurity or Olaf Hartong Modular configuration to capture process GUIDs and command lines.",
      "Whitelist noisy benign event codes (e.g. EventCode 4662/5158) at the forwarder via blacklist."
    ]
  },
  "Firewalls (and NextGen Firewalls)": {
    category: "Network",
    sourcePattern: "Firewall",
    spl_ta_name: "Splunk Add-on for Palo Alto Networks (Splunk_TA_paloalto) / Cisco ASA / Fortinet FortiGate",
    sourcetype: "pan:traffic, pan:threat, cisco:asa, fortigate_log",
    index: "netfw / network",
    sample_inputs_conf: `[tcp://514]
connection_host = dns
sourcetype = pan:traffic
index = netfw

# Or preferably via Splunk Connect for Syslog (SC4S):
# sc4s env config: SC4S_LISTEN_PAN_TRAFFIC_TCP_PORT=514`,
    validation_query: `index=netfw tag=network tag=communicate | stats sum(bytes) as TotalBytes, count by src, dest, transport, action | eval TotalMB=round(TotalBytes/1024/1024,2)`,
    best_practices: [
      "Use SC4S (Splunk Connect for Syslog) in front of indexers for automatic load balancing and standard parsing.",
      "Enable accelerated Network_Traffic CIM data model for sub-second ES correlation searches.",
      "Filter out repetitive noisy deny rules at Edge Processor or forwarder layer."
    ]
  },
  "Active Directories; Domain Controlers": {
    category: "End-User",
    sourcePattern: "Active Directory",
    spl_ta_name: "Splunk Add-on for Microsoft Active Directory (Splunk_TA_microsoft_ad)",
    sourcetype: "ActiveDirectory, MSAD:NT6:Netlogon",
    index: "msad / auth",
    sample_inputs_conf: `[admon://default]
disabled = 0
targetDc = primary-dc.corp.local
index = msad

[WinEventLog://Security]
whitelist = 4720,4722,4724,4728,4732,4756,4768,4769,4771,4776
index = msad`,
    validation_query: `index=msad EventCode IN (4720,4724,4768,4769,4771) | stats count by EventCode, user, src_ip | head 100`,
    best_practices: [
      "Ensure Kerberos encryption type is logged to surface Kerberoasting (Ticket Encryption 0x17).",
      "Correlate failed logins (4771 pre-auth failure) for pass-the-hash and password spray detection."
    ]
  },
  "EDR (Endpoint Detection & Response)": {
    category: "Security Systems",
    sourcePattern: "EDR",
    spl_ta_name: "CrowdStrike Falcon Event Streams (TA-crowdstrike-falcon-event-streams) / Microsoft Defender Add-on",
    sourcetype: "CrowdStrike:Event:SimpleStream, ms:defender:alerts",
    index: "edr / alerts",
    sample_inputs_conf: `[crowdstrike_falcon_event_stream://US-1]
client_id = <ENCRYPTED_ID>
client_secret = <ENCRYPTED_SECRET>
cloud = api.crowdstrike.com
index = edr`,
    validation_query: `index=edr (sourcetype="CrowdStrike*" OR sourcetype="ms:defender*") | stats count by ComputerName, event_simpleName, severity`,
    best_practices: [
      "Configure OAuth client credentials via Splunk Secret Storage.",
      "Map custom EDR events directly to Endpoint CIM models (Processes, Filesystem, Registry) for ES use cases."
    ]
  },
  "IaaS": {
    category: "Cloud",
    sourcePattern: "Cloud IaaS",
    spl_ta_name: "Splunk Add-on for Amazon Web Services (Splunk_TA_aws) / Google Cloud Platform / Azure",
    sourcetype: "aws:cloudtrail, google:gcp:pubsub:message, azure:monitor:aad",
    index: "cloud / aws / azure",
    sample_inputs_conf: `[aws_sqs_based_s3://cloudtrail_events]
account = production_aws
queue_name = splunk-cloudtrail-queue
sourcetype = aws:cloudtrail
index = cloud`,
    validation_query: `index=cloud sourcetype="aws:cloudtrail" eventName IN ("CreateUser", "AttachUserPolicy", "AuthorizeSecurityGroupIngress") | table _time, userIdentity.arn, eventName, requestParameters*`,
    best_practices: [
      "Use SQS-based S3 inputs for scalable and lossless CloudTrail delivery.",
      "Enable multi-region CloudTrail and AWS Config for continuous compliance tracking."
    ]
  }
};
