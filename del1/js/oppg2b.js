let TRIANGLE = 3;
let LINE = 2;
let POINT = 1;

let VSHADER_SOURCE = `
    attribute vec4 a_Position;
    attribute vec4 a_Color;
    varying vec4 v_Color;
    void main() {
        gl_Position = a_Position;
        v_Color = a_Color;
    }`;

let FSHADER_SOURCE = `
    precision mediump float;
    uniform vec4 u_FragColor; 
    varying vec4 v_Color;
    void main() {
        gl_FragColor = v_Color;
    }`;

function main(){

    let canvas = document.getElementById('webgl');

    let gl = canvas.getContext('webgl');
    if(!gl){
        console.log("Klarte ikke å hente ut webgl konteksten");
        return;
    }

    // Fungerer ikke på mobil (IOS/IPADOS)?
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    if(!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)){
        console.log("Klarte ikke å initialisere shaders");
        return;
    }


    gl.clearColor(0.95, 0.95, 0.95, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    let numAxes = createAxes(gl);
    if(numAxes <= 0){
        return;
    }
    let verticesPerLine = 2;

    gl.linewidth = 2.0;
    gl.drawArrays(gl.LINES, 0, numAxes * verticesPerLine);

    let numTris = createAxisTriangles(gl);
    if(numTris <= 0){
        return;
    }
    let verticesPerTri = 3;
    gl.drawArrays(gl.TRIANGLES, 0, numAxes * verticesPerTri);

    numTris = createBigArrow(gl);
    if(numTris <= 0){
        return;
    }
    gl.drawArrays(gl.TRIANGLES, 0, numAxes * verticesPerTri);

}

function createAxes(gl){
    let vertices = new Float32Array([
        0.8, 0.0, 0,
        -0.8, 0.0, 0,
        0.0, 0.8, 0,
        0.0, -0.8, 0
    ]);

    let colors = new Float32Array([
        0.9, 0.0, 0.0, 1.0,
        0.9, 0.0, 0.0, 1.0,
        0.0, 0.7, 0.3, 1.0,
        0.0, 0.7, 0.3, 1.0
    ]);

    return addVerticesToBuffer(vertices, colors, gl, LINE);
}

function createAxisTriangles(gl){
    let vertices = new Float32Array([
        0.8, 0.012, 0,
        0.8, -0.012, 0,
        0.82, 0.0, 0,
        -0.8, 0.012, 0,
        -0.8, -0.012, 0,
        -0.82, 0.0, 0,
        0.012, 0.8, 0,
        -0.012, 0.8, 0,
        0.0, 0.82, 0,
        0.012, -0.8, 0,
        -0.012, -0.8, 0,
        0.0, -0.82, 0
    ]);

    let colors = new Float32Array([
        0.9, 0.0, 0.0, 1.0,
        0.9, 0.0, 0.0, 1.0,
        0.9, 0.0, 0.0, 1.0,
        0.9, 0.0, 0.0, 1.0,
        0.9, 0.0, 0.0, 1.0,
        0.9, 0.0, 0.0, 1.0,
        0.0, 0.7, 0.3, 1.0,
        0.0, 0.7, 0.3, 1.0,
        0.0, 0.7, 0.3, 1.0,
        0.0, 0.7, 0.3, 1.0,
        0.0, 0.7, 0.3, 1.0,
        0.0, 0.7, 0.3, 1.0
    ]);

    return addVerticesToBuffer(vertices, colors, gl, TRIANGLE);
}

function createBigArrow(gl){
    let vertices = new Float32Array([
        -0.7,  0.25, 1.0,
        -0.45, 0.00, 1.0,
        0.2,   0.25, 1.0,
        -0.7, -0.25, 1.0,
        -0.45, 0.00, 1.0,
        0.2,  -0.25, 1.0,
        -0.45, 0.00, 1.0,
        0.2,  -0.25, 1.0,
        0.2,   0.25, 1.0,
        0.2,   0.50, 1.0,
        0.2,  -0.50, 1.0,
        0.7,   0.00, 1.0
    ]);

    let colors = new Float32Array([
        0.0, 0.59, 0.84, 0.85,
        0.0, 0.59, 0.84, 0.85,
        0.0, 0.59, 0.84, 0.85,
        0.0, 0.59, 0.84, 0.85,
        0.0, 0.59, 0.84, 0.85,
        0.0, 0.59, 0.84, 0.85,
        0.0, 0.59, 0.84, 0.85,
        0.0, 0.59, 0.84, 0.85,
        0.0, 0.59, 0.84, 0.85,
        0.0, 0.59, 0.84, 0.85,
        0.0, 0.59, 0.84, 0.85,
        0.0, 0.59, 0.84, 0.85
    ]);

    return addVerticesToBuffer(vertices, colors, gl, TRIANGLE);
}

function addVerticesToBuffer(vertices, colors, gl, shape){
    let colBuffer = gl.createBuffer();
    if(!colBuffer){
        console.log("Klarte ikke å lage en buffer");
        return -1;
    }

    gl.bindBuffer(gl.ARRAY_BUFFER, colBuffer);

    gl.bufferData(gl.ARRAY_BUFFER, colors, gl.STATIC_DRAW);

    let colAttrib = gl.getAttribLocation(gl.program, 'a_Color');
    if(colAttrib < 0){
        console.log("Klarte ikke å finne farge attributten: 'a_Color'");
        return -1;
    }

    let floatsPerColor = 4;
    gl.vertexAttribPointer(colAttrib, floatsPerColor, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(colAttrib);

    let vertBuffer = gl.createBuffer();
    if(!vertBuffer){
        console.log("Klarte ikke å lage en buffer");
        return -1;
    }
    gl.bindBuffer(gl.ARRAY_BUFFER, vertBuffer);

    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

    let vertAttrib = gl.getAttribLocation(gl.program, 'a_Position');
    if(vertAttrib < 0){
        console.log("Klarte ikke å finne posisjons attributten: 'a_Position'");
        return -1;
    }

    let floatsPerVertex = 3;
    gl.vertexAttribPointer(vertAttrib, floatsPerVertex, gl.FLOAT, false, 0, 0);

    gl.enableVertexAttribArray(vertAttrib);

    gl.bindBuffer(gl.ARRAY_BUFFER, null);

    // Divide the total length of the vertices with the amount of vertices in the shape
    return vertices.length / shape;
}