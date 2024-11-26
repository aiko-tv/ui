import { useQuery } from '@tanstack/react-query';
import { PublicKey } from '@solana/web3.js';
import { API_URL } from '../utils/constants';

export function useTokenBalance(mintAddress: PublicKey, walletPublicKey: PublicKey | null) {
    return useQuery({
        queryKey: ['tokenBalance', mintAddress?.toBase58(), walletPublicKey?.toBase58()],
        queryFn: async () => {
            if (!walletPublicKey || !mintAddress) {
                return 0;
            }

            try {
                const response = await fetch(
                    `${API_URL}/balance/token/${walletPublicKey.toBase58()}/${mintAddress.toBase58()}`
                );
                const data = await response.json();
                // console.log({ data })
                return data;

            } catch (error) {
                console.error("Error fetching token balance:", error);
                return 0;
            }
        },
        enabled: !!walletPublicKey && !!mintAddress,
    });
}