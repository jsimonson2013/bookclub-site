const iso = require('isomorphic-fetch')

fetch('http://localhost:3000/login', {method: 'GET'})
.then(res => {
   console.log(res)
})
