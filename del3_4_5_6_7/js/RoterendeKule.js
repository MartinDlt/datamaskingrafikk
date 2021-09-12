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
let eyeX=100, eyeY=100, eyeZ=100;
let lastTime = Date.now();
let camViewAngle = 0;
let camScale = 100;
let sphereVertices;
let sphereIndices;
let vertexBufferSphere = null;
let indexBufferSphere = null;
let activeKeys = [];


function main() {
    init();

    // Initialiser shadere (cuon-utils):
    if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
        console.log('Feil ved initialisering av shaderkoden.');
        return;
    }

    // Initialiserer verteksbuffer:
    initSphereIndicesAndBuffers();

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

    if(activeKeys.includes(37)){
        camViewAngle += 0.2;
    }
    if(activeKeys.includes((39))){
        camViewAngle -= 0.2;
    }

}

/**
 * Oppretter og fyller posisjonsbuffer.
 *
 */
function initSphereIndicesAndBuffers() {
    // Basert på kode fra: http://learningwebgl.com/blog/?p=1253
    let vertexPosColData = [];
    let r=1,g=0,b=0,a=1;

    let latitudeBands = 30;     //latitude: parallellt med ekvator.
    let longitudeBands = 30;    //longitude: går fra nord- til sydpolen.
    let radius = 20;

    //Genererer vertekser:
    for (let latNumber = 0; latNumber <= latitudeBands; latNumber++) {
        let theta = latNumber * Math.PI / latitudeBands;
        let sinTheta = Math.sin(theta);
        let cosTheta = Math.cos(theta);

        //Ny farge for hvert "bånd":
        r-=0.05; g+=0.05; b+=0.1;
        if (r<=0) r=1;
        if (g>=1) g=0;
        if (b>=1) b=0;

        for (var longNumber = 0; longNumber <= longitudeBands; longNumber++) {
            let phi = longNumber * 2 * Math.PI / longitudeBands;
            let sinPhi = Math.sin(phi);
            let cosPhi = Math.cos(phi);

            let x = cosPhi * sinTheta;
            let y = cosTheta;
            let z = sinPhi * sinTheta;

            vertexPosColData.push(radius * x);
            vertexPosColData.push(radius * y);
            vertexPosColData.push(radius * z);
            vertexPosColData.push(r);
            vertexPosColData.push(g);
            vertexPosColData.push(b);
            vertexPosColData.push(a);

        }
    }

    //Genererer indeksdata for å knytte sammen verteksene:
    let indexData = [];
    for (let latNumber = 0; latNumber < latitudeBands; latNumber++) {
        for (let longNumber = 0; longNumber < longitudeBands; longNumber++) {
            let first = (latNumber * (longitudeBands + 1)) + longNumber;
            let second = first + longitudeBands + 1;
            indexData.push(first);
            indexData.push(second);
            indexData.push(first + 1);

            indexData.push(second);
            indexData.push(second + 1);
            indexData.push(first + 1);
        }
    }

    //Kopierer til globale array...
    sphereVertices = new Float32Array(vertexPosColData);
    sphereIndices = new Uint16Array(indexData);

    // Fyller vertens og indeksbuffer:
    vertexBufferSphere = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBufferSphere);
    gl.bufferData(gl.ARRAY_BUFFER, sphereVertices, gl.STATIC_DRAW);

    indexBufferSphere = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBufferSphere);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, sphereIndices, gl.STATIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);
}

function drawSphere() {
    // Kopler posisjonsparametret til posisjonsbufferobjektet:
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBufferSphere);
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
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBufferSphere);
    gl.drawElements(gl.TRIANGLES, sphereIndices.length, gl.UNSIGNED_SHORT,0);

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
    requestAnimationFrame(draw);
    a+= 0.83;
    handleActiveKeys();
    rotateCameraXZ(camViewAngle);

    // Definerer modellmatrisa:
    modelMatrix.setIdentity();
    //modelMatrix.rotate(a, 1, 0, 0);

    let  lookX=0, lookY=0, lookZ=0;
    let  upX=0, upY=1, upZ=0;
    viewMatrix.setLookAt(eyeX, eyeY, eyeZ, lookX, lookY, lookZ, upX, upY, upZ);

    // Slår sammen modell & view til modelview-matrise:
    //modelviewMatrix = viewMatrix.multiply(modelMatrix); // NB! rekkefølge!
    projectionMatrix.setPerspective(45, canvas.width / canvas.height, 1, 1000);


    // Sender matriser til shader:
    gl.uniformMatrix4fv(u_projectionMatrix, false, projectionMatrix.elements);
    modelMatrix.scale(100, 100, 100);
    modelviewMatrix = viewMatrix.multiply(modelMatrix);
    gl.uniformMatrix4fv(u_modelviewMatrix, false, modelviewMatrix.elements);
    drawAxis();


    viewMatrix.setLookAt(eyeX, eyeY, eyeZ, lookX, lookY, lookZ, upX, upY, upZ);
    modelMatrix.setIdentity();
    modelMatrix.rotate(29, 1, 0, 0);
    modelMatrix.rotate(a ** 1.12, 0, 1, 0);
    modelMatrix.rotate(-29, 1, 0, 0);
    modelviewMatrix = viewMatrix.multiply(modelMatrix);
    gl.uniformMatrix4fv(u_modelviewMatrix, false, modelviewMatrix.elements);
    drawSphere();

    modelMatrix.setIdentity();
    modelMatrix.rotate(a, 0, 1, 1);
    modelMatrix.translate(45, 0, 0);
    modelMatrix.rotate(a ** 1.2, 0, 0, 1);
    modelMatrix.scale(0.14, 0.14, 0.14);
    viewMatrix.setLookAt(eyeX, eyeY, eyeZ, lookX, lookY, lookZ, upX, upY, upZ);
    modelviewMatrix = viewMatrix.multiply(modelMatrix);
    gl.uniformMatrix4fv(u_modelviewMatrix, false, modelviewMatrix.elements);
    drawSphere();

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
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBufferSphere);
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

function rotateCameraXZ(angle){
    eyeZ = Math.cos(angle) * camScale;
    eyeX = Math.sin(angle) * camScale;
}
