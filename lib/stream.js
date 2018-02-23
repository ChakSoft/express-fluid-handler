'use strict'

/**
 * Take data from a readable stream and pipe it into a writable stream as promise with error handling
 * @param {Stream} readable Readable stream
 * @param {Stream} writable Writable stream
 * @return {Promise} Worker promise
 */
module.exports = (readable, writable) => {
  return new Promise((resolve, reject) => {
    readable
      .on('finish', resolve)
      .on('error', (err) => {
        writable.close()
        reject(err)
      })
      .pipe(writable)
  })
}
