// Import expressjs and create route handler
const express = require('express');
const series = express.Router();

// Add sqlite3 database instance
const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');

series.get('/', (req,res,next) => {
  db.all(`select * from series`, (err,rows) => {
    if(err) {
      res.status(500).send();
    } else {
      res.status(200).send({series: rows});
    }
  });
});



// Export module
module.exports = series;