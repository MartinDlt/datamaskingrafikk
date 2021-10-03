
import * as THREE from '../../../lib/three/build/three.module.js';
import { TrackballControls } from '../../../lib/three/examples/jsm/controls/TrackballControls.js';
import {makeGear, makeFork, makeChain, makeDiskBrake, makeWheel, makeSeat, makeBrakeLever} from "./CreationFunctions.js";

let renderer = null;
let scene = null;
let camera = null;
let controls = null;

let clock = null;

let deltaTime = 0;
const TARGET_FRAMERATE = 60;

let handleParts;
let handlePartsAngle = 0;

const HALF_PI = Math.PI / 2;
const TWO_PI = 2 * Math.PI;

let rotatables = [];
let rotatablesAngle = 0;

let activeKeys = [];

export function main(){

    let canvas = document.getElementById("threeC");

    window.addEventListener("keyup", handleKeyUp);
    window.addEventListener("keydown", handleKeyDown);

    // TrackballControls

    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xdddddd);

    let bikeGroup = new THREE.Group();

    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    renderer = new THREE.WebGLRenderer({canvas: canvas, antialias: true});
    renderer.setSize(window.innerWidth, window.innerHeight);

    controls = new TrackballControls(camera, renderer.domElement);
    controls.addEventListener( 'change', render);

    camera.position.x = 0;
    camera.position.y = 2;
    camera.position.z = 3;
    camera.up = new THREE.Vector3(0, 1, 0);			//Endrer p� kameraets oppretning.
    let target = new THREE.Vector3(0.0, 0.0, 0.0);
    camera.lookAt(target);

    let light1 = new THREE.DirectionalLight(new THREE.Color(0xffffff), 1);
    light1.position.set(3, 0.5, -2);
    scene.add(light1);

    let light2 = new THREE.DirectionalLight(new THREE.Color(0xffffff), 0.5);
    light2.position.set(1, 2, 4);
    scene.add(light2);

    let planeGeometry = new THREE.PlaneGeometry(10, 10, 7, 7);
    let material = new THREE.MeshPhongMaterial({color: 0xffffff});

    let plane = new THREE.Mesh(planeGeometry, material);
    plane.rotation.x = -HALF_PI ;
    plane.position.set(0,0,0);
    scene.add(plane);

    let lampPlane = new THREE.Mesh(planeGeometry, material);
    lampPlane.rotation.y = -HALF_PI;
    lampPlane.position.x = 10;

    scene.add(lampPlane);

    scene.add(new THREE.AxesHelper(10));



    // FRAME

    let framePartGeo = new THREE.CylinderGeometry(0.5, 0.5, 13);
    let frameMaterial = new THREE.MeshPhongMaterial({color:0x6D75b4});
    let frame = new THREE.Mesh(framePartGeo, frameMaterial);

    let clone = frame.clone();

    clone.position.y = 3.0;
    clone.position.x = 7.5;
    clone.rotation.z = -1.8;
    clone.scale.y = 1.23;
    clone.scale.z = 0.7;
    clone.scale.x = 0.7;

    let clone2 = frame.clone();
    clone2.rotation.z = -1.15;
    clone2.scale.x = 0.8;
    clone2.scale.z = 0.8;
    clone2.position.x = 7.7;
    clone2.position.y = -2.6;
    clone2.scale.y = 1.3;

    let clone3 = frame.clone();
    clone3.scale.x = 1.3;
    clone3.scale.z = 1.3;
    clone3.scale.y = 0.25;
    clone3.position.y = 1;
    clone3.position.x = 15;

    let fork1 = makeFork(3.6, 1.1);
    fork1.scale.set(3,3,3);
    fork1.rotation.y = HALF_PI;
    let fork = new THREE.Group();
    fork.add(fork1);
    fork.position.x = -5.3;
    fork.position.y = -0.1;
    fork.rotation.z = -0.9;
    frame.add(fork);

    fork1 = makeFork(2.8, 1.1);
    fork1.scale.set(3, 3, 3);
    fork1.rotation.y = HALF_PI;
    fork = new THREE.Group();
    fork.add(fork1);
    fork.position.y = -4.7;
    fork.position.x = -5.8;
    fork.rotation.z = -HALF_PI - 0.3;

    frame.add(fork);

    frame.rotation.z = 0.3;
    frame.position.y = 6.2;
    frame.position.x = -1.9;
    frame.add(clone);
    frame.add(clone2);
    frame.add(clone3);
    bikeGroup.add(frame);

    // BACK-WHEEL

    let wheel  = makeWheel();
    wheel.scale.set(3,3,3);

    wheel.rotationDirection = 1;
    rotatables.push(wheel);


    wheel.position.x = -10;
    bikeGroup.add(wheel);


    let axelGeo = new THREE.CylinderGeometry(0.3, 0.3, 5);
    let axelMaterial = new THREE.MeshPhongMaterial({color: 0xcceecc});
    let axel1 = new THREE.Mesh(axelGeo, axelMaterial);
    axel1.rotation.x = HALF_PI;
    axel1.position.x = -10;
    bikeGroup.add(axel1);

    // GEARBOX

    let gears = new THREE.Group();
    let gearOffsets = 0.025;
    let numGears = 8;

    for(let i = 0; i < numGears; i++){
        let gear = makeGear(24 - (2 * i));
        gear.position.z = gearOffsets * i;
        gears.add(gear);
    }

    gears.scale.set(9, 9, 5);

    gears.position.x = -10;
    gears.position.z = 0.4;

    gears.rotationDirection = 1;
    rotatables.push(gears);

    bikeGroup.add(gears);

    // PEDAL-GEAR

    let frontGear = makeGear(18);
    frontGear.scale.set(9,9,5);
    frontGear.position.z = 2;
    bikeGroup.add(frontGear);

    frontGear.rotationDirection = 1;
    rotatables.push(frontGear);

    let pedalAxel = new THREE.Mesh(axelGeo, axelMaterial);

    pedalAxel.scale.y = 1.2;
    pedalAxel.rotation.x = HALF_PI;
    bikeGroup.add(pedalAxel);

    // PEDALS

    let pedalGroup = new THREE.Group();
    let pedalGeo = new THREE.CylinderGeometry(0.2, 0.2, 3);

    let pedal1 = new THREE.Mesh(pedalGeo, axelMaterial);
    let pedal2 = pedal1.clone();
    pedal1.position.z = 2.6;
    pedal1.position.y = 1.5;
    pedal2.position.z = -2.6;
    pedal2.position.y = -1.5;
    pedalGroup.add(pedal1);
    pedalGroup.add(pedal2);

    let pedalFootGeo = new THREE.BoxGeometry(1, 0.3, 1.7);
    let pedalFootMat = new THREE.MeshPhongMaterial({color: 0xF3901B});
    let pedalFoot1 = new THREE.Mesh(pedalFootGeo, pedalFootMat);

    pedalFoot1.position.z = 3.55;
    pedalFoot1.position.y = 2.7;
    let pedalFoot2 = pedalFoot1.clone();
    pedalFoot1.position.z = -3.55;
    pedalFoot1.position.y = -2.7;

    pedalFoot1.rotationDirection = -1;
    pedalFoot2.rotationDirection = -1;

    rotatables.push(pedalFoot1);
    rotatables.push(pedalFoot2);

    pedalGroup.add(pedalFoot1);
    pedalGroup.add(pedalFoot2);
    pedalGroup.rotation.z = -0.3;

    pedalGroup.rotationDirection = 1;

    rotatables.push(pedalGroup);

    bikeGroup.add(pedalGroup);

    // SMALL-GEAR

    let gearFork = makeFork(2.8, 0.3);
    gearFork.position.z = 2;
    gearFork.position.x = -10;
    gearFork.position.y = -1.6;
    gearFork.rotation.y = HALF_PI;
    bikeGroup.add(gearFork);

    let chainGear1 = makeGear(12);
    chainGear1.scale.set(3, 3, 6);
    chainGear1.position.y = -2.9;
    chainGear1.position.x = -10;
    chainGear1.position.z = 2;
    bikeGroup.add(chainGear1);

    chainGear1.rotationDirection = 1;
    rotatables.push(chainGear1);

    let chainGear2 = makeGear(12);
    chainGear2.scale.set(3, 3, 6);
    chainGear2.position.y = -2;
    chainGear2.position.x = -10;
    chainGear2.position.z = 2;
    bikeGroup.add(chainGear2);

    chainGear2.rotationDirection = -1;
    rotatables.push(chainGear2);

    // FRONT-WHEEL AND STEERING

    let steerables = new THREE.Group();
    handleParts = new THREE.Group();

    let handleMaterial = new THREE.MeshPhongMaterial({color: 0x00ffaa});

    let handleBarConnector = new THREE.Mesh(framePartGeo, handleMaterial);


    handleBarConnector.scale.set(0.7, 0.3, 0.7);

    handleParts.rotation.y = -0.9;
    handleParts.add(handleBarConnector);

    let frontWheelFork = makeFork(4.8, 0.8);
    frontWheelFork.scale.set(2,2,2);
    frontWheelFork.position.y = 4.8 - 14.1;
    frontWheelFork.rotation.y = HALF_PI;
    handleParts.add(frontWheelFork);

    let handle = new THREE.Mesh(axelGeo, handleMaterial);
    handle.position.y = 1.95;
    handle.rotation.x = HALF_PI;
    handle.scale.y = 1.3;
    handleParts.add(handle);
    let textureLoader = new THREE.TextureLoader();

    let gripTexture = textureLoader.load('images/gripmat2.jpg');
    gripTexture.wrapS = THREE.MirroredRepeatWrapping;
    gripTexture.wrapT = THREE.MirroredRepeatWrapping;
    gripTexture.repeat.set(1,2);

    let gripMat = new THREE.MeshPhongMaterial({map: gripTexture});
    let grip1 = new THREE.Mesh(axelGeo, gripMat);
    grip1.scale.set(1.1, 0.5, 1.1);
    grip1.rotation.x = HALF_PI;
    grip1.position.y = 1.95;
    let grip2 = grip1.clone();


    grip1.position.z = 2.9;
    grip2.position.z = -2.9;
    handleParts.add(grip1);
    handleParts.add(grip2);

    // GEAR-SWITCHES

    let gearSwitch = new THREE.BoxGeometry(0.1, 0.3, 0.3);
    gearSwitch = new THREE.Mesh(gearSwitch, handleMaterial);
    gearSwitch.position.y = 1.5;
    gearSwitch.position.z = 2.2;
    let gearSwitch2 = gearSwitch.clone();
    gearSwitch2.position.z = 1.8;
    gearSwitch2.scale.set(0.8, 0.8, 0.8);
    handleParts.add(gearSwitch);
    handleParts.add(gearSwitch2);

    let blackMaterial = new THREE.LineBasicMaterial(({color: 0x000000, linewidth: 2}));

    let gearLinePath = new THREE.Path();
    gearLinePath.moveTo(0,0);
    gearLinePath.lineTo(1.4, 0);
    gearLinePath.lineTo(1.4, -5);

    let gearLineGeo = new THREE.BufferGeometry().setFromPoints(gearLinePath.getPoints());
    let gearLine = new THREE.Line(gearLineGeo, blackMaterial);
    gearLine.rotation.y = HALF_PI;
    gearLine.position.y=1.5;
    gearLine.position.z = 1.7;
    handleParts.add(gearLine);

    gearLinePath = new THREE.Path();
    gearLinePath.moveTo(11.5, 12.2);
    gearLinePath.lineTo(-2.9, 11.2);

    gearLineGeo = new THREE.BufferGeometry().setFromPoints(gearLinePath.getPoints());
    gearLine = new THREE.Line(gearLineGeo, blackMaterial);

    bikeGroup.add(gearLine);

    gearLinePath = new THREE.Path();
    gearLinePath.moveTo(-3.5, 11.2);
    gearLinePath.lineTo(-9.5, 1);

    gearLineGeo = new THREE.BufferGeometry().setFromPoints(gearLinePath.getPoints());
    gearLine = new THREE.Line(gearLineGeo, blackMaterial);
    gearLine.position.z = 1.5;
    gearLine.rotation.x = -0.1;

    bikeGroup.add(gearLine);

    gearLinePath = new THREE.Path();
    gearLinePath.arc(-0, 0, 0.6, 0, HALF_PI + 0.3, false);

    gearLineGeo = new THREE.BufferGeometry().setFromPoints(gearLinePath.getPoints());
    gearLine = new THREE.Line(gearLineGeo, blackMaterial);
    gearLine.rotation.x = HALF_PI;
    bikeGroup.add(gearLine);

    let gearLineArcGroup = new THREE.Group();
    gearLineArcGroup.add(gearLine);
    gearLineArcGroup.position.set(-3.5, 11.2, 0);
    bikeGroup.add(gearLineArcGroup);

    let wheelAxel = new THREE.Mesh(axelGeo, axelMaterial);
    wheelAxel.position.y = -14.25;
    wheelAxel.rotation.x = HALF_PI;
    wheelAxel.scale.set(1.2, 0.6, 1.2);

    handleParts.add(wheelAxel);

    // LAMP

    let lampGeo = new THREE.CylinderGeometry(0.2, 0.3, 0.5, 12, 1, true);
    let lamp = new THREE.Mesh(lampGeo, frameMaterial);
    lamp.position.y = 2;
    lamp.position.x = 0.5;
    lamp.rotation.z = HALF_PI;
    handleParts.add(lamp);

    let lightGeo = new THREE.CircleGeometry(0.3);
    let lightMat = new THREE.MeshStandardMaterial({color: 0xdddd00});
    let lampLight = new THREE.Mesh(lightGeo, lightMat);
    lampLight.position.y = 2;
    lampLight.position.x = 0.75;
    lampLight.rotation.y = HALF_PI;
    handleParts.add(lampLight);

    let dirLight = new THREE.SpotLight(0xdddd00, 0.7);
    dirLight.position.y = 2;
    dirLight.position.x = 0.76;
    dirLight.scale.set(0.1, 0.1, 0.1);
    let dirLightTarget = new THREE.Object3D();
    dirLightTarget.position.set(30, 2, 0);



    dirLight.target = dirLightTarget;
    handleParts.add(dirLightTarget);
    handleParts.add(dirLight);
    bikeGroup.add(steerables);
    steerables.rotation.z = 0.3;
    steerables.add(handleParts);
    steerables.position.set(11.6, 13.5, 0);


    let wheel2 = makeWheel();
    wheel2.rotationDirection = 1;
    wheel2.scale.set(3,3,3);
    wheel2.position.y = -14.25;
    rotatables.push(wheel2);

    handleParts.add(wheel2);

    let brake1 = makeBrakeLever();
    brake1.position.set(0.4,1.95,1.1);
    let brake2 = brake1.clone();
    brake2.position.z = -1.1;
    handleParts.add(brake1);
    brake2.rotation.x = Math.PI;
    handleParts.add(brake2);

    //
    let path = new THREE.Path();
    path.arc(0, 0, 0.5, HALF_PI, 0, true);
    let path2 = path.clone();
    path.lineTo(0.5, -1);
    path.arc(-0.5, -0.5, 0.5, 0, 1.6 * Math.PI, true);
    path.lineTo(0.3, -14.7);

    path2.lineTo(0.5, -2);

    // BRAKELINES

    let lineGeo = new THREE.BufferGeometry().setFromPoints(path.getPoints());

    let brakeLine1 = new THREE.Line(lineGeo, blackMaterial);
    brakeLine1.position.set(0.5, 1.6, -0.8);
    brakeLine1.rotation.y = -HALF_PI;

    lineGeo = new THREE.BufferGeometry().setFromPoints(path2.getPoints());
    let brakeLine2 = new THREE.Line(lineGeo, blackMaterial);
    brakeLine2.position.set(0.5, 1.6, 0.8);
    brakeLine2.rotation.y = HALF_PI + 0.1;
    handleParts.add(brakeLine1);
    handleParts.add(brakeLine2);

    let backBrakeLine2Path = new THREE.Path();
    backBrakeLine2Path.moveTo(11.5, 12.5);
    backBrakeLine2Path.lineTo(-2.9, 11.5);

    lineGeo = new THREE.BufferGeometry().setFromPoints(backBrakeLine2Path.getPoints());
    let backBrakeLine2 = new THREE.Line(lineGeo, blackMaterial);

    let backBrakeLine3Path = new THREE.Path();
    backBrakeLine3Path.moveTo(-3.5, 11.5);
    backBrakeLine3Path.lineTo(-9.5, 1);

    lineGeo = new THREE.BufferGeometry().setFromPoints(backBrakeLine3Path.getPoints());
    let backBrakeLine3 = new THREE.Line(lineGeo, blackMaterial);
    backBrakeLine3.position.z = -0.6;

    let backBrakeLine4Path = new THREE.Path();
    backBrakeLine4Path.arc(-0, 0, 0.6, 0, HALF_PI, false);

    lineGeo = new THREE.BufferGeometry().setFromPoints(backBrakeLine4Path.getPoints());
    let backBrakeLine4 = new THREE.Line(lineGeo, blackMaterial);
    backBrakeLine4.rotation.x = -HALF_PI;
    let backBrakeLineArcGroup = new THREE.Group();
    backBrakeLineArcGroup.add(backBrakeLine4);
    backBrakeLineArcGroup.position.set(-3.5, 11.5, 0);

    bikeGroup.add(backBrakeLine2);
    bikeGroup.add(backBrakeLine3);
    bikeGroup.add(backBrakeLineArcGroup);

    // DISKBRAKES

    let disks = makeDiskBrake();
    let diskGroup = disks[0];
    disks[1].rotationDirection = 1;
    rotatables.push(disks[1]);

    diskGroup.position.y = -14.25;
    diskGroup.position.z = -0.5;
    handleParts.add(diskGroup);

    disks = makeDiskBrake();
    diskGroup = disks[0];
    disks[1].rotationDirection = 1;
    rotatables.push(disks[1]);
    diskGroup.position.x = -10;
    diskGroup.position.z = -0.5;
    bikeGroup.add(diskGroup);

    let chain = makeChain();
    chain.position.z = 2.0;
    bikeGroup.add(chain);

    let seat = makeSeat();
    seat.position.y = 13.6;
    seat.position.x = -4.7;
    bikeGroup.add(seat);

    let seatPoleGeo = new THREE.CylinderGeometry(0.2, 0.2, 2);
    let seatPole = new THREE.Mesh(seatPoleGeo, pedalFootMat);
    seatPole.rotation.z = 0.3;
    seatPole.position.set(-3.8, 12.4, 0);
    bikeGroup.add(seatPole);

    bikeGroup.scale.set(0.1, 0.1, 0.1);
    bikeGroup.position.y = 0.61;
    scene.add(bikeGroup);



    //camera.rotation.x = -0.1;
    clock = new THREE.Clock();
    animate();
}

