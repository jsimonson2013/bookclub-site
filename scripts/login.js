const app = new Vue({
	el: '#login',
	data: {
		user: '',
		pass: ''
	},
	methods: {
		loginUsingInput: () => {
			console.log(app.user, app.pass)
		}
	}
})
