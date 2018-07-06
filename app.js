'use strict'

const express = require('express')
const app = express()
const bp = require('body-parser')

const mysql = require('mysql')
const cp = require('cookie-parser')
const cors = require('cors')

const connection = mysql.createConnection({
	host: 'localhost',
	user: process.argv[2],
	password: process.argv[3],
	database: process.argv[4]
})

const login = require('./src/login')
const user = require('./src/user')
const post = require('./src/post')

app.use(bp.json())
app.use(cp())
app.use(cors())

app.listen(3000, () => {
	console.log('App listening on port 3000!')
})

app.get('/bypass', (req, res) => {
	login.bypass(connection, req, res)
})

app.get('/change-group', (req, res) => {
	user.changeDefault(connection, req, res)
})

app.get('/comments', (req, res) => {
	post.getComments(connection, req, res)
})

app.post('/comments', (req, res) => {
	post.newComment(connection, req, res)
})

app.get('/create-group', (req, res) => {
	user.createGroup(connection, req, res)
})

app.get('/create-profile', (req, res) => {
	user.createProfile(connection, req, res)
})

app.get('/feed', (req, res) => {
	connection.query(`select content, post_id, link, author, date from posts where group_id=${req.query.group_id} and parent_id is NULL and DATE(date) < DATE('${req.query.start_date}') order by DATE(date) desc limit 10;`, (err, rows, fields) => {
		if (err) throw err

		if(rows.length < 1) return

		res.json(rows)
	})
})

app.get('/groups', (req, res) => {
	user.getGroups(connection, req, res)
})

app.get('/increment-score', (req, res) => {
	user.incrementScore(connection, req, res)
})

app.get('/invite', (req, res) => {
	user.invite(connection, req, res)
})

app.get('/leave-group', (req, res) => {
	user.leaveGroup(connection, req, res)
})

app.get('/login', (req, res) => {
	login.login(connection, req, res)
})

app.get('/num-comments', (req, res) => {
	post.getNumComments(connection, req, res)
})

app.post('/pass', (req, res) => {
	user.updatePass(connection, req, res)
})

app.get('/profile', (req, res) => {
	user.getProfile(connection, req, res)
})

app.get('/reset-pass', (req, res) => {
	user.resetPass(connection, req, res)
})

app.get('/score', (req, res) => {
	user.getScore(connection, req, res)
})

app.get('/signup', (req, res) => {
	login.signup(connection, req, res)
})

app.post('/submission', (req, res) => {
	post.newPost(connection, req, res)
})

app.post('/vote', (req, res) => {
	post.vote(connection, req, res)
})

app.get('/votes', (req, res) => {
	post.getVotes(connection, req, res)
})

app.get('/votes-by-user', (req, res) => {
	user.getVotes(connection, req, res)
})
