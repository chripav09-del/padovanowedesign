/* ========== AOS Init ========== */
AOS.init({ duration: 700, once: true, offset: 80 });

/* ========== Navbar scroll effect ========== */
const navbar = document.getElementById('navbar');
let lastScroll = 0;
window.addEventListener('scroll', () => {
  navbar.classList.toggle('navbar--scrolled', window.scrollY > 40);
});

/* ========== Hamburger menu ========== */
const hamburger = document.getElementById('hamburger');
const navMenu = document.getElementById('navMenu');
hamburger.addEventListener('click', () => {
  hamburger.classList.toggle('open');
  navMenu.classList.toggle('open');
});
navMenu.querySelectorAll('.navbar__link').forEach(link => {
  link.addEventListener('click', () => {
    hamburger.classList.remove('open');
    navMenu.classList.remove('open');
  });
});

/* ========== 3D Tilt on cards ========== */
document.querySelectorAll('.card--tilt').forEach(card => {
  card.addEventListener('mousemove', e => {
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const midX = rect.width / 2;
    const midY = rect.height / 2;
    const rotateY = ((x - midX) / midX) * 6;
    const rotateX = ((midY - y) / midY) * 6;
    card.style.transform = `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.02)`;
  });
  card.addEventListener('mouseleave', () => {
    card.style.transform = 'perspective(800px) rotateX(0) rotateY(0) scale(1)';
  });
});

/* ========== Three.js Hero Background ========== */
(function initHero3D() {
  const canvas = document.getElementById('heroCanvas');
  if (!canvas) return;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 100);
  camera.position.z = 30;

  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  // Particle field
  const count = 600;
  const positions = new Float32Array(count * 3);
  for (let i = 0; i < count * 3; i++) {
    positions[i] = (Math.random() - 0.5) * 60;
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  const material = new THREE.PointsMaterial({
    color: 0x3B82F6,
    size: 0.12,
    transparent: true,
    opacity: 0.6,
  });
  const particles = new THREE.Points(geometry, material);
  scene.add(particles);

  // Rotating icosahedron wireframe
  const icoGeo = new THREE.IcosahedronGeometry(5, 1);
  const icoMat = new THREE.MeshBasicMaterial({ color: 0x60A5FA, wireframe: true, transparent: true, opacity: 0.15 });
  const ico = new THREE.Mesh(icoGeo, icoMat);
  ico.position.set(12, 0, 0);
  scene.add(ico);

  let mouse = { x: 0, y: 0 };
  window.addEventListener('mousemove', e => {
    mouse.x = (e.clientX / window.innerWidth - 0.5) * 2;
    mouse.y = (e.clientY / window.innerHeight - 0.5) * 2;
  });

  function animate() {
    requestAnimationFrame(animate);
    particles.rotation.y += 0.0004;
    particles.rotation.x += 0.0002;
    ico.rotation.x += 0.003;
    ico.rotation.y += 0.005;
    camera.position.x += (mouse.x * 2 - camera.position.x) * 0.02;
    camera.position.y += (-mouse.y * 2 - camera.position.y) * 0.02;
    camera.lookAt(scene.position);
    renderer.render(scene, camera);
  }
  animate();

  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });
})();

/* ========== EmailJS Contact Form ========== */
/*
  ISTRUZIONI:
  1. Registrati su https://www.emailjs.com/ (piano gratuito)
  2. Crea un servizio email (es. Gmail) e copia il Service ID
  3. Crea un template con le variabili: {{nome}}, {{attivita}}, {{contatto}}, {{messaggio}}
  4. Vai su Account > API Keys e copia la Public Key
  5. Sostituisci i placeholder qui sotto con i tuoi valori
*/
emailjs.init('Lt4q3_hmPmMtvR7Ls');

const contactForm = document.getElementById('contactForm');
const formStatus = document.getElementById('formStatus');

contactForm.addEventListener('submit', function (e) {
  e.preventDefault();
  formStatus.textContent = 'Invio in corso...';
  formStatus.className = 'form__status';

  const params = {
    nome: document.getElementById('nome').value,
    attivita: document.getElementById('attivita').value,
    contatto: document.getElementById('contatto').value,
    messaggio: document.getElementById('messaggio').value,
  };

  emailjs.send(
    'service_9ek1f8a',
    'template_oqple5r',
    params
  ).then(() => {
    formStatus.textContent = 'Messaggio inviato! Ti rispondo il prima possibile.';
    formStatus.className = 'form__status form__status--success';
    contactForm.reset();
  }).catch(() => {
    formStatus.textContent = 'Errore nell\'invio. Prova a scrivermi su WhatsApp.';
    formStatus.className = 'form__status form__status--error';
  });
});
