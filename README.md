# SmartChattr

<p align="center">
  <img src="./public/brandmark.svg" alt="SmartChattr logo" width="180" height="180" />
</p>

[![Next.js](https://img.shields.io/badge/Next.js-14-blue.svg)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue.svg)](https://typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-3.4-blue.svg)](https://tailwindcss.com)

A local-first AI chat app built with Next.js, TypeScript, Dexie, and multiple LLM provider fallbacks. SmartChattr is designed to feel simple for everyday users while still keeping useful features like chat persistence, markdown rendering, exports, and full local backups.

## Features

- Multi-chat interface with route-based chat navigation
- Guided starter prompts for faster first messages
- Local IndexedDB persistence with refresh-safe chat history
- Full-text search across all chats (titles and message content)
- AI provider fallback chain for chat responses
- Bottom-bar AI provider selector with Auto, Google Gemini, Groq, and OpenRouter options
- Context-aware routing for live/current-info prompts
- Internet access toggle for explicit providers, backed by Tavily with Exa fallback
- AI-generated chat titles from the first prompt
- Markdown rendering in chat with code blocks, tables, task lists, and copy actions
- Horizontal scroll for code blocks and tables on mobile
- PDF and TXT export for single chats and all chats (includes AI model info)
- Full local database backup export/import as JSON
- Per-chat JSON backup via flyout menu
- Import with mode selection (replace, merge, or add chats)
- Select specific chats to import from backup
- WhatsApp/Telegram-style date separators in chat view
- Dark, light, and auto theme modes (auto follows system preference, landing page theme independent from chat page)
- Interactive landing page demo with theme toggle
- Clickable header brand to navigate back to landing page
- Mobile-friendly layout with responsive sidebar/settings

## Stack

- Next.js 14 App Router
- React 18 + TypeScript
- Tailwind CSS
- Dexie.js / IndexedDB
- React Markdown
- Lucide React

## AI Providers

SmartChattr can use multiple providers and falls back when one is unavailable or rate-limited. The input bar includes a provider selector so each message can use either the default automatic routing or a specific provider.

- Google Gemini
- Groq
- OpenRouter
- Tavily web search
- Exa web search

Provider behavior:

- **Auto**: Keeps the existing SmartChattr routing behavior. It uses the fallback chain and can automatically prefer live-capable routing for timely prompts.
- **Google Gemini**, **Groq**, and **OpenRouter**: Force the selected provider for that message instead of using the fallback chain.
- **Internet access toggle**: Appears for every non-Auto provider. When enabled, SmartChattr fetches web context with Tavily first and falls back to Exa before sending the augmented prompt to the selected provider.

The app also adjusts provider preference for certain prompt types. Time-sensitive prompts like news, weather, sports, time/date, market updates, and similar live-info questions can prefer more capable live-access models first. When enabled, Tavily and Exa can add web-search context so the app can answer with fresher information about what is happening right now.

## Quick Start

### 1. Install

```bash
git clone <repo-url>
cd SmartChattr
npm install
```

### 2. Create `.env.local`

Copy the included example file, then add at least one provider key. Google Gemini is the simplest starting point.

```bash
cp .env.example .env.local
```

```env
GEMINI_API_KEY=your_google_ai_studio_key
GROQ_API_KEY=your_groq_key
OPENROUTER_API_KEY=your_openrouter_key
TAVILY_API_KEY=your_tavily_key
EXA_API_KEY=your_exa_key
```

Any one of the chat provider keys (`GEMINI_API_KEY`, `GROQ_API_KEY`, or `OPENROUTER_API_KEY`) is enough to get the app working. Adding more than one gives SmartChattr fallback options and lets the provider selector use more choices. `TAVILY_API_KEY` and `EXA_API_KEY` are optional, but they enable the internet-access toggle and web-search-backed live info flow.

### 3. Run Development

```bash
npm run dev
```

Open `http://localhost:3000`

If you access the dev server from another device on your LAN, update `allowedDevOrigins` in [next.config.js](./next.config.js) to include that host.

### 4. Production

```bash
npm run build
npm start
```

## Usage

1. Open the landing page and click `Start chatting`
2. Start a fresh chat by typing your own message or tapping a starter prompt
3. Create or select chats from the sidebar as needed
4. Pick `Auto` or a specific provider from the input bar before sending
5. Turn on internet access for non-Auto providers when you want Tavily/Exa web context
6. Send messages and let SmartChattr keep a compact rolling context window
7. Use the settings menu to:
   - export the current chat
   - export all chats
   - export/import the full local database
   - switch theme mode
8. Use the copy button below assistant messages for quick copy feedback

## Export and Backup

SmartChattr supports two different kinds of data export:

- Chat export:
  - Single chat or all chats
  - `PDF` or `TXT` (includes AI provider and model info)
- Full backup:
  - Entire local IndexedDB contents
  - Exported as JSON
  - Can be imported back later to restore all local chats/messages
- Per-chat backup:
  - Export individual chat as JSON via flyout menu
  - Can be imported later

Importing a backup offers three modes:
- **Replace**: Delete all existing chats and replace with selected
- **Merge**: Update existing chats by ID, add new ones
- **Add**: Add selected chats without modifying existing ones

You can also select specific chats to import from a backup file.

## Markdown Support

Chat responses support:

- headings
- lists
- task lists
- tables
- blockquotes
- inline code
- fenced code blocks
- links
- strikethrough
- math/LaTeX

PDF exports also include improved markdown handling for these formats, including better code block rendering and math/LaTeX support.

## Project Structure

```text
SmartChattr/
├── src/
│   ├── app/
│   │   ├── api/chat/         # Chat + title generation routes
│   │   ├── chat/             # Chat pages
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   └── page.tsx          # Landing page
│   ├── components/
│   │   ├── ChatSidebar.tsx
│   │   ├── Header.tsx
│   │   ├── InputBar.tsx
│   │   ├── MessageBubble.tsx
│   │   └── ...
│   ├── hooks/
│   │   ├── useChat.ts
│   │   └── useChats.ts
│   ├── lib/
│   │   ├── aiProviders.ts    # Provider routing + fallback logic
│   │   ├── db.ts             # Dexie / IndexedDB helpers
│   │   └── llm.ts            # Client-side API wrappers
│   ├── types/
│   └── utils.ts              # Export + markdown print helpers
├── next.config.js
├── package.json
└── tsconfig.json
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Run the development server |
| `npm run build` | Build for production |
| `npm run start` | Start the production server |
| `npm run lint` | Run ESLint |

## Notes

- Chat history is stored locally in the browser with IndexedDB
- Theme preference is stored locally
- The app is optimized to keep token usage lower with compact context handling and concise model settings

## Thanks

Built with Next.js, Gemini, Groq, OpenRouter, Dexie, and Tailwind CSS.
