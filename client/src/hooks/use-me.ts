import { useQuery } from "@tanstack/react-query";
import type { MeResponse } from "@shared/schema";
import { getMe } from "@/lib/api";

export function useMe(enabled = true) {
  return useQuery<MeResponse>({
    queryKey: ["/api/me"],
    queryFn: () => getMe(),
    enabled,
    retry: false,
  });
}
