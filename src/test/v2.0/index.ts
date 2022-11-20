export * from "./testSuite";

require('mocha/mocha.css');

const sourceMapSupport = require('source-map-support/browser-source-map-support.js')
sourceMapSupport.install();
