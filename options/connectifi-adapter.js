module.exports = {
    files: './dist/**/index.html',
    from: ['<!-- optional 1.2 app scripts -->', '<!-- optional 1.2 support scripts -->'],
    to: ' <script src="../../lib/connectifi-adapter.js"></script>'
};