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
    createLStaircase(-3, -6, 5, Math.PI / 25, 13);
    createPathway(10 - 0.7 / 2 - 0.5, 3.5, 1, 11, 2, Math.PI / 2);
}

function createWallDoor(x, y, z) {
    const doorWidth = 3;
    const doorHeight = 7;
    const doorDepth = 0.5;
    const archHeight = 3;

    const doorGeometry = new THREE.BoxGeometry(doorWidth, doorHeight, doorDepth);
    const doorMaterial = new THREE.MeshStandardMaterial({ map: doorTexture });
    const doorMesh = new THREE.Mesh(doorGeometry, doorMaterial);
    doorMesh.position.set(x, y, z);

    const archGeometry = new THREE.PlaneGeometry(doorWidth + 0.5, archHeight);
    const archMaterial = new THREE.MeshStandardMaterial({ map: archTexture });
    const archMesh = new THREE.Mesh(archGeometry, archMaterial);
    archMesh.position.set(x, y + doorHeight / 2 + archHeight / 2, z + doorDepth / 2 + 0.01);

    scene.add(doorMesh);
    scene.add(archMesh);

    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    function onMouseClick(event) {
        mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObject(doorMesh);

        if (intersects.length > 0) {
            gsap.to(doorMesh.rotation, { y: Math.PI / 2, duration: 1 });
        }
    }

    window.addEventListener('click', onMouseClick, false);
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

    createWallDoor(-10 + wallWidth / 2, 4, 4);
    createWallDoor(10 - wallWidth / 2, 7, 1);
    createWallDoor(0, 3.5, -wallDepth / 2);

    createLamp(-9 + wallWidth / 2, -3, 0);
    createLamp(9 - wallWidth / 10, -6, 0);
    createLamp(5, 9, -wallDepth / 2);
}

function createPicture(x, y, z, imageUrl, w, h, frameThickness, frameTextureUrl) {
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
    scene.add(group);

    return group;
}

function createMovingRedSun() {
    const pathPoints = [
        new THREE.Vector3(-1.4, 8, 10),
        new THREE.Vector3(-0.7, 9, 11),
        new THREE.Vector3(0.7, 9, 12),
        new THREE.Vector3(1.4, 8, 10)
    ];

    let pointIndex = 1;

    const sunColor = 0xff9900;
    const sunIntensity = 1.0;
    const sunDistance = 15;

    const sunLight = new THREE.PointLight(sunColor, sunIntensity, sunDistance);
    sunLight.position.copy(pathPoints[0]);
    scene.add(sunLight);

    const sunGeometry = new THREE.SphereGeometry(0.5, 16, 16);
    const sunMaterial = new THREE.MeshBasicMaterial({ color: sunColor });
    const sun = new THREE.Mesh(sunGeometry, sunMaterial);
    sun.position.copy(pathPoints[0]);
    scene.add(sun);

    function moveSun() {
        const direction = new THREE.Vector3().copy(pathPoints[pointIndex]).sub(sunLight.position).normalize();
        const speed = 0.009;

        sunLight.position.add(direction.multiplyScalar(speed));
        sun.position.copy(sunLight.position);

        if (sunLight.position.distanceTo(pathPoints[pointIndex]) < speed) {
            pointIndex = (pointIndex + 1) % pathPoints.length;
            if (pointIndex === 0) {
                sunLight.position.copy(pathPoints[0]);
                sun.position.copy(pathPoints[0]);
            }
        }

        renderer.render(scene, camera);

        requestAnimationFrame(moveSun);
    }

    moveSun();
}

createMovingRedSun();

createPicture(4, 1, -10, 'guy.jpg', 3, 3.2, 0.25, 'frameTexture.jpg');
createPicture(9, 3, 10, 'guysad.jpg', 3, 3.2, 0.26, 'frameTexture.jpg');
createPicture(-6, 9, 10, 'monalisa.jpg', 1, 4, 0.23, 'frameTexture.jpg');
createPicture(6, 1, 10, 'manhorse.jpg', 0.9, 2, 0.21, 'frameTexture.jpg');
createPicture(1, -1.4, 10, 'seetwoman8.jpg', 1, 2, 0.27, 'frameTexture.jpg');
createPicture(5, 9, 10, 'yunan.jpg', 2, 1, 0.26, 'frameTexture.jpg');
createPicture(0, 9, 10, '', 4, 3, 0.26, 'frameTexture.jpg');

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

const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

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
