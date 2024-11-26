import { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useConnection } from '@solana/wallet-adapter-react';
import { 
  PublicKey, 
  Transaction, 
  LAMPORTS_PER_SOL, 
  SystemProgram 
} from '@solana/web3.js';
import { 
  TOKEN_PROGRAM_ID,
  getAssociatedTokenAddress,
  createAssociatedTokenAccountInstruction,
  createTransferInstruction,
  getAccount,
  Account
} from '@solana/spl-token';
import { Send, Coins, RefreshCw, ExternalLink } from 'lucide-react';

interface Token {
  mint: string;
  symbol: string;
  decimals: number;
}

export const TOKENS: Token[] = [
  {
    mint: "mdx5dxD754H8uGrz6Wc96tZfFjPqSgBvqUDbKycpump",
    symbol: "AIKO",
    decimals: 6
  },
  {
    mint: "Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB",
    symbol: "USDT",
    decimals: 6
  },
  {
    mint: "DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263",
    symbol: "BONK",
    decimals: 5
  }
];

const CONFIRMATION_TIMEOUT = 60000; // 60 seconds

export async function sendTokens(
  connection: any,
  publicKey: PublicKey,
  sendTransaction: any,
  recipient: string,
  amount: number,
  token: Token
) {
  const recipientPubKey = new PublicKey(recipient);
  const transaction = new Transaction();

  const mintPubkey = new PublicKey(token.mint);
  
  // Get the token accounts
  const accounts = await connection.getParsedTokenAccountsByOwner(publicKey, {
    programId: TOKEN_PROGRAM_ID
  });

  const sourceAccount = accounts.value.find(
    (account: any) => account.account.data.parsed.info.mint === token.mint
  );

  if (!sourceAccount) {
    throw new Error('Source token account not found');
  }

  const destinationAta = await getAssociatedTokenAddress(
    mintPubkey,
    recipientPubKey,
    false,
    TOKEN_PROGRAM_ID
  );

  try {
    await getAccount(connection, destinationAta, 'confirmed', TOKEN_PROGRAM_ID);
  } catch (e) {
    transaction.add(
      createAssociatedTokenAccountInstruction(
        publicKey,
        destinationAta,
        recipientPubKey,
        mintPubkey,
        TOKEN_PROGRAM_ID
      )
    );
  }

  const transferAmount = BigInt(Math.floor(amount * Math.pow(10, token.decimals)));
  
  transaction.add(
    createTransferInstruction(
      sourceAccount.pubkey,
      destinationAta,
      publicKey,
      transferAmount,
      [],
      TOKEN_PROGRAM_ID
    )
  );

  const sig = await sendTransaction(transaction, connection);
  
  // Wait for confirmation
  const startTime = Date.now();
  while (Date.now() - startTime < CONFIRMATION_TIMEOUT) {
    const status = await connection.getSignatureStatus(sig);
    if (status.value?.confirmationStatus === 'confirmed' || status.value?.confirmationStatus === 'finalized') {
      return sig;
    }
    if (status.value?.err) {
      throw new Error('Transaction failed');
    }
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  throw new Error('Transaction confirmation timeout');
}

export function TokenTransfer() {
  const { connection } = useConnection();
  const { publicKey, sendTransaction } = useWallet();
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selectedToken, setSelectedToken] = useState<Token | null>(null);
  const [balance, setBalance] = useState<string | null>(null);
  const [tokenAccounts, setTokenAccounts] = useState<Map<string, Account>>(new Map());
  const [airdropLoading, setAirdropLoading] = useState(false);
  const [signature, setSignature] = useState<string | null>(null);

  useEffect(() => {
    if (!publicKey) return;

    const fetchBalances = async () => {
      try {
        const solBalance = await connection.getBalance(publicKey);
        
        if (!selectedToken) {
          setBalance((solBalance / LAMPORTS_PER_SOL).toFixed(4));
        }

        const accounts = await connection.getParsedTokenAccountsByOwner(publicKey, {
          programId: TOKEN_PROGRAM_ID
        });

        const accountMap = new Map<string, Account>();
        for (const { account, pubkey } of accounts.value) {
          try {
            const mintAddress = account.data.parsed.info.mint;
            const amount = account.data.parsed.info.tokenAmount.amount;
            
            accountMap.set(mintAddress, {
              address: new PublicKey(pubkey),
              mint: new PublicKey(mintAddress),
              owner: publicKey,
              amount: BigInt(amount),
              delegate: null,
              delegatedAmount: BigInt(0),
              closeAuthority: null,
            });
          } catch (err) {
            console.error('Error processing token account:', err);
          }
        }
        setTokenAccounts(accountMap);

        if (selectedToken) {
          const tokenAccount = accountMap.get(selectedToken.mint);
          if (tokenAccount) {
            const tokenBalance = Number(tokenAccount.amount) / Math.pow(10, selectedToken.decimals);
            setBalance(tokenBalance.toFixed(4));
          } else {
            setBalance('0');
          }
        }
      } catch (err) {
        console.error('Error in fetchBalances:', err);
        setError('Failed to fetch balances');
      }
    };

    fetchBalances();
    const interval = setInterval(fetchBalances, 10000);
    return () => clearInterval(interval);
  }, [publicKey, connection, selectedToken]);

  const requestAirdrop = async () => {
    if (!publicKey) return;

    try {
      setAirdropLoading(true);
      setError('');
      const signature = await connection.requestAirdrop(publicKey, 1 * LAMPORTS_PER_SOL);
      await connection.confirmTransaction(signature, 'confirmed');
      setSuccess('Airdrop successful! 1 SOL received.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to request airdrop');
    } finally {
      setAirdropLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!publicKey) return;

    try {
      setLoading(true);
      setError('');
      setSuccess('');
      setSignature(null);

      if (!selectedToken) {
        const recipientPubKey = new PublicKey(recipient);
        const transaction = new Transaction();
        
        transaction.add(
          SystemProgram.transfer({
            fromPubkey: publicKey,
            toPubkey: recipientPubKey,
            lamports: Number(amount) * LAMPORTS_PER_SOL,
          })
        );

        const sig = await sendTransaction(transaction, connection);
        setSignature(sig);
        await connection.confirmTransaction(sig, 'confirmed');
      } else {
        const sig = await sendTokens(
          connection,
          publicKey,
          sendTransaction,
          recipient,
          Number(amount),
          selectedToken
        );
        setSignature(sig);
      }
      
      setSuccess('Transaction confirmed successfully!');
      setAmount('');
      setRecipient('');
    } catch (err) {
      console.error('Transfer error:', err);
      setError(err instanceof Error ? err.message : 'Failed to send transaction');
    } finally {
      setLoading(false);
    }
  };

  if (!publicKey) {
    return null;
  }

  return (
    <div className="p-4 bg-white rounded-lg shadow-md max-w-md w-full mx-auto">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Send size={20} className="text-[#fe2c55]" />
          <h2 className="text-lg font-semibold">Send Tokens</h2>
        </div>
        <button
          onClick={requestAirdrop}
          disabled={airdropLoading}
          className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-white bg-[#fe2c55] rounded-md hover:opacity-90 disabled:opacity-50"
        >
          <RefreshCw size={16} className={airdropLoading ? 'animate-spin' : ''} />
          Get 1 SOL
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Select Token
          </label>
          <div className="grid grid-cols-4 gap-2">
            <button
              type="button"
              onClick={() => setSelectedToken(null)}
              className={`p-2 rounded-md text-sm font-medium border ${
                !selectedToken 
                  ? 'border-[#fe2c55] text-[#fe2c55] bg-[#fe2c55]/5' 
                  : 'border-gray-200 text-gray-600 hover:border-gray-300'
              }`}
            >
              SOL
            </button>
            {TOKENS.map((token) => (
              <button
                key={token.mint}
                type="button"
                onClick={() => setSelectedToken(token)}
                className={`p-2 rounded-md text-sm font-medium border ${
                  selectedToken?.mint === token.mint
                    ? 'border-[#fe2c55] text-[#fe2c55] bg-[#fe2c55]/5'
                    : 'border-gray-200 text-gray-600 hover:border-gray-300'
                }`}
              >
                {token.symbol}
              </button>
            ))}
          </div>
        </div>

        {balance !== null && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Coins size={16} />
            <span>Balance: {balance} {selectedToken?.symbol || 'SOL'}</span>
          </div>
        )}

        <div>
          <label htmlFor="recipient" className="block text-sm font-medium text-gray-700 mb-1">
            Recipient Address
          </label>
          <input
            id="recipient"
            type="text"
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#fe2c55] focus:border-transparent"
            placeholder="Enter Solana address"
            required
          />
        </div>

        <div>
          <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">
            Amount
          </label>
          <input
            id="amount"
            type="number"
            step="any"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#fe2c55] focus:border-transparent"
            placeholder="0.0"
            required
          />
        </div>

        {error && (
          <div className="p-3 bg-red-50 text-red-700 rounded-md text-sm">
            {error}
          </div>
        )}

        {success && (
          <div className="p-3 bg-green-50 text-green-700 rounded-md text-sm">
            {success}
          </div>
        )}

        {signature && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <a
              href={`https://explorer.solana.com/tx/${signature}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-[#fe2c55] hover:underline"
            >
              View on Explorer
              <ExternalLink size={14} />
            </a>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-gradient-to-r from-[#fe2c55] to-[#ff4975] text-white py-2 px-4 rounded-md font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Sending...' : `Send ${selectedToken?.symbol || 'SOL'}`}
        </button>
      </form>
    </div>
  );
}