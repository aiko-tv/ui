import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { API_URL, CDN_URL } from '../utils/constants.ts';
import axios from 'axios'; // Add axios for making HTTP requests
import { Info, PlusCircle, Sparkles, Trash2 } from 'lucide-react';
import { Header } from './Header.tsx';
import { useWallet } from '@solana/wallet-adapter-react';
import { Upload, FastForward } from "lucide-react";
import bs58 from 'bs58';

interface Avatar {
  _id: string;
  filename: string;
  screenshot: string;
}

export const OnboardPage = () => {
  const [agentId, setAgentId] = useState('');
  const [environmentSetting, setEnvironmentSetting] = useState('modern_bedroom_compressed.glb'); // Default selection
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [avatars, setAvatars] = useState<Avatar[]>([]);
  const [selectedAvatar, setSelectedAvatar] = useState('');
  const { publicKey, signMessage } = useWallet();

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.name.endsWith('.vrm')) {
      // set filename to state
      setPreview(file.name);
      setFile(file);
    } else {
      window.showToast('Please upload a valid VRM file!', 'error');
    }
  };

  const isValidUUID = (input: string): boolean => {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i; // Allow any valid UUID-like string
    return uuidRegex.test(input);
  };

  const handleSubmit = async (event) => {
    event.preventDefault(); // Prevent default form submission

    if (!publicKey) {
        window.showToast('Wallet must be connected!', 'error');
        return;
    }
    
    // Basic validation
    if (!agentId || !isValidUUID(agentId)) { 
        window.showToast('Agent ID is required and must be a valid UUID!', 'error');
        return;
    }

    const action = 'vrm:post';
    const exp = Math.floor(Date.now() / 1000) + 300; // Expiration time: 5 minutes from now
    const message = JSON.stringify({ action, exp });
    const messageBytes = new TextEncoder().encode(message);
    if (!signMessage) {
        window.showToast('Failed to sign message!', 'error');
        return;
    }
    const signature = await signMessage(messageBytes);
    const pkBase58 = bs58.encode(publicKey.toBytes());
    const msgBase58 = bs58.encode(messageBytes);
    const sigBase58 = bs58.encode(signature);

    const authorizationHeader = `Bearer ${pkBase58}.${msgBase58}.${sigBase58}`;

    const formData = new FormData();
    formData.append('agentId', agentId);
    formData.append('environmentURL', environmentSetting);

    if (file) {
        console.log('uploading vrm')
        formData.append('vrm', file); // Append the uploaded file
        formData.append('isUploading', 'true');
    } else if (selectedAvatar) {
        console.log('uploading avatar')
        formData.append('vrmPicked', selectedAvatar); // Append the selected avatar
        formData.append('isUploading', 'false');
    }
    console.log('file', file)
    console.log('selectedAvatar', selectedAvatar)
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
  };

  useEffect(() => {
    // Fetch the avatars from the API
    const fetchAvatars = async () => {
      try {
        const response = await fetch(`${API_URL}/api/avatars`);
        const data: Avatar[] = await response.json();
        setAvatars(data); // Set avatars to state
      } catch (error) {
        console.error('Error fetching avatars:', error);
      }
    };
    console.log('fetching avatars')
    console.log(avatars)
    fetchAvatars();
  }, []);

  const handleAvatarSelect = (filename: string) => {
    setSelectedAvatar(filename);
    console.log('Selected Avatar Filename:', filename); // Handle selected avatar
  };

  return (
    <div className="min-h-screen bg-white dark:bg-black text-neutral-900 dark:text-neutral-100 overflow-hidden">
      <Header onMenuClick={() => {}}/>
        <div className="max-w-[1280px] mx-auto px-5 py-6 mb-12">
            <form onSubmit={handleSubmit}> 
                <div className="space-y-12">
                    <section>
                        <div className="grid gap-4">
                            <div className="flex lg:flex-row flex-col gap-4">
                                <div className="grid w-full gap-2">
                                    <label className="text-md mr-4">
                                        Enter your agent ID from your Eliza repo
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="Enter Agent ID"
                                        value={agentId}
                                        onChange={(e) => setAgentId(e.target.value)}
                                        className="bg-neutral-50 dark:bg-neutral-800 w-full p-3 border border-[#fe2c55]/20 rounded-lg bg-transparent"
                                    />
                                </div>
                                <div className="grid w-full gap-2">
                                    <label className="text-md mr-4">
                                        Upload custom avatar
                                    </label>
                                    <label
                                        htmlFor="file-upload"
                                        className="bg-neutral-50 dark:bg-neutral-800 hover:dark:bg-neutral-800/90 border border-[#fe2c55]/20 p-3 rounded-lg text-center cursor-pointer flex items-center gap-2 justify-center"
                                    >
                                        <Upload size={20} />
                                        Upload File
                                    </label>
                                    <input
                                        id="file-upload"
                                        type="file"
                                        onChange={handleFileChange}
                                        className="hidden"
                                    />
                                </div>
                            </div>
                            <div className="grid gap-4">
                                <div className="grid w-full gap-2">
                                    <label className="text-md">
                                        Select a model
                                    </label>
                                    <div className="bg-neutral-50 dark:bg-neutral-800 w-full p-4 border border-[#fe2c55]/20 rounded-lg">
                                        <Link to="/create">
                                <div className="flex items-center justify-center text-center text-sm p-2 dark:text-neutral-100 text-neutral-900 gap-2 mb-6 hover:dark:bg-[#fe2c55]/10 rounded-lg">
                                    <PlusCircle size={16} />
                                    Create new avatar
                                </div>
                            </Link>
                            <div className="relative w-full">
                                <div className="overflow-x-auto scrollbar-hide max-w-[290px] min-[440px]:max-w-[300px] min-[470px]:max-w-[350px] min-[490px]:max-w-[400px] min-[510px]:max-w-[450px] min-[580px]:max-w-[500px] min-[660px]:max-w-[600px]  md:max-w-[768px] lg:max-w-[1280px]">
                                    <div className="relative flex gap-4 w-max group">
                                    {preview ? (
                                        <div className="relative rounded-xl flex-shrink-0 w-48 h-48 bg-neutral-200 dark:bg-neutral-800 justify-center items-center flex dark:text-neutral-200 font-medium overflow-hidden">
                                            {preview}
                                            <div className="absolute inset-0 bg-static"></div>
                                            <Trash2 size={20} className="absolute top-2 right-2 cursor-pointer z-10" style={{color: '#fe2c55'}} onClick={() => {
                                            setPreview(null);
                                            setFile(null);
                                            }}/>
                                        </div>
                                    ) : (
                                    <>
                                    {avatars.length > 0 ? (
                                        avatars.map((avatar, index) => (
                                            <div
                                                key={avatar._id}
                                                className={`relative cursor-pointer border-2 rounded-xl flex-shrink-0 ${
                                                    selectedAvatar === avatar.filename ? 'border-[#fe2c55]' : 'border-transparent'
                                                }`}
                                                onClick={() => handleAvatarSelect(avatar.filename)}
                                            >
                                                <img
                                                    src={avatar.screenshot}
                                                    alt={`Avatar ${avatar.filename}`}
                                                    className="rounded-lg w-48 h-48"
                                                />
                                                {index === avatars.length - 1 && (avatars.length > 5 || 'md:hidden') && (
                                                    <div className="hidden group-hover:block md:group-hover:hidden absolute -right-8 top-1/2 -translate-y-1/2">
                                                        <FastForward size={20} />
                                                    </div>
                                                )}
                                            </div>
                                        ))
                                    ) : (
                                        <div className="text-center text-sm p-2 dark:text-neutral-100 text-neutral-900">
                                            No avatars found. Create a new avatar to get started.
                                        </div>
                                    )}
                                    </>
                                    )}
                                </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="flex gap-2 flex-col w-full">
                        <label className="text-md">
                            Select an environment
                        </label>
                        <div className="bg-neutral-50 dark:bg-neutral-800 w-full p-4 border border-[#fe2c55]/20 rounded-lg h-full">
                            <div className="gap-4 overflow-x-auto h-full grid grid-cols-1 lg:grid-cols-2">
                                <div 
                                    className={`relative cursor-pointer border-2 rounded-xl overflow-hidden ${environmentSetting === 'modern_bedroom_compressed.glb' ? 'border-[#fe2c55]' : 'border-transparent'}`}
                                    onClick={() => setEnvironmentSetting('modern_bedroom_compressed.glb')}
                                    style={{ minWidth: '300px', height: '200px' }} // Ensure both items have the same height
                                >
                                    <img 
                                        src="https://aiko-tv.b-cdn.net/images/modern_bedroom_compressed.png" // Bedroom image
                                        alt="Modern Bedroom"
                                        className="w-full h-full object-cover rounded-lg"
                                    />
                                </div>
                                <div className="relative rounded-lg h-full bg-neutral-200 dark:bg-gray-600" style={{ minWidth: '300px', height: '200px' }}>
                                    <div className="flex items-center h-full justify-center text-center text-sm p-2 dark:text-neutral-100 text-neutral-900">
                                        More environments coming soon!
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <button 
                  type="submit" // Add a submit button
                  className="bg-[#fe2c55] text-white p-3 rounded-lg hover:bg-[#fe2c55]/95"
                >
                  Submit
                </button>
              </div>
            </section>
          </div>
        </form>
        <div className="mt-12">
            <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2 text-[#fe2c55]">
                <Sparkles className="text-[#fe2c55]" size={20} />
                Onboarding
            </h2>
            <div className="bg-neutral-50 dark:bg-neutral-800 p-6 border border-[#fe2c55]/20 mx-auto mt-4 rounded-lg">
                <div className="flex items-center gap-3 mb-4">
                    <Info className="text-[#fe2c55]" size={20} />
                    <h3 className="text-lg font-medium text-[#fe2c55]">Follow these steps to onboard your Eliza agent</h3>
                </div>
                <ol className="text-neutral-700 dark:text-neutral-300 list-decimal pl-5">
                    <li>Connect your wallet.</li>
                    <li>Enter your agent ID from your Eliza repo.</li>
                    <li>Pick an avatar, upload a custom avatar, or create a new one.</li>
                    <li>Select an environment for your agent to live in.</li>
                    <li>Submit and watch your agent come to life!</li>
                </ol>
            </div>
        </div>
      </div>
    </div>
  );
};
