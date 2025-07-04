// ColoredPoint.js (c) 2012 matsuda
// Vertex shader program
var VSHADER_SOURCE = `
precision mediump float;
attribute vec4 a_Position;
attribute vec2 a_UV;
varying vec2 v_UV;
uniform mat4 u_ModelMatrix;
uniform mat4 u_GlobalRotateMatrix;
uniform mat4 u_ViewMatrix;
uniform mat4 u_ProjectionMatrix;
void main() {
    gl_Position = u_ProjectionMatrix * u_ViewMatrix * u_GlobalRotateMatrix * u_ModelMatrix * a_Position;
    v_UV = a_UV;
}
`;


// Fragment shader program
var FSHADER_SOURCE = `
precision mediump float;
varying vec2 v_UV;
uniform vec4 u_FragColor;
uniform sampler2D u_Sampler0;
uniform sampler2D u_Sampler1;
uniform sampler2D u_Sampler2;
uniform sampler2D u_Sampler3;
uniform int u_whichTexture;
void main() {
    if (u_whichTexture == -2) {
        gl_FragColor = u_FragColor;               // Use color
    } else if (u_whichTexture == -1) {
        gl_FragColor = vec4(v_UV, 1.0, 1.0);       // Use UV debug color
    } else if (u_whichTexture == 0) {
        gl_FragColor = texture2D(u_Sampler0, v_UV); // Use texture0
    } else if (u_whichTexture == 1) {
        gl_FragColor = texture2D(u_Sampler1, v_UV); // Use texture1
    } else if (u_whichTexture == 2) {
      gl_FragColor = texture2D(u_Sampler2, v_UV);   // Use texture2
    }
    else if (u_whichTexture == 3) {
        gl_FragColor = texture2D(u_Sampler3, v_UV);   // Use texture3
    }
    else if (u_whichTexture == 4) {
        gl_FragColor = vec4(0.58, 0.76, 0.34, 1.0);   // Grassy green
    }
}
`;

// Global Variables
let canvas;
let gl;
let a_Position;
let a_UV;
let u_FragColor;
let u_Size;
let u_ModelMatrix;
let u_ProjectionMatrix;
let u_ViewMatrix;
let u_GlobalRotateMatrix;
let u_Sampler0;
let u_Sampler1;
let u_Sampler2;
let u_Sampler3;
let u_whichTexture;

// Global texture variables
let g_texture0 = null;
let g_texture1 = null;
let g_texture2 = null;
let g_texture3 = null;

function setupWebGL() {
  // Retrieve <canvas> element
  canvas = document.getElementById('webgl');

  // prevent lag and improve performance
  gl = canvas.getContext("webgl", { preserveDrawingBuffer: true });

  gl.enable(gl.DEPTH_TEST);
  if (!gl) {
    console.log('Failed to get the rendering context for WebGL');
    return;
  }

}

function connectVariablesToGSL() {
  // Initialize shaders
  if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
    console.log('Failed to intialize shaders.');
    return;
  }

  // Get the storage location of a_Position
  a_Position = gl.getAttribLocation(gl.program, 'a_Position');
  if (a_Position < 0) {
    console.log('Failed to get the storage location of a_Position');
    return;
  }

  // Get the storage location of a_UV
  a_UV = gl.getAttribLocation(gl.program, 'a_UV');
  if (a_UV < 0) {
    console.log('Failed to get the storage location of a_UV');
    return;
  }

  // Get the storage location of u_FragColor
  u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');
  if (!u_FragColor) {
    console.log('Failed to get the storage location of u_FragColor');
    return;
  }

  // Get the storage location of u_ModelMatrix
  u_ModelMatrix = gl.getUniformLocation(gl.program, 'u_ModelMatrix');
  if (!u_ModelMatrix) {
    console.log('Failed to get the storage location of u_ModelMatrix');
    return;
  }

  // Get the storage location of u_GlobalRotateMatrix
  u_GlobalRotateMatrix = gl.getUniformLocation(gl.program, 'u_GlobalRotateMatrix');
  if (!u_GlobalRotateMatrix) {
    console.log('Failed to get the storage location of u_GlobalRotateMatrix');
    return;
  }

  // Get the storage location of u_ViewMatrix
  u_ViewMatrix = gl.getUniformLocation(gl.program, 'u_ViewMatrix');
  if (!u_ViewMatrix) {
    console.log('Failed to get the storage location of u_ViewMatrix');
    return;
  }

  // Get the storage location of u_ProjectionMatrix
  u_ProjectionMatrix = gl.getUniformLocation(gl.program, 'u_ProjectionMatrix');
  if (!u_ProjectionMatrix) {
    console.log('Failed to get the storage location of u_ProjectionMatrix');
    return;
  }

  // Get the storage location of u_Sampler0
  u_Sampler0 = gl.getUniformLocation(gl.program, 'u_Sampler0');
  if (!u_Sampler0) {
    console.log('Failed to get the storage location of u_Sampler0');
    return;
  }

  // Get the storage location of u_Sampler1
  u_Sampler1 = gl.getUniformLocation(gl.program, 'u_Sampler1');
  if (!u_Sampler1) {
    console.log('Failed to get the storage location of u_Sampler1');
    return;
  }

  // Get the storage location of u_Sampler2
  u_Sampler2 = gl.getUniformLocation(gl.program, 'u_Sampler2');
  if (!u_Sampler2) {
    console.log('Failed to get the storage location of u_Sampler2');
    return;
  }

  // Get the storage location of u_Sampler3
  u_Sampler3 = gl.getUniformLocation(gl.program, 'u_Sampler3');
  if (!u_Sampler3) {
    console.log('Failed to get the storage location of u_Sampler3');
    return;
  }

  // Get the storage location of u_whichTexture
  u_whichTexture = gl.getUniformLocation(gl.program, 'u_whichTexture');
  if (!u_whichTexture) {
    console.log('Failed to get the storage location of u_whichTexture');
    return;
  }

  // Set an initial value for this matrix to identity
  var identityM = new Matrix4();
  gl.uniformMatrix4fv(u_ModelMatrix, false, identityM.elements);
}

