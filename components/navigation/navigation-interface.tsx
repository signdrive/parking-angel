import { useNavigationStore } from "@/lib/navigation-store"
import type { NavigationInterfaceProps } from "@/types/navigation"
import { NavigationLayout } from "./navigation-layout"

export function NavigationInterface({ onExit }: NavigationInterfaceProps) {
  const { destination } = useNavigationStore()

  return <NavigationLayout onExit={onExit} destination={destination} />
}
