const iso = require('isomorphic-fetch')

console.log('=============================TESTING STARTED==========================\n\n')

const testLogin = new Promise((resolve, reject) => {
	fetch('http://localhost:3000/login/?user=test&pass=pass', {method: 'GET'})
	.then(res => {
		if (res.status === 200) return res.json()
		else resolve(res)
	})
	.then(res => {
		if (res.uid == 1 && res.gid == 1 && res.gname == 'test' && res.url == 'https://friendgroup.jacobsimonson.me/html/feed-template.html') resolve(true)
		else resolve(res)
	})
})

const testLoginBadPass = new Promise((resolve, reject) => {
	fetch('http://localhost:3000/login/?user=test&pass=notpass', {method: 'GET'})
	.then(res => {
		if (res.status === 404) resolve(true)
		else resolve(res)
	})
})

const testLoginBadUser = new Promise((resolve, reject) => {
	fetch('http://localhost:3000/login/?user=nottest&pass=pass', {method: 'GET'})
	.then(res => {
		if (res.status === 404) resolve(true)
		else resolve(res)
	})
})

const testLoginNoArgs = new Promise((resolve, reject) => {
	fetch('http://localhost:3000/login/', {method: 'GET'})
	.then(res => {
		if (res.status === 404) resolve(true)
		else resolve(res)
	})
})

const testBypass = new Promise((resolve, reject) => {
	fetch('http://localhost:3000/bypass/?user=pass', {method: 'GET'})
	.then(res => {
		if (res.status === 200) return res.json()
		else resolve(res)
	})
	.then(res => {
		if (res.uid == 1 && res.gid == 1 && res.gname == 'test' && res.url == 'https://friendgroup.jacobsimonson.me/html/feed-template.html') resolve(true)
		else resolve(res)
	})
})

const testBypassBadUser = new Promise((resolve, reject) => {
	fetch('http://localhost:3000/bypass/?user=100', {method: 'GET'})
	.then(res => {
		if (res.status === 404) resolve(true)
		else resolve(res)
	})
})

const testBypassNoArgs = new Promise((resolve, reject) => {
	fetch('http://localhost:3000/bypass/', {method: 'GET'})
	.then(res => {
		if (res.status === 404) resolve(true)
		else resolve(res)
	})
})

const testSignup = new Promise((resolve, reject) => {
	fetch('http://localhost:3000/signup/?code=code123&first=test&last=mcprofile&pass=pass', {method: 'GET'})
	.then(res => {
		if (res.status === 200) return res.json()
		else resolve(res)
	})
	.then(res => {
		if (res.uid == 1 && res.gid == 1 && res.gname == 'test' && res.url == 'https://friendgroup.jacobsimonson.me/html/feed-template.html') resolve(true)
		else resolve(res)
	})
})

const testSignupBadCode = new Promise((resolve, reject) => {
	fetch('http://localhost:3000/signup/?code=test123&first=test&last=mcprofile&pass=pass', {method: 'GET'})
	.then(res => {
		if (res.status === 404) resolve(true)
		else resolve(res)
	})
})

const testSignupMissingArgs = new Promise((resolve, reject) => {
	fetch('http://localhost:3000/signup/?code=code12', {method: 'GET'})
	.then(res => {
		if (res.status === 404) resolve(true)
		else resolve(res)
	})
})

