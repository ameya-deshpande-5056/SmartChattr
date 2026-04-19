import { NextResponse } from 'next/server';

const svg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
  <defs>
    <linearGradient id="bg" x1="8" y1="8" x2="56" y2="56" gradientUnits="userSpaceOnUse">
      <stop stop-color="#63A4FF" />
      <stop offset="1" stop-color="#2F6BFF" />
    </linearGradient>
  </defs>
  <rect width="64" height="64" rx="16" fill="url(#bg)" />
  <path
    d="M12 25.5C12 19.701 16.701 15 22.5 15H41.5C47.299 15 52 19.701 52 25.5V30C52 35.799 47.299 40.5 41.5 40.5H30.5L20 50V39.6C15.3181 38.1294 12 33.7512 12 28.5714V25.5Z"
    fill="white"
  />
  <circle cx="23.5" cy="28" r="3.35" fill="#2F6BFF">
    <animate
      attributeName="cy"
      values="28;25.2;28;28"
      dur="1.2s"
      begin="0s"
      repeatCount="indefinite"
    />
    <animate
      attributeName="opacity"
      values="0.45;1;0.55;0.45"
      dur="1.2s"
      begin="0s"
      repeatCount="indefinite"
    />
  </circle>
  <circle cx="32" cy="28" r="3.35" fill="#2F6BFF">
    <animate
      attributeName="cy"
      values="28;25.2;28;28"
      dur="1.2s"
      begin="0.18s"
      repeatCount="indefinite"
    />
    <animate
      attributeName="opacity"
      values="0.45;1;0.55;0.45"
      dur="1.2s"
      begin="0.18s"
      repeatCount="indefinite"
    />
  </circle>
  <circle cx="40.5" cy="28" r="3.35" fill="#2F6BFF">
    <animate
      attributeName="cy"
      values="28;25.2;28;28"
      dur="1.2s"
      begin="0.36s"
      repeatCount="indefinite"
    />
    <animate
      attributeName="opacity"
      values="0.45;1;0.55;0.45"
      dur="1.2s"
      begin="0.36s"
      repeatCount="indefinite"
    />
  </circle>
</svg>
`.trim();

export async function GET() {
  return new NextResponse(svg, {
    headers: {
      'Content-Type': 'image/svg+xml',
      'Cache-Control': 'no-store',
    },
  });
}
