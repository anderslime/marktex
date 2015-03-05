var connect, port = 9000, share, webserver, serveStatic, cors, compression;

// Require
cors = require('cors');
serveStatic = require('serve-static');
connect = require('connect');
compression = require('compression');

// Simple Web server setup
webserver = connect();
webserver.use(compression());
webserver.use(cors());
webserver.use(serveStatic('./dist/'));

webserver.listen(process.env.PORT || port);

console.log("Listening on http://localhost:" + port + "/");