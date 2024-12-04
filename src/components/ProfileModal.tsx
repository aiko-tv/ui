import { useState, useEffect } from 'react';
import { X, Upload, Copy, ExternalLink, Wallet } from 'lucide-react';
import { useUser } from '../contexts/UserContext';
import { useWallet } from '@solana/wallet-adapter-react';
import { useConnection } from '@solana/wallet-adapter-react';
import { LAMPORTS_PER_SOL } from '@solana/web3.js';

const DEFAULT_PFPS = [
  '/pfp_blue.png',
  '/pfp_green.png',
  '/pfp_orange.png',
  '/pfp_pink.png',
  '/pfp_red.png',
  '/pfp_violet.png',
  '/pfp_yellow.png',
];



export function ProfileModal() {
  const { userProfile, updateProfile, showProfileModal, setShowProfileModal } = useUser();
  const { publicKey, disconnect: disconnectWallet } = useWallet();
  const { connection } = useConnection();
  const [handle, setHandle] = useState(userProfile?.handle || '');
  const [pfp, setPfp] = useState(userProfile?.pfp || DEFAULT_PFPS[0]);
  const [error, setError] = useState('');
  const [balance, setBalance] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const handleSelectFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!handle.trim()) {
      setError('Handle is required');
      return;
    }

    if (handle.length < 3) {
      setError('Handle must be at least 3 characters');
      return;
    }

    updateProfile({
      handle: handle.trim(),
      pfp: selectedFile ? selectedFile : pfp, // Pass the image URL or base64 data here
      isUploading: selectedFile ? true : false,
    });

    setShowProfileModal(false);
  };

  useEffect(() => {
    const fetchBalance = async () => {
      if (publicKey) {
        try {
          const bal = await connection.getBalance(publicKey);
          setBalance(bal / LAMPORTS_PER_SOL);
        } catch (err) {
          console.error('Error fetching balance:', err);
        }
      }
    };

    fetchBalance();
    const interval = setInterval(fetchBalance, 10000);
    return () => clearInterval(interval);
  }, [publicKey, connection]);

  const copyAddress = async () => {
    if (publicKey) {
      await navigator.clipboard.writeText(publicKey.toString());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const openExplorer = () => {
    if (publicKey) {
      window.open(`https://explorer.solana.com/address/${publicKey.toString()}`, '_blank');
    }
  };

  if (!showProfileModal) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full">
        <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
          <h3 className="font-semibold text-lg dark:text-gray-200">
            {userProfile ? 'Update Profile' : 'Create Profile'}
          </h3>
          <button
            onClick={() => userProfile && setShowProfileModal(false)}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
          >
            <X size={20} className="dark:text-gray-200" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {publicKey && (
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Wallet size={16} className="text-gray-500 dark:text-gray-400" />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Wallet
                  </span>
                </div>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {balance !== null ? `${balance.toFixed(4)} SOL` : 'Loading...'}
                </span>
              </div>
              
              <div className="flex items-center gap-2">
                <code className="flex-1 text-xs bg-gray-100 dark:bg-gray-600 p-2 rounded font-mono text-gray-700 dark:text-gray-300 truncate">
                  {publicKey.toString()}
                </code>
                <button
                  type="button"
                  onClick={copyAddress}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-md transition-colors"
                >
                  <Copy size={16} className="text-gray-500 dark:text-gray-400" />
                </button>
                <button
                  type="button"
                  onClick={openExplorer}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-md transition-colors"
                >
                  <ExternalLink size={16} className="text-gray-500 dark:text-gray-400" />
                </button>
              </div>
              
              {copied && (
                <span className="text-xs text-green-600 dark:text-green-400">
                  Address copied to clipboard!
                </span>
              )}
            </div>
          )}

<div>
            <label htmlFor="handle" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Handle
            </label>
            <input
              type="text"
              id="handle"
              value={handle}
              onChange={(e) => setHandle(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#fe2c55] focus:border-transparent"
              placeholder="@username"
            />
            {error && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{error}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Profile Picture
            </label>
            <div className="grid grid-cols-4 gap-2 mb-2">
              {DEFAULT_PFPS.map((url) => (
                <button
                  key={url}
                  type="button"
                  onClick={() => setPfp(url)}
                  className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-colors ${
                    pfp === url 
                      ? 'border-[#fe2c55]' 
                      : 'border-transparent hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
                >
                  <img 
                    src={url} 
                    alt="Profile option" 
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </button>
              ))}
              <label className="aspect-square rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 flex items-center justify-center hover:border-gray-400 dark:hover:border-gray-500">
              <input
                  id="upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleSelectFile}
                />
                {selectedFile ? (
                  <img src={preview || ''} alt="Uploaded preview" className="w-full h-full object-cover rounded-lg" />
                ) : (
                  <button
                    type="button">
                  <Upload size={24} className="text-gray-400 dark:text-gray-500" />
                </button>
                )}
              </label>
            </div>
          </div>


          <button
            type="submit"
            className="w-full bg-gradient-to-r from-[#fe2c55] to-[#ff4975] text-white py-2 px-4 rounded-md font-medium hover:opacity-90 transition-opacity"
          >
            {userProfile ? 'Update Profile' : 'Create Profile'}
          </button>

          <button
            type="button"
            onClick={disconnectWallet}
            className="w-full bg-gradient-to-r outline-1 text-white py-2 px-4 rounded-md font-medium hover:opacity-90 transition-opacity"
          >
            Disconnect Wallet
          </button>
        </form>
      </div>
    </div>
  );
}