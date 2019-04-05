const sqlite3 = require('sqlite3');
const db = new sqlite3.Database('data/dbdbase.db');
try {
    db.get("SELECT * FROM farts;", function(err, results) {
        if (err)
            throw err;
        console.log("results:" + results);
    });
} catch (err) {
    console.log(err);
}
