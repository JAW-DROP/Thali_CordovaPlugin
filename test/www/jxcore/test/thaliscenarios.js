"use strict";

var test = require('tape');
var net = require('net');
var randomstring = require('randomstring');
var ThaliEmitter = require('../thali/thaliemitter');

test('ThaliEmitter can call startBroadcasting and endBroadcasting without error', function (t) {
  var e = new ThaliEmitter();

  e.startBroadcasting((+ new Date()).toString(), 5001, function (err1) {
    t.notOk(err1, 'Should be able to call startBroadcasting without error');

    e.stopBroadcasting(function (err2) {
      t.notOk(err2, 'Should be able to call stopBroadcasting without error');
      t.end();
    });
  });
});

test('ThaliEmitter calls startBroadcasting twice with error', function (t) {
  var e = new ThaliEmitter();

  e.startBroadcasting((+ new Date()).toString(), 5001, function (err1) {
    t.notOk(err1, 'Should be able to call startBroadcasting without error');

    e.startBroadcasting((+ new Date()).toString(), 5001, function (err2) {

      t.assert(!!err2, 'Cannot call startBroadcasting twice');

      e.stopBroadcasting(function (err3) {
        t.notOk(err3, 'Should be able to call stopBroadcasting without error');
        t.end();
      });
    });
  });
});

test('ThaliEmitter throws on connection to bad peer', function (t) {
  var e = new ThaliEmitter();

  e.startBroadcasting((+ new Date()).toString(), 5001, function (err1) {
    t.notOk(err1, 'Should be able to call startBroadcasting without error');

    e.connect('foobar', function (err2, port) {
      t.assert(!!err2, 'Should not connect to a bad peer');

      e.stopBroadcasting(function (err3) {
        t.notOk(err3, 'Should be able to call stopBroadcasting without error');
        t.end();
      });
    });
  });
});

test('ThaliEmitter throws on disconnect to bad peer', function (t) {
  var e = new ThaliEmitter();

  e.startBroadcasting((+ new Date()).toString(), 5001, function (err1) {
    t.notOk(err1, 'Should be able to call startBroadcasting without error');

    e.disconnect('foobar', function (err2, port) {
      t.assert(!!err2, 'Disconnect should fail to a non-existant peer ');

      e.stopBroadcasting(function (err3) {
        t.notOk(err3, 'Should be able to call stopBroadcasting without error');
        t.end();
      });
    });
  });
});

function connectWithRetryTestAndDisconnect(t, testFunction) {
  var e = new ThaliEmitter();

  e.on(ThaliEmitter.events.PEER_AVAILABILITY_CHANGED, function (peers) {
    peers.forEach(function (peer) {

      // This will only pick the first available peer
      if (peer.peerAvailable) {
        function connectToPeer(attempts) {
          if (attempts === 0) {
            t.fail('Connecting failed');
            return t.end();
          }

          e.connect(peer.peerIdentifier, function (err2, port) {
            if (err2) {
              return setTimeout(function () { connectToPeer(attempts - 1); }, 1000);
            }

            t.notOk(err2, 'Should be able to connect without error');
            t.ok(port > 0 && port <= 65536, 'Port should be within range');

            testFunction(t, e);

            e.disconnect(peer.peerIdentifier, function (err3) {
              t.notOk(err3, 'Should be able to disconnect without error');

              e.stopBroadcasting(function (err4) {
                t.notOk(err4, 'Should be able to call stopBroadcasting without error');
                t.end();
              });
            });
          });
        }

        connectToPeer(10);
      }
    });
  });

  e.startBroadcasting((+ new Date()).toString(), 5001, function (err1) {
    t.notOk(err1, 'Should be able to call startBroadcasting without error');
  });
}

test('ThaliEmitter can discover and connect to peers', function (t) {
  var e = new ThaliEmitter();

  e.on(ThaliEmitter.events.PEER_AVAILABILITY_CHANGED, function (peers) {
    peers.forEach(function (peer) {

      // This will only pick the first available peer
      if (peer.peerAvailable) {
        function connectToPeer(attempts) {
          if (attempts === 0) {
            t.fail('Connecting failed');
            return t.end();
          }

          e.connect(peer.peerIdentifier, function (err2, port) {
            if (err2) {
              return setTimeout(function () { connectToPeer(attempts - 1); }, 1000);
            }

            t.notOk(err2, 'Should be able to connect without error');
            t.ok(port > 0 && port <= 65536, 'Port should be within range');

            e.disconnect(peer.peerIdentifier, function (err3) {
              t.notOk(err3, 'Should be able to disconnect without error');

              e.stopBroadcasting(function (err4) {
                t.notOk(err4, 'Should be able to call stopBroadcasting without error');
                t.end();
              });
            });
          });
        }

        connectToPeer(10);
      }
    });
  });

  e.startBroadcasting((+ new Date()).toString(), 5001, function (err1) {
    t.notOk(err1, 'Should be able to call startBroadcasting without error');
  });
});

