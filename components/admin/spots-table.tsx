"use client"

import { ParkingSpot } from "@/lib/types/supabase-helpers"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { formatDistanceToNow } from "date-fns"

interface AdminSpotsTableProps {
  spots: ParkingSpot[]
}

const getStatusBadgeVariant = (status: string): "default" | "secondary" | "destructive" | "outline" => {
  switch (status) {
    case 'available':
      return 'default';
    case 'occupied':
      return 'destructive';
    case 'reserved':
      return 'secondary';
    default:
      return 'outline';
  }
}

const getConfidenceBadgeVariant = (score: number): "default" | "secondary" | "destructive" | "outline" => {
  if (score > 0.8) return "default";
  if (score > 0.5) return "secondary";
  return "destructive";
}

export function AdminSpotsTable({ spots }: AdminSpotsTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>ID</TableHead>
          <TableHead>Name</TableHead>
          <TableHead>Type</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Location</TableHead>
          <TableHead>Confidence</TableHead>
          <TableHead>Last Updated</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {spots.map(spot => (
          <TableRow key={spot.id}>
            <TableCell className="font-mono">{spot.id.slice(0, 8)}</TableCell>
            <TableCell>{spot.name || 'Unnamed'}</TableCell>
            <TableCell>
              <Badge variant="outline">{spot.spot_type || 'standard'}</Badge>
            </TableCell>
            <TableCell>
              <Badge variant={getStatusBadgeVariant(spot.status)}>
                {spot.status}
              </Badge>
            </TableCell>
            <TableCell className="font-mono">
              {spot.latitude.toFixed(6)}, {spot.longitude.toFixed(6)}
            </TableCell>
            <TableCell>
              {spot.confidence_score !== null ? (
                <Badge 
                  variant={getConfidenceBadgeVariant(spot.confidence_score)}
                >
                  {(spot.confidence_score * 100).toFixed(0)}% Confidence
                </Badge>
              ) : (
                'N/A'
              )}
            </TableCell>
            <TableCell>
              {spot.last_updated ? 
                formatDistanceToNow(new Date(spot.last_updated), { addSuffix: true }) : 
                'Never'}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
