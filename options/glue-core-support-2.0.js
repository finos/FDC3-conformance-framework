module.exports = {
    files: './dist/**/index.html',
    from: '<!-- optional 2.0 support scripts -->',
    to: '<script src="https://unpkg.com/@glue42/web@2.21.0/dist/web.umd.js"></script>\n'+
        '  <script src="../glue42/startSupport.js"></script>\n'+
        '  <script src="https://unpkg.com/@glue42/fdc3@3.2.2/dist/fdc3.umd.js"></script>\n'
};
