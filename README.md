# SmartChattr - AI Chat App

[![Next.js](https://img.shields.io/badge/Next.js-14-blue.svg)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue.svg)](https://typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-3.4-blue.svg)](https://tailwindcss.com)

Modern, mobile-first chat app powered by **Google Gemini 3 Flash** with **IndexedDB persistence**.

## ✨ Features

| Feature | Status |
|---------|--------|
| Next.js 14 App Router | ✅ |
| TypeScript + typesafe | ✅ |
| Tailwind CSS (mobile-first) | ✅ |
| Dexie.js IndexedDB persistence | ✅ |
| Route-based chat navigation | ✅ |
| Markdown-style response rendering | ✅ |
| Gemini AI API + rate-limit fallback | ✅ |
| `useChat` hook | ✅ |
| New chat / Delete chat / Export chats | ✅ |
| Error handling + loading | ✅ |
| Persists across refreshes | ✅ |

## 🚀 Quick Start

### 1. Clone & Install
```bash
git clone <repo-url>
cd SmartChattr
npm install
```

### 2. Get Gemini API Key
1. Go to [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Create API key (free tier available)
3. Create `.env.local`:
```
GEMINI_API_KEY=AIzaSy...
```

### 3. Run Development
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000)

### 4. Production Build
```bash
npm run build
npm start
```

## 📱 Usage

1. **Landing page** → Click "Start Chatting"
2. **Chat** → Type messages (Enter to send)
3. **New chat** → Header button (clears + persists separately)
4. **Sidebar navigation** → Select chats by URL route or create new chats
5. **Export** → Export current or all chats as TXT, CSV, or PDF
6. Messages **auto-save** to browser IndexedDB

## 🏗️ Project Structure

```
SmartChattr/
├── src/
│   ├── app/              # App Router (pages + API)
│   │   ├── chat/         # Chat UI
│   │   ├── api/chat/     # Gemini API route
│   │   ├── globals.css   # Tailwind
│   │   └── layout.tsx
│   ├── components/       # Reusable UI
│   ├── hooks/            # useChat hook
│   ├── lib/              # db.ts (Dexie) + llm.ts
│   ├── types/            # Message + Chat types
│   └── utils.ts          # generateId + cn()
├── .env.local.example    # API key template
├── tailwind.config.js
├── tsconfig.json
└── package.json
```

## 🔧 Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Development server |
| `npm run build` | Production build |
| `npm run start` | Production server |
| `npm run lint` | ESLint check |

## 🛠 Tech Stack

```
Frontend: Next.js 14 + React 18 + TypeScript 5
Styling: Tailwind CSS 3.4
Database: Dexie.js (IndexedDB)
AI: Google Gemini 1.5 Flash
Utils: Lucide React icons
```

## 🌐 Environment Variables

```
GEMINI_API_KEY=your_api_key_here
```

Copy `.env.local.example` → `.env.local` and add your key.

## 📱 Responsive Design

- **Mobile-first** (320px+)
- **Fixed heights** (screen-friendly)
- **Smooth animations**
- **Dark mode ready** (extend `dark:` classes)

## 🚀 Deploy

### Vercel (Recommended)
```bash
npm i -g vercel
vercel --prod
```

### Other Platforms
Set `GEMINI_API_KEY` as environment variable.

## 🤝 Contributing

1. Fork repo
2. `npm install`
3. Create feature branch
4. `npm run dev`
5. Commit + PR

## 📄 License

MIT - see [LICENSE](LICENSE) (create if needed)

## 🙌 Thanks

Built with ❤️ using Next.js, Gemini AI, and Tailwind CSS.

