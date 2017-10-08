var scene, camera, renderer;

var WIDTH  = window.innerWidth;
var HEIGHT = window.innerHeight;

var SPEED = 0.01;

function init() {
    scene = new THREE.Scene();

var light = new THREE.DirectionalLight( 0xffffff );
light.position.set( 0, 1, 1 ).normalize();
scene.add(light);

    initMountain();
    initCloud();
    initCamera();
    //initLights();
    initRenderer();

    document.body.appendChild(renderer.domElement);
}

function initCamera() {
    camera = new THREE.PerspectiveCamera(70, WIDTH / HEIGHT, 1, 10);
    camera.position.set(0, 3.5, 5);
    camera.lookAt(scene.position);
}


function initRenderer() {
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(WIDTH, HEIGHT);
}

// function initLights() {
//     var light = new THREE.AmbientLight(0xffffff);
//     scene.add(light);
// }



// var mesh = null;
// function initMesh() {
//     var loader = new THREE.BufferGeometryLoader();
//         loader.load("../JASON.json", function (g) {
//             var mesh = new THREE.Mesh(g, new THREE.MeshBasicMaterial({color:0xffffff}));
//             scene.add(mesh);
//     });
// }
var mountain = null;
function initMountain() {
    var loader = new THREE.JSONLoader();
    loader.load('/dist/js/meshes/mountain.json', function(geometry, materials) {
        mountain = new THREE.Mesh(geometry, new THREE.MeshPhongMaterial(materials, wireframe=true));
        mountain.scale.x = mountain.scale.y = mountain.scale.z = 0.75;
        mountain.translation = THREE.GeometryUtils.center(geometry);
        scene.add(mountain);
    });
}

var cloud = null;
function initCloud() {
    var loader = new THREE.JSONLoader();
    loader.load('/dist/js/meshes/cloud.json', function(geometry, materials) {
        cloud = new THREE.Mesh(geometry, new THREE.MeshPhongMaterial(materials, wireframe=true));
        cloud.scale.x = cloud.scale.y = cloud.scale.z = 0.75;
        cloud.translation = THREE.GeometryUtils.center(geometry);
        scene.add(cloud);
    });
}

// instantiate a loaders
// var loader = new THREE.BufferGeometryLoader();

// // load a resource
// loader.load(
//     // resource URL
//     'models/json/pressure.json',
//     // Function when resource is loaded
//     function ( geometry ) {
//         var material = new THREE.MeshLambertMaterial( { color: 0xF5F5F5 } );
//         var object = new THREE.Mesh( geometry, material );
//         scene.add( object );
//     },
//     // Function called when download progresses
//     function ( xhr ) {
//         console.log( (xhr.loaded / xhr.total * 100) + '% loaded' );
//     },
//     // Function called when download errors
//     function ( xhr ) {
//         console.log( 'An error happened' );
//     }
// );

// console.log(mountain.geometry.)


function rotateMesh() {
    if (!mountain) {
        return;
    }

    //mesh.rotation.x -= SPEED * 2;
    mountain.rotation.y -= SPEED;
    cloud.rotation.y -= SPEED;
    //mesh.rotation.z -= SPEED * 3;
}

function render() {
    requestAnimationFrame(render);
    rotateMesh();
    renderer.render(scene, camera);
}

init();
render();
