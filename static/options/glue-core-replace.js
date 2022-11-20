module.exports = {
    files: '../dist/**/index.html',
    from: '<!-- optional 1.2 scripts -->',
    to: '<script src="lib/platform.web.umd.js"></script>\n'+
        '  <script src="lib/fdc3.umd.js"></script>\n'+
        '  <script src="lib/startRunner.js"></script>\n'
};