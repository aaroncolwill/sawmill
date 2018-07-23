![SawmillJS](https://i.imgur.com/AEQzPpp.png "SawmillJS")

# SawmillJS
## Quickly cut logs down to size and convert to valid JSON 

SawmillJS is a logging utility that stores valid JSON, many other logging utilities don't log as valid JSON so this was created to do exactly that.

# Installation

Install as a dependency

``` npm i sawmill ```

Require the utility with

```js 
const sawmill = require('sawmilljs'); 
```

Create a simple configuration

```js 
sawmill.createLog({
    name: 'combined',   // unique name for this logfile, will save to `logs/combined.log`
    directory: 'logs',  // directory to store logs
    toconsole: false,   // console.log() called for every line
    tags: ['*']         // .log() .info() .debug() .warn() .error() .critical()
});
```

Now start logging some of your functionality with this example express app

```js
// required: 'npm install sawmilljs'
// required: 'npm install express' 
const sawmill = require('sawmilljs');
const express = require('express');
const app = express();
const port = 8080;
 
sawmill.createLog({
    name: 'debug-info',         // unique name for this logfile, will save to `logs/debug-info.log`
    directory: 'logs',          // directory to store logs
    toconsole: true,            // console.log() called for every line
    tags: ['*']                 // .log() .info() .debug() .warn() .error() .critical()
});
app.get('/', (req,res) => {
    `GET Request for '/' from ${req.hostname}`.debug();
});
app.get('/logs', (req,res) => {
    `GET Request for '/logs' from ${req.hostname}`.info();
    sawmill.get('debug-info', (err, log) => {
        res.json(log);
    });
});
app.listen(port, () => {
    `App listening on port: ${port}`.info();
})
```

# Supported logging tags

All tags can be called as extensions to the `{String}` type i.e. `"hello world".info()` would log the text 'hello world' with the [info] tag.

There may be some support for custom tags in the future.

* .log();
* .info();
* .debug();
* .warn();
* .error();
* .critical();

# Features to be added

1. Auto Log rotation
2. Auto tagging content for a specific log via predicates/selectors

# Known issues

* Pug view engine mangles prototype extensions
    * Fix: set 'extendObject' to false when calling: *.createLog({ extendObject: false })* - needs a better fix