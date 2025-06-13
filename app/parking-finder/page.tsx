"use client"

import { useState } from "react"
import MobileFinder from "@/components/parking/mobile-finder"
import QuickBookingModal from "@/components/parking/quick-booking-modal"
import ConfirmationScreen from "@/components/parking/confirmation-screen"

export default function ParkingFinderPage() {
  const [selectedSpot, setSelectedSpot] = useState(null)
  const [booking, setBooking] = useState(null)

  const handleSpotSelect = (spot: any) => {
    setSelectedSpot(spot)
  }

  const handleBookingConfirm = (bookingData: any) => {
    setBooking(bookingData)
    setSelectedSpot(null)
  }

  const handleClose = () => {
    setSelectedSpot(null)
    setBooking(null)
  }

  if (booking) {
    return <ConfirmationScreen booking={booking} onClose={handleClose} />
  }

  return (
    <>
      <MobileFinder onSpotSelect={handleSpotSelect} />
      {selectedSpot && (
        <QuickBookingModal spot={selectedSpot} onClose={() => setSelectedSpot(null)} onConfirm={handleBookingConfirm} />
      )}
    </>
  )
}
