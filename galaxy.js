var container;
var camera, scene, renderer, particles, geometry, shaderMaterial, i, h, color;
var mouseX = 0, mouseY = 0;
var count = 0;
var canSwitch = false;

var windowHalfX = window.innerWidth / 2;
var windowHalfY = window.innerHeight / 2;

init();
animate();

function init() {
  THREE.ImageUtils.crossOrigin = '';
  container = document.createElement('div');
  container.id = 'fullscreen';
  document.body.appendChild(container);

  camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 1, 5000);
  scene = new THREE.Scene();

  clock = new THREE.Clock();
  clock.start();

  uniforms = {
    texture: { type: "t", value: THREE.ImageUtils.loadTexture("sphere.png") }
  };

  shaderMaterial = new THREE.ShaderMaterial({
    uniforms:       uniforms,
    vertexShader:   document.getElementById('vertexshader').textContent,
    fragmentShader: document.getElementById('fragmentshader').textContent,
    transparent:    true,
    depthTest:      false,
    blending:       THREE.AdditiveBlending
  });

  renderer = new THREE.WebGLRenderer();
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  container.appendChild(renderer.domElement);

  document.addEventListener('mousedown', onDocumentMouseDown, false);
  document.addEventListener('mousemove', onDocumentMouseMove, false);
  document.addEventListener('touchstart', onDocumentTouchStart, false);
  document.addEventListener('touchmove', onDocumentTouchMove, false);
  window.addEventListener('resize', onWindowResize, false);
}

function createGeometry() {
  geometry = new THREE.Geometry();

  var variance = 2.5 * (Math.random() + Math.random() + Math.random()) / 3.0;
  var arms = count === 0 ? 7 : Math.floor(Math.random() * 4) + 3;
  var twist = 0.6 + 1.5 * (Math.random() + Math.random() + Math.random() + Math.random() + Math.random());
  var pinch = 0.7 + 1.5 * (Math.random() + Math.random() + Math.random() + Math.random()) / 4.0;

  var clouds = 500 * arms;
  var stars = 4000;

  var vertices = new Float32Array((clouds + stars) * 3);
  var colors = new Float32Array((clouds + stars) * 3);
  var alphas = new Float32Array((clouds + stars) * 1);
  var sizes = new Float32Array((clouds + stars) * 1);

  var r1 = 1.0;
  var g1 = 1.0;
  var b1 = 0.8;

  var r2 = 0.65;
  var g2 = 0.85;
  var b2 = 1.0;

  for (i = 0; i < clouds; ++i) {
    var f = (clouds - i) / clouds;
    var g = i / clouds;
    var a = (i % arms) / arms * 2.0 * 3.19149 + g * twist + variance * ((Math.random() + Math.random() + Math.random()) * 0.4 / 3.0 - 0.2);
    var r = Math.pow(g, pinch) * 700;
    var x = Math.cos(a) * r;
    var y = Math.sin(a) * r;
    var z = 0.0;

    vertices[i * 3 + 0] = x;
    vertices[i * 3 + 1] = y;
    vertices[i * 3 + 2] = z;

    var c = Math.pow(f, 0.8);
    colors[i * 3 + 0] = c * r1 + (1.0 - c) * r2;
    colors[i * 3 + 1] = c * g1 + (1.0 - c) * g2;
    colors[i * 3 + 2] = c * b1 + (1.0 - c) * b2;

    var s = Math.pow(512.0, Math.pow(f * Math.random(), 0.3));
    alphas[i] = Math.random() * (400.0 - s) / 5000.0 * Math.pow(g, 0.49);
    sizes[i] = s;
  }

  for (i = clouds; i < clouds + stars; ++i) {
    var f = (clouds + stars - i) / (clouds + stars);
    var g = i / (clouds + stars);
    //var a = Math.random() * 3.14159 * 2.0;
    // var r = f * 700;
    var x = Math.random() * 4000.0 - 2000.0;
    var y = Math.random() * 4000.0 - 2000.0;
    var z = Math.random() * 4000.0 - 2000.0;
    if (f < 0.2) {
      var a = Math.random() * 3.14159 * 2.0;
      var r = 5.0 + Math.pow(f, 1.5) / Math.pow(0.2, 1.5) * 700;
      var x = Math.cos(a) * r;
      var y = Math.sin(a) * r;
      var z = Math.random() * g * g * Math.sqrt(r) - 0.5 * Math.sqrt(r);
    }

    vertices[i * 3 + 0] = x;
    vertices[i * 3 + 1] = y;
    vertices[i * 3 + 2] = z;

    var c = Math.pow(f, 0.8);
    colors[i * 3 + 0] = 1.0;
    colors[i * 3 + 1] = 1.0;
    colors[i * 3 + 2] = 1.0;

    var s = Math.pow(512.0, Math.pow(f * Math.random(), 0.3));
    alphas[i] = 0.2 + Math.random() * 0.8;
    sizes[i] = Math.random() * Math.random() * 8.0;
  }

  var bufferGeometry = new THREE.BufferGeometry();
  bufferGeometry.addAttribute('position', new THREE.BufferAttribute(vertices, 3));
  bufferGeometry.addAttribute('color', new THREE.BufferAttribute(colors, 3));
  bufferGeometry.addAttribute('alpha', new THREE.BufferAttribute(alphas, 1));
  bufferGeometry.addAttribute('size', new THREE.BufferAttribute(sizes, 1));

  particles = new THREE.Points(bufferGeometry, shaderMaterial);
  scene.add(particles);
}

