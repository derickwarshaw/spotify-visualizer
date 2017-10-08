var scene, camera, renderer;
var WIDTH  = window.innerWidth;
var HEIGHT = window.innerHeight;
var SPEED = 0.01;
var allYPoints = []
var usefulYCoords = []




function init() {
    scene = new THREE.Scene();
    var light = new THREE.DirectionalLight( 0xffffff );
    light.position.set( 0, 1, 1 ).normalize();
    scene.add(light);

    initMountain();
    initCloud();
    initIsland();   
    initCamera();
    initRenderer();

    document.body.appendChild(renderer.domElement);
}

function initCamera() {
    camera = new THREE.PerspectiveCamera(70, WIDTH / HEIGHT, 1, 100);
    camera.position.set(-8, 4, 14); //control the y coordinate to adjust the actual height of the camera aka the angle that we look down with. x is how far away
    camera.lookAt(scene.position);
}

function initRenderer() {
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(WIDTH, HEIGHT);
}
var mountain = null;
function initMountain() {
    var loader = new THREE.JSONLoader();
    loader.load('/dist/js/meshes/mountainrange.json', function(geometry, materials) {
        mountain = new THREE.Mesh(geometry, new THREE.MeshLambertMaterial(materials, wireframe=true));
         mountain.scale.x = mountain.scale.y = mountain.scale.z = 0.79;
        // mountain.position.y = 0.5
        // mountain.translation = THREE.GeometryUtils.center(geometry);
        scene.add(mountain);
        //console.log(mountain)   
        calcYCoords();
        calcUsefulYCoords();
    });
}

var cloud = null;
function initCloud() {
    var loader = new THREE.JSONLoader();
    loader.load('/dist/js/meshes/cloud.json', function(geometry, materials) {
        cloud = new THREE.Mesh(geometry, new THREE.MeshPhongMaterial(materials, wireframe=true));
        cloud.position.x = 4.5;
        cloud.position.y = .33;
        scene.add(cloud);
    });
}

var island = null;
function initIsland() {
    var loader = new THREE.JSONLoader();
    loader.load('/dist/js/meshes/island.json', function(geometry, materials) {
        island = new THREE.Mesh(geometry, new THREE.MeshLambertMaterial(materials, wireframe=true));
        island.scale.x = island.scale.y = island.scale.z = 0.79;
        // island.position.y = -4.76
        // island.translation = THREE.GeometryUtils.center(geometry);
        
        scene.add(island);
            })
}



function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min; //The maximum is exclusive and the minimum is inclusive
}

function calcYCoords(){
    if(!mountain) {
        console.log('no mountain')
        return;
    }
    //console.log(mountain.geometry.vertices.length)
    for(var k = 0; k < mountain.geometry.vertices.length; k++){
        allYPoints.push(mountain.geometry.vertices[k].y)        
    }
}

function calcUsefulYCoords() {
    var yMin = ( Math.max(allYPoints) - Math.min(allYPoints) ) * 0.8;
    for(var i = 0; i < allYPoints.length; i++){
        if(mountain.geometry.vertices[i].y > yMin) {
            usefulYCoords.push(i)
        }
    }
    
}

function animateMountainHeight(){
    if(!mountain){
        return;
    }
    for(var j = 0; j < usefulYCoords.length; j++){
        mountain.geometry.vertices.verticesNeedUpdate = true;
        mountain.geometry.vertices[usefulYCoords[j]].y += .1;
        
        console.log(mountain.geometry.vertices[zPoints[j]].y);
    }
}

function rotateMesh() {
    if (!mountain) {
        return;
    }
    //mesh.rotation.x -= SPEED * 2;
    //mountain.rotation.y -= SPEED;
    //cloud.rotation.y -= SPEED;
    //island.rotation.y -= SPEED; 

    // for(int i = 0; i < mountain.geometry.vertices.length; i++){
    //     if(mountain.geometry.vertices[i].z > 100){            
    //         //console.log(mountain.geometry.vertices[i].x)
    //         //console.log(mountain.geometry.vertices[i].y)
    //         //console.log(mountain.geometry.vertices[i].z)
    //         console.log("this shoud be displaying if we are finding points above z=100")
    //     }
    //     console.log("this should display anyways")
    // }
    //for(var k = 0; k < mountain.geometry.vertices.length; k++)
    //console.log(mountain.geometry.vertices[k].z)
    //mesh.rotation.z -= SPEED * 3;
}



function render() {
    requestAnimationFrame(render);
    rotateMesh();
    animateMountainHeight();    
    renderer.render(scene, camera);
}

init();
render();
