var connect, port = 9000, share, webserver, serveStatic, cors, compression;

// Require
cors = require('cors');
serveStatic = require('serve-static');
connect = require('connect');
compression = require('compression');

var rewriteUtils = require('../components/rewrite-utils');
rewriteUtils.registerRule({ from: '^(?!.*\\.js|.*\\.css|.*\\.woff2).*', to: '/index.html' });
rewriteUtils.registerRule({ from: '(^.*(\.js|\.css|\.woff2).*$)', to: '/$1' });

// Simple Web server setup
webserver = connect();
webserver.use(compression());
webserver.use(cors());
webserver.use(rewriteUtils.rewriteRequest);
webserver.use(serveStatic('./dist/'));

webserver.listen(process.env.PORT || port);

console.log("Listening on http://localhost:" + port + "/");