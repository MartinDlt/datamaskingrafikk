class App{
    constructor(renderingContext){
        this.gl = renderingContext;

        this.vertexBufferTorus = null;
        this.indexBufferTorus = null;

        // Cylinder data
        this.vertexBufferCylinder = null;
        this.indexBufferCylinder = null;

        // Cube data
        this.vertexBufferCube = null;
        this.indexBufferCube = null;
    }

    initTorusIndicesAndBuffers(){
        // Basert på kode fra: http://learningwebgl.com/blog/?p=1253
        let slices = 8;
        let loops = 20;
        let radiusOfTube = 0.2;
        let radiusToTube = 2;

        let vertices = [];
        let indices = [];

        // R = radius til senter av "tuben"
        // r = radius av tuben
        // v => [0, 2pi>, w => [0, 2pi>
        //   x=(R+r*cos(v))cos(w)
        //   y=(R+r*cos(v))sin(w)
        //             z=r*sin(v)

        for (let slice = 0; slice <= slices; ++slice) {
            const v = slice / slices;
            const slice_angle = v * 2 * Math.PI;
            const cos_slices = Math.cos(slice_angle);
            const sin_slices = Math.sin(slice_angle);
            const slice_rad = radiusToTube + radiusOfTube * cos_slices;

            for (let loop = 0; loop <= loops; ++loop) {

                const u = loop / loops;
                const loop_angle = u * 2 * Math.PI;
                const cos_loops = Math.cos(loop_angle);
                const sin_loops = Math.sin(loop_angle);

                const x = slice_rad * cos_loops;
                const y = slice_rad * sin_loops;
                const z = radiusOfTube * sin_slices;


                vertices.push(x, y, z, 0.1, 0.05 + (0.01 * (-1) ** (Math.abs(slice - slices))),0.1, 1);
            }
        }

        // 0 koble trekanter for dette punktet i denne "slice" + neste punkt i "slicen" og punktet på samme plass i neste slice
        //  nextSlice
        //  slice, slice + 1

        const vertsPerSlice = loops + 1;
        for (let i = 0; i < slices; ++i) {
            let v1 = i * vertsPerSlice;
            let v2 = v1 + vertsPerSlice;

            for (let j = 0; j < loops; ++j) {

                indices.push(v1);
                indices.push(v1 + 1);
                indices.push(v2);

                indices.push(v2);
                indices.push(v1 + 1);
                indices.push(v2 + 1);

                v1 += 1;
                v2 += 1;
            }
        }

        //this.indices = undefined;

        // Fyller vertens og indeksbuffer:
        this.vertexBufferTorus = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBufferTorus);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);


        this.indexBufferTorus = gl.createBuffer();
        this.indexBufferTorus.bufferLength = indices.length;
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBufferTorus);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);
        gl.bindBuffer(gl.ARRAY_BUFFER, null);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
    }

    initCylinderIndicesAndBuffers(){
        let r = 0.66;
        let g = 0.96;
        let b = 0.18;

        let segments = 10;
        let radius = 1;
        let cylinderVertices = [0, -1, 0, r -0.1, g-0.4, b-0.1, 1,
            0,  1, 0, r-0.1, g-0.4,b-0.1, 1];
        let cylinderIndices = [];


        for(let i = 0; i < segments; i++){
            let angle = (i / segments) * 2 * Math.PI;
            let cosAngle = Math.cos(angle);
            let sinAngle = Math.sin(angle);
            cylinderVertices.push(cosAngle * radius,-1, sinAngle * radius, r, g, b, 1);
            cylinderVertices.push(cosAngle * radius, 1, sinAngle * radius, r, g, b, 1);
        }

        let vertLength = cylinderVertices.length / 7;

        for(let j = 2; j < vertLength; j++){
            if(j % 2 === 0){
                if(j + 2 < vertLength){
                    cylinderIndices.push(0, j, j+2);
                }else{
                    cylinderIndices.push(0, j, 2);
                }
            }else{
                if(j + 2 < vertLength){
                    cylinderIndices.push(1, j, j + 2)
                }
            }

            if(j === vertLength - 2){
                cylinderIndices.push(j, j + 1, 2);
            }else if(j === vertLength - 1){
                cylinderIndices.push(j, 2, 3);
            }else{
                cylinderIndices.push(j, j+1, j+2);
            }

        }

        cylinderIndices.push(1, vertLength - 1, 3);

        this.vertexBufferCylinder = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBufferCylinder);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(cylinderVertices), gl.STATIC_DRAW);

        this.indexBufferCylinder = gl.createBuffer();
        this.indexBufferCylinder.bufferLength = cylinderIndices.length;
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBufferCylinder);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(cylinderIndices), gl.STATIC_DRAW);
        gl.bindBuffer(gl.ARRAY_BUFFER, null);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);

    }

    initCubeIndicesAndBuffers(){
        let r = 0.96;
        let g = 0.44;
        let b = 0.19;
        let cubeVertices = [
            1, 1, 1, r, g, b, 1,
            1, 1,-1, r, g, b, 1,
            1,-1, 1, r, g, b, 1,
            1,-1,-1, r, g, b, 1,
            -1, 1, 1, r, g, b, 1,
            -1, 1,-1, r, g, b, 1,
            -1,-1, 1, r, g, b, 1,
            -1,-1,-1, r, g, b, 1
        ];

        let cubeIndices = [
            0, 1, 2,
            1, 3, 2,
            0, 5, 1,
            0, 4, 5,
            0, 2, 4,
            2, 6, 4,
            4, 6, 5,
            5, 7, 6,
            7, 5, 1,
            7, 1, 3,
            7, 6, 2,
            2, 3, 7
        ]

        this.vertexBufferCube = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBufferCube);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(cubeVertices), gl.STATIC_DRAW);

        this.indexBufferCube = gl.createBuffer();
        this.indexBufferCube.bufferLength = cubeIndices.length;
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBufferCube);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(cubeIndices), gl.STATIC_DRAW);
        gl.bindBuffer(gl.ARRAY_BUFFER, null);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
    }




}