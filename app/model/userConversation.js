var db=require("../plugins/db");
var utils=require("../utils");

var Obj=db.define("UserConversation",{
    clientId:db.String,
    ownerId:db.String,
    targetId:db.String,
    name:db.String,
    type:db.String,
    top:db.Boolean,
    avatarUrl:db.String,
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

Obj.getByTargetId=function(ownerId,clientId,targetId,cb){
    this.find({where:{ownerId:ownerId,clientId:clientId,targetId:targetId}}).then(function(obj){
        var result=obj;
        if(obj)
            result=db.checkId(obj.dataValues);
        if(cb)
            cb(null,result);
    });
};

Obj.getLatest=function(clientId,ownerId,limit,cb){
    var that=this;
    var where={ownerId:ownerId,clientId:clientId};
    that.findAll({
        where:where,
        limit:limit,
        offset:0,
        order:'updatedAt Desc'
    })
    .then(function(obj){
        var result=[];
        if(obj)
            for(var i=0;i<obj.length;i++)
                result.push(db.checkId(obj[i].dataValues));
        if(cb)
            cb(null,result);
    });
};

Obj.getUserConversationList=function(ownerId,clientId,clientTime,filter_term,limit,offset,cb){
    var that=this;
    var where={ownerId:ownerId,clientId:clientId,updatedAt:{$gt:clientTime}};
    if(filter_term)
        where.$or=[{name:filter_term}];

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
                order:'updatedAt'
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

Obj.getUserConversation=function(ownerId,clientId,clientTime,id,cb){
    this.find({where:{ownerId:ownerId,clientId:clientId,id:id,updatedAt:{$gt:clientTime }}}).then(function(obj){
        var result=obj;
        if(obj)
            result=db.checkId(obj.dataValues);
        if(cb)
            cb(null,result);
    });
};


module.exports=Obj;