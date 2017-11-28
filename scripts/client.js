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

  Data.currentUser = function() {
    var altcloudCookie = Cookies.get('_acu')
    var username = altcloudCookie && JSON.parse(altcloudCookie).username
    return username
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
        return fetch('/data/follows/'+Data.currentUser()+'/follows.json', {
          credentials: 'same-origin',
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(newFollowList)
        })
      })
  }

  Data.user = function(username, opts) {
    if (!opts) opts = {}
    return profile(username)
      .then(function(person) {
        var fetches = []
        if (opts.follows) fetches.push(follows(username, person))
        if (opts.photos) fetches.push(photos(username, person))
        return Promise.all(fetches)
          .then(function() {
            return person
          })
      })
  }

})()
