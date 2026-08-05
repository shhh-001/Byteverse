import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js";


// ==========================================
// SCENE & RENDERER SETUP (Sunset Theme)
// ==========================================
const scene = new THREE.Scene();
scene.background = new THREE.Color("#f0954b"); 
scene.fog = new THREE.FogExp2("#f2c493", 0.005);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.01, 1000);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 0.55;
document.body.appendChild(renderer.domElement);

const colliders = [];
const walkableSurfaces = [];
const benches = [];
// ==========================================
// VOXEL OAK TREE (MINECRAFT STYLE)
// ==========================================

function createVoxelTree() {
  const treeGroup = new THREE.Group();

  // 1. Materials
  const logMat = new THREE.MeshStandardMaterial({ color: "#765c53", roughness: 0.9 });      // Dark Wood Log
  const slabMat = new THREE.MeshStandardMaterial({ color: "#aa8660", roughness: 0.8 });     // Lighter Wood Slab
  const leafMat = new THREE.MeshStandardMaterial({ 
    color: "#7CB342", 
    roughness: 0.6,
    transparent: true,
    opacity: 0.95
  });

  const B = 1.0; // Block unit size

  // Helper function to build blocks quickly
  function addBlock(x, y, z, mat, w = B, h = B, d = B) {
    const geo = new THREE.BoxGeometry(w, h, d);
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(x * B, y * B, z * B);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    treeGroup.add(mesh);
  }

  // ===== Curved Trunk =====
addBlock(-0.8, 0.25, 0.3, slabMat, 0.8, 0.5, 0.8);
addBlock(0.8, 0.25, -0.3, slabMat, 0.8, 0.5, 0.8);

addBlock(0, 0.5, 0, logMat);
addBlock(0, 1.5, 0, logMat);
addBlock(0, 2.5, 0, logMat);

addBlock(0.8, 3.5, 0, logMat);
addBlock(1.6, 4.5, 0, logMat);
addBlock(1.6, 5.5, 0, logMat);

// Side branch
addBlock(0.8, 4.5, -1, logMat);

  // 3. Leaf Canopy (Layered Box Clusters)
  const leafBlocks = [

    // Top
    [1.6,7.5,0],

    // Upper
    [0.6,6.5,0],
    [1.6,6.5,0],
    [2.6,6.5,0],
    [1.6,6.5,1],
    [1.6,6.5,-1],

    // Middle
    [-0.4,5.5,0],
    [0.6,5.5,0],
    [1.6,5.5,0],
    [2.6,5.5,0],
    [3.6,5.5,0],

    [0.6,5.5,1],
    [1.6,5.5,1],
    [2.6,5.5,1],

    [0.6,5.5,-1],
    [1.6,5.5,-1],
    [2.6,5.5,-1],

    // Left extension
    [-1.4,4.5,0],
    [-2.4,4.5,0],

    // Right extension
    [3.6,4.5,0],
    [4.6,4.5,0],

    // Bottom hanging
    [-1.4,3.5,0],
    [3.6,3.5,0],

    // Front
    [1.6,4.5,2],

    // Back
    [1.6,4.5,-2]
];

  leafBlocks.forEach(([lx, ly, lz]) => {
    addBlock(lx, ly, lz, leafMat);
  });

  return treeGroup;
}

// ==========================================
// SPATIAL POSITIONING & SCENE ADDITION
// ==========================================

const voxelTree = createVoxelTree();

// Size scaling (fit nicely within the museum lobby frame)
voxelTree.scale.set(1, 1, 1);

voxelTree.position.set(0, 0, -4.5); 

scene.add(voxelTree);
createCurvedBench(
    0,
    0,
    -0.5
);
// ==========================================
// AUDIO SYSTEM (assets/music/bgm.mp3)
// ==========================================
const audio = document.getElementById("bg-audio");
const musicBtn = document.getElementById("music-btn");
let isPlaying = false;

function toggleAudio(forcePlay = false) {
    if (!audio) return;

    if (forcePlay || !isPlaying) {
        audio.play().then(() => {
            isPlaying = true;
            if (musicBtn) musicBtn.style.background = "rgba(245, 158, 11, 0.9)";
            console.log("Music playing successfully from assets/music/bgm.mp3");
        }).catch((err) => {
            console.warn("Audio error: Please ensure 'bgm.mp3' exists at assets/music/bgm.mp3", err);
        });
    } else {
        audio.pause();
        isPlaying = false;
        if (musicBtn) musicBtn.style.background = "rgba(255, 255, 255, 0.25)";
    }
}

if (musicBtn) {
    musicBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        toggleAudio();
    });
}

// ==========================================
// LIGHTING
// ==========================================
const ambientLight = new THREE.AmbientLight(0xffffff, 1.1); 
scene.add(ambientLight);

const sunLight = new THREE.DirectionalLight(0xea580c, 1.8); 
sunLight.position.set(-30, 25, -20);
sunLight.castShadow = true;
scene.add(sunLight);

// ==========================================
// OUTSIDE ENVIRONMENT: TREES, CLOUDS, GROUND & WALKWAY
// ==========================================
function createClouds() {
    const cloudMat = new THREE.MeshStandardMaterial({ color: "#f4e4cf", transparent: true, opacity: 0.85 });
    const cloudGroup = new THREE.Group();

    for (let i = 0; i < 22; i++) {
        const puff = new THREE.Mesh(new THREE.DodecahedronGeometry(Math.random() * 5 + 4, 1), cloudMat);
        puff.position.set((Math.random() - 0.5) * 120, Math.random() * 8 + 22, (Math.random() - 0.5) * 100);
        cloudGroup.add(puff);
    }
    scene.add(cloudGroup);
}
createClouds();

const groundMat = new THREE.MeshStandardMaterial({ color: "#3f6212", roughness: 0.9 });
const ground = new THREE.Mesh(new THREE.PlaneGeometry(300, 300), groundMat);
ground.rotation.x = -Math.PI / 2;
ground.position.y = -2.5;
scene.add(ground);

// Walkway path leading up to stairs
const pathMat = new THREE.MeshStandardMaterial({ color: "#78716c", roughness: 0.9 });
const walkway = new THREE.Mesh(new THREE.PlaneGeometry(16, 40), pathMat);
walkway.rotation.x = -Math.PI / 2;
walkway.position.set(0, -2.48, 45);
scene.add(walkway);
walkableSurfaces.push(walkway);

// Dense Trees
function createTrees() {
    const trunkMat = new THREE.MeshStandardMaterial({ color: "#451a03", roughness: 0.9 });
    const foliageMat = new THREE.MeshStandardMaterial({ color: "#15803d", roughness: 0.8 });

    const treePositions = [
        [-32, -2.5, 30], [-36, -2.5, 15], [-35, -2.5, 0], [-38, -2.5, -15], [-32, -2.5, -30],
        [-28, -2.5, 45], [-42, -2.5, 25], [-44, -2.5, -5],
        [32, -2.5, 30], [36, -2.5, 15], [35, -2.5, 0], [38, -2.5, -15], [32, -2.5, -30],
        [28, -2.5, 45], [42, -2.5, 25], [44, -2.5, -5],
        [-20, -2.5, -38], [-10, -2.5, -42], [0, -2.5, -40], [10, -2.5, -42], [20, -2.5, -38]
    ];

    treePositions.forEach(([x, y, z]) => {
        const treeGroup = new THREE.Group();
        const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.8, 1.2, 8, 8), trunkMat);
        trunk.position.y = 4;
        trunk.castShadow = true;
        treeGroup.add(trunk);

        const foliage = new THREE.Mesh(new THREE.DodecahedronGeometry(Math.random() * 2 + 4.5, 1), foliageMat);
        foliage.position.y = 10;
        foliage.castShadow = true;
        treeGroup.add(foliage);

        treeGroup.position.set(x, y, z);
        scene.add(treeGroup);
        colliders.push(trunk);
    });
}
createTrees();

// ==========================================
// MATERIALS
// ==========================================
const wallMat = new THREE.MeshStandardMaterial({ color: "#f9eaf3", roughness: 0.9 });
const terracottaMat = new THREE.MeshStandardMaterial({ color: "#b45309", roughness: 0.7 });
const stoneBaseMat = new THREE.MeshStandardMaterial({ color: "#626064", roughness: 0.8 });
const trimMat = new THREE.MeshStandardMaterial({ color: "#f1f5f9", roughness: 0.4 });
const textureLoader = new THREE.TextureLoader();
const woodTexture = textureLoader.load("textures/wood_floor.jpg");

woodTexture.wrapS = THREE.RepeatWrapping;
woodTexture.wrapT = THREE.RepeatWrapping;
woodTexture.repeat.set(8, 10);
//woodTexture.anisotropy = renderer.capabilities.getMaxAnisotropy();
const floorMat = new THREE.MeshStandardMaterial({
    map: woodTexture,
    roughness: 0.6,
    metalness: 0.05
});
const columnStoneMat = new THREE.MeshStandardMaterial({
    color: "#f7f7f7",
    roughness: 0.85
});
const nicheStoneMat = new THREE.MeshStandardMaterial({
    color:"#cfc5b2",
    roughness:0.85
});
const stoneLineMat = new THREE.MeshStandardMaterial({
    color: "#a8a29e",
    roughness: 1
});
const ceilingMat = new THREE.MeshStandardMaterial({ color: "#362305", roughness: 0.9 });
const doorWoodMat = new THREE.MeshStandardMaterial({ color: "#3a1700", roughness: 0.4 });  
const frameDarkMat = new THREE.MeshStandardMaterial({ color: "#1c1917", roughness: 0.3 }); 
const benchMat = new THREE.MeshStandardMaterial({ color: "#78350f", roughness: 0.6 });
const stairMat = new THREE.MeshStandardMaterial({ color: "#5c0e0e", roughness: 0.5 });
const goldMat = new THREE.MeshStandardMaterial({ color: "#f59e0b", metalness: 0.8, roughness: 0.2 });
const glassMat = new THREE.MeshStandardMaterial({ color: "#fef08a", transparent: true, opacity: 0.75 });
// ==========================================
// BYTEVERSE NEOCLASSICAL EXTERIOR MATERIALS
// ==========================================

const limestoneMat = new THREE.MeshStandardMaterial({
    color: "#ccc3b5",
    roughness: 0.98
});

