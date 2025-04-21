const sqlite3 = require('sqlite3').verbose();
//const db = new sqlite3.Database(':memory:');

// Uncomment the following line to use a file-based database instead of in-memory
const db = new sqlite3.Database('my-database.sqlite');

db.serialize(() => {

//Create a table
db.run(`CREATE TABLE IF NOT EXISTS athikaram (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                athikaram_number INTEGER,
                athikaram_name TEXT NOT NULL,
                PAL TEXT,
                IYAL TEXT
    )`);
db.run(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                email TEXT NOT NULL,
                Phone TEXT       
)`);

});

module.exports = db;
