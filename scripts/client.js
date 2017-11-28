var Data = {};

(function() {

  var profile = function(username) {
    return fetch('/data/profiles/'+username+'.json')
      .then(function(res) { return res.status === 200 ? res.json() : null })
      .then(function(profile) {
        if (profile) {
          profile.joined = new Date(profile.joined)
        }
        return profile
      })
  }

  var follows = function(username, person) {
    return fetch('/data/follows/'+username+'/follows.json')
      .then(function(res) { return res.status === 200 ? res.json() : null })
      .then(function(follows) {
        var followsValue = follows || []
        if (person) person.follows = followsValue
        return followsValue
      })
  }

  var photos = function(username, person) {
    return fetch('/data/photos/'+username+'.json')
      .then(function(res) {
        return res.status === 200 ? res.json() : null
      })
      .then(function(json) {
        var photos = json ? Object.values(json) : []
        if (person) person.photos = photos
        return photos
      })
  }

  var jsonSuffix = function(s) {
    return s.replace(/\.\w+$/,'.json')
  }

  var photo = function(username, image) {
    return fetch('/data/photos/'+username+'/'+jsonSuffix(image))
      .then(function(res) { return res.status === 200 ? res.json() : null })
  }

  var post = function(url, body, headers) {
    return fetch(url, {
      credentials: 'same-origin',
      method: 'POST',
      headers: headers || {},
      body: body
    })
  }

  var postJSON = function(url, obj) {
    return post(url, JSON.stringify(obj), {
      'Content-Type': 'application/json'
    })
  }

  var del = function(url) {
    return fetch(url, {
      credentials: 'same-origin',
      method: 'DELETE'
    })
  }

  var createProfile = function(username) {
    return postJSON('/data/profiles/'+username+'.json', {
      username: username,
      joined: new Date().toISOString()
    })
  }

  Data.currentUser = function() {
    var altcloudCookie = Cookies.get('_acu')
    var username = altcloudCookie && JSON.parse(altcloudCookie).username
    return username
  }

  Data.deletePhoto = function(username, image) {
    return del('/data/images/'+username+'/'+image)
      .then(function() {
        return del('/data/photos/'+username+'/'+jsonSuffix(image))
      })
  }

  Data.upload = function(blob) {
    var createdAt = new Date()
    var basename = createdAt.toISOString().replace(/[T:.]/g,'-')
    var imageName = basename+'.jpg'
    var currentUser = Data.currentUser()
    return post('/data/images/'+currentUser+'/'+imageName, blob, { 'Content-Type':'image/jpeg' })
      .then(function(res) {
        console.log("posted image, response:", res)
        if (res.status === 201) {
          return postJSON('/data/photos/'+currentUser+'/'+basename+'.json', {
            created: createdAt.toISOString(),
            image: imageName
          })
        } else {
          throw new Error("Response was " + res.status)
        }
      })
  }

  Data.follow = function(username, follow) {
    return follows(Data.currentUser())
      .then(function(currentFollowList) {
        var newFollowList = []
        if (follow) {
          newFollowList = currentFollowList.concat(username)
        } else {
          newFollowList = currentFollowList.filter(function(u) { return u !== username })
        }
        return postJSON('/data/follows/'+Data.currentUser()+'/follows.json', newFollowList)
      })
  }

  Data.photo = function(username, image) {
    return photo(username, image)
      .then(function(photo) {
        photo.created = new Date(photo.created)
        return photo
      })
  }

  Data.user = function(username, opts) {
    if (!opts) opts = {}
    return profile(username)
      .then(function(person) {
        var fetches = []
        if (opts.createProfile) fetches.push(createProfile(username))
        if (opts.follows) fetches.push(follows(username, person))
        if (opts.photos) fetches.push(photos(username, person))
        return Promise.all(fetches)
          .then(function() {
            return person
          })
      })
  }

})()