// Global Variables related to UI
let g_globalAngle = 0;
let g_globalAngleX = 0;
let g_globalAngleY = 0;
let g_isMouseDown = false;
let g_lastMouseX = 0;
let g_lastMouseY = 0;

let BASE_YELLOW_ANGLE = 45;

// arms animation
let g_upperArmAngle = 45;
let g_lowerArmAngle = 0;
let g_upperArmAnimation = false;
let g_lowerArmAnimation = false;

// global animation
let g_headAnimation = 0;
let g_leftLegAnimation = 0;
let g_rightLegAnimation = 0;
let g_leftFootAnimation = 0;
let g_rightFootAnimation = 0;
let g_globalAnimation = true;

// poke animation
let g_pokeAnimation = false;
let g_jumpHeight = 0;

// setup actions for HTML UI elements
function addActionsForHtmlUI() {

  // upper arm animation
  document.getElementById('animationUpperArmOffButton').onclick = function () { g_upperArmAnimation = false; };
  document.getElementById('animationUpperArmOnButton').onclick = function () { g_upperArmAnimation = true; };

  // lower arm animation
  document.getElementById('animationLowerArmOffButton').onclick = function () { g_lowerArmAnimation = false; };
  document.getElementById('animationLowerArmOnButton').onclick = function () { g_lowerArmAnimation = true; };

  // global animation
  document.getElementById('animationGlobalOnButton').onclick = function () { g_globalAnimation = true; };
  document.getElementById('animationGlobalOffButton').onclick = function () { g_globalAnimation = false; };

  // Size Slider Events
  document.getElementById('upperArmSlide').addEventListener('mousemove', function () { g_upperArmAngle = this.value; renderScene(); });
  document.getElementById('lowerArmSlide').addEventListener('mousemove', function () { g_lowerArmAngle = this.value; renderScene(); });
  document.getElementById('angleSlide').addEventListener('mousemove', function () { g_globalAngle = this.value; g_globalAngleY = 0; renderScene(); });
}

function initTextures(gl, n) {

  var image = new Image(); // Create the image object
  if (!image) {
    console.log('Failed to create the image object');
    return false;
  }

  if (n == 0) {
    // Register the event handler to be called on loading an image
    image.onload = function () { sendImageToTEXTURE0(image); };

    // Tell the browser to load an image
    image.src = 'sky.jpg';
  } else if (n == 1) {
    // Register the event handler to be called on loading an image
    image.onload = function () { sendImageToTEXTURE1(image); };

    // Tell the browser to load an image
    image.src = 'mc.jpg';
  } else if (n == 2) {
    // Register the event handler to be called on loading an image
    image.onload = function () { sendImageToTEXTURE2(image); };

    // Tell the browser to load an image
    image.src = 'stone.jpg';
  } else if (n == 3) {
    // Register the event handler to be called on loading an image
    image.onload = function () { sendImageToTEXTURE3(image); };

    // Tell the browser to load an image
    image.src = 'water.jpg';
  }
  return true;
}

function sendImageToTEXTURE0(image) {
  // Create a texture object if it doesn't exist
  if (!g_texture0) {
    g_texture0 = gl.createTexture();
    if (!g_texture0) {
      console.log('Failed to create the texture object');
      return false;
    }
  }

  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1); // Flip the image's y axis

  // Enable texture unit 0
  gl.activeTexture(gl.TEXTURE0);

  // Bind the texture object to the target
  gl.bindTexture(gl.TEXTURE_2D, g_texture0);

  // Set the texture parameters
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);

  // Set the texture image
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);

  // Set the texture unit 0 to the sampler
  gl.uniform1i(u_Sampler0, 0);

  console.log('finished loadTexture0');
}

