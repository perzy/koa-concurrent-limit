koa-concurrent-limit 
=========

koa middleware for concurrent request limit

## Install

```
$ npm install koa-concurrent-limit
```

## Usage

```js
const koa = require('koa');
const _ = require('lodash');
const favicon = require('koa-favicon');
const concurrentLimit = require('koa-concurrent-limit');
const Redis = require('ioredis');

const redisClientFactory = function(options){
  options = options || {};
  
  const redisOptions = {
    host: '127.0.0.1',
    port: 3306,
    password: ''
  };
  
  options = _.merge(redisOptions,options);
  return new Redis(options); 
}

const app = koa();
// If you are using reverse proxy on the front of node, like 'nginx', please set this
// app.proxy = true;
app.use(favicon());
app.use(concurrentLimit({
  store: redisClientFactory(),
  clientFactory: redisClientFactory
}));

app.use(function *() {
  this.body = 'hello';
});

app.listen(3000);
```

### Options

* **max**: max request number, default is 50000.
* **prefix**: prefix key, for isolate different koa--concurrent-limit, default is `koa-concurrent-limit`, if you want to use more than one `koa-concurrent-limit` in a project, you must set different token!!
* **store**: a redis store.
* **clientFactory**: a redis client factory function.
* **timeout**: redis signal wait timeout ,unit seconds.
* **message**: forbidden message, defautl is 'request concurrent limited'.

## Authors

```
jerrywu <perzy_wu@163.com>
```

## License

The MIT License (MIT)

Copyright (c) 2014 jerrywu

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.%
