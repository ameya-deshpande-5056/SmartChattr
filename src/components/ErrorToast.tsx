import { useEffect, useState } from 'react';

interface ErrorToastProps {
  message: string | null;
}

export function ErrorToast({ message }: ErrorToastProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (message) {
      setVisible(true);
      const timer = setTimeout(() => setVisible(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  if (!message || !visible) return null;

  return (
    <div className="fixed top-4 right-4 z-50 bg-red-500 text-white px-4 py-2 rounded-md shadow-lg max-w-sm overflow-x-hidden">
      {message}
      <button
        className="ml-2 text-white hover:text-gray-200"
        onClick={() => setVisible(false)}
      >
        ×
      </button>
    </div>
  );
}

