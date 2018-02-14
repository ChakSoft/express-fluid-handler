/* eslint-disable no-undef */
'use strict'

let fakeRequest = {}

let fakeResponse = {
  send(data) {
    return data
  },
  json(data) {
    return data
  }
}

const Handler = require('../lib')

beforeEach(() => {
  fakeRequest = {}
  Handler.flushBefore()
  Handler.flushAfter()
})

test('Handling not promise response', async (done) => {
  const result = await (Handler(() => {
    return 'test succeed'
  })(fakeRequest, fakeResponse))
  expect(result).toBe('test succeed')
  done()
})

test('Handling promise response', async (done) => {
  const result = await (Handler(() => {
    return Promise.resolve('test succeed')
  })(fakeRequest, fakeResponse))
  expect(result).toBe('test succeed')
  done()
})

test('Handling before callbacks', async (done) => {
  const result = await (Handler((req) => {
    return Promise.resolve(req.beforeData)
  }, {
    before : (req) => {
      req.beforeData = 'test succeed'
      return req
    }
  })(fakeRequest, fakeResponse))
  expect(result).toBe('test succeed')
  done()
})

test('Handling after callback', async (done) => {
  const result = await (Handler(() => {
    return Promise.resolve('test succeed')
  }, {
    after : (req, result) => {
      result = `after: ${result}`
      return result
    }
  })(fakeRequest, fakeResponse))
  expect(result).toBe('after: test succeed')
  done()
})

test('Handling coupled callbacks', async (done) => {
  const result = await (Handler((req) => {
    return Promise.resolve(`${req.source} : test succeed`)
  }, {
    before : (req) => {
      req.source = '127.0.0.1'
      req.destination = 'localhost'
      return req
    },
    after : (req, result) => {
      result = `${req.source} to ${req.destination} : test succeed`
      return result
    }
  })(fakeRequest, fakeResponse))
  expect(result).toBe('127.0.0.1 to localhost : test succeed')
  done()
})

test('Handling global before callbacks', async (done) => {
  Handler.addBefore((req) => {
    req.env = 'test'
    return req
  })
  const result = await (Handler((req) => {
    return Promise.resolve(`Environment : ${req.env}`)
  })(fakeRequest, fakeResponse))
  expect(result).toBe('Environment : test')
  done()
})

test('Handling global after callbacks', async (done) => {
  Handler.addAfter((req, result) => {
    result = {
      nano : result,
      env : 'test'
    }
    return result
  })
  const result = await (Handler(() => {
    return Promise.resolve('test succeed')
  })(fakeRequest, fakeResponse))
  expect(result.nano).toBe('test succeed')
  expect(result.env).toBe('test')
  done()
})

test('Handling all callbacks', async (done) => {
  Handler.addBefore((req) => {
    req.env = 'test'
    return req
  })
  Handler.addAfter((req, result) => {
    return {
      nano : result,
      env : req.env,
    }
  })
  const result = await (Handler(() => {
    return Promise.resolve('test succeed')
  }, {
    before : (req) => {
      req.destination = 'localhost'
      return req
    },
    after : (req, result) => {
      result = `Destination: ${req.destination}; Message: ${result}`
      return result
    }
  })(fakeRequest, fakeResponse))
  expect(result.nano).toBe('Destination: localhost; Message: test succeed')
  expect(result.env).toBe('test')
  done()
})

test('Handling with prevent global', async (done) => {
  Handler.addBefore((req) => {
    req.env = 'test'
    return req
  })
  const result = await (Handler((req) => {
    return Promise.resolve(req.env || 'dummy env')
  }, {
    preventGlobal : true
  })(fakeRequest, fakeResponse))
  expect(result).toBe('dummy env')
  done()
})

test('Handling with object', async (done) => {
  const result = await (Handler(() => {
    return { test : 'succeed' }
  })(fakeRequest, fakeResponse))
  expect(result).toHaveProperty('test', 'succeed')
  done()
})
