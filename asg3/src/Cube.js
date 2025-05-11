class Cube {
    constructor() {
        this.type = 'cube';
        this.textureNum = -2;
    }

    drawCube(matrix, color) {
        var rgba = color;

        // Pass the texture number
        gl.uniform1i(u_whichTexture, this.textureNum);

        // Pass the color of a point to u_FragColor variable
        gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);

        // Pass the matrix to u_ModelMatrix attribute
        gl.uniformMatrix4fv(u_ModelMatrix, false, matrix.elements);

        // Each face is made up of two triangles

        var allverts = [];

        // Front face
        // drawTriangle3D([0, 0, 0, 1, 1, 0, 1, 0, 0]);
        // drawTriangle3DUV([0, 0, 0, 1, 1, 0, 1, 0, 0], [1.0, 0.0, 0.1, 1.0, 1.0, 1.0]);
        // drawTriangle3D([0, 0, 0, 0, 1, 0, 1, 1, 0]);
        drawTriangle3DUV([0, 0, 0, 1, 1, 0, 1, 0, 0], [0, 0, 1, 1, 1, 0]);
        drawTriangle3DUV([0, 0, 0, 0, 1, 0, 1, 1, 0], [0, 0, 0, 1, 1, 1]);

        allverts = allverts.concat([0, 0, 0, 1, 1, 0, 1, 0, 0]);

        // Pass the color of a point to u_FragColor uniform variable
        // gl.uniform4f(u_FragColor, rgba[0] * .9, rgba[1] * .9, rgba[2] * .9, rgba[3]);

        // Right face
        drawTriangle3DUV([1, 0, 0, 1, 1, 0, 1, 1, 1], [0, 0, 0, 1, 1, 1]);
        drawTriangle3DUV([1, 0, 0, 1, 1, 1, 1, 0, 1], [0, 0, 1, 1, 1, 0]);

        // Back face
        drawTriangle3DUV([1, 0, 1, 1, 1, 1, 0, 1, 1], [0, 0, 0, 1, 1, 1]);
        drawTriangle3DUV([1, 0, 1, 0, 1, 1, 0, 0, 1], [0, 0, 1, 1, 1, 0]);

        // Left face
        drawTriangle3DUV([0, 0, 1, 0, 1, 1, 0, 1, 0], [0, 0, 0, 1, 1, 1]);
        drawTriangle3DUV([0, 0, 1, 0, 1, 0, 0, 0, 0], [0, 0, 1, 1, 1, 0]);

        // Top face
        drawTriangle3DUV([0, 1, 0, 0, 1, 1, 1, 1, 1], [0, 0, 0, 1, 1, 1]);
        drawTriangle3DUV([0, 1, 0, 1, 1, 1, 1, 1, 0], [0, 0, 1, 1, 1, 0]);

        // Bottom face
        drawTriangle3DUV([0, 0, 0, 1, 0, 0, 1, 0, 1], [0, 0, 0, 1, 1, 1]);
        drawTriangle3DUV([0, 0, 0, 1, 0, 1, 0, 0, 1], [0, 0, 1, 1, 1, 0]);

        // drawTriangle3D(allverts);
    }
}
