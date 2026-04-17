import Link from 'next/link';

export default function LandingPage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-8">
      <div className="text-center max-w-md">
        <h1 className="text-6xl md:text-7xl font-black bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-6">
          SmartChattr
        </h1>
        <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-8 leading-relaxed">
          Simple, fast AI chat with client-side persistence.
        </p>
        <Link
          href="/chat"
          className="inline-block px-8 py-4 bg-blue-500 text-white text-lg font-semibold rounded-full hover:bg-blue-600 transition-all transform hover:scale-105 shadow-xl"
        >
          Start Chatting →
        </Link>
      </div>
    </main>
  );
}

