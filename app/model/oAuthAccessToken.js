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

Obj.getBy=function(begin,end,cb){
    this.findAll({
        attributes: ['userId',[db.fn('COUNT', db.col('id')),'count']],
        group: ['userId'],
        where:{createdAt:{$gt:begin,$lt:end}}
    }).then(function(obj){
        var result=[];
        if(obj)
            for(var i=0;i<obj.length;i++)
                result.push(obj[i].dataValues);
        if(cb)
            cb(null,result);
    });
};

module.exports=Obj;