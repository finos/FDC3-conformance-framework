module.exports = {
    files: './dist/**/index.html',
    from: '<!-- optional 1.2 support scripts -->',
    to: '  <script src="../glue42/fdc3-glue42.js"></script>\n'
};