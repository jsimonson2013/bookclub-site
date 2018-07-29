const mysql = require('mysql') 

let conn = mysql.createConnection({
	host: 'localhost', 
	user: 'root', 
	password: 'pass'
})

module.exports = {
	setup: new Promise((resolve, reject) => {
		const createDB = new Promise((resolve, reject) => {
			conn.query('create database if not exists friendgroup_test;', (err, res) => {
				if (err) throw err
			})
			resolve(true)
		})

		createDB.then(() => {
			let promises = []

			conn = mysql.createConnection({
				host: 'localhost',
				user: 'root',
				password: 'pass',
				database: 'friendgroup_test'
			})

			const groupDrop = new Promise((resolve, reject) => {
				conn.query('drop table if exists groups;', (err, res) => {
					if (err) throw err
					console.log('groups dropped')
					resolve(true)
				})
			})
			promises.push(groupDrop)

			const inviteeDrop = new Promise((resolve, reject) => {
				conn.query('drop table if exists invitees;', (err, res) => {
					if (err) throw err
					console.log('invitees dropped')
					resolve(true)
				})
			})
			promises.push(inviteeDrop)

			const membershipDrop = new Promise((resolve, reject) => {
				conn.query('drop table if exists memberships;', (err, res) => {
					if (err) throw err
					console.log('memberships dropped')
					resolve(true)
				})
			})
			promises.push(membershipDrop)

			const postDrop = new Promise((resolve, reject) =>  {
				conn.query('drop table if exists posts;', (err, res) => {
					if (err) throw err
					console.log('posts dropped')
					resolve(true)
				})
			})
			promises.push(postDrop)

			const userDrop = new Promise((resolve, reject) => {
				conn.query('drop table if exists users;', (err, res) => {
					if (err) throw err
					console.log('users dropped')
					resolve(true)
				})
			})
			promises.push(userDrop)

			const voteDrop = new Promise((resolve, reject) => {
				conn.query('drop table if exists votes;', (err, res) => {
					if (err) throw err
					console.log('votes dropped')
					resolve(true)
				})
			})
			promises.push(voteDrop)

			Promise.all(promises).then(() => {
				promises = []

				const groupCreate = new Promise((resolve, reject) => {
					conn.query('create table if not exists groups (group_id int(11) auto_increment, name varchar(255) default null, primary key (group_id) );', (err, res) => {
						if (err) throw err
						console.log('groups created')
						resolve(true)
					})
				})
				promises.push(groupCreate)

				const inviteeCreate = new Promise((resolve, reject) => {
					conn.query('create table if not exists invitees (id int(11) not null auto_increment, email varchar(255) default null, invite_id int(11), group_id int(11), code varchar(255), primary key (id) );', (err, res) => {
						if (err) throw err
						console.log('invitees created')
						resolve(true)	
					})
				})
				promises.push(inviteeCreate)

				const membershipCreate = new Promise((resolve, reject) => {
					conn.query('create table if not exists memberships (membership_id int(11) not null auto_increment, group_id int(11), user_id int(11), primary key (membership_id) );', (err, res) => {
						if (err) throw err
						console.log('memberships created')
						resolve(true)
					})
				})
				promises.push(membershipCreate)

				const postCreate = new Promise((resolve, reject) => {
					conn.query('create table if not exists posts (post_id int(11) not null auto_increment, poster_group int(11), content varchar(1024), author varchar(255), link varchar(255), parent_id int(11), votes varchar(256), group_id int(11), date datetime, copy varchar(255), primary key (post_id) );', (err, res) => {
						if (err) throw err
						console.log('posts created')
						resolve(true)
					})
				})
				promises.push(postCreate)

				const voteCreate = new Promise((resolve, reject) => {
					conn.query('create table if not exists votes (vote_id int(11) not null auto_increment, post_id int(11), user_id int(11), primary key (vote_id) );', (err, res) => {
						if (err) throw err
						console.log('votes created')
						resolve(true)
					})
				})
				promises.push(voteCreate)

				const userCreate = new Promise((resolve, reject) => {
					conn.query('create table if not exists users (user_id int(11) not null auto_increment, firstname varchar(16), lastname varchar(32), email varchar(32), pass varbinary(255), score int(11) default 0, default_group_id int(11), primary key (user_id) );', (err, res) => {
						if (err) throw err
						console.log('users created')
						resolve(true)
					})
				})
				promises.push(userCreate)

				Promise.all(promises).then(() => {
					promises = []

					const userAdd1 = new Promise((resolve, reject) => {
						conn.query(`insert into users (email, pass, default_group_id) values('test', AES_ENCRYPT('pass', 'pass'), 1);`, (err, results) => {
							if (err) throw err
							console.log('user added')
							resolve(true)
						})
					})
					promises.push(userAdd1)

					const userAdd2 = new Promise((resolve, reject) => {
						conn.query(`insert into users (email, firstname, lastname, pass, default_group_id) values('email', 'chester', 'mcprofile', AES_ENCRYPT('pass', 'pass'), 1);`, (err, results) => {
							if (err) throw err
							console.log('user added')
							resolve(true)
						})
					})
					promises.push(userAdd2)

					const groupAdd = new Promise((resolve, reject) => {
						conn.query(`insert into groups (name) values('test');`, (err, results) => {
							if (err) throw err
							console.log('group added')
							resolve(true)
						})
					})
					promises.push(groupAdd)

					const inviteeAdd1 = new Promise((resolve, reject) => {
						conn.query(`insert into invitees (email, code, group_id) values('test', 'code123', 1);`, (err, results) => {
							if (err) throw err
							console.log('invitee added')
							resolve(true)
						})
					})
					promises.push(inviteeAdd1)

					const inviteeAdd2 = new Promise((resolve, reject) => {
						conn.query(`insert into invitees (email, code, group_id) values('test', 'code456', 1);`, (err, results) => {
							if (err) throw err
							console.log('invitee added')
							resolve(true)
						})
					})
					promises.push(inviteeAdd2)

					const membershipAdd1 = new Promise((resolve, reject) => {
						conn.query(`insert into memberships (user_id, group_id) values(1, 1);`, (err, results) => {
							if (err) throw err
							console.log('membership added')
							resolve(true)
						})
					})
					promises.push(membershipAdd1)

					const membershipAdd2 = new Promise((resolve, reject) => {
						conn.query(`insert into memberships (user_id, group_id) values(2, 1);`, (err, results) => {
							if (err) throw err
							console.log('membership added')
							resolve(true)
						})
					})
					promises.push(membershipAdd2)

					const postAdd = new Promise((resolve, reject) => {
						conn.query(`insert into posts (content, group_id, date, author, link) values('hello, world!', 1, '1970-01-01', 'chester mcprofile', 'https://jacobsimonson.me');`, (err, results) => {
							if (err) throw err
							console.log('post added')
							resolve(true)
						})
					})
					promises.push(postAdd)

					const voteAdd = new Promise((resolve, reject) => {
						conn.query(`insert into votes (post_id, user_id) values(1, 1);`, (err, results) => {
							if (err) throw err
							console.log('vote added')
							resolve(true)
						})
					})
					promises.push(voteAdd)

					Promise.all(promises).then(() => {
						resolve(true)
					})
				})
			})
		})
	})
}

module.exports.setup.then(() => {process.exit()})
