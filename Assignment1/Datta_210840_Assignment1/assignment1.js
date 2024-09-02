// alert("hello")

const DARKGREY = [0.69, 0.69, 0.69, 1]
const GREEN1 = [0.5, 0.79, 0.38, 1]
const GREEN2 = [0.4, 0.69, 0.35, 1]
const GREEN3 = [0.26, 0.59, 0.33, 1]
const GREEN4 = [0.46, 0.69, 0.28, 1]
const GREEN5 = [0.4, 0.88, 0.55, 1]
const BROWN1 = [0.56, 0.47, 0.34, 1]
const BROWN2 = [0.47, 0.36, 0.27, 1]
const BROWN3 = [0.46, 0.31, 0.3, 1]
const BROWN4 = [0.2, 0.2, 0.2, 1]
const YELLOW1 = [0.69, 0.69, 0.22, 1]
const YELLOW2= [0.86, 0.71, 0.24, 1]
const BLUE1 = [0.16, 0.38, 0.96, 1]
const  BLUE2 = [0.22, 0.49, 0.87, 1]
const BLUE3 = [0.11, 0.3, 0.67, 1]
const RED1 = [0.92, 0.2, 0.13, 1]
const RED2  = [0.93, 0.35, 0.16, 1]
const GRAY1 = [0.69, 0.69, 0.69, 1]
const GRAY2 = [0.8, 0.8, 0.8, 1]
const GRAY3 = [0.9, 0.9, 0.9, 1]
const GRAY4 = [0.8, 0.8, 0.89, 1]
GRAY5 = [0.5, 0.49, 0.49, 1]
const WHITE = [1,1,1,1]
const BLACK = [0,0,0,1]
const gY=-.28


var gl;
var TYPE;
var color;
var matrixStack = [];

var animation

// mMatrix is called the model matrix, transforms objects
// from local object space to world space.
var mMatrix = mat4.create();
var uMMatrixLocation;

var circleBuf;
var circleIndexBuf;

var sqVertexPositionBuffer;
var sqVertexIndexBuffer;

var aPositionLocation;
var uColorLoc;

const vertexShaderCode = `#version 300 es
in vec2 aPosition;
uniform mat4 uMMatrix;

void main() {
  gl_Position = uMMatrix*vec4(aPosition,0.0,1.0);
  gl_PointSize = 10.0;
}`;

const fragShaderCode = `#version 300 es
precision mediump float;
out vec4 fragColor;

uniform vec4 color;

void main() {
  fragColor = color;
}`;
var circleBuf;
var circleIndexBuf;

function initCircleBuffer(numSegments) {
    const circleVertices = [];
    const circleIndices = [];

    // Generate vertices for the circle
    for (let i = 0; i <= numSegments; i++) {
        const angle = (i / numSegments) * 2 * Math.PI;
        const x = Math.cos(angle);
        const y = Math.sin(angle);
        circleVertices.push(x, y);
    }

    // Generate indices for triangle fan
    for (let i = 1; i <= numSegments; i++) {
        circleIndices.push(0, i, i + 1);
    }
    circleIndices.push(0, numSegments, 1); // To close the circle

    // Create buffer for the vertices
    circleBuf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, circleBuf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(circleVertices), gl.STATIC_DRAW);
    circleBuf.itemSize = 2;
    circleBuf.numItems = numSegments + 1;

    // Create buffer for the indices
    circleIndexBuf = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, circleIndexBuf);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(circleIndices), gl.STATIC_DRAW);
    circleIndexBuf.itemSize = 1;
    circleIndexBuf.numItems = circleIndices.length;
}

function drawCircle(color, mMatrix) {
    gl.uniformMatrix4fv(uMMatrixLocation, false, mMatrix);

    // Bind the circle vertex buffer
    gl.bindBuffer(gl.ARRAY_BUFFER, circleBuf);
    gl.vertexAttribPointer(
        aPositionLocation,
        circleBuf.itemSize,
        gl.FLOAT,
        false,
        0,
        0
    );

    // Bind the circle index buffer
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, circleIndexBuf);

    // Set the color uniform
    gl.uniform4fv(uColorLoc, color);

    // Draw the circle as a triangle fan
    gl.drawElements(
        TYPE,
        circleIndexBuf.numItems,
        gl.UNSIGNED_SHORT,
        0
    );
}


function pushMatrix(stack, m) {
  //necessary because javascript only does shallow push
  var copy = mat4.create(m);
  stack.push(copy);
}

function popMatrix(stack) {
  if (stack.length > 0) return stack.pop();
  else console.log("stack has no matrix to pop!");
}

function degToRad(degrees) {
  return (degrees * Math.PI) / 180;
}

function initGL(canvas) {
    try {
      gl = canvas.getContext("webgl2"); // the graphics webgl2 context
      gl.viewportWidth = canvas.width; // the width of the canvas
      gl.viewportHeight = canvas.height; // the height
    } catch (e) {}
    if (!gl) {
      alert("WebGL initialization failed");
    }
}

function vertexShaderSetup(vertexShaderCode) {
    shader = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(shader, vertexShaderCode);
    gl.compileShader(shader);
    // Error check whether the shader is compiled correctly
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      alert(gl.getShaderInfoLog(shader));
      return null;
    }
    return shader;
  }
  
function fragmentShaderSetup(fragShaderCode) {
    shader = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(shader, fragShaderCode);
    gl.compileShader(shader);
    // Error check whether the shader is compiled correctly
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        alert(gl.getShaderInfoLog(shader));
        return null;
    }
    return shader;
}

