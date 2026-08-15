# 🚀 OmniAI — Personal Cloudflare AI Platform

![Cloudflare Workers AI](https://img.shields.io/badge/Cloudflare-Workers_AI-F38020?style=for-the-badge&logo=cloudflare&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=for-the-badge&logo=node.js&logoColor=white)
![Render](https://img.shields.io/badge/Render-Deploy_Free-46E3B7?style=for-the-badge&logo=render&logoColor=black)
![License](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)

A powerful, all-in-one personal AI web platform powered by **Cloudflare Workers AI (58 Free Models)** with a password-protected lock screen, live daily Neuron tracking, and zero external dependencies.

---

## ✨ Features

- 💬 **Chat & Deep Reasoning**: Powered by `Llama 3.1 8B`, `DeepSeek R1 32B`, `GPT-OSS 120B`, and `QwQ 32B`.
- 🎨 **Image Generation Studio**: Ultra-high quality text-to-image with `Flux 1 Schnell`, `Flux 2`, and `SDXL Lightning`.
- 💻 **Code Specialist**: `Qwen 2.5 Coder 32B` with 1-click presets for APIs, debugging, complexity optimization, and tests.
- 🔊 **Voice & Text-to-Speech (TTS)**: Natural voice synthesis with `Deepgram Aura (En/Es)` and `MeloTTS`.
- 🌐 **Multilingual Translator**: Direct multi-language translation using `Meta M2M-100` and `IndicTrans2`.
- 🔒 **Password Protected**: Secure server-side authentication lock screen (Default: `vimalraj45`).
- ⚡ **Daily Neuron Meter**: Live counter and progress bar tracking your 10,000 daily free Cloudflare Neurons.
- 📱 **Mobile-First Responsive UI**: Built with Google Font **Outfit**, **Bootstrap Icons**, and smooth **AOS (Animate On Scroll)** animations.
- 🚀 **Zero Dependency Backend**: Instant builds on Render, Vercel, or VPS in under 5 seconds.

---

## ⚡ Free Daily Quotas & Pricing

Cloudflare grants **10,000 free Neurons every day** (resetting daily at 00:00 UTC) on the Workers Free plan.

| Model Category | Example Model | Estimated Cost | 10k Daily Free Capacity |
| :--- | :--- | :--- | :--- |
| **Compact LLM** | `@cf/meta/llama-3.2-1b-instruct` | ~3 Neurons / 1k tokens | **~3,300,000 words / day** |
| **Standard LLM** | `@cf/meta/llama-3.1-8b-instruct-fp8` | ~11 Neurons / 1k tokens | **~900,000 tokens / day** |
| **Reasoning LLM** | `@cf/deepseek-ai/deepseek-r1-distill-qwen-32b` | ~25 Neurons / 1k tokens | **~400,000 tokens / day** |
| **Text-to-Image** | `@cf/black-forest-labs/flux-1-schnell` | ~50 Neurons / image | **~200 images / day** |
| **Voice TTS** | `@cf/deepgram/aura-2-en` | ~10 Neurons / 1k chars | **~1,000,000 chars / day** |

---

## 🚀 1-Minute Deployment to Render (Free)

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com)

1. Fork or push this repository to GitHub.
2. Go to **[Render Dashboard](https://dashboard.render.com)** and click **New +** → **Web Service**.
3. Select this GitHub repository (`freeai`).
4. Set the configuration:
   - **Runtime**: `Node`
   - **Build Command**: *(leave empty)*
   - **Start Command**: `npm start`
   - **Plan**: `Free`
5. Add your Environment Variables:
   - `CLOUDFLARE_ACCOUNT_ID`: *Your Cloudflare Account ID*
   - `CLOUDFLARE_API_TOKEN`: *Your Cloudflare API Token (Workers AI Read)*
   - `APP_PASSWORD`: `vimalraj45` *(or any custom password)*
6. Click **Deploy Web Service**!

---

## 💻 Local Setup

1. **Clone the repository**:
   ```bash
   git clone https://github.com/vimalRaj45/freeai.git
   cd freeai
   ```

2. **Configure Environment Variables**:
   Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
   Edit `.env` and fill in your Cloudflare credentials:
   ```env
   CLOUDFLARE_ACCOUNT_ID=your_account_id_here
   CLOUDFLARE_API_TOKEN=your_token_here
   APP_PASSWORD=vimalraj45
   PORT=3000
   ```

3. **Run the server**:
   ```bash
   npm start
   ```
   Open **`http://localhost:3000`** in your browser.

---

## 🛡️ Security

- All sensitive keys (`CLOUDFLARE_ACCOUNT_ID`, `CLOUDFLARE_API_TOKEN`, `APP_PASSWORD`) are loaded on the server and **never exposed in client HTML**.
- The `.gitignore` prevents `.env` from ever being pushed to public version control.

---

## 📄 License

MIT License &copy; 2026. Built with ❤️ on Cloudflare Workers AI.
