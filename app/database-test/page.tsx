import DatabaseVerification from "@/components/setup/database-verification"

export default function DatabaseTestPage() {
  return (
    <div className="container py-8">
      <h1 className="text-2xl font-bold mb-6">Database Test Page</h1>
      <DatabaseVerification />
    </div>
  )
}
