var connect, port, share, webserver, serveStatic, cors;

// Require
cors = require('cors');
serveStatic = require('serve-static');
connect = require('connect');

// Simple Web server setup
webserver = connect();

webserver.use(cors());
webserver.use(serveStatic('./'));


port = 9000;

webserver.listen(process.env.PORT || port);

console.log("Listening on http://localhost:" + port + "/");
