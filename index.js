//another idea: buffer 2* the max, but only call write with half of that,
//this could manage cases where the read ahead is latent. Hmm, we probably
//shouldn't guess at that here, just handle write latency.

//how would we measure this anyway?

function append (array, item) {
  (array = array || []).push(item)
  return array
}

module.exports = function (write, reduce, max, cb) {
  reduce = reduce || append
  var ended
  return function (read) {
    var queue = null, writing = false, length = 0

    function flush () {
      if(writing) return
      var _queue = queue
      queue = null; writing = true; length = 0
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
        queue = reduce(queue, data)
        length = (queue && queue.length) || 0
        flush()
        if(length < max) read(null, next)
      }
      else if(!writing) cb(ended === true ? null : ended)
    })
  }
}





