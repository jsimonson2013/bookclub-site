getCookie = key => {
  const id = key + "="

  const decodedCookie = decodeURIComponent(document.cookie)

  for (let cookie of decodedCookie.split(';')){
    while (cookie.charAt(0) == ' '){
      cookie = cookie.substring(1)
    }
    if (cookie.indexOf(id) == 0){
      return cookie.substring(id.length, cookie.length)
    }
  }
  return ''
}
