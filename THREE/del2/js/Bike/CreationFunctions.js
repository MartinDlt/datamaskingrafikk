import * as THREE from "../../../lib/three/build/three.module.js";

const HALF_PI = Math.PI / 2;
const TWO_PI = 2 * Math.PI;

export function makeGear(numTeeth){
    let shape = new THREE.Shape();

    const extrudeSettings = { depth: 0.2, bevelEnabled: false, bevelSegments: 2, steps: 2, bevelSize: 1, bevelThickness: 1 };

    let gearMaterial = new THREE.MeshPhongMaterial({color:0xbbbbbb});
    //shape.setFromPoints(path);



    let spikeHeight = 0.02;

    let theta = TWO_PI / numTeeth;
    let halfWidthOfTooth = 5 * 0.01;
    let gearRadius = halfWidthOfTooth/Math.tan(theta);

    let loopAmount = 0;

    let currX = 0;
    let currY = 0;
    let currRadius = 0;
    let halfTheta = theta/2;
    let quarterTheta = theta / 4;

    for(let i = 0; i <= TWO_PI + halfTheta + quarterTheta; i += quarterTheta){

        if(loopAmount % 4 === 1 || loopAmount % 4 === 3){
            currRadius = gearRadius + spikeHeight - 0.01;
        }else if(loopAmount % 4 === 2){
            currRadius = gearRadius + spikeHeight;
        }
        else{
            currRadius = gearRadius;
        }
        currX = currRadius * Math.cos(i);
        currY = currRadius * Math.sin(i);


        shape.lineTo(currX, currY);
        loopAmount++;
    }


    let spike = new THREE.ExtrudeGeometry(shape, extrudeSettings);
    let mesh = new THREE.Mesh(spike, gearMaterial);

    mesh.scale.z = 0.02;

    let gearGroup = new THREE.Group();
    gearGroup.add(mesh);

    return gearGroup;
}

export function makeFork(legLength, width){

    let group = new THREE.Group();
    let cylinderGeo = new THREE.CylinderGeometry(0.1, 0.1, legLength, 8);
    let forkMaterial = new THREE.MeshPhongMaterial({color: 0xbbbb77});

    let cylinder1 = new THREE.Mesh(cylinderGeo, forkMaterial);
    cylinder1.position.x = -width / 2;

    let cylinder2 = new THREE.Mesh(cylinderGeo, forkMaterial);
    cylinder2.position.x = width / 2;

    let torusGeometry = new THREE.TorusGeometry(width/2, 0.1, 8, 11, Math.PI);
    let torus = new THREE.Mesh(torusGeometry, forkMaterial);
    torus.position.y = legLength/2;


    group.add(cylinder1);
    group.add(cylinder2);
    group.add(torus);
    return group;
}

export function makeWheel(){

    let group = new THREE.Group();
    let wheelGeo = new THREE.TorusGeometry(2, 0.1, 10, 32);
    let wheelMaterial = new THREE.MeshPhongMaterial({color: 0x222222});
    let tubeMaterial = new THREE.MeshPhongMaterial({color: 0xcccccc});

    let wheel = new THREE.Mesh(wheelGeo, wheelMaterial);
    let tube = new THREE.Mesh(wheelGeo, tubeMaterial);

    tube.scale.x = 0.99;
    tube.scale.y = 0.99;
    tube.scale.z = 0.9;
    group.add(wheel);
    group.add(tube);

    let halfSpokeAmount = 10;

    let theta = Math.PI / halfSpokeAmount;
    let spokes = new THREE.Group();
    let cylinderGeo = new THREE.CylinderGeometry(0.01, 0.01, 3.9);
    let spokeMaterial = new THREE.MeshPhongMaterial({color: 0xaaaaaa});

    for(let i = 0; i < Math.PI; i += theta){
        let spoke = new THREE.Mesh(cylinderGeo, spokeMaterial);
        spoke.rotation.z = i;
        spokes.add(spoke);
    }

    group.add(spokes);

    return group;
}

