import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { type CNGStation, StationStatus, UserRole } from "../backend.d";
import { useActor } from "./useActor";

export type { CNGStation };
export { StationStatus, UserRole };

// ── Query: getAllStations ──
export function useGetAllStations() {
  const { actor, isFetching } = useActor();
  return useQuery<CNGStation[]>({
    queryKey: ["stations"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllStations();
    },
    enabled: !!actor && !isFetching,
  });
}

// ── Query: searchByCity ──
export function useSearchByCity(city: string, enabled: boolean) {
  const { actor, isFetching } = useActor();
  return useQuery<CNGStation[]>({
    queryKey: ["stations", "search", city],
    queryFn: async () => {
      if (!actor || !city.trim()) return [];
      return actor.searchByCity(city.trim());
    },
    enabled: !!actor && !isFetching && enabled && city.trim().length > 0,
  });
}

// ── Query: isCallerAdmin ──
export function useIsCallerAdmin() {
  const { actor, isFetching } = useActor();
  return useQuery<boolean>({
    queryKey: ["isAdmin"],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isCallerAdmin();
    },
    enabled: !!actor && !isFetching,
  });
}

// ── Mutation: preloadSampleData ──
export function usePreloadSampleData() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error("No actor");
      return actor.preloadSampleData();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["stations"] });
    },
  });
}

// ── Mutation: addStation ──
export interface StationFormData {
  name: string;
  address: string;
  city: string;
  operatingHours: string;
  pricePerKg: number;
  status: StationStatus;
  phone: string;
  isActive: boolean;
}

export function useAddStation() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: StationFormData) => {
      if (!actor) throw new Error("No actor");
      return actor.addStation(
        data.name,
        data.address,
        data.city,
        data.operatingHours,
        data.pricePerKg,
        data.status,
        data.phone,
        data.isActive,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["stations"] });
    },
  });
}

// ── Mutation: updateStation ──
export function useUpdateStation() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: bigint; data: StationFormData }) => {
      if (!actor) throw new Error("No actor");
      return actor.updateStation(
        id,
        data.name,
        data.address,
        data.city,
        data.operatingHours,
        data.pricePerKg,
        data.status,
        data.phone,
        data.isActive,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["stations"] });
    },
  });
}

// ── Mutation: deleteStation ──
export function useDeleteStation() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("No actor");
      return actor.deleteStation(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["stations"] });
    },
  });
}
