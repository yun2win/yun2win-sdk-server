var db=require("../plugins/db");
var utils=require("../utils");

var Obj=db.define("Attachment",{
    clientId:db.String,
    md5:db.String,
    fileName:db.String,
    size:db.Int,
    path:db.String,
    isDelete:db.Boolean
});

Obj.get=function(id,cb){
    this.find({where:{id:id}}).then(function(obj){
        var result=obj;
        if(obj)
            result=db.checkId(obj.dataValues);
        if(cb)
            cb(null,result);
    });
};

Obj.getByMd5=function(md5,cb){
    this.find({where:{md5:md5}}).then(function(obj){
        var result=obj;
        if(obj)
            result=db.checkId(obj.dataValues);
        if(cb)
            cb(null,result);
    });
};

Obj.getAttachment=function(clientId,clientTime,id,cb){
    this.find({where:{clientId:clientId,id:id,updatedAt:{$gt:clientTime }}}).then(function(obj){
        var result=obj;
        if(obj)
            result=db.checkId(obj.dataValues);
        if(cb)
            cb(null,result);
    });
};


module.exports=Obj;