
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

    let planeGeometry = new THREE.PlaneGeometry(10, 10, 2, 2);
    let material = new THREE.MeshPhongMaterial({color: 0x00ff00});

    let plane = new THREE.Mesh(planeGeometry, material);
    plane.rotation.x = -HALF_PI ;
    plane.position.set(0,0,0);
    scene.add(plane);


    let cubeGeometry = new THREE.BoxGeometry(1,1,1);
    material = new THREE.MeshPhongMaterial({color: 0xF3901B});


    let cube = new THREE.Mesh(cubeGeometry, material);
    cube.position.y = 0.5;
    cube.position.x = 4.5;
    cube.position.z = -4.5;
    scene.add(cube);

    let cube2 = cube.clone();
    cube2.position.y = 0.5;
    cube2.position.x = -4.5;
    cube2.position.z = -4.5;
    scene.add(cube2);

    let cube3 = cube.clone();
    cube3.position.y = 0.5;
    cube3.position.x = -4.5;
    cube3.position.z = 4.5;
    scene.add(cube3);

    let cube4 = cube.clone();
    cube4.position.y = 0.5;
    cube4.position.x = 4.5;
    cube4.position.z = 4.5;
    scene.add(cube4);

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

    //camera.rotation.x = -0.1;

    // Torus

    let torusGeo = new THREE.TorusGeometry(1.2, 0.7, 10, 22, 2* Math.PI);
    material = new THREE.MeshPhongMaterial({color: 0xee00aa, opacity: 0.8, transparent: true, side:THREE.DoubleSide});
    let torus = new THREE.Mesh(torusGeo, material);
    torusGeo.scale(0.5, 0.5, 0.5);
    torus.position.x = -2;
    torus.position.y = 1;
    torus.rotation.x = 1.9;
    torus.rotation.y = 12;
    scene.add(torus);

    // Sphere

    let sphereGeo = new THREE.SphereGeometry(0.5);
    material = new THREE.MeshPhongMaterial({color: 0x909033});
    let sphere = new THREE.Mesh(sphereGeo, material);
    sphere.position.set(-4.5, 1.5, -4.5);
    scene.add(sphere);

    // Cone
    let coneGeo = new THREE.ConeGeometry(0.5, 1, 16);
    material = new THREE.MeshPhongMaterial({color: 0x3232ff});
    let cone = new THREE.Mesh(coneGeo, material);
    cone.position.set(4.5, 1.5, 4.5);
    scene.add(cone);

    // Pyramid
    let pyramidGeo = new THREE.ConeGeometry(0.5, 0.6, 4);
    material = new THREE.MeshPhongMaterial({color: 0x90ffaa});
    let pyramid = new THREE.Mesh(pyramidGeo, material);
    pyramid.position.set(1, 0.3, 4);
    pyramid.rotation.y = Math.PI / 4;
    scene.add(pyramid);

    // Kick-scooter
    let kickScooter = new THREE.Group();
    steering = new THREE.Group();

    let steerAxlGeo = new THREE.CylinderGeometry(0.1, 0.1, 4);
    let blackMaterial = new THREE.MeshPhongMaterial({color: 0x525252});
    steerAxl = new THREE.Mesh(steerAxlGeo, blackMaterial);
    steerAxl.position.y = 2.3;



    let wheelConnectorGeo = new THREE.CylinderGeometry(0.15, 0.15, 0.8);
    let wheelConnector = new THREE.Mesh(wheelConnectorGeo, blackMaterial);
    wheelConnector.position.y = -1.1;
    steerAxl.add(wheelConnector);

    let wheelGeo = new THREE.CylinderGeometry(0.5, 0.5, 0.43, 20);
    let wheel = new THREE.Mesh(wheelGeo, blackMaterial);
    wheel.rotation.x = HALF_PI;
    wheel.position.y = -1.8;
    steerAxl.add(wheel);

    let wheelCoverGeo = new THREE.CylinderGeometry(0.3, 0.3, 0.44, 12);
    let greyMaterial = new THREE.MeshPhongMaterial({color:0xbbbbbb});
    let wheelCover = new THREE.Mesh(wheelCoverGeo, greyMaterial);
    wheelCover.rotation.x = HALF_PI;
    wheelCover.position.y = -1.8;
    steerAxl.add(wheelCover)

    let handleSeg1Geo = new THREE.CylinderGeometry(0.15, 0.15, 0.35, 16);
    let handleSeg1 = new THREE.Mesh(handleSeg1Geo, blackMaterial);
    handleSeg1.rotation.x = HALF_PI;
    handleSeg1.position.y = 2.1;
    steerAxl.add(handleSeg1);

    let handleSeg2 = handleSeg1.clone();
    handleSeg2.scale.x = 0.6;
    handleSeg2.scale.y = 6;
    handleSeg2.scale.z = 0.6;
    steerAxl.add(handleSeg2);

    let handleSeg3 = handleSeg1.clone();
    handleSeg3.position.z = 1;
    handleSeg3.scale.x= 0.75;
    handleSeg3.scale.z = 0.75;
    handleSeg3.scale.y = 1.7;
    steerAxl.add(handleSeg3);

    let handleSeg4 = handleSeg1.clone();
    handleSeg4.position.z = -1;
    handleSeg4.scale.x= 0.75;
    handleSeg4.scale.z = 0.75;
    handleSeg4.scale.y = 1.7;
    steerAxl.add(handleSeg4);

    steering.add(steerAxl);
    steering.rotation.z = -0.2;
    //steering.rotation.y = 0.9;
    kickScooter.add(steering);

    let loader = new THREE.TextureLoader();

    let gripmatText = loader.load('images/gripmat.jpg');
    gripmatText.wrapS = THREE.MirroredRepeatWrapping;
    gripmatText.wrapT = THREE.MirroredRepeatWrapping;
    gripmatText.repeat.set(5,1);
    gripmatText.needsUpdate = true;
    let gripMat = new THREE.MeshPhongMaterial({map:gripmatText});

    let redMaterial = new THREE.MeshPhongMaterial({color:0xcc0000});


    let boardGeo = new THREE.BoxGeometry(3, 0.2, 0.6);
    let materials = [
        redMaterial,
        redMaterial,
        gripMat,
        greyMaterial,
        redMaterial,
        redMaterial
    ];

    let board = new THREE.Mesh(boardGeo, materials);
    board.position.set(2.7, 0.45, 0);


    let boardConnector = board.clone();
    boardConnector.scale.x = 0.6;
    boardConnector.scale.y = 0.9;
    boardConnector.position.y = 0.9;
    boardConnector.position.x = 0.65;
    boardConnector.rotation.z = -0.6;


    let bbreak = boardConnector.clone();
    bbreak.rotation.z = 0.6;
    bbreak.scale.x = 0.35;
    bbreak.scale.y = 0.9;
    bbreak.position.y = 0.73;
    bbreak.position.x = 3.6;

    let backWheel = wheel.clone();
    backWheel.position.x = 4.2;
    backWheel.position.y = 0.4;
    backWheel.scale.x = 0.8;
    backWheel.scale.z = 0.8;

    let backWheelCover = wheelCover.clone();
    backWheelCover.position.x = 4.2;
    backWheelCover.position.y = 0.4;
    backWheelCover.scale.x = 0.8;
    backWheelCover.scale.z = 0.8;

    kickScooter.add(backWheel);
    kickScooter.add(backWheelCover);
    kickScooter.add(board);
    kickScooter.add(boardConnector);
    kickScooter.add(bbreak);

    kickScooter.scale.set(0.2,0.2,0.2);
    kickScooter.rotation.y = HALF_PI/2;

    kickScooter.position.set(-4.7, 1, 4.7);

    scene.add(kickScooter);

    wheels.push(wheel, wheelCover, backWheel, backWheelCover);

    // Coffee-cup

    let points = [];
    for(let i = 0.9; i < 2; i += 0.1){
        points.push(new THREE.Vector2(i, Math.exp((i ** 3)/4)));
    }


    loader.load('images/porcelain.jpg',
        texture =>{
            group = new THREE.Group();
            group.position.set(0,0,0);

            let cup = new THREE.LatheGeometry(points, 20);
            let mat = new THREE.MeshPhongMaterial({map: texture, side: THREE.DoubleSide});
            let cupMesh = new THREE.Mesh(cup, mat);

            let cup_bottomGeo = new THREE.CircleGeometry(0.9, 20, 0, 2* Math.PI);
            let cupBottom = new THREE.Mesh(cup_bottomGeo, mat);
            cupBottom.rotation.x = -0.5 * Math.PI;
            cupBottom.position.y = Math.exp((0.9 ** 3)/4);
            cupMesh.add(cupBottom);

            let handlegeo = new THREE.TorusGeometry(1, 0.2, 12, 8,  Math.PI + 0.15);
            //mat = new THREE.MeshPhongMaterial({map:texture});
            let handle = new THREE.Mesh(handlegeo, mat);

            handle.rotation.z = -HALF_PI - 0.2;
            handle.position.x = 1.7;
            handle.position.y = Math.exp((1.7 ** 3)/4);
            cupMesh.add(handle);

            let coffeeGeo = new THREE.CircleGeometry(1.85,20);
            mat = new THREE.MeshPhongMaterial({color: 0x4f2e17, opacity: 0.95, transparent: true});
            let coffee = new THREE.Mesh(coffeeGeo, mat);
            coffee.rotation.x = -0.5 * Math.PI;
            coffee.position.y = Math.exp((1.85 ** 3)/4);
            cupMesh.add(coffee);

            group.add(cupMesh);

            scene.add(group);

            group.scale.x = 0.4;
            group.scale.y = 0.4;
            group.scale.z = 0.4;
            cupMesh.position.y = -Math.exp((0.9**3)/4);

            group.position.set(cupPos.x, 1, cupPos.z);
            render();
            clock = new THREE.Clock();
            animate();
        });




}

function animate(){
        requestAnimationFrame(animate);
        deltaTime = clock.getDelta();
        group.position.set(cupPos.x, 1, cupPos.z);

        handleActiveKeys();
        steerAxl.rotation.y = steeringAngle;
        for(let i = 0; i < wheels.length; i++){
            wheels[i].rotation.y = wheelAngle;
        }

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