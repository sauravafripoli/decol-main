import * as THREE from 'https://unpkg.com/three@0.160.0/build/three.module.js';
import { OrbitControls } from 'https://unpkg.com/three@0.160.0/examples/jsm/controls/OrbitControls.js';
import { getDescriptiveTerm } from './utils.js';

let scene;
let camera;
let renderer;
let controls;
let pointsGroup;
let raycaster;
let mouse;
let animationFrameId;
let onPublicationSelect = null;
let planeMeshes = [];
let selectedOctantIndex = null;
let targetCameraPosition = null;
let targetLookAt = new THREE.Vector3(0, 0, 0);
let currentLookAt = new THREE.Vector3(0, 0, 0);
let targetPlaneOpacity = 0.15;
let currentPlaneOpacity = 0.15;
let lastWidth = 0;
let lastHeight = 0;
let octantLabel = null;
let octantCanvas = null;
let octantContext = null;

const quadrants = [
    { x: -1, y: -1, z: -1, name: 'Reformist Western Establishment', description: '(-Reform, -Collective, -Western)' , subDescription: 'Incremental reform of the status quo–the mainstream donor system.', tooltip:'Maps voices of those who seek to improve the established aid architecture — the major Western donors and multilateral institutions and their procedures — without changing who holds authority within it. Change is gradual and routed through existing channels; the aim is greater efficiency, coordination and accountability, not a redistribution of power.' },
    { x: -1, y: -1, z: 1, name: 'State-Led Southern Development', description: '(-Reform, -Collective, +Global South)' , subDescription: 'Reform within existing frameworks, directed by Global South states.', tooltip:'Keeps the current development frameworks but shifts authority within them toward Global South governments and regional blocs, who set priorities and exercise greater ownership. Change is collective and state-led, and corrective rather than system-replacing.' },
    { x: -1, y: 1, z: -1, name: 'Technocratic Western-led Development', description: '(-Reform, +Individual, -Western)' , subDescription: 'Expert- and market-led problem-solving inside the existing system.', tooltip:'Treats development as a technical and managerial task addressed through expertise, market mechanisms and evidence of "what works." It operates within the current system and keeps Western actors and methods in the lead, emphasising individual capacity, enterprise and measurable results over structural or collective change.' },
    { x: -1, y: 1, z: 1, name: 'Local Southern Champions', description: '(-Reform, +Individual, +Global South)' , subDescription: 'Incremental change led by individual Global South actors.', tooltip:'Presents perspectives that look  to entrepreneurs, local leaders and innovators in the Global South to improve outcomes case by case. It works within the existing system rather than replacing it, locating agency in individual initiative rather than in collective or structural reform.' },
    { x: 1, y: -1, z: -1, name: 'Global Solidarity', description: '(+Transformative, -Collective, -Western)' , subDescription: 'Systemic change pushed for from the Global North in solidarity with the South.', tooltip:'Calls for fundamental change to the global order but assigns the responsibility to act to the Global North — rich states and movements expected to dismantle unequal structures through international alliances. The change sought is transformative and collective, the levers for change and agency it addresses are Western-led.' },
    { x: 1, y: -1, z: 1, name: 'The Pluriverse', description: '(+Transformative, -Collective, +Global South)' , subDescription: 'Plural, community-based alternatives originating in the Global South.', tooltip:'Rejects the existing development model in favour of multiple, community-rooted alternatives grounded in Global Southern societies and knowledge systems. Change is transformative and collective, generated from below rather than reformed from above — the octant most aligned with decolonial perspectives.' },
    { x: 1, y: 1, z: -1, name: 'Critical Western Voices', description: '(+Transformative, +Individual, -Western)' , subDescription: 'Western critics arguing the system is flawed at its foundations.', tooltip:'Individual thinkers, mostly based in the West, who hold that development and aid are broken at the root and need rethinking rather than repair. The critique is radical but voiced from within the West, and tends to favour individual judgement and bottom-up answers over collective or state-led programmes.' },
    { x: 1, y: 1, z: 1, name: 'Radical Vanguards', description: '(+Transformative, +Individual, +Global South)' , subDescription: 'A Global South few moving first toward a reordered global system.', tooltip:'Maps the position that  fundamental change is driven by forerunners — individual figures, leaders, or a small coalition of Global South states — who move ahead of the broader consensus to demand a wholesale reordering of the global order. The ambition is transformative and rooted in the South, carried by a deliberate few rather than by mass movements or institutions.' }
];

