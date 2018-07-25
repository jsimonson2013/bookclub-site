const iso = require('isomorphic-fetch')

console.log('=============================TESTING STARTED==========================\n\n')

testLogin = new Promise((resolve, reject) => {
	fetch('http://localhost:3000/login/?user=test&pass=pass', {method: 'GET'})
	.then(res => {
		if (res.status === 200) resolve(true)
		else resolve(false)

		reject()
	})
})

testByPass = new Promise((resolve, reject) => {
	fetch('http://localhost:3000/bypass/?user=3', {method: 'GET'})
	.then(res => {
		if (res.status === 200) resolve(true)
		else resolve(false)

		reject()
	})
})

runtests = () => {
	const tests = []

	tests.push(testByPass)
	tests.push(testLogin)

	Promise.all(tests).then((res) => {
		console.log(res)
		console.log('\n\n=============================TESTING ENDED============================')

		process.exit()
	})

}

runtests()
