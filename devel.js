global.BABEL_IS_RUNNING = true

console.log('Running in developer (babel-node) mode')

var rimraf = require('rimraf')
var mkdirp = require('mkdirp')
var path = require('path')
// synchronized init, preparing paths
// rimraf.sync(path.join(__dirname, 'tmp'))
mkdirp.sync(path.join(__dirname, 'tmp'))
mkdirp.sync(path.join(__dirname, 'media'))
mkdirp.sync(path.join(__dirname, 'download'))

global.tmpPath = path.join(__dirname, 'tmp')
global.mediaPath = path.join(__dirname, 'media')
global.downloadPath = path.join(path.join(__dirname, 'download'))


require('babel-register')
require('./node/app')


