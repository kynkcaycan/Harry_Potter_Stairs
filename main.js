// Scene setup
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x202020);
scene.fog = new THREE.FogExp2(0x202020, 0.01); // Add exponential fog for infinite floor illusion

//light color
// Hexadecimal renk kodunu RGB değerlerine dönüştürme
const hex = 'f0cbae';
const r = parseInt(hex.substring(0, 2), 16) / 255;
const g = parseInt(hex.substring(2, 4), 16) / 255;
const b = parseInt(hex.substring(4, 6), 16) / 255;
// THREE.Color nesnesi oluşturma
const color = new THREE.Color(r, g, b);
// Örnek kullanım: Bir malzeme için renk atama
const material = new THREE.MeshBasicMaterial({ color: color });

// Camera setup
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 5, 20); // Adjusted to get a better view of the staircases

// Renderer setup
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Lighting
const ambientLight = new THREE.AmbientLight(0x404040, 1.5); // Soft white light
scene.add(ambientLight);

const pointLight = new THREE.PointLight(0xffffff, 1, 100);
pointLight.position.set(0, 0, 0);
scene.add(pointLight);

// Texture loader
const textureLoader = new THREE.TextureLoader();
const wallTexture = textureLoader.load('wall.jpg'); // Replace with your new texture image path
wallTexture.wrapS = THREE.RepeatWrapping;
wallTexture.wrapT = THREE.RepeatWrapping;
wallTexture.repeat.set(4, 4); // Adjust repeat values to fit the wall size

const doorTexture = textureLoader.load('door2.jpg'); // Replace with your door texture image path
const stairTexture = textureLoader.load('stair.jpg'); // Replace with your stair texture image path

// Gothic staircase geometry
let stairsGroup;
let railingsSpheres = []; // Array to store railing spheres
let currentRotationAngle = 0; // Track the current rotation angle of the staircase

function createStaircase(x, y, z, rotationAngle = 0, stepCount = 10) {
    const stairsGroup = new THREE.Group();

    const stepHeight = 0.4;
    const stepDepth = 0.7;
    const stepWidth = 3;

    const stepGeometry = new THREE.BoxGeometry(stepWidth, stepHeight, stepDepth);
    const stepMaterial = new THREE.MeshStandardMaterial({ color: 0x808080 });

    const railingHeight = 1;
    const railingThickness = 0.1;
    const railingMaterial = new THREE.MeshStandardMaterial({ color: 0x808080 });

    let leftRailingPositions = [];
    let rightRailingPositions = [];

    for (let i = 0; i < stepCount; i++) {
        const step = new THREE.Mesh(stepGeometry, stepMaterial);
        step.position.set(0, i * stepHeight, -i * stepDepth);
        stairsGroup.add(step);

        // Add left railing post
        const leftRailing = new THREE.Mesh(
            new THREE.BoxGeometry(railingThickness, railingHeight, railingThickness),
            railingMaterial
        );
        leftRailing.position.set(-stepWidth / 2 - railingThickness / 2, i * stepHeight + railingHeight / 2, -i * stepDepth + stepDepth / 2);
        stairsGroup.add(leftRailing);
        leftRailingPositions.push(leftRailing.position.clone().add(new THREE.Vector3(0, railingHeight / 2, 0)));

        // Add right railing post
        const rightRailing = new THREE.Mesh(
            new THREE.BoxGeometry(railingThickness, railingHeight, railingThickness),
            railingMaterial
        );
        rightRailing.position.set(stepWidth / 2 + railingThickness / 2, i * stepHeight + railingHeight / 2, -i * stepDepth + stepDepth / 2);
        stairsGroup.add(rightRailing);
        rightRailingPositions.push(rightRailing.position.clone().add(new THREE.Vector3(0, railingHeight / 2, 0)));

        // Create spheres for railings (midpoints)
        const sphereGeometry = new THREE.SphereGeometry(0.1, 16, 16);
        const sphereMaterial = new THREE.MeshStandardMaterial({ color: 0xD2B48C });

        const sphereOffset = +0.4; // Offset for sphere positioning
        const leftSphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
        leftSphere.position.copy(leftRailing.position.clone().add(new THREE.Vector3(0, sphereOffset, 0)));
        stairsGroup.add(leftSphere);

        const rightSphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
        rightSphere.position.copy(rightRailing.position.clone().add(new THREE.Vector3(0, sphereOffset, 0)));
        stairsGroup.add(rightSphere);
    }

    // Create railing curves
    const curveMaterial = new THREE.LineBasicMaterial({ color: 0xD2B48C });

    // Left railing curve
    const leftCurve = new THREE.CatmullRomCurve3(leftRailingPositions);
    const leftCurveGeometry = new THREE.TubeGeometry(leftCurve, 20, railingThickness / 2, 8, false);
    const leftCurveMesh = new THREE.Mesh(leftCurveGeometry, railingMaterial);
    stairsGroup.add(leftCurveMesh);

    // Right railing curve
    const rightCurve = new THREE.CatmullRomCurve3(rightRailingPositions);
    const rightCurveGeometry = new THREE.TubeGeometry(rightCurve, 20, railingThickness / 2, 8, false);
    const rightCurveMesh = new THREE.Mesh(rightCurveGeometry, railingMaterial);
    stairsGroup.add(rightCurveMesh);

    // Adjust position and rotation of the entire staircase to align with the door
    stairsGroup.position.set(x, y, z);
    stairsGroup.rotation.y = rotationAngle;

    scene.add(stairsGroup);
}




