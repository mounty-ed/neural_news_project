# Neuro News

An AI-driven news platform for social good that automates end-to-end journalism workflows using LangGraph, React, Firebase, and multiple AI models. Neuro News continuously discovers impactful topics, orchestrates multi-agent research and writing pipelines, and publishes verified articles to a real-time frontend. The platform is designed to combat misinformation, increase access to quality reporting, and amplify stories with societal impact.

---

## Table of Contents

* [Mission & Social Impact](#mission--social-impact)
* [Features](#features)
* [Architecture Overview](#architecture-overview)
* [Folder Structure](#folder-structure)
* [Setup & Installation](#setup--installation)

  * [Prerequisites](#prerequisites)
  * [Clone Repository](#clone-repository)
  * [Environment Configuration](#environment-configuration)
* [Running with Docker](#running-with-docker)
* [Running without Docker](#running-without-docker)

  * [LangGraph Workflow](#langgraph-workflow)
  * [Flask Backend](#flask-backend)
  * [Frontend](#frontend)
* [Data & Models](#data--models)
* [Daily Automation](#daily-automation)
* [License](#license)

---

## Mission & Social Impact

Neuro News is more than a tech demo—it's a tool for **responsible AI-driven journalism**. The project focuses on:

* **Fighting misinformation** by combining multiple AI agents with fact-checking and credible sources.
* **Promoting global awareness** of important but underreported issues.
* **Enabling local communities** to easily publish high-quality, verified news.

Although the mission is still a work in progress, Neuro News represents meaningful progress toward these goals.

---

## Features

* **Automated Topic Discovery**: Monitors news feeds and search to find high-impact, socially relevant stories.
* **Multi-Agent AI Workflow**: Orchestrated LangGraph agents perform outlining, research, and drafting.
* **Real-Time Publishing**: Next.js frontend with Firebase for instant updates.
* **Dockerized Deployment**: One-command startup for backend, frontend, and agents.
* **Modular & Extensible**: Swap AI models, data sources, and publishing destinations.

---

## Architecture Overview

### News Generation Workflow

![News Workflow](news_workflow.png)

### Article Generation Workflow 
(within article_generation of News Generation Workflow)

![Article Workflow](article_workflow.png)

---

## Folder Structure

```
.
├── Dockerfile                  # Root-level build config (optional)
├── docker-compose.yml          # Orchestrates multi-container setup
├── agents/                     # AI agent logic & workflows
├── back_end/                   # Flask API, routes, extensions
├── front_end/neural-news/      # Next.js frontend app
├── requirements.txt            # Backend dependencies
├── article_workflow.png        # Diagram
├── news_workflow.png           # Diagram
```

---

## Setup & Installation

### Prerequisites

* Python 3.10+
* Node.js 18+
* Docker & Docker Compose
* Firebase project with Firestore enabled
* Ollama with `qwen3:8b` model for local LangGraph testing

### Clone Repository

```bash
git clone https://github.com/mounty-ed/neural_news_project.git
cd neural_news_project
```

### Environment Configuration

Create a `.env` file in the root:

```ini
TAVILY_API_KEY=your-tavily-key
OPENROUTER_API_KEY=your-openrouter-key
NEXT_PUBLIC_API_URL=http://localhost:5000
```

Place your Firebase service account JSON in:

* `back_end/etc/secrets/firebase-service-account.json`
* `agents/firebase-service-account.json`

---

## Running Website with Docker

Spin up the entire stack:

```bash
docker-compose up --build
```

This starts:

* Flask backend (port 5000)
* Next.js frontend (port 3000)

---

## Running Website without Docker

### Flask Backend

Install backend dependencies:

```bash
pip install -r requirements.txt
```

Run the backend:

```bash
python -m back_end.app
```

### Frontend

```bash
cd front_end/neural-news
npm install
npm run dev
```

---

## Running Article Generation Logic

Install agent dependencies:

```bash
pip install -r agents/requirements.txt
```

Run the news agent:

```bash
python -m agents.news_agent
```


---

## Data & Models

* Local testing: Ollama `qwen3:8b`
* Cloud inference: OpenRouter API
* Models are swappable in `agents/*.py`

---

## License

MIT License. See `LICENSE` file for details.
