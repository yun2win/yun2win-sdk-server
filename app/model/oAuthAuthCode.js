var db=require("../plugins/db");

var Obj=db.define("OauthAuthCode",{
    authCode:db.String,
    clientId:db.String,
    userId:db.String,
    expires:db.DateTime
});

Obj.get=function(authCode,cb){
    this.find({where:{authCode:authCode}}).then(function(obj){
        var result=obj;
        if(obj)
            result=obj.dataValues;
        if(cb)
            cb(null,result);
    });
};

module.exports=Obj;