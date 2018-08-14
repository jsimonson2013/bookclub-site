module.exports = {
	login: (connection, req, res) => {
		connection.query(`select user_id, default_group_id, groups.name, cast(AES_DECRYPT(pass, '${process.argv[5]}') as char(255)) pass_decrypt, cast(AES_DECRYPT(unique_user_id, '${process.argv[5]}') as char(256)) uniq_decrypt from users inner join groups on groups.group_id=users.default_group_id WHERE email='${req.query.user}';`, (err, rows, fields) => {
			if (err) throw err

			if(!rows.length) res.sendStatus(404)

			else if (rows[0].pass_decrypt == req.query.pass) {
				res.json({
					url: 'https://friendgroup.jacobsimonson.me/html/feed-template.html',
					uid: rows[0].user_id,
					uniq: rows[0].uniq_decrypt,
					gid: rows[0].default_group_id,
					gname: rows[0].name
				})
			}

			else res.sendStatus(404)
		})
	},
	bypass: (connection, req, res) => {
		connection.query(`select user_id, default_group_id, groups.name from users inner join groups on groups.group_id=users.default_group_id WHERE unique_user_id=AES_ENCRYPT('${req.query.user}', '${process.argv[5]}');`, (err, rows, fields) => {
			if (err) throw err

			if(!rows.length) res.sendStatus(404)

			else {
				res.json({
					url: 'https://friendgroup.jacobsimonson.me/html/feed-template.html',
					uid: rows[0].user_id,
					gid: rows[0].default_group_id,
					gname: rows[0].name
				})
			}
		})
	},
	signup: (connection, req, res) => {
		const code = req.query.code

		const first = req.query.first
		const last = req.query.last
		const pass = req.query.pass

		connection.query(`select default_group_id, groups.name, users.email, users.user_id from invitees inner join users on invitees.email=users.email inner join groups on users.default_group_id=groups.group_id where code='${code}';`, (error, rows, fields) => {
			if (error) throw error

			if (!rows[0]) {
				res.sendStatus(404)
				return
			}

			connection.query(`update users set firstname='${first}', lastname='${last}', pass=AES_ENCRYPT('${pass}', '${process.argv[5]}') where email='${rows[0].email}';`, (err, results) => {
				if (err) throw err

				res.cookie('UID', rows[0].user_id, {maxAge: 900000, domain: 'friendgroup.jacobsimonson.me', path:'/', httpOnly: false})

				res.json({
					url: 'https://friendgroup.jacobsimonson.me/html/feed-template.html',
					uid: rows[0].user_id,
					gid: rows[0].default_group_id,
					gname: rows[0].name
				})

				connection.query(`insert into memberships (user_id, group_id) values ('${rows[0].user_id}', '${rows[0].default_group_id}');`, (e, rslts) => {if (e) throw e})

				connection.query(`delete from invitees where code='${code}';`, (e, rslts) => {if (e) throw e})
			})
		})
	}	
}
