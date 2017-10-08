var spawn = require('child_process').spawn,
py = spawn('python', ['parser.py']),
dataString = new Map()
var json = require('./sample_data.json')

py.stdout.on('data', function(data){
	sets = data.toString().replace(/\s+/g, '').split(";")
	for(var i=0; i<sets.length; i++) {
		keyval = sets[i].toString().split(",")
		dataString.set(Number(keyval[0]),keyval[1])
	}
})
// py.stdout.on('error',function(){
// 	console.log('error!')
// })
py.stdout.on('end', function(){
	console.log(dataString)
})
py.stdin.write(JSON.stringify(json))
py.stdin.end()