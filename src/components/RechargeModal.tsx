import { X, Loader2, ChevronLeft } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useConnection } from '@solana/wallet-adapter-react';
import { useWallet } from '@solana/wallet-adapter-react';
import { LAMPORTS_PER_SOL, PublicKey, Transaction, VersionedTransaction } from '@solana/web3.js';
import { useTransactionToast } from '../hooks/useTransactionToast';
import { Buffer } from 'buffer';
import { ENABLE_RECHARGE_MODAL } from '../utils/constants';

const SOL_MINT = new PublicKey('So11111111111111111111111111111111111111112');
const SOL_METADATA = {
  symbol: 'SOL',
  mint: SOL_MINT,
  decimals: 9,
  logoURI: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/So11111111111111111111111111111111111111112/logo.png'
};

interface TokenMetadata {
  symbol: string;
  mint: PublicKey;
  decimals: number;
  logoURI: string;
}

interface RechargeModalProps {
  isOpen: boolean;
  onClose: () => void;
  requiredAmount: number;
  currentBalance: string;
  tokenMetadata: TokenMetadata; // New prop for token metadata
}

interface Package {
  amount: number;
  bonus: number;
  solAmount?: number;
  isLoading?: boolean;
  isSelected?: boolean;
}

interface SwapQuote {
  inAmount: number;
  outAmount: number;
  fee: number;
  priceImpact: number;
}

interface SwapResult {
  transaction: Transaction | VersionedTransaction;
  signers: any[];
}

// Add new state interfaces
interface SwapSettings {
  slippageBps: number;
  priorityFee: number;
}

async function getSwapQuote({
  connection,
  inputMint,
  outputMint,
  amount,
  swapMode,
  decimals,
  slippageBps,
}: {
  connection: any;
  inputMint: PublicKey;
  outputMint: PublicKey;
  amount: number;
  swapMode: 'ExactIn' | 'ExactOut';
  decimals: number;
  slippageBps: number;
}): Promise<SwapQuote> {
  try {
    const adjustedAmount = amount * Math.pow(10, decimals);
    const response = await fetch(
      `https://quote-api.jup.ag/v6/quote?inputMint=${inputMint.toString()}&outputMint=${outputMint.toString()}&amount=${adjustedAmount}&slippageBps=${slippageBps}${swapMode === 'ExactOut' ? '&swapMode=ExactOut' : ''}`
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return {
      inAmount: swapMode === 'ExactOut' ? parseInt(data.inAmount) : adjustedAmount,
      outAmount: swapMode === 'ExactOut' ? adjustedAmount : parseInt(data.outAmount),
      fee: 0,
      priceImpact: parseFloat(data.priceImpact),
    };
  } catch (error) {
    console.error('Error fetching swap quote:', error);
    throw error;
  }
}

async function getSwapTransaction({
  connection,
  wallet,
  inputMint,
  outputMint,
  amount,
  swapMode,
  decimals,
  slippageBps,
  priorityFee,
}: {
  connection: any;
  wallet: PublicKey;
  inputMint: PublicKey;
  outputMint: PublicKey;
  amount: number;
  swapMode: 'ExactIn' | 'ExactOut';
  decimals: number;
  slippageBps: number;
  priorityFee: number;
}): Promise<SwapResult> {
  try {
    const adjustedAmount = amount * Math.pow(10, decimals);
    
    // 1. Get quote first
    console.log('Getting quote for:', {
      inputMint: inputMint.toString(),
      outputMint: outputMint.toString(),
      amount: adjustedAmount,
      swapMode
    });

    const quoteResponse = await fetch(
      `https://quote-api.jup.ag/v6/quote?inputMint=${inputMint.toString()}&outputMint=${outputMint.toString()}&amount=${adjustedAmount}&slippageBps=${slippageBps}${swapMode === 'ExactOut' ? '&swapMode=ExactOut' : ''}`
    );
    
    if (!quoteResponse.ok) {
      const errorData = await quoteResponse.json();
      console.error('Quote error details:', errorData);
      throw new Error(`Quote error! status: ${quoteResponse.status}`);
    }
    
    const quoteData = await quoteResponse.json();
    
    // 2. Get transaction using the quoted route
    const swapRequestData = {
      quoteResponse: quoteData,
      userPublicKey: wallet.toString(),
      wrapAndUnwrapSol: true,
      computeUnitPriceMicroLamports: priorityFee,
      asLegacyTransaction: false,
      useV0: true,
    };

    // console.log('Sending swap request:', swapRequestData);

    const swapResponse = await fetch('https://quote-api.jup.ag/v6/swap', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(swapRequestData)
    });

    if (!swapResponse.ok) {
      const errorData = await swapResponse.json();
      console.error('Swap error details:', errorData);
      throw new Error(`Swap error! status: ${swapResponse.status}`);
    }

    const swapData = await swapResponse.json();
    // console.log('Swap response:', swapData);

    // Create VersionedTransaction instead of Transaction
    const serializedTransaction = Buffer.from(swapData.swapTransaction, 'base64');
    const transaction = VersionedTransaction.deserialize(serializedTransaction);
    
    return {
      transaction,
      signers: [],
    };
  } catch (error) {
    console.error('Error details:', error);
    throw error;
  }
}

