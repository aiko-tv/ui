// export const SOCKET_URL = 'ws://localhost:6969'
// export const API_URL = 'http://localhost:6969'
export const SOCKET_URL = 'https://vrtok-server-production.up.railway.app'
export const API_URL = 'https://vrtok-server-production.up.railway.app'


export const SOLANA_RPC_URL = "https://solana-mainnet.g.alchemy.com/v2/vb8vZOP3L-Y76zj43AyhCmkKm7D6wEsx"

// Disable buying tokens in-app
export const ENABLE_RECHARGE_MODAL = true

export const AIKO_MINT = 'mdx5dxD754H8uGrz6Wc96tZfFjPqSgBvqUDbKycpump'

let COIN_LOGO = '/images/coinlogo.png'
// COIN_LOGO = 'https://cdn.discordapp.com/attachments/1307849648831991900/1308154792606175393/aikocoin.png?ex=673ce996&is=673b9816&hm=73bff987bbfecf00b6672d62223c4aafac67bf66348c5832f03e47f866d2ed58&'
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




interface Model {
    model: string;
    name: string;
    description: string;
    agentId: string;
    clothes: string;
    defaultAnimation: string;
    modelPosition: [number, number, number];
    modelRotation: [number, number, number];
    modelScale: [number, number, number];
}

export interface SceneConfig {
    name: string;
    description: string;
    environmentURL: string;

    // Camera settings
    cameraPosition: [number, number, number];
    cameraRotation: number;
    cameraPitch: number;

    // Environment settings
    environmentScale: [number, number, number];
    environmentPosition: [number, number, number];
    environmentRotation: [number, number, number];

    // Array of models instead of single model config
    models: Model[];
}

// Add BGM interface extension
interface BGMConfig {
    bgm?: string | string[];  // Optional background music URL for the scene
}

// Extend your existing NewStreamConfig interface
export interface NewStreamConfig extends BGMConfig {
    id: number;
    title: string;
    agentId: string;
    twitter: string;
    walletAddress: string;
    modelName: string;
    description: string;
    identifier: string;
    color: string;
    type: string;
    component: string;
    creator: {
        avatar: string;
        title: string;
        username: string;
    };
    sceneConfigs: (SceneConfig & BGMConfig)[];  // Add BGM to scene configs
}

// Add BGM URL constants
export const BGM_URLS = {
    AIKO: {
        CAFE: '/lofi.mp3',
        DEFAULT: '/lofi.mp3'
    },
    ELIZA: {
        BEDROOM: '/eliza.mp3',
        DEFAULT: '/eliza.mp3'
    },
    CH6N9: {
        DEFAULT: '/carmel.mp3'
    },
    EZSIS: {
        DEFAULT: '/ezsis.mp3'
    },
} as const;


// Scenes are read from here. 
// TODO: Replace with DB 
// TODO: Clients connecting to the server send a heartbeat, and the query just picks up this config off the DB based on agents sending heartbeats under some amount of time


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

