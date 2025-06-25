import { SmartParkingFinder } from "@/components/parking/smart-parking-finder"
import { SiteFooter } from "@/components/layout/site-footer"

export default function SmartParkingPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <SmartParkingFinder />
      <SiteFooter />
    </div>
  )
}