function createLStaircase(x, y, z, rotationAngle = 0, stepCount = 10) {
    const stairsGroup = new THREE.Group();

    const stepHeight = 0.4;
    const stepDepth = 0.7;
    const stepWidth = 3;

    const stepGeometry = new THREE.BoxGeometry(stepWidth, stepHeight, stepDepth);
    const stepMaterial = new THREE.MeshStandardMaterial({ map: stairTexture });

    const railingHeight = 1;
    const railingThickness = 0.1;
    const railingMaterial = new THREE.MeshStandardMaterial({ color: 0x808080 });

    // Arrays to store railing positions for left and right sides
    let leftRailingPositions = [];
    let rightRailingPositions = [];

    // Loop to create steps and railings
    for (let i = 0; i < stepCount; i++) {
        let stepWidthAdjusted = stepWidth;
        const step = new THREE.Mesh(stepGeometry, stepMaterial);

        // Determine step positions for L-shaped staircase
        if (i < stepCount / 2 - 1) {
            step.position.set(0, i * stepHeight, -i * stepDepth);
        } else if (i == stepCount / 2 - 1) {
            // Make the last step of the first segment wider
            stepWidthAdjusted *= 1.5; // Increase width by 50%
            step.geometry = new THREE.BoxGeometry(stepWidthAdjusted, stepHeight, stepDepth);
            step.position.set(0, i * stepHeight, -i * stepDepth);
        } else {
            step.position.set((i - stepCount / 2 + 1) * stepDepth, (stepCount / 2 - 1) * stepHeight + (i - stepCount / 2 + 1) * stepHeight, -((stepCount / 2 - 1) * stepDepth));
        }

        stairsGroup.add(step);

        // Left railing post
        const leftRailing = new THREE.Mesh(
            new THREE.BoxGeometry(railingThickness, railingHeight, railingThickness),
            railingMaterial
        );
        if (i < stepCount / 2 - 1) {
            leftRailing.position.set(-stepWidth / 2 - railingThickness / 2, i * stepHeight + railingHeight / 2, -i * stepDepth + stepDepth / 2);
        } else if (i == stepCount / 2 - 1) {
            leftRailing.position.set(-stepWidthAdjusted / 2 - railingThickness / 2, i * stepHeight + railingHeight / 2, -i * stepDepth + stepDepth / 2);
        } else {
            leftRailing.position.set(-stepWidth / 2 - railingThickness / 2 + (i - stepCount / 2 + 1) * stepDepth, (stepCount / 2 - 1) * stepHeight + (i - stepCount / 2 + 1) * stepHeight + railingHeight / 2, -((stepCount / 2 - 1) * stepDepth) + stepDepth / 2);
        }
        stairsGroup.add(leftRailing);
        leftRailingPositions.push(leftRailing.position.clone().add(new THREE.Vector3(0, railingHeight / 2, 0)));

        // Right railing post
        const rightRailing = new THREE.Mesh(
            new THREE.BoxGeometry(railingThickness, railingHeight, railingThickness),
            railingMaterial
        );
        if (i < stepCount / 2 - 1) {
            rightRailing.position.set(stepWidth / 2 + railingThickness / 2, i * stepHeight + railingHeight / 2, -i * stepDepth + stepDepth / 2);
        } else if (i == stepCount / 2 - 1) {
            rightRailing.position.set(stepWidthAdjusted / 2 + railingThickness / 2, i * stepHeight + railingHeight / 2, -i * stepDepth + stepDepth / 2);
        } else {
            rightRailing.position.set(stepWidth / 2 + railingThickness / 2 + (i - stepCount / 2 + 1) * stepDepth, (stepCount / 2 - 1) * stepHeight + (i - stepCount / 2 + 1) * stepHeight + railingHeight / 2, -((stepCount / 2 - 1) * stepDepth) + stepDepth / 2);
        }
        stairsGroup.add(rightRailing);
        rightRailingPositions.push(rightRailing.position.clone().add(new THREE.Vector3(0, railingHeight / 2, 0)));
    }

    // Create railing curves using Catmull-Rom curves
    const curveMaterial = new THREE.MeshStandardMaterial({ color: 0x808080 });

    // Left railing curve
    const leftCurve = new THREE.CatmullRomCurve3(leftRailingPositions);
    const leftCurveGeometry = new THREE.TubeGeometry(leftCurve, 20, railingThickness / 2, 8, false);
    const leftCurveMesh = new THREE.Mesh(leftCurveGeometry, curveMaterial);
    stairsGroup.add(leftCurveMesh);

    // Right railing curve
    const rightCurve = new THREE.CatmullRomCurve3(rightRailingPositions);
    const rightCurveGeometry = new THREE.TubeGeometry(rightCurve, 20, railingThickness / 2, 8, false);
    const rightCurveMesh = new THREE.Mesh(rightCurveGeometry, curveMaterial);
    stairsGroup.add(rightCurveMesh);

    // Adjust position and rotation of the entire staircase
    stairsGroup.position.set(x, y, z);
    stairsGroup.rotation.y = rotationAngle;

    scene.add(stairsGroup);
}


