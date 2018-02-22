'use strict'

const { Stream } = require('stream')
const Fn = require('./fn')

const globalBefore = []
const globalAfter = []
const globalError = []

module.exports = (next, { before = null, after = null, preventGlobal = false, error = null, intermediate = false, headers = null } = {}) => {
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

      step = 'headers'
      if (headers) {
        if (typeof headers === 'function') {
          res.set(headers(result))
        } else if (typeof headers === 'object') {
          res.set(headers)
        }
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
      const customErr = {
        message : new Error(`Error raised in step ${step}: ${err}`),
        step,
        err,
      }
      if (error) {
        await Fn(error, customErr)
      }
      if (!preventGlobal) {
        for (let errorHandler of globalError) {
          await Fn(errorHandler, customErr)
        }
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
module.exports.addError = (cb) => {
  globalError.push(cb)
}
module.exports.flushError = () => {
  globalError.splice(0, globalError.length)
}
