var getData = new Promise(function(resolve, reject) {
    var results = true;
    if (results)
        resolve(results);
});
var data = getData.then(function(results) {
    return results;
});
console.log(data);
