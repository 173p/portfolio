export const site = {
  name: "Abdulla",
  fullName: "Abdulla Alhamly",
  tagline: "Cloud and platform engineering",
  description: "Abdulla Alhamly: cloud and platform engineering. Projects, writing and contact.",
};

export const links = {
  github: { label: "173p", href: "https://github.com/173p" },
  linkedin: { label: "abdullah-alhamly", href: "https://www.linkedin.com/in/abdullah-alhamly/" },
  email: "abdulla_alhamly@hotmail.com",
};

export const about = {
  paragraphs: [
    "I'm a final-year Computer Science student at Imam Abdulrahman Bin Faisal University in Dammam, graduating June 2027.",
    "Most of what I build sits where infrastructure meets software: self-hosted services, monitoring and alerting, and tools that run on models I host myself. My home server runs on Proxmox and k3s, set up as code with Terraform and Ansible, and it's where my side projects live.",
    "I'm looking for cloud, platform and DevOps roles where I can keep building like that, as part of a team.",
  ],
  stack: [
    { label: "Infra", value: "Docker · k3s · Terraform · Ansible · AWS" },
    { label: "Observability", value: "Prometheus · Grafana · Loki" },
    { label: "Code", value: "Python · JavaScript · Java" },
    { label: "Languages", value: "Arabic · English" },
  ],
};

export type Project = { name: string; meta: string; description: string; href?: string };

export const projects: Project[] = [
  {
    name: "Observability Stack",
    meta: "Prometheus · Grafana",
    href: "https://github.com/173p/ai-incident-observability",
    description:
      "Replaced manual per-server health checks with one monitoring stack (Prometheus, Grafana, Loki, Promtail, Alertmanager) on AWS EC2, simulating a multi-server on-premise setup. A Flask service picks up each alert, has an LLM write an incident report with the likely root cause, and sends it to Telegram.",
  },
  {
    name: "Hudhud",
    meta: "Ollama · Docker",
    description:
      "Telegram bot that alerts you to new job postings. Add any company by pasting its careers page; when normal parsing fails, a model running on my home server pulls the listings out.",
  },
  {
    name: "Homelab",
    meta: "Proxmox · k3s",
    description:
      "My daily-use home server, rebuilt from scratch as code: Terraform, Ansible, Docker Compose stacks and a two-node k3s cluster.",
  },
  {
    name: "Thurayya Studio",
    meta: "Freelance",
    href: "https://thurayyastudio.com/",
    description: "Designed and built the landing site for an indie game studio, working directly with the client on their brand.",
  },
  {
    name: "Markd",
    meta: "Extension",
    href: "https://github.com/173p/markd",
    description:
      "Adds chapter markers to YouTube videos automatically, pulling timestamps from SponsorBlock, the description and top comments. Chrome and Firefox.",
  },
  {
    name: "X Blur Mode",
    meta: "Extension",
    href: "https://github.com/173p/X-Blur-Mode",
    description:
      "Keeps the person next to you, or whoever's watching your screen share, from snooping your timeline. Redacts handles, names, bios, avatars, media, DMs, trends and unread counts on X, can mask the address bar down to x.com, and blurs the whole page when you step away.",
  },
  {
    name: "Papers-Radar",
    meta: "React · Node",
    description: "Product Hunt style site that ranks trending arXiv papers, with weekly automated ingestion.",
  },
  {
    name: "ElevateAI",
    meta: "Streamlit",
    description: "Summarizes YouTube videos and articles and lets you chat with the content. Built with the IAU AI Club team.",
  },
  {
    name: "PIF Tracker",
    meta: "Weekend",
    href: "https://pif-tracker-five.vercel.app/",
    description: "Vibe coded over a weekend to keep tabs on PIF.",
  },
];