export function makeBrakeLever(){
    let brakeBoxGeo = new THREE.BoxGeometry(0.4, 0.4, 0.9);
    let brakeLeverGeo = new THREE.BoxGeometry(0.06, 0.2, 1.3);

    let brakeBoxMat = new THREE.MeshPhongMaterial({color:0x555555});
    let brakeLeverMat = new THREE.MeshPhongMaterial({color:0xcccccc});

    let brakeBox = new THREE.Mesh(brakeBoxGeo, brakeBoxMat);
    let brakeLever = new THREE.Mesh(brakeLeverGeo, brakeLeverMat);


    let group = new THREE.Group();
    group.add(brakeBox);
    group.add(brakeLever);
    brakeLever.position.set(0.1, 0, 1);
    return group;
}

export function makeDiskBrake(){
    let diskShape = new THREE.Shape();
    diskShape.moveTo(0,0);
    diskShape.arc(0,0, 1.3, 0, 2 * Math.PI, true);

    let diskHole = new THREE.Path();
    diskHole.moveTo(0, 0);
    diskHole.arc(0, 0, 1, 0, 2 * Math.PI, true);

    diskShape.holes.push(diskHole);

    diskHole = new THREE.Path();
    diskHole.moveTo(0, 0);
    diskHole.arc(1.15, 0, 0.1, 0, 2 * Math.PI, true);
    diskShape.holes.push(diskHole);

    diskHole = new THREE.Path();
    diskHole.moveTo(0, 0);
    diskHole.arc(-1.15, 0, 0.1, 0, 2 * Math.PI, true);
    diskShape.holes.push(diskHole);

    diskHole = new THREE.Path();
    diskHole.moveTo(0, 0);
    diskHole.arc(0, -1.15, 0.1, 0, 2 * Math.PI, true);
    diskShape.holes.push(diskHole);

    diskHole = new THREE.Path();
    diskHole.moveTo(0, 0);
    diskHole.arc(0, 1.15, 0.1, 0, 2 * Math.PI, true);
    diskShape.holes.push(diskHole);


    const extrudeSettings = { depth: 0.1, bevelEnabled: false, bevelSegments: 2, steps: 2, bevelSize: 1, bevelThickness: 1 };



    //let diskGeo = new THREE.RingGeometry(1, 1.3, 32);
    let diskGeo = new THREE.ExtrudeGeometry(diskShape, extrudeSettings);
    let diskMat = new THREE.MeshPhongMaterial({color: 0xbbbbbb, side: THREE.DoubleSide});
    let disk = new THREE.Mesh(diskGeo, diskMat);

    let brakeGeo = new THREE.BoxGeometry(0.6,0.3,0.3);
    let brakeMat = new THREE.MeshPhongMaterial({color: 0x333333});
    let brake = new THREE.Mesh(brakeGeo, brakeMat);

    brake.position.y = 1;
    brake.position.x = 0.5;
    let group = new THREE.Group();
    group.add(brake);
    group.add(disk);
    return [group, disk];
}
export function makeChain(){
    let group = new THREE.Group();

    let chainBigArcGeo = new THREE.TorusGeometry(1.4, 0.07, 10, 6, Math.PI);
    let chainMat = new THREE.MeshPhongMaterial({color: 0x555555, side: THREE.DoubleSide});
    let chainBigArc= new THREE.Mesh(chainBigArcGeo, chainMat);
    chainBigArc.rotation.z = -HALF_PI;
    group.add(chainBigArc);

    let bottomChainGeo = new THREE.CylinderGeometry(0.07, 0.07, 10.16);
    let bottomChain = new THREE.Mesh(bottomChainGeo, chainMat);
    bottomChain.position.set(0, 5.08, 0);
    let bottomChainG = new THREE.Group();
    bottomChainG.add(bottomChain);
    bottomChainG.rotation.z = 0.18 + HALF_PI;
    bottomChainG.position.y = -1.4;
    group.add(bottomChainG);

    let chainSmallArcGeo = new THREE.TorusGeometry(0.3, 0.07, 10, 6, Math.PI);
    let chainSmallArc1 = new THREE.Mesh(chainSmallArcGeo, chainMat);
    chainSmallArc1.position.set(-10, -2.9, 0);
    chainSmallArc1.rotation.z = HALF_PI +0.1;
    group.add(chainSmallArc1);

    chainSmallArcGeo = new THREE.TorusGeometry(0.3, 0.07, 10, 6, 0.75 * Math.PI);
    let chainSmallArc2 = new THREE.Mesh(chainSmallArcGeo, chainMat);
    chainSmallArc2.rotation.z = -0.3 * Math.PI;
    chainSmallArc2.position.set(-10, -2, 0);
    group.add(chainSmallArc2);

    let smallChainConnector = bottomChainG.clone();
    smallChainConnector.scale.y = 0.05;
    smallChainConnector.rotation.z =-0.5;
    smallChainConnector.position.set(-10, -2.6, 0);
    group.add(smallChainConnector);

    let bigChainConnector = bottomChainG.clone();
    bigChainConnector.scale.y = 0.03;
    bigChainConnector.rotation.z =HALF_PI;
    bigChainConnector.position.set(-10, -1.7, 0);
    group.add(bigChainConnector);

    let bigChainConnector2 = bottomChainG.clone();
    bigChainConnector2.scale.y = 0.03;
    bigChainConnector2.rotation.z =HALF_PI;
    bigChainConnector2.rotation.y = -0.5;
    bigChainConnector2.position.set(-10.3, -1.7, 0);
    group.add(bigChainConnector2);

    let bigChainConnector3 = bottomChainG.clone();
    bigChainConnector3.scale.y = 0.03;
    bigChainConnector3.rotation.z =HALF_PI;
    bigChainConnector3.rotation.y = -0.9;
    bigChainConnector3.position.set(-10.6, -1.7, -0.13);
    group.add(bigChainConnector3);

    let bigChainConnector4 = bottomChainG.clone();
    bigChainConnector4.scale.y = 0.08;
    bigChainConnector4.rotation.z =HALF_PI;
    bigChainConnector4.rotation.y = -0.9;
    bigChainConnector4.position.set(-10.75, -1.7, -0.3);
    group.add(bigChainConnector4);

    let bigChainConnector5 = bottomChainG.clone();
    bigChainConnector5.scale.y = 0.14;
    bigChainConnector5.rotation.z =0.3;
    bigChainConnector5.rotation.x = -0.6;
    //bigChainConnector5.rotation.y = HALF_PI;
    bigChainConnector5.position.set(-11.3, -1.7, -0.9);
    group.add(bigChainConnector5);

    let chainHugeArcGeo = new THREE.TorusGeometry(1.85, 0.07, 10, 6, Math.PI/1.2);

    let chainHugeArc = new THREE.Mesh(chainHugeArcGeo, chainMat);
    chainHugeArc.rotation.z = 0.9;
    chainHugeArc.position.set(-10, 0, -1.6);
    group.add(chainHugeArc);



    let bigChainConnector6 = bottomChainG.clone();
    bigChainConnector6.scale.y = 0.89;
    bigChainConnector6.rotation.y = -0.175;
    bigChainConnector6.rotation.z = HALF_PI;
    bigChainConnector6.position.set(0, 1.4, 0);
    group.add(bigChainConnector6);
    return group;
}

export function makeSeat(){
    let group = new THREE.Group();
    let seatshape = new THREE.Shape();
    seatshape.moveTo(0, 0);
    seatshape.lineTo(0, 0.5);
    seatshape.lineTo(1.5, 0.1);
    seatshape.lineTo(1.5, -0.1);
    seatshape.arc(0, 0.1, 0.1, HALF_PI, 1.5 * Math.PI, true);
    seatshape.lineTo(0, -0.5);
    seatshape.arc(0, 0.25, 0.25, 1.5 * Math.PI, HALF_PI, true);

    seatshape.arc(0, 0.25, 0.25,1.5 * Math.PI, HALF_PI,  true);
    seatshape.closePath();


    const extrudeSettings = { depth: 0.2, bevelEnabled: false, bevelSegments: 9, steps: 2, bevelSize: 0.1, bevelThickness: 0.1 };

    let seatGeo = new THREE.ExtrudeGeometry(seatshape, extrudeSettings);
    let seatMat = new THREE.MeshPhongMaterial({color: 0xfc9a19, side: THREE.DoubleSide});
    let seat = new THREE.Mesh(seatGeo, seatMat);

    group.add(seat);
    group.rotation.x = HALF_PI;
    group.scale.set(2, 2, 2);
    return group;
}