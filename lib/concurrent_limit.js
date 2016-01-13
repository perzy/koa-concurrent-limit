/*!
 * koa-concurrent-limit - lib/concurrent_limit.js
 * Copyright(c) 2014 jerry wu <perzy_wu@163.com>
 * MIT Licensed
 */

'use strict';

/**
 * Module dependencies
 */
const _     = require('lodash');
const debug = require('debug')('koa:concurrent:limit');

const defaultOptions = {
  max: 50000,
  timeout: 20, // seconds
  store: '',
  clientFactory: null,
  prefix: 'koa-concurrent-limit',
  message: 'request concurrent limited'
};

function counterKey( prefix ) {
  return `${prefix}:request:count`;
}

function queueKey( prefix ) {
  return `${prefix}:signal:list`;
}

/**
 * Module exports
 */
module.exports = function ( options ) {
  options = _.merge(defaultOptions, options || {});
  console.log(options);

  return function* concurrent( next ) {
    const store     = options.store;
    let storeClient = null;
    const ip        = this.ip;

    // ++
    const beforeReqCount = yield store.incr(counterKey(options.prefix));
    debug('before request count %s', beforeReqCount);
    if ( beforeReqCount <= options.max ) {
      debug('request count less then max concurrent count, go next');
      yield next;
    } else {
      storeClient  = options.clientFactory();
      debug('request count greater then max concurrent count, should wait until signal');
      const signal = yield storeClient.blpop(queueKey(options.prefix), options.timeout);
      if ( !signal ) {
        debug('wait signal timeout, return error message');
        yield store.decr(counterKey(options.prefix));
        storeClient.end();
        // block until timeout , cannot get the signal, so should return.
        this.body = options.message;
        return;
      }

      debug('got a signal before timeout, go next');
      yield next;
    }
    // finish current request ,count --
    const afterReqCount = yield store.decr(counterKey(options.prefix));
    debug('after request count %s', afterReqCount);
    if ( afterReqCount >= options.max ) {
      // push signal
      yield storeClient.lpush(queueKey(options.prefix), 1);
    }

    storeClient.end();
  };
};
