var connect, port = 9000, share, webserver, serveStatic, cors;

// Require
cors = require('cors');
serveStatic = require('serve-static');
connect = require('connect');

// Simple Web server setup
webserver = connect();

webserver.use(cors());
webserver.use(serveStatic('./dist/'));

webserver.listen(process.env.PORT || port);

console.log("Listening on http://localhost:" + port + "/");