const agedStoneMat = new THREE.MeshStandardMaterial({
    color: "#d1bda1",
    roughness: 1
});

const marbleMat = new THREE.MeshStandardMaterial({
    color: "#d0bf9c",
    roughness: 0.8
});

const exteriorMetalMat = new THREE.MeshStandardMaterial({
    color: "#111827",
    metalness: 0.8,
    roughness: 0.3
});

const hedgeMat = new THREE.MeshStandardMaterial({
    color: "#365314",
    roughness: 1
});
// ==========================================
// ARCHITECTURE (2-Story Gallery + Exterior Patio)
// ==========================================
const railingGlassMat = new THREE.MeshPhysicalMaterial({
    color: "#dbeafe",
    transparent: true,
    opacity: 0.22,
    transmission: 1,
    roughness: 0,
    thickness: 0.08,
    clearcoat: 1,
    clearcoatRoughness: 0,
    side: THREE.DoubleSide
});

const railingPostMat = new THREE.MeshStandardMaterial({
    color: "#d4af37",
    metalness: 0.9,
    roughness: 0.2
});
const buildingHeight = 18;

// Main Interior Ground Floor
const floor1 = new THREE.Mesh(new THREE.BoxGeometry(40, 0.4, 50), floorMat);
floor1.position.set(0, -0.2, 0);
floor1.receiveShadow = true;
scene.add(floor1);
walkableSurfaces.push(floor1);
colliders.push(floor1);

// ==========================================
// BUILDING FOUNDATION BLOCK
// ==========================================

const foundationMat = new THREE.MeshStandardMaterial({
    color: "#78716c",
    roughness: 0.95
});

const foundation = new THREE.Mesh(
    new THREE.BoxGeometry(40, 2.1, 50),
    foundationMat
);

// sits directly below the interior floor
foundation.position.set(0, -1.45, 0);

foundation.castShadow = true;
foundation.receiveShadow = true;

scene.add(foundation);

// Extended Patio Landing Floor (Spans front entrance seamlessly)
const entranceLanding = new THREE.Mesh(new THREE.BoxGeometry(16, 0.4, 8), stoneBaseMat);
entranceLanding.position.set(0, -0.2, 28);
entranceLanding.receiveShadow = true;
scene.add(entranceLanding);
walkableSurfaces.push(entranceLanding);
colliders.push(entranceLanding);

const leftLanding = new THREE.Mesh(
    new THREE.BoxGeometry(18, 0.4, 6),
    stoneBaseMat
);
leftLanding.position.set(-13, -0.2, 29);
leftLanding.receiveShadow = true;
scene.add(leftLanding);
walkableSurfaces.push(leftLanding);
colliders.push(leftLanding);

const rightLanding = new THREE.Mesh(
    new THREE.BoxGeometry(18, 0.4, 6),
    stoneBaseMat
);
rightLanding.position.set(13, -0.2, 29);
rightLanding.receiveShadow = true;
scene.add(rightLanding);
walkableSurfaces.push(rightLanding);
colliders.push(rightLanding);


function createWall(x, y, z, width, height, depth, customMat = wallMat) {
    const wall = new THREE.Mesh(new THREE.BoxGeometry(width, height, depth), customMat);
    wall.position.set(x, y, z);
    wall.castShadow = true;
    wall.receiveShadow = true;
    scene.add(wall);
    colliders.push(wall);
    return wall;
}
function createRearWindowWall() {

    const glassMat = new THREE.MeshPhysicalMaterial({
    color: "#dbeafe",
    transparent: true,
    opacity: 0.22,
    transmission: 1,
    roughness: 0,
    thickness: 0.15,
    clearcoat: 1,
    clearcoatRoughness: 0,
    side: THREE.DoubleSide
});

    function wall(x,y,w,h){
        createWall(x,y,-25,w,h,1);
    }

    // ===== Upper wall (above windows)
    wall(0,13.5,40,12);

    // ===== Bottom strip
    wall(0,0.5,40,1);

    // ===== Left & Right sides
    wall(-19,4.5,2,7);
    wall(19,4.5,2,7);

    // ===== Window separators
    wall(-11,4.5,2,7);
    wall(-5,4.5,2,7);
    wall(1,4.5,2,7);
    wall(7,4.5,2,7);
    wall(13,4.5,2,7);

    // ===== Glass panes
    const xs=[-15,-9,-3,3,9];

    xs.forEach(x=>{

        const glass=new THREE.Mesh(
            new THREE.PlaneGeometry(4,6.5),

            glassMat

        );

        glass.position.set(x,4.5,-24.45);
        glass.receiveShadow = false;
        glass.castShadow = false;
        scene.add(glass);

    });

}

createWall(-20, buildingHeight / 2, 0, 1, buildingHeight, 50);  
createWall(20, buildingHeight / 2, 0, 1, buildingHeight, 50);   
createRearWindowWall();
createWall(
    -11.125,
    buildingHeight / 2,
    25,
    17.75,
    buildingHeight,
    2.0,
    limestoneMat
);

createWall(
    11.125,
    buildingHeight / 2,
    25,
    17.75,
    buildingHeight,
    2.0,
    limestoneMat
);

createWall(
    0,
    13.15,
    25,
    4.5,
    9.7,
    2.0,
    limestoneMat
);
// Ground Divider Wall
createWall(0, 4, -8, 14, 8, 0.8);

// ==========================================
// CLASSICAL FACADE & CONNECTED EXTERIOR STAIRS
// ==========================================
function createClassicalFacade() {
    const facadeGroup = new THREE.Group();

    //Stone Base Foundation Plinth
    const base = new THREE.Mesh(new THREE.BoxGeometry(44, 2.4, 7), stoneBaseMat);
    base.position.set(0, -1.3, 28.5);
    base.castShadow = true;
    base.receiveShadow = true;
    facadeGroup.add(base);

// ==========================================
// ACTIVE PEDIMENT
// ==========================================

function createPediment(){

    const pedimentShape = new THREE.Shape();

    pedimentShape.moveTo(-10.5,0);
    pedimentShape.lineTo(0,4.8);
    pedimentShape.lineTo(10.5,0);
    pedimentShape.closePath();


    const extrudeSettings = {
        depth:1.5,
        bevelEnabled:true,
        bevelSegments:2,
        bevelSize:0.2,
        bevelThickness:0.2
    };


    const pedimentGeo = new THREE.ExtrudeGeometry(
        pedimentShape,
        extrudeSettings
    );


    const pediment = new THREE.Mesh(
        pedimentGeo,
        //trimMat
        new THREE.MeshStandardMaterial({
        color:"#4e4c4c"
    })
    );


    pediment.position.set(
        0,
        13.7,
        27.5
    );

    pediment.rotation.y = Math.PI;
    pediment.castShadow = true;

    scene.add(pediment);

}


createPediment();


    // Pediment Roof
    const pedimentShape = new THREE.Shape();
    pedimentShape.moveTo(-10.5, 0);
    pedimentShape.lineTo(0, 4.8);
    pedimentShape.lineTo(10.5, 0);
    pedimentShape.closePath();

    const extrudeSettings = { depth: 1.5, bevelEnabled: true, bevelSegments: 2, steps: 1, bevelSize: 0.2, bevelThickness: 0.2 };
    const pedimentGeo = new THREE.ExtrudeGeometry(pedimentShape, extrudeSettings);
    const pediment = new THREE.Mesh(pedimentGeo, trimMat);
    pediment.position.set(0, 13.7, 28.8);
    facadeGroup.add(pediment);

    scene.add(facadeGroup);
}


createClassicalFacade();

// ==========================================
// LIMESTONE BLOCK JOINT DETAILING
// ==========================================

function createStoneJoints(){

    const joints = new THREE.Group();

    // horizontal limestone seams
    for(let y = 1; y < 18; y += 2){

    // LEFT SIDE JOINT
    const leftLine = new THREE.Mesh(
        new THREE.BoxGeometry(
            17,
            0.025,
            0.08
        ),
        stoneLineMat
    );

    leftLine.position.set(
        -11.5,
        y,
        26.05
    );

    joints.add(leftLine);



    // RIGHT SIDE JOINT
    const rightLine = new THREE.Mesh(
        new THREE.BoxGeometry(
            17,
            0.025,
            0.08
        ),
        stoneLineMat
    );

    rightLine.position.set(
        11.5,
        y,
        26.05
    );

    joints.add(rightLine);

}

    // vertical seams (subtle staggered blocks)
    for(let y = 0; y < 18; y += 2){

        for(let x = -18; x <= 18; x += 6){
             if(x > -5 && x < 5) continue;

            const line = new THREE.Mesh(
                new THREE.BoxGeometry(
                    0.025,
                    2,
                    0.08
                ),
                stoneLineMat
            );

            line.position.set(
                x + ((y/2)%2)*3,
                y+1,
                26.05
            );

            joints.add(line);

        }
    }


    scene.add(joints);

}

createStoneJoints();

// ==========================================
// RESIZED & ORNATE DOORWAY SYSTEM
// ==========================================
const doorWidth = 3.8;
const doorHeight = 6.5;
const frameThickness = 0.35;

function createDoorwayAssembly() {
    const doorGroup = new THREE.Group();

    const leftFrame = new THREE.Mesh(new THREE.BoxGeometry(frameThickness, doorHeight + 1.8, 0.6), frameDarkMat);
    leftFrame.position.set(-(doorWidth / 2 + frameThickness / 2), (doorHeight + 1.8) / 2, 25);
    doorGroup.add(leftFrame);

    const rightFrame = new THREE.Mesh(new THREE.BoxGeometry(frameThickness, doorHeight + 1.8, 0.6), frameDarkMat);
    rightFrame.position.set((doorWidth / 2 + frameThickness / 2), (doorHeight + 1.8) / 2, 25);
    doorGroup.add(rightFrame);

    const topArchitrave = new THREE.Mesh(new THREE.BoxGeometry(doorWidth + frameThickness * 2 + 0.4, 0.4, 0.7), trimMat);
    topArchitrave.position.set(0, doorHeight + 1.8, 25);
    doorGroup.add(topArchitrave);

    const transomFrame = new THREE.Mesh(new THREE.BoxGeometry(doorWidth, 1.4, 0.3), frameDarkMat);
    transomFrame.position.set(0, doorHeight + 0.9, 25);
    doorGroup.add(transomFrame);

    const transomGlass = new THREE.Mesh(new THREE.PlaneGeometry(doorWidth - 0.2, 1.2), glassMat);
    transomGlass.position.set(0, doorHeight + 0.9, 25.16);
    doorGroup.add(transomGlass);

    for (let i = -1; i <= 1; i++) {
        const grilleBar = new THREE.Mesh(new THREE.BoxGeometry(0.04, 1.2, 0.02), goldMat);
        grilleBar.position.set(i * 0.9, doorHeight + 0.9, 25.18);
        doorGroup.add(grilleBar);
    }

    scene.add(doorGroup);
}
createDoorwayAssembly();

