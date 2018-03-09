let user = []

window.onload = () => {
  fetch('http://jacobsimonson.me:3000/profile/?user_id=2', {method: 'GET'})
  .then( res => {return res.json()})
  .then( res => {for (item of res) user.push(item)})
}

const app = new Vue({
  el: '#profile',
  data: {
    user
  }
})
