import { useWallet } from '@solana/wallet-adapter-react';
import { API_URL, STREAMER_ADDRESS } from '../utils/constants';
import React, { createContext, useContext, useState } from 'react';
import { PublicKey, Transaction } from '@solana/web3.js';
import { useConnection } from '@solana/wallet-adapter-react';
import { useScene } from './ScenesContext';
import { useTransactionToast } from '../hooks/useTransactionToast';
import { USDC_MINT } from '../utils/raydium';
import { useTokenBalance } from '../hooks/useTokenBalance';
import { Buffer } from 'buffer';


interface GiftModalContextType {
    isOpen: boolean;
    openModal: () => void;
    closeModal: () => void;
    batchedGift: BatchedGift | null;
    setBatchedGift: (gift: BatchedGift | null) => void;
    sendBatchedGift: () => Promise<void>;
    isSending: boolean;
    modalTimer: NodeJS.Timeout | null;
    setModalTimer: (timer: NodeJS.Timeout | null) => void;

    setShowRechargeModal: (show: boolean) => void;
    showRechargeModal: boolean;
    onConfirm: () => void;  
}

interface Gift {
    name: string;
    coins: number;
    icon: string;
}

interface BatchedGift extends Gift {
    count: number;
}


const GiftModalContext = createContext<GiftModalContextType | undefined>(undefined);

export function GiftModalProvider({ children }: { children: React.ReactNode }) {
    const { publicKey, sendTransaction } = useWallet();
    const { connection } = useConnection();
    const { confirmTransaction } = useTransactionToast();

    const [isOpen, setIsOpen] = useState(false);
    const [batchedGift, setBatchedGift] = useState<BatchedGift | null>(null);
    const [isSending, setIsSending] = useState(false);
    const [modalTimer, setModalTimer] = useState<NodeJS.Timeout | null>(null);


    const [showRechargeModal, setShowRechargeModal] = useState(false);

    const { sendGift } = useScene();
    const openModal = () => {
        // Clear any existing timer
        if (modalTimer) {
            clearTimeout(modalTimer);
            setModalTimer(null);
        }
        setIsOpen(true);
    };

    const closeModal = () => {
        setIsOpen(false);
        setBatchedGift(null);
    };

    const [pendingTxs, setPendingTxs] = useState<Set<string>>(new Set());


    const sendBatchedGift = async () => {
        if (!batchedGift || !publicKey || isSending) return;

        try {
            setIsSending(true);
            setPendingTxs(prev => new Set(prev));

            // Call API to get transaction
            const response = await fetch(`${API_URL}/transaction/gift`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    senderAddress: publicKey.toString(),
                    coins: batchedGift.coins,
                    count: batchedGift.count,
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to create transaction');
            }

            const { transaction: serializedTransaction } = await response.json();

            // Deserialize and send transaction
            const transaction = Transaction.from(Buffer.from(serializedTransaction, 'base64'));
            const signature = await sendTransaction(transaction, connection);

            // Emit the gift event to the server
            sendGift({
                count: batchedGift.count,
                name: batchedGift.name,
                icon: batchedGift.icon,
                coins: batchedGift.coins,
                txHash: signature,
                // TODO: remove this
                 recipientAddress: STREAMER_ADDRESS
            });

            closeModal();

            await confirmTransaction(
                signature,
                `Sending ${batchedGift.count}x ${batchedGift.icon} ${batchedGift.name}...`,
            );

            setBatchedGift(null);
        } catch (error: any) {
            // console.log({ error })
            if (error.message?.includes('User rejected')) {
                window.showToast('Transaction cancelled', 'error');
            } else {
                // console.log('error', error)
                // console.log('error', error)
                // console.log('error', error)
                // console.log('error', error)
                window.showToast('Failed to send gift', 'error');
            }
            setBatchedGift(null);
            setPendingTxs(prev => {
                const updated = new Set(prev);
                return updated;
            });
        } finally {
            setIsSending(false);
            closeModal();
        }
    };


    const onConfirm = () => {
        sendBatchedGift();
    }


    return (
        <GiftModalContext.Provider value={{ 
            isOpen, 
            openModal, 
            closeModal, 
            batchedGift, 
            setBatchedGift,
            sendBatchedGift,
            isSending,
            modalTimer,
            setModalTimer,
            onConfirm,
            setShowRechargeModal,
            showRechargeModal,

            }}>
            {children}
        </GiftModalContext.Provider>
    );
}

export function useGiftModal() {
    const context = useContext(GiftModalContext);
    if (context === undefined) {
        throw new Error('useGiftModal must be used within a GiftModalProvider');
    }
    return context;
}
