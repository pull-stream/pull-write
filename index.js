//another idea: buffer 2* the max, but only call write with half of that,
//this could manage cases where the read ahead is latent. Hmm, we probably
//shouldn't guess at that here, just handle write latency.

//how would we measure this anyway?

function count (length, item) {
  return length + 1
}

module.exports = function (write, reduceLength, max, cb) {
  reduceLength = reduceLength || count
  var ended
  return function (read) {
    var queue = [], writing = false, length = 0

    function flush () {
      if(writing) return
      var _queue = queue
      queue = []
      writing = true
      length = 0
      write(_queue, function (err) {
        writing = false
        if(ended === true && !length) cb(err)
        else if(ended && ended !== true) cb(err || ended)
        else if(err) read(ended = err, cb) //abort upstream.
        else if(length) flush()
      })
    }

    read(null, function next (end, data) {
      if(ended) return
      ended = end
      if(!ended) {
        queue.push(data); length = reduceLength(length, data); flush()
        if(length < max) read(null, next)
      }
      else if(!writing) cb(ended === true ? null : ended)
    })
  }
}


