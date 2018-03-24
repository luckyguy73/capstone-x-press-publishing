// Import expressjs and create route handler
const express = require('express');
const issues = express.Router();

// Add sqlite3 database instance
const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');

issues.param('seriesId', (req,res,next,id) => {
  db.get(`select * from Series where id = ${id};`, (err, row) => {
    if(err) next(err);
    else if (row) {
      req.series = row;
      next();
    } else res.status(404).send();
  });
});

issues.param('issueId', (req,res,next,id) => {
  db.get(`select * from Issue where id = ${id};`, (err, row) => {
    if(err) next(err);
    else if (row) {
      req.issue = row;
      next();
    } else res.status(404).send();
  });
});

issues.get('/', (req,res,next) => {
  db.all(`select * from Issue where series_id = ${req.series.id}`, (err,rows) => {
    if(err) res.status(500).send();
    else res.status(200).send({issues: rows});
  });
});

issues.post('/', (req, res, next) => {
  const name = req.body.issue.name;
  const num = req.body.issue.issueNumber;
  const pub = req.body.issue.publicationDate;
  const artId = req.body.issue.artistId;
  const serId = req.series.id;
  if (!name || !num || !pub) return res.status(400).send();
  db.get(`select * from Artist where id = ${artId}`, (err,row) => {
    if(err) return res.status(400).send();
  });
  db.run(`insert into Issue (name, issue_number, publication_date, artist_id, series_id) 
  values ('${name}', '${num}', '${pub}', ${artId}, ${serId})`, function(err) {
    if (err) next(err);
    else db.get(`select * from Issue where id = ${this.lastID}`, (err, row) => {
      res.status(201).send({issue: row});
    });
  });
});

issues.put('/:issueId', (req,res,next) => {
  const name = req.body.issue.name;
  const num = req.body.issue.issueNumber;
  const pub = req.body.issue.publicationDate;
  const artId = req.body.issue.artistId;
  if (!name || !num || !pub) return res.status(400).send();
  db.get(`select * from Artist where id = ${artId}`, (err,row) => {
    if(err) return res.status(400).send();
  });
  db.run(`update Issue set name = '${name}', issue_number = '${num}', artist_id = '${artId}',
  publication_date = '${pub}' where id = ${req.issue.id};`, function(err) {
    if (err) next(err);
    else db.get(`select * from Issue where id = ${req.issue.id}`, (err, row) => {
      res.status(200).send({issue: row});
    });
  });
});

issues.delete('/:issueId', (req,res,next) => {
  db.run(`delete from Issue where id = ${req.issue.id}`, (err) => {
    if (err) next(err);
    else res.status(204).send();
  });
});

// Export module
module.exports = issues;