function sendImageToTEXTURE1(image) {
  // Create a texture object if it doesn't exist
  if (!g_texture1) {
    g_texture1 = gl.createTexture();
    if (!g_texture1) {
      console.log('Failed to create the texture object');
      return false;
    }
  }

  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1); // Flip the image's y axis

  // Enable texture unit 1
  gl.activeTexture(gl.TEXTURE1);

  // Bind the texture object to the target
  gl.bindTexture(gl.TEXTURE_2D, g_texture1);

  // Set the texture parameters
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);

  // Set the texture image
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);

  // Set the texture unit 1 to the sampler
  gl.uniform1i(u_Sampler1, 1);

  console.log('finished loadTexture1');
}

function sendImageToTEXTURE2(image) {
  // Create a texture object if it doesn't exist
  if (!g_texture2) {
    g_texture2 = gl.createTexture();
    if (!g_texture2) {
      console.log('Failed to create the texture object');
      return false;
    }
  }

  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1); // Flip the image's y axis

  // Enable texture unit 2
  gl.activeTexture(gl.TEXTURE2);

  // Bind the texture object to the target
  gl.bindTexture(gl.TEXTURE_2D, g_texture2);

  // Set the texture parameters
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);

  // Set the texture image
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);

  // Set the texture unit 2 to the sampler
  gl.uniform1i(u_Sampler2, 2);

  console.log('finished loadTexture2');
}

function sendImageToTEXTURE3(image) {
  // Create a texture object if it doesn't exist
  if (!g_texture3) {
    g_texture3 = gl.createTexture();
    if (!g_texture3) {
      console.log('Failed to create the texture object');
      return false;
    }
  }

  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1); // Flip the image's y axis

  // Enable texture unit 3
  gl.activeTexture(gl.TEXTURE3);

  // Bind the texture object to the target
  gl.bindTexture(gl.TEXTURE_2D, g_texture3);

  // Set the texture parameters
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);

  // Set the texture image
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);

  // Set the texture unit 3 to the sampler
  gl.uniform1i(u_Sampler3, 3);

  console.log('finished loadTexture3');
}


function main() {

  // setup canvas and gl variables
  setupWebGL();

  // setup gsl shader programs and connect variables
  connectVariablesToGSL();

  // setup actions for HTML UI elements
  addActionsForHtmlUI();

  // Register function (event handler) to be called on a mouse press
  canvas.onmousedown = mousedown;

  canvas.onmousemove = mousemove;

  canvas.onmouseup = mouseup;

  // Prevent context menu on right click
  canvas.addEventListener('contextmenu', function (e) {
    e.preventDefault();
  });

  canvas.addEventListener('mousedown', handleMouseClick);

  document.onkeydown = keydown;

  // initialize both textures
  initTextures(gl, 0);  // First texture (sky.jpg)
  initTextures(gl, 1);  // Second texture (mc.jpg)
  initTextures(gl, 2);  // Third texture (stone.jpg)
  initTextures(gl, 3);  // Fourth texture (grass.jpg)

  // specify the color for clearing <canvas>
  gl.clearColor(0.0, 0.0, 0.0, 1.0);

  // renderScene();
  requestAnimationFrame(tick);
}

var g_startTime = performance.now() / 1000.0;
var g_seconds = performance.now() / 1000.0 - g_startTime;

// called by browser repeatedly whenever it's time
function tick() {

  // print some debug information so we know we are running
  g_seconds = performance.now() / 1000.0 - g_startTime;

  // update animation angles
  updateAnimationAngles();

  // draw everything
  renderScene();

  // tell the browser to update again when it has time
  requestAnimationFrame(tick);
}

function mousedown(ev) {
  if (ev.shiftKey) {
    g_pokeAnimation = g_pokeAnimation ? false : true;
    if (g_pokeAnimation) {
      document.getElementById('pokeText').style.display = 'block';;
    }
    else {
      document.getElementById('pokeText').style.display = 'none';
    }
  }

  g_isMouseDown = true;
  g_lastMouseX = ev.clientX;
  g_lastMouseY = ev.clientY;
}

function mouseup(ev) {
  g_isMouseDown = false;
}

function mousemove(ev) {
  if (g_isMouseDown) {
    let deltaX = ev.clientX - g_lastMouseX;
    let deltaY = ev.clientY - g_lastMouseY;

    // rotate camera based on mouse movement
    if (deltaX > 0) {
      g_camera.rotateRight();
    } else if (deltaX < 0) {
      g_camera.rotateLeft();
    }

    // tilt camera up/down based on vertical mouse movement
    if (deltaY > 0) {
      g_camera.tiltDown();
    } else if (deltaY < 0) {
      g_camera.tiltUp();
    }

    g_lastMouseX = ev.clientX;
    g_lastMouseY = ev.clientY;
    renderScene();
  }
}