function createDoorSurround() {

    const surroundMat = limestoneMat;

    // Left
    const left = new THREE.Mesh(
        new THREE.BoxGeometry(0.45, 8.2, 0.5),
        surroundMat
    );
    left.position.set(-2.4, 4.1, 25.4);
    scene.add(left);

    // Right
    const right = left.clone();
    right.position.x = 2.4;
    scene.add(right);

    // Top
    const top = new THREE.Mesh(
        new THREE.BoxGeometry(5.3, 0.45, 0.5),
        surroundMat
    );
    top.position.set(0, 8.15, 25.4);
    scene.add(top);
}

createDoorSurround();

function createStonePlaques() {

    const plaqueMat = new THREE.MeshStandardMaterial({
        color:"#676667",
        roughness:1
    });

    [-15,15].forEach(x=>{

        const plaque=new THREE.Mesh(

            new THREE.BoxGeometry(
                5,
                7,
                0.08
            ),

            plaqueMat
        );

        plaque.position.set(
            x,
            4.8,
            29.85
        );

        scene.add(plaque);

    });

}

createStonePlaques();

function createHedges(){

    const hedgeMat=new THREE.MeshStandardMaterial({
        color:"#355b28",
        roughness:1
    });

    [[-15,31],[15,31]].forEach(p=>{

        const hedge=new THREE.Mesh(

            new THREE.BoxGeometry(
                7.2,
                2,
                2
            ),

            hedgeMat
        );

        hedge.position.set(
            p[0],
            1,
            p[1]
        );

        scene.add(hedge);

    });

}

createHedges();

// ==========================================
// BYTEVERSE GRAND FRONT STAIRS
// ==========================================

function createEntranceStairs(){

    const stairGroup = new THREE.Group();

    const stairMat = new THREE.MeshStandardMaterial({
        color: "#d6d3c8",
        roughness: 0.9
    });

    const stepCount = 8;

    for(let i = 0; i < stepCount; i++){

        const step = new THREE.Mesh(
            new THREE.BoxGeometry(
                20 - i * 0.8,  // width gets smaller upwards
                0.30,
                1.8
            ),
            stairMat
        );


        step.position.set(
            0,
            -2.35 + i * 0.32,
            47 - i * 2
        );


        step.castShadow = true;
        step.receiveShadow = true;


        stairGroup.add(step);

        // allows player to climb
        walkableSurfaces.push(step);
    }


    scene.add(stairGroup);

}


createEntranceStairs();

// ==========================================
// BYTEVERSE IONIC COLUMNS
// ==========================================

function createFrontColumns(){

    const columnGroup = new THREE.Group();

    const positions = [
        -9,
        -5.4,
        -1.8,
         1.8,
         5.4,
         9
    ];


    positions.forEach(x => {

        // Column shaft
        const shaft = new THREE.Mesh(
            new THREE.CylinderGeometry(
                0.65,
                0.8,
                12,
                32
            ),
            columnStoneMat
        );



        shaft.position.set(
            x,
            5.8,
            30
        );

        shaft.castShadow = true;
        shaft.receiveShadow = true;

        columnGroup.add(shaft);

        // Column Fluting
for(let i = 0; i < 8; i++){

    const angle = (i / 8) * Math.PI * 2;

    const groove = new THREE.Mesh(
        new THREE.BoxGeometry(
            0.04,
            10,
            0.08
        ),
        new THREE.MeshStandardMaterial({
            color:"#bfb6a5",
            roughness:0.9
        })
    );


    groove.position.set(
        x + Math.cos(angle) * 0.68,
        6,
        30 + Math.sin(angle) * 0.68
    );


    groove.rotation.y = angle;

    columnGroup.add(groove);

}
        // Base block
        const base = new THREE.Mesh(
            new THREE.BoxGeometry(
                1.6,
                0.35,
                1.6
            ),
            columnStoneMat
        );

        base.position.set(
            x,
            -0.2,
            30
        );

        columnGroup.add(base);


       // Ionic Capital

const capitalBase = new THREE.Mesh(
    new THREE.BoxGeometry(
        2,
        0.35,
        2
    ),
    columnStoneMat
);

capitalBase.position.set(
    x,
    12,
    30
);

columnGroup.add(capitalBase);


// Ionic scrolls (volutes)

for(let side of [-1, 1]){

    const scroll = new THREE.Mesh(
        new THREE.TorusGeometry(
            0.35,
            0.12,
            12,
            24
        ),
        columnStoneMat
    );


    scroll.rotation.x = Math.PI / 2;


    scroll.position.set(
        x + side * 0.55,
        12.25,
        30
    );


    columnGroup.add(scroll);

}

    });


    scene.add(columnGroup);

}

createFrontColumns();

function addColumnBands(){

    [-9,-5.4,-1.8,1.8,5.4,9].forEach(x=>{

        [3.5,6.5,9.5].forEach(y=>{

            const band = new THREE.Mesh(

                new THREE.TorusGeometry(
                    0.73,
                    0.025,
                    8,
                    32
                ),

                new THREE.MeshStandardMaterial({
                    color:"#b8ae9f",
                    roughness:1
                })
            );

            band.rotation.x=Math.PI/2;

            band.position.set(
                x,
                y,
                30
            );

            scene.add(band);

        });

    });

}

addColumnBands();

function addColumnPedestals(){

    [-9,-5.4,-1.8,1.8,5.4,9].forEach(x=>{

        const base=new THREE.Mesh(

            new THREE.BoxGeometry(
                1.9,
                0.55,
                1.9
            ),

            limestoneMat
        );

        base.position.set(
            x,
            -0.45,
            30
        );

        scene.add(base);

    });

}

addColumnPedestals();

[-9,-5.4,-1.8,1.8,5.4,9].forEach(x=>{

    const upperRing=new THREE.Mesh(

        new THREE.TorusGeometry(
            0.78,
            0.05,
            10,
            40
        ),

        columnStoneMat
    );

    upperRing.rotation.x=Math.PI/2;

    upperRing.position.set(
        x,
        12.6,
        30
    );

    scene.add(upperRing);



    const lowerRing=upperRing.clone();

    lowerRing.position.y=13;

    scene.add(lowerRing);

});
// ==========================================
// BYTEVERSE ENTABLATURE
// ==========================================

function createEntablature(){

    const beam = new THREE.Mesh(
        new THREE.BoxGeometry(
            22,
            1.5,
            2.5
        ),
        limestoneMat
    );

    beam.position.set(
        0,
        12.8,
        30
    );

    beam.castShadow = true;
    beam.receiveShadow = true;

    scene.add(beam);

}

createEntablature();

// Decorative shadow cornice
const cornice = new THREE.Mesh(
    new THREE.BoxGeometry(22.5, 0.18, 2.8),
    new THREE.MeshStandardMaterial({
        color: "#8d8578",
        roughness: 1
    })
);

cornice.position.set(0, 12.0, 30.25);
scene.add(cornice);

function createByteverseSign(){

    const canvas = document.createElement("canvas");

    canvas.width = 1024;
    canvas.height = 245;

    const ctx = canvas.getContext("2d");


    // NO BACKGROUND - keep transparent


    ctx.fillStyle = "#070707";

    ctx.font =
    "bold 120px  Times New Roman";

    ctx.textAlign="center";
    ctx.textBaseline="middle";


    ctx.fillText(
        "BYTEVERSE",
        512,
        128
    );


    const texture =
    new THREE.CanvasTexture(canvas);

    texture.needsUpdate = true;


    const sign = new THREE.Mesh(
        new THREE.PlaneGeometry(
            10,
            2
        ),
        new THREE.MeshBasicMaterial({
            map:texture,
            transparent:true
        })
    );


    sign.position.set(
        0,
        15,
        31.3
    );


    scene.add(sign);

}
createByteverseSign();
// ==========================================
// BYTEVERSE TRIANGULAR PEDIMENT
// ==========================================

function createPediment(){

    const shape = new THREE.Shape();

    shape.moveTo(-11,0);
    shape.lineTo(0,5);
    shape.lineTo(11,0);
    shape.closePath();


    const geometry = new THREE.ExtrudeGeometry(
        shape,
        {
            depth: 2,
            bevelEnabled:true,
            bevelThickness:0.2,
            bevelSize:0.2,
            bevelSegments:3
        }
    );


    const pediment = new THREE.Mesh(
        geometry,
        limestoneMat
    );


    pediment.position.set(
        0,
        14,
        29
    );


    pediment.castShadow = true;
    pediment.receiveShadow = true;


    scene.add(pediment);

}

createPediment();

function createInnerPedimentBorder() {

    const mat = new THREE.MeshStandardMaterial({
        color: "#8f8373",
        roughness: 1
    });

    function makeBar(x, y, length, angle) {

        const bar = new THREE.Mesh(
            new THREE.BoxGeometry(length, 0.12, 0.04),
            mat
        );

        bar.position.set(x, y, 31.07);
        bar.rotation.z = angle;

        scene.add(bar);
    }

    makeBar(0, 14.3, 17.5, 0);
    makeBar(-4.5, 15.2, 10, Math.PI / 6);
    makeBar(4.5, 15.2, 10, -Math.PI / 6);

}

createInnerPedimentBorder();



// ==========================================
// BYTEVERSE SIDE WINGS
// ==========================================

