import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { API_URL } from '../utils/constants.ts';
import axios from 'axios'; // Add axios for making HTTP requests
import { toast } from 'sonner';


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
        toast.error('Agent ID is required!');
        return;
    }
    if (!file) {
        toast.error('Please select a file to upload!');
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

      setAgentId(''); 
      setFile(null); 
      setEnvironmentSetting('modern_bedroom_compressed.glb'); 

    } catch (error) {
      console.error('Error uploading VRM:', error);
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
                    className="bg-neutral-50 dark:bg-neutral-800 w-full p-3 border border-[#fe2c55]/20 rounded bg-transparent"
                  />
                  <select
                    value={environmentSetting}
                    onChange={(e) => setEnvironmentSetting(e.target.value)}
                    className="bg-neutral-50 dark:bg-neutral-800 w-full p-3 border border-[#fe2c55]/20 rounded select-none"
                  >
                    <option value={environmentSetting}>{environmentSetting}</option>
                  
                  </select>
                </div>
                <input
                  type="file"
                  onChange={handleFileChange}
                  className="bg-neutral-50 dark:bg-neutral-800 w-full p-3 border border-[#fe2c55]/20 rounded"
                />
                <button 
                  type="submit" // Add a submit button
                  className="bg-[#fe2c55] text-white p-3 rounded"
                >
                  Submit
                </button>
              </div>
            </section>
          </div>
        </form>
      </div>
    </div>
  );
};
