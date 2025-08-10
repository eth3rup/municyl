import { useQuery } from "@tanstack/react-query";
import { SearchResponse, MunicipalityDetailsResponse, SearchParams } from "@shared/schema";

/**
 * Hook for searching municipalities
 */
export function useMunicipalitySearch(params: SearchParams & { enabled?: boolean }) {
  const { enabled = true, ...searchParams } = params;
  
  return useQuery<SearchResponse>({
    queryKey: ['/api/municipalities/search', searchParams],
    enabled: enabled && (!!searchParams.query || !!searchParams.provinceCode),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });
}

/**
 * Hook for getting detailed municipality data
 */
export function useMunicipalityDetails(municipalityId: string) {
  return useQuery<MunicipalityDetailsResponse>({
    queryKey: ['/api/municipalities', municipalityId],
    enabled: !!municipalityId,
    staleTime: 10 * 60 * 1000, // 10 minutes
    retry: 2,
  });
}
