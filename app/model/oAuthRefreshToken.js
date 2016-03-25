var db=require("../plugins/db");

var Obj=db.define("OAuthRefreshToken",{
    refreshToken:db.String,
    clientId:db.String,
    userId:db.String,
    expires:db.DateTime
});

Obj.get=function(refreshToken,cb){
    this.find({where:{refreshToken:refreshToken}}).then(function(obj){
        var result=obj;
        if(obj)
            result=obj.dataValues;
        if(cb)
            cb(null,result);
    });
};


module.exports=Obj;