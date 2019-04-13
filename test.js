const sqlite3 = require('sqlite3');
const db = new sqlite3.Database('data/botbase.db');
console.log(process.argv[2]);
console.log(process.argv[3]);
db.get("SELECT " + process.argv[2] + " FROM " + process.argv[3] + ";", function(err, results) {
    if (err)
        console.log(err);
        console.log("results:" + results);
});
console.log("Done.");
