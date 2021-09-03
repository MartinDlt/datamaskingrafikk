let VSHADER_SOURCE = `
   attribute vec4 a_Position;
   uniform mat4 u_modelMatrix;
   void main() {
     gl_Position = u_modelMatrix * a_Position;
   }`;

let FSHADER_SOURCE = `
    precision mediump float;
    uniform vec4 u_FragColor;
    void main(){
        gl_FragColor = u_FragColor;
    }`;

function main(){
    let u_modelMatrix = null;
    let modelMatrix = new Matrix4();

    let canvas = document.getElementById('webgl');

    let gl = canvas.getContext('webgl');
    if(!gl){
        console.log('Fikk ikke tak i rendering context for WebGl');
        return;
    }

    if(!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)){
        console.log('Feil ved initialisering av shaderkoden.');
        return;
    }

    let a_Position = gl.getAttribLocation(gl.program, 'a_Position');
    if(a_Position < 0){
        return console.log('Fant ikke parameteret a_Position i shaderen!?');
    }

    let u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');
    if(u_FragColor < 0){
        return console.log('Fant ikke uniform-parametret u_FragColor i shaderen!?');
    }

    u_modelMatrix = gl.getUniformLocation(gl.program, 'u_modelMatrix');

    modelMatrix.setIdentity();
    modelMatrix.setRotate(20, 0, 0, 1);
    modelMatrix.translate(0.75, 0, -1);
    modelMatrix.scale(0.5, 0.5, 0.5);



    gl.uniformMatrix4fv(u_modelMatrix, false, modelMatrix.elements);

    gl.uniform4f(u_FragColor, 1.0, 1.0, 0.0, 1.0);

    gl.clearColor(0.1, 0.1, 0.1, 1.0);

    gl.clear(gl.COLOR_BUFFER_BIT);

    let vertices = new Float32Array([
       -1.0, 1.0, 1.0,
        1.0, 1.0, 1.0,
        1.0, 1.0, -1.0,
        -1.0, 1.0, -1.0,
        -1.0, 1.0, 1.0,
        -1.0, -1.0, 1.0,
        1.0, -1.0, 1.0,
        1.0, -1.0, -1.0,
        -1.0, -1.0, -1.0,
        -1.0, -1.0, 1.0,
        // 11
        1.0, -1.0, 1.0,
        1.0, 1.0, 1.0,

        1.0, -1.0, -1.0,
        1.0, 1.0, -1.0,

        -1.0, -1.0, -1.0,
        -1.0, 1.0, -1.0
    ]);

    var vertBuffer = gl.createBuffer();
    if(!vertBuffer){
        return console.log('Kunne ikke lage buffer');
    }

    gl.bindBuffer(gl.ARRAY_BUFFER, vertBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

    gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(a_Position);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);

    gl.drawArrays(gl.LINE_STRIP, 0, 11);
    gl.drawArrays(gl.LINES, 10, 6);

}