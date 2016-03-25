var thenjs=require("thenjs");
var SessionMemberModel=require("../model/sessionMember");
var pinyin=require("../plugins/pinyin");


var SessionMember=function(session,entity){
    this.session=session;
    this.entity=entity;

    this.unread=0;
    for(var index in entity)
        this[index]=entity[index];

};

SessionMember.prototype.markConvr=function(has,cb){
    if(this.hasConvr==has)
        return cb();

    this.hasConvr=has;
    SessionMemberModel.update(this,["hasConvr"],cb);
};

SessionMember.prototype.checkUserConversation=function(timestamp,cb){
    //如果不存在用户会话，则增加
    if(this.hasConvr)
       return cb();

    var users=this.session.sessions.client.users;
    var that=this;
    var session=this.session;
    var tobj=this;
    thenjs()
        .then(function(cont){
            users.get(that.userId,cont);
        })
        .then(function(cont,user){
            tobj.user=user;
            session.getMembers(cont);
        })
        .then(function(cont,members){
            //tobj.user=user;
            if(session.type=="p2p"){
                for(var i=0;i<members.length;i++)
                    if(members[i].userId!=that.userId){
                        var m=members[i];
                        return cont(null,session.type,m.userId, m.name, m.avatarUrl);
                    }

                //这个会话只有自己，那就自己跟自己聊吧。
                cont(null,session.type,tobj.user.id,tobj.user.name,tobj.user.avatarUrl);
            }
            else if(session.type=="single"){
                cont(null,session.type,tobj.user.id,tobj.user.name,tobj.user.avatarUrl);
            }
            else{
                var name="";
                cont(null,session.type,session.id,name,session.avatarUrl);
            }
        })
        .then(function(cont,type,targetId,name,avatarUrl){
            //type,targetId,name,avatarUrl
            tobj.user.userConversations.addUserConversation(type,targetId,name,avatarUrl,cont);
        })
        .then(function(cont){
            that.markConvr(true,cont)
        })
        .then(function(cont){
            cb();
        })
        .fail(function(cont,error){
            cb(error);
        });

};

SessionMember.prototype.updateUserConversation=function(date,cb){
    //更新会话时间

    //找到用户会话
    var users=this.session.sessions.client.users;
    var that=this;
    var session=this.session;
    var tobj=this;
    thenjs()
        .then(function(cont){
            users.get(that.userId,cont);
        })
        .then(function(cont,user){
            tobj.user=user;
            that.getCvTargetId(cont);
        })
        .then(function(cont,targetId){
            tobj.user.userConversations.updateUserConversation(targetId,date,cont);
        })
        .then(function(cont){
            cb();
        })
        .fail(function(cont,error){
            cb(error);
        });

};

SessionMember.prototype.clearUnread=function(cb){
    this.unread=0;
    var tobj={};
    var users=this.session.sessions.client.users;
    var that=this;
    thenjs()
        .then(function(cont){
            users.get(that.userId,cont);
        })
        .then(function(cont,user){
            tobj.user=user;
            that.getCvTargetId(cont);
        })
        .then(function(cont,targetId){
            tobj.user.userConversations.clearUnread(targetId);
        })
        .then(function(cont){
            cb();
        })
        .fail(function(cont,error){
            cb(error);
        });
};

SessionMember.prototype.getCvTargetId=function(cb){

    if(this.targetId)
        return cb(null,this.targetId);

    var session=this.session;
    var that=this;
    if(session.type=="p2p"){
        thenjs()
            .then(function(ct){
                session.getMembers(ct)
            })
            .then(function(ct,list){
                for(var i=0;i<list.length;i++)
                    if(list[i].userId!=that.userId) {
                        that.target=list[i].userId;
                        return cb(null, list[i].userId);
                    }
                //这个会话只有自己，那就自己跟自己聊吧。
                that.target=that.user.id;
                cb(null,that.user.id);
            })
            .fail(function(cont,error){
                cb(error);
            });
    }
    else if(session.type=="single"){
        that.target=that.userId;
        cb(null,that.userId);
    }
    else{
        that.target=session.id;
        cb(null,session.id);
    }
}

SessionMember.prototype.store=function(cb){

    var that=this;
    for(var index in this.entity)
        this.entity[index]=this[index];
    SessionMemberModel.save(this.entity,function(error,obj){
        if(error)
            return cb(error);

        return cb(null,that);
    });

};

SessionMember.prototype.delete=function(cb){
    var date=new Date();
    this.entity.isDelete=true;
    this.entity.role="user";
    this.entity.updatedAt=date;
    this.entity.createdAt=date;
    var that=this;
    var tobj={};
    thenjs()
        .then(function(cont){
            SessionMemberModel.update(that.entity,["role","isDelete","createdAt","updatedAt"],function(error){
                if(error)
                    return cb(error);

                that.role=that.entity.role;
                that.updatedAt=that.entity.updatedAt;
                that.createdAt=that.entity.createdAt;
                that.isDelete=that.entity.isDelete;

                //更新此人的用户会话
                if(that.hasConvr){
                    return that.updateUserConversation(that.updatedAt,cont);
                }

                cont();
            });
        })
        .then(function(cont){
            that.session.systemMessage_memberLeave(null,that,cont);
        })
        .then(function(cont){
            that.session.autoUpdateName(cont);
        })
        .then(function(cont){
            that.session.updateTime(cont);
        })
        .then(function(cont){
            if(cb)
                cb(null,that);
        })
        .fail(function(cont,error){
            if(cb)
                cb(error);
        });
};

SessionMember.prototype.toJson=function(){
    var obj=this;
    return {
        "id": obj.id,
        "name": obj.name,
        "pinyin": pinyin(obj.name),
        "createdAt": obj.createdAt,
        "updatedAt": obj.updatedAt,
        "avatarUrl": obj.avatarUrl,
        userId:obj.userId,
        role:obj.role,
        status:obj.status,
        lastReadTime:obj.lastReadTime,
        isDelete:obj.isDelete
    };
};


module.exports=SessionMember;