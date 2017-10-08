var scene, camera, renderer;
var WIDTH  = window.innerWidth;
var HEIGHT = window.innerHeight;
var SPEED = 0.01;
var allYPoints = []
var usefulYCoords = []
var amplitude = 0.15
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
    initCloud1();
    initCloud2();
    initCloud3();
    initCloud4();
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
        mountain.material.color.setStyle('grey');
        scene.add(mountain);   
        calcYCoords();
        calcUsefulYCoords();
    });
}

var cloud1 = null;
function initCloud1() {
    var loader = new THREE.JSONLoader();
    loader.load('/dist/js/meshes/cloud.json', function(geometry, materials) {
        cloud1 = new THREE.Mesh(geometry, new THREE.MeshPhongMaterial(materials, wireframe=true));
        cloud1.position.x = 4.5;
        cloud1.position.y = .33;
        cloud1.position.z = 6;
        cloud1.material.color.setStyle('white');
        scene.add(cloud1);
    });
}

var cloud2 = null;
function initCloud2() {
    var loader = new THREE.JSONLoader();
    loader.load('/dist/js/meshes/cloud.json', function(geometry, materials) {
        cloud2 = new THREE.Mesh(geometry, new THREE.MeshPhongMaterial(materials, wireframe=true));
        cloud2.position.x = 6;
        cloud2.position.y = 2;
        cloud2.position.z = 4;
        cloud2.material.color.setStyle('white');
        scene.add(cloud2);
    }
                
var cloud3 = null;
function initCloud3() {
    var loader = new THREE.JSONLoader();
    loader.load('/dist/js/meshes/cloud.json', function(geometry, materials) {
        cloud3 = new THREE.Mesh(geometry, new THREE.MeshPhongMaterial(materials, wireframe=true));
        cloud3.position.x = 4;
        cloud3.position.y = 2.5;
        cloud3.position.z = -1;
        cloud3.material.color.setStyle('white');
        scene.add(cloud3);
    });
}

var cloud4 = null;
function initCloud4() {
    var loader = new THREE.JSONLoader();
    loader.load('/dist/js/meshes/cloud.json', function(geometry, materials) {
        cloud4 = new THREE.Mesh(geometry, new THREE.MeshPhongMaterial(materials, wireframe=true));
        cloud4.position.x = 1;
        cloud4.position.y = 2;
        cloud4.position.z = -6;
        cloud4.material.color.setStyle('white');
        scene.add(cloud4); 
    });
}


var island = null;
function initIsland() {
    var loader = new THREE.JSONLoader();
    loader.load('/dist/js/meshes/island.json', function(geometry, materials) {
        island = new THREE.Mesh(geometry, new THREE.MeshLambertMaterial(materials, wireframe=true));
        island.scale.x = island.scale.y = island.scale.z = 0.79;
        island.material.color.setStyle('burlywood');    
        scene.add(island);
            })
}

function rgbToHex(R,G,B) {return toHex(R)+toHex(G)+toHex(B)}
function toHex(n) {
 n = parseInt(n,10);
 if (isNaN(n)) return "00";
 n = Math.max(0,Math.min(n,255));
 return "0123456789ABCDEF".charAt((n-n%16)/16)
      + "0123456789ABCDEF".charAt(n%16);
}

function changeBG(opacity){
    renderer.setClearColorHex(0xffffff,opacity);
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
var map = data("2.55,excite;7.33,relax;21.22,excite;30.29,relax;32.66,excite;55.77,relax;75.37,excite;87.39,relax;88.65,excite;99.63,relax;101.51,excite;106.23,relax;114.0,excite;131.37,excite;141.07,relax;160.71,excite;208.46,relax;214.33,excite;227.78,relax")
var keys = Array.from(map.keys())

var index = 0
var interval = keys[index]*1000
var period = 0

var TO = function timeOut() {
    doAction(map.get(keys[index]));
    clock.start()
    interval = (keys[index]-keys[index-1])*1000;
    period = 2*Math.PI/interval
    console.log(period,interval)
    if(index!=keys.length)
        setTimeout(TO,interval)
    index++;
}
//setTimeout(TO, interval)

function doAction(param){
    switch(param) {
    case "excite":
        amplitude = 0.1
        //console.log("Excite")        
        break;
    case "relax":
        amplitude = 0.02
        //console.log("relax...")        
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
function animateCloud(){
        var scaleStep = amplitude * Math.sin(clock.getElapsedTime());
        //console.log(cloud1);
        //console.log(cloud1.scale)
        cloud1.scale.x = cloud1.scale.y = cloud1.scale.z = 1.2
}

function rotateMesh() {
    if (!mountain) {
        return;
    }
    mountain.rotation.y -= SPEED;
    //cloud.rotation.y -= SPEED;
    island.rotation.y -= SPEED; 
}

function render() {
    requestAnimationFrame(render);
    rotateMesh();
    animateMountainHeight();
    animateCloud()    
    renderer.render(scene, camera);
}

init();
render();