import { useState, useCallback } from "react";
import { toast } from "@/components/ui/use-toast";
import { Profile, ParkingSpot } from "../lib/types/admin";

export function useAdminOperations() {
  const [isLoading, setIsLoading] = useState(false);

  const handleError = useCallback((error: Error | null, action: string) => {
    if (error) {
      console.error(`Error ${action}:`, error);
      toast({
        title: "Error",
        description: `Failed to ${action}. ${error.message || 'Please try again.'}`,
        variant: "destructive",
      });
    }
  }, []);

  const apiRequest = async (url: string, options: RequestInit, action: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(url, options);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to ${action}`);
      }
      const data = await response.json();
      toast({
        title: "Success",
        description: `${action} successful`,
      });
      return data;
    } catch (error) {
      handleError(error as Error, action);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const editProfile = useCallback(async (userId: string, data: Partial<Profile>) => {
    return apiRequest(`/api/admin/profiles/${userId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }, "update profile");
  }, []);

  const suspendUser = useCallback(async (userId: string) => {
    return editProfile(userId, { status: 'suspended' });
  }, [editProfile]);

  const addParkingSpot = useCallback(async (spot: Omit<ParkingSpot, "id" | "created_at" | "last_updated">) => {
    return apiRequest("/api/admin/parking-spots", {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(spot),
    }, "add parking spot");
  }, []);

  const editParkingSpot = useCallback(async (spotId: string, data: Partial<ParkingSpot>) => {
    return apiRequest(`/api/admin/parking-spots/${spotId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }, "edit parking spot");
  }, []);

  const deleteParkingSpot = useCallback(async (spotId: string) => {
    return apiRequest(`/api/admin/parking-spots/${spotId}`, {
      method: 'DELETE',
    }, "delete parking spot");
  }, []);

  // Fetch operations would go here, for now they are not implemented
  // as they might not be needed for the admin panel, or might be implemented differently.

  return {
    isLoading,
    editProfile,
    suspendUser,
    addParkingSpot,
    editParkingSpot,
    deleteParkingSpot,
  };
}
