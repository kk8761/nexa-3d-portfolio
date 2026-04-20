import * as THREE from 'three';

// --- CONFIGURATION ---
const SCENE_CONFIG = {
    particleCount: 2000,
    islandColor: 0x00e5ff,
    particleColor: 0xffffff,
    bgAlpha: 0,
};

// --- CORE THREE.JS SETUP ---
const canvas = document.querySelector('#bg-canvas');
const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: true
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 0, 5);

// --- LIGHTING ---
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

const pointLight = new THREE.PointLight(0x00e5ff, 2);
pointLight.position.set(2, 3, 4);
scene.add(pointLight);

const rectLight = new THREE.DirectionalLight(0xffffff, 1);
rectLight.position.set(-5, 5, 5);
scene.add(rectLight);

// --- OBJECTS: THE ZEN ISLAND ---
// We'll create a cluster of floating geometric shapes to represent the "Island"
const islandGroup = new THREE.Group();
const geometry = new THREE.IcosahedronGeometry(1.5, 0); 
const material = new THREE.MeshPhongMaterial({
    color: 0x111111,
    wireframe: true,
    emissive: 0x004455,
    flatShading: true,
});

const centralHub = new THREE.Mesh(geometry, material);
islandGroup.add(centralHub);

// Add smaller orbiting fragments
for(let i = 0; i < 15; i++) {
    const sGeom = new THREE.OctahedronGeometry(Math.random() * 0.4 + 0.1, 0);
    const sMat = new THREE.MeshPhongMaterial({
        color: 0x00e5ff,
        transparent: true,
        opacity: 0.8,
        flatShading: true
    });
    const fragment = new THREE.Mesh(sGeom, sMat);
    
    // Spread them around
    fragment.position.set(
        (Math.random() - 0.5) * 6,
        (Math.random() - 0.5) * 6,
        (Math.random() - 0.5) * 6
    );
    fragment.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
    islandGroup.add(fragment);
}

scene.add(islandGroup);

// --- BACKGROUND PARTICLES ---
const particlesGeometry = new THREE.BufferGeometry();
const posArray = new Float32Array(SCENE_CONFIG.particleCount * 3);

for(let i = 0; i < SCENE_CONFIG.particleCount * 3; i++) {
    posArray[i] = (Math.random() - 0.5) * 15;
}

particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
const particlesMaterial = new THREE.PointsMaterial({
    size: 0.005,
    color: 0xffffff,
    transparent: true,
    opacity: 0.5
});

const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
scene.add(particlesMesh);

// --- MOUSE INTERACTION (PARALLAX) ---
let mouseX = 0;
let mouseY = 0;

window.addEventListener('mousemove', (e) => {
    mouseX = (e.clientX / window.innerWidth) - 0.5;
    mouseY = (e.clientY / window.innerHeight) - 0.5;
});

// --- GSAP SCROLL ANIMATIONS ---
gsap.registerPlugin(ScrollTrigger);

// Animate island based on scroll
gsap.to(islandGroup.rotation, {
    y: Math.PI * 2,
    x: Math.PI / 2,
    scrollTrigger: {
        trigger: "body",
        start: "top top",
        end: "bottom bottom",
        scrub: 1
    }
});

gsap.to(camera.position, {
    z: 2,
    y: 1,
    scrollTrigger: {
        trigger: "#about",
        start: "top bottom",
        end: "top center",
        scrub: 1
    }
});

// Reveal UI content
const sections = document.querySelectorAll('.content');
sections.forEach(section => {
    gsap.to(section, {
        scrollTrigger: {
            trigger: section,
            start: "top 80%",
            onEnter: () => section.classList.add('active'),
            onLeaveBack: () => section.classList.remove('active')
        }
    });
});

// --- ANIMATION LOOP ---
const clock = new THREE.Clock();

function animate() {
    const elapsedTime = clock.getElapsedTime();

    // Rotate core elements
    centralHub.rotation.y += 0.005;
    centralHub.rotation.z += 0.002;

    // Subtle floating fragments
    islandGroup.children.forEach((child, i) => {
        if(i > 0) {
            child.position.y += Math.sin(elapsedTime + i) * 0.002;
            child.rotation.x += 0.01;
        }
    });

    // Parallax effect on camera
    const targetX = mouseX * 0.5;
    const targetY = -mouseY * 0.5;
    camera.position.x += (targetX - camera.position.x) * 0.05;
    camera.position.y += (targetY - camera.position.y) * 0.05;
    camera.lookAt(0, 0, 0);

    renderer.render(scene, camera);
    requestAnimationFrame(animate);
}

// Handle Resize
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// --- FORM SUBMISSION HANDLING ---
const contactForm = document.querySelector('#contact-form');
if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const btn = contactForm.querySelector('button');
        const originalText = btn.innerText;
        btn.innerText = "Sending...";
        btn.disabled = true;

        try {
            const formData = new FormData(contactForm);
            const response = await fetch(contactForm.action, {
                method: 'POST',
                body: formData,
                headers: {
                    'Accept': 'application/json'
                }
            });

            if (response.ok) {
                alert("Thank you! Your message has been sent successfully.");
                contactForm.reset();
            } else {
                alert("Oops! There was a problem submitting your form.");
            }
        } catch (error) {
            alert("Error: Could not connect to the server.");
        } finally {
            btn.innerText = originalText;
            btn.disabled = false;
        }
    });
}

// Start loop
animate();

console.log("Nexa3D Portfolio Loaded Successfully");
