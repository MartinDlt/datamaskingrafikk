
import * as THREE from '../../lib/three/build/three.module.js';
import { TrackballControls } from '../../lib/three/examples/jsm/controls/TrackballControls.js';

let renderer = null;
let scene = null;
let camera = null;
let controls = null;

let clock = null;

let deltaTime = 0;
const TARGET_FRAMERATE = 60;

const HALF_PI = Math.PI / 2;
const TWO_PI = 2 * Math.PI;

export function main(){

    let canvas = document.getElementById("threeC");

    // TrackballControls

    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xdddddd);

    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    renderer = new THREE.WebGLRenderer({canvas: canvas, antialias: true});
    renderer.setSize(window.innerWidth, window.innerHeight);

    controls = new TrackballControls(camera, renderer.domElement);
    controls.addEventListener( 'change', render);

    camera.position.x = 0;
    camera.position.y = 2;
    camera.position.z = 10;
    camera.up = new THREE.Vector3(0, 1, 0);			//Endrer p� kameraets oppretning.
    let target = new THREE.Vector3(0.0, 0.0, 0.0);
    camera.lookAt(target);

    let light1 = new THREE.DirectionalLight(new THREE.Color(0xffffff), 1);
    light1.position.set(3, 0.5, -2);
    scene.add(light1);

    let light2 = new THREE.DirectionalLight(new THREE.Color(0xffffff), 0.5);
    light2.position.set(1, 2, 4);
    scene.add(light2);

    let planeGeometry = new THREE.PlaneGeometry(10, 10, 2, 2);
    let material = new THREE.MeshPhongMaterial({color: 0x00ff00});

    let plane = new THREE.Mesh(planeGeometry, material);
    plane.rotation.x = -HALF_PI ;
    plane.position.set(0,0,0);
    scene.add(plane);

    scene.add(new THREE.AxesHelper(10));

    let gearGroup1 = makeGear(24);
    scene.add(gearGroup1);
    gearGroup1.rotation.z = 0.2;

    let gearGroup2 = makeGear(20);
    gearGroup2.position.z = 0.02;
    gearGroup2.rotation.z = 0.3;

    scene.add(gearGroup2);

    let gearGroup3 = makeGear(16);
    gearGroup3.position.z = 0.04;
    gearGroup3.rotation.z = 0.5;
    scene.add(gearGroup3);

    let gearGroup4 = makeGear(12);
    gearGroup4.position.z = 0.06;

    scene.add(gearGroup4);

    let gearGroup5 = makeGear(8);
    gearGroup5.position.z = 0.08;
    gearGroup5.rotation.z = -0.2;
    scene.add(gearGroup5);


    //camera.rotation.x = -0.1;
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

function makeGear(numTeeth){
    let shape = new THREE.Shape();


    shape.splineThru([new THREE.Vector2(-2, 0),
        new THREE.Vector2(-1, 2),
        new THREE.Vector2(0, 3),
        new THREE.Vector2(1, 2),
        new THREE.Vector2(2, 0)

    ]);

    const extrudeSettings = { depth: 0.2, bevelEnabled: false, bevelSegments: 2, steps: 2, bevelSize: 1, bevelThickness: 1 };


    let gearMaterial = new THREE.MeshPhongMaterial({color:0xbbbbbb});
    //shape.setFromPoints(path);
    let spike = new THREE.ExtrudeGeometry(shape, extrudeSettings);
    let mesh = new THREE.Mesh(spike, gearMaterial);
    mesh.scale.set(0.02, 0.02, 0.02);

    let theta = TWO_PI / numTeeth;
    let halfWidthOfTooth = 5 * 0.01;
    let gearRadius = halfWidthOfTooth/Math.tan(theta);
    mesh.position.y = gearRadius;
    mesh.position.x = 0;

    let teeth = [mesh];

    for(let i = theta; i < TWO_PI; i += theta){
        let clone = mesh.clone();
        clone.rotation.z = -i;

        clone.position.y = gearRadius*Math.cos(i);
        clone.position.x = gearRadius*Math.sin(i);
        teeth.push(clone);
    }

    let gearGroup = new THREE.Group();
    let circle = new THREE.Shape();
    circle.moveTo(0, 0);

    circle.ellipse(0,0, gearRadius + 0.01, gearRadius + 0.01);
    let plate = new THREE.ExtrudeGeometry(circle, extrudeSettings);
    let gearPlate = new THREE.Mesh(plate, gearMaterial);
    gearPlate.scale.z = 0.02;
    gearGroup.add(gearPlate);

    for(let i = 0; i < teeth.length; i++){
        gearGroup.add(teeth[i]);
    }

    return gearGroup;
}