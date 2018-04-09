const iso = require('isomorphic-fetch')

console.log('=============================TESTING STARTED==========================\n\n')

fetch('http://localhost:3000/login', {method: 'GET'})
.then(res => {
	if (res.status === 200) {
		console.log('TEST 1 PASSED')
	}
})
fetch('http://localhost:3000/login/?user=test&pass=pass', {method: 'GET'})
.then(res => { return res.json() })
.then(json => {
	if (json.uid == 1 && json.url == 'http://friendgroup.jacobsimonson.me/html/feed-template.html') {
		console.log('TEST 2 PASSED')
	}
	else {
		console.log('TEST 2 FAILED')
	}
})
fetch('http://localhost:3000/login/?user=test&pass=pa', {method: 'GET'})
.then(res => { 
	if (res.headers.get('content-type').indexOf('application/json') == -1 && res.status == 200) {
		console.log('TEST 3 PASSED')
	}
	else {
		console.log('TEST 3 FAILED')
	}
})
