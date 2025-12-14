# Gream Bvddy 💀✨

**Gream Bvddy** is a personal AI research and knowledge assistant designed to run entirely in the browser. It combines real-time internet grounding, multi-mode intelligence, and a user-trainable local memory system to provide a highly customized information retrieval experience.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![React](https://img.shields.io/badge/React-18-61DAFB.svg?style=flat&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6.svg?style=flat&logo=typescript)
![Gemini](https://img.shields.io/badge/Gemini-2.5-8E75B2.svg?style=flat&logo=google)

---

## 📚 Table of Contents

- [Features](#-features)
- [System Architecture & Workflows](#-system-architecture--workflows)
- [Prerequisites](#-prerequisites)
- [Local Installation](#-local-installation)
- [Deployment Guides](#-deployment-guides)
  - [Vercel (Recommended)](#1-vercel-free--recommended)
  - [Netlify](#2-netlify-free)
  - [Replit](#3-replit-free-tier)
  - [Heroku](#4-heroku-paid)
- [Contact Developer](#-contact-developer)
- [Security Note](#-security-note)

---

## 🌟 Features

1.  **Multi-Mode Intelligence:**
    *   **Summary:** Bullet points and high-level overviews.
    *   **Explanation:** Simple analogies for beginners.
    *   **Detailed:** Deep technical breakdowns and step-by-step guides.
    *   **Popular:** Trending opinions and general consensus.
    *   **Hallucin/Imagine:** Speculative, creative generation engine.

2.  **Internet Grounding:**
    *   Uses Google Search tools to fetch real-time data for accurate responses (except in Hallucin mode).
    *   Displays sources with direct links.

3.  **Neural Memory (User-Trainable):**
    *   **Teach the AI:** Define custom triggers and responses.
    *   **Persistence:** Commands are stored in the browser's `localStorage`.
    *   **Priority:** Custom commands override AI generation for instant recall.

4.  **Privacy-First:**
    *   No backend server required.
    *   API Key is stored in your browser session.
    *   Memory data stays on your device.

---

## 🏗 System Architecture & Workflows

### Architecture
Gream Bvddy is a **Client-Side Single Page Application (SPA)**.
*   **Frontend:** React (Vite), Tailwind CSS.
*   **AI Layer:** Google GenAI SDK directly connects to Gemini API from the browser.
*   **Storage:** Browser `localStorage` for trained commands.

### User Interaction Workflow
1.  **Input:** User selects a mode (e.g., "Detailed") and types a query.
2.  **Memory Check:**
    *   The system scans `localStorage`.
    *   If the input matches a "Trained Command", the custom response is returned immediately (Zero latency).
3.  **AI Inference (If no memory match):**
    *   The request is sent to the Google Gemini API.
    *   If the mode requires facts, the `googleSearch` tool is triggered.
    *   System instructions format the output based on the selected mode.
4.  **Display:** The response is rendered with Markdown formatting and source citations.

### Training Workflow
1.  User types a command that yields a generic answer.
2.  User hovers over their message and clicks the **Edit/Train** icon.
3.  A modal opens to define:
    *   **Trigger:** The exact phrase to listen for.
    *   **Response:** The custom output.
4.  Future inputs matching the trigger will now bypass the AI and return the custom response.

---

## 📋 Prerequisites

Before running locally, ensure you have:
1.  **Node.js** (v18 or higher) installed.
2.  A **Google Gemini API Key**. You can get one for free at [Google AI Studio](https://aistudio.google.com/).

---

## 💻 Local Installation

Follow these steps to run Gream Bvddy on your machine.

**1. Clone or Download**
If you have the files, place them in a folder named `gream-bvddy`.

**2. Install Dependencies**
Open your terminal in the project folder and run:
```bash
npm install
```

**3. Configure Environment**
Create a file named `.env` in the root directory:
```env
API_KEY=your_actual_api_key_starts_with_AIza
```

*Note: If `process.env` issues occur in Vite, update `vite.config.ts` to define the variable:*
```ts
// vite.config.ts
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    plugins: [react()],
    define: {
      'process.env.API_KEY': JSON.stringify(env.API_KEY),
    },
  }
})
```

**4. Run Development Server**
```bash
npm run dev
```
Open your browser to `http://localhost:5173`.

---

## 🚀 Deployment Guides

### 1. Vercel (Free & Recommended)
Vercel is optimized for React apps and is the easiest way to deploy.

1.  Push your code to a **GitHub Repository**.
2.  Go to [Vercel](https://vercel.com) and sign up/login.
3.  Click **"Add New" > "Project"**.
4.  Import your `gream-bvddy` repository.
5.  In the **"Configure Project"** screen:
    *   **Framework Preset:** Vite
    *   **Environment Variables:**
        *   Key: `API_KEY`
        *   Value: `your_gemini_api_key`
6.  Click **Deploy**.
7.  Wait ~1 minute. Your app is now live!

### 2. Netlify (Free)
1.  Push your code to **GitHub**.
2.  Log in to [Netlify](https://netlify.com).
3.  Click **"Add new site" > "Import from an existing project"**.
4.  Select GitHub and choose your repo.
5.  **Build Settings:**
    *   Build command: `npm run build`
    *   Publish directory: `dist`
6.  Click **"Show advanced"** or **"Environment variables"**.
    *   Key: `API_KEY`
    *   Value: `your_gemini_api_key`
7.  Click **Deploy site**.

### 3. Replit (Free Tier)
1.  Create a new Repl and select **"Import from GitHub"**.
2.  Paste your repository URL.
3.  Once loaded, go to the **Tools** pane (left side) and look for **Secrets** (Lock icon).
4.  Add a new secret:
    *   Key: `API_KEY`
    *   Value: `your_gemini_api_key`
5.  In the **Shell**, run:
    ```bash
    npm install
    npm run build
    npm run preview -- --host
    ```
6.  Click the **Run** button (you may need to configure the `.replit` file to run `npm run dev` or `preview`).

### 4. Heroku (Paid)
Heroku is traditionally for backend apps, but can host static sites with configuration.

1.  Create a file named `static.json` in your root directory:
    ```json
    {
      "root": "dist",
      "routes": {
        "/**": "index.html"
      }
    }
    ```
2.  Log in to Heroku CLI: `heroku login`.
3.  Create an app: `heroku create gream-bvddy-app`.
4.  Add the static buildpack:
    ```bash
    heroku buildpacks:set https://github.com/heroku/heroku-buildpack-static.git
    ```
5.  Set your API Key:
    ```bash
    heroku config:set API_KEY=your_gemini_api_key
    ```
6.  Deploy:
    ```bash
    git push heroku main
    ```

---

## 📞 Contact Developer

Created by **Jason Momanyi**.

- 🌐 **Website:** [jasonmomanyi.netlify.app](https://jasonmomanyi.netlify.app)
- 💬 **Discord:** [User Profile](https://discord.com/users/1092210946547654730)
- 📸 **Instagram:** [@lord_stunnis](https://instagram.com/lord_stunnis)

---

## 🔒 Security Note

Because this is a **client-side application**, your API key is used directly in the browser. 

*   **For Personal Use:** This is acceptable.
*   **For Public Sharing:** If you share the live URL, others can technically inspect the network traffic and see your key.
    *   **Mitigation:** Go to [Google AI Studio > API Keys](https://aistudio.google.com/app/apikey). Click your key, select **"API key restrictions"**, select **"Websites"**, and enter your deployed URL (e.g., `https://gream-bvddy.vercel.app`). This prevents unauthorized usage of your key outside your specific domain.