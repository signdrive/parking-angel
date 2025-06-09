import { SupabaseDiagnostics } from "@/components/debug/supabase-diagnostics"

export default function DebugSupabasePage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Supabase Connection Diagnostics</h1>
      <SupabaseDiagnostics />
    </div>
  )
}
