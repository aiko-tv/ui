export const SOCKET_URL = import.meta.env.VITE_SOCKET_URL;
export const API_URL = import.meta.env.VITE_API_URL;
export const CDN_URL = import.meta.env.VITE_CDN_URL;

export const SOLANA_RPC_URL = "https://mainnet.helius-rpc.com/?api-key=46d805a5-004b-46bd-9baa-c3d78ef64392"

// Disable buying tokens in-app
export const ENABLE_RECHARGE_MODAL = true

export const AIKO_MINT = 'mdx5dxD754H8uGrz6Wc96tZfFjPqSgBvqUDbKycpump'

let COIN_LOGO = `${CDN_URL}/images/coinlogo.png`
export const AIKO_AGENT_ID = ""

export const SOCKET_EVENTS = {
    CONNECTION: 'connection',
    DISCONNECT: 'disconnect',
    NEW_COMMENT: 'new comment',
    CONNECTED: 'connected'
} as const;

export const STREAMER_ADDRESS = 'mdx5dxD754H8uGrz6Wc96tZfFjPqSgBvqUDbKycpump'; // Default address


export interface Gift {
  id: string;
  name: string;
  coins: number;
  icon: string;
}

export const GIFTS: Gift[] = [
  { id: 'rose', name: 'Rose', coins: 1, icon: '🌹' },
  { id: 'ice-cream', name: 'Ice Cream', coins: 1, icon: '🍦' },
  { id: 'finger-heart', name: 'Finger Heart', coins: 5, icon: '🤍' },
  { id: 'tiny-dino', name: 'Tiny Dino', coins: 10, icon: '🦖' },
  { id: 'silly-dance', name: 'Silly Dance', coins: 1, icon: '🤪' },
  { id: 'jump-for-joy', name: 'Jump for Joy', coins: 1, icon: '🎉' },
  { id: 'rumba', name: 'Rumba Dancing', coins: 5, icon: '💃' },
  { id: 'dolphin', name: 'Dolphin', coins: 1, icon: '🐬' },
  { id: 'hip-hop', name: 'Hip Hop Dancing', coins: 10, icon: '🎵' },
  // { id: 'doughnut', name: 'Doughnut', coins: 30, icon: '🍩' },
  // { id: 'star', name: 'Star', coins: 99, icon: '⭐' },
  // { id: 'live-on-air', name: 'LIVE On Air', coins: 99, icon: '🎭' },
  { id: 'hand-heart', name: 'Hand Heart', coins: 100, icon: '🫶' },
  // { id: 'scarecrow', name: 'Scarecrow', coins: 5000, icon: '🎭' },
];

interface Stats {
  likes: number;
  comments: number;
  bookmarks: number;
  shares: number;
}

interface Model {
  model: string; // model file name -- must be a vrm file located in the public/models folder
  name: string; // model name -- unused
  description: string; // model description -- unused
  agentId: string; // needed to set up animation/aiReply/audio handlers per model, coming in from the server
  clothes: string; // unused
  defaultAnimation: string; // animation to play when the model is loaded
  modelPosition: [number, number, number]; // position of the model in the scene
  modelRotation: [number, number, number]; // rotation of the model in the scene
  modelScale: [number, number, number]; // scale of the model in the scene 
  // ^ Note, adjusting modelScale might lead to some wonky behavior with the model's pivot point. 
  // Instead, you can adjust the environmentScale to achieve the same effect.
}

export interface SceneConfig {

  name: string; // scene name -- unused
  description: string; // scene description -- unused
  environmentURL: string; // environment file name -- must be a glb file located in the public/environments folder

  // Camera settings
  cameraPosition: [number, number, number]; // camera position in the scene
  cameraRotation: number; // camera rotation in the scene
  cameraPitch: number; // camera pitch in the scene

  // Environment settings
  environmentScale: [number, number, number]; // scale of the environment in the scene
  environmentPosition: [number, number, number]; // position of the environment in the scene
  environmentRotation: [number, number, number]; // rotation of the environment in the scene

  // Array of models instead of single model config
  models: Model[];
}

// Extend your existing NewStreamConfig interface
export interface NewStreamConfig {
  id: number;
  title: string;
  agentId: string;
  sceneId: string;
  // ^ right now, when comments are sent to the server, they are sent with the agentId of the model above. (Check the mongo schema in server repo for this)
  // This means that only the agentId specified can read these comments and, in-effect respond to them. Even if there are multiple agents in the scene.
  // This was originally designed for one-agent-per-stream. It will work fine if that's the case.
  // Note: In multi-agent streams This does not stop the other agents from autonomously sending responses through thoughts etc. It just means
  // that only that agentId above can read the comments in chat and reply in this particular stream. 
  twitter: string;
  walletAddress: string;
  modelName: string;
  description: string;
  identifier: string;
  color: string;
  type: string;
  component: string;
  bgm?: string | string[];  // Optional background music URL for the scene
  creator: {
    avatar: string;
    title: string;
    username: string;
  };
  stats: Stats;
  sceneConfigs: (SceneConfig)[];  // Add BGM to scene configs
}


// Adding a new Scene

// 0.) Go to a scene and click the window button between the full-screen and share button. 

// You can move models around and rotate the camera. 
// Controls = WASD + QE for camera movement -- IJKL + UO for model movement and rotation. 
// Numbers 1-9 to select models to control with IJKL + UO. 

