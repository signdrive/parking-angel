import { LoadingSpinner } from "@/components/ui/loading-spinner";

export default function DashboardLoading() {
  return (
    <div className="container py-10">
      <div className="max-w-[1200px] mx-auto">
        <div className="grid gap-6">
          <div>
            <h2 className="text-2xl font-semibold mb-4">Subscription Status</h2>
            <div className="rounded-lg border p-8 flex justify-center">
              <LoadingSpinner size="lg" />
            </div>
          </div>

          <div className="space-y-4">
            <div className="h-8 bg-muted rounded animate-pulse" />
            <div className="h-32 bg-muted rounded animate-pulse" />
            <div className="h-32 bg-muted rounded animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  );
}