function handleMouseClick(event) {
  if (event.button === 2) event.preventDefault();

  const rect = canvas.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;

  const clipX = (x / canvas.width) * 2 - 1;
  const clipY = (canvas.height - y) / canvas.height * 2 - 1;

  const projMat = new Matrix4();
  projMat.setPerspective(50, canvas.width / canvas.height, 1, 100);
  const viewMat = new Matrix4();
  viewMat.setLookAt(
    g_camera.eye.x, g_camera.eye.y, g_camera.eye.z,
    g_camera.at.x, g_camera.at.y, g_camera.at.z,
    g_camera.up.x, g_camera.up.y, g_camera.up.z
  );

  const inverse = new Matrix4();
  inverse.set(projMat);
  inverse.multiply(viewMat);
  inverse.invert();

  const clipCoords = new Vector4([clipX, clipY, -1, 1]);
  const worldCoords = inverse.multiplyVector4(clipCoords);
  const dir = new Vector(
    worldCoords.elements[0] - g_camera.eye.x,
    worldCoords.elements[1] - g_camera.eye.y,
    worldCoords.elements[2] - g_camera.eye.z
  );
  const worldRay = {
    origin: g_camera.eye,
    dir: dir.divide(dir.length())
  };

  const hit = raycastGrid(worldRay);
  if (!hit) return;

  const { x: gx, y: gy } = hit;

  // left click
  if (event.button === 0) {
    g_map[gx][gy] = Math.min(g_map[gx][gy] + 1, 4); // setting max stack height to 4
  }
  // right click
  else if (event.button === 2) {
    g_map[gx][gy] = Math.max(g_map[gx][gy] - 1, 0); // decrease height
  }

  renderScene();
}



function raycastGrid(ray) {
  const gridSize = 0.3;
  let closest = null;
  let minT = Infinity;

  //check intersection with existing blocks
  for (let x = 0; x < g_map.length; x++) {
    for (let y = 0; y < g_map[0].length; y++) {
      for (let z = 0; z < g_map[x][y]; z++) {
        const center = {
          x: (x + 4) * gridSize,
          y: -0.75 + z * gridSize,
          z: (y + 4) * gridSize
        };

        const t = intersectRayBox(ray, center, gridSize / 2);
        if (t !== false && t < minT) {
          closest = { x, y, z };
          minT = t;
        }
      }
    }
  }

  // if no block hit, intersect with ground plane
  if (!closest) {
    const t = ( -0.75 - ray.origin.y ) / ray.dir.y;
    if (t > 0) {
      const hitX = ray.origin.x + t * ray.dir.x;
      const hitZ = ray.origin.z + t * ray.dir.z;

      const gx = Math.floor(hitX / gridSize - 4);
      const gy = Math.floor(hitZ / gridSize - 4);

      if (gx >= 0 && gx < g_map.length && gy >= 0 && gy < g_map[0].length) {
        return { x: gx, y: gy, z: 0 };
      }
    }
  }

  return closest;
}



function intersectRayBox(ray, center, halfSize) {
  const boundsMin = {
    x: center.x - halfSize,
    y: center.y - halfSize,
    z: center.z - halfSize
  };
  const boundsMax = {
    x: center.x + halfSize,
    y: center.y + halfSize,
    z: center.z + halfSize
  };

  let tmin = (boundsMin.x - ray.origin.x) / ray.dir.x;
  let tmax = (boundsMax.x - ray.origin.x) / ray.dir.x;
  if (tmin > tmax) [tmin, tmax] = [tmax, tmin];

  let tymin = (boundsMin.y - ray.origin.y) / ray.dir.y;
  let tymax = (boundsMax.y - ray.origin.y) / ray.dir.y;
  if (tymin > tymax) [tymin, tymax] = [tymax, tymin];

  if ((tmin > tymax) || (tymin > tmax)) return false;
  if (tymin > tmin) tmin = tymin;
  if (tymax < tmax) tmax = tymax;

  let tzmin = (boundsMin.z - ray.origin.z) / ray.dir.z;
  let tzmax = (boundsMax.z - ray.origin.z) / ray.dir.z;
  if (tzmin > tzmax) [tzmin, tzmax] = [tzmax, tzmin];

  if ((tmin > tzmax) || (tzmin > tmax)) return false;
  return tmin; // Rrturn tmin for closest hit
}


function updateAnimationAngles() {
  if (g_pokeAnimation) {
    // Poke animation crazy movement
    g_upperArmAngle = BASE_YELLOW_ANGLE + 80 * Math.sin(g_seconds * 10);
    g_lowerArmAngle = 30 * Math.sin(g_seconds * 12);
    g_headAnimation = 20 * Math.sin(g_seconds * 8);
    g_leftLegAnimation = 30 * Math.sin(g_seconds * 6);
    g_rightLegAnimation = -30 * Math.sin(g_seconds * 6);
    g_leftFootAnimation = 15 * Math.sin(g_seconds * 7);
    g_rightFootAnimation = -15 * Math.sin(g_seconds * 7);

    // jump height
    g_jumpHeight = 0.2 * Math.abs(Math.sin(g_seconds * 10));
  }
  // simple animation
  else {
    if (g_upperArmAnimation) {
      g_upperArmAngle = (45 * Math.sin(g_seconds)) + BASE_YELLOW_ANGLE;
    }
    if (g_lowerArmAnimation) {
      g_lowerArmAngle = (-10 * Math.sin(3 * g_seconds));
    }

    if (g_globalAnimation) {
      g_headAnimation = 10 * Math.sin(g_seconds * 2);
      g_leftLegAnimation = 20 * Math.sin(g_seconds);
      g_rightLegAnimation = -20 * Math.sin(g_seconds);
      g_leftFootAnimation = 10 * Math.sin(g_seconds * 1.5);
      g_rightFootAnimation = -10 * Math.sin(g_seconds * 1.5);
    }
    else {
      g_headAnimation = 0;
      g_leftLegAnimation = 0;
      g_rightLegAnimation = 0;
      g_leftFootAnimation = 0;
      g_rightFootAnimation = 0;
    }

    //no jumping during normal animation
    g_jumpHeight = 0;
  }
}

