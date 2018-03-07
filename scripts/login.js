const app = new Vue({
  el: '#login',
  data: {
    user: '',
    pass: ''
  },
  methods: {
    loginUsingInput: () => {
      fetch(`http://jacobsimonson.me:3000/?user=${app.user}&pass=${app.pass}`, {method: 'GET'})
    }
  }
})
