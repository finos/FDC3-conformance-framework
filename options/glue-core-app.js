module.exports = {
    files: './dist/**/index.html',
    from: '<!-- optional 2.0 app scripts -->',
    to: '<script src="../lib/glue/platform.web.umd.js"></script>\n'+
        '  <script src="../lib/glue/fdc3.umd.js"></script>\n'+
        '  <script src="../lib/glue/startRunner.js"></script>\n'
};