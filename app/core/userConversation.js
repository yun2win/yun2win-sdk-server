var thenjs=require("thenjs");
var UserConversationModel=require("../model/userConversation");

var UserConversation=function(userConversations,entity){
    this.userConversations =  userConversations;
    this.userId=userConversations.user.id;
    for(var index in entity)
        this[index]=entity[index];
    this.entity=entity;
};

UserConversation.prototype.refresh=function(cb){
    //找到群组查看消息
    var that=this;
    var tobj={};
    thenjs()
        .then(function(cont){
            that.getSession(cont);
        })
        .then(function(cont,session){
            if(!session)
                return cb();
            tobj.session=session;
            tobj.session.getMemberByUserId(that.userId,function(error,member){
                //找不到群成员，不必刷新
                if(error)
                    return cb();

                //群成员被删除,不用刷新
                if(member.isDelete) {
                    if(session.type=="group") {
                        that.name = session.name;
                        that.avatarUrl = session.avatarUrl;
                    }
                    return cb();
                }

                tobj.member=member;
                cont(null,session);
            });
        })
        .then(function(cont,session){
            if(session.type=="group") {
                that.name = session.name;
                that.avatarUrl=session.avatarUrl;
            }
            tobj.session.getLastMessage(cont);
        })
        .then(function(cont,lastMessage){
            if(lastMessage) {
                if(lastMessage.createdAt &&lastMessage.createdAt>that.updatedAt)
                    that.updatedAt = lastMessage.createdAt;
                that.lastMessage ={
                    sender:lastMessage.sender,
                    type:lastMessage.type,
                    content:lastMessage.content
                };
                //console.log("refresh:"+lastMessage.content)
            }
            cont();
        })
        .then(function(cont){
            that.unread=tobj.member.unread;
            cont();
        })
        .then(function(cont){
            cb();
        })
        .fail(function(cont,error){
            cb(error);
        });
};
UserConversation.prototype.clearUnread=function(){
    this.unread=0;
};
UserConversation.prototype.toJson=function(){
    return {
        "id": this.id,
        "targetId": this.targetId,
        "name": this.name,
        "type": this.type,
        "top": this.top,
        "visiable": this.visiable || true,
        "unread": this.unread,
        "lastMessage":this.lastMessage,
        "isDelete": this.isDelete,
        "createdAt": this.createdAt,
        "updatedAt": this.updatedAt,
        "avatarUrl": this.avatarUrl
    };
};
UserConversation.prototype.store=function(cb){
    for(var index in this.entity)
        this.entity[index]=this[index];
    var that=this;
    UserConversationModel.save(that.entity,function(error){
        if(error)
            return cont(error);

        that.isDelete=true;
        that.createdAt=that.entity.createdAt;
        that.updatedAt=that.entity.updatedAt;

        cb(null,that);
    });
};
UserConversation.prototype.delete=function(cb){
    var that=this;
    thenjs()
        .then(function(cont){
            that.getSession(cont);
            //var sessions=that.userConversations.user.users.client.sessions;
            //sessions.get(that.targetId,cont);
        })
        .then(function(cont,session){
            session.getMemberByUserId(that.userId,function(error,member){
                 cont(null,member);
            });
        })
        .then(function(cont,member){
            if(member)
                member.markConvr(false,cont);
            else
                cont();
        })
        .then(function(cont){
            that.entity.isDelete=true;
            that.entity.createdAt=new Date();
            that.entity.updatedAt=new Date();
            UserConversationModel.update(that.entity,["isDelete","createdAt","updatedAt"],function(error){
                if(error)
                    return cont(error);

                that.isDelete=true;
                that.createdAt=that.entity.createdAt;
                that.updatedAt=that.entity.updatedAt;

                cont();
            });
        })
        .then(function(cont){
            cb();
        })
        .fail(function(cont,error){
            cb(error);
        });
};
UserConversation.prototype.getSession=function(cb){

    var sessions=this.userConversations.user.users.client.sessions;

    if(this.type=="single")
        return sessions.getSingleSession(this.targetId,cb);

    if(this.type=="p2p"){
        var uid=this.userConversations.user.id;
        return sessions.getP2PSession(uid,this.targetId,cb);
    }

    if(this.type=="group")
        return sessions.get(this.targetId,cb);

    return cb("用户会话类型不支持");

};
UserConversation.prototype.updateTime=function(time,cb){
    this.updatedAt=time;
    this.isDelete=false;
    UserConversationModel.update(this,["isDelete","updatedAt"],cb);
};

module.exports=UserConversation;