function getCategoryColor(category) {
    if (category.includes('NGOs/Civil Society')) return 0xed8936;
    if (category.includes('Governments/Policy Statements')) return 0x9f7aea;
    return 0x4299e1;
}

function createAxesAndPlanes() {
    const axisLength = 20;

    const xAxis = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, axisLength, 8), new THREE.MeshBasicMaterial({ color: 0xfeb2b2 }));
    xAxis.rotation.z = -Math.PI / 2;
    scene.add(xAxis);

    const yAxis = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, axisLength, 8), new THREE.MeshBasicMaterial({ color: 0x9ae6b4 }));
    scene.add(yAxis);

    const zAxis = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, axisLength, 8), new THREE.MeshBasicMaterial({ color: 0x90cdf4 }));
    zAxis.rotation.x = Math.PI / 2;
    scene.add(zAxis);

    const planeSize = 20;
    const geometry = new THREE.PlaneGeometry(planeSize, planeSize);

    const planeX = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial({ color: 0xfeb2b2, transparent: true, opacity: 0.15, side: THREE.DoubleSide }));
    planeX.rotation.y = Math.PI / 2;
    scene.add(planeX);

    const planeY = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial({ color: 0x9ae6b4, transparent: true, opacity: 0.15, side: THREE.DoubleSide }));
    planeY.rotation.x = Math.PI / 2;
    scene.add(planeY);

    const planeZ = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial({ color: 0x90cdf4, transparent: true, opacity: 0.15, side: THREE.DoubleSide }));
    scene.add(planeZ);

    planeMeshes = [planeX, planeY, planeZ];
}

function setupOctantNav(UI) {
    if (!UI.octantNav) return;
    UI.octantNav.innerHTML = '';

    quadrants.forEach((q, index) => {
        const item = document.createElement('div');
        item.className = 'octant-item';
        item.dataset.index = String(index);

        const isRight = q.x > 0;
        const isTop = q.y > 0;
        const isFront = q.z > 0;

        item.innerHTML = `
            <div class="octant-pictogram">
                <div class="picto-grid">
                    <div class="picto-cell ${!isRight && !isTop ? 'active' : ''}" style="opacity: ${isFront ? 1 : 0.5}"></div>
                    <div class="picto-cell ${isRight && !isTop ? 'active' : ''}" style="opacity: ${isFront ? 1 : 0.5}"></div>
                    <div class="picto-cell ${!isRight && isTop ? 'active' : ''}" style="opacity: ${isFront ? 1 : 0.5}"></div>
                    <div class="picto-cell ${isRight && isTop ? 'active' : ''}" style="opacity: ${isFront ? 1 : 0.5}"></div>
                </div>
            </div>
            <div class="octant-text">
                <h4>${q.name}</h4>
                <p>${q.description}</p>
                 <small class="octant-subdescription">
                    ${q.subDescription || ''}
                </small>
                <div class="octant-tooltip">
                    ${q.tooltip}
                </div>
            </div>
        `;
        item.addEventListener('click', () => selectOctant(index, UI));
        UI.octantNav.appendChild(item);
    });
}

function selectOctant(index, UI) {
    if (!UI.octantNav) return;

    const items = UI.octantNav.querySelectorAll('.octant-item');

    if (selectedOctantIndex === index) {
    selectedOctantIndex = null;
    items.forEach((el) => el.classList.remove('selected'));

    octantLabel.visible = false;

    targetCameraPosition = new THREE.Vector3(20, 20, 20);
    targetLookAt.set(0, 0, 0);
    targetPlaneOpacity = 0.15;
    return;
}

    selectedOctantIndex = index;
    items.forEach((el) => el.classList.remove('selected'));
    items[index]?.classList.add('selected');

    const q = quadrants[index];

    updateOctantLabel(q.name);

    octantLabel.position.set(
        q.x * 8,
        q.y * 4,
        q.z * 8
    );

    targetCameraPosition = new THREE.Vector3(
        q.x * 15,
        q.y * 15,
        q.z * 15
    );

    targetLookAt.set(0, 0, 0);
    targetPlaneOpacity = 0.98;
}

