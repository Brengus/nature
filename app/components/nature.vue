<template>
  <client-only>
    <div ref="container" class="three-nature-container"></div>
    <section class="scroll-section section-1">Welcome to the Camp</section>
    <section class="scroll-section section-2">The Fire Burns Bright</section>
    <section class="scroll-section section-3">The Moon Watches</section>
    <button @click="toggleAudio" class="play-button">
      {{ isPlaying ? 'Mute' : 'Play Music' }}
    </button>
  </client-only>
</template>

<script setup>
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ref, onMounted, onBeforeUnmount, nextTick } from 'vue';
import {loadCampfire,updateCampfire,loadMoon, createStars} from 'assets/src/three/campfire.js';
import * as THREE from 'three';

const container = ref(null);
let axesHelper; // CameraHelper is not needed anymore
let scene, camera, renderer, ground, audio;
let animationId;
const clock = new THREE.Clock();
const isPlaying = ref(false);
const toggleAudio =()=>{
  if(!audio) {
    audio = new Audio('/sounds/fireplace.mp3');
    audio.loop = true;
    audio.volume = 1;
  }
  if(isPlaying.value){
    audio?.pause();
    isPlaying.value = false;
  }else{
    audio.play().catch(err=> console.warn(err));
    isPlaying.value = true;
  }
}
function initThree() {
  scene = new THREE.Scene()
  scene.background = new THREE.Color('#181c2b')
  scene.fog = new THREE.Fog('#181c2b', 10, 100)
  camera = new THREE.PerspectiveCamera(
    75,
    container.value.clientWidth / container.value.clientHeight,
    0.1,
    1000
  )
  camera.position.set(0, 2, 5);
  loadCampfire(scene);
  loadMoon(scene);
  createStars(scene);
  const loadingManager = new THREE.LoadingManager(() => {
    [baseColor, normalMap, roughnessMap, metalnessMap].forEach(tex => {
    tex.wrapS = THREE.RepeatWrapping
    tex.wrapT = THREE.RepeatWrapping
    tex.repeat.set(20, 20)
    tex.anisotropy = 16
    });
    const groundGeometry = new THREE.PlaneGeometry(200, 200,400,400)
    const groundMaterial = new THREE.MeshStandardMaterial({
        map: baseColor, normalMap: normalMap, roughnessMap: roughnessMap,
        metalnessMap: metalnessMap, metalness: 0.2, roughness: 0.6
    })
    ground = new THREE.Mesh(groundGeometry, groundMaterial)
    ground.rotation.x = -Math.PI / 2
    ground.receiveShadow = true
    scene.add(ground)
  })
  const textureLoader = new THREE.TextureLoader(loadingManager)
  const baseColor = textureLoader.load('/textures/grass/Poliigon_GrassPatchyGround_4585_BaseColor.jpg')
  const normalMap = textureLoader.load('/textures/grass/Poliigon_GrassPatchyGround_4585_Normal.png')
  const roughnessMap = textureLoader.load('/textures/grass/Poliigon_GrassPatchyGround_4585_Roughness.jpg')
  const metalnessMap = textureLoader.load('/textures/grass/Poliigon_GrassPatchyGround_4585_Metallic.jpg')
  const ambientLight = new THREE.AmbientLight(0x223366, 0.25);
  scene.add(ambientLight);
  const directionalLight = new THREE.DirectionalLight(0x88aaff, 0.15);
  directionalLight.position.set(10, 20, 10);
  scene.add(directionalLight);
  const campfireLight = new THREE.PointLight(0xffaa55, 2, 15);
  campfireLight.position.set(0, 1, -10);
  scene.add(campfireLight);
  renderer = new THREE.WebGLRenderer({ antialias: true })
  renderer.setSize(container.value.clientWidth, container.value.clientHeight)
  container.value.appendChild(renderer.domElement)
  window.addEventListener('resize', onWindowResize)
}
function onWindowResize() {
  camera.aspect = container.value.clientWidth / container.value.clientHeight
  camera.updateProjectionMatrix()
  renderer.setSize(container.value.clientWidth, container.value.clientHeight)
}
function animate() {
  animationId = requestAnimationFrame(animate);
  const delta = clock.getDelta();
  updateCampfire(delta);
  renderer.render(scene, camera);
}
function cleanup() {
  if (animationId) cancelAnimationFrame(animationId)
  window.removeEventListener('resize', onWindowResize)
  if (renderer) renderer.dispose()
  if (ground?.geometry) ground.geometry.dispose()
  if (ground?.material) ground.material.dispose()
  if (axesHelper) axesHelper.dispose();
}
onMounted(async () => {
  await nextTick();
  if (container.value) {
    gsap.registerPlugin(ScrollTrigger);
    initThree();
    animate();
  }
})
onBeforeUnmount(() => {
  cleanup();
  ScrollTrigger.getAll().forEach(t => t.kill());
  if(audio){
    audio.pause();
    audio = null;
  }
})
</script>
<style scoped>
.three-nature-container {
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  position: fixed; /* Changed to fixed to ensure it stays in the background */
  top: 0;
  left: 0;
  z-index: 1; /* Lower z-index */
}
.play-button{
  position:fixed; /* Changed to fixed */
  z-index:1001;
  width:100px;
  background:transparent;
  color: white;
  border: 1px solid white;
  padding: 10px;
  top: 20px;
  left: 20px;
  cursor: pointer;
}
.scroll-section {
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 3rem;
  color: white;
  z-index: 1000;
  position: relative;
}
</style>