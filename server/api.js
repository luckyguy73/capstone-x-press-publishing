// Import expressjs and create route handler
const express = require('express');
const apiRouter = express.Router();

// Mount route handler modules
const artists = require('./routers/artists');
apiRouter.use('/artists', artists);

const series = require('./routers/series');
apiRouter.use('/series', series);

// Export module
module.exports = apiRouter;
