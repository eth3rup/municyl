import { useQuery } from "@tanstack/react-query";
import { HealthCenter } from "@shared/schema";

interface HealthData {
  centers: HealthCenter[];
  totalCenters: number;
  totalAvailable: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

export function useHealthData(municipalityId: string, page: number = 1, limit: number = 50) {
  return useQuery<HealthData>({
    queryKey: ['/api/health', municipalityId, { page: page.toString(), limit: limit.toString() }],
    enabled: !!municipalityId
  });
}