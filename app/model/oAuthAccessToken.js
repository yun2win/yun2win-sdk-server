var db=require("../plugins/db");

var Obj=db.define("OauthAccessToken",{
    accessToken:db.String,
    clientId:db.String,
    userId:db.String,
    expires:db.DateTime
});


Obj.get=function(accessToken,cb){
    this.find({where:{accessToken:accessToken}}).then(function(obj){
        var result=obj;
        if(obj)
            result=obj.dataValues;
        if(cb)
            cb(null,result);
    });
};

module.exports=Obj;