const testCreateGroup = new Promise((resolve, reject) => {
	fetch('http://localhost:3000/create-group/?name=group1&uid=1', {method: 'GET'})
	.then(res => {
		if (res.status === 200) return res.json()
		else resolve(res)
	})
	.then(res => {
		if (res.gid == 2 && res.gname == 'group1') resolve(true)
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
		if (res.url === 'https://friendgroup.jacobsimonson.me/html/create-profile.html') resolve(true)
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
	fetch('http://localhost:3000/groups/?user_id=pass', {method: 'GET'})
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
	fetch('http://localhost:3000/profile/?user_id=pass', {method: 'GET'})
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

const testGetUserVotes = new Promise((resolve, reject) => {
	fetch('http://localhost:3000/votes-by-user/?post_id=1&user_id=1', {method: 'GET'})
	.then(res => {
		if (res.status === 200) resolve(true)
		else resolve(res)
	})
})

const testGetPostVotes = new Promise((resolve, reject) => {
	fetch('http://localhost:3000/votes/?post_id=1', {method: 'GET'})
	.then(res => {
		if (res.status === 200) resolve(true)
		else resolve(res)
	})
})

const testGetFeed = new Promise((resolve, reject) => {
	const currentDateTime = new Date()
	currentDateTime.setFullYear(new Date().getFullYear() + 1)

	let localeTime = currentDateTime.toLocaleTimeString().split(' ')[0]

	if (localeTime.split(':')[0].length != 2) localeTime = `0${localeTime}`
	oldestDate = `${currentDateTime.toISOString().slice(0,10)} ${localeTime}`

	fetch('http://localhost:3000/feed/?group_id=1&start_date='+oldestDate, {method: 'GET'})
	.then(res => {
		if (res.status === 200) resolve(true)
		else resolve(res)
	})
})

const testGetComments = new Promise((resolve, reject) => {
	fetch('http://localhost:3000/comments/?parent_id=1', {method: 'GET'})
	.then(res => {
		if (res.status === 200) resolve(true)
		else resolve(res)
	})
})

const testGetNumComments = new Promise((resolve, reject) => {
	fetch('http://localhost:3000/num-comments/?parent_id=1', {method: 'GET'})
	.then(res => {
		if (res.status === 200) resolve(true)
		else resolve(res)
	})
})

const testPostPass = new Promise((resolve, reject) => {
	fetch('http://localhost:3000/pass/', {headers: {'Content-Type': 'application/json'}, method: 'POST', body: JSON.stringify({'user': 2, 'newpass': 'pass'})})
	.then(res => {
		if (res.status === 200) resolve(true)
		else resolve(res)
	})
})

const testPostSubmission = new Promise((resolve, reject) => {
	const currentDateTime = new Date()
	currentDateTime.setFullYear(new Date().getFullYear() + 1)

	let localeTime = currentDateTime.toLocaleTimeString().split(' ')[0]

	if (localeTime.split(':')[0].length != 2) localeTime = `0${localeTime}`
	oldestDate = `${currentDateTime.toISOString().slice(0,10)} ${localeTime}`

	fetch('http://localhost:3000/submission/', {headers: {'Content-Type': 'application/json'}, method: 'POST', body: JSON.stringify({'content': 'whats up', 'link': 'https://jacobsimonson.me', 'timestamp': oldestDate, 'group_id': 1, 'uniq_id': 'pass2'})})
	.then(res => {
		if (res.status === 200) resolve(true)
		else resolve(res)
	})
})

const testPostVote = new Promise((resolve, reject) => {
	fetch('http://localhost:3000/vote/', {headers: {'Content-Type': 'application/json'}, method: 'POST', body: JSON.stringify({'post_id': 1, 'user_id': 1})})
	.then(res => {
		if (res.status === 200) resolve(true)
		else resolve(res)
	})
})

const runtests = () => {
	const tests = []

	tests.push(testLogin)
	tests.push(testLoginBadPass)
	tests.push(testLoginBadUser)
	tests.push(testLoginNoArgs)

	tests.push(testBypass)
	tests.push(testBypassBadUser)
	tests.push(testBypassNoArgs)

	tests.push(testSignup)
	tests.push(testSignupBadCode)
	tests.push(testSignupMissingArgs)

	tests.push(testResetPass)
	tests.push(testPostPass)

	tests.push(testCreateGroup)
	tests.push(testChangeGroup)
	tests.push(testGetGroups)
	tests.push(testLeaveGroup)

	tests.push(testCreateProfile)
	tests.push(testGetProfile)
	tests.push(testGetScore)
	tests.push(testIncrementScore)

	tests.push(testGetUserVotes)
	tests.push(testGetPostVotes)
	tests.push(testPostVote)

	tests.push(testGetFeed)
	tests.push(testGetComments)
	tests.push(testGetNumComments)
	tests.push(testPostSubmission)

	Promise.all(tests).then((res) => {
		console.log(`${res.length} tests ran with the following results:\n`)
		console.log(res)
		console.log('\n\n=============================TESTING ENDED============================')

		process.exit()
	})

}

runtests()
