const iso = require('isomorphic-fetch')

console.log('=============================TESTING STARTED==========================\n\n')

setup = () => {
	const mysql = require('mysql')

	const connection = mysql.createConnection({
		host: 'localhost',
		user: process.argv[2],
		password: process.argv[3],
		database: process.argv[4]
	})

	connection.query('create table test(test_id int(11) not null auto_increment, primary key (test_id));', (err, results) => {
		return
	})
}

teardown = () => {
	const mysql = require('mysql')

	const connection = mysql.createConnection({
		host: 'localhost',
		user: process.argv[2],
		password: process.argv[3],
		database: process.argv[4]
	})

	connection.query('drop table test;', (err, results) => {
		console.log('DONE')
	})
}

setup()

testLoginNoArgs = new Promise((resolve, reject) => {
	fetch('http://localhost:3000/login', {method: 'GET'})
	.then(res => {
		if (res.status === 200) {
			console.log('TEST testLoginNoArgs PASSED!')
		}
		else {
			console.log('TEST testLoginNoArgs FAILED...')
		}
		resolve()
	})
})

testLoginValidArgs = new Promise((resolve, reject) => {
	fetch('http://localhost:3000/login/?user=test&pass=pass', {method: 'GET'})
	.then(res => { return res.json() })
	.then(json => {
		if (json.uid == 1 && json.url == 'http://friendgroup.jacobsimonson.me/html/feed-template.html') {
			console.log('TEST testLoginValidArgs PASSED!')
		}
		else {
			console.log('TEST testLoginInvalidArgs FAILED...')
		}
		resolve()
	})
})

testLoginInvalidArgs = new Promise((resolve, reject) => {
	fetch('http://localhost:3000/login/?user=test&pass=pas', {method: 'GET'})
	.then(res => { 
		if (res.headers.get('content-type').indexOf('application/json') == -1 && res.status == 200) {
			console.log('TEST testLoginInvalidArgs PASSED!')
		}
		else {
			console.log('TEST testLoginInvalidArgs FAILED...')
		}
		resolve()
	})
})

testFeedValid = new Promise((resolve, reject) => {
	fetch('http://localhost:3000/feed', {method: 'GET'})
	.then(res => { 
		if (res.headers.get('content-type').indexOf('application/json') != -1) {
			console.log('TEST testFeedValid PASSED!')
		}
		else {
			console.log('TEST testFeedValid FAILED...')
		}
		resolve()
	})
})

testProfileValidArgs = new Promise((resolve, reject) => {
	fetch('http://localhost:3000/profile/?user_id=1', {method: 'GET'})
	.then(res => {
		if (res.headers.get('content-type').indexOf('application/json') != -1) {
			console.log('TEST testProfileValidArgs PASSED!')
		}
		else {
			console.log('TEST testProfileValidArgs FAILED...')
		}
		resolve()
	})
})

testCommentsValidArgs = new Promise((resolve, reject) => {
	fetch('http://localhost:3000/comments/?parent_id=1', {method: 'GET'})
	.then(res => {
		if (res.headers.get('content-type').indexOf('application/json') != -1) {
			console.log('TEST testCommentsValidArgs PASSED!')
		}
		else {
			console.log('TEST testCommentsValidArgs FAILED...')
		}
		resolve()
	})
})

runtests = () => {

	testLoginNoArgs
	.then(testLoginValidArgs)
	.then(testLoginInvalidArgs)
	.then(testFeedValid)
	.then(testProfileValidArgs)
	.then(testCommentsValidArgs)
	.then(teardown())

}

runtests()
