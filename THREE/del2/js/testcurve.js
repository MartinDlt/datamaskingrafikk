
import * as THREE from '../../lib/three/build/three.module.js';
import { TrackballControls } from '../../lib/three/examples/jsm/controls/TrackballControls.js';

let renderer = null;
let scene = null;
let camera = null;
let controls = null;
let steering = null;
let steeringAngle = 0;
let wheelAngle = 0;
let steerAxl = null;
let wheels = [];
let activeKeys = [];
let cupPos = {
    x: 4.5,
    z: -4.5
};
let clock;
let group = null;

let deltaTime = 0;
const TARGET_FRAMERATE = 60;


const HALF_PI = Math.PI / 2;

export function main(){

    let canvas = document.getElementById("threeC");

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xdddddd);

    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    renderer = new THREE.WebGLRenderer({canvas: canvas, antialias: true});
    renderer.setSize(window.innerWidth, window.innerHeight);

    let light1 = new THREE.DirectionalLight(new THREE.Color(0xffffff), 1);
    light1.position.set(3, 0.5, -2);
    scene.add(light1);

    let light2 = new THREE.DirectionalLight(new THREE.Color(0xffffff), 0.5);
    light2.position.set(1, 2, 4);
    scene.add(light2);

    scene.add(new THREE.AxesHelper(10));

    camera.position.x = 0;
    camera.position.y = 2;
    camera.position.z = 10;
    camera.up = new THREE.Vector3(0, 1, 0);			//Endrer p� kameraets oppretning.
    let target = new THREE.Vector3(0.0, 0.0, 0.0);
    camera.lookAt(target);

    // TrackballControls
    controls = new TrackballControls(camera, renderer.domElement);
    controls.addEventListener( 'change', render);

    let path =  new THREE.Path();
    path.moveTo(0,0);

    path.arc(0, 0, 3, Math.PI/2, 0, true);
    path.lineTo(5, 2, 10);

    let geo = new THREE.BufferGeometry().setFromPoints(path.getPoints());

    let mat = new THREE.MeshPhongMaterial({color: 0xaaaa00});
    let mesh = new THREE.Line(geo, mat);
    scene.add(mesh);



    render();
    clock = new THREE.Clock();
    animate();


}

function animate(){
    requestAnimationFrame(animate);
    deltaTime = clock.getDelta();


    controls.update();
    render();
}

function render(){
    renderer.render(scene, camera);
}

function handleKeyUp(e){
    if(activeKeys.includes(e.keyCode)){
        let index = activeKeys.indexOf(e.keyCode);
        activeKeys.splice(index, 1);
    }
}

function handleKeyDown(e){
    if(!activeKeys.includes(e.keyCode)){
        activeKeys.push(e.keyCode);
    }
}

function handleActiveKeys(){

    if(activeKeys.includes(37)){
        steeringAngle+=0.04 * deltaTime * TARGET_FRAMERATE;

        if(steeringAngle > HALF_PI){
            steeringAngle = HALF_PI;
        }
    }

    if(activeKeys.includes(39)){
        steeringAngle-=0.04 * deltaTime * TARGET_FRAMERATE;

        if(steeringAngle < -HALF_PI){
            steeringAngle = -HALF_PI;
        }
    }

    if(activeKeys.includes(38)){
        wheelAngle += 0.06 * deltaTime * TARGET_FRAMERATE;

    }

    if(activeKeys.includes(40)){
        wheelAngle -= 0.06 * deltaTime * TARGET_FRAMERATE;
    }

    // W
    if(activeKeys.includes(87)){
        cupPos.z -= 0.03 * deltaTime * TARGET_FRAMERATE;
    }

    // S
    if(activeKeys.includes(83)){
        cupPos.z += 0.03 * deltaTime * TARGET_FRAMERATE;
    }

    // A
    if(activeKeys.includes(65)){
        cupPos.x -= 0.03 * deltaTime * TARGET_FRAMERATE;
    }

    // D
    if(activeKeys.includes(68)){
        cupPos.x += 0.03 * deltaTime * TARGET_FRAMERATE;
    }


}