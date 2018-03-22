// Import expressjs
const express = require('express');
const app = express();

// Add sqlite3 database instance
const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');

// Add port
const PORT = process.env.PORT || 4000;

// Serve static files
app.use(express.static('public'));

// Add middleware HTTP request logger
const morgan = require('morgan');
app.use(morgan('tiny'));

// Add middleware to parse HTTP request body
const bodyParser = require('body-parser');
app.use(bodyParser.json());

// Add middleware for handling CORS requests from index.html
const cors = require('cors');
app.use(cors());

// Mount apiRouter at the '/api' path.
const apiRouter = require('./server/api');
app.use('/api', apiRouter);

// Binds and listens for connections on the specified host and port.
// This method is identical to Node’s http.Server.listen().
app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});

// Export module
module.exports = app;