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
      const payload = `post_id=${id}&user_id=${getCookie('UID')}`

      fetch('http://jacobsimonson.me:3000/vote/', {method: 'POST', body: payload})
    }, 
    viewComments: id => {
      document.cookie = 'PID='+id+';path=/'
    },
    body: content => {
      return decodeURIComponent(content)
    }
  }
})
