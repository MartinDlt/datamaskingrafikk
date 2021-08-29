let VSHADER_SOURCE = `
   attribute vec4 a_Position;
   attribute float a_PointSize;
   void main() {
     gl_Position = a_Position;
     gl_PointSize = a_PointSize;
   }`;

let FSHADER_SOURCE = `
    precision mediump float;
    uniform vec4 u_FragColor;
    void main(){
        gl_FragColor = u_FragColor;
    }`;

function main(){
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

    let a_PointSize = gl.getAttribLocation(gl.program, 'a_PointSize');
    if(a_PointSize < 0){
        return console.log('Fant ikke parameteret a_PointSize i shaderen!?');
    }

    let u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');
    if(u_FragColor < 0){
        return console.log('Fant ikke uniform-parametret u_FragColor i shaderen!?');
    }

    gl.vertexAttrib1f(a_PointSize, 4.0);
    gl.uniform4f(u_FragColor, 1.0, 1.0, 0.0, 1.0);

    gl.clearColor(0.1, 0.1, 0.1, 1.0);

    gl.clear(gl.COLOR_BUFFER_BIT);

    for(let i = 0; i < 10; i++){
        gl.vertexAttrib3f(a_Position, Math.random(), Math.random(), Math.random());
        gl.drawArrays(gl.POINTS, 0, 1);
    }

    let vertices = new Float32Array([
        -0.5, -0.7, 1.0,
        -0.3, -0.6, 1.0,
        -0.4,  0.0, 1.0,
         0.0,  0.0, 1.0,
         0.2,  0.2, 1.0
    ]);

    let vertBuffer = gl.createBuffer();
    if(!vertBuffer){
        return console.log('Klarte ikke å lage en buffer for punktene');
    }

    gl.bindBuffer(gl.ARRAY_BUFFER, vertBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

    let floatsPerVertex = 3;
    gl.vertexAttribPointer(a_Position, floatsPerVertex, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(a_Position);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);

    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 5);

}