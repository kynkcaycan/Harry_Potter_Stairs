// Scene setup
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x202020);
scene.fog = new THREE.FogExp2(0x202020, 0.01); // Add exponential fog for infinite floor illusion

// Light color
const hex = 'f0cbae';
const r = parseInt(hex.substring(0, 2), 16) / 255;
const g = parseInt(hex.substring(2, 4), 16) / 255;
const b = parseInt(hex.substring(4, 6), 16) / 255;
const color = new THREE.Color(r, g, b);

// Camera setup
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 5, 20);

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
const wallTexture = textureLoader.load('wall.jpg');
wallTexture.wrapS = THREE.RepeatWrapping;
wallTexture.wrapT = THREE.RepeatWrapping;
wallTexture.repeat.set(4, 4);

const doorTexture = textureLoader.load('door.jpg');
const archTexture = textureLoader.load('arch.jpg');
const stairTexture = textureLoader.load('stair.jpg');

// Gothic staircase geometry
let stairsGroup;
let railingsSpheres = [];
let currentRotationAngle = 0;

function createStaircase(x, y, z, rotationAngle = 0, stepCount = 10, stepWidth = 4, stepHeight = 0.3, stepDepth = 0.7) {
    const stairsGroup = new THREE.Group();
    
    const stepGeometry = new THREE.BoxGeometry(stepWidth, stepHeight, stepDepth);
    const stepMaterial = new THREE.MeshStandardMaterial({ map: stairTexture });

    const railingHeight = 1;
    const railingThickness = 0.1;
    const railingMaterial = new THREE.MeshStandardMaterial({ map: stairTexture });

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

        const sphereOffset = +0.4;
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

    stairsGroup.position.set(x, y, z);
    stairsGroup.rotation.y = rotationAngle;

    scene.add(stairsGroup);

    return stairsGroup;
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

    let leftRailingPositions = [];
    let rightRailingPositions = [];

    for (let i = 0; i < stepCount; i++) {
        let stepWidthAdjusted = stepWidth;
        const step = new THREE.Mesh(stepGeometry, stepMaterial);

        if (i < stepCount / 2 - 1) {
            step.position.set(0, i * stepHeight, -i * stepDepth);
        } else if (i == stepCount / 2 - 1) {
            stepWidthAdjusted *= 1.5;
            step.geometry = new THREE.BoxGeometry(stepWidthAdjusted, stepHeight, stepDepth);
            step.position.set(0, i * stepHeight, -i * stepDepth);
        } else {
            step.position.set((i - stepCount / 2 + 1) * stepDepth, (stepCount / 2 - 1) * stepHeight + (i - stepCount / 2 + 1) * stepHeight, -((stepCount / 2 - 1) * stepDepth));
        }

        stairsGroup.add(step);

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

    const curveMaterial = new THREE.MeshStandardMaterial({ color: 0x808080 });

    const leftCurve = new THREE.CatmullRomCurve3(leftRailingPositions);
    const leftCurveGeometry = new THREE.TubeGeometry(leftCurve, 20, railingThickness / 2, 8, false);
    const leftCurveMesh = new THREE.Mesh(leftCurveGeometry, curveMaterial);
    stairsGroup.add(leftCurveMesh);

    const rightCurve = new THREE.CatmullRomCurve3(rightRailingPositions);
    const rightCurveGeometry = new THREE.TubeGeometry(rightCurve, 20, railingThickness / 2, 8, false);
    const rightCurveMesh = new THREE.Mesh(rightCurveGeometry, curveMaterial);
    stairsGroup.add(rightCurveMesh);

    stairsGroup.position.set(x, y, z);
    stairsGroup.rotation.y = rotationAngle;

    scene.add(stairsGroup);

    return stairsGroup;
}

function createPathway(x, y, z, length, width, rotationAngle = 0) {
    const pathwayGroup = new THREE.Group();

    const pathwayGeometry = new THREE.BoxGeometry(width, 0.3, length);
    const pathwayMaterial = new THREE.MeshStandardMaterial({ map: stairTexture });

    const pathway = new THREE.Mesh(pathwayGeometry, pathwayMaterial);
    pathway.position.set(0, 0, -length / 2);
    pathwayGroup.add(pathway);

    const railingHeight = 1;
    const railingThickness = 0.1;
    const railingMaterial = new THREE.MeshStandardMaterial({ map: stairTexture });

    let leftRailingPositions = [];
    let rightRailingPositions = [];

    for (let i = 0; i <= length; i += 1) {
        const leftRailing = new THREE.Mesh(
            new THREE.BoxGeometry(railingThickness, railingHeight, railingThickness),
            railingMaterial
        );
        leftRailing.position.set(-width / 2 - railingThickness / 2, railingHeight / 2, -i);
        pathwayGroup.add(leftRailing);
        leftRailingPositions.push(leftRailing.position.clone().add(new THREE.Vector3(0, railingHeight / 2, 0)));

        const rightRailing = new THREE.Mesh(
            new THREE.BoxGeometry(railingThickness, railingHeight, railingThickness),
            railingMaterial
        );
        rightRailing.position.set(width / 2 + railingThickness / 2, railingHeight / 2, -i);
        pathwayGroup.add(rightRailing);
        rightRailingPositions.push(rightRailing.position.clone().add(new THREE.Vector3(0, railingHeight / 2, 0)));
    }

    const leftCurve = new THREE.CatmullRomCurve3(leftRailingPositions);
    const leftCurveGeometry = new THREE.TubeGeometry(leftCurve, 20, railingThickness / 2, 8, false);
    const leftCurveMesh = new THREE.Mesh(leftCurveGeometry, railingMaterial);
    pathwayGroup.add(leftCurveMesh);

    const rightCurve = new THREE.CatmullRomCurve3(rightRailingPositions);
    const rightCurveGeometry = new THREE.TubeGeometry(rightCurve, 20, railingThickness / 2, 8, false);
    const rightCurveMesh = new THREE.Mesh(rightCurveGeometry, railingMaterial);
    pathwayGroup.add(rightCurveMesh);

    pathwayGroup.position.set(x, y, z);
    pathwayGroup.rotation.y = rotationAngle;
    scene.add(pathwayGroup);

    return pathwayGroup;
}

function createAllStairs() {
    stairsGroup = createStaircase(-10 + 0.7 / 2, 0, 0, 0, 12, 2);
    createLStaircase(-4, -21, -4, Math.PI / 25, 25);
    createPathway(10 - 0.7 / 2 - 0.5, 3.5, 1, 11, 2, Math.PI / 2);
}

function createWallDoor(x, y, z, angle) {
    const doorWidth = 4;
    const doorHeight = 8;
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
    const texture = textureLoader.load('doorout.jpg'); // Replace with your texture path
    
    const backPanelMaterial = new THREE.MeshStandardMaterial({
        map: texture,  // Assign the loaded texture to the 'map' property
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
function sea(text, speed = 100){
    
   
        const delay = 1000 / speed;
        let index = 0;
        let reverse = false;
    
        function animate() {
            process.stdout.write('\x1Bc'); // Clear console (Unix/Linux)
            console.clear(); // Clear console (Windows)
            const spaces = ' '.repeat(index);
            const output = spaces + text;
    
            if (reverse) {
                index--;
                if (index < 0) {
                    reverse = false;
                    index = 0;
                }
            } else {
                index++;
                if (index > output.length) {
                    reverse = true;
                    index = output.length - 1;
                }
            }
    
            console.log(output);
            setTimeout(animate, delay);
        }
    
        animate();
    }
 


function toggleLight() {
    lightOn = !lightOn;
    light.visible = lightOn;
}

let draggableLamps = [];

function createLamp(xPosition, yPosition, zPosition) {
    const lamp = new THREE.Group();

    const cylinderGeometryCenter = new THREE.CylinderGeometry(0.5, 0.5, 2, 16);
    const cylinderMaterialCenter = new THREE.MeshPhongMaterial({ color: 0xffffff, transparent: true, opacity: 0.8 });
    const cylinderCenter = new THREE.Mesh(cylinderGeometryCenter, cylinderMaterialCenter);
    cylinderCenter.position.y = 0;
    lamp.add(cylinderCenter);

    const cylinderGeometryTop = new THREE.CylinderGeometry(0.25, 0.5, 0.6, 16);
    const cylinderMaterialTop = new THREE.MeshPhongMaterial({ color: 0x555555 });
    const cylinderTop = new THREE.Mesh(cylinderGeometryTop, cylinderMaterialTop);
    cylinderTop.position.y = 1;
    lamp.add(cylinderTop);

    const cylinderGeometryBottom = new THREE.CylinderGeometry(0.5, 0.5, 0.5, 16);
    const cylinderMaterialBottom = new THREE.MeshPhongMaterial({ color: 0x555555 });
    const cylinderBottom = new THREE.Mesh(cylinderGeometryBottom, cylinderMaterialBottom);
    cylinderBottom.position.y = -1;
    lamp.add(cylinderBottom);

    lamp.position.set(xPosition, yPosition, zPosition);
    scene.add(lamp);

    const pointLight = new THREE.PointLight(color, 1.9, 20);
    pointLight.position.set(0, 1, 0);
    lamp.add(pointLight);

    let lightOn = false;

    function toggleLight() {
        lightOn = !lightOn;
        pointLight.visible = lightOn;
    }

    lamp.addEventListener('mousedown', toggleLight);
    lamp.addEventListener('touchstart', toggleLight);

    draggableLamps.push(lamp);

    return lamp;
}

function createWalls() {
    const wallTexture = textureLoader.load('wall.jpg');
    wallTexture.wrapS = THREE.RepeatWrapping;
    wallTexture.wrapT = THREE.RepeatWrapping;
    wallTexture.repeat.set(4, 4);

    const wallMaterial = new THREE.MeshStandardMaterial({
        map: wallTexture,
        color: 0x808080,
        roughness: 0.75,
        metalness: 0.1,
    });

    const wallHeight = 100;
    const wallWidth = 0.5;
    const wallDepth = 30;

    const leftWallGeometry = new THREE.BoxGeometry(wallWidth, wallHeight, wallDepth);
    const leftWall = new THREE.Mesh(leftWallGeometry, wallMaterial);
    leftWall.position.set(-10, wallHeight / 2 - 50, 0);
    scene.add(leftWall);

    const rightWallGeometry = new THREE.BoxGeometry(wallWidth, wallHeight, wallDepth);
    const rightWall = new THREE.Mesh(rightWallGeometry, wallMaterial);
    rightWall.position.set(10, wallHeight / 2 - 50, 0);
    scene.add(rightWall);

    const backWallGeometry = new THREE.BoxGeometry(wallDepth, wallHeight, wallWidth);
    const backWall = new THREE.Mesh(backWallGeometry, wallMaterial);
    backWall.position.set(0, wallHeight / 2 - 50, -wallDepth / 2);
    scene.add(backWall);

    createWallDoor(-9.5 + wallWidth / 2, 4, 2,80); // Left wall door
    createWallDoor(9.5 - wallWidth / 2, 3.5, -2,-80); // Right wall door
    createWallDoor(4, -7, -14,0); // Back wall door

    createLamp(-9 + wallWidth / 2, -3, 0);
    createLamp(9 - wallWidth / 10, -6, 0);
    createLamp(5, 9, -wallDepth / 2);
}

function createPicture(x, y, z, imageUrl, w, h, frameThickness, frameTextureUrl, angleInRadians = 0) {
    const paintingWidth = w;
    const paintingHeight = h;
    const paintingGeometry = new THREE.PlaneGeometry(paintingWidth, paintingHeight);

    const womanTexture = new THREE.TextureLoader().load(imageUrl);
    const womanMaterial = new THREE.MeshBasicMaterial({ map: womanTexture, side: THREE.DoubleSide });

    const painting = new THREE.Mesh(paintingGeometry, womanMaterial);
    painting.position.set(0, 0, 0);

    const frameTexture = new THREE.TextureLoader().load(frameTextureUrl);
    const frameMaterial = new THREE.MeshBasicMaterial({ map: frameTexture, side: THREE.DoubleSide });

    const frameWidth = paintingWidth + frameThickness * 2;
    const frameHeight = paintingHeight + frameThickness * 2;
    const frameGeometry = new THREE.PlaneGeometry(frameWidth, frameHeight);
    const frame = new THREE.Mesh(frameGeometry, frameMaterial);
    frame.position.set(0, 0, -0.01);

    const group = new THREE.Group();
    group.add(frame);
    group.add(painting);
    group.position.set(x, y, z);

    // Rotate the group around the z-axis
    group.rotation.y = angleInRadians;

    scene.add(group);

    return group;
}



function createMovingTransparentSun() {
    // Define path points (points where the object moves)
    const pathPoints = [
        new THREE.Vector3(-8, 13, -14), // Start point
        new THREE.Vector3(-4, 18, -14), // Intermediate point 1
        new THREE.Vector3(0, 19, -14), // Intermediate point 2
        new THREE.Vector3(8, 13, -14)   // End point
    ];

    let pointIndex = 0; // Start with the second point in pathPoints array
    let isSunMoving = true; // Flag to control if the sun is moving or not

    // Sun light properties
    const sunColor = 0xff9900; // Sun color (orange shade)
    const sunIntensity = 6.0; // Sunlight intensity
    const sunDistance = 150; // Distance to place the sun in the scene

    // Create the sunlight
    const sunLight = new THREE.PointLight(sunColor, sunIntensity, sunDistance);
    sunLight.position.copy(pathPoints[0]); // Position the light source at the first point
    scene.add(sunLight); // Add the light source to the scene

    // Sun mesh representing the sun
    const sunGeometry = new THREE.SphereGeometry(0.5, 16, 16);
    const sunMaterial = new THREE.MeshLambertMaterial({ color: sunColor, transparent: true, opacity: 0.7 }); // Transparent material
    const sun = new THREE.Mesh(sunGeometry, sunMaterial);
    sun.position.copy(pathPoints[0]); // Position the sun at the start point
    scene.add(sun); // Add the sun to the scene

    // Point light around the sun for emitting light
    const pointLight = new THREE.PointLight(0xffffff, 1, 10); // White color, intensity, and range
    sun.add(pointLight); // Attach the point light around the sun

    // Load the ocean wave texture
    const textureLoader = new THREE.TextureLoader();
    const waveTexture = textureLoader.load('ocean.jpg'); // Ocean wave texture

    // Shader material for the wave effect
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
                pos.z += sin(pos.x * 4.0 + time * 2.0) * 0.1; // Wave effect
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

    // Create the wave geometry
    const waveGeometry = new THREE.PlaneGeometry(4, 3, 10, 10); // Width, height, and segments
    const waveMesh = new THREE.Mesh(waveGeometry, waveMaterial);

    // Position the wave
    waveMesh.position.set(0, 9, 10); // Adjust x, y, z coordinates as needed
    scene.add(waveMesh); // Add the wave to the scene

    // Function to animate the movement of the sun
    function moveSun() {
        if (isSunMoving) {
            // Calculate the direction vector for movement
            const direction = new THREE.Vector3().copy(pathPoints[pointIndex]).sub(sunLight.position).normalize();
            const speed = 0.1; // Movement speed

            // Move the sun towards the target
            sunLight.position.add(direction.multiplyScalar(speed));
            sun.position.copy(sunLight.position); // Position the sun mesh at the same position

            // Update intensity based on the vertical position of the sun
            const intensityFactor = (sunLight.position.y - 8) / 2 * 10; // Adjust this factor as needed

            // Decrease intensity of sunLight and pointLight as sun moves up
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
        }

        // Render the scene
        renderer.render(scene, camera);

        // Request the next animation frame
        requestAnimationFrame(moveSun);
    }

    // Raycaster and mouse coordinates
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    // Listen for mouse click events
    function onMouseClick(event) {
        // Calculate mouse coordinates
        mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

        // Check for intersections with the sun using raycaster
        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObjects([sun]);

        // Check if the sun was clicked
        if (intersects.length > 0) {
            isSunMoving = !isSunMoving; // Toggle movement on click
        }
    }

    // Add mouse click event listener to the window
    window.addEventListener('click', onMouseClick, false);

    // Start moving the sun
    moveSun();
}
createMovingTransparentSun();


createPicture(4, 2, -14, 'guy.jpg', 4, 4.2, 0.25, 'frameTexture.jpg');
createPicture(-9.5+ 0.5 / 2, -4, 5, 'guysad.jpg', 3, 3.2, 0.26, 'frameTexture.jpg',1.6);
createPicture(-9.5, 13, 2, 'monalisa.jpg', 3, 6, 0.23, 'frameTexture.jpg',1.6);
createPicture(9.5, 1, 5, 'manhorse.jpg', 4, 9, 0.21, 'frameTexture.jpg',80);
createPicture(-5, 2, -14, 'seetwoman8.jpg', 4, 10, 0.27, 'frameTexture.jpg');
createPicture(9.5, 9, -9, 'yunan.jpg', 5, 5, 0.26, 'frameTexture.jpg',80);
createPicture(0, 17, -14, 'ocean.jpg', 17, 9, 0.26, 'frameTexture.jpg');

createAllStairs();
createWalls();

let rotationSpeed = 0.01;
let rotationDirection = 1;
let rotating = true;

function animate() {
    requestAnimationFrame(animate);

    if (rotating) {
        stairsGroup.rotation.y += rotationSpeed * rotationDirection;
    }

    const minAngle = -2 * Math.PI / 3;
    const maxAngle = Math.PI / 60;

    if (stairsGroup.rotation.y >= maxAngle || stairsGroup.rotation.y <= minAngle) {
        rotationDirection *= -1;
    }

    renderer.render(scene, camera);
}

animate();

raycaster = new THREE.Raycaster();
mouse = new THREE.Vector2();

function onMouseClick(event) {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);

    const intersects = raycaster.intersectObjects(scene.children, true);

    if (intersects.length > 0 && stairsGroup.children.includes(intersects[0].object)) {
        rotating = !rotating;
    }
}

window.addEventListener('click', onMouseClick, false);

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// Add camera controls
document.addEventListener("keydown", (event) => {
    const moveSpeed = 0.5;
    switch (event.key) {
        case "ArrowUp":
            camera.position.z -= moveSpeed;
            break;
        case "ArrowDown":
            camera.position.z += moveSpeed;
            break;
        case "ArrowLeft":
            camera.position.x -= moveSpeed;
            break;
        case "ArrowRight":
            camera.position.x += moveSpeed;
            break;
        case "w":
            camera.position.y += moveSpeed;
            break;
        case "s":
            camera.position.y -= moveSpeed;
            break;
    }
});

// Dragging and Dropping Lamps
let selectedLamp = null;
let offset = new THREE.Vector3();
let plane = new THREE.Plane();
let intersect = new THREE.Vector3();

function onMouseDown(event) {
    event.preventDefault();

    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);

    const intersects = raycaster.intersectObjects(draggableLamps, true);

    if (intersects.length > 0) {
        selectedLamp = intersects[0].object.parent;  // Select the entire group

        if (raycaster.ray.intersectPlane(plane, intersect)) {
            offset.copy(intersect).sub(selectedLamp.position);
        }

        document.addEventListener('mousemove', onMouseMove, false);
        document.addEventListener('mouseup', onMouseUp, false);
    }
}

function onMouseMove(event) {
    event.preventDefault();

    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);

    if (selectedLamp) {
        if (raycaster.ray.intersectPlane(plane, intersect)) {
            selectedLamp.position.copy(intersect.sub(offset));
            constrainLampPosition(selectedLamp);
        }
    }
}

function onMouseUp(event) {
    event.preventDefault();

    document.removeEventListener('mousemove', onMouseMove, false);
    document.removeEventListener('mouseup', onMouseUp, false);

    selectedLamp = null;
}

function onDocumentMouseMove(event) {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);

    if (selectedLamp) {
        if (raycaster.ray.intersectPlane(plane, intersect)) {
            selectedLamp.position.copy(intersect.sub(offset));
            constrainLampPosition(selectedLamp);
        }
    } else {
        plane.setFromNormalAndCoplanarPoint(camera.getWorldDirection(plane.normal), intersect);
    }
}

function constrainLampPosition(lamp) {
    const minX = -10 + 0.5; // Adjust these values according to your scene's boundaries
    const maxX = 10 - 0.5;
    const minY = 0;
    const maxY = 10;
    const minZ = -15;
    const maxZ = 15;

    lamp.position.x = Math.max(minX, Math.min(maxX, lamp.position.x));
    lamp.position.y = Math.max(minY, Math.min(maxY, lamp.position.y));
    lamp.position.z = Math.max(minZ, Math.min(maxZ, lamp.position.z));
}

function initDragControls() {
    window.addEventListener('mousedown', onMouseDown, false);
    window.addEventListener('mousemove', onDocumentMouseMove, false);
}

initDragControls();
