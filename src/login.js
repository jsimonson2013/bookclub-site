const BASE_URL = "https://friendgroup.jacobsimonson.me"
const FEED_TEMPLATE = "/html/feed-template.html"

const qh = require('./query-helper')

module.exports = {
	login: (connection, req, res) => {
		connection.query(`select fgroups.name, ${qh.decrypt('default_group', 'def_group')}, ${qh.decrypt('pass', 'pass_decrypt')}, ${qh.decrypt('unique_user_id', 'uniq_decrypt')} from users inner join fgroups on fgroups.unique_group_id=users.default_group WHERE email='${req.query.user}';`, (err, rows, fields) => {
			if (err) throw err

			if (!rows.length) res.sendStatus(404)

			else if (rows[0].pass_decrypt == req.query.pass) res.json({ url: `${BASE_URL}${FEED_TEMPLATE}`, uniq: rows[0].uniq_decrypt, group: rows[0].def_group, gname: rows[0].name })

			else res.sendStatus(404)
		})
	},
	bypass: (connection, req, res) => {
		connection.query(`select fgroups.name, ${qh.decrypt('default_group', 'def_group')} from users inner join fgroups on fgroups.unique_group_id=users.default_group WHERE unique_user_id=${qh.encrypt(req.query.user)};`, (err, rows, fields) => {
			if (err) throw err

			if (!rows.length) res.sendStatus(404)

			else res.json({ url: `${BASE_URL}${FEED_TEMPLATE}`, group: rows[0].def_group, gname: rows[0].name })
		})
	},
	signup: (connection, req, res) => {
		const {code, first, last, pass} = req.query

		connection.query(`select ${qh.decrypt('default_group', 'g')}, ${qh.decrypt('unique_user_id', 'u')}, fgroups.name, users.email from invitees inner join users on invitees.email=users.email inner join fgroups on users.default_group=fgroups.unique_group_id where code='${code}';`, (error, rows, fields) => {
			if (error) throw error

			if (!rows[0]) res.sendStatus(404)

			else {
				connection.query(`update users set firstname='${first}', lastname='${last}', pass=${qh.encrypt(pass)}, notifications_on=1 where email='${rows[0].email}';`, (err, results) => {
					if (err) throw err

					res.json({ url: `${BASE_URL}${FEED_TEMPLATE}`, uniq: rows[0].u, group: rows[0].g, gname: rows[0].name })

					connection.query(`insert into memberships (uniq_user, uniq_group) values (${qh.encrypt(rows[0].u)}, ${qh.encrypt(rows[0].g)});`, (error, results) => {if (error) throw error})
					connection.query(`delete from invitees where code='${code}';`, (error, results) => {if (error) throw error})
				})
			}
		})
	}	
}
