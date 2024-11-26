import { createContext, useContext, useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
import { useQuery } from '@tanstack/react-query';
import { API_URL } from '../utils/constants';

interface UserProfile {
  handle: string;
  pfp: string;
}

interface UserContextType {
  userProfile: UserProfile | null;
  updateProfile: (profile: UserProfile) => void;
  showProfileModal: boolean;
  setShowProfileModal: (show: boolean) => void;
  publicKey: PublicKey | null;
  connected: boolean;
  isLoading: boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const { publicKey, connected } = useWallet();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [showProfileModal, setShowProfileModal] = useState(false);

  // Query for fetching user profile
  const { data, error, isLoading, refetch } = useQuery({
    queryKey: ['userProfile', publicKey?.toString()],
    queryFn: async () => {
      if (!publicKey) return null;

      try {
        const response = await fetch(`${API_URL}/api/user-profile/${publicKey.toString()}`);
        if (!response.ok) {
          if (response.status === 404) {
            return null; // Profile doesn't exist yet
          }
          throw new Error('Failed to fetch profile');
        }
        return response.json();
      } catch (error) {
        console.error('Error fetching profile:', error);
        throw error;
      }
    },
    enabled: connected && !!publicKey,
    retry: false, // Don't retry on failure
  });

  // Effect to handle profile data changes
  useEffect(() => {
    if (!isLoading) {
      if (data) {
        setUserProfile(data);
        setShowProfileModal(false);
      } else if (connected && publicKey) {
        // Only show modal if we're connected and there's no profile
        setShowProfileModal(true);
      }
    }
  }, [data, isLoading, connected, publicKey]);

  // Effect to reset state when wallet disconnects
  useEffect(() => {
    if (!connected) {
      setUserProfile(null);
      setShowProfileModal(false);
    }
  }, [connected]);

  const updateProfile = async (profile: UserProfile) => {
    if (!publicKey) return;

    try {
      // First, try to fetch the existing profile
      const checkResponse = await fetch(`${API_URL}/api/user-profile/${publicKey.toString()}`);
      const method = checkResponse.status === 404 ? 'POST' : 'PUT';
      const endpoint = method === 'POST' 
        ? `${API_URL}/api/user-profile`
        : `${API_URL}/api/user-profile/${publicKey.toString()}`;

      const response = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...profile,
          publicKey: publicKey.toString(),
        }),
      });

      if (!response.ok) {
        if (response.status === 409) {
          throw new Error('Handle already taken');
        }
        throw new Error('Failed to update profile');
      }

      const updatedProfile = await response.json();
      setUserProfile(updatedProfile);
      setShowProfileModal(false);
      
      // Refetch profile data to ensure consistency
      refetch();
    } catch (error) {
      console.error('Error updating profile:', error);
      const errorMessage = error.message === 'Handle already taken' 
        ? 'This handle is already taken. Please choose another one.'
        : 'Failed to update profile';
      window.showToast?.(errorMessage, 'error');
    }
  };

  return (
    <UserContext.Provider
      value={{
        userProfile,
        updateProfile,
        showProfileModal,
        setShowProfileModal,
        publicKey,
        connected,
        isLoading,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}