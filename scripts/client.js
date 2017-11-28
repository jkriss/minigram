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