function createAllStairs() {
    createStaircase(-8 + 0.7 / 2, 0, 1, -2,18);
   // createStaircase(-8 + 0.7 / 2, 0, 1, 2,20);
     // Normal staircase
     
    
    createLStaircase(-3, -6, 5, Math.PI / 25, 13); // L-shaped staircase// L-shaped staircase
}


// Create a door on a wall
function createWallDoor(x, y, z, angle) {
    const doorWidth = 3;
    const doorHeight = 7;
    const doorDepth = 0.5;

    // Door material with texture
    const doorMaterial = new THREE.MeshStandardMaterial({
        map: doorTexture
    });

    // Door geometry
    const doorGeometry = new THREE.BoxGeometry(doorWidth, doorHeight, doorDepth);
    const doorMesh = new THREE.Mesh(doorGeometry, doorMaterial);

    // Position the door on the specified wall
    doorMesh.position.set(x, y, z);

    // Rotate the door (example rotation)
    doorMesh.rotation.y = angle; // angle in radians

    // Add door to the scene
    scene.add(doorMesh);

    // Back panel geometry
    const backPanelWidth = doorWidth + 1;
    const backPanelHeight = doorHeight + 1;
    const backPanelDepth = 0.1; // Thickness of the back panel

    // Back panel material (white color)
    const textureLoader = new THREE.TextureLoader();
    const texture = textureLoader.load('path_to_your_texture_image.jpg'); // Replace with your texture path
    
    const backPanelMaterial = new THREE.MeshStandardMaterial({
        map: wallTexture,  // Assign the loaded texture to the 'map' property
        color: 0xffffff // Optional: Default color if texture is not fully loaded or unavailable
    });
    

    const backPanelGeometry = new THREE.BoxGeometry(backPanelWidth, backPanelHeight, backPanelDepth);
    const backPanelMesh = new THREE.Mesh(backPanelGeometry, backPanelMaterial);

    // Position the back panel behind the door
    backPanelMesh.position.set(x, y, z - (doorDepth / 2 + backPanelDepth / 2));

    // Rotate the back panel the same as the door
    backPanelMesh.rotation.y = angle;

    // Add back panel to the scene
    scene.add(backPanelMesh);
}