function showPublicationCard(diamond, UI) {
    if (!UI.publicationCard) return;

    UI.cardTitle.textContent = diamond.shortTitle || 'Untitled';
    UI.cardMeta.textContent = `${diamond.author || 'Unknown Author'}, ${diamond.year || 'N/A'}`;
    UI.cardX.textContent = getDescriptiveTerm(diamond.x, 'x');
    UI.cardY.textContent = getDescriptiveTerm(diamond.y, 'y');
    UI.cardZ.textContent = getDescriptiveTerm(diamond.z, 'z');

    const xText = diamond.axisInfo?.x?.positioning ? `<b>Reform/Transform:</b> ${diamond.axisInfo.x.positioning}` : '';
    const yText = diamond.axisInfo?.y?.positioning ? `<b>Individual/Collective:</b> ${diamond.axisInfo.y.positioning}` : '';
    const zText = diamond.axisInfo?.z?.positioning ? `<b>West/South:</b> ${diamond.axisInfo.z.positioning}` : '';
    UI.cardSummary.innerHTML = [xText, yText, zText].filter(Boolean).join('<br><br>') || 'No detailed positioning info available.';
    UI.publicationCard.style.display = 'block';
}

function onMouseClick(event, UI) {
    if (!renderer || !camera || !pointsGroup) return;

    const rect = renderer.domElement.getBoundingClientRect();
    mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(pointsGroup.children);
    if (intersects.length === 0) return;

    const target = intersects[0].object;
    const index = target.userData.index;
    const diamond = target.userData.diamond;

    showPublicationCard(diamond, UI);
    if (typeof onPublicationSelect === 'function') onPublicationSelect(index);
}

function animate() {
    animationFrameId = requestAnimationFrame(animate);

    if (targetCameraPosition) {
        camera.position.lerp(targetCameraPosition, 0.05);
        currentLookAt.lerp(targetLookAt, 0.05);
        controls.target.copy(currentLookAt);
    }

    if (Math.abs(currentPlaneOpacity - targetPlaneOpacity) > 0.001) {
        currentPlaneOpacity += (targetPlaneOpacity - currentPlaneOpacity) * 0.05;
        planeMeshes.forEach((mesh) => {
            if (mesh?.material) mesh.material.opacity = currentPlaneOpacity;
        });
    }

    controls?.update();
    renderer?.render(scene, camera);
}

export function initConceptualSpace3D(UI, onSelect) {
    if (!UI.canvasContainer || renderer) return;

    onPublicationSelect = onSelect;

    const rect = UI.canvasContainer.getBoundingClientRect();
    const width = Math.max(320, Math.floor(rect.width || UI.canvasContainer.clientWidth || 900));
    const height = Math.max(320, Math.floor(rect.height || UI.canvasContainer.clientHeight || 500));
    lastWidth = width;
    lastHeight = height;

    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf7fafc);

    camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(20, 20, 20);

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(width, height);
    renderer.domElement.style.position = 'absolute';
    renderer.domElement.style.inset = '0';
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    renderer.domElement.style.zIndex = '1';
    UI.canvasContainer.appendChild(renderer.domElement);

    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;

    scene.add(new THREE.AmbientLight(0xffffff, 0.7));
    const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
    dirLight.position.set(10, 20, 10);
    scene.add(dirLight);

    createAxesAndPlanes();
    createOctantLabel();
    setupOctantNav(UI);

    pointsGroup = new THREE.Group();
    scene.add(pointsGroup);

    raycaster = new THREE.Raycaster();
    mouse = new THREE.Vector2();

    renderer.domElement.addEventListener('click', (event) => onMouseClick(event, UI));

    UI.closePublicationCard?.addEventListener('click', () => {
        UI.publicationCard.style.display = 'none';
    });

    // UI.btnZoomIn?.addEventListener('click', () => {
    //     const direction = new THREE.Vector3().subVectors(camera.position, controls.target);
    //     direction.normalize().multiplyScalar(Math.max(2, direction.length() * 0.85));
    //     camera.position.copy(controls.target).add(direction);
    // });

    // UI.btnZoomOut?.addEventListener('click', () => {
    //     const direction = new THREE.Vector3().subVectors(camera.position, controls.target);
    //     direction.normalize().multiplyScalar(Math.min(100, direction.length() * 1.2));
    //     camera.position.copy(controls.target).add(direction);
    // });
    // Smooth zoom function
function zoomCamera(factor) {
    if (!camera || !controls) return;

    // Vector from target to camera
    const direction = new THREE.Vector3()
        .subVectors(camera.position, controls.target);

    // Current distance from target
    const distance = direction.length();

    // Calculate new distance
    const newDistance = THREE.MathUtils.clamp(
        distance * factor,
        5,    // minimum zoom distance
        80    // maximum zoom distance
    );

    // Keep direction but change length
    direction.setLength(newDistance);

    // Move camera
    camera.position.copy(controls.target).add(direction);

    // Update OrbitControls
    controls.update();
}

