// Globale variabler:

// Vertex shader program
let  VSHADER_SOURCE =
    'attribute vec3 a_Position;\n' +		//Dersom vec4 trenger vi ikke vec4(a_Position, 1.0) under.
    'uniform mat4 u_modelviewMatrix;\n' +
    'uniform mat4 u_projectionMatrix;\n' +
    'attribute vec4 a_Color;\n' +
    'varying vec4 v_Color;\n' +
    'void main() {\n' +
    '  gl_Position = u_projectionMatrix * u_modelviewMatrix * vec4(a_Position,1.0);\n' +
    '  v_Color = a_Color;\n' +
    '}\n';

// Fragment shader program
let  FSHADER_SOURCE =
    'precision mediump float;\n' +
    'uniform vec4 u_FragColor;\n' + 	// bruker prefiks u_ for å indikere uniform
    'varying vec4 v_Color;\n' +
    'void main() {\n' +
    '  gl_FragColor = v_Color;\n' + // Fargeverdi.
    '}\n';

let  gl = null;
let  canvas = null;

// Verteksbuffer:
let  vertexBuffer = null;
let  secondVertBuffer = null;

// "Pekere" som brukes til å sende matrisene til shaderen:
let  u_modelviewMatrix = null;
let  u_projectionMatrix = null;

// Matrisene:
let  modelMatrix = null;
let  viewMatrix = null;
let  modelviewMatrix = null; //sammenslått modell- og viewmatrise.
let  projectionMatrix = null;

function init() {
    // Hent <canvas> elementet
    canvas = document.getElementById('webgl');

    // Rendering context for WebGL:
    gl = canvas.getContext('webgl');
    if (!gl) {
        console.log('Fikk ikke tak i rendering context for WebGL');
        return false;
    }

    modelMatrix = new Matrix4();
    viewMatrix = new Matrix4();
    modelviewMatrix = new Matrix4();
    projectionMatrix = new Matrix4();

    return true;
}

function initBuffer() {
    // 3 stk 3D vertekser:
    let triangleVertices = new Float32Array([   //NB! ClockWise!!
        -10, -10, 0,
        0, 10, 0,
        10, -10, 0
    ]);

    // Verteksbuffer:
    vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, triangleVertices, gl.STATIC_DRAW);

    vertexBuffer.itemSize = 3; // NB!!
    vertexBuffer.numberOfItems = 3; // NB!!

    gl.bindBuffer(gl.ARRAY_BUFFER, null);
}

function setColors(colors){

    let colorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, colors, gl.STATIC_DRAW);
    let a_Color = gl.getAttribLocation(gl.program, 'a_Color');
    // Kople posisjonsparametret til bufferobjektet: 4=ant. Floats per verteks
    gl.vertexAttribPointer(a_Color, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(a_Color);
    // Kople fra.
    gl.bindBuffer(gl.ARRAY_BUFFER, null);

}

function extraInitBuffer() {
    // 3 stk 3D vertekser:
    let triangleVertices = new Float32Array([   //NB! ClockWise!!
        5, 5, 0,
        -2, 2, 0,
        0, 0, 0
    ]);

    // Verteksbuffer:
    secondVertBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, secondVertBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, triangleVertices, gl.STATIC_DRAW);

    secondVertBuffer.itemSize = 3; // NB!!
    secondVertBuffer.numberOfItems = 3; // NB!!

    gl.bindBuffer(gl.ARRAY_BUFFER, null);
}

function bindShaderParameters() {
    // Matriser: u_modelviewMatrix & u_projectionMatrix
    u_modelviewMatrix = gl.getUniformLocation(gl.program, 'u_modelviewMatrix');
    u_projectionMatrix = gl.getUniformLocation(gl.program, 'u_projectionMatrix');

    return true;
}

