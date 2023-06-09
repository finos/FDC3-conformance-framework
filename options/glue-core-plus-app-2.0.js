module.exports = {
    files: './dist/**/index.html',
    from: '<!-- optional 2.0 app scripts -->',
    to: ' <script src="https://unpkg.com/@glue42/core-plus@1.5.5/dist/core.plus.umd.js"></script>\n'+
  		'<script src="../glue42/core-plus/startCorePlusRunner.js"></script>\n'+
  		'<script src="https://unpkg.com/@glue42/fdc3@3.2.2/dist/fdc3.umd.js"></script>'
};

 