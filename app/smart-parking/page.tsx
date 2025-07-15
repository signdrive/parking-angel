import { EnhancedParkingSearch } from "@/components/parking/enhanced-parking-search"
import { SiteFooter } from "@/components/layout/site-footer"

export default function SmartParkingPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <EnhancedParkingSearch />
      <SiteFooter />
    </div>
  )
}
