import * as THREE from 'three';

import { texture, uniform } from 'three/nodes'

import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RGBELoader } from 'three/addons/loaders/RGBELoader.js';
// import { TextureLoader } from 'three';




const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 10000);

camera.position.z = 3;

const renderer = new THREE.WebGLRenderer({ antialias: true });

const light = new THREE.AmbientLight(0xede485, 0.7);
light.position.set(0, 0, 0);
scene.add(light);

const exposure = -12.5
renderer.physicallyCorrectLight = true

// renderer.toneMapping = THREE.LinearToneMapping
// renderer.toneMapping = THREE.ReinhardToneMapping
// renderer.toneMapping = THREE.CineonToneMapping 
renderer.toneMapping = THREE.ACESFilmicToneMapping
// renderer.toneMapping = THREE.AgXToneMapping
// renderer.outputEncoding = THREE.LinearEncoding;
renderer.toneMappingExposure = Math.pow(2, exposure);

renderer.shadowMap.enabled = true;
renderer.shadowMap.autoUpdate = true;

// renderer.shadowMap.type = THREE.BasicShadowMap
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
// renderer.shadowMap.type = THREE.PCFShadowMap;
// renderer.shadowMap.type = THREE.VSMShadowMap

renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const pmremGenerator = new THREE.PMREMGenerator(renderer);
pmremGenerator.compileEquirectangularShader();

// animation clips 

let mixer = null,
    clips = []

let prevTime = 0

const loader = new GLTFLoader()
    .setCrossOrigin('anonymous');

new RGBELoader().load('quarry_01_1k.hdr', function (env) {
    env.mapping = THREE.EquirectangularReflectionMapping;
    scene.environment = env
})

const whiteMaterial = new THREE.MeshPhongMaterial({
    // color: '#923434',
    side: THREE.DoubleSide
});

const greenMaterial = new THREE.MeshLambertMaterial({
    // color: '#923434',
    side: THREE.DoubleSide
})

let EarthObj = new THREE.Object3D();

const geometry = new THREE.BoxGeometry(1, 1, 1);
const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
const cube = new THREE.Mesh(geometry, whiteMaterial);
// scene.add( cube );

const textureLoader = new THREE.TextureLoader()

const diffuseMap = textureLoader.load('./pol.png')
diffuseMap.colorSpace = THREE.SRGBColorSpace
diffuseMap.wrapS = THREE.RepeatWrapping;

const normalMap = textureLoader.load('./textures/bakenormalmap.png')
normalMap.wrapS = THREE.RepeatWrapping;

const mMap = textureLoader.load('./metallicRoughness.png')

const rMap = textureLoader.load('./textures/bakerougnessmap.png')
rMap.wrapS = THREE.RepeatWrapping;

// const rmMapNode = texture(rmMap)

function startAnimation(gltf) {
    clips = gltf.animations

    mixer = new THREE.AnimationMixer(gltf.scene)

    clips.forEach((clip) => {
        mixer.clipAction(clip).reset().play()
    })
}

function centerModel(gltf) {
    let model = gltf.scene

    const box = new THREE.Box3().setFromObject(model);
    const size = box.getSize(new THREE.Vector3()).length();
    const center = box.getCenter(new THREE.Vector3());

    model.position.x += model.position.x - center.x;
    model.position.y += model.position.y - center.y;
    model.position.z += model.position.z - center.z;
}

let object = new THREE.Object3D()

loader.load('./block_v1-1.glb', function (gltf) {

    let model = gltf.scene
    let animations = gltf.animations

    startAnimation(gltf)
    // centerModel(gltf)






    console.log(gltf)

    let a = 0.1

    model.scale.set(1 * a, 1 * a, 1 * a)
    model.rotation.set(0, Math.PI / 2, 0)

    model.traverse(function (child) {
        if (child instanceof THREE.PointLight && child != undefined) {
            console.log(child.name)

            // object.add(child)

            // child.castShadow = true;
        }

        if (child instanceof THREE.Mesh && child != undefined) {
            // console.log(child);
            // child.material.side = THREE.FrontSide;  
            // console.log(child.name)
            let barkPineMaterial = undefined

            if (child.material.name == "bark pine") {
                if (child) {

                    // barkPineMaterial = new THREE.MeshPhongMaterial().copy(child.material)
                    // child.material = whiteMaterial
                    // console.log(child.name)
                    // console.log(child)
                    // EarthObj.add(child)
                }
            }

            if (child.material.name == "Material.007") {
                if (child) {

                    child.material = greenMaterial
                    child.material.map = diffuseMap
                    // child.material.normalMap = normalMap

                    // child.material.metalnessMap = mMap
                    child.material.roughnessMap = rMap
                    child.material.roughness = 0.2
                    child.material.metalness = 0.1


                    // child.material.needsUpdate = true;
                    console.log(child.name)
                    console.log(child)
                    // EarthObj.add(child)
                    // object.add(child)

                }
            }


            // console.log(child.name)  

            // if (child.name === 'Earthdots') {
            // child.material = whiteMaterial  
            // }
        }
    });

    console.log(object)
    scene.add(model)

})

const controls = new OrbitControls(camera, renderer.domElement);
controls.update();


function animate(time) {

    requestAnimationFrame(animate);
    renderer.render(scene, camera);

    const dt = (time - prevTime) / 400;

    if (mixer) mixer.update(dt);

    controls.update();

    prevTime = time;

}

animate()

