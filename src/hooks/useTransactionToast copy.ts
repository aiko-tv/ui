import { useConnection } from '@solana/wallet-adapter-react';
import { Transaction, TransactionSignature } from '@solana/web3.js';

interface UseTransactionToastProps {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

export function useTransactionToast({ onSuccess, onError }: UseTransactionToastProps = {}) {
  const { connection } = useConnection();

  const confirmTransaction = async (
    signature: TransactionSignature,
    message: string,
    timeout: number = 60000 // 60 seconds default timeout
  ): Promise<boolean> => {
    const toastId = window.showToast(message, 'loading');

    try {
      const startTime = Date.now();
      
      while (Date.now() - startTime < timeout) {
        const status = await connection.getSignatureStatus(signature);
        
        if (status?.value?.err) {
          throw new Error('Transaction failed');
        }
        
        if (status?.value?.confirmationStatus === 'confirmed' || 
            status?.value?.confirmationStatus === 'finalized') {
          window.updateToast(toastId, 'Transaction confirmed successfully!', 'success');
          onSuccess?.();
          return true;
        }
        
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
      
      throw new Error('Transaction confirmation timeout');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Transaction failed';
      window.updateToast(toastId, errorMessage, 'error');
      onError?.(error instanceof Error ? error : new Error(errorMessage));
      return false;
    }
  };

  return { confirmTransaction };
}