'use strict';

var util     = require('util');
var inherits = util.inherits;

var assert       = require('assert');
var objectAssign = require('object-assign');
var Promise      = require('bluebird');
var nssocket     = require('nssocket');

var asserts = require('./utils/asserts');
var logger  = require('./utils/ThaliLogger')('Client');

var ServerSocket = require('./ServerSocket');

var address = require('./server-address');
asserts.isString(address);


function Client (options) {
  this._setOptions(options);

  this._isClosed = false;
  this._isEnded  = false;

  this._bind();
}

inherits(Client, ServerSocket);

Client.prototype.logger = logger;

Client.prototype.defaults = {
  port: 3000,
  type: 'tcp4', // 'tcp4' or 'tls'

  reconnectionAttempts: 10,
  reconnectionDelay:    2 * 1000,
  keepAliveTimeout:     3 * 1000
};

Client.prototype._setOptions = function (options) {
  if (options) {
    asserts.isObject(options);
  }
  this._options = objectAssign({}, this.defaults, options);

  asserts.isNumber(this._options.port);
  assert(
    this._options.type === 'tcp4' ||
    this._options.type === 'tls',
    '\'type\' should equals \'tcp4\' or \'tls\''
  );

  asserts.isNumber(this._options.reconnectionAttempts);
  asserts.isNumber(this._options.reconnectionDelay);
  asserts.isNumber(this._options.keepAliveTimeout);
}

Client.prototype._bind = function () {
  this._socket = new nssocket.NsSocket({
    type: this._options.type,

    reconnect:     true,
    maxRetries:    this._options.reconnectionAttempts,
    retryInterval: this._options.reconnectionDelay
  });
  this._socket.setKeepAlive(true, this._options.keepAliveTimeout);

  Client.super_.prototype._bind.call(this);

  logger.debug('connecting to \'%s:%d\'', address, this._options.port);
  this._socket.connect(this._options.port, address, this._connect.bind(this));
}

Client.prototype._connect = function () {
  logger.debug('we are connected to server');
}

Client.prototype.disconnect = Client.prototype.close;

module.exports = Client;