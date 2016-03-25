var db=require("../plugins/db");
var utils=require("../utils");

var Obj=db.define("Message",{
    clientId:db.String,
    sessionId:db.String,
    sender:db.String,
    content:db.Text,
    type:db.String,
    updatedTime:db.BigInt,
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

Obj.getLastMessages=function(sessionId,clientId,limit,cb){
    var where={sessionId:sessionId,clientId:clientId};
    var that=this;
    that.findAll({
        where:where,
        limit:limit,
        order:'updatedTime Desc'
    }).then(function(obj){
        var result=[];
        if(obj)
            for(var i=0;i<obj.length;i++)
                result.push(db.checkId(obj[i].dataValues));
        if(cb)
            cb(null,result);
    });
};

Obj.getLastMessageList=function(sessionId,clientId,clientTime,limit,offset,cb){
    var where={sessionId:sessionId,clientId:clientId, updatedAt:{$lte:clientTime }};
    var that=this;
    that.findAll({
        where:where,
        limit:limit,
        offset:offset,
        order:'updatedTime Desc'
    }).then(function(obj){
        var result=[];
        if(obj)
            for(var i=0;i<obj.length;i++)
                result.push(db.checkId(obj[i].dataValues));
        if(cb)
            cb(null,result);
    });
};
Obj.getMessageList=function(sessionId,clientId,clientTime,filter_term,limit,offset,cb){
    var that=this;
    var where={sessionId:sessionId,clientId:clientId, updatedAt:{$gte:clientTime }};
    if(filter_term)
        where.$or=[{sender:filter_term}];

    that.findAll({
        where:where,
        attributes: [[db.fn('COUNT', db.col('id')), 'count']]
    })
        .then(function(obj){
            var maxCount=0;
            if(obj.length>0)
                maxCount=obj[0].dataValues.count;

            that.findAll({
                where:where,
                limit:limit,
                offset:offset,
                order:'updatedTime'
            }).then(function(obj){
                var result=[];
                if(obj)
                    for(var i=0;i<obj.length;i++)
                        result.push(db.checkId(obj[i].dataValues));
                if(cb)
                    cb(null,{total_count:maxCount,entries:result});
            });
        });
};
Obj.getMessage=function(conversationId,clientId,clientTime,id,cb){
    this.find({where:{conversationId:conversationId,clientId:clientId,id:id,updatedAt:{$gt:clientTime }}}).then(function(obj){
        var result=obj;
        if(obj)
            result=db.checkId(obj.dataValues);
        if(cb)
            cb(null,result);
    });
};


module.exports=Obj;