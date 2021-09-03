'use strict';

// Vertex shader program
let  VSHADER_SOURCE =
    'attribute vec3 a_Position;\n' +		//Dersom vec4 trenger vi ikke vec4(a_Position, 1.0) under.
    'uniform mat4 u_modelviewMatrix;\n' +
    'uniform mat4 u_projectionMatrix;\n' +
    'void main() {\n' +
    '  gl_Position = u_projectionMatrix * u_modelviewMatrix * vec4(a_Position,1.0);\n' +
    '}\n';

// Fragment shader program
let  FSHADER_SOURCE =
    'precision mediump float;\n' +
    'uniform vec4 u_FragColor;\n' + 	// bruker prefiks u_ for å indikere uniform
    'void main() {\n' +
    '  gl_FragColor = u_FragColor;\n' + // Fargeverdi.
    '}\n';

// Andre globale variabler:
let matrixStack = [];
let gl = null;
let canvas = null;
let positionBuffer = null;
// "Pekere" som brukes til å sende matrisene til shaderen:
let u_modelviewMatrix = null;
let u_projectionMatrix = null;
// Matrisene:
let modelMatrix = null;
let viewMatrix = null;
let modelviewMatrix = null; //sammenslått modell- og viewmatrise.
let projectionMatrix = null;
let a = 0;
let eyeX=0, eyeY=0, eyeZ=100;
let camScale = 100,
    camViewAngle = 0;
let animationAngle = 0;
let armWaveAngle = 15 * Math.sin(animationAngle) - 9;
let activeKeys = [];
let showWireframe = false;


function main() {
    init();

    // Initialiser shadere (cuon-utils):
    if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
        console.log('Feil ved initialisering av shaderkoden.');
        return;
    }

    // Initialiserer verteksbuffer:
    initBuffers();

    // Binder shaderparametre:
    if (!initUniforms())
        return;

    draw();
}

/**
 * Initialisering og oppstart.
 */
function init() {
    // Hent <canvas> elementet
    canvas = document.getElementById('webgl');

    // Rendering context for WebGL:
    gl = canvas.getContext('webgl');
    if (!gl)
        console.log('Fikk ikke tak i rendering context for WebGL');

    modelMatrix = new Matrix4();
    viewMatrix = new Matrix4();
    modelviewMatrix = new Matrix4();
    projectionMatrix = new Matrix4();

    // Setter bakgrunnsfarge:
    gl.clearColor(0.3, 0.0, 0.4, 1.0); //RGBA
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LESS);

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
}

function handleKeyDown(e){
    // spacebar
    if(e.keyCode === 32){
        showWireframe = !showWireframe;
    }

    if(!activeKeys.includes(e.keyCode)){
        activeKeys.push(e.keyCode);
    }

}

function handleKeyUp(e){
    if(activeKeys.includes(e.keyCode)){
        let index = activeKeys.indexOf(e.keyCode);
        activeKeys.splice(index, 1);
    }
}

function handleActiveKeys(){

    // ---->
    if(activeKeys.includes(39)){
        camViewAngle = (camViewAngle - 0.06) % 360;
    }

    // <----
    if(activeKeys.includes(37)){
        camViewAngle = (camViewAngle + 0.06) % 360;
    }

    // ,
    if(activeKeys.includes(188)){
        camScale += 0.5;
    }

    // .
    if(activeKeys.includes(190)){
        camScale -= 0.5;
    }

    // F
    if(activeKeys.includes(70)){
        animationAngle = (animationAngle + 0.07) % 360;
        armWaveAngle =  15 * Math.sin(animationAngle) - 9;
    }

}

/**
 * Oppretter og fyller posisjonsbuffer.
 *
 */
function initBuffers() {
    // 3 stk 3D vertekser:
    let trianglePositions = new Float32Array([   //NB! ClockWise!!
        -10, -10, 0,
        0, 10, 0,
        10, -10, 0
    ]);

    // Verteksbuffer:
    positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, trianglePositions, gl.STATIC_DRAW);

    positionBuffer.itemSize = 3; // NB!!
    positionBuffer.numberOfItems = 3; // NB!!

    gl.bindBuffer(gl.ARRAY_BUFFER, null);
}

/**
 * Kopler ev. uniformvariabler.
 * @returns {boolean}
 */
function initUniforms() {
    // Farge: u_FragColor (bruker samme farge på alle piksler/fragmenter):
    let u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');
    if (u_FragColor < 0) {
        console.log('Fant ikke uniform-parametret u_FragColor i shaderen!?');
        return false;
    }
    let rgba = [ 0.3, 0.5, 0.0, 1.0 ];
    gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);

    // Matriser: u_modelviewMatrix & u_projectionMatrix
    u_modelviewMatrix = gl.getUniformLocation(gl.program, 'u_modelviewMatrix');
    u_projectionMatrix = gl.getUniformLocation(gl.program, 'u_projectionMatrix');
    return true;
}

