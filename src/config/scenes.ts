// Unused
import { SceneStats } from '../context/SceneContext';
import { lazy } from 'react';
import {API_URL, STREAMER_ADDRESS} from '../utils/constants';
export interface CreatorProfile {
    username: string;
    title: string;
    avatar: string;
}

export interface SceneConfig {
    id: number;
    title: string;
    agentId: string;
    sceneId: string;
    twitter: string;
    description: string;
    color: string;
    type: 'default' | 'coming-soon' | '3d' | 'stream';
    model?: string;
    modelName?: string;
    component: React.LazyExoticComponent<(props: { color?: string }) => JSX.Element>;
    stats: SceneStats;
    creator?: CreatorProfile;
    walletAddress?: string;
}

// Component mapping for dynamic imports
const componentMapping = {
    'ThreeScene': () => import('../components/3d/ThreeScene'),
    'DefaultScene': () => import('../components/3d/scenes/DefaultScene'),
    'WaveScene': () => import('../components/3d/scenes/WaveScene'),
    'CosmicScene': () => import('../components/3d/scenes/CosmicScene'),
    'ComingSoonScene': () => import('../components/3d/scenes/ComingSoonScene'),
};

// Function to convert API response to SceneConfig
const convertApiResponseToSceneConfig = (apiScene: any): SceneConfig => {
    return {
        ...apiScene,
        component: lazy(componentMapping[apiScene.component as keyof typeof componentMapping] || componentMapping['ThreeScene']),
        type: (apiScene.type || 'default') as SceneConfig['type']
    };
};

// Cache for scene configurations
let cachedScenes: SceneConfig[] | null = null;

// Function to fetch and transform scene configurations
export async function getSceneConfigs(forceRefresh = false): Promise<SceneConfig[]> {
    if (cachedScenes && !forceRefresh) {
        return cachedScenes;
    }

    try {
        // console.log("Fetching scene configurations from API...");
        const response = await fetch(`${API_URL}/api/streams/config`, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            // mode: 'cors' // Explicitly state we want CORS
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const apiData = await response.json();
        // console.log("Fetched scene configurations:", apiData);
        const convertedScenes = apiData.map(convertApiResponseToSceneConfig);
        cachedScenes = convertedScenes;
        return convertedScenes;
    } catch (error) {
        console.error('Error fetching scene configurations:', error);
        return scenesConfig;
    }
}

// Initial scene configurations (fallback data)
export const scenesConfig: SceneConfig[] = [
    {
        id: 0,
        title: "Default Scene",
        agentId: "b850bc30-45f8-0041-a00a-83df46d8555d",
        sceneId: "37b07899-5b75-4ab8-ae44-f8cb6ecaa24f",
        twitter: "@defaultscene",
        modelName: 'default',
        identifier: 'default',
        description: "Interactive Scene",
        color: "#FE2C55",
        type: 'stream',
        component: lazy(() => import('../components/3d/ThreeScene')),
        stats: {
            likes: 0,
            comments: 0,
            bookmarks: 0,
            shares: 0
        },
        creator: {
            username: "Default",
            title: "Virtual Streamer",
            avatar: "https://3d.nicovideo.jp/upload/contents/td83829/f1e0d59ec8e7ee5016a748b6ae3a7_thumb.png"
        },
        walletAddress: STREAMER_ADDRESS
    }
];

// Export a function to get a specific scene by ID
export async function getSceneById(id: number): Promise<SceneConfig | undefined> {
    const scenes = await getSceneConfigs();
    return scenes.find(scene => scene.id === id);
}

// Initialize scenes on module load
getSceneConfigs().catch(console.error);

// Optional: Export a function to force refresh the scenes
export function refreshScenes(): Promise<SceneConfig[]> {
    return getSceneConfigs(true);
}