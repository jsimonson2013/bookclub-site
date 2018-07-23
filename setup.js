const mysql = require('mysql') 

let conn = mysql.createConnection({
	host: 'localhost', 
	user: 'root', 
	password: 'pass'
})

const createDB = conn.query('create database if not exists friendgroup_test;', (err, res) => {
	if (err) throw err

	console.log('database created')

	return true
}) || true

if (createDB){
	conn = mysql.createConnection({
		host: 'localhost',
		user: 'root',
		password: 'pass',
		database: 'friendgroup_test'
	})

	conn.query('create table if not exists groups (group_id int(11) auto_increment, name varchar(255) default null, primary key (group_id) );', (err, res) => {
		if (err) throw err

		console.log('groups table created')
	})

	conn.query('create table if not exists invitees (id int(11) not null auto_increment, email varchar(255) default null, invite_id int(11), group_id int(11), code varchar(255), primary key (id) );', (err, res) => {
		if (err) throw err

		console.log('invitees table created')
	})

	conn.query('create table if not exists memberships (membership_id int(11) not null auto_increment, group_id int(11), user_id int(11), primary key (membership_id) );', (err, res) => {
		if (err) throw err

		console.log('memberships table created')
	})

	conn.query('create table if not exists posts (post_id int(11) not null auto_increment, poster_group int(11), content varchar(1024), author varchar(255), link varchar(255), parent_id int(11), votes varchar(256), group_id int(11), date datetime, copy varchar(255), primary key (post_id) );', (err, res) => {
		if (err) throw err

		console.log('posts table created')
	})

	const createUsers = conn.query('create table if not exists users (user_id int(11) not null auto_increment, firstname varchar(16), lastname varchar(32), email varchar(32), pass varbinary(255), score int(11) default 0, default_group_id int(11), primary key (user_id) );', (err, res) => {
		if (err) throw err

		console.log('users table created')

		return true
	}) || true

	if (createUsers) {
		conn.query(`insert into users (email, pass, default_group_id) values('test', AES_ENCRYPT('pass', 'pass'), 1);`, (err, results) => {
			if (err) throw err

			console.log('inserted test user')

			return
		})

		conn.query(`insert into groups (name) values('test');`, (err, results) => {
			if (err) throw err

			console.log('inserted test group')

			return
		})
	}

	conn.query('create table if not exists votes (vote_id int(11) not null auto_increment, post_id int(11), user_id int(11), primary key (vote_id) );', (err, res) => {
		if (err) throw err

		console.log('votes table created')
	})
}

