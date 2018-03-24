// Import expressjs and create route handler
const express = require('express');
const series = express.Router();

// Add sqlite3 database instance
const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');

const issues = require('./issues');
series.use('/:seriesId/issues', issues);

series.param('seriesId', (req,res,next,id) => {
  db.get(`select * from Series where id = ${id};`, (err, row) => {
    if(err) next(err);
    else if (row) {
      req.series = row;
      next();
    } else res.status(404).send();
  });
});

series.get('/', (req,res,next) => {
  db.all(`select * from Series`, (err,rows) => {
    if(err) res.status(500).send();
    else res.status(200).send({series: rows});
  });
});

series.post('/', (req, res, next) => {
  const name = req.body.series.name;
  const desc = req.body.series.description;
  if (!name || !desc) return res.status(400).send();
  db.run(`insert into Series (name, description) 
  values ('${name}', '${desc}')`, function(err) {
    if (err) next(err);
    else db.get(`select * from Series where id = ${this.lastID}`, (err, row) => {
      res.status(201).send({series: row});
    });
  });
});

series.get('/:seriesId', (req,res,next) => {
  res.status(200).send({series: req.series});
});

series.put('/:seriesId', (req,res,next) => {
  const name = req.body.series.name;
  const desc = req.body.series.description;
  if (!name || !desc) return res.status(400).send();
  db.run(`update Series set name = '${name}', description = '${desc}'
  where id = ${req.series.id};`, function(err) {
    if (err) next(err);
    else db.get(`select * from Series where id = ${req.series.id}`, (err, row) => {
      res.status(200).send({series: row});
    });
  });
});

series.delete('/:seriesId', (req,res,next) => {
  db.get(`select * from Issue where series_id = ${req.series.id}`, (err, issue) => {
    if (err) next(err);
    else if (issue) res.status(400).send();
    else db.run(`delete from Series where id = ${req.series.id}`, (err) => {
      if (err) next(err);
      else res.status(204).send();
    });
  });
});

// Export module
module.exports = series;