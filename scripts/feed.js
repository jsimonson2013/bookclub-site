let posts = []

window.onload = () => {
  fetch('http://jacobsimonson.me:3000/feed', {method: 'GET'})
  .then( res => {return res.json()})
  .then( res => {for(post of res) posts.push(post)})
}

const app = new Vue({
  el: '#feed-list',
  data: {
    posts
  }
})