function onDocumentMouseDown(event) {
  var target = document.getElementById('fullscreen');
  var requestFullscreen = target.requestFullscreen || target.webkitRequestFullscreen || target.mozRequestFullScreen;
  if (event.button === 2) {
    requestFullscreen.call(target);
  }
}

function onDocumentMouseMove(event) {
  mouseX = event.clientX - windowHalfX;
  mouseY = event.clientY - windowHalfY;
}

function goFullscreen(event) {
  var target = document.getElementById('fullscreen');
  var requestFullscreen = target.requestFullscreen || target.webkitRequestFullscreen || target.mozRequestFullScreen;
  requestFullscreen.call(target);
  if (event) event.preventDefault();
}

function onDocumentTouchStart(event) {
  var target = document.getElementById('fullscreen');
  var requestFullscreen = target.requestFullscreen || target.webkitRequestFullscreen || target.mozRequestFullScreen;
  if (event.touches.length == 2) {
    requestFullscreen.call(target);
  } else if (event.touches.length === 1) {
    event.preventDefault();
    mouseX = event.touches[0].pageX - windowHalfX;
    mouseY = event.touches[0].pageY - windowHalfY;
  }
}

function onDocumentTouchMove(event) {
  if (event.touches.length === 1) {
    event.preventDefault();
    mouseX = event.touches[ 0 ].pageX - windowHalfX;
    mouseY = event.touches[ 0 ].pageY - windowHalfY;
  }
}

function onWindowResize(event) {
  windowHalfX = window.innerWidth / 2;
  windowHalfY = window.innerHeight / 2;

  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
  requestAnimationFrame(animate);

  var t = clock.getElapsedTime();

  var a = (t * 0.1) % (Math.PI * 2.0);//2 * mouseX / windowHalfX;
  var b = Math.cos(t * 0.17);//2 * mouseY / windowHalfY;
  var x = 0.0;
  var y = 600;
  var z = 1000 + 1200 * b;
  if (z >= 2190) {
    canSwitch = true;
  } else if (canSwitch && z <= 2190) {
    canSwitch = false;
    if (particles) {
      scene.remove(particles);
      particles = null;
    }
    createGeometry();
    ++count;
  }
  camera.position.x = x * Math.cos(a) - y * Math.sin(a);
  camera.position.y = - x * Math.sin(a) + y * Math.cos(a);
  camera.position.z = z;

  camera.lookAt(scene.position);
  //camera.rotation.order = 'XYZ';
  //camera.rotateOnAxis(new THREE.Vector3(0, 0, 1), a / 10.0);
  camera.up = new THREE.Vector3(0, 0, 1);

  render();
}

function render() {
  renderer.render(scene, camera);
}

function initFullscreen() {
  var gofull = document.getElementById('gofull');
  if (gofull) {
    gofull.addEventListener('mousedown', goFullscreen);
    gofull.addEventListener('touchstart', goFullscreen);
  } else {
    setTimeout(initFullscreen, 500);
  }
}

initFullscreen();
