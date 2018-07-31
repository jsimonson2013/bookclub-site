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

/**
 * Bypasses login call. This is called if the client has a cookie with the 
 * user id stored.
 */
app.get('/bypass', (req, res) => {
	login.bypass(connection, req, res)
})

/**
 * Changes the users default group.
 */
app.get('/change-group', (req, res) => {
	user.changeDefault(connection, req, res)
})

/**
 * Gets comments for a post using the post as the parent to search among other
 * posts that could be comments.
 */
app.get('/comments', (req, res) => {
	post.getComments(connection, req, res)
})

/**
 * Post a new comment - a special type of post.
 */
app.post('/comments', (req, res) => {
	post.newComment(connection, req, res)
})

/**
 * Creates a new group.
 */
app.get('/create-group', (req, res) => {
	user.createGroup(connection, req, res)
})

/**
 * Create a new profile.
 */
app.get('/create-profile', (req, res) => {
	user.createProfile(connection, req, res)
})

/**
 * Get the default group of a user.
 */
app.get('/default-group', (req, res) => {
	user.defaultGroup(connection, req, res)
})

/**
 * Get the feed content for a group given a start date.
 */
app.get('/feed', (req, res) => {
	connection.query(`select content, post_id, link, author, date from posts where group_id=${req.query.group_id} and parent_id is NULL and DATE(date) < DATE('${req.query.start_date}') order by DATE(date) desc limit 10;`, (err, rows, fields) => {
		if (err) throw err

		if(rows.length < 1) return

		res.json(rows)
	})
})

/**
 * Get groups a user is a member of.
 */
app.get('/groups', (req, res) => {
	user.getGroups(connection, req, res)
})

/**
 * Increment a user's score.
 */
app.get('/increment-score', (req, res) => {
	user.incrementScore(connection, req, res)
})

/**
 * Invite a new user.
 */
app.get('/invite', (req, res) => {
	user.invite(connection, req, res)
})

/**
 * Remove user from group by deleting membership.
 */
app.get('/leave-group', (req, res) => {
	user.leaveGroup(connection, req, res)
})

/**
 * Set login state for user's client.
 */
app.get('/login', (req, res) => {
	login.login(connection, req, res)
})

/**
 * Get number of comments for a post.
 */
app.get('/num-comments', (req, res) => {
	post.getNumComments(connection, req, res)
})

/**
 * Update users password to new password.
 */
app.post('/pass', (req, res) => {
	user.updatePass(connection, req, res)
})

/**
 * Get user's profile information.
 */
app.get('/profile', (req, res) => {
	user.getProfile(connection, req, res)
})

/**
 * Reset user's password to random password and send them and email with it.
 */
app.get('/reset-pass', (req, res) => {
	user.resetPass(connection, req, res)
})

/**
 * Get user's score.
 */
app.get('/score', (req, res) => {
	user.getScore(connection, req, res)
})

/**
 * Signup an invited user.
 */
app.get('/signup', (req, res) => {
	login.signup(connection, req, res)
})

/**
 * Post new post to group for user.
 */
app.post('/submission', (req, res) => {
	post.newPost(connection, req, res)
})

/**
 * Post new vote on post for user.
 */
app.post('/vote', (req, res) => {
	post.vote(connection, req, res)
})

/**
 * Get votes for post.
 */
app.get('/votes', (req, res) => {
	post.getVotes(connection, req, res)
})

/**
 * Get votes for posts by user.
 */
app.get('/votes-by-user', (req, res) => {
	user.getVotes(connection, req, res)
})
