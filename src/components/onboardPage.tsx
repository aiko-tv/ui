import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { API_URL } from '../utils/constants.ts';
import axios from 'axios'; // Add axios for making HTTP requests
import { toast } from 'sonner';
import { Info, Sparkles } from 'lucide-react';


export const OnboardPage = () => {
  const [agentId, setAgentId] = useState('');
  const [environmentSetting, setEnvironmentSetting] = useState('modern_bedroom_compressed.glb'); // Default selection
  const [file, setFile] = useState(null);

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
  };

  const handleSubmit = async (event) => {
    event.preventDefault(); // Prevent default form submission
    // Basic validation
    if (!agentId) {
        window.showToast('Agent ID is required!', 'error');
        return;
    }
    if (!file) {
        window.showToast('Please select a file to upload!', 'error');
        return;
    }

    const formData = new FormData();
    formData.append('agentId', agentId);
    formData.append('environmentURL', 'modern_bedroom_compressed.glb');
    formData.append('vrm', file); // Append the file to the form data


    try {
      const response = await axios.post(`${API_URL}/api/upload/vrm`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      console.log('Upload successful:', response.data);
      window.showToast('Upload successful!', 'success');
      setAgentId(''); 
      setFile(null); 
      setEnvironmentSetting('modern_bedroom_compressed.glb'); 

    } catch (error) {
      console.error('Error uploading VRM:', error);
      window.showToast('Error uploading VRM!', 'error');
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100">
      <Link 
        to="/" 
        className="absolute top-8 left-8 flex flex-col items-center group"
      >
        <img 
          src="/bow1.svg" 
          alt="Bow Logo" 
          className="w-16 h-16 mb-2"
        />
        <span className="text-sm text-[#fe2c55] group-hover:text-[#fe2c55]/80 transition-colors">
          Back to Home
        </span>
      </Link>
      <div className="max-w-4xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
        <div className="text-center mb-20">
          <h1 className="text-4xl font-bold tracking-tight mb-4">
            Aiko Upload
          </h1>
          <p className="text-lg text-[#fe2c55]">
           
          </p>
        </div>

        <form onSubmit={handleSubmit}> 
          <div className="space-y-12">
            <section>
              <div className="grid gap-4">
                <div className="flex lg:flex-row flex-col gap-4">
                  <input
                    type="text"
                    placeholder="Enter Agent ID"
                    value={agentId}
                    onChange={(e) => setAgentId(e.target.value)}
                    className="bg-neutral-50 dark:bg-neutral-800 w-full p-3 border border-[#fe2c55]/20 rounded-lg bg-transparent"
                  />

                  <input
                    type="file"
                    onChange={handleFileChange}
                    className="bg-neutral-50 dark:bg-neutral-800 w-full p-3 border border-[#fe2c55]/20 rounded-lg"
                  />
                  
                </div>
                <div className="bg-neutral-50 dark:bg-neutral-800 w-full p-3 border border-[#fe2c55]/20 rounded-lg">
                  <div className="flex items-center justify-between">
                    <label className="text-md mb-4">
                        Select an environment
                    </label>
                  </div>
                  <div className="grid lg:grid-cols-4 grid-cols-1 gap-4">
                    <div 
                      className={`relative cursor-pointer border-2 rounded-xl overflow-hidden ${environmentSetting === 'modern_bedroom_compressed.glb' ? 'border-[#fe2c55]' : 'border-transparent'}`}
                      onClick={() => setEnvironmentSetting('modern_bedroom_compressed.glb')}
                    >
                      <img 
                        src="https://aiko-tv.b-cdn.net/images/modern_bedroom_compressed.png" // Bedroom image
                        alt="Modern Bedroom"
                        className="w-full h-full rounded-lg"
                      />
                      
                    </div>
                    {/* Placeholder skeleton outline for future images */}
                    <div className="relative rounded-lg h-32 dark:bg-gray-600 bg-neutral-200">
                      <div className="absolute inset-0 flex items-center justify-center text-center text-sm p-2 dark:text-neutral-100 text-neutral-900">
                        More environments coming soon!
                      </div>
                    </div>
                   
                  </div>
                </div>
                <button 
                  type="submit" // Add a submit button
                  className="bg-[#fe2c55] text-white p-3 rounded-lg"
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
                    <li>Enter your agent ID from your Eliza repo.</li>
                    <li>Please upload a VRM file that is compatible with the Aiko platform.</li>
                    <li>Select an environment for your agent to live in.</li>
                    <li>Submit and watch your agent come to life!</li>
                </ol>
            </div>
        </div>
      </div>
    </div>
  );
};
