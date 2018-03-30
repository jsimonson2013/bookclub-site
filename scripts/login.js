const app = new Vue({
	el: "#form",
	data: {
		user: "",
		pass: ""
	},
	methods: {
		login: () => {
			const payload = `?user=${document.getElementById('user').value}&pass=${document.getElementById('pass').value}`
			fetch('http://jacobsimonson.me:3000/login/'+payload, {method: 'GET'})
                        .then(res => {return res.json()})
                        .then(res => {
				document.cookie = 'UID='+res.uid+';path=/'
				window.open(res.url, '_self')
                        })
		}
	}
})