function animate(){
    requestAnimationFrame(animate);
    deltaTime = clock.getDelta();

    handleActiveKeys();

    for(let i = 0; i < rotatables.length; i++){

        rotatables[i].rotation.z = - rotatablesAngle * rotatables[i].rotationDirection;

    }

    handleParts.rotation.y = handlePartsAngle;

    controls.update();
    render();
}

function render(){
    renderer.render(scene, camera);

}

function handleKeyDown(e){
    if(!activeKeys.includes(e.keyCode)){
        activeKeys.push(e.keyCode);
    }
}

function handleKeyUp(e){
    if(activeKeys.includes(e.keyCode)){
        let index =activeKeys.indexOf(e.keyCode);
        activeKeys.splice(index, 1);
    }
}

function handleActiveKeys(){

    if(activeKeys.includes(38)){

        rotatablesAngle += 0.05 * deltaTime * TARGET_FRAMERATE;

    }

    if(activeKeys.includes(40)){

        rotatablesAngle -= 0.05 * deltaTime * TARGET_FRAMERATE;

    }

    if(activeKeys.includes(37)){
        handlePartsAngle += 0.05 * deltaTime * TARGET_FRAMERATE;

        handlePartsAngle = Math.min(HALF_PI, handlePartsAngle);
    }

    if(activeKeys.includes(39)){
        handlePartsAngle -= 0.05 * deltaTime * TARGET_FRAMERATE;
        handlePartsAngle = Math.max(-HALF_PI, handlePartsAngle);
    }

}

