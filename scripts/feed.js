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
  },
  methods: {
    openPost: loc => {
      window.open('http://' + loc)
    },
    voteOnPost: id => {
      console.log(getCookie('UID'))
    }, 
    viewComments: id => {
      document.cookie = 'PID='+id+';path=/'
    }
  }
})
