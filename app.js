var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var session = require('express-session');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var oauthserver = require('oauth2-server');
var router=require("./router");
var utils=require("./app/utils");


var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
//需要上传文件要用组件formidable
//app.use(logger('dev'));
app.use(bodyParser.json({defer:true,limit: '50mb'}));
app.use(bodyParser.urlencoded({limit: '50mb', extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));


app.oauth = oauthserver({
    model: require("./app/service/oauth"), // See below for specification
    grants: ['password','authorization_code','refresh_token','client_credentials'],
    debug: true
});
app.all('/oauth/token', app.oauth.grant());// app.oauth.authorise(),
app.get('/oauth/authorize', function (req, res) {

    var scope=req.query.scope;
    var client_id=req.query.client_id;
    var redirect_uri=req.query.redirect_uri;
    var response_type=req.query.response_type;

    var ext=new Date();
    ext.setHours(ext.getHours()+10);
    var code=utils.guid(16);
    app.oauth.model.saveAuthCode(code,client_id,ext,1,function(err){
        redirect_uri+=(redirect_uri.indexOf("?")>0?"&":"?")+"code="+code;
        res.redirect(redirect_uri);
    });

    //res.json({appKey:req.oauth.bearerToken.clientId});
});
app.use(app.oauth.errorHandler());
router.init(app,app.oauth.authorise());


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
      try {
          var status = err.code || err.status || 500;
          if(err.code)
              err.status=err.code;
          res.status(status);
          res.json({status: status, error: err.error, message: err.message || err});
      }catch(ex){
          console.log(err);
          console.log(ex);
      }
  });
}

require("./test");

module.exports = app;