function createSideWings(){

    const group = new THREE.Group();


    // LEFT NICHE BACK WALL

    const leftBack = new THREE.Mesh(
        new THREE.BoxGeometry(
            7,
            10,
            0.4
        ),
        nicheStoneMat
    );

    leftBack.position.set(
        -15,
        4.5,
        29.5
    );

    group.add(leftBack);



    // LEFT NICHE SIDE FRAMES

    [-18.5,-11.5].forEach(x=>{

        const frame = new THREE.Mesh(
            new THREE.BoxGeometry(
                0.35,
                10,
                1
            ),
            columnStoneMat
        );

        frame.position.set(
            x,
            4.5,
            29
        );

        group.add(frame);

    });

// RIGHT PANEL SIDE BORDERS

[11.5,18.5].forEach(x=>{

    const frame = new THREE.Mesh(
        new THREE.BoxGeometry(
            0.35,
            10,
            1
        ),
        columnStoneMat
    );

    frame.position.set(
        x,
        4.5,
        29
    );

    group.add(frame);

});

    // RIGHT BLANK PANEL

    const rightPanel = new THREE.Mesh(
        new THREE.BoxGeometry(
            7,
            10,
            0.4
        ),
        nicheStoneMat
    );


    rightPanel.position.set(
        15,
        4.5,
        29.5
    );


    group.add(rightPanel);



    scene.add(group);

}

createSideWings();

function addWingTopMolding(x){

    const molding = new THREE.Mesh(

        new THREE.BoxGeometry(7.8,0.25,1),

        columnStoneMat
    );

    molding.position.set(
        x,
        9.6,
        29
    );

    scene.add(molding);

}

addWingTopMolding(-15);
addWingTopMolding(15);

function addPanelBorder(x){

    const borderMat = new THREE.MeshStandardMaterial({
        color:"#a69d90",
        roughness:1
    });

    const top = new THREE.Mesh(
        new THREE.BoxGeometry(5.5,0.12,0.06),
        borderMat
    );

    top.position.set(x,9,29.72);

    scene.add(top);



    const bottom = top.clone();
    bottom.position.y=0;
    scene.add(bottom);



    const left = new THREE.Mesh(

        new THREE.BoxGeometry(0.12,9,0.06),

        borderMat
    );

    left.position.set(x-2.75,4.5,29.72);

    scene.add(left);



    const right = left.clone();

    right.position.x=x+2.75;

    scene.add(right);

}

addPanelBorder(-15);
addPanelBorder(15);

// ==========================================
// RIGHT DECORATIVE PANEL FRAME
// ==========================================


const leftDoorPivot = new THREE.Group();
leftDoorPivot.position.set(-doorWidth / 2, 0, 25);

const rightDoorPivot = new THREE.Group();
rightDoorPivot.position.set(doorWidth / 2, 0, 25);

function createPrettyDoorLeaf(isLeft) {
    const leafGroup = new THREE.Group();
    const leafWidth = doorWidth / 2;

    const leafMesh = new THREE.Mesh(new THREE.BoxGeometry(leafWidth, doorHeight, 0.25), doorWoodMat);
    leafMesh.position.set(isLeft ? leafWidth / 2 : -leafWidth / 2, doorHeight / 2, 0);
    leafMesh.castShadow = true;
    leafGroup.add(leafMesh);

    const panelPosY = [1.8, 4.6];
    panelPosY.forEach(py => {
        const panelTrim = new THREE.Mesh(new THREE.BoxGeometry(leafWidth - 0.4, py === 1.8 ? 2.0 : 2.2, 0.31), goldMat);
        panelTrim.position.set(isLeft ? leafWidth / 2 : -leafWidth / 2, py, 0);
        leafGroup.add(panelTrim);

        const innerWood = new THREE.Mesh(new THREE.BoxGeometry(leafWidth - 0.5, py === 1.8 ? 1.8 : 2.0, 0.33), doorWoodMat);
        innerWood.position.set(isLeft ? leafWidth / 2 : -leafWidth / 2, py, 0);
        leafGroup.add(innerWood);
    });

    const handleX = isLeft ? leafWidth - 0.25 : -leafWidth + 0.25;
    const handleBase = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.8, 0.36), goldMat);
    handleBase.position.set(handleX, 3.2, 0);
    leafGroup.add(handleBase);

    const handleKnob = new THREE.Mesh(new THREE.SphereGeometry(0.12, 12, 12), goldMat);
    handleKnob.position.set(handleX, 3.2, 0.24);
    leafGroup.add(handleKnob);

    return leafGroup;
}

leftDoorPivot.add(createPrettyDoorLeaf(true));
rightDoorPivot.add(createPrettyDoorLeaf(false));
scene.add(leftDoorPivot);
scene.add(rightDoorPivot);

const doorWallBox = new THREE.Mesh(new THREE.BoxGeometry(doorWidth, doorHeight, 0.4), doorWoodMat);
doorWallBox.position.set(0, doorHeight / 2, 25);
colliders.push(doorWallBox);

let isDoorOpen = false;

function toggleDoor() {
    if (!isDoorOpen) {
        leftDoorPivot.rotation.y = -Math.PI * 0.55;
        rightDoorPivot.rotation.y = Math.PI * 0.55;
        
        const index = colliders.indexOf(doorWallBox);
        if (index > -1) colliders.splice(index, 1);
        isDoorOpen = true;
    }
}
function closeDoor() {

    if (isDoorOpen) {

        leftDoorPivot.rotation.y = 0;
        rightDoorPivot.rotation.y = 0;

        // Add door collision back
        if (!colliders.includes(doorWallBox)) {
            colliders.push(doorWallBox);
        }

        isDoorOpen = false;

    }

}
// ==========================================
// FIRST FLOOR MEZZANINE
// ==========================================
function createUpperFloorWithHole() {
    const floorLeft = new THREE.Mesh(new THREE.BoxGeometry(12, 0.3, 50), floorMat);
    floorLeft.position.set(-14, 8, 0);
    floorLeft.receiveShadow = true;
    scene.add(floorLeft);
    walkableSurfaces.push(floorLeft);
    colliders.push(floorLeft);

    const floorBack = new THREE.Mesh(new THREE.BoxGeometry(16, 0.3, 10), floorMat);
    floorBack.position.set(0, 8, -20);
    floorBack.receiveShadow = true;
    scene.add(floorBack);
    walkableSurfaces.push(floorBack);
    colliders.push(floorBack);


    const floorRightBack = new THREE.Mesh(new THREE.BoxGeometry(12, 0.3, 21), floorMat);
    floorRightBack.position.set(14, 8, -14.5);
    floorRightBack.receiveShadow = true;
    scene.add(floorRightBack);
    walkableSurfaces.push(floorRightBack);
    colliders.push(floorRightBack);

    
}
createUpperFloorWithHole();

const ceiling = new THREE.Mesh(new THREE.BoxGeometry(40, 0.3, 50), ceilingMat);
ceiling.position.set(0, buildingHeight, 0);
ceiling.receiveShadow = true;
scene.add(ceiling);
colliders.push(ceiling);

// ==========================================
// CHANDELIER
// ==========================================
function createChandelier() {

    const chandelierGroup = new THREE.Group();

    // ==========================
    // Hanging Rod
    // ==========================
    const rod = new THREE.Mesh(
        new THREE.CylinderGeometry(0.12, 0.12, 5.5, 24),
        goldMat
    );
    rod.position.y = buildingHeight - 2.8;
    chandelierGroup.add(rod);

    // ==========================
    // TOP RING
    // ==========================
    const topRing = new THREE.Mesh(
        new THREE.TorusGeometry(3.2, 0.15, 20, 60),
        goldMat
    );
    topRing.rotation.x = Math.PI / 2;
    topRing.position.y = buildingHeight - 5.5;
    chandelierGroup.add(topRing);

    // ==========================
    // MIDDLE RING
    // ==========================
    const middleRing = new THREE.Mesh(
        new THREE.TorusGeometry(2.4, 0.13, 20, 60),
        goldMat
    );
    middleRing.rotation.x = Math.PI / 2;
    middleRing.position.y = buildingHeight - 6.8;
    chandelierGroup.add(middleRing);

    // ==========================
    // LOWER RING
    // ==========================
    const lowerRing = new THREE.Mesh(
        new THREE.TorusGeometry(1.5, 0.11, 20, 60),
        goldMat
    );
    lowerRing.rotation.x = Math.PI / 2;
    lowerRing.position.y = buildingHeight - 8;
    chandelierGroup.add(lowerRing);

    // ==========================
    // Crystal Spheres
    // ==========================
    const crystalMat = new THREE.MeshPhysicalMaterial({
    color: "#fff8dc",
    emissive: "#ffe8a3",
    emissiveIntensity: 1.8,
    transmission: 1,
    transparent: true,
    opacity: 0.95,
    roughness: 0,
    thickness: 0.4,
    clearcoat: 1
});

    function addCrystals(radius, y, count){

        for(let i=0;i<count;i++){

            const angle=(i/count)*Math.PI*2;

            const crystal=new THREE.Mesh(
                new THREE.SphereGeometry(0.22,18,18),
                crystalMat
            );

            crystal.position.set(
                Math.cos(angle)*radius,
                y,
                Math.sin(angle)*radius
            );

            chandelierGroup.add(crystal);
        }

    }

    addCrystals(3.2, buildingHeight-5.5, 18);
    addCrystals(2.4, buildingHeight-6.8, 14);
    addCrystals(1.5, buildingHeight-8, 10);

    // ==========================
    // Bottom Crystal
    // ==========================
    const pendant = new THREE.Mesh(
        new THREE.OctahedronGeometry(0.45),
        crystalMat
    );

    pendant.position.y = buildingHeight - 9;
    chandelierGroup.add(pendant);

    // ==========================
    // Main Light
    // ==========================
    const mainLight = new THREE.PointLight(
    0xfff2cc,
    15,
    35,
    1.5
);

    mainLight.position.set(0,buildingHeight-6.5,0);
    mainLight.castShadow=true;

    chandelierGroup.add(mainLight);

    // ==========================
    // Secondary Glow
    // ==========================
    const glow1 = new THREE.PointLight(
    0xfff7d6,
    2,
    35,
    2
);

    glow1.position.set(0,buildingHeight-8,0);

    chandelierGroup.add(glow1);
    const ambient = new THREE.AmbientLight(
    0xfff5dc,
    0.15
);

    chandelierGroup.add(ambient);
    scene.add(chandelierGroup);
}
createChandelier();

// Exterior wall lights
createWallLight(-7.8, 13, 26);
createWallLight(-5.2, 13, 26);
createWallLight(-2.6, 13, 26);