function toggleLight() {
    lightOn = !lightOn;
    light.visible = lightOn;
}


let draggableLamps = []; // DragControls için kullanılacak dizi



function createLamp(xPosition, yPosition, zPosition) {
    const lamp = new THREE.Group();

    // Lamp base (cylinder)
    const cylinderGeometryCenter = new THREE.CylinderGeometry(0.5, 0.5, 2, 16);
    const cylinderMaterialCenter = new THREE.MeshPhongMaterial({ color: 0xffffff, transparent: true, opacity: 0.8 });
    const cylinderCenter = new THREE.Mesh(cylinderGeometryCenter, cylinderMaterialCenter);
    cylinderCenter.position.y = 0;
    lamp.add(cylinderCenter);

    // Lamp top (cylinder)
    const cylinderGeometryTop = new THREE.CylinderGeometry(0.25, 0.5, 0.6, 16);
    const cylinderMaterialTop = new THREE.MeshPhongMaterial({ color: 0x555555 });
    const cylinderTop = new THREE.Mesh(cylinderGeometryTop, cylinderMaterialTop);
    cylinderTop.position.y = 1;
    lamp.add(cylinderTop);

    // Lamp stand (cylinder)
    const cylinderGeometryBottom = new THREE.CylinderGeometry(0.5, 0.5, 0.5, 16);
    const cylinderMaterialBottom = new THREE.MeshPhongMaterial({ color: 0x555555 });
    const cylinderBottom = new THREE.Mesh(cylinderGeometryBottom, cylinderMaterialBottom);
    cylinderBottom.position.y = -1;
    lamp.add(cylinderBottom);

    // Position the lamp
    lamp.position.set(xPosition, yPosition, zPosition);
    scene.add(lamp);

    // Add a point light to the lamp
    const pointLight = new THREE.PointLight(color, 1.9, 20); // color, intensity, distance
    pointLight.position.set(0, 1, 0); // offset relative to the lamp position
    lamp.add(pointLight);

    // Initial state of the light
    let lightOn = false;

    // Function to toggle the light on/off
    function toggleLight() {
        lightOn = !lightOn;
        pointLight.visible = lightOn;
    }

    // Add event listeners for mouse and touch to toggle light
    lamp.addEventListener('mousedown', toggleLight);
    lamp.addEventListener('touchstart', toggleLight);

    // Add lamp to draggable array
    draggableLamps.push(lamp);

    return lamp; // Return the lamp group
}