function drawSquare(color, mMatrix) {
    gl.uniformMatrix4fv(uMMatrixLocation, false, mMatrix);
  
    // buffer for point locations
    gl.bindBuffer(gl.ARRAY_BUFFER, sqVertexPositionBuffer);
    gl.vertexAttribPointer(
      aPositionLocation,
      sqVertexPositionBuffer.itemSize,
      gl.FLOAT,
      false,
      0,
      0
    );
  
    // buffer for point indices
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, sqVertexIndexBuffer);
  
    gl.uniform4fv(uColorLoc, color);
  
    // now draw the square
    gl.drawElements(
      TYPE,
      sqVertexIndexBuffer.numItems,
      gl.UNSIGNED_SHORT,
      0
    );
  }

  function initTriangleBuffer() {
    // buffer for point locations
    const triangleVertices = new Float32Array([0.0, 0.5, -0.5, -0.5, 0.5, -0.5]);
    triangleBuf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, triangleBuf);
    gl.bufferData(gl.ARRAY_BUFFER, triangleVertices, gl.STATIC_DRAW);
    triangleBuf.itemSize = 2;
    triangleBuf.numItems = 3;
  
    // buffer for point indices
    const triangleIndices = new Uint16Array([0, 1, 2]);
    triangleIndexBuf = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, triangleIndexBuf);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, triangleIndices, gl.STATIC_DRAW);
    triangleIndexBuf.itemsize = 1;
    triangleIndexBuf.numItems = 3;
  }
  
  function drawTriangle(color, mMatrix) {
    gl.uniformMatrix4fv(uMMatrixLocation, false, mMatrix);
  
    // buffer for point locations
    gl.bindBuffer(gl.ARRAY_BUFFER, triangleBuf);
    gl.vertexAttribPointer(
      aPositionLocation,
      triangleBuf.itemSize,
      gl.FLOAT,
      false,
      0,
      0
    );
  
    // buffer for point indices
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, triangleIndexBuf);
  
    gl.uniform4fv(uColorLoc, color);
  
    // now draw the square
    gl.drawElements(
      TYPE,
      triangleIndexBuf.numItems,
      gl.UNSIGNED_SHORT,
      0
    );
  }

function initSquareBuffer() {
    // buffer for point locations
    const sqVertices = new Float32Array([
      0.5, 0.5, -0.5, 0.5, -0.5, -0.5, 0.5, -0.5,
    ]);
    sqVertexPositionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, sqVertexPositionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, sqVertices, gl.STATIC_DRAW);
    sqVertexPositionBuffer.itemSize = 2;
    sqVertexPositionBuffer.numItems = 4;
  
    // buffer for point indices
    const sqIndices = new Uint16Array([0, 1, 2, 0, 2, 3]);
    sqVertexIndexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, sqVertexIndexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, sqIndices, gl.STATIC_DRAW);
    sqVertexIndexBuffer.itemsize = 1;
    sqVertexIndexBuffer.numItems = 6;
  }

