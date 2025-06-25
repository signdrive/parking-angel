'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function AuthCodeErrorPage() {
  const searchParams = useSearchParams();
  const message = searchParams.get('message');

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
      <div className="max-w-md p-8 space-y-4 bg-white rounded-lg shadow-md dark:bg-gray-800">
        <h1 className="text-2xl font-bold text-center text-red-600">Authentication Error</h1>
        <p className="text-center text-gray-700 dark:text-gray-300">
          There was a problem signing you in. Please try again.
        </p>
        {message && (
          <div className="p-4 text-sm text-red-700 bg-red-100 border border-red-200 rounded-md dark:bg-red-900/20 dark:text-red-400 dark:border-red-800">
            <strong>Details:</strong> {message}
          </div>
        )}
        <div className="flex justify-center">
          <Link href="/auth/login"
            className="px-4 py-2 font-bold text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
            Return to Login
          </Link>
        </div>
      </div>
    </div>
  );
}