export function RechargeModal({
  isOpen,
  onClose,
  requiredAmount,
  currentBalance,
  tokenMetadata,
}: RechargeModalProps) {
  if (!ENABLE_RECHARGE_MODAL) {
    if (!isOpen) return null;
    
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full animate-fade-in">
          <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
            <h3 className="font-semibold text-lg text-gray-900 dark:text-white">
              In-App Purchases Temporarily Offline
            </h3>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
            >
              <X size={20} className="text-gray-500 dark:text-gray-400" />
            </button>
          </div>

          <div className="p-4 space-y-4">
            <p className="text-gray-600 dark:text-gray-300">
              In-app purchases are temporarily offline. You can still purchase {tokenMetadata.symbol} tokens through decentralized exchanges like Jupiter.
            </p>
            
            <a 
              href={`https://jup.ag/swap/SOL-${tokenMetadata.mint}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3 px-4 rounded-lg font-medium text-white bg-[#fe2c55] hover:bg-[#fe2c55]/90 flex items-center justify-center gap-2"
            >
              Purchase on Jupiter
            </a>
          </div>
        </div>
      </div>
    );
  }

  const { connection } = useConnection();
  const { publicKey, sendTransaction } = useWallet();
  const { confirmTransaction } = useTransactionToast();
  const [selectedPackage, setSelectedPackage] = useState<Package | null>(null);
  const [isSwapping, setIsSwapping] = useState(false);
  const [solBalance, setSolBalance] = useState<number>(0);
  const [packages, setPackages] = useState<Package[]>([
    { amount: 20, bonus: 0 },
    { amount: 100, bonus: 5 },
    { amount: 1000, bonus: 10 },
    { amount: 2000, bonus: 15 },
    { amount: 5000, bonus: 25 },
  ]);
  const [settings, setSettings] = useState<SwapSettings>({
    slippageBps: 100, // 1% default
    priorityFee: 3000000, // 0.003 SOL default
  });
  const [step, setStep] = useState<'select' | 'confirm'>('select');
  const [solPriceUSD, setSolPriceUSD] = useState<number | null>(null);

  useEffect(() => {
    async function fetchSolBalance() {
      if (!publicKey || !connection) return;
      try {
        const balance = await connection.getBalance(publicKey);
        setSolBalance(balance / LAMPORTS_PER_SOL);
      } catch (error) {
        console.error('Error fetching SOL balance:', error);
      }
    }
    
    if (isOpen) {
      fetchSolBalance();
      const interval = setInterval(fetchSolBalance, 30000);
      return () => clearInterval(interval);
    }
  }, [publicKey, connection, isOpen]);

  useEffect(() => {
    async function fetchPrices() {
      if (!connection) return;

      setPackages(prevPackages =>
        prevPackages.map(pkg => ({ ...pkg, isLoading: true }))
      );

      const updatedPackages = await Promise.all(
        packages.map(async (pkg) => {
          try {
            const totalAmount = pkg.amount * (1 + pkg.bonus / 100);
            
            const quote = await getSwapQuote({
              connection,
              inputMint: SOL_MINT,
              outputMint: tokenMetadata.mint,
              amount: totalAmount,
              swapMode: 'ExactOut',
              decimals: tokenMetadata.decimals,
              slippageBps: settings.slippageBps,
            });

            return {
              ...pkg,
              solAmount: quote.inAmount / LAMPORTS_PER_SOL,
              isLoading: false,
            };
          } catch (error) {
            console.error(`Error fetching price for ${pkg.amount} ${tokenMetadata.symbol}:`, error);
            return {
              ...pkg,
              solAmount: undefined,
              isLoading: false,
            };
          }
        })
      );

      setPackages(updatedPackages);
    }

    if (isOpen) {
      fetchPrices();
      const interval = setInterval(fetchPrices, 30000);
      return () => clearInterval(interval);
    }
  }, [connection, isOpen, tokenMetadata, settings]);

  useEffect(() => {
    async function fetchSolPrice() {
      try {
        const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd');
        const data = await response.json();
        setSolPriceUSD(data.solana.usd);
      } catch (error) {
        console.error('Error fetching SOL price:', error);
      }
    }

    if (isOpen) {
      fetchSolPrice();
      const interval = setInterval(fetchSolPrice, 60000); // Update every minute
      return () => clearInterval(interval);
    }
  }, [isOpen]);

  const handlePackageSelect = (pkg: Package) => {
    if (!pkg.solAmount || isSwapping) return;
    setPackages(prevPackages =>
      prevPackages.map(p => ({
        ...p,
        isSelected: p.amount === pkg.amount
      }))
    );
    setSelectedPackage(pkg);
    setStep('confirm');
  };

  const handlePurchase = async () => {
    if (!selectedPackage?.solAmount || !publicKey || !connection || isSwapping) return;
    
    try {
      setIsSwapping(true);

      const totalAmount = selectedPackage.amount * (1 + selectedPackage.bonus / 100);
      
      const swapTx = await getSwapTransaction({
        connection,
        wallet: publicKey,
        inputMint: SOL_MINT,
        outputMint: tokenMetadata.mint,
        amount: totalAmount,
        swapMode: 'ExactOut',
        decimals: tokenMetadata.decimals,
        slippageBps: settings.slippageBps,
        priorityFee: settings.priorityFee,
      });

      const signature = await sendTransaction(swapTx.transaction, connection, {
        skipPreflight: false,
        maxRetries: 3,
        preflightCommitment: 'confirmed'
      });
      
      let confirmed = false;
      let retries = 0;
      const maxRetries = 3;
      
      while (!confirmed && retries < maxRetries) {
        try {
          await confirmTransaction(
            signature,
            `Swapping ${selectedPackage.solAmount.toFixed(4)} SOL for ${totalAmount} ${tokenMetadata.symbol}`,
            60000
          );
          confirmed = true;
        } catch (error) {
          retries++;
          if (retries >= maxRetries) throw error;
          // console.log(`Retry ${retries} of ${maxRetries}`);
        }
      }

      if (confirmed) {
        window.showToast('Transaction successful!', 'success');
        onClose();
      }
    } catch (error) {
      console.error('Swap error details:', error);
      let errorMessage = 'Transaction failed. ';
      
      if (error.message?.includes('Simulation failed')) {
        errorMessage += 'Transaction would fail. Please try with different settings.';
      } else if (error.message?.includes('insufficient funds')) {
        errorMessage += 'Insufficient funds for transaction.';
      } else if (error.message?.includes('blockhash')) {
        errorMessage += 'Please try again (blockhash expired).';
      } else {
        errorMessage += 'Please try again with a higher priority fee.';
      }
      
      window.showToast(errorMessage, 'error');
    } finally {
      setIsSwapping(false);
    }
  };

  // Add new helper components
  const ConfirmationStep = () => {
    const totalAmount = selectedPackage!.amount * (1 + selectedPackage!.bonus / 100);
    
    return (
      <div className="animate-slide-up space-y-4">
        <button 
          onClick={() => setStep('select')}
          className="flex items-center gap-2 text-gray-400 hover:text-gray-200 transition-colors"
        >
          <ChevronLeft size={20} />
          <span>Back to packages</span>
        </button>

        <div className="bg-gray-700/50 rounded-lg p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-400">Your Balance</span>
            <div className="flex items-center gap-2">
              <img
                src={SOL_METADATA.logoURI}
                className="w-5 h-5"
                alt="SOL"
              />
              <div className="flex flex-col items-end">
                <span className="font-medium text-white">
                  {solBalance.toFixed(4)} SOL
                </span>
                {solPriceUSD && (
                  <span className="text-xs text-gray-400">
                    ≈ ${(solBalance * solPriceUSD).toFixed(2)} USD
                  </span>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-400">Amount</span>
            <div className="flex items-center gap-2">
              <img
                src={tokenMetadata.logoURI}
                className="w-5 h-5"
                alt={tokenMetadata.symbol}
              />
              <span className="font-medium text-white">{totalAmount} {tokenMetadata.symbol}</span>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-400">Cost</span>
            <div className="flex items-center gap-2">
              <img
                src={SOL_METADATA.logoURI}
                className="w-5 h-5"
                alt="SOL"
              />
              <div className="flex flex-col items-end">
                <span className="font-medium text-white">
                  {selectedPackage!.solAmount?.toFixed(4)} SOL
                </span>
                {solPriceUSD && (
                  <span className="text-xs text-gray-400">
                    ≈ ${(selectedPackage!.solAmount! * solPriceUSD).toFixed(2)} USD
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-400">Slippage Tolerance</span>
            <select
              value={settings.slippageBps}
              onChange={(e) => setSettings(prev => ({ ...prev, slippageBps: Number(e.target.value) }))}
              className="bg-gray-700 text-white rounded px-2 py-1 text-sm border border-gray-600"
            >
              <option value="50">0.5%</option>
              <option value="100">1%</option>
              <option value="200">2%</option>
              <option value="300">3%</option>
              <option value="500">5%</option>
            </select>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-400">Priority Fee</span>
            <select
              value={settings.priorityFee}
              onChange={(e) => setSettings(prev => ({ ...prev, priorityFee: Number(e.target.value) }))}
              className="bg-gray-700 text-white rounded px-2 py-1 text-sm border border-gray-600"
            >
              <option value="2000000">0.002 SOL</option>
              <option value="3000000">0.003 SOL</option>
              <option value="5000000">0.005 SOL</option>
            </select>
          </div>
        </div>
      </div>
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full animate-fade-in">
        <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
          <h3 className="font-semibold text-lg text-gray-900 dark:text-white">
            {step === 'select' ? `Get ${tokenMetadata.symbol}` : 'Confirm Purchase'}
          </h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
            disabled={isSwapping}
          >
            <X size={20} className="text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        <div className="p-4 space-y-3">
          {step === 'select' ? (
            <div className="animate-slide-up space-y-4">
              <div className="flex items-center justify-between px-2 mb-4">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Your SOL Balance:
                </span>
                <div className="flex items-center gap-1">
                  <img src={SOL_METADATA.logoURI} className="w-4 h-4" alt="SOL" />
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {solBalance.toFixed(4)}
                    {solPriceUSD && (
                      <span className="text-gray-500 dark:text-gray-400 ml-1">
                        (${(solBalance * solPriceUSD).toFixed(2)})
                      </span>
                    )}
                  </span>
                </div>
              </div>
              
              {/* Existing packages mapping */}
              {packages.map((pkg) => {
                const totalAmount = pkg.amount * (1 + pkg.bonus / 100);
                const insufficientBalance = pkg.solAmount ? pkg.solAmount > solBalance : false;
                const isDisabled = !pkg.solAmount || insufficientBalance || isSwapping;

                return (
                  <div
                    key={pkg.amount}
                    className={`border ${
                      pkg.isSelected 
                        ? 'border-[#fe2c55] dark:border-[#fe2c55]' 
                        : 'border-gray-200 dark:border-gray-700'
                    } rounded-lg p-4 transition-colors ${
                      isDisabled
                        ? 'opacity-50 cursor-not-allowed'
                        : 'cursor-pointer hover:border-[#fe2c55] dark:hover:border-[#fe2c55]'
                    }`}
                    onClick={() => {
                      if (!isDisabled) {
                        handlePackageSelect(pkg);
                      }
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-[#fe2c55]/10 rounded-lg flex items-center justify-center">
                          <img
                            src={tokenMetadata.logoURI}
                            className="w-8 h-8"
                            alt={tokenMetadata.symbol}
                          />
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900 dark:text-white">
                            {pkg.amount} {tokenMetadata.symbol}
                          </h4>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {pkg.isLoading ? (
                          <Loader2
                            size={16}
                            className="animate-spin text-gray-400"
                          />
                        ) : pkg.solAmount ? (
                          <div className="flex flex-col items-end gap-1">
                            <div className="flex items-center gap-1">
                              <img
                                src={SOL_METADATA.logoURI}
                                className="w-4 h-4"
                                alt="SOL"
                              />
                              <span
                                className={`text-sm font-medium ${
                                  insufficientBalance
                                    ? 'text-red-500 dark:text-red-400'
                                    : 'text-gray-600 dark:text-gray-300'
                                }`}
                              >
                                {pkg.solAmount.toFixed(4)}
                              </span>
                            </div>
                            {solPriceUSD && (
                              <span className="text-xs text-gray-500 dark:text-gray-400">
                                ${(pkg.solAmount * solPriceUSD).toFixed(2)}
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-sm text-red-500">
                            Failed to load
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <ConfirmationStep />
          )}
          
          {/* Modified purchase button */}
          {step === 'confirm' && (
            <button
              onClick={handlePurchase}
              disabled={isSwapping}
              className={`w-full py-3 px-4 rounded-lg font-medium text-white transition-colors ${
                isSwapping
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-[#fe2c55] hover:bg-[#fe2c55]/90'
              }`}
            >
              {isSwapping ? (
                <div className="flex items-center justify-center gap-2">
                  <Loader2 size={16} className="animate-spin" />
                  <span>Processing...</span>
                </div>
              ) : (
                <span>Confirm Purchase</span>
              )}
            </button>
          )}
        </div>

        <div className="p-4 border-t border-gray-100 dark:border-gray-700">
          <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
            Powered by Jupiter • Prices include network fees
          </p>
        </div>
      </div>
    </div>
  );
}