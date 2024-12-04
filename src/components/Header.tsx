import { Moon, Sun, Circle, Pencil, Coins, Terminal } from 'lucide-react';
import { useWallet } from "@solana/wallet-adapter-react";
import { useConnection } from "@solana/wallet-adapter-react";

import { WalletMultiButton, WalletConnectButton, useWalletModal } from "@solana/wallet-adapter-react-ui";
import { useState, useEffect } from 'react';
import { PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { useTheme } from '../contexts/ThemeContext';
import { useUser } from '../contexts/UserContext';
import { RechargeModal } from './RechargeModal';
import { TerminalOverlay } from './TerminalOverlay';
import { useGiftModal } from '../contexts/GiftContext';
import { AIKO_MINT, COIN_LOGO, CDN_URL } from '../utils/constants';
import { useTokenBalance } from '../hooks/useTokenBalance';

interface HeaderProps {
  onMenuClick: () => void;
}


const COIN_METADATA = {
  symbol: 'AIKO',
  mint: new PublicKey(AIKO_MINT),
  decimals: 6,
  logoURI: COIN_LOGO
};


// const USDC_MINT = 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v';
// const USDC_DECIMALS = 6;

export function Header({ onMenuClick }: HeaderProps) {
  const { connection } = useConnection();
  const { publicKey, connected, connect } = useWallet();
  const { isDarkMode, toggleDarkMode } = useTheme();
  const { userProfile, setShowProfileModal } = useUser();
  const [usdcBalance, setUsdcBalance] = useState<string>('0');
  const [solBalance, setSolBalance] = useState<string>('0');
  const [showTerminal, setShowTerminal] = useState(false);


  const usdcQuery = useTokenBalance(new PublicKey(AIKO_MINT), publicKey);
  // console.log({ usdcQuery, AIKO_MINT, publicKey })
  const aikoBalance = usdcQuery.data?.balance ?? 0;

  const { setShowRechargeModal, showRechargeModal } = useGiftModal();
  // // console.log({ showRechargeModal })

  return (
    <>
      <header className="h-16 bg-white dark:bg-dark-gray-1 border-b border-gray-100 dark:border-dark-gray-3 flex items-center justify-between px-4 z-50">
        <div className="flex items-center gap-2">
          <img
            src="icons/aikotext2.svg"
            alt="Logo"
            className="w-16 h-6 brightness-0 dark:brightness-100"
          />
          <img
            src={`${CDN_URL}/images/bow2.svg`}
            alt="TV Logo"
            className="w-8 h-8 "
          />

          {/* <h1 className="text-lg font-semibold text-gray-900 dark:text-white">Aiko.tv</h1> */}
        </div>

        <div className="flex items-center gap-4">
          {/* <button
            onClick={() => setShowTerminal(!showTerminal)}
            className="p-2 hover:bg-gray-100 dark:hover:bg-dark-gray-3 rounded-full"
          >
            <Terminal size={20} className="text-gray-600 dark:text-gray-400" />
          </button> */}

          <button
            onClick={toggleDarkMode}
            className="p-2 hover:bg-gray-100 dark:hover:bg-dark-gray-3 rounded-full"
          >
            {isDarkMode ? (
              <Sun size={20} className="text-dark-text-secondary" />
            ) : (
              <Moon size={20} />
            )}
          </button>
          {connected ? null : (
            <WalletMultiButton>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <img src="/icons/phantom.svg" alt="Phantom" className="w-4 h-4 mr-2" />
                <span className="hidden md:inline">Connect Wallet</span>
                <span className="md:hidden">Connect</span>
              </div>
            </WalletMultiButton>
          )}

          {connected && (
            <div className="flex items-center gap-4">

              <div className="flex items-center gap-2">
                {/* <div className="flex items-center gap-1 bg-gray-100 dark:bg-dark-gray-3 px-3 py-1.5 rounded-full">
                  <img 
                    src="https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/So11111111111111111111111111111111111111112/logo.png" 
                    className="w-4 h-4" 
                    alt="SOL"
                  />
                  <span className="text-sm font-medium dark:text-dark-text-primary">{solBalance}</span>
                </div> */}
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1 bg-gray-100 dark:bg-dark-gray-3 px-3 py-1.5 rounded-full">
                    <img
                      src={COIN_LOGO}
                      className="w-4 h-4"
                      alt="AIKO"
                    />
                    <span className="text-sm font-medium dark:text-dark-text-primary">{aikoBalance}</span>
                  </div>
                  <button
                    onClick={() => setShowRechargeModal(true)}
                    className="bg-[#fe2c55] text-white px-4 py-1.5 rounded-full text-sm font-medium hover:opacity-90 transition-opacity flex items-center gap-2"
                  >
                    <Coins size={16} />
                    Get Coins
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="relative group">
                  <img
                    src={userProfile?.pfp || ''}
                    alt="Profile"
                    className="w-8 h-8 rounded-full"
                  />
                  <button
                    onClick={() => setShowProfileModal(true)}
                    className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Pencil size={14} className="text-white" />
                  </button>
                  <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white px-2 py-1 rounded text-sm whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
                    {userProfile?.handle || ''}
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>
      </header>


      <RechargeModal
        isOpen={showRechargeModal}
        onClose={() => setShowRechargeModal(false)}
        requiredAmount={100}
        currentBalance="50"
        tokenMetadata={COIN_METADATA}
      />
      <TerminalOverlay
        isOpen={showTerminal}
        onClose={() => setShowTerminal(false)}
      />
    </>
  );
}