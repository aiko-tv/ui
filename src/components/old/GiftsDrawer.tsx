import React, { useState } from 'react';
import { Gift, GIFTS } from '../../utils/constants';
import { CoinsIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUser } from '../../contexts/UserContext';

interface GiftsDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    onGiftSend: (giftName: string, giftImage: string, quantity?: number) => void;
}

export function GiftsDrawer({ isOpen, onClose, onGiftSend }: GiftsDrawerProps) {
    const [balance] = useState(0);
    const [giftCounts, setGiftCounts] = useState<Record<string, number>>({});
    const [sendTimeout, setSendTimeout] = useState<NodeJS.Timeout | null>(null);
    const [activeGift, setActiveGift] = useState<string | null>(null);

    const { connected, publicKey } = useUser();

    const handleGiftClick = (gift: Gift) => {
        setActiveGift(gift.id);
        setTimeout(() => setActiveGift(null), 200);

        const countElement = document.querySelector(`#count-${gift.id}`);
        if (countElement) {
            countElement.classList.remove('count-bump');
            void countElement.offsetWidth;
            countElement.classList.add('count-bump');
        }

        setGiftCounts(prev => ({
            ...prev,
            [gift.id]: (prev[gift.id] || 0) + 1
        }));

        if (sendTimeout) {
            clearTimeout(sendTimeout);
        }

        const timeout = setTimeout(() => {
            const count = giftCounts[gift.id] || 1;
            onGiftSend(gift.name, gift.image, count);
            setGiftCounts(prev => ({
                ...prev,
                [gift.id]: 0
            }));
        }, 1000);

        setSendTimeout(timeout);
    };

    return (
        <div
            className={`absolute inset-0 z-50 transition-opacity duration-300 ${isOpen ? 'pointer-events-auto' : 'pointer-events-none opacity-0'
                }`}
        >
            <div
                className={`absolute inset-0 bg-black/40 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0'
                    }`}
                onClick={onClose}
            />
            <div
                className={`absolute left-0 right-0 bottom-0 bg-[#1C1C1E] transition-transform duration-300 ${isOpen ? 'translate-y-0' : 'translate-y-full'
                    }`}
                style={{
                    height: '45%',
                    borderTopLeftRadius: '10px',
                    borderTopRightRadius: '10px',
                }}
            >
                <div className="h-1 w-10 bg-gray-600 rounded-full mx-auto my-3" />

                <div className="px-4 pb-3 flex justify-between items-center">
                    <h2 className="text-white text-lg font-medium">Send Gifts</h2>
                    <button onClick={onClose} className="text-white/80 p-2">✕</button>
                </div>

                <div className="overflow-y-auto h-[calc(100%-120px)]">
                    <div className="p-4 grid grid-cols-4 gap-4">
                        {GIFTS.map((gift) => (
                            <button
                                key={gift.id}
                                onClick={() => handleGiftClick(gift)}
                                className={`flex flex-col items-center relative transition-all duration-200 hover:bg-white/10 p-2 rounded-lg ${
                                    activeGift === gift.id ? 'scale-110' : ''
                                }`}
                            >
                                <div className="w-14 h-14 mb-1 relative">
                                    <img
                                        src={gift.image}
                                        alt={gift.name}
                                        className="w-full h-full object-contain"
                                    />
                                    {giftCounts[gift.id] > 1 && (
                                        <div
                                            id={`count-${gift.id}`}
                                            className=" count-bump absolute top-0 right-0 bg-[#FE2C55] text-white text-xs rounded-full w-5 h-5 flex items-center justify-center"
                                        >
                                            {giftCounts[gift.id]}
                                        </div>
                                    )}
                                </div>
                                <span className="text-white text-xs mb-1">{gift.name}</span>
                                <div className="flex items-center gap-1">
                                    <CoinsIcon color='yellow'/>
                                    <span className="text-[#FFD700] text-xs">{gift.price}</span>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                <div className="absolute bottom-0 left-0 right-0 h-14 px-4 border-t border-gray-800/50 bg-[#1C1C1E] flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <CoinsIcon color='yellow' />
                        <span className="text-[#FFD700] text-sm">Balance: {balance}</span>
                    </div>
                    <button className="bg-[#FE2C55] text-white px-6 py-1.5 rounded-full text-sm font-medium">
                        Recharge
                    </button>
                </div>
            </div>
        </div>
    );
}

<style jsx>{`
    .count-badge {
        position: absolute;
        top: -8px;
        right: -8px;
        background-color: #FE2C55;
        color: white;
        font-size: 0.75rem;
        border-radius: 9999px;
        width: 20px;
        height: 20px;
        display: flex;
        align-items: center;
        justify-content: center;
        animation: fade-in 0.2s ease-out;
    }

    .count-bump {
        animation: bump 0.2s ease-out;
    }

    @keyframes bump {
        0% { transform: scale(1); }
        50% { transform: scale(1.2); }
        100% { transform: scale(1); }
    }

    @keyframes fade-in {
        from {
            opacity: 0;
            transform: scale(0.5);
        }
        to {
            opacity: 1;
            transform: scale(1);
        }
    }
`}</style>