function draw() {
    gl.clear(gl.COLOR_BUFFER_BIT);
    //camViewAngle = (camViewAngle + 0.01) % 360;
    rotateCameraXZ(camViewAngle);
    requestAnimationFrame(draw);
    handleActiveKeys();
    // BackfaceCulling:
    /*
	gl.frontFace(gl.CW);		//indikerer at trekanter med vertekser angitt i CW er front-facing!
	gl.enable(gl.CULL_FACE);	//enabler culling.
	gl.cullFace(gl.BACK);		//culler baksider.
    */

    // Definerer modellmatrisa:
    modelMatrix.setIdentity();
    modelMatrix.scale(10, 10, 5);
    modelMatrix.scale(0.5, 0.5, 0.5);
    //modelMatrix.rotate(a, 1, 0, 0);


    let  lookX=0, lookY=0, lookZ=0;
    let  upX=0, upY=1, upZ=0;
    viewMatrix.setLookAt(eyeX, eyeY, eyeZ, lookX, lookY, lookZ, upX, upY, upZ);

    // Slår sammen modell & view til modelview-matrise:
    //modelviewMatrix = viewMatrix.multiply(modelMatrix); // NB! rekkefølge!
    projectionMatrix.setPerspective(45, canvas.width / canvas.height, 1, 1000);

    // Sender matriser til shader:
    gl.uniformMatrix4fv(u_modelviewMatrix, false, modelviewMatrix.elements);
    gl.uniformMatrix4fv(u_projectionMatrix, false, projectionMatrix.elements);

    // Torso
    pushMatrix(modelMatrix);
    drawCube();

    // Neck
    viewMatrix.setLookAt(eyeX, eyeY, eyeZ, lookX, lookY, lookZ, upX, upY, upZ);

    modelMatrix = peekMatrix();
    modelMatrix.translate(0, 1, 0);
    modelMatrix.scale(0.15, 0.5, 0.3);

    drawCube(1, 0, 0, 1);

    // Head
    viewMatrix.setLookAt(eyeX, eyeY, eyeZ, lookX, lookY, lookZ, upX, upY, upZ);
    modelMatrix = peekMatrix();
    modelMatrix.translate(0, 2, 0);
    modelMatrix.scale(0.8, 0.7, 1.3);
    drawCube(0, 1, 1, 1);

    // Left
    // Arm
    viewMatrix.setLookAt(eyeX, eyeY, eyeZ, lookX, lookY, lookZ, upX, upY, upZ);
    modelMatrix = peekMatrix();
    modelMatrix.translate(1.2, 1.3, 0);
    modelMatrix.rotate(-15 + armWaveAngle , 0, 0, 1);
    pushMatrix(modelMatrix);
    modelMatrix.scale(0.1, 1, 0.3);

    drawCube(0, 0, 1, 1);

    // Forearm
    viewMatrix.setLookAt(eyeX, eyeY, eyeZ, lookX, lookY, lookZ, upX, upY, upZ);
    modelMatrix = peekMatrix();
    modelMatrix.translate(-0.25, 1.9, 0);
    modelMatrix.rotate(19, 0, 0, 1);
    modelMatrix.scale(0.1, 1, 0.3);
    drawCube(1, 0, 1, 1);

    // Fingers
    viewMatrix.setLookAt(eyeX, eyeY, eyeZ, lookX, lookY, lookZ, upX, upY, upZ);
    modelMatrix = peekMatrix();
    modelMatrix.translate(-0.75, 2.9, 0);
    modelMatrix.rotate(45, 0, 0, 1);
    modelMatrix.scale(0.03, 0.3, 0.07);
    drawCube(1, 1, 1, 1);

    viewMatrix.setLookAt(eyeX, eyeY, eyeZ, lookX, lookY, lookZ, upX, upY, upZ);
    modelMatrix = peekMatrix();
    modelMatrix.translate(-0.65, 3.0, 0);
    modelMatrix.rotate(25, 0, 0, 1);
    modelMatrix.scale(0.03, 0.3, 0.07);
    drawCube(1, 1, 1, 1);

    viewMatrix.setLookAt(eyeX, eyeY, eyeZ, lookX, lookY, lookZ, upX, upY, upZ);
    modelMatrix = peekMatrix();
    modelMatrix.translate(-0.55, 3.0, 0);
    modelMatrix.rotate(5, 0, 0, 1);
    modelMatrix.scale(0.03, 0.3, 0.07);
    drawCube(1, 1, 1, 1);

    // Remove the arm-matrix from the matrix-stack
    popMatrix();

    // Left Leg
    viewMatrix.setLookAt(eyeX, eyeY, eyeZ, lookX, lookY, lookZ, upX, upY, upZ);
    modelMatrix = peekMatrix();
    modelMatrix.translate(0.5, -2, 0);
    modelMatrix.rotate(10, 0, 0, 1);
    modelMatrix.scale(0.4, 2.3, 0.9);
    drawCube(1, 0.6, 0.6, 1);

    // Right
    // Arm
    viewMatrix.setLookAt(eyeX, eyeY, eyeZ, lookX, lookY, lookZ, upX, upY, upZ);
    modelMatrix = peekMatrix();
    modelMatrix.translate(-1.2, 0.1, 0);
    modelMatrix.rotate(-15 , 0, 0, 1);
    pushMatrix(modelMatrix);
    modelMatrix.scale(0.1, 1, 0.3);

    drawCube(0, 0, 1, 1);

    // Forearm
    viewMatrix.setLookAt(eyeX, eyeY, eyeZ, lookX, lookY, lookZ, upX, upY, upZ);
    modelMatrix = peekMatrix();
    modelMatrix.translate(0.15, -1.96, 0);
    modelMatrix.rotate(12, 0, 0, 1);
    modelMatrix.scale(0.1, 1, 0.3);
    drawCube(1, 0, 1, 1);

    // Fingers
    viewMatrix.setLookAt(eyeX, eyeY, eyeZ, lookX, lookY, lookZ, upX, upY, upZ);
    modelMatrix = peekMatrix();
    modelMatrix.translate(0.25, -3.0, 0);
    modelMatrix.rotate(-10, 0, 0, 1);
    modelMatrix.scale(0.03, 0.3, 0.07);
    drawCube(1, 1, 1, 1);

    viewMatrix.setLookAt(eyeX, eyeY, eyeZ, lookX, lookY, lookZ, upX, upY, upZ);
    modelMatrix = peekMatrix();
    modelMatrix.translate(0.35, -3.0, 0);
    modelMatrix.rotate(15, 0, 0, 1);
    modelMatrix.scale(0.03, 0.3, 0.07);
    drawCube(1, 1, 1, 1);

    viewMatrix.setLookAt(eyeX, eyeY, eyeZ, lookX, lookY, lookZ, upX, upY, upZ);
    modelMatrix = peekMatrix();
    modelMatrix.translate(0.5, -3.0, 0);
    modelMatrix.rotate(35, 0, 0, 1);
    modelMatrix.scale(0.03, 0.3, 0.07);
    drawCube(1, 1, 1, 1);

    popMatrix();
    // Right leg
    viewMatrix.setLookAt(eyeX, eyeY, eyeZ, lookX, lookY, lookZ, upX, upY, upZ);
    modelMatrix = peekMatrix();
    modelMatrix.translate(-0.5, -2, 0);
    modelMatrix.rotate(-10, 0, 0, 1);
    modelMatrix.scale(0.4, 2.3, 0.9);
    drawCube(1, 0.6, 0.6, 1);
}

