var connect, port, share, webserver, serveStatic, cors;

// Require
cors = require('cors');
serveStatic = require('serve-static');
connect = require('connect');

// Simple Web server setup
webserver = connect();

webserver.use(cors());
webserver.use(serveStatic('./dist'));

backend.addProjection('_users', 'users', 'json0', { x: true });

share = sharejs.server.createClient({ backend: backend });

webserver.use('/doc', share.rest());

port = 9000;

webserver.listen(process.env.PORT || port);

console.log("Listening on http://localhost:" + port + "/");
