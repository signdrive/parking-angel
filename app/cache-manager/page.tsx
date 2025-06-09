import { CacheManager } from "@/components/debug/cache-manager"

export default function CacheManagerPage() {
  return (
    <div className="container mx-auto py-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Cache Manager</h1>
          <p className="text-gray-600 mt-2">Diagnose and fix cache-related issues in your browser</p>
        </div>

        <CacheManager />
      </div>
    </div>
  )
}
