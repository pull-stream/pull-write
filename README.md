# pull-write

base class for creating generic pull-sinks
that write to some device via an async call.


## Write(asyncWrite, lengthReduce, max, cb)

### asyncWrite(ary, cb)

async function called with an array of items to output.
This function will only ever be called once at a time (per instance),
and while it is working `pull-write` will buffer any subsequent writes,
until the buffer has the length of at most `max`,
or `asyncWrite` has called back.

### lengthReduce(length, item)

`length` is the current length of the buffer.
`item` is a piece of data about to be added to the internal buffer,
`lengthReduce` must return the length of the buffer plus this item.

if `lengthReduce` is not provided, it will default to count the number of elements in the buffer.

### max

A number, when the internal buffer gets this big it will stop reading more,
until asyncWrite calls back.

## example

Suppose we want a to take a stream of values from one leveldb,
and write it to another. If we have the timestamp they where written
to the first, we can track that in the second, then it's easy to keep
them both up to date. We just need to always output latest ts separately.

``` js
var Write = require('pull-write')

var LevelWrite = function (db, cb) {
  var max = 100
  return Write(function (ary, cb) {
    var ts = 0
    ary.map(function (e) {
      ts = Math.max(ts, e.ts)
      e.type = 'put'
    })
    //assuming that the incoming data always has a timestamp,
    //write that out to be queried separately.
    ary.push({key: '~meta~ts', value: ts, type: 'put'})

    db.batch(ary, cb)
  }, function (len, data) {
    //since data is json and we havn't serialized it yet,
    //just keep a count instead of calculating the exact length.
    //if the input was buffers, it would be easy to calculate the length.
    return len + 1
  }, max, cb)
}

```


## License

MIT






