# 🧠 Nurospace — The OS for Autonomous Work

Welcome to Nurospace, your **ultimate AI workspace** where intelligence meets execution. Nurospace is designed to be your second brain — capable of thinking, planning, and acting — built for individuals, teams, and power users who want more from AI.

---

## 🚀 Vision

> **"What if your AI could remember, plan, and act — like a real teammate?"**

Nurospace is not just a chat interface — it's an **agent-powered execution platform**. From uploading research papers to scheduling investor emails, it bridges the gap between intelligent reasoning and real-world action.

---

## 🧩 Key Features

### ✅ Basic RAG Model
- Upload **PDFs**, **URLs**, **YouTube videos**, or any resource
- Get contextual responses using advanced Retrieval-Augmented Generation
- Support for multiple LLMs (OpenAI, Anthropic, Claude, etc.)

### 🤖 Multi-Agent Architecture
- **Parent Agent** intelligently splits queries into:
  - `Basic LLM Agent`: Handles general reasoning and generation
  - `RAG Agent`: Pulls from uploaded context/resources
  - `Tools Agent`: Executes actions (email, scheduling, reminders)

### 🔄 Prompt-Based Automation
- Automate tasks with natural language:
  > "Write a mail to bikram@bikram.com about the research paper and send it tomorrow at 10am"

### 📂 Workspaces + Long Context Memory
- Each user has **subdomain access**: `bikram.nurospace.com`
- Unlimited **spaces/projects** to manage different workflows
- Long-context memory engine (>10M tokens) using vector DBs

### 🧠 AI Personalities
- Choose from curated agent personalities (e.g., Lawyer, Researcher, PM)
- Or create your own with personality configuration files

### 🔧 Developer Mode (Like n8n)
- Drag & connect **nodes** to create custom automation pipelines
- Dev-focused agent scripting with variables, logic, and tools

### 💻 Platform Roadmap
- ✅ Web App (MVP)
- 🧩 Browser Extension (coming soon)
- 🖥️ Desktop App (Electron-based)
- 📱 Mobile App (React Native)
- 🛍️ Agent & Tools Marketplace

---

## 🏗️ MVP Roadmap (Now in Progress)

- [x] RAG engine: PDF, link, video ingest
- [x] Agent routing logic
- [x] Prompt → Action via Tools agent
- [x] Google-like search + source attribution (like Perplexity)
- [ ] Reminder & scheduling system
- [ ] AI memory (long-term recall)

---

## 🔧 Tech Stack

| Layer          | Tech                            |
|---------------|----------------------------------|
| Frontend       | React, TanStack Router, Tailwind |
| Backend        | NestJS (microservices)          |
| AI/LLM         | OpenAI, Claude, Custom APIs     |
| Vector DB      | Qdrant / Weaviate               |
| Database       | PostgreSQL + Redis              |
| Queueing       | BullMQ / Redis Streams          |
| File Handling  | S3-compatible storage            |
| Auth & Subdomain | Middleware + Custom Tenant Resolver |

---

## 🤝 Get Involved

We’re looking for:
- 🧪 **Beta testers**
- 🤝 **Partners & integrators**
- 🧠 **Agent & tool creators**

Join us as we build the OS for autonomous work.  
Contact: [hi@nurospace.com](mailto:hi@nurospace.com)

---

## 📄 License

MIT © Nurospace 2025