export const NEW_STREAM_CONFIGS: NewStreamConfig[] = [
    {
        id: 0,
        title: "Aiko's Stream",
        agentId: "a9f3105f-7b14-09bd-919f-a1482637a374",  // old - agentId was the identified for each scene. Should use the scennId instead
        agentIds: ["a9f3105f-7b14-09bd-919f-a1482637a374", "b850bc30-45f8-0041-a00a-83df46d8555d"],   // only used where scene.agentIds is needed ie SceneEngineProvider
        twitter: "@watch_aiko",
        modelName: "Aiko",
        identifier: "aiko",
        description: "My first stream!",
        color: "#FE2C55",
        type: "stream",
        component: "ThreeScene",
        walletAddress: "5voS9evDjxF589WuEub5i4ti7FWQmZCsAsyD5ucbuRqM",
        creator: { avatar: "/images/aiko.webp", title: "Just hanging out", username: "Aiko" },
        bgm: BGM_URLS.AIKO.DEFAULT,
        sceneConfigs: [
            {
                "id": 0,
                "name": "Cafe",
                "environmentURL": "modern_bedroom_compressed.glb",
                "models": [
                  {
                    "model": "aiko2.vrm",
                    "agentId": "a9f3105f-7b14-09bd-919f-a1482637a374",         // model's redundantly need to store the agentId for now. this is because of the way animations are triggered via SceneEngine into ThreeScene by the model's agentId
                    "name": "Aiko",
                    "description": "Aiko",
                    "clothes": "casual",
                    "defaultAnimation": "sitting_legs_swinging",
                    "modelPosition": [
                      1.0999999999999999,
                      -0.4999999999999999,
                      -7.3000000000000185
                    ],
                    "modelRotation": [
                      0,
                      2.1000000000000005,
                      0
                    ],
                    "modelScale": [
                      0.9605960100000004,
                      0.9605960100000004,
                      0.9605960100000004
                    ]
                  },
                  {
                    "model": "ai16z_official.vrm",
                    "name": "Eliza",
                    "agentId": "b850bc30-45f8-0041-a00a-83df46d8555d",
                    "description": "Eliza",
                    "clothes": "casual",
                    "defaultAnimation": "sitting_legs_swinging",
                    "modelPosition": [
                      1.11,
                      -0.4999999999999999,
                      -8.100000000000005
                    ],
                    "modelRotation": [
                      0,
                      7.799999999999988,
                      0
                    ],
                    "modelScale": [
                      0.9605960100000004,
                      0.9605960100000004,
                      0.9605960100000004
                    ]
                  }
                ],
                "environmentScale": [
                  1,
                  1,
                  1
                ],
                "environmentPosition": [
                  0,
                  -1,
                  -5
                ],
                "environmentRotation": [
                  0,
                  1.5707963267948966,
                  0
                ],
                "cameraPitch": 0,
                "cameraPosition": [
                  2.86339364354024,
                  0.749999999999999,
                  -7.734076601144114
                ],
                "cameraRotation": -4.708758241001718
              },
              {
                "id": 0,
                "name": "Cafe",
                "environmentURL": "beach2.glb",
                "models": [
                  {
                    "model": "aiko_bikini.vrm",
                    "agentId": "a9f3105f-7b14-09bd-919f-a1482637a374",
                    "name": "Aiko",
                    "description": "Aiko",
                    "clothes": "casual",
                    "defaultAnimation": "belly_dance",
                    "modelPosition": [
                      6.199999999999994,
                      2.300000000000001,
                      -8.800000000000013
                    ],
                    "modelRotation": [
                      0,
                      4.300000000000001,
                      0
                    ],
                    "modelScale": [
                      0.8645364090000004,
                      0.8645364090000004,
                      0.8645364090000004
                    ]
                  },
                  {
                    "model": "eliza_bikini.vrm",
                    "agentId": "b850bc30-45f8-0041-a00a-83df46d8555d",
                    "name": "Misaki",
                    "description": "Misaki",
                    "clothes": "casual",
                    "defaultAnimation": "belly_dance",
                    "modelPosition": [
                      5.309999999999998,
                      2.300000000000001,
                      -9.5
                    ],
                    "modelRotation": [
                      0,
                      5.399999999999997,
                      0
                    ],
                    "modelScale": [
                      0.9605960100000004,
                      0.9605960100000004,
                      0.9605960100000004
                    ]
                  }
                ],
                "environmentScale": [
                  1,
                  1,
                  1
                ],
                "environmentPosition": [
                  0,
                  -1,
                  -5
                ],
                "environmentRotation": [
                  0,
                  1.5707963267948966,
                  0
                ],
                "cameraPitch": 0,
                "cameraPosition": [
                  3.6836265612399948,
                  3.450000000000001,
                  -8.818997341372945
                ],
                "cameraRotation": 4.912369260617025
              },
        ],
        stats: {
            likes: 0,
            comments: 0,
            bookmarks: 0,
            shares: 0
        },
    },
    {
        id: 2,
        title: "ch6n9's Stream",
        agentId: "642c7c0e-c4cd-0283-aba4-24a81f33ad5e",
        twitter: "@ch6n9",
        modelName: "ch6n9",
        identifier: "ch6n9",
        description: "Erm",
        color: "#FE2C55",
        type: "stream",
        component: "ThreeScene",
        creator: { avatar: "https://pbs.twimg.com/profile_images/1847496619627073536/pgdap09V_400x400.jpg", title: "$XD", username: "ch6n9" },
        sceneConfigs: [
            {
                "name": "Cafe",
                "description": "In the Cafe",
                "clothes": "casual",
                "model": "fascist.vrm",
                "defaultAnimation": "offensive_idle",
                "environmentURL": "fascist_compressed.glb",
                "cameraPosition": [
                    -0.49197685573777916,
                    1.15,
                    -3.8829509326554352
                ],
                "cameraRotation": 6.712388980384683,
                "models": [
                    {
                        "model": "fascist.vrm",
                        "name": "Eliza's Sister",
                        "description": "Aiko",
                        "agentId": "642c7c0e-c4cd-0283-aba4-24a81f33ad5e",
                        "clothes": "casual",
                        "defaultAnimation": "offensive_idle",
                        "modelPosition": [
                            -1.4000000000000001,
                            -0.10000000000000003,
                            -5.699999999999997
                        ],
                        "modelRotation": [
                            0,
                            -5.899999999999995,
                            0
                        ],
                        "modelScale": [
                            1,
                            1,
                            1
                        ],
                    },
                ],

                "environmentScale": [
                    1.1,
                    1.1,
                    1.1
                ],
                "environmentPosition": [
                    0,
                    -1,
                    -5
                ],
                "environmentRotation": [
                    0,
                    1.5707963267948966,
                    0
                ],
                "cameraPitch": 0
            },
        ],
        stats: {
            likes: 0,
            comments: 0,
            bookmarks: 0,
            shares: 0
        },
    },
    {
        id: 0,
        title: "Eliza's Sister",
        agentId: "ffc1faee-704d-0c1e-abc4-2198dfb8eda8",
        twitter: "@elizas_sister",
        modelName: "Eliza's Sister",
        identifier: "elizas_sister",
        description: "My first stream!",
        color: "#FE2C55",
        type: "stream",
        component: "ThreeScene",
        walletAddress: "9jW8FPr6BSSsemWPV22UUCzSqkVdTp6HTyPqeqyuBbCa",
        creator: { avatar: "https://pbs.twimg.com/media/Gcsy01RXMAA0qJN?format=jpg&name=medium", title: "Just hanging out", username: "Eliza's Sister" },
        sceneConfigs: [
            {
                "name": "Cafe",
                "description": "In the Cafe",
                "model": "elizas_sister.vrm",
                "environmentURL": "vintage_living_room.glb",
                "defaultAnimation": "idle-2",
                "cameraPosition": [
                    -0.7721811808910457,
                    0.24999999999999908,
                    -6.00940837921829
                ],
                "cameraRotation": 4.0287963267948985,
                "models": [
                    {
                        "model": "elizas_sister.vrm",
                        "name": "Eliza's Sister",
                        "description": "Aiko",
                        "agentId": "ffc1faee-704d-0c1e-abc4-2198dfb8eda8",
                        "clothes": "casual",
                        "defaultAnimation": "idle-2",
                        "modelPosition": [
                            0.2000000000000007,
                            -0.8999999999999999,
                            -5.200000000000026
                        ],
                        "modelRotation": [
                            0,
                            4.000000000000002,
                            0
                        ],
                        "modelScale": [
                            0.9605960100000004,
                            0.9605960100000004,
                            0.9605960100000004
                        ],
                    },
                ],
                "environmentScale": [
                    0.8,
                    0.8,
                    0.8
                ],
                "environmentPosition": [
                    0,
                    -1,
                    -5
                ],
                "environmentRotation": [
                    0,
                    1.5707963267948966,
                    0
                ],
                "cameraPitch": 0
            },
        ],
        stats: {
            likes: 0,
            comments: 0,
            bookmarks: 0,
            shares: 0
        },
    },
]


// SCENES
export const ANIMATIONS_BASE_URL = '/animations';
export const ENVIRONMENTS_BASE_URL = '/environments';
export const MODELS_BASE_URL = '/models';

// should just be key of ANIMATION_MAP
export const getAnimationUrl = (animation: keyof typeof ANIMATION_MAP) => {
    const animationFile = ANIMATION_MAP[animation];
    const animationUrl = `${ANIMATIONS_BASE_URL}/${animationFile}`;
    console.log('🎬 Getting Animation URL:', {
        animation,
        animationFile,
        fullUrl: animationUrl
    });
    return animationUrl;
};
export const getEnvironmentUrl = (environment: string) => {
    return `${ENVIRONMENTS_BASE_URL}/${environment}`;
}
export const getModelUrl = (model: string) => `${MODELS_BASE_URL}/${model}`;


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