function createWalls() {
    // Updated wall colors and shading
    const wallTexture = textureLoader.load('wall.jpg'); // Replace with your texture image path
    wallTexture.wrapS = THREE.RepeatWrapping;
    wallTexture.wrapT = THREE.RepeatWrapping;
    wallTexture.repeat.set(4, 4); // Adjust repeat values to fit the wall size

    const wallMaterial = new THREE.MeshStandardMaterial({
        map: wallTexture,
        color: 0x808080, // Gray color for texture blending
        roughness: 0.75, // Adjust roughness as needed
        metalness: 0.1, // Adjust metalness as needed
    });

    const wallHeight = 100; // Large height to create the infinite wall effect
    const wallWidth = 0.5;
    const wallDepth = 30;

    // Left wall
    const leftWallGeometry = new THREE.BoxGeometry(wallWidth, wallHeight, wallDepth);
    const leftWall = new THREE.Mesh(leftWallGeometry, wallMaterial);
    leftWall.position.set(-10, wallHeight / 2 - 50, 0); // Adjust the position to make it appear infinite
    scene.add(leftWall);

    // Right wall
    const rightWallGeometry = new THREE.BoxGeometry(wallWidth, wallHeight, wallDepth); // Adjusted depth to match left wall
    const rightWall = new THREE.Mesh(rightWallGeometry, wallMaterial);
    rightWall.position.set(10, wallHeight / 2 - 50, 0); // Adjust the position to make it appear infinite
    scene.add(rightWall);

    // Back wall
    const backWallGeometry = new THREE.BoxGeometry(wallDepth, wallHeight, wallWidth);
    const backWall = new THREE.Mesh(backWallGeometry, wallMaterial);
    backWall.position.set(0, wallHeight / 2 - 50, -wallDepth / 2); // Position the back wall behind the staircase
    scene.add(backWall);

    // Add doors to each wall
    createWallDoor(-8 + wallWidth / 2, 4, 3,180); // Left wall door
    createWallDoor(8 - wallWidth / 2, 3.5, 1,-80); // Right wall door
    createWallDoor(0, 3.5, -wallDepth / 2,0); // Back wall door
    
    // Add lamps to each wall
    createLamp(-9 + wallWidth / 2, -3, 0); // Left wall lamp
    createLamp(9 - wallWidth / 10, -6, 0); // Right wall lamp
    createLamp(5, 9, -wallDepth / 2); // Back wall lamp
     
    // DragControls
// Create an array of lamp meshes for DragControls
const lamps = draggableLamps.map(lamp => lamp.children[0]); // Assuming lamp is the parent group

const dragControls = new THREE.DragControls(lamps, camera, renderer.domElement);

// Add event listeners for drag start and end
dragControls.addEventListener('dragstart', function (event) {
    controls.enabled = false; // Disable camera controls while dragging
});

dragControls.addEventListener('dragend', function (event) {
    controls.enabled = true; // Re-enable camera controls after dragging ends
});


    
}
function createPicture(x, y, z, imageUrl, w, h, frameThickness, frameTextureUrl) {
    // Tablo geometrisi
    const paintingWidth = w;
    const paintingHeight = h;
    const paintingGeometry = new THREE.PlaneGeometry(paintingWidth, paintingHeight);

    // Kadın resmini yükle
    const womanTexture = new THREE.TextureLoader().load(imageUrl); // Kadın resmi yolunu verin
    const womanMaterial = new THREE.MeshBasicMaterial({ map: womanTexture, side: THREE.DoubleSide });

    // Tablo mesh'i oluştur
    const painting = new THREE.Mesh(paintingGeometry, womanMaterial);
    painting.position.set(0, 0, 0);

    // Çerçeve dokusunu yükle
    const frameTexture = new THREE.TextureLoader().load(frameTextureUrl);
    const frameMaterial = new THREE.MeshBasicMaterial({ map: frameTexture, side: THREE.DoubleSide });

    // Çerçeve geometrisi
    const frameWidth = paintingWidth + frameThickness * 2;
    const frameHeight = paintingHeight + frameThickness * 2;
    const frameGeometry = new THREE.PlaneGeometry(frameWidth, frameHeight);
    const frame = new THREE.Mesh(frameGeometry, frameMaterial);
    frame.position.set(0, 0, -0.01); // Çerçeve tablodan biraz geride

    // Grup oluştur ve tablo ile çerçeveyi gruba ekle
    const group = new THREE.Group();
    group.add(frame);
    group.add(painting);
    group.position.set(x, y, z);
    scene.add(group);

    return group;
}
function createMovingTransparentSun() {
    // Yol noktaları tanımlama (objenin hareket ettiği yollar)
    const pathPoints = [
        new THREE.Vector3(-1.4, 8, 10), // Başlangıç noktası
        new THREE.Vector3(-0.7, 9, 11), // Aradaki nokta 1
        new THREE.Vector3(0.7, 9, 12), // Aradaki nokta 2
        new THREE.Vector3(1.4, 8, 10)   // Bitiş noktası
    ];

    let pointIndex = 1; // Başlangıç noktası olarak pathPoints dizisinin ikinci noktasını seçtik

    // Güneş ışığının rengi ve yoğunluğu
    const sunColor = 0xff9900; // Güneş rengi (turuncu tonunda)
    const sunIntensity = 3.0; // Güneş ışığı yoğunluğu
    const sunDistance = 15; // Güneşin sahnede yerleştirileceği mesafe

    // Güneş ışığı oluşturma
    const sunLight = new THREE.PointLight(sunColor, sunIntensity, sunDistance);
    sunLight.position.copy(pathPoints[0]); // Işık kaynağını ilk noktaya yerleştirme
    scene.add(sunLight); // Işık kaynağını sahneye ekleme

    // Güneşi temsil edecek kırmızı küre
    const sunGeometry = new THREE.SphereGeometry(0.5, 16, 16);
    const sunMaterial = new THREE.MeshLambertMaterial({ color: sunColor, transparent: true, opacity: 0.7 }); // Saydam malzeme
    const sun = new THREE.Mesh(sunGeometry, sunMaterial);
    sun.position.copy(pathPoints[0]); // Güneşi başlangıç noktasına yerleştirme
    scene.add(sun); // Güneşi sahneye ekleme

    // Güneş etrafındaki ışık saçan nokta ışığı
    const pointLight = new THREE.PointLight(0xffffff, 1, 10); // Beyaz renk, yoğunluk ve etki mesafesi
    sun.add(pointLight); // Güneşin etrafında ışık saçacak nokta ışığını güneşe bağlama

    // Deniz dalgası texture'ını yükleme
    const textureLoader = new THREE.TextureLoader();
    const waveTexture = textureLoader.load('ocean.jpg'); // Deniz dalgası texture'ı

    // Shader malzemesi
    const waveMaterial = new THREE.ShaderMaterial({
        uniforms: {
            time: { value: 0 },
            texture: { value: waveTexture }
        },
        vertexShader: `
            uniform float time;
            varying vec2 vUv;
            void main() {
                vUv = uv;
                vec3 pos = position;
                pos.z += sin(pos.x * 4.0 + time * 2.0) * 0.1; // Dalga efekti
                gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
            }
        `,
        fragmentShader: `
            uniform sampler2D texture;
            varying vec2 vUv;
            void main() {
                gl_FragColor = texture2D(texture, vUv);
            }
        `,
        transparent: true
    });

    // Deniz dalgası geometrisi
    const waveGeometry = new THREE.PlaneGeometry(4, 3, 10, 10); // Genişlik, yükseklik ve segment sayıları
    const waveMesh = new THREE.Mesh(waveGeometry, waveMaterial);

    // Deniz dalgasının pozisyonunu ayarlama
    waveMesh.position.set(0, 9, 10); // Burada x, y, z koordinatlarını belirleyebilirsiniz
    scene.add(waveMesh); // Sahneye deniz dalgası eklemek

    function moveSun() {
        // Calculate the movement direction vector
        const direction = new THREE.Vector3().copy(pathPoints[pointIndex]).sub(sunLight.position).normalize();
        const speed = 0.009; // Movement speed
    
        // Move the sun towards the target
        sunLight.position.add(direction.multiplyScalar(speed));
        sun.position.copy(sunLight.position); // Position the sun mesh at the same position
    
        // Update the intensity based on the vertical position of the sun
        const intensityFactor = (sunLight.position.y - 8) / 2*10; // Adjust this factor as needed
    
        // Decrease the intensity of sunLight and pointLight as sun moves up
        sunLight.intensity = Math.max(0.5, sunIntensity - intensityFactor);
        pointLight.intensity = Math.max(0.2, 1 - intensityFactor / 3);
    
        // If sun reaches the target point, move to the next point
        if (sunLight.position.distanceTo(pathPoints[pointIndex]) < speed) {
            pointIndex = (pointIndex + 1) % pathPoints.length;
            if (pointIndex === 0) {
                // Return to the starting point when reaching the end
                sunLight.position.copy(pathPoints[0]);
                sun.position.copy(pathPoints[0]);
            }
        }
    
        // Update the time uniform for the wave shader material
        waveMaterial.uniforms.time.value += 0.02;
    
        // Render the scene
        renderer.render(scene, camera);
    
        // Request the next animation frame
        requestAnimationFrame(moveSun);
    
    
    }

    // Güneşi hareket ettirme işlevini çağırarak animasyonu başlat
    moveSun();
}

