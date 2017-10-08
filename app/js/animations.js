
/*
Initial varable declarations
*/
var scene, camera, renderer;
var WIDTH  = window.innerWidth;
var HEIGHT = window.innerHeight;
var SPEED = 0.01;
var allYPoints = []
var usefulYCoords = []
var amplitude = 0.05
clock = new THREE.Clock()

clock.start();


/*
Initializer function
*/
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
        scene.add(mountain);   
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
        scene.add(island);
            })
}

function data(data) {
    var map = new Map()
    var keyval = []
    var sets = data.toString().replace(/\s+/g, '').split(";")
    for(var i=0; i<sets.length; i++) {
        keyval = sets[i].toString().split(",")
        map.set(Number(keyval[0]),keyval[1])
    }
    return map
}
var map = data("10.55,excite;19.33,relax;21.22,excite;30.29,relax;32.66,excite;55.77,relax;75.37,excite;87.39,relax;88.65,excite;99.63,relax;101.51,excite;106.23,relax;114.0,excite;131.37,excite;141.07,relax;160.71,excite;208.46,relax;214.33,excite;227.78,relax")
var keys = Array.from(map.keys())

var index = 0
var interval = keys[index]*1000
var period = 0

var TO = function timeOut() {
    doAction(map.get(keys[index++]));
    clock.start()
    interval = (keys[index]-keys[index-1])*1000
    period = 2*Math.PI/interval
    if(index!=keys.length)
        setTimeout(TO,interval)
}
setTimeout(TO, interval)

function doAction(param){
    switch(param) {
    case "excite":
        amplitude = 0.1
        console.log("Excite")        
        break;
    case "relax":
        amplitude = 0.02
        console.log("relax...")        
        break;
    default:
        break;
    }
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
    for(var k = 0; k < mountain.geometry.vertices.length; k++){
        allYPoints.push(mountain.geometry.vertices[k].y)        
    }
}

function calcUsefulYCoords() {
    var yMin = ( Math.max.apply(null, allYPoints) - Math.min.apply(null, allYPoints) ) * 0.7;
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
            var yStep = amplitude * Math.sin(clock.getElapsedTime()*period);
            mountain.geometry.vertices[usefulYCoords[j]].y += yStep;
            mountain.geometry.verticesNeedUpdate = true;
    }
}

function rotateMesh() {
    if (!mountain || !cloud) {
        return;
    }
    //mountain.rotation.y -= SPEED;
    //cloud.rotation.y -= SPEED;
    //island.rotation.y -= SPEED; 
}

function render() {
    requestAnimationFrame(render);
    rotateMesh();
    animateMountainHeight();    
    renderer.render(scene, camera);
}

init();
render();
