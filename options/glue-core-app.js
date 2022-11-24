module.exports = {
    files: './dist/**/index.html',
    from: '<!-- optional 2.0 app scripts -->',
    to: '<script src="https://unpkg.com/@glue42/web-platform@latest/dist/platform.web.umd.js"></script>\n'+
        '  <script src="https://unpkg.com/@glue42/fdc3@3.0.0/dist/fdc3.umd.js"></script>\n'+
        '  <script src="../lib/glue/startRunner.js"></script>\n'
};