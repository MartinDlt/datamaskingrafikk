'use strict';

/**
 * Tegner en enkel kjegle (2D) vha. indeksering.
 *
 */

// Vertex shader program
let VSHADER_SOURCE =
	'attribute vec4 a_Position;\n' +
	'void main() {\n' +
	'  gl_Position = a_Position;\n' +
	'}\n';

// Fragment shader program
let FSHADER_SOURCE =
	'precision mediump float;\n' +
	'uniform vec4 u_FragColor;\n' +     //bruker prefiks u_ for å indikere uniform
	'void main() {\n' +
	'  gl_FragColor = u_FragColor;\n' + // Fargeverdi.
	'}\n';

//Globale variabler:
let gl;
let vertexBuffer;
let coneIndices;
let indexBuffer;

function main() {
	init();

	// Initialiser shadere:
	if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
		console.log('Feil ved initialisering av shaderkoden.');
		return;
	}
	// Binder shaderparametre:
	if (!initUniforms())
		return;
	//Initialiserer verteksbuffer:
	initBuffers(gl);
	draw();
}

/**
 * Initialisering og oppstart.
 */
function init() {
	// Hent <canvas> elementet
	let canvas = document.getElementById('webgl');
	// Rendering context for WebGL:
	gl = canvas.getContext('webgl');
	if (!gl)
		console.log('Fikk ikke tak i rendering context for WebGL');
	// Setter bakgrunnsfarge:
	gl.clearColor(0.0, 1.0, 0.4, 1.0);
}

/**
 * Kopler ev. uniformvariabler.
 * @returns {boolean}
 */
function initUniforms() {
	//Kopler farge:
	let u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');
	if (u_FragColor < 0) {
		console.log('Fant ikke uniform-parametret u_FragColor i shaderen!?');
		return false;
	}
	let rgba = [0.3, 0.5, 1.0, 1.0];
	gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
	return true;
}

//NB! Legg merke til kall på bindBuffer(..., null)
function initBuffers(gl) {
	//n stk 3D vertekser:
	let coneVertices = new Float32Array([
		0.75, 0, 0,
		-0.75, 0.5, 0,
		-0.75, 0.4045085, 0.2938925,
		-0.75, 0.1545085, 0.4755285,
		-0.75, -0.1545085, 0.4755285,
		-0.75, -0.4045085, 0.2938925,
		-0.75, -0.5, 0.0,
		-0.75, -0.4045085, -0.2938925,
		-0.75, -0.1545085, -0.4755285,
		-0.75, 0.1545085, -0.4755285,
		-0.75, 0.4045085, -0.2938925
	]);
	//Indekser som utgjår en Cone:
	coneIndices = new Uint16Array([
		0, 1, 2,
		0, 2, 3,
		0, 3, 4,
		0, 4, 5,
		0, 5, 6,
		0, 6, 7,
		0, 7, 8,
		0, 8, 9,
		0, 9, 10,
		0, 10, 1
	]);

	// Verteksbuffer:
	vertexBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, coneVertices, gl.STATIC_DRAW);
	gl.bindBuffer(gl.ARRAY_BUFFER, null);
	//Setter antall floats per verteks og antall vertekser i dette bufret:
	vertexBuffer.itemSize = 3;
	vertexBuffer.numberOfItems = coneVertices.length / 3;

	//Indeksbuffer:
	indexBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
	gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, coneIndices, gl.STATIC_DRAW);
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
	indexBuffer.numberOfItems = coneIndices.length;
}

function draw() {
	gl.clear(gl.COLOR_BUFFER_BIT);

	//Kopler shadervariabler:
	gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
	let a_Position = gl.getAttribLocation(gl.program, 'a_Position');
	gl.vertexAttribPointer(a_Position, vertexBuffer.itemSize, gl.FLOAT, false, 0, 0);
	gl.enableVertexAttribArray(a_Position);

	// Tegner firkanten vha. indeksbuffer og drawElements():
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
	gl.drawElements(gl.LINE_LOOP, indexBuffer.numberOfItems, gl.UNSIGNED_SHORT, 0);
}