// Zoom In
UI.btnZoomIn?.addEventListener('click', () => {
    zoomCamera(0.9);
});

// Zoom Out
UI.btnZoomOut?.addEventListener('click', () => {
    zoomCamera(1.1);
});


    const rotateBy = (angle) => {
        const x = camera.position.x - controls.target.x;
        const z = camera.position.z - controls.target.z;
        const cos = Math.cos(angle);
        const sin = Math.sin(angle);
        camera.position.x = x * cos - z * sin + controls.target.x;
        camera.position.z = x * sin + z * cos + controls.target.z;
        camera.lookAt(controls.target);
    };

    UI.btnRotateLeft?.addEventListener('click', () => rotateBy(Math.PI / 8));
    UI.btnRotateRight?.addEventListener('click', () => rotateBy(-Math.PI / 8));

    window.addEventListener('resize', () => {
        if (!UI.canvasContainer || !renderer || !camera) return;
        const r = UI.canvasContainer.getBoundingClientRect();
        const w = Math.max(320, Math.floor(r.width || UI.canvasContainer.clientWidth || lastWidth || 900));
        const h = Math.max(320, Math.floor(r.height || UI.canvasContainer.clientHeight || lastHeight || 500));
        lastWidth = w;
        lastHeight = h;
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h);
    });

    animate();
}

export function updateConceptualSpace3D({ diamondsData, filterYearMax, isPublicationTypeVisible, UI }) {
    if (!pointsGroup) return;

    while (pointsGroup.children.length > 0) {
        const child = pointsGroup.children[0];
        child.geometry?.dispose();
        child.material?.dispose();
        pointsGroup.remove(child);
    }

    diamondsData.forEach((diamond, index) => {
        const isVisible = (!diamond.year || diamond.year <= filterYearMax) && isPublicationTypeVisible(diamond, UI);
        if (!isVisible) return;

        const category = Array.isArray(diamond.category) ? diamond.category : [];

        let geometry;
        if (category.includes('NGOs/Civil Society')) geometry = new THREE.TetrahedronGeometry(0.4);
        else if (category.includes('Governments/Policy Statements')) geometry = new THREE.BoxGeometry(0.5, 0.5, 0.5);
        else geometry = new THREE.SphereGeometry(0.3, 24, 24);

        const mesh = new THREE.Mesh(geometry, new THREE.MeshStandardMaterial({ color: getCategoryColor(category) }));

        if (category.includes('Governments/Policy Statements')) {
            mesh.rotation.z = Math.PI / 4;
            mesh.rotation.x = Math.PI / 4;
        }

        mesh.position.set(diamond.x ?? 0, diamond.y ?? 0, diamond.z ?? 0);
        mesh.userData = { index, diamond };
        pointsGroup.add(mesh);
    });
}

export function destroyConceptualSpace3D() {
    if (animationFrameId) cancelAnimationFrame(animationFrameId);
}

function createOctantLabel() {
    octantCanvas = document.createElement('canvas');
    octantCanvas.width = 512;
    octantCanvas.height = 128;

    octantContext = octantCanvas.getContext('2d');

    const texture = new THREE.CanvasTexture(octantCanvas);

    const material = new THREE.SpriteMaterial({
        map: texture,
        transparent: true
    });

    octantLabel = new THREE.Sprite(material);
    octantLabel.scale.set(7, 0.7, 1);
    octantLabel.position.set(0, 10, 0);
    octantLabel.visible = false;

    scene.add(octantLabel);
}

function updateOctantLabel(text) {
    octantCanvas.width = 1200;
    octantCanvas.height = 120;

    octantContext.clearRect(0, 0, 1200, 120);

    let fontSize = 42;

    if (text.length > 20) fontSize = 36;
    if (text.length > 30) fontSize = 32;
    if (text.length > 40) fontSize = 28;

    // Make the text bigger
    fontSize += 8;   // Increase by 8px (adjust as desired)

    octantContext.font = `700 ${fontSize}px "Open Sans", sans-serif`;
    octantContext.textAlign = "center";
    octantContext.textBaseline = "middle";

    // White outline
    octantContext.lineWidth = 6;
    octantContext.strokeStyle = "#ffffff";
    octantContext.strokeText(text, 600, 60);

    // Black fill
    octantContext.fillStyle = "#000000";
    octantContext.fillText(text, 600, 60);

    octantLabel.material.map.needsUpdate = true;
    octantLabel.visible = true;
}