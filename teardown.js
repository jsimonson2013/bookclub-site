const mysql = require('mysql') 

const conn = mysql.createConnection({
	host: 'localhost',
	user: 'root',
	password: 'pass',
	database: 'friendgroup_test'
})

conn.query('drop table if exists groups;', (err, res) => {
	if (err) throw err

	console.log('groups table dropped')
})

conn.query('drop table if exists invitees;', (err, res) => {
	if (err) throw err

	console.log('invitees table dropped')
})

conn.query('drop table if exists memberships;', (err, res) => {
	if (err) throw err

	console.log('memberships table dropped')
})

conn.query('drop table if exists posts;', (err, res) => {
	if (err) throw err

	console.log('posts table dropped')
})

conn.query('drop table if exists users;', (err, res) => {
	if (err) throw err

	console.log('users table dropped')
})

conn.query('drop table if exists votes;', (err, res) => {
	if (err) throw err

	console.log('votes table dropped')
})
