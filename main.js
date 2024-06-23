// Scene setup
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x202020);
scene.fog = new THREE.FogExp2(0x202020, 0.01); // Add exponential fog for infinite floor illusion

// Camera setup
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 5, 10);

// Renderer setup
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Lighting
const ambientLight = new THREE.AmbientLight(0x404040, 1.5); // Soft white light
scene.add(ambientLight);

const pointLight = new THREE.PointLight(0xffffff, 1, 100);
pointLight.position.set(10, 10, 10);
scene.add(pointLight);

// Texture loader
const textureLoader = new THREE.TextureLoader();
const wallTexture = textureLoader.load('bg.jpg'); // Replace with your new texture image path
wallTexture.wrapS = THREE.RepeatWrapping;
wallTexture.wrapT = THREE.RepeatWrapping;
wallTexture.repeat.set(4, 4); // Adjust repeat values to fit the wall size

const doorTexture = textureLoader.load('door.jpg'); // Replace with your door texture image path

// Gothic staircase geometry
let stairsGroup;
let railingsSpheres = []; // Array to store railing spheres
let currentRotationAngle = 0; // Track the current rotation angle of the staircase

function createStaircase() {
    stairsGroup = new THREE.Group();

    const stepHeight = 0.3;
    const stepDepth = 1;
    const stepWidth = 6;

    const stepGeometry = new THREE.BoxGeometry(stepWidth, stepHeight, stepDepth);
    const stepMaterial = new THREE.MeshStandardMaterial({ color: 0x8B4513 }); // Warm brown color

    const railingHeight = 1;
    const railingThickness = 0.1;
    const railingMaterial = new THREE.MeshStandardMaterial({ color: 0xD2B48C }); // Warm tan color

    let leftRailingPositions = [];
    let rightRailingPositions = [];

    for (let i = 0; i < 30; i++) {
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
        railingsSpheres.push(leftSphere);

        const rightSphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
        rightSphere.position.copy(rightRailing.position.clone().add(new THREE.Vector3(0, sphereOffset, 0)));
        stairsGroup.add(rightSphere);
        railingsSpheres.push(rightSphere);
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

    // Adjust position of the entire staircase to align with the door
    stairsGroup.position.set(-10 + stepDepth / 2, 0, 0);

    scene.add(stairsGroup);
}

// Create a door on a wall
function createWallDoor(x, y, z) {
    const doorWidth = 3;
    const doorHeight = 7;
    const doorDepth = 0.5;
    const doorMaterial = new THREE.MeshStandardMaterial({
        map: doorTexture
    }); // Apply door texture

    const doorGeometry = new THREE.BoxGeometry(doorWidth, doorHeight, doorDepth);
    const doorMesh = new THREE.Mesh(doorGeometry, doorMaterial);

    // Position the door on the specified wall
    doorMesh.position.set(x, y, z);

    scene.add(doorMesh);
}

// Function to create the walls
function createWalls() {
    // Updated wall colors and shading
    const wallTexture = textureLoader.load('bg.jpg'); // Replace with your texture image path
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
    createWallDoor(-10 + wallWidth / 2, 3.5, 0); // Left wall door
    createWallDoor(10 - wallWidth / 2, 3.5, 0); // Right wall door
    createWallDoor(0, 3.5, -wallDepth / 2); // Back wall door
}

// Call the functions to create the staircase, door, and walls
createStaircase();
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
    const intersects = raycaster.intersectObjects(stairsGroup.children, true);

    if (intersects.length > 0) {
        // Rotate the staircase group by -30 degrees (-π/6 radians) around the y-axis if within bounds
        const angleIncrement = -Math.PI / 3; // -60 degrees in radians
        const newAngle = currentRotationAngle + angleIncrement;

        // Check if the new rotation angle will cause the staircase to intersect the walls
        if (Math.abs(newAngle) <= Math.PI) { // Allow up to 90 degrees rotation in either direction
            const axis = new THREE.Vector3(0, 1, 0); // Rotate around the y-axis
            stairsGroup.rotateOnAxis(axis, angleIncrement);
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
