var db=require("../plugins/db");
var utils=require("../utils");

var Obj=db.define("SessionMember",{
    clientId:db.String,
    userId:db.String,
    sessionId:db.String,
    name:db.String,
    role:db.String,
    status:db.String,
    hasConvr:db.Boolean,
    lastReadTime:db.DateTime,
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

Obj.getList=function(ownerId,clientId,cb){
    var that=this;
    var where={sessionId:ownerId,clientId:clientId};
    that.findAll({
            where:where,
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

Obj.getSessionMemberList=function(sessionId,clientId,clientTime,filter_term,limit,offset,cb){
    var that=this;
    var where={sessionId:sessionId,clientId:clientId, updatedAt:{$gt:clientTime }};
    if(filter_term)
        where.$or=[{userId:filter_term},{name:filter_term}];

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

Obj.getSessionMember=function(sessionId,clientId,clientTime,id,cb){
    this.find({where:{sessionId:sessionId,clientId:clientId,id:id,updatedAt:{$gt:clientTime }}}).then(function(obj){
        var result=obj;
        if(obj)
            result=db.checkId(obj.dataValues);
        if(cb)
            cb(null,result);
    });
};




module.exports=Obj;