import { useQuery } from '@tanstack/react-query';
import { API_URL } from '../utils/constants';
export function useLikeCount(agentId: string) {
    const { data } = useQuery({
        queryKey: ['likes', agentId],
        queryFn: async () => {
            const response = await fetch(`${API_URL}/api/agents/${agentId}/total-likes`);
            if (!response.ok) {
                throw new Error('Failed to fetch likes');
            }
            const data = await response.json();
            return data.totalLikes;
        },
        // Optional: you can add these configurations based on your needs
        refetchInterval: 5000, // Refetch every 5 seconds
        initialData: 0, // Start with 0 likes
    });

    return data ?? 0; // Return 0 if data is undefined
} 