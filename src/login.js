module.exports = {
	login: (connection, req, res) => {
		connection.query(`select fgroups.name, cast(AES_DECRYPT(default_group, '${process.argv[5]}') as char(256)) def_group, cast(AES_DECRYPT(pass, '${process.argv[5]}') as char(255)) pass_decrypt, cast(AES_DECRYPT(unique_user_id, '${process.argv[5]}') as char(256)) uniq_decrypt from users inner join fgroups on fgroups.unique_group_id=users.default_group WHERE email='${req.query.user}';`, (err, rows, fields) => {
			if (err) throw err

			if(!rows.length) res.sendStatus(404)

			else if (rows[0].pass_decrypt == req.query.pass) {
				res.json({
					url: 'https://friendgroup.jacobsimonson.me/html/feed-template.html',
					uniq: rows[0].uniq_decrypt,
					group: rows[0].def_group,
					gname: rows[0].name
				})
			}

			else res.sendStatus(404)
		})
	},
	bypass: (connection, req, res) => {
		connection.query(`select fgroups.name, cast(AES_DECRYPT(default_group, '${process.argv[5]}') as char(256)) def_group from users inner join fgroups on fgroups.unique_group_id=users.default_group WHERE unique_user_id=AES_ENCRYPT('${req.query.user}', '${process.argv[5]}');`, (err, rows, fields) => {
			if (err) throw err

			if(!rows.length) res.sendStatus(404)

			else {
				res.json({
					url: 'https://friendgroup.jacobsimonson.me/html/feed-template.html',
					group: rows[0].def_group,
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

		connection.query(`select cast(AES_DECRYPT(default_group, '${process.argv[5]}') as char(256)) g, cast(AES_DECRYPT(unique_user_id, '${process.argv[5]}') as char(256)) u, fgroups.name, users.email from invitees inner join users on invitees.email=users.email inner join fgroups on users.default_group=fgroups.unique_group_id where code='${code}';`, (error, rows, fields) => {
			if (error) throw error

			if (!rows[0]) {
				res.sendStatus(404)
				return
			}

			connection.query(`update users set firstname='${first}', lastname='${last}', pass=AES_ENCRYPT('${pass}', '${process.argv[5]}') where email='${rows[0].email}';`, (err, results) => {
				if (err) throw err

				res.json({
					url: 'https://friendgroup.jacobsimonson.me/html/feed-template.html',
					uniq: rows[0].u,
					group: rows[0].g,
					gname: rows[0].name
				})

				connection.query(`insert into memberships (uniq_user, uniq_group) values (AES_ENCRYPT('${rows[0].u}', '${process.argv[5]}'), AES_ENCRYPT('${rows[0].g}', '${process.argv[5]}'));`, (e, rslts) => {if (e) throw e})

				connection.query(`delete from invitees where code='${code}';`, (e, rslts) => {if (e) throw e})
			})
		})
	}	
}
