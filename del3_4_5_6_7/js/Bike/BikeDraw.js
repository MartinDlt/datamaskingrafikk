'use strict';

// Vertex shader program
let VSHADER_SOURCE =
    'attribute vec3 a_Position;\n' +   // Innkommende verteksposisjon.
    'attribute vec4 a_Color;\n' +     // Innkommende verteksfarge.
    'uniform mat4 u_modelviewMatrix;\n' +
    'uniform mat4 u_projectionMatrix;\n' +
    'varying vec4 v_Color;\n' +          // NB! Bruker varying.
    'void main() {\n' +
    '  gl_Position = u_projectionMatrix * u_modelviewMatrix * vec4(a_Position,1.0);\n' +
    '  v_Color = a_Color;\n' +           // NB! Setter varying = innkommende verteksfarge.
    '}\n';

// Fragmentshader:
let FSHADER_SOURCE =
    'precision mediump float;\n' +
    'varying vec4 v_Color;\n' +          // NB! Interpolert fargeverdi.
    'void main() {\n' +
    '  gl_FragColor = v_Color;\n' +    // Setter gl_FragColor = Interpolert fargeverdi.
    '}\n';

// Andre globale variabler:
let matrixStack = [];
let gl = null;
let canvas = null;

// "Pekere" som brukes til å sende matrisene til shaderen:
let u_modelviewMatrix = null;
let u_projectionMatrix = null;

// Matrisene:
let modelMatrix = null;
let viewMatrix = null;
let modelviewMatrix = null; //sammenslått modell- og viewmatrise.
let projectionMatrix = null;

let wheelAngle = 0;
let steeringAngle = 0;

let elapsed = 0;

let frameCount = 0;

let lastTime = Date.now();
let deltaTime = 0;
const TARGET_FRAMERATE = 60;

let half_num_spokes = 5;

// moving the model
let translateX = 0;
let translateY = 0;
let translateZ = 0;

// Camera
let eyeX=0, eyeY=0, eyeZ=100;
let  lookX=0, lookY=0, lookZ=0;
let  upX=0, upY=1, upZ=0;
let camViewAngleHorizontal = 0;
let camViewAngleY = Math.PI / 2;
let camScale = 100;

// Keyboard control
let activeKeys = [];
let app = null;

function main() {
    init();
    app = new App(gl);
    // Initialiser shadere (cuon-utils):
    if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
        console.log('Feil ved initialisering av shaderkoden.');
        return;
    }

    // Initialiserer verteksbuffer:
    app.initTorusIndicesAndBuffers();
    app.initCylinderIndicesAndBuffers();
    app.initCubeIndicesAndBuffers();

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

    // Finn ut hvordan man definerer sylinder slik at cull-face virker
    // gl.enable(gl.CULL_FACE);
    // gl.cullFace(gl.FRONT);

    addEventListener("keydown", handleKeyDown);
    addEventListener("keyup", handleKeyUp);
}

function handleKeyDown(e){
    if(!activeKeys.includes(e.keyCode)){
        activeKeys.push(e.keyCode);
    }
}

function handleKeyUp(e){
    if(activeKeys.includes(e.keyCode)){
        let i = activeKeys.indexOf(e.keyCode);
        activeKeys.splice(i, 1);
    }
}

