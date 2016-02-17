var tape = require('tape')
var pull = require('pull-stream')
var cat = require('pull-cat')
var createWrite = require('../')

tape('simple', function (t) {

  var output = []

  pull(
    pull.count(3),
    createWrite(function write(data, cb) {
      output = output.concat(data)
      cb()
    }, null, 10, function (err) {
      if(err) throw err
      t.deepEqual(output, [0, 1,2,3])
      t.end()
    })
  )
})

tape('error', function (t) {
  var err = new Error('read error test')
  pull(
    pull.error(err),
    createWrite(function () { throw new Error('should never happen') },
    null, 10,  function (_err) {
      t.strictEqual(_err, err)
      t.end()
    })
  )
})

tape('write error', function (t) {
  t.plan(2)
  var err = new Error('write error test')
  pull(
    pull.values([1], function (_err) {
      t.strictEqual(_err, err)
    }),
    createWrite(function (_, cb) {
      cb(err)
    }, null, 10, function (_err) {
      t.strictEqual(_err, err)
    })
  )
})

tape('end then write error', function (t) {
  t.plan(1)
  var err = new Error('write error test')
  pull(
    pull.values([1]),
    createWrite(function (_, cb) {
      setImmediate(function () { cb(err) })
    }, null, 10, function (_err) {
      t.strictEqual(_err, err)
    })
  )
})

tape('simple, async', function (t) {

  var output = []

  pull(
    pull.count(3),
    createWrite(function write(data, cb) {
      setImmediate(function () {
        output = output.concat(data); cb()
      })
    }, null, 10, function (err) {
      if(err) throw err
      t.deepEqual(output, [0,1,2,3])
      t.end()
    })
  )
})

tape('read then error', function (t) {
  var err = new Error('read test error')
  var output = []
  pull(
    cat([pull.count(3), pull.error(err)]),
    createWrite(function write(data, cb) {
      console.log('write', data)
      setImmediate(function () {
        output = output.concat(data); cb()
      })
    }, null, 10, function (_err) {
      console.log('ended')
      t.strictEqual(_err, err)
      t.deepEqual(output, [0])
      t.end()
    })
  )
})

