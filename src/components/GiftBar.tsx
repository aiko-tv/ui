import { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useConnection } from '@solana/wallet-adapter-react';
import { PublicKey, Transaction } from '@solana/web3.js';
import { Coins, Gift } from 'lucide-react';
import { RechargeModal } from './RechargeModal';
import { GiftConfirmationModal } from './GiftConfirmationModal';
import { useTransactionToast } from '../hooks/useTransactionToast';
import { useTokenBalance } from '../hooks/useTokenBalance';
import { useScene } from '../contexts/ScenesContext';
import { AIKO_MINT, API_URL, COIN_LOGO, STREAMER_ADDRESS } from '../utils/constants';
import { useModal } from '../contexts/ModalContext';
import { useWalletModal } from '@solana/wallet-adapter-react-ui';
import { useGift, useGiftModal } from '../contexts/GiftContext';

const USDC_DECIMALS = 6;
const CONFIRMATION_DELAY = 1000; // 1 second delay before showing confirmation

interface Gift {
  id: string;
  name: string;
  coins: number;
  icon: string;
}

interface BatchedGift extends Gift {
  count: number;
}

const gifts = [
  { id: 'rose', name: 'Rose', coins: 1, icon: '🌹' },
  { id: 'ice-cream', name: 'Ice Cream', coins: 1, icon: '🍦' },
  { id: 'finger-heart', name: 'Finger Heart', coins: 5, icon: '🤍' },
  { id: 'tiny-dino', name: 'Tiny Dino', coins: 10, icon: '🦖' },
  { id: 'silly-dance', name: 'Silly Dance', coins: 1, icon: '🤪' },
  { id: 'jump-for-joy', name: 'Jump for Joy', coins: 1, icon: '🎉' },
  { id: 'rumba', name: 'Rumba Dancing', coins: 5, icon: '💃' },
  { id: 'dolphin', name: 'Dolphin', coins: 1, icon: '🐬' },
  { id: 'hip-hop', name: 'Hip Hop Dancing', coins: 10, icon: '🎵' },
  // { id: 'doughnut', name: 'Doughnut', coins: 30, icon: '🍩' },
  // { id: 'star', name: 'Star', coins: 99, icon: '⭐' },
  // { id: 'live-on-air', name: 'LIVE On Air', coins: 99, icon: '🎭' },
  { id: 'hand-heart', name: 'Hand Heart', coins: 100, icon: '🫶' },
  // { id: 'scarecrow', name: 'Scarecrow', coins: 5000, icon: '🎭' },
];
// const gifts = [
//   { id: 'rose', name: 'Rose', coins: 1, icon: '🌹' },
//   { id: 'ice-cream', name: 'Ice Cream', coins: 1, icon: '🍦' },

//   { id: 'tiktok-dance', name: 'Dance', coins: 15, icon: '💃' },
//   { id: 'viral-challenge', name: 'Party Hat', coins: 20, icon: '🎉' },
//   { id: 'duet', name: 'Duet', coins: 25, icon: '🎤' },
//   { id: 'dolphin', name: 'Dolphin', coins: 10, icon: '🐬' },
//   { id: 'doughnut', name: 'Doughnut', coins: 30, icon: '🍩' },
//   { id: 'star', name: 'Star', coins: 99, icon: '⭐' },
//   { id: 'live-on-air', name: 'LIVE On Air', coins: 99, icon: '🎭' },
//   { id: 'hand-heart', name: 'Hand Heart', coins: 100, icon: '🫶' },
//   { id: 'scarecrow', name: 'Scarecrow', coins: 5000, icon: '🎭' },
// ];