function handleActiveKeys(){
    let rotatesCamera = false;

    // left-arrow
    if(activeKeys.includes(37)){
        camViewAngleHorizontal += 0.05 * deltaTime * TARGET_FRAMERATE;
        rotatesCamera = true;
    }
    // right-arrow
    if(activeKeys.includes(39)){
        camViewAngleHorizontal -= 0.05 * deltaTime * TARGET_FRAMERATE;
        rotatesCamera = true;
    }

    // down-arrow
    if(activeKeys.includes(40)){
        camViewAngleY += 0.05 * deltaTime * TARGET_FRAMERATE;
        rotatesCamera = true;
    }
    // up-arrow
    if(activeKeys.includes(38)){
        camViewAngleY -= 0.05* deltaTime * TARGET_FRAMERATE;
        rotatesCamera = true;
    }

    // period
    if(activeKeys.includes(190)){
        camScale -= 0.4 * deltaTime * TARGET_FRAMERATE;
        rotatesCamera = true;
    }
    // comma
    if(activeKeys.includes(188)){
        camScale += 0.4 * deltaTime * TARGET_FRAMERATE;
        rotatesCamera = true;
    }
    // F
    if(activeKeys.includes(70)){
        wheelAngle += 2.2 * deltaTime * TARGET_FRAMERATE;
    }
    // G
    if(activeKeys.includes(71)){
        wheelAngle -= 2.2 * deltaTime * TARGET_FRAMERATE;
    }
    // J
    if(activeKeys.includes(74)){
        if(steeringAngle > -72){

            steeringAngle = Math.max(steeringAngle - 0.9 * deltaTime * TARGET_FRAMERATE, -72);

        }
    }

    // K
    if(activeKeys.includes(75)){
        if(steeringAngle < 72){

            steeringAngle = Math.min(steeringAngle + (0.9 * deltaTime * TARGET_FRAMERATE), 72);

        }
    }

    // A
    if(activeKeys.includes(65)){
        translateX -= 0.3 * deltaTime * TARGET_FRAMERATE;
    }

    // D
    if(activeKeys.includes(68)){
        translateX += 0.3 * deltaTime * TARGET_FRAMERATE;
    }

    // W
    if(activeKeys.includes(87)){
        translateZ -= 0.3 * deltaTime * TARGET_FRAMERATE;
    }

    // S
    if(activeKeys.includes(83)){
        translateZ += 0.3 * deltaTime * TARGET_FRAMERATE;
    }

    if(activeKeys.includes(88)){
        translateY += 0.3 * deltaTime * TARGET_FRAMERATE;
    }
    if(activeKeys.includes(90)){
        translateY -= 0.3 * deltaTime * TARGET_FRAMERATE;
    }

    if(rotatesCamera){
        rotateCamera();
    }

}


function drawCube(){
    drawWithElements(app.vertexBufferCube, app.indexBufferCube, app.indexBufferCube.bufferLength);
}

function drawWithElements(vertBuffer, indBuffer, indLength){
    gl.bindBuffer(gl.ARRAY_BUFFER, vertBuffer);
    let a_Position = gl.getAttribLocation(gl.program, 'a_Position');
    // NB! Her må du bruke stride ved kall på gl.vertexAttribPointer(...)
    // Stride = antall bytes som hver verteks opptar (pos+color).
    // let STRIDE = (POSITION_COMPONENT_COUNT + COLOR_COMPONENT_COUNT) * BYTES_PER_FLOAT;
    let stride = (3 + 4) * 4;
    //FULLFØR! TIPS: Her skal du kalle på gl.vertexAttribPointer(a_Position, ...) OG gl.enableVertexAttribArray(...)
    gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, stride, 0);
    gl.enableVertexAttribArray(a_Position);

    // Kopler fargeparametret til bufferobjektet (pass på stride her også)
    let a_Color = gl.getAttribLocation(gl.program, 'a_Color');
    let colorOfset = 3 * 4; //12= offset, start på color-info innafor verteksinfoen.
    gl.vertexAttribPointer(a_Color, 4, gl.FLOAT, false, stride, colorOfset);   //4=ant. Floats per verteks
    gl.enableVertexAttribArray(a_Color);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indBuffer);
    gl.drawElements(gl.TRIANGLES, indLength, gl.UNSIGNED_SHORT,0);
}

function drawCylinder(){
    drawWithElements(app.vertexBufferCylinder, app.indexBufferCylinder, app.indexBufferCylinder.bufferLength);
}

function drawTorus() {
    drawWithElements(app.vertexBufferTorus, app.indexBufferTorus, app.indexBufferTorus.bufferLength);
}

function resetViewMatrix(){
    viewMatrix.setLookAt(eyeX, eyeY, eyeZ, lookX, lookY, lookZ, upX, upY, upZ);
}

/**
 * Kopler ev. uniformvariabler.
 * @returns {boolean}
 */
