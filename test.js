const iso = require('isomorphic-fetch')

console.log('=============================TESTING STARTED==========================\n\n')

testLogin = new Promise((resolve, reject) => {
	fetch('http://localhost:3000/login/?user=test&pass=pass', {method: 'GET'})
	.then(res => {
		if (res.status === 200) {
			resolve(true)	
		}
		else {
			resolve(false)
		}
		reject()
	})
})

runtests = () => {

	testLogin.then(passed => {
		console.log(passed)
		console.log('\n\n=============================TESTING ENDED============================')

		process.exit()
	})

}

runtests()