function drawCube(r = 1, g = 1, b = 0, alpha = 1){

    let cubeVerts = new Float32Array([
        // face 1
        -1, 1, 1,
        1, 1, 1,
        1, -1, 1,

        -1, 1, 1,
        1, -1, 1,
        -1, -1, 1,


        // face 2
        -1, 1, 1,
        -1, -1, 1,
        -1, -1, -1,

        -1, 1, 1,
        -1, -1, -1,
        -1, 1, -1,

        // face 3
        -1, 1, 1,
        -1, 1, -1,
        1, 1, -1,

        1, 1, -1,
        -1, 1, 1,
        1, 1, 1,

        // face 4
        1, 1, -1,
        1, -1, -1,
        -1, -1, -1,

        -1, -1, -1,
        1, 1, -1,
        -1, 1, -1,

        // face 5
        -1, -1, -1,
        -1, -1, 1,
        1, -1, 1,

        1, -1, 1,
        -1, -1, -1,
        1, -1, -1,

        //face 6
        1, -1, 1,
        1, -1, -1,
        1, 1, -1,

        1, 1, -1,
        1, -1, 1,
        1, 1, 1

    ]);

    let cubeBuffer = gl.createBuffer();
    if(!cubeBuffer){
        throw new Error("Kunne ikke lage buffer for kuben");
    }

    gl.bindBuffer(gl.ARRAY_BUFFER, cubeBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, cubeVerts, gl.STATIC_DRAW);

    let a_Position = gl.getAttribLocation(gl.program, 'a_Position');
    gl.vertexAttribPointer(a_Position, positionBuffer.itemSize, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(a_Position);

    let u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');
    if (u_FragColor < 0) {
        console.log('Fant ikke uniform-parametret u_FragColor i shaderen!?');
        return false;
    }

    modelviewMatrix = viewMatrix.multiply(modelMatrix);

    gl.uniformMatrix4fv(u_modelviewMatrix, false, modelviewMatrix.elements);
    gl.uniform4f(u_FragColor, r, g, b, alpha);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);

    if(showWireframe){
        gl.drawArrays(gl.LINE_LOOP,0, cubeVerts.length / 3);
    }else{
        gl.drawArrays(gl.TRIANGLES, 0, cubeVerts.length / 3);
    }
}

function pushMatrix(matrix){
    let clone = new Matrix4(matrix);
    matrixStack.push(clone);
}

function popMatrix(){
    if(matrixStack.length === 0){
        throw "The stack is already empty, but you are trying to remove an item";
    }
    matrixStack.pop();
}

function peekMatrix(){
    if(matrixStack.length === 0){
        throw "The stack is empty, but you are trying to peek at an item";
    }
    return new Matrix4(matrixStack[matrixStack.length - 1]);
}

function rotateCameraXZ(angle){
    eyeZ = Math.cos(angle) * camScale;
    eyeX = Math.sin(angle) * camScale;
}