function initShaders() {
    shaderProgram = gl.createProgram();
  
    var vertexShader = vertexShaderSetup(vertexShaderCode);
    var fragmentShader = fragmentShaderSetup(fragShaderCode);
  
    // attach the shaders
    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    //link the shader program
    gl.linkProgram(shaderProgram);
  
    // check for compilation and linking status
    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
      console.log(gl.getShaderInfoLog(vertexShader));
      console.log(gl.getShaderInfoLog(fragmentShader));
    }
  
    //finally use the program.
    gl.useProgram(shaderProgram);
  
    return shaderProgram;
  }

  function drawRiver(){
    mat4.identity(mMatrix);
    pushMatrix(matrixStack, mMatrix);
    mMatrix = mat4.translate(mMatrix, [-0.65, 0.1+gY, 0]);
    mMatrix = mat4.scale(mMatrix, [4, 0.3, 1.0]);
    color = BLUE1;  
    drawSquare(color, mMatrix);


    mMatrix = popMatrix(matrixStack);
    pushMatrix(matrixStack, mMatrix);

    mMatrix = mat4.translate(mMatrix, [-0.7, 0.1+gY, 0]);
    mMatrix = mat4.scale(mMatrix, [0.5, 0.004, 1.0]);
    color = GRAY2;  
    drawSquare(color, mMatrix);

    mMatrix = popMatrix(matrixStack);
    pushMatrix(matrixStack, mMatrix);

    mMatrix = mat4.translate(mMatrix, [0.7, -0.01+gY, 0]);
    mMatrix = mat4.scale(mMatrix, [0.5, 0.004, 1.0]);
    color = GRAY2  
    drawSquare(color, mMatrix);

    mMatrix = popMatrix(matrixStack);
    pushMatrix(matrixStack, mMatrix);

    mMatrix = mat4.translate(mMatrix, [0.1, 0.2+gY, 0]);
    mMatrix = mat4.scale(mMatrix, [0.5, 0.004, 1.0]);
    color = GRAY2;  
    drawSquare(color, mMatrix);

    






  }

  function drawRoad(){
    mat4.identity(mMatrix);
    pushMatrix(matrixStack, mMatrix);
    mMatrix = mat4.translate(mMatrix, [0.45,-0.79 , 0]);
    mMatrix = mat4.rotate(mMatrix, degToRad(55), [0, 0, 1.0]);
    mMatrix = mat4.scale(mMatrix, [1.5, 2, 1.0]);
    
    color = GREEN4;  // Light gray
    drawTriangle(color, mMatrix);
  }

  function drawBushes(){
    mat4.identity(mMatrix);
    pushMatrix(matrixStack, mMatrix);

    mMatrix = mat4.translate(mMatrix, [-0.4, -0.6, 0]);
    mMatrix = mat4.scale(mMatrix, [0.1,0.08, 1.0]);
    color = GREEN1;  // Light gray
    drawCircle(color, mMatrix);

    mat4.identity(mMatrix);
    pushMatrix(matrixStack, mMatrix);

    mMatrix = mat4.translate(mMatrix, [-0.3, -0.6, 0]);
    mMatrix = mat4.scale(mMatrix, [0.06,0.06, 1.0]);
    color = GREEN3;  // Light gray
    drawCircle(color, mMatrix);

    mat4.identity(mMatrix);
    pushMatrix(matrixStack, mMatrix);

    mMatrix = mat4.translate(mMatrix, [-0.9, -0.6, 0]);
    mMatrix = mat4.scale(mMatrix, [0.1*0.8,0.8*0.08, 1.0]);
    color = GREEN1;  // Light gray
    drawCircle(color, mMatrix);

    mat4.identity(mMatrix);
    pushMatrix(matrixStack, mMatrix);

    mMatrix = mat4.translate(mMatrix, [0.95, -0.5, 0]);
    mMatrix = mat4.scale(mMatrix, [0.1*1.1,1.1*0.08, 1.0]);
    color = GREEN3;  // Light gray
    drawCircle(color, mMatrix);

    mat4.identity(mMatrix);
    pushMatrix(matrixStack, mMatrix);

    mMatrix = mat4.translate(mMatrix, [0.85, -0.5, 0]);
    mMatrix = mat4.scale(mMatrix, [0.1,0.08, 1.0]);
    color = GREEN1;  // Light gray
    drawCircle(color, mMatrix);

    mat4.identity(mMatrix);
    pushMatrix(matrixStack, mMatrix);

    mMatrix = mat4.translate(mMatrix, [0, -1.05, 0]);
    mMatrix = mat4.scale(mMatrix, [2*0.1,2*0.08, 1.0]);
    color = GREEN3;  // Light gray
    drawCircle(color, mMatrix);


    mat4.identity(mMatrix);
    pushMatrix(matrixStack, mMatrix);

    mMatrix = mat4.translate(mMatrix, [-0.2, -1.05, 0]);
    mMatrix = mat4.scale(mMatrix, [0.1, 0.08, 1.0]);
    color = GREEN1;  // Light gray
    drawCircle(color, mMatrix);

    mat4.identity(mMatrix);
    pushMatrix(matrixStack, mMatrix);

    mMatrix = mat4.translate(mMatrix, [0.2, -1.05, 0]);
    mMatrix = mat4.scale(mMatrix, [0.1, 0.08, 1.0]);
    color = GREEN1;  // Light gray
    drawCircle(color, mMatrix);

    
  }



  function drawHouse(){
    mat4.identity(mMatrix);
    pushMatrix(matrixStack, mMatrix);
    mMatrix = mat4.translate(mMatrix, [-0.65, -0.3+gY, 0]);
    mMatrix = mat4.scale(mMatrix, [0.4, 0.3, 1.0]);
    color = GRAY3;  // Light gray
    drawSquare(color, mMatrix);

    mMatrix = popMatrix(matrixStack);
    pushMatrix(matrixStack, mMatrix);

    mMatrix = mat4.translate(mMatrix, [-0.65 -0.1, -0.3 + 0.05 + gY, 0]);
    mMatrix = mat4.scale(mMatrix, [0.08, 0.08, 1.0]);
    color = YELLOW2
    drawSquare(color, mMatrix);
    mMatrix = popMatrix(matrixStack);
    pushMatrix(matrixStack, mMatrix);

    mMatrix = mat4.translate(mMatrix, [-0.65 +0.1, -0.3 + 0.05+gY, 0]);
    mMatrix = mat4.scale(mMatrix, [0.08, 0.08, 1.0]);
    color = YELLOW2
    drawSquare(color, mMatrix);


    mMatrix = popMatrix(matrixStack);
    pushMatrix(matrixStack, mMatrix);

    mMatrix = mat4.translate(mMatrix, [-0.65,-0.4+gY, 0]);
    mMatrix = mat4.scale(mMatrix, [0.08, 0.1, 1.0]);
    color = YELLOW2
    drawSquare(color, mMatrix);

    mMatrix = popMatrix(matrixStack);
    pushMatrix(matrixStack, mMatrix);

    mMatrix = mat4.translate(mMatrix, [-0.65,-0.08+gY, 0]);
    mMatrix = mat4.scale(mMatrix, [0.4, 0.2, 1.0]);
    color = RED2
    drawSquare(color, mMatrix);

    mMatrix = popMatrix(matrixStack);
    pushMatrix(matrixStack, mMatrix);

    mMatrix = mat4.translate(mMatrix, [-0.65-0.2,-0.08+gY, 0]);
    mMatrix = mat4.scale(mMatrix, [0.2, 0.2, 1.0]);
    // mMatrix = mat4.
    color = RED2
    drawTriangle(color, mMatrix);  
    
    mMatrix = popMatrix(matrixStack);
    pushMatrix(matrixStack, mMatrix);

    mMatrix = mat4.translate(mMatrix, [-0.65+0.2,-0.08+gY, 0]);
    mMatrix = mat4.scale(mMatrix, [0.2, 0.2, 1.0]);
    // mMatrix = mat4.
    color = RED2
    drawTriangle(color, mMatrix); 









  }

  function drawTree(scale, offX, offY){
    const X = 0+offX
    const Y=0.401+offY+gY
    
    mat4.identity(mMatrix);
    pushMatrix(matrixStack, mMatrix);
    mMatrix = mat4.translate(mMatrix, [X, Y, 0]);
    mMatrix = mat4.scale(mMatrix, [scale*0.02, scale*0.2, 1.0]);
    color = BROWN3;  
    drawSquare(color, mMatrix);


    mat4.identity(mMatrix);
    pushMatrix(matrixStack, mMatrix);
    mMatrix = mat4.translate(mMatrix, [X, Y+0.1, 0]);
    mMatrix = mat4.scale(mMatrix, [scale*0.24, scale*0.16, 1.0]);
    color = GREEN3;  
    drawTriangle(color, mMatrix);

    mat4.identity(mMatrix);
    pushMatrix(matrixStack, mMatrix);
    mMatrix = mat4.translate(mMatrix, [X, Y+0.15, 0]);
    mMatrix = mat4.scale(mMatrix, [scale*0.24, scale*0.16, 1.0]);
    color = GREEN2;  
    drawTriangle(color, mMatrix);

    mat4.identity(mMatrix);
    pushMatrix(matrixStack, mMatrix);
    mMatrix = mat4.translate(mMatrix, [X, Y+0.2, 0]);
    mMatrix = mat4.scale(mMatrix, [scale*0.24, scale*0.16, 1.0]);
    color = GREEN1;

    drawTriangle(color, mMatrix);




    
  }

  function drawCar(){
    const X=-0.6;
    const Y=-0.85;


    mat4.identity(mMatrix);
    pushMatrix(matrixStack, mMatrix);

    mMatrix = mat4.translate(mMatrix, [X, Y+0.055, 0]);
    mMatrix = mat4.scale(mMatrix, [0.5*0.27, 0.5*0.15, 1.0]);
    color = BLUE3;  
    drawCircle(color, mMatrix);


    

    mMatrix = popMatrix(matrixStack);
    pushMatrix(matrixStack, mMatrix);
    mMatrix = mat4.translate(mMatrix, [X-0.1, Y-0.07, 0]);
    mMatrix = mat4.scale(mMatrix, [0.05, 0.05, 1.0]);
    color = BLACK;  
    drawCircle(color, mMatrix);

    mMatrix = popMatrix(matrixStack);
    pushMatrix(matrixStack, mMatrix);
    mMatrix = mat4.translate(mMatrix, [X+0.1, Y-0.07, 0]);
    mMatrix = mat4.scale(mMatrix, [0.05, 0.05, 1.0]);
    color = BLACK;  
    drawCircle(color, mMatrix);


    mMatrix = popMatrix(matrixStack);
    pushMatrix(matrixStack, mMatrix);
    mMatrix = mat4.translate(mMatrix, [X-0.1, Y-0.07, 0]);
    mMatrix = mat4.scale(mMatrix, [0.05*0.8, 0.05*0.8, 1.0]);
    color = GRAY5;  
    drawCircle(color, mMatrix);

    mMatrix = popMatrix(matrixStack);
    pushMatrix(matrixStack, mMatrix);
    mMatrix = mat4.translate(mMatrix, [X+0.1, Y-0.07, 0]);
    mMatrix = mat4.scale(mMatrix, [0.05*0.8, 0.05*0.8, 1.0]);
    color = GRAY5;  
    drawCircle(color, mMatrix);

    mMatrix = popMatrix(matrixStack);
    pushMatrix(matrixStack, mMatrix);
    mMatrix = mat4.translate(mMatrix, [X, Y+0.055, 0]);
    mMatrix = mat4.scale(mMatrix, [0.6*0.3, 0.6*0.12, 1.0]);
    color = GRAY4;  
    drawSquare(color, mMatrix);


    

    mMatrix = popMatrix(matrixStack);
    pushMatrix(matrixStack, mMatrix);
    mMatrix = mat4.translate(mMatrix, [X-0.16, Y, 0]);
    mMatrix = mat4.scale(mMatrix, [0.5*0.2, 0.6*0.15, 1.0]);
    color = BLUE2;  
    drawTriangle(color, mMatrix);



    mMatrix = popMatrix(matrixStack);
    pushMatrix(matrixStack, mMatrix);
    mMatrix = mat4.translate(mMatrix, [X+0.16, Y, 0]);
    mMatrix = mat4.scale(mMatrix, [0.5*0.2, 0.6*0.15, 1.0]);
    color = BLUE2;  
    drawTriangle(color, mMatrix);

    mMatrix = popMatrix(matrixStack);
    pushMatrix(matrixStack, mMatrix);
    mMatrix = mat4.translate(mMatrix, [X, Y, 0]);
    mMatrix = mat4.scale(mMatrix, [0.8*0.4, 0.6*0.15, 1.0]);
    color = BLUE2;  
    drawSquare(color, mMatrix);



  }

  function func (x){
    let X = 1.5
    let p =Math.floor(x/X);
    if(p%2==0){
      return x%X-0.8
    }
    else {
      return X-x%X -0.8
    }
  }

  function drawBoat(off){
    off = func(off)
    const X=0;
    const Y=0.2;
    mat4.identity(mMatrix);
    pushMatrix(matrixStack, mMatrix);


    mMatrix = popMatrix(matrixStack);
    pushMatrix(matrixStack, mMatrix);
    mMatrix = mat4.translate(mMatrix, [off+X, -Y +0.18, 0]);
    mMatrix = mat4.scale(mMatrix, [0.01, 0.3, 1.0]);
    color = BLACK;  
    drawSquare(color, mMatrix);

    mMatrix = popMatrix(matrixStack);
    pushMatrix(matrixStack, mMatrix);
    
    mMatrix = mat4.translate(mMatrix, [off+X+0.1, -Y +0.2, 0]);
    mMatrix = mat4.scale(mMatrix, [0.2, 0.2, 1.0]);
    mMatrix = mat4.rotate(mMatrix, degToRad(270),[0,0,1]);
    color = RED1;  
    drawTriangle(color, mMatrix);

    mMatrix = popMatrix(matrixStack);
    pushMatrix(matrixStack, mMatrix);
    mMatrix = mat4.translate(mMatrix, [off+X, -Y, 0]);
    mMatrix = mat4.scale(mMatrix, [0.6*0.3, 0.6*0.12, 1.0]);
    color = GRAY2;  
    drawSquare(color, mMatrix);


    

    mMatrix = popMatrix(matrixStack);
    pushMatrix(matrixStack, mMatrix);
    mMatrix = mat4.rotate(mMatrix, degToRad(180),[0,0,1]);
    mMatrix = mat4.translate(mMatrix, [-off+X-0.09, Y, 0]);
    mMatrix = mat4.scale(mMatrix, [0.5*0.2, 0.5*0.15, 1.0]);
    
    color = GRAY2;  
    drawTriangle(color, mMatrix);



    mMatrix = popMatrix(matrixStack);
    pushMatrix(matrixStack, mMatrix);
    mMatrix = mat4.rotate(mMatrix, degToRad(180),[0,0,1]);
    mMatrix = mat4.translate(mMatrix, [-off+X+0.09, Y, 0]);
    mMatrix = mat4.scale(mMatrix, [0.5*0.2, 0.5*0.15, 1.0]);
    
    color = GRAY2;  
    drawTriangle(color, mMatrix);

  }

  function drawBoat2(off){
    off = func(off+2)
    const X=0;
    const Y=0.1;
    mat4.identity(mMatrix);
    mMatrix = mat4.scale(mMatrix, [0.7, 0.7, 1.0]);
  
    pushMatrix(matrixStack, mMatrix);


    mMatrix = popMatrix(matrixStack);
    pushMatrix(matrixStack, mMatrix);
    mMatrix = mat4.translate(mMatrix, [off+X, -Y +0.18, 0]);
    mMatrix = mat4.scale(mMatrix, [0.01, 0.3, 1.0]);
    color = BLACK;  
    drawSquare(color, mMatrix);

    mMatrix = popMatrix(matrixStack);
    pushMatrix(matrixStack, mMatrix);
    
    mMatrix = mat4.translate(mMatrix, [off+X+0.1, -Y +0.2, 0]);
    mMatrix = mat4.scale(mMatrix, [0.2, 0.2, 1.0]);
    mMatrix = mat4.rotate(mMatrix, degToRad(270),[0,0,1]);
    color = [0.5, 0.02, 0.8, 1];  
    drawTriangle(color, mMatrix);

    mMatrix = popMatrix(matrixStack);
    pushMatrix(matrixStack, mMatrix);
    mMatrix = mat4.translate(mMatrix, [off+X, -Y, 0]);
    mMatrix = mat4.scale(mMatrix, [0.6*0.3, 0.6*0.12, 1.0]);
    color = GRAY2;  
    drawSquare(color, mMatrix);


    

    mMatrix = popMatrix(matrixStack);
    pushMatrix(matrixStack, mMatrix);
    mMatrix = mat4.rotate(mMatrix, degToRad(180),[0,0,1]);
    mMatrix = mat4.translate(mMatrix, [-off+X-0.09, Y, 0]);
    mMatrix = mat4.scale(mMatrix, [0.5*0.2, 0.5*0.15, 1.0]);
    
    color = GRAY2;  
    drawTriangle(color, mMatrix);



    mMatrix = popMatrix(matrixStack);
    pushMatrix(matrixStack, mMatrix);
    mMatrix = mat4.rotate(mMatrix, degToRad(180),[0,0,1]);
    mMatrix = mat4.translate(mMatrix, [-off+X+0.09, Y, 0]);
    mMatrix = mat4.scale(mMatrix, [0.5*0.2, 0.5*0.15, 1.0]);
    
    color = GRAY2;  
    drawTriangle(color, mMatrix);

  }

  function drawWindmill(scale, offX, offY, offdeg){
    const X = 0.5+ offX;
    const Y = -0.1+offY + gY;    

    scale*=1.8

    mat4.identity(mMatrix);
    pushMatrix(matrixStack, mMatrix);
    mMatrix = mat4.translate(mMatrix, [X, Y+0.02, 0]);
    mMatrix = mat4.scale(mMatrix, [scale*0.012, scale*0.2, 1.0]);
    color = BROWN4;  
    drawSquare(color, mMatrix);

   

    mMatrix = popMatrix(matrixStack);
    // pushMatrix(matrixStack, mMatrix);

    mMatrix = mat4.translate(mMatrix, [X, Y+0.18, 0]);
    // mMatrix = mat4.scale(mMatrix, [scale*0.015,scale*0.1,1]);
    // color = WHITE;  
    // drawTriangle(color, mMatrix);

    let off = 0
    

    for(let i=0;i<4;i++){
      
      pushMatrix(matrixStack, mMatrix);
  
      mMatrix = mat4.rotate(mMatrix, offdeg+degToRad(i*(360/4)-20), [0,0,1])
      // mMatrix = mat4.translate(mMatrix, [X, Y+0.11, 0]);
      mMatrix = mat4.scale(mMatrix, [scale*0.025,scale*0.18,1]);
      
      color = YELLOW1;  
      drawTriangle(color, mMatrix);
      mMatrix = popMatrix(matrixStack);
    }
    mMatrix = popMatrix(matrixStack);
    pushMatrix(matrixStack, mMatrix);

    mMatrix = mat4.translate(mMatrix, [X, Y+0.18, 0]);
    mMatrix = mat4.scale(mMatrix, [scale*0.01,scale*0.01,1]);
    color = BLACK;  
    drawCircle(color, mMatrix);


    // mat4.identity(mMatrix);
    // pushMatrix(matrixStack, mMatrix);
    // mMatrix = mat4.translate(mMatrix, [X, Y+0.1, 0]);
    // mMatrix = mat4.scale(mMatrix, [scale, scale, 1.0]);
    // color = GRAY;  
    // drawCircle(color, mMatrix);



  }

  function drawGround(){
    mat4.identity(mMatrix);
    pushMatrix(matrixStack, mMatrix);
    mMatrix = mat4.translate(mMatrix, [0, -1., 0]);
    mMatrix = mat4.scale(mMatrix, [2,2, 1.0]);
    color = GREEN5;  // Light gray
    drawSquare(color, mMatrix);
  }

  function drawSun(deg){
    mat4.identity(mMatrix);
    pushMatrix(matrixStack, mMatrix);
    mMatrix = mat4.translate(mMatrix, [-0.75, +0.8, 0]);
    mMatrix = mat4.scale(mMatrix, [0.1,0.1, 1.0]);
    color = WHITE;  // Light gray


    drawCircle(color, mMatrix);

    for(let i=0;i<8;i++){
      
      pushMatrix(matrixStack, mMatrix);
  
      mMatrix = mat4.rotate(mMatrix, deg+degToRad(i*(360/8)), [0,0,1])
      // mMatrix = mat4.translate(mMatrix, [X, Y+0.11, 0]);
      mMatrix = mat4.scale(mMatrix, [0.05,3,1]);
      
      color = WHITE;  
      drawSquare(color, mMatrix);
      mMatrix = popMatrix(matrixStack);
    }


    pushMatrix(matrixStack, mMatrix);
    mMatrix = mat4.translate(mMatrix, [-0.75, -2.5, 0]);
    mMatrix = mat4.scale(mMatrix, [2,1, 1.0]);
    color = GRAY1;  // Light gray

    drawCircle(color, mMatrix);

    mMatrix = popMatrix(matrixStack);
    pushMatrix(matrixStack, mMatrix);
    mMatrix = mat4.translate(mMatrix, [1, -2.5, 0]);
    mMatrix = mat4.scale(mMatrix, [0.9*2,0.9*1, 1.0]);
    color = WHITE;  // Light gray

    drawCircle(color, mMatrix);
    mMatrix = popMatrix(matrixStack);
    pushMatrix(matrixStack, mMatrix);
    mMatrix = mat4.translate(mMatrix, [3, -2.5, 0]);
    mMatrix = mat4.scale(mMatrix, [0.6*2,0.6*1, 1.0]);
    color = GRAY2;  // Light gray

    drawCircle(color, mMatrix);





  }

  function drawMountain(){
    const X=0;
    const Y=0.2;
    mat4.identity(mMatrix);
    pushMatrix(matrixStack, mMatrix);

    mMatrix = popMatrix(matrixStack);
    pushMatrix(matrixStack, mMatrix);
    mMatrix = mat4.translate(mMatrix, [X, -Y +0.18, 0]);
    mMatrix = mat4.scale(mMatrix, [2,0.6, 1.0]);
    color = BROWN1;  
    drawTriangle(color, mMatrix);


    
    // pushMatrix(matrixStack, mMatrix);
    mMatrix = mat4.translate(mMatrix, [X-0.3, -Y +0.18, 0]);
    mMatrix = mat4.scale(mMatrix, [1,0.6, 1.0]);
    color = BROWN1;  
    drawTriangle(color, mMatrix);


    mMatrix = mat4.translate(mMatrix, [X+.6, 0, 0]);
    // mMatrix = mat4.scale(mMatrix, [1,0.6, 1.0]);
    color = BROWN1;  
    drawTriangle(color, mMatrix);

    mMatrix = popMatrix(matrixStack);
    mMatrix = mat4.translate(mMatrix, [X-.31, Y-0.164, 0]);
    mMatrix = mat4.rotate(mMatrix, degToRad(-52), [0,0,1]);
    mMatrix = mat4.scale(mMatrix, [0.2,0.8, 1.0]);
   
    color = BROWN2;  
    drawTriangle(color, mMatrix);

    mMatrix = mat4.translate(mMatrix, [-1.5, -0.7,0]);
    mMatrix = mat4.rotate(mMatrix, degToRad(-25), [0,0,1]);
    mMatrix = mat4.translate(mMatrix, [-0.08, 0.015,0]);
    color = BROWN2;  
    drawTriangle(color, mMatrix);





  }

  function drawStars(scale){
    scale = (3+Math.sin(scale/2))*0.3

    mat4.identity(mMatrix);
    pushMatrix(matrixStack, mMatrix);

    mMatrix = mat4.translate(mMatrix, [0.4, 0.7, 0]);


    for(let i=0;i<4;i++){
      pushMatrix(matrixStack, mMatrix);
      mMatrix = mat4.rotate(mMatrix, degToRad(90*(i)), [0,0,1])   
      mMatrix = mat4.scale(mMatrix, [scale*0.1*0.2, scale*0.1*0.8, 1.0]);

      mMatrix = mat4.translate(mMatrix, [0, 0.5, 0]);
      color = WHITE;
      // color = [BLUE,RED,BLACK,DARKGREEN][i];  
      console.log(i);
      drawTriangle(color, mMatrix);
      mMatrix = popMatrix(matrixStack);

    }

    mat4.identity(mMatrix);
    pushMatrix(matrixStack, mMatrix);

    mMatrix = mat4.translate(mMatrix, [0.6, 0.9, 0]);
    for(let i=0;i<4;i++){
      pushMatrix(matrixStack, mMatrix);
      mMatrix = mat4.rotate(mMatrix, degToRad(90*(i)), [0,0,1])   
      mMatrix = mat4.scale(mMatrix, [scale*0.05*0.2,scale*0.05*0.8, 1.0]);

      mMatrix = mat4.translate(mMatrix, [0, 0.5, 0]);
      color = WHITE;
      // color = [BLUE,RED,BLACK,DARKGREEN][i];  
      console.log(i);
      drawTriangle(color, mMatrix);
      mMatrix = popMatrix(matrixStack);

    }

    mat4.identity(mMatrix);
    pushMatrix(matrixStack, mMatrix);

    mMatrix = mat4.translate(mMatrix, [-0.3, 0.7, 0]);
    for(let i=0;i<4;i++){
      pushMatrix(matrixStack, mMatrix);
      mMatrix = mat4.rotate(mMatrix, degToRad(90*(i)), [0,0,1])   
      mMatrix = mat4.scale(mMatrix, [scale*0.05*0.2,scale*0.05*0.8, 1.0]);

      mMatrix = mat4.translate(mMatrix, [0, 0.5, 0]);
      color = WHITE;
      // color = [BLUE,RED,BLACK,DARKGREEN][i];  
      console.log(i);
      drawTriangle(color, mMatrix);
      mMatrix = popMatrix(matrixStack);

    }

    mat4.identity(mMatrix);
    pushMatrix(matrixStack, mMatrix);

    mMatrix = mat4.translate(mMatrix, [-0.1, 0.6, 0]);
    for(let i=0;i<4;i++){
      pushMatrix(matrixStack, mMatrix);
      mMatrix = mat4.rotate(mMatrix, degToRad(90*(i)), [0,0,1])   
      mMatrix = mat4.scale(mMatrix, [scale*0.04*0.2,scale*0.04*0.8, 1.0]);

      mMatrix = mat4.translate(mMatrix, [0, 0.5, 0]);
      color = WHITE;
      // color = [BLUE,RED,BLACK,DARKGREEN][i];  
      console.log(i);
      drawTriangle(color, mMatrix);
      mMatrix = popMatrix(matrixStack);

    }

    mat4.identity(mMatrix);
    pushMatrix(matrixStack, mMatrix);

    mMatrix = mat4.translate(mMatrix, [-0.17, 0.4, 0]);
    for(let i=0;i<4;i++){
      pushMatrix(matrixStack, mMatrix);
      mMatrix = mat4.rotate(mMatrix, degToRad(90*(i)), [0,0,1])   
      mMatrix = mat4.scale(mMatrix, [scale*0.02*0.2,scale*0.02*0.8, 1.0]);

      mMatrix = mat4.translate(mMatrix, [0, 0.5, 0]);
      color = WHITE;
      // color = [BLUE,RED,BLACK,DARKGREEN][i];  
      console.log(i);
      drawTriangle(color, mMatrix);
      mMatrix = popMatrix(matrixStack);

    }
    // mMatrix = mat4.rotate(mMatrix, degToRad(-52), [0,0,1]);

    


  }
  function drawScene() {
    gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
    gl.clearColor(0.1, 0.1, 0.1, 1.0);  // Dark gray background
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    let windeg=0;
    let sundeg = 0;
    starscale=0;
    boat =0;
    let animate = function(){

      gl.clearColor(0, 0, 0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
      drawMountain()
      drawGround()
      drawRoad()
      drawBushes();
      
      drawRiver()
      drawHouse()
      drawCar()
      let x = 0.2
      let y= 0.1
      boat+=0.003
      
      // gl.clear(gl.COLOR_BUFFER_BIT);
      drawTree(1.5,0.2+ 0.6,0);
      drawTree(2, 0.2+ 0.4,0.07);
      drawTree(1.5, 0.2+0.2,0);

      windeg+=0.02
      drawBoat2(boat)
      drawBoat(boat)
      drawWindmill(1,x+0,y-0.1, -windeg)
      drawWindmill(0.8,x+ -0.2,y-0, -windeg)
      
      sundeg+=0.005
      drawSun(sundeg);
      starscale+=0.1
      drawStars(starscale);

      animation = window.requestAnimationFrame(animate);
    }

    animate();
  
    // mat4.identity(mMatrix);
  
    // // Draw a house
    // pushMatrix(matrixStack, mMatrix);
    // mMatrix = mat4.translate(mMatrix, [-0.5, -0.3, 0]);
    // mMatrix = mat4.scale(mMatrix, [0.4, 0.4, 1.0]);
    
    // // House body
    // color = [0.8, 0.8, 0.8, 1];  // Light gray
    // drawSquare(color, mMatrix);
    
    // // Roof
    // pushMatrix(matrixStack, mMatrix);
    // mMatrix = mat4.translate(mMatrix, [0, 0.5, 0]);
    // mMatrix = mat4.scale(mMatrix, [1, 0.5, 1]);
    // color = [0.8, 0.2, 0.2, 1];  // Red
    // drawTriangle(color, mMatrix);
    // mMatrix = popMatrix(matrixStack);
    
    // mMatrix = popMatrix(matrixStack);
  
    // // Draw a tree
    // pushMatrix(matrixStack, mMatrix);
    // mMatrix = mat4.translate(mMatrix, [0.5, -0.3, 0]);
    
    // // Tree trunk
    // pushMatrix(matrixStack, mMatrix);
    // mMatrix = mat4.scale(mMatrix, [0.1, 0.4, 1]);
    // color = [0.5, 0.3, 0.2, 1];  // Brown
    // drawSquare(color, mMatrix);
    // mMatrix = popMatrix(matrixStack);
    
    // // Tree top
    // mMatrix = mat4.translate(mMatrix, [0, 0.2, 0]);
    // mMatrix = mat4.scale(mMatrix, [0.3, 0.3, 1]);
    // color = [0.1, 0.6, 0.1, 1];  // Green
    // drawTriangle(color, mMatrix);
    
    // mMatrix = popMatrix(matrixStack);
    // // gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
    // // gl.clearColor(0, 0, 0, 1.0);
    // // gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  
    // // initialize the model matrix to identity matrix
    // mat4.identity(mMatrix);
  
    // // This translation applies to both the objects below
    // mMatrix = mat4.translate(mMatrix, [0.0, 0.2, 0]);
  
    // pushMatrix(matrixStack, mMatrix);
    // color = [0.8, 0, 0, 1];
    // // //local rotation operation for the square
    // mMatrix = mat4.rotate(mMatrix, degToRad(20), [0, 0, 1]);
    // // //local scale operation for the square
    // mMatrix = mat4.scale(mMatrix, [0.5, 1, 1.0]);
    // drawSquare(color, mMatrix);
    // mMatrix = popMatrix(matrixStack);
  
    // pushMatrix(matrixStack, mMatrix);
    // // //local translation operation for the circle
    // mMatrix = mat4.translate(mMatrix, [0.2, 0.0, 0]);
    // // //local scale operation for the circle
    // mMatrix = mat4.scale(mMatrix, [1.0, 0.5, 1.0]);
    // color = [0.4, 0.9, 0, 1];
    // drawTriangle(color, mMatrix);
    // mMatrix = popMatrix(matrixStack);
  }

  let renderMode = 'fill'; 

  function setRenderMode(mode) {
    renderMode = mode;
    drawScene();
  }

  function drawShape(drawFunction, color, mMatrix) {
    gl.uniformMatrix4fv(uMMatrixLocation, false, mMatrix);
    gl.uniform4fv(uColorLoc, color);
  
    switch (renderMode) {
      case 'fill':
        drawFunction();
        break;
      case 'wireframe':
        gl.lineWidth(1);
        gl.drawArrays(gl.LINE_LOOP, 0, drawFunction.numVertices);
        break;
      case 'point':
        gl.drawArrays(gl.POINTS, 0, drawFunction.numVertices);
        break;
    }
  }

  function drawSquare(color, mMatrix) {
    gl.bindBuffer(gl.ARRAY_BUFFER, sqVertexPositionBuffer);
    gl.vertexAttribPointer(aPositionLocation, sqVertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);
    
    drawShape(() => {
      gl.drawElements(TYPE, sqVertexIndexBuffer.numItems, gl.UNSIGNED_SHORT, 0);
    }, color, mMatrix);
  }
  drawSquare.numVertices = 4;
  
  function drawTriangle(color, mMatrix) {
    gl.bindBuffer(gl.ARRAY_BUFFER, triangleBuf);
    gl.vertexAttribPointer(aPositionLocation, triangleBuf.itemSize, gl.FLOAT, false, 0, 0);
    
    drawShape(() => {
      gl.drawElements(TYPE, triangleIndexBuf.numItems, gl.UNSIGNED_SHORT, 0);
    }, color, mMatrix);
  }
  drawTriangle.numVertices = 3;
  
  function drawCircle(color, mMatrix) {
    gl.bindBuffer(gl.ARRAY_BUFFER, circleBuf);
    gl.vertexAttribPointer(aPositionLocation, circleBuf.itemSize, gl.FLOAT, false, 0, 0);
    
    drawShape(() => {
      gl.drawElements(TYPE, circleIndexBuf.numItems, gl.UNSIGNED_SHORT, 0);
    }, color, mMatrix);
  }
  drawCircle.numVertices = circleBuf.numItems;
  

function webGLStart() {
    var canvas = document.getElementById("scene");
    initGL(canvas);
    shaderProgram = initShaders();
  
    //get locations of attributes declared in the vertex shader
    const aPositionLocation = gl.getAttribLocation(shaderProgram, "aPosition");
  
    uMMatrixLocation = gl.getUniformLocation(shaderProgram, "uMMatrix");
  
    //enable the attribute arrays
    gl.enableVertexAttribArray(aPositionLocation);
    TYPE = gl.TRIANGLES
    // gl.lineWidth(1);
    // // gl.drawArrays(gl.LINE_LOOP, 0, 1);
    // gl.drawArrays(gl.POINTS, 0, 0);
  
    uColorLoc = gl.getUniformLocation(shaderProgram, "color");
  
    initSquareBuffer();
    initTriangleBuffer();
    initCircleBuffer(50);

    const container = document.createElement('div');
    // const createButton = (label, mode) => {
    //   const button = document.createElement('button');
    //   button.textContent = label;
    //   button.onclick = () => (mode);
    //   container.appendChild(button);
    // };
  
    // createButton('Fill', 'POINTS');
    // createButton('Wireframe', 'wireframe');
    // createButton('Point', 'point');
    
    const fill = document.createElement('button');
    fill.textContent = 'Solid View'
    fill.onclick = () => TYPE = gl.TRIANGLES
    container.appendChild(fill)

    const wirefram = document.createElement('button');
    wirefram.textContent = 'Wireframe View'
    wirefram.onclick = () => TYPE = gl.LINES
    container.appendChild(wirefram)

    const point = document.createElement('button');
    point.textContent = 'Point View'
    point.onclick = () => TYPE = gl.POINTS
    container.appendChild(point)
  
  
  
    document.body.appendChild(container);
    
  
    drawScene();

  }

