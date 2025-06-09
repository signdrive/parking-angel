import { DatabaseSetup } from "@/components/setup/database-setup"

export default function SetupPage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Parking Angel Setup</h1>
      <DatabaseSetup />
    </div>
  )
}
