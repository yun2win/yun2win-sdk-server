var db=require("../plugins/db");
var utils=require("../utils");
var config=require("../config");

//var Obj=db.define("App",{
//    user:db.Int,
//    key:db.String,
//    secret:db.String,
//    tokenTime:db.Int,
//    name:db.String,
//    date:db.DateTime,
//    type:db.String,
//    redirect_uri:db.String
//});
var Obj={};

Obj.getByKey=function(key,cb){

    if(key==config.client.appKey){
        cb(null,{
            key:key,
            secret:config.client.appSerect,
            redirect_uri:"",
            user:-1,
            admin:true
        });
        return;
    }
    cb(null);

//    this.find({where:{key:key}}).then(function(obj){
//        var result=obj;
//        if(obj)
//            result=obj.dataValues;
//        if(cb)
//            cb(null,result);
//    });
};

Obj.getByUser=function(user,cb){

    cb(null,{
        key:key,
        secret:config.client.appSerect,
        redirect_uri:""
    });

//    this.findAll({where:{user:user}}).then(function(obj){
//        var result=[];
//        if(obj)
//            for(var i=0;i<obj.length;i++)
//                result.push(obj[i].dataValues);
//        if(cb)
//            cb(null,result);
//    });
};



module.exports=Obj;