createWallLight(2.6, 13, 26);
createWallLight(5.2, 13, 26);
createWallLight(7.8, 13, 26);
// ==========================================
// INTERIOR STAIRCASE
// ==========================================
function createStaircase() {
    const stepCount = 18;
    const stepWidth = 6;
    const totalHeight = 8.0;
    const totalDepth = 16.0;

    for (let i = 0; i < stepCount; i++) {
        const h = totalHeight / stepCount;
        const d = totalDepth / stepCount;

        const step = new THREE.Mesh(new THREE.BoxGeometry(stepWidth, h, d), stairMat);
        const stepX = 14;
        const stepY = (i * h) + (h / 2);
        const stepZ = 12 - (i * d);

        step.position.set(stepX, stepY, stepZ);
        step.castShadow = true;
        step.receiveShadow = true;
        scene.add(step);
        walkableSurfaces.push(step);
    }
}

function createGlassRailings(){

    const railingGroup = new THREE.Group();

    function addGlassSection(x,y,z,width,rotation=0){

        const section=new THREE.Group();

        // Glass
        const glass=new THREE.Mesh(
            new THREE.BoxGeometry(width,1.4,0.05),
            railingGlassMat
        );

        glass.position.y=0.75;
        section.add(glass);

        // Posts
        for(let i=-1;i<=1;i++){

            const post=new THREE.Mesh(
                new THREE.BoxGeometry(0.08,1.5,0.08),
                railingPostMat
            );

            post.position.set(i*(width/2),0.75,0);

            section.add(post);

        }

        section.position.set(x,y,z);
        section.rotation.y=rotation;

        railingGroup.add(section);

    }

    // ---------- First Floor Opening ----------

    addGlassSection(0,8,-15,16);

    //addGlassSection(0,8,15,16);

    addGlassSection(-8,8,0,20,Math.PI/2);

    addGlassSection(8,8,-10,10,Math.PI/2);


    scene.add(railingGroup);

}
createStaircase();
createGlassRailings();
// ==========================================
// SKETCH LOADER
// ==========================================


function createFallbackTexture(titleText) {
    const canvas = document.createElement('canvas');
    canvas.width = 512; canvas.height = 640;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = "#f8fafc";
    ctx.fillRect(0, 0, 512, 640);
    ctx.strokeStyle = "#334155";
    ctx.lineWidth = 14;
    ctx.strokeRect(20, 20, 472, 600);

    ctx.fillStyle = "#0f172a";
    ctx.font = "bold 34px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(titleText, 256, 320);

    return new THREE.CanvasTexture(canvas);
}

function createPainting(x, y, z, rotY, filename, sketchNum, width = 4.6, height = 6.0){
    const group = new THREE.Group();

    const frame = new THREE.Mesh(
    new THREE.BoxGeometry(width + 0.35, height + 0.35, 0.10),
    frameDarkMat
);

frame.position.z = 0.05;
frame.castShadow = true;
frame.renderOrder = 1;
group.add(frame);

    const canvasMat = new THREE.MeshBasicMaterial({
    side: THREE.DoubleSide,
    transparent: true
});

canvasMat.depthWrite = false;
        
    textureLoader.load(
        `assets/sketches/${filename}.jpeg`,
        (tex) => { 
            canvasMat.map = tex; 
            canvasMat.needsUpdate = true;
        },
        undefined,
        () => {
            textureLoader.load(
                `assets/sketches/${filename}.jpg`,
                (tex) => {
                    canvasMat.map = tex;
                    canvasMat.needsUpdate = true;
                },
                undefined,
                () => {
                    canvasMat.map = createFallbackTexture(`Sketch #${sketchNum}`);
                    canvasMat.needsUpdate = true;
                }
            );
        }
    );

    const canvasMesh = new THREE.Mesh(
    new THREE.PlaneGeometry(width, height),
    canvasMat
);

canvasMesh.position.z = 0.12;
canvasMesh.renderOrder = 2;
    group.add(canvasMesh);

    const wallOffset = 0.35;

let finalX = x;
let finalZ = z;

if (rotY === 0) {
    // Back wall
    finalZ += wallOffset;
}
else if (rotY === Math.PI) {
    // Front wall
    finalZ -= wallOffset;
}
else if (rotY === Math.PI / 2) {
    // Left wall
    finalX += wallOffset;
}
else if (rotY === -Math.PI / 2) {
    // Right wall
    finalX -= wallOffset;
}

group.position.set(finalX, y, finalZ);
    group.rotation.y = rotY;
    scene.add(group);
}

// Paintings
createPainting(-10, 4.5, -7.5, 0, "sketch1", 1);
createPainting(10, 4.5, -7.5, 0, "sketch2", 2);
createPainting(-19.4, 4.5, 0, Math.PI / 2, "sketch3", 3);
createPainting(19.4, 4.5, -12, -Math.PI / 2, "sketch4", 4);
createPainting(-13, 12.5, -24.15, 0, "sketch5", 5);
createPainting(13, 12.5, -24.15, 0, "sketch6", 6);
createPainting(-19.4, 12.5, 5, Math.PI / 2, "sketch7", 7);
createPainting(19.15, 12.8, 5, -Math.PI / 2, "sketch8", 8, 5.2, 7.0);

// sofa
function createSofa(x, y, z, rotation = 0) {

    const sofa = new THREE.Group();

    const fabric = new THREE.MeshStandardMaterial({
        color: "#6f4f4f",
        roughness: 0.9
    });

    // Seat
    const seat = new THREE.Mesh(
        new THREE.BoxGeometry(9, 0.8, 3.2),
        fabric
    );
    seat.position.y = 0.5;
    sofa.add(seat);

    // Backrest
    const back = new THREE.Mesh(
        new THREE.BoxGeometry(9, 2, 0.5),
        fabric
    );
    back.position.set(0, 1.35, -1.15);
    sofa.add(back);

    // Left arm
    const leftArm = new THREE.Mesh(
        new THREE.BoxGeometry(0.5, 1.5, 3.2),
        fabric
    );
    leftArm.position.set(-4.75, 0.95, 0);
    sofa.add(leftArm);

    // Right arm
    const rightArm = leftArm.clone();
    rightArm.position.x = 4.75;
    sofa.add(rightArm);

    sofa.position.set(x, y, z);
    sofa.rotation.y = rotation;

    sofa.userData.type = "sofa";
    sofa.userData.sitRadius = 5;

    scene.add(sofa);

    benches.push(sofa);
    colliders.push(sofa);
}

createSofa(
    0,
    0,
    -10.5,
    Math.PI
);

function createFloorLamp(x, y, z) {

    const lamp = new THREE.Group();

    // Base
    const base = new THREE.Mesh(
        new THREE.BoxGeometry(0.45, 0.05, 0.45),
        new THREE.MeshStandardMaterial({
            color: "#202020",
            metalness: 0.7,
            roughness: 0.4
        })
    );
    base.castShadow = true; 
    base.position.y = 0.025;
    lamp.add(base);

    // Pole
    const pole = new THREE.Mesh(
        new THREE.CylinderGeometry(0.03, 0.03, 5.2, 12),
        new THREE.MeshStandardMaterial({
            color: "#222222",
            metalness: 0.8,
            roughness: 0.3
        })
    );
    pole.castShadow = true; 
    pole.position.y = 2.6;
    lamp.add(pole);

    const shadeMaterial = new THREE.MeshStandardMaterial({
        color: "#f7e7c4",
        emissive: "#d6a65b",
        emissiveIntensity: 0.35
    });

    const heights = [1.0, 2.0, 3.0, 4.0, 5.0];

    heights.forEach(h => {

        const shade = new THREE.Mesh(
            new THREE.BoxGeometry(0.55, 0.45, 0.55),
            shadeMaterial
        );
        shade.castShadow = true;
        shade.position.y = h;

        lamp.add(shade);
    });

    // Warm light
    const light = new THREE.PointLight(
        0xffd39b,
        18,
        12,
        2
    );

    light.position.set(0, 3, 0);

    light.castShadow = true;

    lamp.add(light);

    lamp.position.set(x, y, z);
    lamp.scale.set(2, 2, 2);
    scene.add(lamp);
}

// ==========================================
// EXTERIOR DOOR LAMP
// ==========================================
function createDoorLamp(x, y, z) {

    const lamp = new THREE.Group();

    // Wooden base
    const base = new THREE.Mesh(
        new THREE.BoxGeometry(0.45, 0.08, 0.45),
        new THREE.MeshStandardMaterial({
            color: "#6b4f34",
            roughness: 0.7
        })
    );
    base.position.y = 0.04;
    lamp.add(base);

    // White shade
    const shade = new THREE.Mesh(
        new THREE.BoxGeometry(0.55, 4.5, 0.55),
        new THREE.MeshStandardMaterial({
            color: "#ffffff",
            emissive: "#ffffff",
            emissiveIntensity: 1.8
        })
    );

    shade.position.y = 2.3;
    lamp.add(shade);

    // White light
    const light = new THREE.PointLight(
        0xffffff,
        8,
        12,
        2
    );

    light.position.y = 2.3;
    light.castShadow = true;

    lamp.add(light);

    lamp.position.set(x, y, z);

    scene.add(lamp);
}
// ==========================================
// MODERN EXTERIOR WALL LIGHT
// ==========================================
function createWallLight(x, y, z) {

    const lightGroup = new THREE.Group();

    // White glowing square
    const box = new THREE.Mesh(
        new THREE.BoxGeometry(0.45, 0.45, 0.12),
        new THREE.MeshStandardMaterial({
            color: "#ffffff",
            emissive: "#ffffff",
            emissiveIntensity: 3
        })
    );

    lightGroup.add(box);

    // Soft white light
    const light = new THREE.PointLight(
        0xffffff,
        8,
        8,
        2
    );

    light.castShadow = true;
    light.position.set(0, 0, 0.25);

    lightGroup.add(light);

    lightGroup.position.set(x, y, z);

    scene.add(lightGroup);
}

