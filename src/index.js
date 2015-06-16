var connect, port = 9000, webserver, serveStatic, cors, compression;

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
//webserver.use(rewriteUtils.rewriteRequest);
webserver.use(serveStatic('./dist/', {index:'./loaderio-441728208ec60f57d75602a3e9158492.txt'}));

webserver.listen(process.env.PORT || port);

console.log("Listening on http://localhost:" + port + "/");