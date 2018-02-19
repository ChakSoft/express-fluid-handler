'use strict'

const { Stream } = require('stream')
const Fn = require('./fn')

const globalBefore = []
const globalAfter = []

module.exports = (next, { before = null, after = null, preventGlobal = false, error = null, intermediate = false } = {}) => {
  return async (req, res, _next) => {
    let step = 'start'
    try {
      if (!preventGlobal) {
        let index = 0
        for (let beforeCb of globalBefore) {
          step = `globalBefore[${index}]`
          req = await Fn(beforeCb, req)
        }
      }

      step = 'before'
      if (before && typeof before === 'function') {
        req = await Fn(before, req)
      }

      step = 'worker'
      let result = null
      if (next) {
        result = await Fn(next, req)
      }

      step = 'after'
      if (after && typeof after === 'function') {
        result = await Fn(after, req, result)
      }

      if (!preventGlobal) {
        let index = 0
        for (let afterCb of globalAfter) {
          step = `globalAfter[${index}]`
          result = await Fn(afterCb, req, result)
        }
      }

      step = 'end'
      if (!intermediate) {
        if (typeof result === 'object') {
          if (result instanceof Stream) {
            return result.pipe(res)
          }
          return res.json(result)
        }
        return res.send(result)
      }
      return _next()
    } catch (err) {
      // Send response with error status and error code
      if (error) {
        error({
          message : new Error(`Error raised in step ${step}: ${err}`),
          step,
          err,
        })
      }
      res.status(err.code || 400)
      return res.json({
        error : err.message,
        ...err.meta,
      })
    }
  }
}

module.exports.addBefore = (cb) => {
  globalBefore.push(cb)
}
module.exports.addAfter = (cb) => {
  globalAfter.push(cb)
}
module.exports.flushBefore = () => {
  globalBefore.splice(0, globalBefore.length)
}
module.exports.flushAfter = () => {
  globalAfter.splice(0, globalAfter.length)
}