var g_eye = [0, 0, 3];
var g_at = [0, 0, -100];
var g_up = [0, 1, 0];

function keydown(ev) {
  if (ev.keyCode == 87) {
    g_camera.forward();
  } else if (ev.keyCode == 83) {
    g_camera.back();
  } else if (ev.keyCode == 68) {
    g_camera.right();
  } else if (ev.keyCode == 65) {
    g_camera.left();
  } else if (ev.keyCode == 69) {
    g_camera.rotateRight();
  } else if (ev.keyCode == 81) {
    g_camera.rotateLeft();
  }

  renderScene();
  console.log(ev.keyCode);
}

var g_camera = new Camera();

var g_map = [
  [4, 0, 1, 2, 0, 2, 1, 1],
  [1, 0, 0, 3, 0, 0, 0, 1],
  [0, 0, 0, 1, 0, 0, 0, 1],
  [0, 0, 0, 1, 0, 0, 0, 1],
  [0, 0, 0, 3, 0, 0, 0, 0],
  [0, 0, 0, 2, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 4],
  [1, 1, 3, 0, 0, 0, 0, 2],
];

function drawMap() {
  var body = new Cube();
  body.textureNum = 1;
  for (x = 0; x < 8; x++) {
    for (y = 0; y < 8; y++) {
      if (g_map[x][y] >= 1) {
        for (let i = 0; i < g_map[x][y]; i++) {
          matrix = new Matrix4();
          matrix.translate(0, -0.75 + i * 0.3, 0);
          matrix.scale(0.3, 0.3, 0.3);
          matrix.translate(x + 4, 0, y + 4);
          body.drawCube(matrix, [1.0, 1.0, 1.0, 1.0]);
        }
      }
    }
  }
}

function renderScene() {

  // Check the time at the start of this function
  var startTime = performance.now();

  // Pass the projection matrix
  var projMat = new Matrix4();
  projMat.setPerspective(50, 1 * canvas.width / canvas.height, 1, 100);
  gl.uniformMatrix4fv(u_ProjectionMatrix, false, projMat.elements);

  // Pass the view matrix
  var viewMat = new Matrix4();
  viewMat.setLookAt(
    g_camera.eye.x, g_camera.eye.y, g_camera.eye.z,
    g_camera.at.x, g_camera.at.y, g_camera.at.z,
    g_camera.up.x, g_camera.up.y, g_camera.up.z
  );

  gl.uniformMatrix4fv(u_ViewMatrix, false, viewMat.elements);

  // Pass the matrix to u_ModelMatrix attribute
  var globalRotMat = new Matrix4();
  globalRotMat.rotate(g_globalAngleX, 1, 0, 0);
  globalRotMat.rotate(g_globalAngle + g_globalAngleY, 0, 1, 0);
  gl.uniformMatrix4fv(u_GlobalRotateMatrix, false, globalRotMat.elements);

  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  var FM = new Matrix4();
  var SM = new Matrix4();
  var H1 = new Matrix4();
  var H2 = new Matrix4();
  var L = new Matrix4();

  drawMap();

  // Draw the floor
  var floor = new Cube();
  floor.textureNum = 4;
  FM.translate(0, -0.75, 0.0);
  FM.scale(10, 0, 10);
  FM.translate(-0.5, 0, -0.5);
  floor.drawCube(FM, [1.0, 0.0, 0.0, 0.0, 1.0]);

  // Draw the sky
  var sky = new Cube();
  sky.textureNum = 0;
  SM.scale(50, 50, 50);
  SM.translate(-0.5, -0.5, -0.5);
  sky.drawCube(SM, [1.0, 0.0, 0.0, 0.0, 1.0]);

  // Draw the hill 1
  var hill1 = new Cube();
  hill1.textureNum = 2;
  H1.scale(4, 2, 2.5);
  H1.translate(-1, -0.5, -2);
  H1.rotate(20, 1, 0, 10);
  hill1.drawCube(H1, [0.77, 0.38, 0.06, 1.0]);

  // Draw the hill 2
  var hill2 = new Cube();
  hill2.textureNum = 2;
  H2.scale(4, 2, 2);
  H2.translate(-0.75, -0.25, -2);
  H2.rotate(-20, 1, 4, 10);
  hill2.drawCube(H2, [0.77, 0.38, 0.06, 1.0]);

  // Draw the lake
  var lake = new Cube();
  lake.textureNum = 3;
  L.translate(-2.5, -0.75, 1.4);
  L.scale(3, 0.001, 5);  // Make it slightly thicker but not too tall
  L.translate(-0.5, 0, -0.5);
  lake.drawCube(L, [0.0, 0.4, 0.8, 0.8]);

  drawKingKong();
  drawOrangutanGuard1();
  drawOrangutanGuard2();

  // Check the time at the end of the function, and show on web page
  var duration = performance.now() - startTime;
  sendTextToHTML(" ms: " + Math.floor(duration) + " fps: " + Math.floor(10000 / duration) / 10, "numdot");
}

