'use strict'

module.exports = async (fn, ...args) => {
  let result = fn(...args)
  if (result instanceof Promise) {
    result = await result
  }
  return result
}
