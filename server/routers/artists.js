// Import expressjs and create route handler
const express = require('express');
const artists = express.Router();

// Add sqlite3 database instance
const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');

artists.get('/', (req,res,next) => {
  db.all(`select * from artist where is_currently_employed = 1`, (err,rows) => {
    if(err) {
      res.status(500).send();
    } else {
      res.status(200).send({artists: rows});
    }
  });
});

artists.post('/', (req, res, next) => {
  const newArtist = req.body.artist;
  if (!newArtist.name || !newArtist.dateOfBirth || !newArtist.biography) {
    return res.status(400).send();
  }
  db.run(`INSERT INTO Artist (name, date_of_birth, biography, is_currently_employed) 
    VALUES ($name, $date_of_birth, $biography, $is_currently_employed)`,
  {
    $name: newArtist.name,
    $date_of_birth: newArtist.dateOfBirth,
    $biography: newArtist.biography,
    $is_currently_employed: newArtist.isCurrentlyEmployed === 0 ? 0 : 1
  }, function(err) {
    if (err) {
      next(err);
    } else {
      db.get(`SELECT * FROM Artist WHERE id = ${this.lastID}`, (err, row) => {
        res.status(201).send({artist: row});
      });
    }
  });
});

// Export module
module.exports = artists;