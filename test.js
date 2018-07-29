const iso = require('isomorphic-fetch')

console.log('=============================TESTING STARTED==========================\n\n')

const testLogin = new Promise((resolve, reject) => {
	fetch('http://localhost:3000/login/?user=test&pass=pass', {method: 'GET'})
	.then(res => {
		if (res.status === 200) resolve(true)
		else resolve(res)
	})
})

const testBypass = new Promise((resolve, reject) => {
	fetch('http://localhost:3000/bypass/?user=1', {method: 'GET'})
	.then(res => {
		if (res.status === 200) resolve(true)
		else resolve(res)
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
		else resolve(res)
	})
})

const testChangeGroup = new Promise((resolve, reject) => {
	fetch('http://localhost:3000/change-group/?gid=1&uid=1', {method: 'GET'})
	.then(res => {
		if (res.status === 200) resolve(true)
		else resolve(res)
	})
})

const testCreateProfile = new Promise((resolve, reject) => {
	fetch('http://localhost:3000/create-profile/?code=code456', {method: 'GET'})
	.then(res => {
		if (res.status === 200) resolve(true)
		else resolve(res)
	})
})

const testResetPass = new Promise((resolve, reject) => {
	fetch('http://localhost:3000/reset-pass/?email=email', {method: 'GET'})
	.then(res => {
		if (res.status === 200) resolve(true)
		else resolve(res)
	})
})

const testGetGroups = new Promise((resolve, reject) => {
	fetch('http://localhost:3000/groups/?user_id=1', {method: 'GET'})
	.then(res => {
		if (res.status === 200) resolve(true)
		else resolve(res)
	})
})

const testLeaveGroup = new Promise((resolve, reject) => {
	fetch('http://localhost:3000/leave-group/?uid=2&gid=1', {method: 'GET'})
	.then(res => {
		if (res.status === 200) resolve(true)
		else resolve(res)
	})
})

const testGetProfile = new Promise((resolve, reject) => {
	fetch('http://localhost:3000/profile/?user_id=1', {method: 'GET'})
	.then(res => {
		if (res.status === 200) resolve(true)
		else resolve(res)
	})
})

const testGetScore = new Promise((resolve, reject) => {
	fetch('http://localhost:3000/score/?first=chester&last=mcprofile', {method: 'GET'})
	.then(res => {
		if (res.status === 200) resolve(true)
		else resolve(res)
	})
})

const testIncrementScore = new Promise((resolve, reject) => {
	fetch('http://localhost:3000/increment-score/?uid=1', {method: 'GET'})
	.then(res => {
		if (res.status === 200) resolve(true)
		else resolve(res)
	})
})

const testGetVotes = new Promise((resolve, reject) => {
	fetch('http://localhost:3000/votes/?post_id=1&user_id=1', {method: 'GET'})
	.then(res => {
		if (res.status === 200) resolve(true)
		else resolve(res)
	})
})

const runtests = () => {
	const tests = []

	tests.push(testBypass)
	tests.push(testLogin)
	tests.push(testSignup)

	tests.push(testResetPass)

	tests.push(testCreateGroup)
	tests.push(testChangeGroup)
	tests.push(testGetGroups)
	tests.push(testLeaveGroup)

	tests.push(testCreateProfile)
	tests.push(testGetProfile)
	tests.push(testGetScore)
	tests.push(testIncrementScore)

	tests.push(testGetVotes)

	Promise.all(tests).then((res) => {
		console.log(`${res.length} tests ran with the following results:\n`)
		console.log(res)
		console.log('\n\n=============================TESTING ENDED============================')

		process.exit()
	})

}

runtests()
