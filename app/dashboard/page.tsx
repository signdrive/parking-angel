import { FirebaseStatusBanner } from "@/components/firebase/firebase-status-banner"

export default function Dashboard() {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <FirebaseStatusBanner />
      {/* Rest of the dashboard content */}
      <div>Dashboard Content</div>
    </div>
  )
}
