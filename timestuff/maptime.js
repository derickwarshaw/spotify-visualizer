var map = new Map([[1,'grow'],[3,'stall'].[7,'explosion']])
var keys = map.keys()

index = 0
interval = keys[index]
setTimeout(function(){},interval)
event = setInterval(function(){
	if(index!=keys.length-1)
		map[keys[index++]]
	else
		clearInterval(event)
	interval = keys[index]
}, interval)



var interval = 10;
var start = Date.now()
var expected = Date.now() + interval
setTimeout(step(), interval)
function step() {
    var dt = Date.now() - expected // the drift (positive for overshooting)
    if (dt > interval) {
        // something really bad happened. Maybe the browser (tab) was inactive?
        // possibly special handling to avoid futile "catch up" run

        //not sure what to do here since 10 ms intervals and uhhh 
    }
    diff = Date.now()-start
    if(map.has(diff))
    	map.get(diff)

    expected += interval
    setTimeout(step(), Math.max(0, interval - dt)) // take into account drift
}