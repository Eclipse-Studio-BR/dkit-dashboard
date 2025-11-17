import { useMutation, useQuery } from "@tanstack/react-query";
import { createApiKey, deleteApiKey, listApiKeys, type SerializedApiKey } from "@/lib/api";
import { queryClient } from "@/lib/queryClient";

export function useApiKeys() {
  const keysQuery = useQuery<SerializedApiKey[]>({
    queryKey: ["/api/keys"],
    queryFn: () => listApiKeys(),
  });

  const createMutation = useMutation({
    mutationFn: (name: string) => createApiKey(name),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/api/keys"] }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteApiKey(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/api/keys"] }),
  });

  return { keysQuery, createMutation, deleteMutation };
}
