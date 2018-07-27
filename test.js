const iso = require('isomorphic-fetch')

console.log('=============================TESTING STARTED==========================\n\n')

const testLogin = new Promise((resolve, reject) => {
	fetch('http://localhost:3000/login/?user=test&pass=pass', {method: 'GET'})
	.then(res => {
		if (res.status === 200) resolve(true)
		else resolve(false)
	})
})

const testBypass = new Promise((resolve, reject) => {
	fetch('http://localhost:3000/bypass/?user=1', {method: 'GET'})
	.then(res => {
		if (res.status === 200) resolve(true)
		else resolve(false)
	})
})

const testSignup = new Promise((resolve, reject) => {
	fetch('http://localhost:3000/signup/?code=code123&first=test&last=mcprofile&pass=pass', {method: 'GET'})
	.then(res => {
		if (res.status === 200) resolve(true)
		else resolve(res)
	})
})

const testCreateGroup = new Promise((resolve, reject) => {
	fetch('http://localhost:3000/create-group/?name=group1&uid=1', {method: 'GET'})
	.then(res => {
		if (res.status === 200) resolve(true)
		else resolve(false)
	})
})

const runtests = () => {
	const tests = []

	tests.push(testBypass)
	tests.push(testLogin)
	tests.push(testSignup)
	tests.push(testCreateGroup)

	Promise.all(tests).then((res) => {
		console.log(res)
		console.log('\n\n=============================TESTING ENDED============================')

		process.exit()
	})

}

runtests()