// Fonksiyonu çağırma (örnek olarak)
createMovingTransparentSun();

// Ensure you have access to THREE.js library and the scene, camera, renderer are already set up

function createWavingOcean() {
    // Load the ocean texture
    const textureLoader = new THREE.TextureLoader();
    const oceanTexture = textureLoader.load('ocean.jpg');

    // Shader material for waving effect
    const waveMaterial = new THREE.ShaderMaterial({
        uniforms: {
            time: { value: 0 },  // Time uniform for animation
            texture: { value: oceanTexture }  // Ocean texture
        },
        vertexShader: `
            uniform float time;
            varying vec2 vUv;
            void main() {
                vUv = uv;
                vec3 pos = position;
                // Apply waving effect
                pos.z += sin(pos.x * 4.0 + time * 2.0) * 0.1;  // Adjust the wave parameters as needed
                gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
            }
        `,
        fragmentShader: `
            uniform sampler2D texture;
            varying vec2 vUv;
            void main() {
                gl_FragColor = texture2D(texture, vUv);
            }
        `,
        transparent: true
    });

    // Geometry for the waving ocean surface
    const planeGeometry = new THREE.PlaneGeometry(100, 100, 100, 100); // Adjust size and segments as needed
    const waveMesh = new THREE.Mesh(planeGeometry, waveMaterial);

    // Position and add the waving ocean to the scene
    waveMesh.rotation.x = -Math.PI / 2;  // Rotate to align with the horizon
    waveMesh.position.set(0, 7, 10);  // Adjust position as needed
    scene.add(waveMesh);

    // Animation function to update time uniform for waving effect
    function animateWaves() {
        waveMaterial.uniforms.time.value += 0.02;  // Adjust animation speed as needed
        renderer.render(scene, camera);
        requestAnimationFrame(animateWaves);
    }

    // Start the animation
    animateWaves();
}

