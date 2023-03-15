module.exports = {
    files: './dist/**/index.html',
    from: '<!-- optional 1.2 app scripts -->',
    to: '  <script src="../glue42/startRunner.js"></script>\n'+
        '  <script src="https://unpkg.com/@glue42/fdc3@2.6.1/dist/fdc3-glue42.js"></script>\n'
};