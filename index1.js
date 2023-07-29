var express = require('express');
var app = express();
app.get('/', function (req, res) {
    var sql = require("mssql");
    // config for your database
    var config = {
        server: 'DESKTOP-LTVI0TF\\SQLSERVER2022',
        database: 'DesignSearch',
        port:1433,
        user: 'sa',
        password: '123',
        trustServerCertificate:true,
        options: {
            cryptoCredentialsDetails: {
                minVersion: 'TLSv1',
                trustServerCertificate: true,
            }
        }   
    };
    // connect to your database
    sql.connect(config, function (err) {
        if (err) console.log(err);
        // create Request object
        var request = new sql.Request();
        // query to the database and get the records
        request.query('select * from ds_Login', function (err, recordset) {
            if (err) console.log(err)
        
            res.send(recordset);
        });
    });
});
var server = app.listen(5000, function () {
    console.log('Server is running..');
});