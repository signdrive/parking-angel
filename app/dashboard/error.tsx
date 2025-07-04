"use client";

export default function DashboardError() {
  return (
    <div className="container py-10">
      <div className="max-w-[1200px] mx-auto">
        <div className="rounded-lg border p-8 text-center">
          <h2 className="text-2xl font-semibold text-red-600 mb-2">Something went wrong</h2>
          <p className="text-muted-foreground mb-4">
            There was an error loading your dashboard. Please try refreshing the page.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring h-9 px-4 py-2 bg-primary text-primary-foreground shadow hover:bg-primary/90"
          >
            Refresh Page
          </button>
        </div>
      </div>
    </div>
  );
}
