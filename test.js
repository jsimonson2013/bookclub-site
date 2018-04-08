const iso = require('isomorphic-fetch')

console.log('=============================TESTING STARTED==========================\n\n')
fetch('http://localhost:3000/login', {method: 'GET'})
.then(res => {
	if (res.status === 200) {
		console.log('TEST 1 PASSED')
		console.log('\n\n=============================TESTING ENDED============================')
	}
})