function createChessBoard(x, y, z) {

    // Create checkerboard texture
    const size = 512;
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;

    const ctx = canvas.getContext("2d");

    const squares = 8;
    const squareSize = size / squares;

    for (let row = 0; row < squares; row++) {
        for (let col = 0; col < squares; col++) {

            ctx.fillStyle = (row + col) % 2 === 0
                ? "#f5f5dc"      // light squares
                : "#222222";     // dark squares

            ctx.fillRect(
                col * squareSize,
                row * squareSize,
                squareSize,
                squareSize
            );
        }
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = texture.wrapT = THREE.ClampToEdgeWrapping;

    const board = new THREE.Mesh(
        new THREE.BoxGeometry(11.3, 0.2, 10),
        new THREE.MeshStandardMaterial({
            map: texture,
            roughness: 0.6
        })
    );

    board.position.set(x, y, z);
    board.receiveShadow = true;
    board.castShadow = true;

    scene.add(board);
}
// ==========================================
// Decorative Black King Chess Piece
// ==========================================
function createChessKing(x, y, z) {

    const king = new THREE.Group();

    const blackMat = new THREE.MeshStandardMaterial({
        color: "#111111",
        roughness: 0.25,
        metalness: 0.45
    });

    // Base
    const base = new THREE.Mesh(
        new THREE.CylinderGeometry(0.9, 1.1, 0.45, 32),
        blackMat
    );
    base.position.y = 0.22;
    king.add(base);

    // Lower Body
    const lower = new THREE.Mesh(
        new THREE.CylinderGeometry(0.55, 0.8, 1.2, 32),
        blackMat
    );
    lower.position.y = 1;
    king.add(lower);

    // Belly
    const belly = new THREE.Mesh(
        new THREE.SphereGeometry(0.6, 32, 32),
        blackMat
    );
    belly.scale.set(1, 1.2, 1);
    belly.position.y = 2;
    king.add(belly);

    // Neck
    const neck = new THREE.Mesh(
        new THREE.CylinderGeometry(0.28, 0.35, 0.8, 32),
        blackMat
    );
    neck.position.y = 3;
    king.add(neck);

    // Crown Base
    const crown = new THREE.Mesh(
        new THREE.CylinderGeometry(0.5, 0.35, 0.8, 32),
        blackMat
    );
    crown.position.y = 3.8;
    king.add(crown);

    // Cross Vertical
    const crossV = new THREE.Mesh(
        new THREE.BoxGeometry(0.12, 0.7, 0.12),
        blackMat
    );
    crossV.position.y = 4.5;
    king.add(crossV);

    // Cross Horizontal
    const crossH = new THREE.Mesh(
        new THREE.BoxGeometry(0.45, 0.12, 0.12),
        blackMat
    );
    crossH.position.y = 4.65;
    king.add(crossH);

    king.position.set(x, y, z);

    king.traverse(obj => {
        if (obj.isMesh) {
            obj.castShadow = true;
            obj.receiveShadow = true;
        }
    });

    scene.add(king);
}
function createChessQueen(x, y, z) {

    const queen = new THREE.Group();

    const whiteMat = new THREE.MeshStandardMaterial({
        color: "#f5f5f5",
        roughness: 0.25,
        metalness: 0.35
    });

    // Base
    const base = new THREE.Mesh(
        new THREE.CylinderGeometry(0.9, 1.1, 0.45, 32),
        whiteMat
    );
    base.position.y = 0.22;
    queen.add(base);

    // Lower Body
    const lower = new THREE.Mesh(
        new THREE.CylinderGeometry(0.55, 0.8, 1.2, 32),
        whiteMat
    );
    lower.position.y = 1;
    queen.add(lower);

    // Belly
    const belly = new THREE.Mesh(
        new THREE.SphereGeometry(0.6, 32, 32),
        whiteMat
    );
    belly.scale.set(1, 1.2, 1);
    belly.position.y = 2;
    queen.add(belly);

    // Neck
    const neck = new THREE.Mesh(
        new THREE.CylinderGeometry(0.28, 0.35, 0.8, 32),
        whiteMat
    );
    neck.position.y = 3;
    queen.add(neck);

    // Crown Base
    const crown = new THREE.Mesh(
        new THREE.CylinderGeometry(0.55, 0.38, 0.7, 32),
        whiteMat
    );
    crown.position.y = 3.8;
    queen.add(crown);

    // Crown Points
    const pointGeo = new THREE.ConeGeometry(0.08, 0.25, 16);

    for (let i = 0; i < 6; i++) {

        const angle = (i / 6) * Math.PI * 2;

        const point = new THREE.Mesh(pointGeo, whiteMat);

        point.position.set(
            Math.cos(angle) * 0.28,
            4.25,
            Math.sin(angle) * 0.28
        );

        queen.add(point);
    }

    // Top Ball
    const topBall = new THREE.Mesh(
        new THREE.SphereGeometry(0.12, 16, 16),
        whiteMat
    );

    topBall.position.y = 4.55;
    queen.add(topBall);

    queen.position.set(x, y, z);

    queen.traverse(obj => {
        if (obj.isMesh) {
            obj.castShadow = true;
            obj.receiveShadow = true;
        }
    });

    scene.add(queen);
}
createFloorLamp(18, 0, 22);
createChessBoard(-13.7, 8.1, 19);
createChessKing(-15, 8.3, 22);
createChessQueen(-11.8, 8.3, 19);

// Left of entrance
createDoorLamp(-3.8, 0, 27);

// Right of entrance
createDoorLamp(3.8, 0, 27);
// bench
function createCurvedBench(cx, y, cz, radius = 3.2) {

    const bench = new THREE.Group();

    const wood = new THREE.MeshStandardMaterial({
        color: "#7b5a3a",
        roughness: 0.85
    });

    const legs = new THREE.MeshStandardMaterial({
        color: "#4d3423",
        roughness: 1
    });

    const pieces = 12;

    for (let i = 0; i < pieces; i++) {

        const angle = Math.PI * 0.15 + (i / (pieces - 1)) * Math.PI * 0.7;

        const px = Math.cos(angle) * radius;
        const pz = Math.sin(angle) * radius;

        // Seat
        const seat = new THREE.Mesh(
            new THREE.BoxGeometry(1.1, 0.22, 0.8),
            wood
        );

        seat.position.set(px, 0.55, pz);
        seat.rotation.y = -angle;
        bench.add(seat);

        // Left leg
        const leg1 = new THREE.Mesh(
            new THREE.BoxGeometry(0.12, 0.55, 0.12),
            legs
        );
        leg1.position.set(px - 0.18, 0.22, pz);
        bench.add(leg1);

        // Right leg
        const leg2 = leg1.clone();
        leg2.position.x += 0.36;
        bench.add(leg2);

    }

    // Face the tree
    bench.rotation.y = 0;

    bench.position.set(cx, y, cz);
    bench.userData.type = "curvedBench";
    const sitOffset = new THREE.Vector3(0, 0.2, 3.2); // adjust later if needed

bench.userData.sitPosition = sitOffset.clone();
bench.localToWorld(bench.userData.sitPosition);
    bench.userData.sitRotation = 0;

    scene.add(bench);

    benches.push(bench);
    colliders.push(bench);
}
// ==========================================
// SECRET FLOWER
// ==========================================
let flower;

function createFlower() {

    flower = new THREE.Group();

    const stemMat = new THREE.MeshStandardMaterial({
        color: "#2e7d32"
    });

    const petalMat = new THREE.MeshStandardMaterial({
        color: "#b94797"
    });

    const centerMat = new THREE.MeshStandardMaterial({
        color: "#facc15"
    });

    // Stem
    const stem = new THREE.Mesh(
        new THREE.CylinderGeometry(0.025, 0.03, 0.5, 10),
        stemMat
    );
    stem.position.y = 0.25;
    flower.add(stem);

    // Center
    const center = new THREE.Mesh(
        new THREE.SphereGeometry(0.05, 16, 16),
        centerMat
    );
    center.position.y = 0.55;
    flower.add(center);

    // Petals
    for (let i = 0; i < 5; i++) {

        const petal = new THREE.Mesh(
            new THREE.SphereGeometry(0.05, 12, 12),
            petalMat
        );

        const angle = i * Math.PI * 2 / 5;

        petal.position.set(
            Math.cos(angle) * 0.09,
            0.55 + Math.sin(angle) * 0.09,
            0
        );

        flower.add(petal);
    }

    flower.position.set(
        0,
        8.15,
        -20
    );
    flower.scale.set(2, 2, 2);
    scene.add(flower);
}

createFlower();

let giantChicken;

function createGiantChicken() {

    giantChicken = new THREE.Group();

    const whiteMat = new THREE.MeshStandardMaterial({
    color: "#fcfae9",
    emissive: "#ffffff",
    emissiveIntensity: 0.15,
    roughness: 0.8
});

    const featherMat = new THREE.MeshStandardMaterial({
        color: "#f3e9c3",
        roughness: 1
    });

    const yellowMat = new THREE.MeshStandardMaterial({
        color: "#facc15"
    });

    const redMat = new THREE.MeshStandardMaterial({
        color: "#dc2626"
    });

    const blackMat = new THREE.MeshStandardMaterial({
        color: "#111111"
    });

    const pinkMat = new THREE.MeshStandardMaterial({
        color: "#ffb6c1"
    });

    // ==========================================
    // BODY
    // ==========================================

    const body = new THREE.Mesh(
        new THREE.SphereGeometry(1.2, 40, 40),
        whiteMat
    );

    body.scale.set(1.2, 1.1, 1.4);

    giantChicken.add(body);

    // ==========================================
    // BODY FEATHERS
    // ==========================================

    for (let i = 0; i < 140; i++) {

        const feather = new THREE.Mesh(

            new THREE.SphereGeometry(0.06, 8, 8),

            featherMat

        );

        const theta = Math.random() * Math.PI * 2;
        const phi = Math.random() * Math.PI;

        const r = 1.28;

        feather.position.set(

            Math.sin(phi) * Math.cos(theta) * r,

            Math.cos(phi) * r * 0.92,

            Math.sin(phi) * Math.sin(theta) * r * 1.15

        );

        feather.scale.set(1, 0.55, 1.5);

        feather.lookAt(0,0,0);

        giantChicken.add(feather);

    }

    // ==========================================
    // BELLY
    // ==========================================

    const belly = new THREE.Mesh(

        new THREE.SphereGeometry(0.72,28,28),

        new THREE.MeshStandardMaterial({

            color:"#f3e9c3"

        })

    );

    belly.scale.set(1.05,1.1,0.8);

    belly.position.set(0,-0.1,0.95);

    giantChicken.add(belly);

    // ==========================================
    // HEAD
    // ==========================================

    const head = new THREE.Mesh(

        new THREE.SphereGeometry(0.62,32,32),

        whiteMat

    );

    head.position.set(0,1.2,1.1);

    giantChicken.add(head);
   // ==========================================
// BEAK
// ==========================================

const beak = new THREE.Mesh(

    new THREE.ConeGeometry(0.22, 0.55, 4),

    yellowMat

);

beak.rotation.x = Math.PI / 2;

// Move forward slightly
beak.position.set(0, 1.14, 1.82);

giantChicken.add(beak);

// ==========================================
// COMB
// ==========================================
const combGroup = new THREE.Group();
[
    [-0.22,1.68,1.02],
    [-0.11,1.78,1.05],
    [0,1.84,1.08],
    [0.11,1.78,1.05],
    [0.22,1.68,1.02]
].forEach(pos=>{

    const comb = new THREE.Mesh(

        new THREE.SphereGeometry(0.11,18,18),

        redMat

    );

    comb.position.set(...pos);

    giantChicken.add(comb);


});

// ==========================================
// EYES
// ==========================================

[-0.18,0.18].forEach(x=>{

    const eyeWhite = new THREE.Mesh(

        new THREE.SphereGeometry(0.10,18,22),

        new THREE.MeshStandardMaterial({

            color:"#ffffff"

        })

    );

    eyeWhite.position.set(x,1.28,1.48);

    giantChicken.add(eyeWhite);

    const pupil = new THREE.Mesh(

        new THREE.SphereGeometry(0.05,16,16),

        blackMat

    );

    pupil.position.set(x,1.28,1.7);

    giantChicken.add(pupil);

    const shine = new THREE.Mesh(

        new THREE.SphereGeometry(0.015,8,8),

        new THREE.MeshStandardMaterial({

            color:"#060606",

            emissive:"#ffffff",

            emissiveIntensity:1

        })

    );

    shine.position.set(x+0.02,1.31,1.59);

    giantChicken.add(shine);

});

// ==========================================
// WINGS
// ==========================================

[-1,1].forEach(side=>{

    const wing = new THREE.Mesh(

        new THREE.SphereGeometry(0.45,24,24),

        whiteMat

    );

    wing.scale.set(0.7,1.3,1);

    wing.position.set(side,0.15,0.9);

    giantChicken.add(wing);


});

// ==========================================
// LEGS
// ==========================================

[-0.35,0.35].forEach(x=>{

    const leg = new THREE.Mesh(

        new THREE.CylinderGeometry(0.07,0.07,0.3,12),

        yellowMat

    );

    leg.position.set(x,-1.2,0.25);

    giantChicken.add(leg);


});

// ==========================================
// TAIL
// ==========================================

for(let i=-3;i<=3;i++){

    const feather = new THREE.Mesh(

        new THREE.ConeGeometry(0.2,0.9,6),

        featherMat

    );

    feather.rotation.x = -Math.PI/3;

    feather.rotation.z = i*0.18;

    feather.position.set(

        0,

        0.65,

        -1.35

    );

    giantChicken.add(feather);

}

// ==========================================
// POSITION
// ==========================================

giantChicken.position.set(
    -13.5,
    2.8,
    19
);

giantChicken.scale.set(
    2,
    2,
    2
);

giantChicken.rotation.y = 3 * Math.PI / 4;

scene.add(giantChicken);
colliders.push(giantChicken);

}

createGiantChicken();

// ==========================================
// POLAR BEAR CHARACTER & PHYSICS SYSTEM
// ==========================================

const player = new THREE.Group();


// Materials
const polarWhiteMat = new THREE.MeshStandardMaterial({
    color: "#ffffff",
    roughness: 0.9
});

const polarGrayMat = new THREE.MeshStandardMaterial({
    color: "#d6d6d0",
    roughness: 1
});

const blackMat = new THREE.MeshStandardMaterial({
    color: "#111111"
});


// ==========================================
// BODY (ROUND)
// ==========================================

const torso = new THREE.Mesh(
    new THREE.SphereGeometry(
        0.75,
        32,
        32
    ),
    polarWhiteMat
);

torso.scale.set(
    1,
    1.25,
    0.7
);

torso.position.y = 1.35;
torso.castShadow = true;

player.add(torso);


// ==========================================
// HEAD (ROUND)
// ==========================================

const head = new THREE.Mesh(
    new THREE.SphereGeometry(
        0.55,
        32,
        32
    ),
    polarWhiteMat
);

head.position.y = 2.45;
head.castShadow = true;

player.add(head);


// ==========================================
// EARS
// ==========================================

const earGeometry = new THREE.SphereGeometry(
    0.18,
    16,
    16
);


const leftEar = new THREE.Mesh(
    earGeometry,
    polarWhiteMat
);

leftEar.position.set(
    -0.38,
    2.8,
    0
);

leftEar.castShadow = true;

player.add(leftEar);


const rightEar = leftEar.clone();

rightEar.position.x = 0.38;

player.add(rightEar);


// ==========================================
// MUZZLE
// ==========================================

const muzzle = new THREE.Mesh(
    new THREE.SphereGeometry(
        0.25,
        16,
        16
    ),
    polarGrayMat
);

muzzle.scale.z = 0.6;

muzzle.position.set(
    0,
    2.3,
    -0.45
);

player.add(muzzle);


// ==========================================
// NOSE
// ==========================================

const nose = new THREE.Mesh(
    new THREE.SphereGeometry(
        0.1,
        16,
        16
    ),
    blackMat
);

nose.position.set(
    0,
    2.32,
    -0.65
);

player.add(nose);


// ==========================================
// EYES
// ==========================================

const eyeGeometry = new THREE.SphereGeometry(
    0.06,
    16,
    16
);


const leftEye = new THREE.Mesh(
    eyeGeometry,
    blackMat
);

leftEye.position.set(
    -0.2,
    2.55,
    -0.45
);

player.add(leftEye);


const rightEye = leftEye.clone();

rightEye.position.x = 0.2;

player.add(rightEye);



// ==========================================
// POLAR BEAR LEGS (ROUNDED)
// ==========================================

const legGeometry = new THREE.CapsuleGeometry(
    0.22,   // radius
    0.55,   // length
    8,
    16
);


const leftLeg = new THREE.Mesh(
    legGeometry,
    polarWhiteMat
);

leftLeg.position.set(
    -0.32,
    0.65,
    0
);

leftLeg.castShadow = true;

player.add(leftLeg);



const rightLeg = new THREE.Mesh(
    legGeometry,
    polarWhiteMat
);

rightLeg.position.set(
    0.32,
    0.65,
    0
);

rightLeg.castShadow = true;

player.add(rightLeg);



// ==========================================
// POLAR BEAR PAWS / ARMS (ROUNDED)
// ==========================================

const armGeometry = new THREE.CapsuleGeometry(
    0.15,
    0.7,
    8,
    16
);


const leftArm = new THREE.Mesh(
    armGeometry,
    polarWhiteMat
);

leftArm.position.set(
    -0.72,
    1.35,
    0
);

leftArm.rotation.z = -0.25;

leftArm.castShadow = true;

player.add(leftArm);



const rightArm = new THREE.Mesh(
    armGeometry,
    polarWhiteMat
);

rightArm.position.set(
    0.72,
    1.35,
    0
);

rightArm.rotation.z = 0.25;

rightArm.castShadow = true;

player.add(rightArm);



// ==========================================
// PLAYER START POSITION
// ==========================================

player.position.set(
    0,
    -2.5,
    48
);
player.scale.set(
    1.2,
    1.2,
    1.2
);
scene.add(player);



// ==========================================
// PHYSICS SYSTEM
// ==========================================

const playerRadius = 0.8;

const raycaster = new THREE.Raycaster();


let verticalVelocity = 0;

const gravity = -20;

const jumpStrength = 8.5;

let isGrounded = true;

let currentGroundY = -2.5;

function checkWallCollision(newX, newZ) {
    const playerBox = new THREE.Box3(
        new THREE.Vector3(newX - playerRadius, player.position.y + 0.5, newZ - playerRadius),
        new THREE.Vector3(newX + playerRadius, player.position.y + 2.6, newZ + playerRadius)
    );

    for (let i = 0; i < colliders.length; i++) {
        const colBox = new THREE.Box3().setFromObject(colliders[i]);
        if (playerBox.intersectsBox(colBox)) return true;
    }
    return false;
}

function updatePlayerPhysics(delta) {
    const origin = new THREE.Vector3(player.position.x, player.position.y + 2, player.position.z);
    raycaster.set(origin, new THREE.Vector3(0, -1, 0));

    const intersects = raycaster.intersectObjects(walkableSurfaces);
    
    if (intersects.length > 0) {
        currentGroundY = intersects[0].point.y;
    } else {
        currentGroundY = -2.5;
    }

    verticalVelocity += gravity * delta;
    player.position.y += verticalVelocity * delta;

    if (player.position.y <= currentGroundY) {
        player.position.y = currentGroundY;
        verticalVelocity = 0;
        isGrounded = true;
    } else {
        isGrounded = false;
    }
}

// ==========================================
// CONTROLS & CAMERA CLIPPING PREVENTATIVE SYSTEM
// ==========================================
const overlay = document.getElementById("overlay");
const doorPrompt = document.getElementById("door-prompt");
const sitPrompt = document.getElementById("sit-prompt");
const flowerPrompt = document.getElementById("flower-prompt");
const chickenPrompt = document.getElementById("chicken-prompt");
const keys = {};
let isSitting = false;
let currentSeat = null;
let flowerCollected = false;
let chickenTalked = false;
let cameraYaw = Math.PI, cameraPitch = 0.1, isPointerLocked = false;

const dialogueBox = document.getElementById("dialogue-box");
const dialogueText = document.getElementById("dialogue-text");
const dialogueNext = document.getElementById("dialogue-next");

const dialogues = [
`Once upon a time...

...a Polar Bear met a genie.`,

`The genie offered it one wish.`,

`The Polar Bear thought for a long time...

...and finally whispered its wish.`,

`The genie smiled.

"...Granted."`
];

let dialogueIndex = 0;
const chickenDialogues = [
    "You actually pressed C!!",
    "Good. That means the developer's interaction code works.",
    "Welcome to Byteverse🌑!!!",
    "You're probably wondering who built this incredible museum🤔",
    "...It was me 😎",
    "You're probably also wondering why a giant chicken is an architect.",
    "Stop asking difficult questions 🐥",
    "It got slightly out of hand.",
    "Then I remembered your sketches deserved better than staying in a sketchbook forever.",
    "So now they're hanging on walls like the masterpieces they are 💫 ",
    "Don't touch anything. Actually... go ahead. I built it sturdy enough to survive you 😉",
    "Now go explore. I'll pretend I'm not waiting for you to tell me how amazing I am 🐔✨"

];

let chickenDialogueIndex = 0;
let isChickenDialogue = false;


if (overlay) {

    overlay.addEventListener("click", () => {

        overlay.style.display = "none";

        dialogueBox.style.display = "block";

        dialogueText.textContent = dialogues[0];

    });

}

dialogueNext.addEventListener("click", () => {

    // ==========================================
    // Chicken Dialogue
    // ==========================================
    if (isChickenDialogue) {

        chickenDialogueIndex++;

        if (chickenDialogueIndex < chickenDialogues.length) {

            dialogueText.textContent =
                chickenDialogues[chickenDialogueIndex];

        } else {

            isChickenDialogue = false;

            dialogueBox.style.display = "none";

            dialogueNext.textContent = "Enter ▶";

            document.body.requestPointerLock();

            toggleAudio(true);

        }

        return;
    }

    // ==========================================
    // Flower Dialogue
    // ==========================================
    if (dialogueText.textContent === "🌸 Gotcha!") {

        dialogueBox.style.display = "none";

        dialogueNext.textContent = "Enter ▶";

        return;
    }

    // ==========================================
    // Intro Dialogue
    // ==========================================
    dialogueIndex++;

    if (dialogueIndex < dialogues.length) {

        dialogueText.textContent = dialogues[dialogueIndex];

    } else {

        dialogueBox.style.display = "none";

        document.body.requestPointerLock();

        toggleAudio(true);

    }

});


document.addEventListener("pointerlockchange", () => {
    isPointerLocked = (document.pointerLockElement === document.body);
});

document.addEventListener("mousemove", (e) => {
    if (!isPointerLocked) return;
    cameraYaw -= e.movementX * 0.003;
    cameraPitch += e.movementY * 0.003;
    
    // Clamp vertical tilt angle
    cameraPitch = Math.max(-0.25, Math.min(1.1, cameraPitch));
});

document.addEventListener("keydown", (e) => {
    keys[e.code] = true;
    
    if (e.code === "KeyQ") {
    closeDoor();
}
    if (e.code === "Space" && isGrounded) {
        verticalVelocity = jumpStrength;
        isGrounded = false;
    }

    if ((e.code === "KeyE" || e.code === "Enter") && !isDoorOpen) {
        const distToDoor = player.position.distanceTo(new THREE.Vector3(0, player.position.y, 25));
        if (distToDoor < 6) {
            toggleDoor();
            if (doorPrompt) doorPrompt.style.display = "none";
        }
    }
    if (e.code === "Enter" && dialogueBox.style.display === "block") {

    e.preventDefault();
    dialogueNext.click();
    return;

}
    // ==========================================
// Pick Flower
// ==========================================
    if (e.code === "KeyP" && !flowerCollected) {

    const flowerDistance = player.position.distanceTo(flower.position);

        if (flowerDistance < 2.5) {

        flowerCollected = true;

// Hide prompt
flowerPrompt.style.display = "none";

// Show dialogue
dialogueBox.style.display = "block";
dialogueText.textContent = "You are Gay!";

// Change button text
dialogueNext.textContent = "Close";

    }

}
// ==========================================
// Talk to Chicken
// ==========================================

if (e.code === "KeyC") {

    const chickenDistance = player.position.distanceTo(giantChicken.position);

    if (chickenDistance < 3) {

        chickenTalked = true;
        chickenPrompt.style.display = "none";

        isChickenDialogue = true;
        chickenDialogueIndex = 0;

        dialogueBox.style.display = "block";
        dialogueText.textContent = chickenDialogues[0];

        dialogueNext.textContent = "Enter ▶";

    }

}
    // ==========================================
    // Sit Key
    // ==========================================
   if (e.code === "KeyF") {

    // ---------- Stand Up ----------
    if (isSitting) {

    isSitting = false;

    if (currentSeat.userData.type === "sofa") {

        player.position.copy(currentSeat.userData.exitPosition);

    } else {

        // Keep your curved bench exactly the same
        player.position.z += 3;

    }

    currentSeat = null;

    return;
}

    // ---------- Sit Down ----------
    for (const bench of benches) {

      const radius = bench.userData.sitRadius || 2.5;

if (player.position.distanceTo(bench.position) < radius) {

            currentSeat = bench;
            isSitting = true;

            if (bench.userData.type === "curvedBench") {

                player.position.copy(bench.userData.sitPosition);
                player.rotation.y = bench.userData.sitRotation;

            } else {

                // Sofa
bench.userData.exitPosition = player.position.clone();

player.position.set(
    bench.position.x,
    bench.position.y + 0.2,
    bench.position.z
);

player.rotation.y = bench.rotation.y + Math.PI;
            }

            break;
        }
    }
}
});


document.addEventListener("keyup", (e) => keys[e.code] = false);

function updateCameraPosition() {
    const defaultDist = isSitting ? 3.5 : 6.5;
    const target = new THREE.Vector3(player.position.x, player.position.y + 2.2, player.position.z);

    const desiredCamPos = new THREE.Vector3(
        player.position.x + defaultDist * Math.sin(cameraYaw),
        player.position.y + 2.2 + defaultDist * Math.sin(cameraPitch),
        player.position.z + defaultDist * Math.cos(cameraYaw)
    );

    const camDir = new THREE.Vector3().subVectors(desiredCamPos, target).normalize();
    raycaster.set(target, camDir);

    const intersects = raycaster.intersectObjects(colliders);

    let currentDist = defaultDist;
    if (intersects.length > 0 && intersects[0].distance < defaultDist) {
        currentDist = Math.max(0.8, intersects[0].distance - 0.4);
    }

    let calculatedY = player.position.y + 2.2 + currentDist * Math.sin(cameraPitch);
    
    // Camera floor offset safeguard
    const minHeight = Math.max(player.position.y + 0.3, currentGroundY + 0.3);
    if (calculatedY < minHeight) {
        calculatedY = minHeight;
    }

    camera.position.x = player.position.x + currentDist * Math.sin(cameraYaw);
    camera.position.y = calculatedY;
    camera.position.z = player.position.z + currentDist * Math.cos(cameraYaw);
    camera.lookAt(target);
}

// ==========================================
// GAME LOOP
// ==========================================
const clock = new THREE.Clock();

function animate() {
    requestAnimationFrame(animate);
    const delta = Math.min(clock.getDelta(), 0.1);

    let moveSpeed = 8.0 * delta, moved = false, moveX = 0, moveZ = 0;
    if (keys["KeyW"]) { moveZ -= 1; moved = true; }
    if (keys["KeyS"]) { moveZ += 1; moved = true; }
    if (keys["KeyA"]) { moveX -= 1; moved = true; }
    if (keys["KeyD"]) { moveX += 1; moved = true; }

    if (moved && !isSitting) {
        const forwardX = Math.sin(cameraYaw) * moveZ + Math.cos(cameraYaw) * moveX;
        const forwardZ = Math.cos(cameraYaw) * moveZ - Math.sin(cameraYaw) * moveX;

        const nextX = player.position.x + forwardX * moveSpeed;
        const nextZ = player.position.z + forwardZ * moveSpeed;

        if (!checkWallCollision(nextX, player.position.z)) player.position.x = nextX;
        if (!checkWallCollision(player.position.x, nextZ)) player.position.z = nextZ;

        player.rotation.y = Math.atan2(forwardX, forwardZ) + Math.PI;

        if (isGrounded) {
            const walkCycle = Math.sin(clock.getElapsedTime() * 10) * 0.4;
            leftLeg.rotation.x = walkCycle;
            rightLeg.rotation.x = -walkCycle;
        }
    } else {
        leftLeg.rotation.x = 0;
        rightLeg.rotation.x = 0;
    }

    updatePlayerPhysics(delta);

    // Door Prompt Check
    const distToDoor = player.position.distanceTo(new THREE.Vector3(0, player.position.y, 25));
    if (doorPrompt) {
        if (distToDoor < 6 && !isDoorOpen) {
            doorPrompt.style.display = "block";
        } else {
            doorPrompt.style.display = "none";
        }
    }

  // ==========================================
// Chicken Prompt Check
// ==========================================

if (chickenPrompt && giantChicken && !chickenTalked) {

    const chickenDistance = player.position.distanceTo(giantChicken.position);

    chickenPrompt.style.display =
        chickenDistance < 7 ? "block" : "none";

} else if (chickenPrompt) {

    chickenPrompt.style.display = "none";

}
    // ==========================================
// Flower Prompt Check
// ==========================================

if (flowerPrompt && flower && !flowerCollected) {

    const flowerDistance = player.position.distanceTo(flower.position);

    flowerPrompt.style.display =
        flowerDistance < 2.5 ? "block" : "none";

}
else if (flowerPrompt) {

    flowerPrompt.style.display = "none";

}

// ==========================================
// Chicken Prompt Check
// ==========================================

if (chickenPrompt && giantChicken && !chickenTalked) {

    const chickenDistance = player.position.distanceTo(giantChicken.position);

    if (chickenDistance < 7) {

        chickenPrompt.style.display = "block";
        chickenPrompt.textContent = 'Press "C" to talk to Chicken';

    } else {

        chickenPrompt.style.display = "none";

    }

}
else if (chickenPrompt) {

    chickenPrompt.style.display = "none";

}
 // ==========================================
    // Sit Prompt Check
    // ==========================================
  let nearBench = false;

for (const bench of benches) {

    const distance = player.position.distanceTo(bench.position);

    const radius = bench.userData.sitRadius || 2.5;

    if (distance < radius) {
        nearBench = true;
        break;
    }
}

    if (sitPrompt) {
        sitPrompt.style.display = nearBench ? "block" : "none";
    }

    updateCameraPosition();
    renderer.render(scene, camera);
}
    

animate();

window.addEventListener("resize", () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}
);