test('ThaliEmitter can discover and connect to peers and then fail on double connect', function (t) {
  var e = new ThaliEmitter();

  e.on(ThaliEmitter.events.PEER_AVAILABILITY_CHANGED, function (peers) {
    peers.forEach(function (peer) {

      // This will only pick the first available peer
      if (peer.peerAvailable) {
        function connectToPeer(attempts) {
          if (attempts === 0) {
            t.fail('Connecting failed');
            return t.end();
          }

          e.connect(peer.peerIdentifier, function (err2, port) {
            if (err2) {
              return setTimeout(function () { connectToPeer(attempts - 1); }, 1000);
            }

            t.notOk(err2, 'Should connect without error');
            t.ok(port > 0 && port <= 65536, 'Port should be within range');

            e.connect(peer.peerIdentifier, function(err3, port) {
              t.ok(err3, 'Should fail on double connect');

              e.disconnect(peer.peerIdentifier, function (err4) {
                t.notOk(err4, 'Should be able to disconnect without error');

                e.stopBroadcasting(function (err4) {
                  t.notOk(err4, 'Should be able to call stopBroadcasting without error');
                  t.end();
                });
              });
            });
          });
        }
        connectToPeer(10);
      }
    });
  });

  e.startBroadcasting((+ new Date()).toString(), 5001, function (err1) {
    t.notOk(err1, 'Should be able to call startBroadcasting without error');
  });
});

test('ThaliEmitter can discover and connect to peers and then fail on double disconnect', function (t) {
  var e = new ThaliEmitter();

  e.on(ThaliEmitter.events.PEER_AVAILABILITY_CHANGED, function (peers) {
    peers.forEach(function (peer) {

      // This will only pick the first available peer
      if (peer.peerAvailable) {
        function connectToPeer(attempts) {
          if (attempts === 0) {
            t.fail('Connecting failed');
            return t.end();
          }

          e.connect(peer.peerIdentifier, function (err2, port) {
            if (err2) {
              return setTimeout(function () { connectToPeer(attempts - 1); }, 1000);
            }

            t.notOk(err2, 'Should be able to connect without error');
            t.ok(port > 0 && port <= 65536, 'Port should be within range');

            e.disconnect(peer.peerIdentifier, function(err3) {
              t.notOk(err3, 'Should be able to disconnect without error')

              e.disconnect(peer.peerIdentifier, function (err4) {
                t.ok(err4, 'Disconnect should fail ');

                e.stopBroadcasting(function (err5) {
                  t.notOk(err5, 'Should be able to call stopBroadcasting without error');
                  t.end();
                });
              });
            });
          });
        }
        connectToPeer(10);
      }
    });
  });

  e.startBroadcasting((+ new Date()).toString(), 5001, function (err1) {
    t.notOk(err1, 'Should be able to call startBroadcasting without error');
  });
});

test('ThaliEmitter can connect and send data', function (t) {
  var e = new ThaliEmitter();

  var len = 200;
  var testMessage = randomstring.generate(len);

  e.on(ThaliEmitter.events.PEER_AVAILABILITY_CHANGED, function (peers) {
    peers.forEach(function (peer) {

      // This will only pick the first available peer
      if (peer.peerAvailable) {
        function connectToPeer(attempts) {
          if (attempts === 0) {
            t.fail('Connecting failed');
            return t.end();
          }

          e.connect(peer.peerIdentifier, function (err2, port) {
            if (err2) {
              return setTimeout(function () { connectToPeer(attempts - 1); }, 1000);
            }

            t.notOk(err2, 'Should connect to peer without error');
            t.ok(port > 0 && port <= 65536, 'Port should be within range');

            var clientSocket = net.createConnection( { port: port }, function () {
              clientSocket.write(testMessage);
            });

            clientSocket.setTimeout(120000);
            clientSocket.setKeepAlive(true);

            var testData = '';

            clientSocket.on('data', function (data) {
              testData += data;

              if (testData.length === len) {
                t.equal(testData, testMessage, 'the test messages should be equal');

                e.disconnect(peer.peerIdentifier, function (err3) {
                  t.notOk(err3, 'Should be able to disconnect without error');

                  e.stopBroadcasting(function (err4) {
                    t.notOk(err4, 'Should be able to call stopBroadcasting without error');
                    t.end();
                  });
                });
              }
            });
          });
        }

        connectToPeer(10);
      }
    });
  });

  e.startBroadcasting((+ new Date()).toString(), 5001, function (err1) {
    t.notOk(err1, 'Should be able to call startBroadcasting without error');
  });
});
