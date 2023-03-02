module.exports = {
    files: './dist/**/index.html',
    from: '<!-- optional 1.2 app scripts -->',
    to: '  <script src="../glue42/startRunner.js"></script>\n'+
        '  <script src="../glue42/fdc3-glue42.js"></script>\n'
};