export function GiftBar() {
  const { publicKey } = useWallet();
  const { openRechargeModal } = useModal();
  const { setVisible: openWalletModal } = useWalletModal();
  const { batchedGift, setBatchedGift, openModal, isSending, modalTimer, setShowRechargeModal, setModalTimer } = useGiftModal();

  const usdcQuery = useTokenBalance(new PublicKey(AIKO_MINT), publicKey);
  // console.log({ usdcQuery, AIKO_MINT, publicKey })
  const usdcBalance = usdcQuery.data?.balance ?? 0;


  // console.log({ batchedGift, COIN_LOGO })

  const handleGiftClick = (gift: Gift) => {
    if (!publicKey) {
      openWalletModal(true);
      return;
    }

    const newCount = (batchedGift?.name === gift.name ? batchedGift.count + 1 : 1);
    const totalCost = gift.coins * newCount;

    if (totalCost > usdcBalance) {
      setShowRechargeModal(true);
      setBatchedGift(null);
      return;
    }

    // Clear existing timer on every click
    if (modalTimer) {
      clearTimeout(modalTimer);
    }

    // Set new timer
    const timer = setTimeout(() => {
      openModal();
    }, CONFIRMATION_DELAY);
    setModalTimer(timer);

    // Update the batched gift count
    setBatchedGift((prev: BatchedGift | null) => {
      if (!prev || prev.name !== gift.name) {
        return { ...gift, count: 1 };
      }
      return { ...prev, count: prev.count + 1 };
    });
  };

  return (
    <>
      <div className="flex flex-col bg-[#18181b]/95 backdrop-blur-sm z-20 hidden md:block overflow-scroll">

        <div className="flex items-center justify-between px-3 overflow-scroll">
          <div className="flex-1 flex items-center gap-2 py-2 ">
            {gifts.map((gift) => {
              const isCurrentBatch = batchedGift?.name === gift.name;
              const batchCount = isCurrentBatch ? batchedGift.count : 0;

              return (
                <div
                  key={gift.name}
                  className="group relative min-w-[80px] md:min-w-[90px] px-1 gift-container"
                >
                  <div className="flex flex-col items-center">
                    <div className="relative">
                      <div
                        onClick={(e) => {
                          e.preventDefault();
                          handleGiftClick(gift);
                        }}
                        className="gift-button w-[70px] h-[70px] md:w-[80px] md:h-[80px] bg-[#27272a] rounded-xl flex items-center justify-center text-2xl md:text-3xl group-hover:bg-[#3f3f46] cursor-pointer relative"
                        style={{ userSelect: 'none' }}
                      >
                        {gift.icon}
                        {batchCount > 0 && (
                          <div
                            id={`count-${gift.id}`}
                            className="gift-counter absolute -top-2.5 -right-2.5 bg-[#fe2c55] text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center z-50 count-bump"
                          >
                            {batchCount}
                          </div>
                        )}
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleGiftClick(gift);
                        }}
                        disabled={isSending}
                        className="absolute -bottom-1 left-0 right-0 bg-[#fe2c55] text-white text-xs font-medium py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-50 z-50"
                      >
                        {isCurrentBatch ? 'Send All' : 'Send'}
                      </button>
                    </div>
                  </div>
                  <div className="flex flex-col items-center mt-1 gift-label pointer-events-none">
                    <span className="text-white text-xs font-medium mb-0.5">{gift.name}</span>
                    <div className="flex items-center gap-1">
                      <img
                        src={COIN_LOGO}
                        className="w-4 h-4"
                        alt="AIKO"
                      />
                      <span className="text-white/90 text-sm">{gift.coins}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          <button className="ml-2 w-10 h-10 rounded-xl bg-[#27272a] hover:bg-[#3f3f46] text-white flex items-center justify-center transition-colors">
            <span className="transform rotate-180">⌃</span>
          </button>
        </div>


        <div className="px-4 py-1 border-t border-gray-700/50 flex items-center justify-between gap-2">
          <div className="flex flex-row items-center gap-2">
            <Gift className="w-5 h-5 text-pink-500" />
            <span className="text-white font-medium">Send Gifts</span>
            <span className="text-gray-400 text-sm ml-2">Show your support with amazing gifts!</span>
          </div>

          {publicKey && (
            <div className="px-4 py-2 flex items-center gap-2 ">
              <span className="text-white/80 text-sm">AIKO Balance:</span>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1">
                  <img
                    src={COIN_LOGO}
                    className="w-4 h-4"
                    alt="AIKO"
                  />
                  <span className="text-white text-sm font-medium">{usdcBalance.toFixed(1)}</span>
                </div>
                <button
                  onClick={() => setShowRechargeModal(true)}
                  className="bg-[#fe2c55] text-white px-4 py-1.5 rounded-full text-sm font-medium hover:opacity-90 transition-opacity flex items-center gap-2"
                >
                  <Coins size={16} />
                  <span className="hidden lg:inline">Get Coins</span>
                </button>
              </div>
            </div>
          )}
        </div>


      </div>

    </>
  );
}