function initUniforms() {
    // Matriser: u_modelviewMatrix & u_projectionMatrix
    u_modelviewMatrix = gl.getUniformLocation(gl.program, 'u_modelviewMatrix');
    u_projectionMatrix = gl.getUniformLocation(gl.program, 'u_projectionMatrix');
    return true;
}

function draw() {
    frameCount++;
    gl.clear(gl.COLOR_BUFFER_BIT);

    let now = Date.now();
    deltaTime = (now - lastTime) / 1000;
    if(elapsed >= 1){
        fpsDisplay.innerHTML = (frameCount / elapsed).toFixed(2);
        frameCount = 0;
        elapsed = 0;
    }
    elapsed += deltaTime;
    lastTime = now;


    requestAnimationFrame(draw);

    handleActiveKeys();


    // Definerer modellmatrisa:
    modelMatrix.setIdentity();
    //modelMatrix.rotate(a, 1, 0, 0);


    resetViewMatrix();

    // Slår sammen modell & view til modelview-matrise:
    //modelviewMatrix = viewMatrix.multiply(modelMatrix); // NB! rekkefølge!
    projectionMatrix.setPerspective(45, canvas.width / canvas.height, 1, 1000);


    // Sender matriser til shader:
    gl.uniformMatrix4fv(u_projectionMatrix, false, projectionMatrix.elements);
    modelMatrix.scale(100, 100, 100);
    modelviewMatrix = viewMatrix.multiply(modelMatrix);
    gl.uniformMatrix4fv(u_modelviewMatrix, false, modelviewMatrix.elements);
    drawAxis();
    modelMatrix.setIdentity();
    // Translate entire object
    modelMatrix.translate(translateX, translateY, translateZ);

    pushMatrix(modelMatrix);

    // Frame
    resetViewMatrix();
    modelMatrix = peekMatrix();
    modelMatrix.rotate(10, 0, 0, 1);
    modelMatrix.translate(0, 11, 0);
    modelMatrix.scale(0.5, 11, 1);
    modelviewMatrix = viewMatrix.multiply(modelMatrix);
    gl.uniformMatrix4fv(u_modelviewMatrix, false, modelviewMatrix.elements);
    drawCube();

    // Seat
    resetViewMatrix();
    modelMatrix = peekMatrix();
    modelMatrix.translate(-3, 22, 0);
    modelMatrix.scale(4, 0.3, 2);
    modelviewMatrix = viewMatrix.multiply(modelMatrix);
    gl.uniformMatrix4fv(u_modelviewMatrix, false, modelviewMatrix.elements);
    drawCube();

    resetViewMatrix();
    modelMatrix = peekMatrix();
    modelMatrix.translate(0, 0, 1.3);
    modelMatrix.rotate(90,0, 0, 1);
    modelMatrix.translate(0, 8, 0);
    modelMatrix.scale(0.5, 8, 0.5);
    modelviewMatrix = viewMatrix.multiply(modelMatrix);
    gl.uniformMatrix4fv(u_modelviewMatrix, false, modelviewMatrix.elements);
    drawCube();

    resetViewMatrix();
    modelMatrix = peekMatrix();
    modelMatrix.translate(-16, 0, 1.3);
    modelMatrix.rotate(-41,0, 0, 1);
    modelMatrix.translate(0, 10, 0);
    modelMatrix.scale(0.5, 10, 0.5);
    modelviewMatrix = viewMatrix.multiply(modelMatrix);
    gl.uniformMatrix4fv(u_modelviewMatrix, false, modelviewMatrix.elements);
    drawCube();

    resetViewMatrix();
    modelMatrix = peekMatrix();
    modelMatrix.translate(-16, 0, -1.3);
    modelMatrix.rotate(-41,0, 0, 1);
    modelMatrix.translate(0, 10, 0);
    modelMatrix.scale(0.5, 10, 0.5);
    modelviewMatrix = viewMatrix.multiply(modelMatrix);
    gl.uniformMatrix4fv(u_modelviewMatrix, false, modelviewMatrix.elements);
    drawCube();

    resetViewMatrix();
    modelMatrix = peekMatrix();
    modelMatrix.translate(0, 0, -1.3);
    modelMatrix.rotate(90,0, 0, 1);
    modelMatrix.translate(0, 8, 0);
    modelMatrix.scale(0.5, 8, 0.5);
    modelviewMatrix = viewMatrix.multiply(modelMatrix);
    gl.uniformMatrix4fv(u_modelviewMatrix, false, modelviewMatrix.elements);
    drawCube();

    resetViewMatrix();
    modelMatrix = peekMatrix();
    modelMatrix.translate(-3, 15, 0);
    modelMatrix.rotate(-80, 0, 0, 1);
    modelMatrix.translate(0, 11, 0);
    modelMatrix.scale(0.5, 11, 0.5);
    modelviewMatrix = viewMatrix.multiply(modelMatrix);
    gl.uniformMatrix4fv(u_modelviewMatrix, false, modelviewMatrix.elements);
    drawCube();

    resetViewMatrix();
    modelMatrix = peekMatrix();
    modelMatrix.rotate(-45, 0, 0, 1);
    modelMatrix.translate(0, 14, 0);
    modelMatrix.scale(0.5, 14, 0.5);
    modelviewMatrix = viewMatrix.multiply(modelMatrix);
    gl.uniformMatrix4fv(u_modelviewMatrix, false, modelviewMatrix.elements);
    drawCube();

    // Turning-bar
    resetViewMatrix();
    modelMatrix = peekMatrix();
    modelMatrix.translate(24, 0, 0);
    modelMatrix.rotate(13, 0, 0, 1);
    // Rotate thw steering wheel
    modelMatrix.rotate(steeringAngle, 0, 1, 0);
    pushMatrix(modelMatrix);
    modelMatrix.translate(0, 20, 0);
    modelMatrix.scale(0.5, 7, 0.5);
    modelviewMatrix = viewMatrix.multiply(modelMatrix);
    gl.uniformMatrix4fv(u_modelviewMatrix, false, modelviewMatrix.elements);
    drawCube();

    // Left-fork
    resetViewMatrix();
    modelMatrix = peekMatrix();
    modelMatrix.translate(0, 7, 1.2);
    modelMatrix.scale(0.5, 7, 0.5);
    modelviewMatrix = viewMatrix.multiply(modelMatrix);
    gl.uniformMatrix4fv(u_modelviewMatrix, false, modelviewMatrix.elements);
    drawCylinder();

    // Right-fork
    resetViewMatrix();
    modelMatrix = peekMatrix();
    modelMatrix.translate(0, 7, -1.2);
    modelMatrix.scale(0.5, 7, 0.5);
    modelviewMatrix = viewMatrix.multiply(modelMatrix);
    gl.uniformMatrix4fv(u_modelviewMatrix, false, modelviewMatrix.elements);
    drawCylinder();

    // Handlebar
    resetViewMatrix();
    modelMatrix = peekMatrix();
    modelMatrix.translate(0, 27, 0);
    modelMatrix.rotate(90, 1, 0, 0);
    modelMatrix.scale(0.4, 9, 0.4);
    modelviewMatrix = viewMatrix.multiply(modelMatrix);
    gl.uniformMatrix4fv(u_modelviewMatrix, false, modelviewMatrix.elements);
    drawCylinder();

    // Fork-connector
    resetViewMatrix();
    modelMatrix = peekMatrix();
    modelMatrix.translate(0, 13.5, 0);
    modelMatrix.rotate(90, 1, 0, 0);
    modelMatrix.scale(0.8, 3, 0.8);
    modelviewMatrix = viewMatrix.multiply(modelMatrix);
    gl.uniformMatrix4fv(u_modelviewMatrix, false, modelviewMatrix.elements);
    drawCylinder();

    // Front-wheel connector
    resetViewMatrix();
    modelMatrix = peekMatrix();
    modelMatrix.rotate(90, 1, 0, 0);
    modelMatrix.scale(1, 2, 1);
    modelviewMatrix = viewMatrix.multiply(modelMatrix);
    gl.uniformMatrix4fv(u_modelviewMatrix, false, modelviewMatrix.elements);
    drawCylinder();

    // Front-wheel
    resetViewMatrix();
    modelMatrix = peekMatrix();
    modelMatrix.rotate(-wheelAngle, 0, 0, 1);
    pushMatrix(modelMatrix);
    modelMatrix.scale(4, 4, 4);
    modelviewMatrix = viewMatrix.multiply(modelMatrix);
    gl.uniformMatrix4fv(u_modelviewMatrix, false, modelviewMatrix.elements);
    drawTorus();

    // Front-wheel spokes
    for(let i = 0; i < half_num_spokes; i++){
        resetViewMatrix();
        modelMatrix = peekMatrix();
        modelMatrix.rotate(i * 360 / half_num_spokes, 0, 0, 1);
        modelMatrix.scale(0.1, 7.5, 0.1);
        modelviewMatrix = viewMatrix.multiply(modelMatrix);
        gl.uniformMatrix4fv(u_modelviewMatrix, false, modelviewMatrix.elements);
        drawCube();
    }

    popMatrix();
    popMatrix();

    // Gearbox
    resetViewMatrix();
    modelMatrix = peekMatrix();
    modelMatrix.translate(0, 0, 2);
    modelMatrix.scale(4,4,0.5);
    modelMatrix.rotate(90, 1, 0, 0);
    modelviewMatrix = viewMatrix.multiply(modelMatrix);
    gl.uniformMatrix4fv(u_modelviewMatrix, false, modelviewMatrix.elements);
    drawCylinder();

    // Pedal-axel
    resetViewMatrix();
    modelMatrix = peekMatrix();
    modelMatrix.rotate(-wheelAngle, 0, 0, 1);
    pushMatrix(modelMatrix);
    modelMatrix.scale(1,1,4.5);
    modelMatrix.rotate(90, 1, 0, 0);
    modelviewMatrix = viewMatrix.multiply(modelMatrix);
    gl.uniformMatrix4fv(u_modelviewMatrix, false, modelviewMatrix.elements);
    drawCylinder();

    // Pedal joint right
    resetViewMatrix();
    modelMatrix = peekMatrix();
    modelMatrix.scale(0.4, 3, 0.4);
    modelMatrix.translate(0, 1, 10);
    modelviewMatrix = viewMatrix.multiply(modelMatrix);
    gl.uniformMatrix4fv(u_modelviewMatrix, false, modelviewMatrix.elements);
    drawCylinder();

    // Pedal joint left
    resetViewMatrix();
    modelMatrix = peekMatrix();
    modelMatrix.rotate(180, 0, 0, 1);
    modelMatrix.scale(0.4, 3, 0.4);
    modelMatrix.translate(0, 1, -10);
    modelviewMatrix = viewMatrix.multiply(modelMatrix);
    gl.uniformMatrix4fv(u_modelviewMatrix, false, modelviewMatrix.elements);
    drawCylinder();

    // Pedal right
    resetViewMatrix();
    modelMatrix = peekMatrix();
    modelMatrix.translate(0, 5.7, 6.37);
    modelMatrix.rotate(wheelAngle, 0, 0, 1);
    modelMatrix.scale(1, 0.2, 2);
    modelviewMatrix = viewMatrix.multiply(modelMatrix);
    gl.uniformMatrix4fv(u_modelviewMatrix, false, modelviewMatrix.elements);
    drawCube();

    // Pedal left
    resetViewMatrix();
    modelMatrix = peekMatrix();
    modelMatrix.rotate(180, 0, 0, 1);
    modelMatrix.translate(0, 5.7, -6.37);
    modelMatrix.rotate(wheelAngle, 0, 0, 1);
    modelMatrix.scale(1, 0.2, 2);
    modelviewMatrix = viewMatrix.multiply(modelMatrix);
    gl.uniformMatrix4fv(u_modelviewMatrix, false, modelviewMatrix.elements);
    drawCube();

    popMatrix();

    // Back - gearbox
    resetViewMatrix();
    modelMatrix = peekMatrix();
    modelMatrix.translate(-16, 0, 2);
    modelMatrix.scale(2,2,0.5);
    modelMatrix.rotate(90, 1, 0, 0);
    modelviewMatrix = viewMatrix.multiply(modelMatrix);
    gl.uniformMatrix4fv(u_modelviewMatrix, false, modelviewMatrix.elements);
    drawCylinder();

    // Back-wheel
    resetViewMatrix();
    modelMatrix = peekMatrix();
    modelMatrix.scale(4,4,4);
    modelMatrix.translate(-4, 0, 0);
    modelMatrix.rotate(-wheelAngle, 0, 0, 1);
    pushMatrix(modelMatrix);
    modelviewMatrix = viewMatrix.multiply(modelMatrix);
    gl.uniformMatrix4fv(u_modelviewMatrix, false, modelviewMatrix.elements);
    drawTorus();

    // Back-wheel spokes
    for(let i = 0; i < half_num_spokes; i++){
        resetViewMatrix();
        modelMatrix = peekMatrix();
        modelMatrix.rotate(i * 360 / half_num_spokes, 0, 0, 1);
        modelMatrix.scale(0.1, 7.5, 0.1);
        modelMatrix.scale(0.25, 0.25, 0.25);
        modelviewMatrix = viewMatrix.multiply(modelMatrix);
        gl.uniformMatrix4fv(u_modelviewMatrix, false, modelviewMatrix.elements);
        drawCube();
    }

    popMatrix();

    // Back-wheel connector
    resetViewMatrix();
    modelMatrix = peekMatrix();
    modelMatrix.scale(4,4,4);
    modelMatrix.translate(-4, 0, 0);
    modelMatrix.rotate(-wheelAngle, 0, 0, 1);
    modelMatrix.rotate(90, 1, 0, 0);
    modelMatrix.scale(1, 2, 1);
    modelMatrix.scale(0.25, 0.25, 0.25);
    modelviewMatrix = viewMatrix.multiply(modelMatrix);
    gl.uniformMatrix4fv(u_modelviewMatrix, false, modelviewMatrix.elements);
    drawCylinder();


}