function drawKingKong() {

  var M = new Matrix4();

  // Apply jump upwards
  M.translate(0, g_jumpHeight, 0);

  // Chest Body
  var cube = new Cube();
  cube.textureNum = -2;
  // horizontal, vertical, forward/backward
  M.translate(4, -0.15, -2);
  M.rotate(180, 0, 1, 0);
  M.rotate(-30, 1, 0, 0);
  // M.scale(0.4, 0.4, 0.2);
  M.scale(1.2, 1.2, 0.6);
  cube.drawCube(M, [0.3, 0.3, 0.3, 1.0]); // Medium gray for body

  var bodyMatrix = new Matrix4(M); // Save body transform

  // Head
  var head = new Pentagon();
  M = new Matrix4(bodyMatrix);
  M.translate(0.25, 1.0, 0); // Move to top of chest
  M.rotate(g_headAnimation, 1, 0, 1);
  M.scale(0.5, 0.5, 0.5); // Smaller head
  head.drawPentagon(M, [0.35, 0.35, 0.35, 1.0]); // Slightly lighter gray for head
  
  //Left arm
  M = new Matrix4(bodyMatrix);
  M.translate(-0.25, 0.5, 0.0); // Move to left shoulder
  M.rotate(g_upperArmAngle, 1, 0, 0); // Rotate at shoulder
  var leftArmUpperMatrix = new Matrix4(M);
  M.scale(0.15, 0.9, 0.5); // Upper arm size
  cube.drawCube(M, [0.32, 0.32, 0.32, 1.0]); // Medium gray for upper arm

  M = new Matrix4(leftArmUpperMatrix);
  M.translate(0.0, -0.7, 0.0); // Move to elbow
  M.rotate(-g_lowerArmAngle, 1, 0, 0); // Rotate at elbow
  var leftArmLowerMatrix = new Matrix4(M);
  M.scale(0.12, 0.6, 0.4); // Lower arm size
  cube.drawCube(M, [0.32, 0.32, 0.32, 1.0]); // Medium gray for lower arm

  M = new Matrix4(leftArmLowerMatrix);
  M.translate(0.0, -0.15, 0.0); // Move to wrist
  M.scale(0.1, 0.1, 0.3); // Hand size
  cube.drawCube(M, [0.28, 0.28, 0.28, 1.0]); // Slightly darker gray for hands

  // right Arm
  M = new Matrix4(bodyMatrix);
  M.translate(1.1, 0.5, 0.0); // Move to right shoulder
  M.rotate(g_upperArmAngle, 1, 0, 0); // Rotate at shoulder
  var rightArmUpperMatrix = new Matrix4(M);
  M.scale(0.15, 0.9, 0.5); // Upper arm size
  cube.drawCube(M, [0.32, 0.32, 0.32, 1.0]); // Medium gray for upper arm

  M = new Matrix4(rightArmUpperMatrix);
  M.translate(0.03, -0.7, 0.0); // Move to elbow
  M.rotate(g_lowerArmAngle, 1, 0, 0); // Rotate at elbow
  var rightArmLowerMatrix = new Matrix4(M);
  M.scale(0.12, 0.6, 0.4); // Lower arm size
  cube.drawCube(M, [0.32, 0.32, 0.32, 1.0]); // Medium gray for lower arm

  M = new Matrix4(rightArmLowerMatrix);
  M.translate(0.02, -0.15, 0.0); // Move to wrist
  M.scale(0.1, 0.1, 0.3); // Hand size
  cube.drawCube(M, [0.28, 0.28, 0.28, 1.0]); // Slightly darker gray for hands

  //left leg
  M = new Matrix4(bodyMatrix);
  M.translate(0.25, -0.4, 0); // Move to left hip
  M.rotate(g_leftLegAnimation, 1, 0, 0);
  M.scale(0.15, 0.3, 0.15); // Upper leg size
  cube.drawCube(M, [0.32, 0.32, 0.32, 1.0]); // Medium gray for upper leg

  M.translate(0.0, -0.4, -1); // Move to foot
  M.rotate(g_leftFootAnimation, 1, 0, 0);
  M.scale(1.0, 0.3, 1.5); // Foot size
  cube.drawCube(M, [0.28, 0.28, 0.28, 1.0]); // Slightly darker gray for feet

  //right leg
  M = new Matrix4(bodyMatrix);
  M.translate(0.6, -0.4, 0.0); // Move to right hip
  M.rotate(g_rightLegAnimation, 1, 0, 0);
  M.scale(0.15, 0.3, 0.15); // Upper leg size
  cube.drawCube(M, [0.32, 0.32, 0.32, 1.0]); // Medium gray for upper leg

  M.translate(0.0, -0.4, -1); // Move to foot
  M.rotate(g_rightFootAnimation, 1, 0, 0);
  M.scale(1.0, 0.3, 1.5); // Foot size
  cube.drawCube(M, [0.28, 0.28, 0.28, 1.0]); // Slightly darker gray for feet
}

