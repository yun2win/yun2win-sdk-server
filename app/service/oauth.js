var utils=require("../utils");
var config=require("../config");
var model = module.exports;


var OAuthAccessTokensModel = require("../model/oAuthAccessToken"), // mongoose.model('OAuthAccessTokens'),
    OAuthRefreshTokensModel = require("../model/oAuthRefreshToken"), // mongoose.model('OAuthRefreshTokens'),
    OAuthClientsModel = require("../model/app"), // mongoose.model('OAuthClients'),
    OauthAuthCodeModel = require("../model/oAuthAuthCode"),
    OAuthUsersModel = require("../model/user"); // mongoose.model('OAuthUsers');

//
// oauth2-server callbacks
//
model.getAccessToken = function (bearerToken, callback) {
    //console.log('in getAccessToken (bearerToken: ' + bearerToken + ')');
    //OAuthAccessTokensModel.findOne({ accessToken: bearerToken }, callback);
    OAuthAccessTokensModel.get(bearerToken,callback)
};

model.getClient = function (clientId, clientSecret, callback) {
    console.log('in getClient (clientId: ' + clientId + ', clientSecret: ' + clientSecret + ')');


    OAuthClientsModel.getByKey(clientId,function(error,app){
        if(error)
            return callback();
        if(!app ||app.secret!=clientSecret)
            return callback();

        callback(null,{
            clientId:app.key,
            clientSecret:app.secret,
            redirectUri:app.redirect_uri
        });
    });//,  clientSecret , callback);
};

// This will very much depend on your setup, I wouldn't advise doing anything exactly like this but
// it gives an example of how to use the method to resrict certain grant types
var authorizedClientIds = ['s6BhdRkqt3', 'toto'];
model.grantTypeAllowed = function (clientId, grantType, callback) {
    console.log('in grantTypeAllowed (clientId: ' + clientId + ', grantType: ' + grantType + ')');

//    if (grantType === 'password') {
//        return callback(false, authorizedClientIds.indexOf(clientId) >= 0);
//    }

    callback(false, true);
};

model.saveAccessToken = function (token, clientId, expires, userId, callback) {
    console.log('in saveAccessToken (token: ' + token + ', clientId: ' + clientId + ', userId: ' + userId + ', expires: ' + expires + ')');

    //var accessToken = new OAuthAccessTokensModel();

    if(userId.id)
        userId=userId.id;

    var obj={
        accessToken: token,
        clientId: clientId,
        userId: userId,
        expires: expires
    };

    OAuthAccessTokensModel.save(obj,callback);
};

/*
 * Required to support password grant type
 */
model.getUser = function (username, password, callback) {
    //console.log('in getUser (username: ' + username + ', password: ' + password + ')');

    OAuthUsersModel.getByEmail(username, function(err, user) {
        if(err) return callback(err);
        if(!user) return callback("用户不存在");
        utils.md5(password,function(error,p){
            if(user.password!=p){
                callback("password is incorrect");
            }
            else{
                callback(null, user.id);
            }
        });
    });
};
model.getUserFromClient=function(clientId, clientSecret,callback){

    OAuthClientsModel.getByKey(clientId,function(error,app){
        if(error)
            return callback();
        if(app.secret!=clientSecret)
            return callback();

        callback(null, app.user);
    });

};
/*
 * Required to support refreshToken grant type
 */
model.saveRefreshToken = function (token, clientId, expires, userId, callback) {
    console.log('in saveRefreshToken (token: ' + token + ', clientId: ' + clientId +', userId: ' + userId + ', expires: ' + expires + ')');

    var obj= {
        refreshToken: token,
        clientId: clientId,
        userId: userId,
        expires: expires
    };

    OAuthRefreshTokensModel.save(obj,callback);
};

model.getRefreshToken = function (refreshToken, callback) {
    console.log('in getRefreshToken (refreshToken: ' + refreshToken + ')');

    OAuthRefreshTokensModel.get(refreshToken, callback);
};


model.getAuthCode = function (bearerCode, callback) {
    console.log("in getAuthCode (bearerCode: " + bearerCode + ")");

    OauthAuthCodeModel.get(bearerCode,function(err,data){
//        if (data && data.expires) {
//            data.expires = new Date(data.expires * 1000);
//        }
        callback(err, data);
    });
};

model.saveAuthCode = function (authCode, clientId, expires, user, callback) {
    console.log('in saveAuthCode (authCode: ' + authCode + ', clientId: ' + clientId + ', userId: ' + user + ', expires: ' + expires + ')');

    var code = {
        authCode: authCode,
        clientId: clientId,
        userId: user,
        expires:expires
    };

    //if (expires) code.expires = parseInt(expires / 1000, 10);
    console.log("saving", code);

    OauthAuthCodeModel.save(code,callback);
    //dal.doSet(code, OAuthAuthCodeTable, { authCode: { S: authCode }}, callback);
};
