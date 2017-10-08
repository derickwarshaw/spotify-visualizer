var spawn = require('child_process').spawn,
py = spawn('python', ['parser.py']),
dataString = ''
var json = require('./sample_data.json')

py.stdout.on('data', function(data){
	dataString += data.toString()
})
// py.stdout.on('error',function(){
// 	console.log('error!')
// })
py.stdout.on('end', function(){
	console.log(dataString)
})
py.stdin.write(JSON.stringify(json))
py.stdin.end()