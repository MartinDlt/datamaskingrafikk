// Verteksshader:
let VSHADER_SOURCE =
   'attribute vec4 a_Position;\n' +		// Innkommende verteksposisjon.
   'attribute vec4 a_Color;\n' +		// Innkommende verteksfarge.
   'varying vec4 v_Color;\n' +			// NB! Bruker varying.
   'void main() {\n' +
   '  gl_Position = a_Position;\n' + 	// Posisjon.
   '  v_Color = a_Color;\n' + 			// NB! Setter varying = innkommende verteksfarge.
   '}\n';

// Fragmentshader:
let FSHADER_SOURCE =
   'precision mediump float;\n' +
   'varying vec4 v_Color;\n' +			// NB! Interpolert fargeverdi.
   'void main() {\n' +
   '  gl_FragColor = v_Color;\n' + 		// Setter gl_FragColor = Interpolert fargeverdi.
   '}\n';


function main() {
	// Hent <canvas> elementet
	let canvas = document.getElementById('webgl');

	// Rendering context for WebGL:
	let gl = canvas.getContext('webgl');
	if (!gl) {
		console.log('Fikk ikke tak i rendering context for WebGL');
		return;
	}
	// Initialiser shadere:
	if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
		console.log('Feil ved initialisering av shaderkoden.');
		return;
	}

	//Initialiserer verteksbuffer:
	let n = initBuffers(gl);

	//gl.clearColor(0.0, 0.7, 0.4, 1.0);
	gl.clearColor(1.0, 1.0, 1.0, 1.0);
	gl.clear(gl.COLOR_BUFFER_BIT);

	// Tegner en trekant:
	gl.drawArrays(gl.TRIANGLES, 0, n);
}

function initBuffers(gl) {
	  //3 stk 3D vertekser:
	  let positions = new Float32Array([
		0.0, 0.5, 0,
		-0.5, -0.5, 0,
		0.5, -0.5, 0]);

	  //Farge til verteksene:
	  let colors = new Float32Array([
		1.0, 0.0, 0.0, 1.0,		//Rød  (RgbA)
	    0.0, 1.0, 0.0, 1.0,		//Grønn (rGbA)
	    0.0, 0.0, 1.0, 1.0]);	//Blå 	(rgBA)

	  let n = 3; // Antall vertekser

	  //POSISJONSBUFRET: oppretter, binder og skriver data til bufret:
	  let positionBuffer = gl.createBuffer();
	  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
	  gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);
	  let a_Position = gl.getAttribLocation(gl.program, 'a_Position');
	  // Kople posisjonsparametret til bufferobjektet:
	  // 3=ant. Floats per verteks
	  gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 0, 0);
	  gl.enableVertexAttribArray(a_Position);

	  //COLORBUFRET: oppretter, binder og skriver data til bufret:
	  let colorBuffer = gl.createBuffer();
	  gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
	  gl.bufferData(gl.ARRAY_BUFFER, colors, gl.STATIC_DRAW);
	  let a_Color = gl.getAttribLocation(gl.program, 'a_Color');
	  // Kople posisjonsparametret til bufferobjektet: 4=ant. Floats per verteks
	  gl.vertexAttribPointer(a_Color, 4, gl.FLOAT, false, 0, 0);
	  gl.enableVertexAttribArray(a_Color);
	  // Kople fra.
	  gl.bindBuffer(gl.ARRAY_BUFFER, null);

	  return n;
}