function drawOrangutanGuard1() {
  var M = new Matrix4();

  // Apply jump upwards
  M.translate(0, g_jumpHeight, 0);

  // Chest Body
  var cube = new Cube();
  cube.textureNum = -2;
  // horizontal, vertical, forward/backward
  M.translate(2.5, -0.55, -0.75);
  M.rotate(180, 0, 1, 0);
  M.rotate(-30, 1, 0, 0);
  M.scale(0.4, 0.4, 0.2);
  // M.scale(1.2, 1.2, 0.6);
  cube.drawCube(M, [0.77, 0.38, 0.06, 1.0]); // Orangish Brown

  var bodyMatrix = new Matrix4(M); // Save body transform

  // Head
  var head = new Pentagon();
  M = new Matrix4(bodyMatrix);
  M.translate(0.25, 1.0, 0); // Move to top of chest
  M.rotate(g_headAnimation, 1, 0, 1);
  M.scale(0.5, 0.5, 0.5); // Smaller head
  head.drawPentagon(M, [1.0, 0.3, 0.0, 1.0]);

  //Left arm
  M = new Matrix4(bodyMatrix);
  M.translate(-0.25, 0.5, 0.0); // Move to left shoulder
  M.rotate(g_upperArmAngle, 1, 0, 0); // Rotate at shoulder
  var leftArmUpperMatrix = new Matrix4(M);
  M.scale(0.15, 0.9, 0.5); // Upper arm size
  cube.drawCube(M, [0.63, 0.29, 0.01, 1.0]); // Deep Orange

  M = new Matrix4(leftArmUpperMatrix);
  M.translate(0.0, -0.7, 0.0); // Move to elbow
  M.rotate(-g_lowerArmAngle, 1, 0, 0); // Rotate at elbow
  var leftArmLowerMatrix = new Matrix4(M);
  M.scale(0.12, 0.6, 0.4); // Lower arm size
  cube.drawCube(M, [0.63, 0.29, 0.01, 1.0]); // Deep Orange

  M = new Matrix4(leftArmLowerMatrix);
  M.translate(0.0, -0.15, 0.0); // Move to wrist
  M.scale(0.1, 0.1, 0.3); // Hand size
  cube.drawCube(M, [0.36, 0.25, 0.20, 1.0]); // Dark Brown

  // right Arm
  M = new Matrix4(bodyMatrix);
  M.translate(1.1, 0.5, 0.0); // Move to right shoulder
  M.rotate(g_upperArmAngle, 1, 0, 0); // Rotate at shoulder
  var rightArmUpperMatrix = new Matrix4(M);
  M.scale(0.15, 0.9, 0.5); // Upper arm size
  cube.drawCube(M, [0.63, 0.29, 0.01, 1.0]);

  M = new Matrix4(rightArmUpperMatrix);
  M.translate(0.03, -0.7, 0.0); // Move to elbow
  M.rotate(g_lowerArmAngle, 1, 0, 0); // Rotate at elbow
  var rightArmLowerMatrix = new Matrix4(M);
  M.scale(0.12, 0.6, 0.4); // Lower arm size
  cube.drawCube(M, [0.63, 0.29, 0.01, 1.0]);

  M = new Matrix4(rightArmLowerMatrix);
  M.translate(0.02, -0.15, 0.0); // Move to wrist
  M.scale(0.1, 0.1, 0.3); // Hand size
  cube.drawCube(M, [0.36, 0.25, 0.20, 1.0]);

  //left leg
  M = new Matrix4(bodyMatrix);
  M.translate(0.25, -0.4, 0); // Move to left hip
  M.rotate(g_leftLegAnimation, 1, 0, 0);
  M.scale(0.15, 0.3, 0.15); // Upper leg size
  cube.drawCube(M, [0.63, 0.29, 0.01, 1.0]);

  M.translate(0.0, -0.4, -1); // Move to foot
  M.rotate(g_leftFootAnimation, 1, 0, 0);
  M.scale(1.0, 0.3, 1.5); // Foot size
  cube.drawCube(M, [0.36, 0.25, 0.20, 1.0]);

  //right leg
  M = new Matrix4(bodyMatrix);
  M.translate(0.6, -0.4, 0.0); // Move to right hip
  M.rotate(g_rightLegAnimation, 1, 0, 0);
  M.scale(0.15, 0.3, 0.15); // Upper leg size
  cube.drawCube(M, [0.63, 0.29, 0.01, 1.0]);

  M.translate(0.0, -0.4, -1); // Move to foot
  M.rotate(g_rightFootAnimation, 1, 0, 0);
  M.scale(1.0, 0.3, 1.5); // Foot size
  cube.drawCube(M, [0.36, 0.25, 0.20, 1.0]);
}