function drawAxis(){
    let verts = new Float32Array([
        0, -1, 0, 1, 0, 0, 1,
        0, 1, 0, 1, 0, 0, 1,
        -1, 0, 0, 0, 1, 0, 1,
        1, 0, 0, 0, 1, 0, 1,
        0, 0, -1, 0, 0, 1, 1,
        0, 0, 1, 0, 0, 1, 1
    ]);
    let vertBuff = gl.createBuffer();


    gl.bindBuffer(gl.ARRAY_BUFFER, vertBuff);
    gl.bufferData(gl.ARRAY_BUFFER, verts, gl.STATIC_DRAW);
    let a_Position = gl.getAttribLocation(gl.program, 'a_Position');
    // NB! Her må du bruke stride ved kall på gl.vertexAttribPointer(...)
    // Stride = antall bytes som hver verteks opptar (pos+color).
    // let STRIDE = (POSITION_COMPONENT_COUNT + COLOR_COMPONENT_COUNT) * BYTES_PER_FLOAT;
    let stride = (3 + 4) * 4;
    //FULLFØR! TIPS: Her skal du kalle på gl.vertexAttribPointer(a_Position, ...) OG gl.enableVertexAttribArray(...)
    gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, stride, 0);
    gl.enableVertexAttribArray(a_Position);

    // Kopler fargeparametret til bufferobjektet (pass på stride her også)
    let a_Color = gl.getAttribLocation(gl.program, 'a_Color');
    let colorOfset = 3 * 4; //12= offset, start på color-info innafor verteksinfoen.
    gl.vertexAttribPointer(a_Color, 4, gl.FLOAT, false, stride, colorOfset);   //4=ant. Floats per verteks
    gl.enableVertexAttribArray(a_Color);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
    gl.drawArrays(gl.LINES, 0, 6);
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

function rotateCamera(){
    eyeZ = Math.sin(camViewAngleY) * Math.cos(camViewAngleHorizontal) * camScale;
    eyeX = Math.sin(camViewAngleY) * Math.sin(camViewAngleHorizontal) * camScale;
    eyeY = Math.cos(camViewAngleY) * camScale;
}


