

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
map = data("10.55,excite;19.33,relax;21.22,excite;30.29,relax;32.66,excite;55.77,relax;75.37,excite;87.39,relax;88.65,excite;99.63,relax;101.51,excite;106.23,relax;114.0,excite;131.37,excite;141.07,relax;160.71,excite;208.46,relax;214.33,excite;227.78,relax")
var keys = Array.from(map.keys())

index = 0
interval = keys[index]*1000
event = setInterval(function(){
	if(index!=keys.length-1) {
		console.log(keys[index],map.get(keys[index++]))
		//map[keys[index++]]
	}
	else
		clearInterval(event)
	interval = (keys[index]-keys[index-1])*1000
	console.log(interval)
}, interval)

// index = 0
// interval = keys[index]*1000
// setTimeout(timeOut(), interval)

// function timeOut() {
// 	//doSomething(map.get(keys[index++])) //send what needs to be done on animation to that
// 	console.log(keys[index],map.get(keys[index++]))
// 	interval = keys[index]*1000
// 	if(index!=keys.length)
// 		setTimeout(timeOut(),interval)
// }

// function doSomething(event) {
// 	console.log(event)
// }