// Every render will generate a config in the consolethat you can paste below.

// 1.) Look for this in ThreeScene.tsx
// console.log("THIS IS THE CURRENT CONFIG", JSON.stringify(currentConfig, null, 2));

// 2.) Copy paste the json output into the scene Config below

// 3.) Refresh the page and you should see the new scene!

// Swap in models and environemts as needed.

// Of course, this is far better handled through a managed flow and database.


// SCENES
export const ANIMATIONS_BASE_URL = '/animations';
export const ENVIRONMENTS_BASE_URL = '/environments';
export const MODELS_BASE_URL = '/models';

// should just be key of ANIMATION_MAP
export const getAnimationUrl = (animation: keyof typeof ANIMATION_MAP) => {
    const animationFile = ANIMATION_MAP[animation];
    const animationUrl = `${CDN_URL}${ANIMATIONS_BASE_URL}/${animationFile}`;
    console.log('🎬 Getting Animation URL:', {
        animation,
        animationFile,
        fullUrl: animationUrl
    });
    return animationUrl;
};
export const getEnvironmentUrl = (environment: string) => {
    return `${CDN_URL}${ENVIRONMENTS_BASE_URL}/${environment}`;
}
export const getModelUrl = (model: string) => `${CDN_URL}${MODELS_BASE_URL}/${model}`;


export { COIN_LOGO }


export const ANIMATION_MAP: { [key: string]: string } = {
    "acknowledging": "acknowledging.fbx",
    "angry_gesture": "angry_gesture.fbx",
    "annoyed_head_shake": "annoyed_head_shake.fbx",
    "appearing": "appearing.fbx",
    "being_cocky": "being_cocky.fbx",
    "blow_a_kiss": "blow_a_kiss.fbx",
    "super_excited": "brutal_assassination.fbx",
    "dancing_twerk": "dancing_twerk.fbx",
    "hip_hop_dancing": "hip_hop_dancing.fbx",
    "floating": "idle/floating.fbx",
    "capoeira": "capoeira.fbx",
    "dismissing_gesture": "dismissing_gesture.fbx",
    // "fortnite": "fortnite.fbx",
    "happy_hand_gesture": "happy_hand_gesture.fbx",
    "hard_head_nod": "hard_head_nod.fbx",
    "head_nod_yes": "head_nod_yes.fbx",
    "idle": "idle-2.fbx",
    "idle-2": "idle-2.fbx",
    "idle_basic": "idle.fbx",
    "weight_shift": "weight_shift.fbx",
    "idle_dwarf": "idle/idle_dwarf.fbx",
    "joyful_jump": "joyful_jump.fbx",
    "laughing": "laughing.fbx",
    "lengthy_head_nod": "lengthy_head_nod.fbx",
    "look_away_gesture": "look_away_gesture.fbx",
    "offensive_idle": "offensive_idle.fbx",
    "relieved_sigh": "relieved_sigh.fbx",
    "rumba_dancing": "rumba_dancing.fbx",
    "sarcastic_head_nod": "sarcastic_head_nod.fbx",
    "shaking_head_no": "shaking_head_no.fbx",
    "silly_dancing": "silly_dancing.fbx",
    "sitting_disbelief": "sitting_disbelief.fbx",
    "sitting_legs_swinging": "sitting_legs_swinging.fbx",
    "sitting_yell": "sitting_yell.fbx",
    "sitting": "sitting.fbx",
    "standing_clap": "standing_clap.fbx",
    "thoughtful_head_shake": "thoughtful_head_shake.fbx",
    "walk_with_rifle": "walk_with_rifle.fbx",
    "belly_dance": "dance/belly_dance.fbx",
    "maraschino": "dance/maraschino.fbx",

};


const MESSAGE_TIMEOUTS = {
    "small": 3000,    // For messages < 50 chars
    "medium": 8000,  // For messages 50-150 chars
    "large": 12000    // For messages > 150 chars
}

export const getMessageTimeout = (text: string): number => {
    const charCount = text.length;
    if (charCount < 100) return MESSAGE_TIMEOUTS.small;
    if (charCount <= 200) return MESSAGE_TIMEOUTS.medium;
    return MESSAGE_TIMEOUTS.large;
}


// Used for the gift modal and any other quick lookups
// Should be replaced with DB
export const AGENT_MAP: { [agentId: string]: { name: string, walletAddress: string } } = {
    "a9f3105f-7b14-09bd-919f-a1482637a374": {
        name: "Aiko",
        walletAddress: "AM84n1iLdxgVTAyENBcLdjXoyvjentTbu5Q6EpKV1PeG",
        // twitter: "@watch_aiko",
        // model: "aiko.vrm",
    },
    "b850bc30-45f8-0041-a00a-83df46d8555d": {
        name: "Eliza",
        walletAddress: "AM84n1iLdxgVTAyENBcLdjXoyvjentTbu5Q6EpKV1PeG",
        // twitter: "@watch_fascist",
        // model: "fascist.vrm",
    },
    "ffc1faee-704d-0c1e-abc4-2198dfb8eda8": {
        name: "Eliza's Sister",
        walletAddress: "AM84n1iLdxgVTAyENBcLdjXoyvjentTbu5Q6EpKV1PeG",
        // twitter: "@watch_fascist",
        // model: "fascist.vrm",
    }
}
