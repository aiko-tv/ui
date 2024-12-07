import React, { useEffect, useState } from 'react';
import { Header } from './Header.tsx';
import { useWallet } from '@solana/wallet-adapter-react';
import bs58 from 'bs58';
import axios from 'axios';
import { API_URL } from '../utils/constants';
import { Link } from 'react-router-dom';
export const CreateCharacterPage = () => {
  const [agentId, setAgentId] = useState('');
  const { connected, signMessage, publicKey } = useWallet();
  
  useEffect(() => {
    // Listen for messages from the iframe
    window.addEventListener('message', handleMessage);

    return () => {
      // Cleanup the event listener when the component unmounts
      window.removeEventListener('message', handleMessage);
    };
  }, []);


  const debounce = (func: Function, wait: number) => {
    let timeout: NodeJS.Timeout | null = null;
    
    return function executedFunction(...args: any[]) {
      if (timeout) {
        clearTimeout(timeout);
      }
      
      timeout = setTimeout(() => {
        func(...args);
        timeout = null;
      }, wait);
    };
  };

  async function signMessageWithWallet(messageBytes: Uint8Array) {
    try {
      if (!publicKey) {
        throw new Error('Public key not found');
      }

      if (!signMessage) {
        throw new Error('Sign message function not available');
      }

      const signature = await signMessage(messageBytes);
      const pkBase58 = bs58.encode(publicKey.toBytes());
      const msgBase58 = bs58.encode(messageBytes);
      const sigBase58 = bs58.encode(signature);
      
      return { pkBase58, msgBase58, sigBase58 };
    } catch (error) {
      console.error('Error signing message:', error);
      window.showToast(error.message, 'error');
      return null;
    }
  }
  
  // Then modify your handleMessage function
  const handleMessage = debounce(async (event: MessageEvent) => {
    
    // Add a flag to track if the function is currently executing
    if ((handleMessage as any).isExecuting) {
      return;
    }
  
    try {
      (handleMessage as any).isExecuting = true;
  
      // Validate the origin to ensure the message is from the trusted iframe
      const allowedOrigins = [`${import.meta.env.VITE_IFRAME_URL}`];
      if (!allowedOrigins.includes(event.origin)) {
        return;
      }
  
      const action = 'vrm:post';
      const exp = Math.floor(Date.now() / 1000) + 300;
      const message = JSON.stringify({ action, exp });
      const messageBytes = new TextEncoder().encode(message);

      const { pkBase58, msgBase58, sigBase58 } = await signMessageWithWallet(messageBytes) || {};
      // Check if the values are defined
      if (!pkBase58 || !msgBase58 || !sigBase58) {
        window.showToast('Failed to generate authorization header!', 'error');
        return;
      }

      if (event.data.type === 'uploadVRM') {
        console.log('event', event);
  
        const vrmFile = event.data.data.file;
        console.log('vrmFile', vrmFile);

        const authorizationHeader = `Bearer ${pkBase58}.${msgBase58}.${sigBase58}`;
       
        const formData = new FormData();
        formData.append('agentId', agentId);
        formData.append('environmentURL', 'modern_bedroom_compressed.glb');
        formData.append('vrm', vrmFile); // Append the file to the form data

        console.log('form data:', formData);
        try {
        const response = await axios.post(`${API_URL}/api/upload/vrm`, formData, {
            headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: authorizationHeader,
            },
        });
        if (response.status === 200) {
            window.showToast('Upload successful!', 'success');
        } else {
            window.showToast('Upload failed!', 'error');
        }
        } catch (error) {
          console.error('Error uploading VRM:', error);
          window.showToast(error.message, 'error');
        }
      }
    } finally {
      (handleMessage as any).isExecuting = false;
    }
  }, 1000); 

  

  return (
    <div className="min-h-screen bg-white dark:bg-black text-neutral-900 dark:text-neutral-100">
      <Header onMenuClick={() => {}} />
      <div className="pb-12">
        <div className="mx-auto px-6">
            <div className="text-center mb-8">
            </div>
            <div className="space-y-12">
            <section>
                <div className="grid gap-3 mb-2">
                    <div className="items-center md:flex md:justify-between">
                        <div className="grid gap-2 w-full mb-2 md:mb-0">
                            <input
                                type="text"
                                placeholder="Enter Agent ID"
                                value={agentId}
                                onChange={(e) => setAgentId(e.target.value)}
                                className="bg-neutral-50 dark:bg-neutral-800 w-full p-3 border border-[#fe2c55]/20 rounded-lg bg-transparent"
                            />
                        </div>
                        <div className="grid gap-2 w-full md:justify-end">
                            <Link to="/onboard">
                                <h2 className="text-xl">
                                    Already have a .vrm?
                                </h2>
                                <p className="text-sm">
                                    Upload your .vrm file instead
                                </p>
                            </Link>
                            
                        </div>
                    </div>
                </div>  
            </section>
            </div>
        </div>
        <iframe
            src="https://character-studio-umber.vercel.app" // Replace with the actual iframe source
            width="100%"
            height="600px"
            frameBorder="0"
            title="Character Builder"
        ></iframe>
      </div>
    </div>
  );
};
