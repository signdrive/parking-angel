'use client';

import React from 'react';

interface RSCErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

export class RSCErrorBoundary extends React.Component<
  React.PropsWithChildren<{}>,
  RSCErrorBoundaryState
> {
  constructor(props: React.PropsWithChildren<{}>) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): RSCErrorBoundaryState {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('RSC Error Boundary caught an error:', error, errorInfo);
    
    // Only log RSC-specific errors, not all errors
    if (error.message.includes('fetch') || error.message.includes('RSC')) {
      console.error('RSC-related error:', error);
    }
  }

  render() {
    if (this.state.hasError) {
      // Fallback UI for RSC errors
      return (
        <div className="flex items-center justify-center min-h-[200px] p-4">
          <div className="text-center">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
              Something went wrong
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              We encountered an error loading this content.
            </p>
            <button
              onClick={() => this.setState({ hasError: false })}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
            >
              Try again
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
