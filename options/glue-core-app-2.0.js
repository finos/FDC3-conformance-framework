module.exports = {
    files: './dist/**/index.html',
    from: '<!-- optional 2.0 app scripts -->',
    to: ' <script src="https://unpkg.com/@glue42/web-platform@1.26.0/dist/platform.web.umd.js"></script>\n'+
  		'<script src="../glue42/startRunner.js"></script>\n'+
  		'<script src="https://unpkg.com/@glue42/fdc3@3.2.2/dist/fdc3.umd.js"></script>'
};

 