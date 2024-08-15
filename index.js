var express = require('express');
var _sqlPackage = require('mssql');
const cors = require('cors');
const bodyParser = require('body-parser');
var path = require('path');
var app = express();

var dbConfig = {
        server: 'DESKTOP-LTVI0TF\\SQLSERVER2022',
        database: 'DesignSearch',
        port:1433,
        user: 'sa',
        password: '123',
        trustServerCertificate:true,
        requestTimeout: 10 * 60 * 1000, // 10 minutes
        pool: {
          max: 10,
          min: 0,
          idleTimeoutMillis: 30000
      },
        options: {
            cryptoCredentialsDetails: {
                minVersion: 'TLSv1',
                trustServerCertificate: true,
            }
        }
    }  

app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Credentials", true);
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    res.header("Access-Control-Allow-Methods", "POST, GET, PUT, DELETE, OPTIONS");
    next();
  });

app.use(cors({credentials: true, origin: true, exposedHeaders: '*'}));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(require("body-parser").json());
app.options('*', cors());
const allowedMethods = ['GET', 'HEAD', 'POST']

app.use((req, res, next) => {
    if (!allowedMethods.includes(req.method)) return res.end(405, 'Method Not Allowed')
    return next()
})
  // Configuring body parser middleware
//app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
// Login GET API  with inline query
app.get('/', function (_req, _res) {
  _sqlPackage.close();
    var Sqlquery = "select * from [ds_Login]"; 
    QueryToExecuteInDatabase(_res, Sqlquery);  
});

   // Insert login details 
app.post('/InsertLogin', function (request, res) {
    _sqlPackage.close();
    var FirstName = request.body.firstName;
    var LastName = request.body.lastName;
    var UName = request.body.userName;
    var Pwd = request.body.password;
    var Email = request.body.email;
    let Sqlquery = "exec RegisterInsert @FirstName='" + FirstName + "', @LastName='" + LastName  + "', @UserName='" + UName  + "', @Password='" + Pwd  + "', @Email='" + Email  + "'";
       
    console.log("Sqlquery:::" + Sqlquery);
    var StudentDetails = QueryToExecuteInDatabase(res, Sqlquery);
    console.log("Update design Details:::" + StudentDetails);
});

  // Design submit post details 
app.post('/InsertDesign', cors(), function (request, res) {
    //_sqlPackage.close();
    var DesignName = request?.body?.DesignName;
    var DesignDescription = request.body.DesignDescription;
    let Sqlquery = "exec DesignUpdate @DesignName='" + DesignName + "', @DesignDescription='" + DesignDescription  + "'";
    QueryToExecuteInDatabase(res, Sqlquery);
});

 // delete designs based on ID 
  app.post('/deleteDesigns', cors(), function (request, res) {
    //_sqlPackage.close();
    var DesignId = request?.body?.DesignID;
    let Sqlquery = "delete from ds_Design where DesignID =" + DesignId;
    QueryToExecuteInDatabase(res, Sqlquery);
});


// Login GET Designs API  with inline query
app.get('/getDesigns', function (_req, _res) {
  _sqlPackage.close();
    var Sqlquery = "select DesignID, DesignName, DesignDescription, Icon from [ds_design]"; 
    QueryToExecuteInDatabase(_res, Sqlquery);  
});

app.listen(5000, function () {
    console.log('Server is running..');
});

//Function to connect to database and execute query  
var QueryToExecuteInDatabase = function (response, strQuery) {
    //close sql connection before creating an connection otherwise you will get an error if connection already exists.  
    //_sqlPackage.close();
    //Now connect your sql connection  
    _sqlPackage.connect(dbConfig, function (error) {
      if (error) {
        console.log("Error while connecting to database :- " + error);
        response.send(error);
      }
      else {
        //let's create a request for sql object  
        var request = new _sqlPackage.Request();
        //Query to run in our database  
        request.query(strQuery, function (error, responseResult) {
          if (error) {
            console.log("Error while connecting to database:- " + error);
            response.send(error);
           // _sqlPackage.close();
          }
          else {
            response.send(responseResult.recordsets);
           // _sqlPackage.close();
          }
        });
      }
    });
  }
