import { HeaderInspector } from "@/components/debug/header-inspector"

export default function DebugHeadersPage() {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Header Debug Tool</h1>
        <p className="text-muted-foreground">
          Diagnose and fix 406 Not Acceptable errors by testing different header configurations
        </p>
      </div>

      <HeaderInspector />
    </div>
  )
}
