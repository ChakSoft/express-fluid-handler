'use strict'

const Fn = require('./fn')

const globalBefore = []
const globalAfter = []

module.exports = (next, { before = null, after = null } = {}) => {
  return async (req, res) => {
    try {
      for (let beforeCb of globalBefore) {
        req = await Fn(beforeCb, req)
      }

      if (before && typeof before === 'function') {
        req = await Fn(before, req)
      }

      let result = await Fn(next, req)

      if (after && typeof after === 'function') {
        result = await Fn(after, req, result)
      }

      for (let afterCb of globalAfter) {
        result = await Fn(afterCb, req, result)
      }

      if (typeof result === 'object') {
        return res.json(result)
      }
      return res.send(result)
    } catch (err) {
      // Send response with error status and error code
      if (err.code) {
        res.status(err.code)
      }
      res.json({
        error : err.message,
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
