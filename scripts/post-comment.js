var app = new Vue({
  el: 'form',
  data: {
    pid: getCookie('PID'),
    uid: getCookie('UID')
  },
  computed: {
    timestamp: () => {
      return new Date().toISOString().slice(0,19).replace('T', ' ')
    }
  }
})
