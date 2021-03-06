// Import expressjs and create route handler
const express = require('express');
const artists = express.Router();

// Add sqlite3 database instance
const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');

artists.param('artistId', (req,res,next,id) => {
  db.get(`select * from Artist where id = ${id};`, (err, row) => {
    if(err) next(err);
    else if (row) {
      req.artist = row;
      next();
    } else res.status(404).send();
  });
});

artists.get('/', (req,res,next) => {
  db.all(`select * from Artist where is_currently_employed = 1`, (err,rows) => {
    if(err) res.status(500).send();
    else res.status(200).send({artists: rows});
  });
});

artists.post('/', (req, res, next) => {
  const name = req.body.artist.name;
  const dob = req.body.artist.dateOfBirth;
  const bio = req.body.artist.biography;
  const emp = req.body.artist.isCurrentlyEmployed;
  if (!name || !dob || !bio) return res.status(400).send();
  db.run(`insert into Artist (name, date_of_birth, biography, is_currently_employed) 
  values ('${name}', '${dob}', '${bio}', '${emp===0?0:1}')`, function(err) {
    if (err) next(err);
    else db.get(`select * from Artist where id = ${this.lastID}`, (err, row) => {
      res.status(201).send({artist: row});
    });
  });
});

artists.get('/:artistId', (req,res,next) => {
  res.status(200).send({artist: req.artist});
});

artists.put('/:artistId', (req,res,next) => {
  const name = req.body.artist.name;
  const dob = req.body.artist.dateOfBirth;
  const bio = req.body.artist.biography;
  const emp = req.body.artist.isCurrentlyEmployed;
  if (!name || !dob || !bio) return res.status(400).send();
  db.run(`update Artist set name = '${name}', date_of_birth = '${dob}',
  biography = '${bio}', is_currently_employed = '${emp===0?0:1}'
  where id = ${req.artist.id};`, function(err) {
    if (err) next(err);
    else db.get(`select * from Artist where id = ${req.params.artistId}`, (err, row) => {
      res.status(200).send({artist: row});
    });
  });
});

artists.delete('/:artistId', (req,res,next) => {
  db.run(`update Artist set is_currently_employed = 0 
  where id = ${req.artist.id};`, function(err) {
    if (err) next(err);
    else db.get(`select * from Artist where id = ${req.artist.id};`, (err, row) => {
      res.status(200).send({artist: row});
    });
  });
});

// Export module
module.exports = artists;