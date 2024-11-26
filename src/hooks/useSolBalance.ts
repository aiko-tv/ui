import { useQuery } from '@tanstack/react-query';
import { PublicKey } from '@solana/web3.js';
import { useConnection } from '@solana/wallet-adapter-react';
import { API_URL } from '@/utils/constants';

export function useSolBalance(walletPublicKey: PublicKey | null) {
    const { connection } = useConnection();

    return useQuery({
        queryKey: ['solBalance', walletPublicKey?.toBase58()],
        queryFn: async () => {
            if (!walletPublicKey) {
                return 0;
            }

            try {
                const response = await fetch(
                    `${API_URL}/balance/sol/${walletPublicKey.toBase58()}`
                );
                const data = await response.json();
                return data.balance;
            } catch (error) {
                console.error("Error fetching SOL balance:", error);
                return 0;
            }
        },
        enabled: !!walletPublicKey,
    });
} 