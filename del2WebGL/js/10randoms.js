let VSHADER_SOURCE = `
   attribute vec4 a_Position;
   uniform mat4 u_modelviewMatrix;
   uniform mat4 u_projectionMatrix;
   attribute float a_PointSize;
   void main() {
     gl_Position = u_projectionMatrix * u_modelviewMatrix * a_Position;
     gl_PointSize = a_PointSize;
   }`;

let FSHADER_SOURCE = `
    precision mediump float;
    uniform vec4 u_FragColor;
    void main(){
        gl_FragColor = u_FragColor;
    }`;

function main(){
    let u_modelviewMatrix = null;
    let u_projectionMatrix = null;
    let modelMatrix = new Matrix4();
    let viewMatrix = new Matrix4();
    let modelviewMatrix = new Matrix4();
    let projectionMatrix = new Matrix4();

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

    u_modelviewMatrix = gl.getUniformLocation(gl.program, 'u_modelviewMatrix');
    u_projectionMatrix = gl.getUniformLocation(gl.program, 'u_projectionMatrix');

    modelMatrix.setIdentity();

    let  eyeX=0, eyeY=70, eyeZ=100;
    let  lookX=0, lookY=0, lookZ=0;
    let  upX=0, upY=1, upZ=0;
    viewMatrix.setLookAt(eyeX, eyeY, eyeZ, lookX, lookY, lookZ, upX, upY, upZ);

    modelMatrix.setTranslate(0, 15, 0);
    modelMatrix.scale(30, 30, 30);
    modelviewMatrix = viewMatrix.multiply(modelMatrix);
    projectionMatrix.setPerspective(45, canvas.width / canvas.height, 1, 1000);

    gl.uniformMatrix4fv(u_modelviewMatrix, false, modelviewMatrix.elements);
    gl.uniformMatrix4fv(u_projectionMatrix, false, projectionMatrix.elements);

    gl.vertexAttrib1f(a_PointSize, 4.0);
    gl.uniform4f(u_FragColor, 1.0, 1.0, 0.0, 1.0);

    gl.clearColor(0.1, 0.1, 0.1, 1.0);

    gl.clear(gl.COLOR_BUFFER_BIT);

    for(let i = 0; i < 10; i++){
        gl.vertexAttrib3f(a_Position, Math.random(), Math.random(), Math.random());
        gl.drawArrays(gl.POINTS, 0, 1);
    }

    viewMatrix.setLookAt(eyeX, eyeY, eyeZ, lookX, lookY, lookZ, upX, upY, upZ);
    modelMatrix.setIdentity();
    modelMatrix.setTranslate(15, 15, 0);
    modelMatrix.scale(35, 35, 35);
    modelviewMatrix = viewMatrix.multiply(modelMatrix);
    gl.uniformMatrix4fv(u_modelviewMatrix, false, modelviewMatrix.elements);
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

    viewMatrix.setLookAt(eyeX, eyeY, eyeZ, lookX, lookY, lookZ, upX, upY, upZ);
    modelMatrix.setIdentity();
    modelMatrix.setTranslate(-25, 15, 0);
    modelMatrix.scale(25, 25, 25);
    modelviewMatrix = viewMatrix.multiply(modelMatrix);
    gl.uniformMatrix4fv(u_modelviewMatrix, false, modelviewMatrix.elements);
    gl.drawArrays(gl.LINE_STRIP, 0, 4);

    viewMatrix.setLookAt(eyeX, eyeY, eyeZ, lookX, lookY, lookZ, upX, upY, upZ);
    modelMatrix.setIdentity();
    modelMatrix.setTranslate(-15, 40, 0);
    modelMatrix.scale(25, 25, 25);
    modelviewMatrix = viewMatrix.multiply(modelMatrix);
    gl.uniformMatrix4fv(u_modelviewMatrix, false, modelviewMatrix.elements);
    gl.drawArrays(gl.LINES, 0, 4);


}