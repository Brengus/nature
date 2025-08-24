import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { AnimationMixer, Group } from 'three'
import * as THREE from 'three';

let mixer = null;
const loader = new GLTFLoader();
export function loadCampfire(scene, position = { x: 0, y: 0, z: -10 }, scale = 1) {
  
  loader.load('/models/gltf/campfire.glb', gltf => {
    // Find the main group
    const campfireGroup = gltf.scene

    // Create a new group for just firewood and flames
    const filteredGroup = new Group()
    campfireGroup.traverse(child => {
      if (
        child.name.startsWith('Firewood') ||
        child.name.startsWith('Flames')
      ) {
        filteredGroup.add(child.clone())
      }
    })

    filteredGroup.position.set(position.x, position.y, position.z)
    filteredGroup.scale.set(scale, scale, scale)
    scene.add(filteredGroup)

    // If you want to play animation, you may need to use the original group and mixer
    if (gltf.animations && gltf.animations.length > 0) {
      mixer = new AnimationMixer(filteredGroup)
      const action = mixer.clipAction(gltf.animations[0])
      action.play()
      filteredGroup.userData.mixer = mixer
    }
  })
}

export function loadMoon(scene){
    loader.load('/models/gltf/the_moon.glb', (gltf) => {
        gltf.scene.position.set(20, 11, -20);
        gltf.scene.scale.set(1, 1, 1);
        scene.add(gltf.scene);

        const sunLight = new THREE.DirectionalLight(0xffffff, 2)
        sunLight.position.set(25, 5, -15) // position of the "sun"
        scene.add(sunLight)

        // Point the light to the moon
        sunLight.target = gltf.scene
        scene.add(sunLight.target)
    });
}

export function createStars(scene) {
  const starGeometry = new THREE.BufferGeometry();
  const starCount = 1500;
  const positions = new Float32Array(starCount * 3);

  for (let i = 0; i < starCount; i++) {
    const x = (Math.random() - 0.5) * 200; // far range
    const y = (Math.random() - 0.5) * 800 + 200; // keep most above map
    const z = (Math.random() - 0.5) * 200;
    positions.set([x, y, z], i * 3);

  }

  starGeometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));

  const starMaterial = new THREE.PointsMaterial({
    color: 0xffffff,
    size: 0.5,
    sizeAttenuation: true,
  });

  const stars = new THREE.Points(starGeometry, starMaterial);
  scene.add(stars);
}



export function updateCampfire(delta) {
  if (mixer) {
    mixer.update(delta)
  }
}