function draw() {

    gl.clear(gl.COLOR_BUFFER_BIT);

    // BackfaceCulling:
    /*
	gl.frontFace(gl.CW);		//indikerer at trekanter med vertekser angitt i CW er front-facing!
	gl.enable(gl.CULL_FACE);	//enabler culling.
	gl.cullFace(gl.BACK);		//culler baksider.
    */

    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    // Posisjon: a_Position
    let  a_Position = gl.getAttribLocation(gl.program, 'a_Position');
    gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(a_Position);

    // Definerer modellmatrisa:
    modelMatrix.setIdentity();
    modelMatrix.scale(2, 2, 2);
    modelMatrix.translate(10, 10, 4);
    //modelMatrix.setIdentity();


    let  eyeX=0, eyeY=0, eyeZ=100;
    let  lookX=0, lookY=0, lookZ=0;
    let  upX=0, upY=1, upZ=0;
    viewMatrix.setLookAt(eyeX, eyeY, eyeZ, lookX, lookY, lookZ, upX, upY, upZ);

    // Slår sammen modell & view til modelview-matrise:
    modelviewMatrix = viewMatrix.multiply(modelMatrix); // NB! rekkefølge!
    projectionMatrix.setPerspective(45, canvas.width / canvas.height, 1, 1000);

    setColors(new Float32Array([
        1.0, 0.0, 0.0, 1.0,		//Rød  (RgbA)
        0.8, 0.0, 0.0, 1.0,		//Grønn (rGbA)
        0.6, 0.0, 0.0, 1.0]));
    // Sender matriser til shader:
    gl.uniformMatrix4fv(u_modelviewMatrix, false, modelviewMatrix.elements);
    gl.uniformMatrix4fv(u_projectionMatrix, false, projectionMatrix.elements);
    gl.drawArrays(gl.TRIANGLES, 0, vertexBuffer.numberOfItems);

    //Tegner samme trekant på nytt, men med annen transformasjon:
    setColors(new Float32Array([
        0.0, 1.0, 0.0, 1.0,		//Rød  (RgbA)
        0.0, 0.8, 0.0, 1.0,		//Grønn (rGbA)
        0.0, 0.6, 0.0, 1.0]));
    modelMatrix.setTranslate(-10, -5, 0);
    viewMatrix.setLookAt(eyeX, eyeY, eyeZ, lookX, lookY, lookZ, upX, upY, upZ);
    modelMatrix.setIdentity();
    modelviewMatrix = viewMatrix.multiply(modelMatrix);
    gl.uniformMatrix4fv(u_modelviewMatrix, false, modelviewMatrix.elements);
    gl.drawArrays(gl.TRIANGLES, 0, vertexBuffer.numberOfItems);

    //... og på nytt:
    setColors(new Float32Array([
        0.0, 0.0, 1.0, 1.0,		//Rød  (RgbA)
        0.0, 0.0, 0.8, 1.0,		//Grønn (rGbA)
        0.0, 0.0, 0.6, 1.0]));
    viewMatrix.setLookAt(eyeX, eyeY, eyeZ, lookX, lookY, lookZ, upX, upY, upZ);
    modelMatrix.setTranslate(-13, -13, 4);
    modelMatrix.rotate(33, 0, 0, 1);

    modelviewMatrix = viewMatrix.multiply(modelMatrix); // NB! rekkefølge!
    gl.uniformMatrix4fv(u_modelviewMatrix, false, modelviewMatrix.elements);
    gl.drawArrays(gl.TRIANGLES, 0, vertexBuffer.numberOfItems);

    setColors(new Float32Array([
        0.5, 0.5, 0.0, 1.0,		//Rød  (RgbA)
        0.3, 0.3, 0.0, 1.0,		//Grønn (rGbA)
        0.1, 0.1, 0.0, 1.0]));
    viewMatrix.setLookAt(eyeX, eyeY, eyeZ, lookX, lookY, lookZ, upX, upY, upZ);
    modelMatrix.setIdentity();
    extraInitBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, secondVertBuffer);
    // Posisjon: a_Position
    a_Position = gl.getAttribLocation(gl.program, 'a_Position');


    modelMatrix.setTranslate(-4, 23, 0);
    modelMatrix.scale(2,2,2);
    gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(a_Position);

    modelviewMatrix = viewMatrix.multiply(modelMatrix);
    // console.log(modelMatrix.elements);
    // console.log(modelviewMatrix.elements);
    gl.uniformMatrix4fv(u_modelviewMatrix, false, modelviewMatrix.elements);
    gl.drawArrays(gl.TRIANGLES, 0, secondVertBuffer.numberOfItems);



}

function main() {

    if (!init())
        return;

    // Initialiser shadere (cuon-utils):
    if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
        console.log('Feil ved initialisering av shaderkoden.');
        return;
    }

    // Initialiserer verteksbuffer:
    initBuffer();

    // Binder shaderparametre:
    if (!bindShaderParameters())
        return;

    // Setter bakgrunnsfarge:
    gl.clearColor(0.3, 0.0, 0.4, 1.0); //RGBA

    // Tegn!
    draw();
}