// Call the function to create the waving ocean effect
createWavingOcean();




// Kadın resmi ve çerçeve texture URL'si
createPicture(4, 1, -10, 'guy.jpg', 3, 3.2, 0.25, 'frameTexture.jpg');
createPicture(9, 3, 10, 'guysad.jpg', 3, 3.2, 0.26, 'frameTexture.jpg');
createPicture(-6, 9, 10, 'monalisa.jpg', 1, 4, 0.23, 'frameTexture.jpg');
createPicture(6, 1, 10, 'manhorse.jpg', 0.9, 2, 0.21, 'frameTexture.jpg');
createPicture(1, -1.4, 10, 'seetwoman8.jpg', 1, 2, 0.27, 'frameTexture.jpg');
createPicture(5, 9, 10, 'yunan.jpg', 2, 1, 0.26, 'frameTexture.jpg');
createPicture(0, 9, 10, 'sky.jpg', 4, 3, 0.26, 'frameTexture.jpg');

// Özel olarak belirttiğiniz yere hareketli bir nesne eklemek
let lastRenderTime = Date.now();

// Call the functions to create the staircase, door, and walls
createAllStairs();
createWalls();

// Raycaster for detecting clicks
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

function onMouseClick(event) {
    // Calculate mouse position in normalized device coordinates (-1 to +1) for both components.
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    // Update the picking ray with the camera and mouse position
    raycaster.setFromCamera(mouse, camera);

    // Calculate objects intersecting the picking ray
    const intersects = raycaster.intersectObjects(scene.children, true);

    if (intersects.length > 0) {
        // Rotate the staircase group by -30 degrees (-π/6 radians) around the y-axis if within bounds
        const angleIncrement = -Math.PI / 3; // -60 degrees in radians
        const newAngle = currentRotationAngle + angleIncrement;

        // Check if the new rotation angle will cause the staircase to intersect the walls
        if (Math.abs(newAngle) <= Math.PI) { // Allow up to 90 degrees rotation in either direction
            const axis = new THREE.Vector3(0, 1, 0); // Rotate around the y-axis
            intersects[0].object.parent.rotateOnAxis(axis, angleIncrement);
            currentRotationAngle = newAngle;
        }
    }
}

// Add event listener for mouse click
window.addEventListener('click', onMouseClick, false);

// Render loop
function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
}

animate();

// Handle window resize
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});