function drawOrangutanGuard2() {
  var M = new Matrix4();

  // Apply jump upwards
  M.translate(0, g_jumpHeight, 0);

  // Chest Body
  var cube = new Cube();
  cube.textureNum = -2;
  // horizontal, vertical, forward/backward
  M.translate(4.5, -0.55, -0.75);
  M.rotate(180, 0, 1, 0);
  M.rotate(-30, 1, 0, 0);
  M.scale(0.4, 0.4, 0.2);
  // M.scale(1.2, 1.2, 0.6);
  cube.drawCube(M, [0.77, 0.38, 0.06, 1.0]); // Orangish Brown

  var bodyMatrix = new Matrix4(M); // Save body transform

  // Head
  var head = new Pentagon();
  M = new Matrix4(bodyMatrix);
  M.translate(0.25, 1.0, 0); // Move to top of chest
  M.rotate(g_headAnimation, 1, 0, 1);
  M.scale(0.5, 0.5, 0.5); // Smaller head
  head.drawPentagon(M, [1.0, 0.3, 0.0, 1.0]);

  //Left arm
  M = new Matrix4(bodyMatrix);
  M.translate(-0.25, 0.5, 0.0); // Move to left shoulder
  M.rotate(g_upperArmAngle, 1, 0, 0); // Rotate at shoulder
  var leftArmUpperMatrix = new Matrix4(M);
  M.scale(0.15, 0.9, 0.5); // Upper arm size
  cube.drawCube(M, [0.63, 0.29, 0.01, 1.0]); // Deep Orange

  M = new Matrix4(leftArmUpperMatrix);
  M.translate(0.0, -0.7, 0.0); // Move to elbow
  M.rotate(-g_lowerArmAngle, 1, 0, 0); // Rotate at elbow
  var leftArmLowerMatrix = new Matrix4(M);
  M.scale(0.12, 0.6, 0.4); // Lower arm size
  cube.drawCube(M, [0.63, 0.29, 0.01, 1.0]); // Deep Orange

  M = new Matrix4(leftArmLowerMatrix);
  M.translate(0.0, -0.15, 0.0); // Move to wrist
  M.scale(0.1, 0.1, 0.3); // Hand size
  cube.drawCube(M, [0.36, 0.25, 0.20, 1.0]); // Dark Brown

  // right Arm
  M = new Matrix4(bodyMatrix);
  M.translate(1.1, 0.5, 0.0); // Move to right shoulder
  M.rotate(g_upperArmAngle, 1, 0, 0); // Rotate at shoulder
  var rightArmUpperMatrix = new Matrix4(M);
  M.scale(0.15, 0.9, 0.5); // Upper arm size
  cube.drawCube(M, [0.63, 0.29, 0.01, 1.0]);

  M = new Matrix4(rightArmUpperMatrix);
  M.translate(0.03, -0.7, 0.0); // Move to elbow
  M.rotate(g_lowerArmAngle, 1, 0, 0); // Rotate at elbow
  var rightArmLowerMatrix = new Matrix4(M);
  M.scale(0.12, 0.6, 0.4); // Lower arm size
  cube.drawCube(M, [0.63, 0.29, 0.01, 1.0]);

  M = new Matrix4(rightArmLowerMatrix);
  M.translate(0.02, -0.15, 0.0); // Move to wrist
  M.scale(0.1, 0.1, 0.3); // Hand size
  cube.drawCube(M, [0.36, 0.25, 0.20, 1.0]);

  //left leg
  M = new Matrix4(bodyMatrix);
  M.translate(0.25, -0.4, 0); // Move to left hip
  M.rotate(g_leftLegAnimation, 1, 0, 0);
  M.scale(0.15, 0.3, 0.15); // Upper leg size
  cube.drawCube(M, [0.63, 0.29, 0.01, 1.0]);

  M.translate(0.0, -0.4, -1); // Move to foot
  M.rotate(g_leftFootAnimation, 1, 0, 0);
  M.scale(1.0, 0.3, 1.5); // Foot size
  cube.drawCube(M, [0.36, 0.25, 0.20, 1.0]);

  //right leg
  M = new Matrix4(bodyMatrix);
  M.translate(0.6, -0.4, 0.0); // Move to right hip
  M.rotate(g_rightLegAnimation, 1, 0, 0);
  M.scale(0.15, 0.3, 0.15); // Upper leg size
  cube.drawCube(M, [0.63, 0.29, 0.01, 1.0]);

  M.translate(0.0, -0.4, -1); // Move to foot
  M.rotate(g_rightFootAnimation, 1, 0, 0);
  M.scale(1.0, 0.3, 1.5); // Foot size
  cube.drawCube(M, [0.36, 0.25, 0.20, 1.0]);
}

// Set the text of a HTML element
function sendTextToHTML(text, htmlID) {
  var htmlElm = document.getElementById(htmlID);
  if (!htmlElm) {
    console.log("Failed to get " + htmlID + " from HTML");
    return;
  }
  htmlElm.innerHTML = text;
}