# express-fluid-handler
Fluid Request Response ExpressJS handler

## Installation

```
npm install --save express-fluid-handler
```

## Usage

```javascript
const Handler = require('express-fluid-handler')
const { Router } = require('express')

const router = Router()
router.get('/', Handler((req) => {
  // Do some logic and return a result.
}))
```

## Reference

`Handler(callback, [options])`

| Option | Description
| ------ | -----------
| `callback` | Mandatory callback which returns the result to be sent into the response
| `options` | Optional callbacks applied before or after the main `callback`
| `options.before(req)` | `Function` called just before the `callback` is called. It takes the request object in first and only argument. This function **MUST** return the request object.
| `options.after(req, result)` | `Function` called just after the `callback` has been called. It takes the request object and the result of the `callback` as arguments. This function **MUST** return the result.
| `options.preventGlobal` | `Boolean` which determines if the given handler execution must avoid global `before` and `after` callbacks. Local callbacks are executed only with this option to `true`.

`Handler.addBefore(callback)`

Adds a global before callback, which is applied before `options.before` callback. You can add as many *before* callbacks as you want, but ensure they all returns the request object.

̀`Handler.addAfter(callback)`

Adds a global after callback, which is applied just before the result is sent into the Express response object. You can add as many *after* callbacks as you want, but ensure they all returns the result.

> Whatever they are before or after callbacks, they are executed in the exact same order as they have been added.

## Examples

You can read the `test/lib.spec.js` test file to check what is possible with this library.

## Contributing

Feel free to fork this project and make it progress by submit PRs.

Ensure the tests are running by launch `npm run test` before submit any PR. A PR where tests are not running will be immediately declined.

## License

This software is licensed under GNU GPL v3.
