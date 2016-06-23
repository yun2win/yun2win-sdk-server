var thenjs=require("thenjs");
var SesssionModel=require("../model/session");
var SessionMemberModel=require("../model/sessionMember");
var SessionMember=require("./sessionMember");

var Message=require("./message");
var Messages=require("./messages");
var MessageModel=require("../model/message");

var config=require("../config");

var Session=function(sessions,entity){
    this.rid=Math.floor(Math.random()*10000);
    this.sessions=sessions;
    this.entity=entity;

    this.messages=new Messages(this);

    for(var index in this.entity)
        this[index]=this.entity[index];

    this.lastMessage=null;

    this.list=null;

    this.messages=[];

};

Session.prototype.getLastMessage=function(cb){
    if(this.lastMessage) {
        //console.log("getLastMessage("+this.rid+"):"+this.lastMessage.content);
        return cb(null, this.lastMessage);
    }

    var that=this;
    MessageModel.getLastMessages(this.id,this.sessions.client.id,1,function(error,arrays){
        if(error)
            return cb(error);
        if(arrays.length==0){
            that.lastMessage={};
            return cb(null,that.lastMessage);
        }

        var obj=arrays[0];
        that.lastMessage={
            sender:obj.sender,
            content:obj.content,
            type:obj.type,
            createdAt:obj.createdAt
        };
        cb(null,that.lastMessage);

    });
};

Session.prototype.getMember=function(id,cb){
    var that=this;
    that.getMembers(function(error,list){
        if(error)
            return cb(error);

        for(var i=0;i<list.length;i++){
            if(list[i].id==id)
                return cb(null,list[i]);
        }
        return cb("找不到成员");

    });
};

Session.prototype.getMemberByUserId=function(userId,cb){
    var that=this;
    that.getMembers(function(error,list){
        if(error)
            return cb(error);

        for(var i=0;i<list.length;i++){
            if(list[i].userId==userId)
                return cb(null,list[i]);
        }
        return cb("找不到成员");

    });
};

Session.prototype.getMembers=function(cb){
    var that=this;
    if(this.list!=null)
        return cb(null,this.list);


    if(that.getMembering) {
        setTimeout(function(){
            that.getMembers(cb);
        },500);
        return;
    }

    that.getMembering=true;
    SessionMemberModel.getList(this.id,this.clientId,function(error,list){
        that.getMembering=false;
        if(error)
            return cb(error);

        that.list=[];
        for(var i=0;i<list.length;i++){
            that.list.push(new SessionMember(that,list[i]));
        }
        cb(null,that.list);
    });
};

Session.prototype.filterMembers=function(timestamp,limit,offset,cb){
    var that=this;
    thenjs()
        .then(function(cont){
            that.getMembers(cont);
        })
        .then(function(cont,list){
            var result=[];
            for(var i=0;i<list.length;i++){
                if(list[i].updatedAt>timestamp)
                    result.push(list[i]);
            }
            result.sort(function(a,b){
                return a.updatedAt- b.updatedAt;
            });
            var rs=[];
            for(var i=offset; i<result.length && i<limit+offset; i++)
                rs.push(result[i]);
            cb(null,{total_count:result.length,entries:rs});
        })
        .fail(function(cont,error){
            cb(error);
        });
};

Session.prototype.addMember=function(uids,cb){

    if(typeof uids =="string")
        uids=[uids];

    var that=this;
    var ms=[];
    thenjs()
        .then(function(cont){
           that.getMembers(cont)
        })
        .each(uids,function(cont,uid,list){
            for(var i=0;i<list.length;i++)
                if(list[i].userId==uid)
                    return cont();

            thenjs()
                .then(function(ct){
                    that.sessions.client.users.get(uid,ct);
                })
                .then(function(ct,user){
                    var entity={
                        clientId:that.sessions.client.id,
                        userId:uid,
                        sessionId:that.id,
                        name:user.name,
                        avatarUrl:user.avatarUrl,
                        role:"user",
                        status:"active",
                        hasConvr:false,
                        lastReadTime:new Date(),
                        isDelete:false
                    };
                    SessionMemberModel.save(entity,ct);
                })
                .then(function(ct,obj){
                    var member=new SessionMember(that,obj);
                    ms.push(member);
                    that.list.push(member);
                    cont();
                })
                .fail(function(ct,error){
                    cont(error);
                });

        })
        .then(function(){
            cb(null,ms);
        })
        .fail(function(cont,error){
            cb(error);
        });

};

Session.prototype.setMember=function(obj,cb){
    if(!obj.userId)
        return cb("UserId不存在");

    var that=this;
    var tobj={};
    thenjs()
        .then(function(cont){
            if(!obj.id)
                return cont();
            that.getMember(obj.id,function(error,member){
                cont(null,member);
            });
        })
        .then(function(cont,member){
            if(member)
                return cont(null,member);
            that.getMemberByUserId(obj.userId,function(error,member){
                cont(null,member);
            });
        })
        .then(function(cont,member){

            tobj.isNew=false;

            if(!member){
                tobj.isNew=true;
                that.addMember(obj.userId,function(error,ms){
                    if(error)
                        return cont(error);

                    var mb=ms[0];
                    if(mb.role!=obj.role &&["user","master","admin"].indexOf(obj.role)>=0){
                        mb.role=obj.role;
                        return mb.store(cont);
                    }

                    cont(null,ms[0]);
                });
            }
            else{

                tobj.isNew=member.isDelete;
                for(var index in obj)
                    member[index]=obj[index];
                if(tobj.isNew) {
                    member.isDelete = false;
                    member.createdAt = new Date();
                }
                member.updatedAt=new Date();
                member.store(cont);
            }
        })
        .then(function(cont,member){
            tobj.member=member;
            //如果是新加入
            if(!tobj.isNew)
                return cb(null,tobj.member);

            that.systemMessage_memberAdd(null,member,cont);

        })
        .then(function(cont){
            that.autoUpdateName(cont)
        })
        .then(function(cont){
            that.updateTime(function(){
                cb(null,tobj.member);
            });
        })
        .fail(function(cont,error){
            cb(error);
        });
};

Session.prototype.addMessage=function(uid,content,type,cb){

    var that=this;
    //保存消息
    var tobj={};
    thenjs()
        .then(function(cont){
            that.getMembers(cont)
        })
        .then(function(cont,list){
            tobj.members=list;
            for(var i=0;i<list.length;i++){
                if(list[i].userId==uid) {
                    //此成员已经被删除
                    if(list[i].isDelete)
                        return cont({code:403,error:"没有权限"});
                    return cont();
                }
            }
            //系统和空用户有权限发消息
            if(uid=="system" || !uid)
                return cont();
            return cont({code:403,error:"没有权限"});
        })
        .then(function(cont,user){
            MessageModel.save({
                clientId:that.sessions.client.id,
                sessionId:that.id,
                sender:uid,
                content:content,
                type:type,
                updatedTime:new Date().getTime(),
                isDelete:false
            },cont);
        })
        //更新最后一条消息
        .then(function(cont,obj){

            tobj.message=new Message(that,obj);

            that.messages.push(tobj.message);
            if(that.messages.length>50)
                that.messages.splice(0,1);

            that.lastMessage={
                sender:uid,
                content:content,
                type:type,
                createdAt:obj.createdAt
            };
            //console.log("lastmessage("+that.rid+"):"+content);

            //标注有新消息
            for(var i=0;i<tobj.members.length;i++){
                var m=tobj.members[i];
                if(m.userId!=uid)
                    m.unread=(m.unread||0)+1;
            }

            var lastDate=that.messageUpdatedAt || new Date(1900,1,1);
            that.messageUpdatedAt=new Date(obj.updatedTime);//new Date();//obj.updatedTime;//obj.updatedAt;

            lastDate=new Date(lastDate.getTime());

            lastDate.setHours(lastDate.getHours()+config.session.userConvrKeepAlive);

            if(lastDate>obj.messageUpdatedAt)
                return cont();

            //如果消息发送间隔1个小时(config.session.userConvrKeepAlive)以上，需要所有会话都更新一次
            thenjs()
                .each(tobj.members,function(cont,member){
                    //此群成员被删除，不用更新会话
                    if(member.isDelete)
                        return cont();
                    //没用户会话就新建
                    if(!member.hasConvr)
                        return member.checkUserConversation(that.messageUpdatedAt,cont);
                    //有就更新
                    member.updateUserConversation(that.messageUpdatedAt,cont);
                })
                .then(function(ct){
                    cont();
                })
                .fail(function(ct,error){
                    cont(error);
                });
        })
        .then(function(cont){
            cb(null,tobj.message);
        })
        .fail(function(cont,error){
            cb(error);
        });

};

Session.prototype.setMessage=function(id,uid,content,type,cb){

    var that=this;
    //保存消息
    var tobj=this;
    thenjs()
        .then(function(cont){
            that.getMembers(cont)
        })
        .then(function(cont,list){
            tobj.members=list;
            for(var i=0;i<list.length;i++){
                if(list[i].userId==uid)
                    return cont();
            }
            cont("没有权限发送消息");
        })
        .then(function(cont,user){
            var obj={
                id:id,
                clientId:that.sessions.client.id,
                sessionId:that.id,
                sender:uid,
                content:content,
                type:type,
                isDelete:false
            };
            tobj.message=new Message(that,obj);
            MessageModel.save(obj,cont);
        })
        .then(function(cont,obj){

            for(var i=0;i<that.messages.length;i++){
                var msg=that.messages[i];
                if(msg.id==id){
                    if(i==that.messages.length-1){
                        if(i>0) {
                            var l = that.messages[i - 1];
                            that.lastMessage = {
                                sender: l.sender,
                                content: l.content,
                                type: l.type,
                                createdAt: l.createdAt
                            };
                        }
                        else{
                            that.lastMessage = {
                                sender: uid,
                                content: content,
                                type: type,
                                createdAt: msg.createdAt
                            };
                        }
                    }
                    msg.sender=uid;
                    msg.content=content;
                    msg.type=content;
                    msg.updatedAt=new Date();
                    break;
                }
            }

            cont();
        })
        .then(function(cont){
            cb(null,tobj.message);
        })
        .fail(function(cont,error){
            cb(error);
        });
};

Session.prototype.syncMessage=function(userId,timestamp,filter_term,limit,offset,cb){

    this._clearUnread(userId);

    var that=this;
    this.getMemberByUserId(userId,function(error,member){

        if(error)
            return cb(error);

        if(!member || member.isDelete){
            return cb({code:403,error:"没有权限"});
        }

        if(timestamp && that.messages.length>0 && that.messages[0].updatedAt<timestamp){

            var res=[];
            for(var i=0;i<that.messages.length;i++){
                if(that.messages[i].updatedAt>=timestamp)
                    res.push(that.messages[i]);
            }

            var result={total_count:res.length,entries:[]};
            for(var i=(offset||0);i<res.length&& i<limit+offset;i++){
                var msg=res[i];
                result.entries.push(msg.toJson());
            }
            result.sessionUpdatedAt=that.updatedAt;

            return cb(null,result);
        }

        MessageModel.getMessageList(that.id,that.sessions.client.id,timestamp,filter_term,limit,offset,function(error,obj){
            if(obj && obj.entries)
                for(var i=0;i<obj.entries.length;i++){
                    var entity=obj.entries[i];
                    delete entity.clientId;
                    delete entity.ownerId;
                    if(entity.updatedTime>1448800000000)
                        entity.updatedAt=new Date(entity.updatedTime);
                    delete entity.updatedTime;
                }

            obj.sessionUpdatedAt=that.updatedAt;
            cb(error,obj);
        });



    });


};

Session.prototype.historyMessage=function(userId,timestamp,limit,offset,cb){

    var that=this;
    this.getMemberByUserId(userId,function(cont,member) {

        if (!member ) {
            return cont({code: 403, error: "没有权限"});
        }

        if(member.isDelete && timestamp>member.createdAt){
            timestamp=member.createdAt;
            timestamp.setSeconds(timestamp.getSeconds()-1);
        }


        if (timestamp > new Date())
            that._clearUnread(userId);
        MessageModel.getLastMessageList(that.id, that.sessions.client.id, timestamp, limit, offset, function (error, result) {
            if (error)
                return cb(error);

            for(var i=0;i<result.length;i++){
                var entity=result[i];
                delete entity.clientId;
                delete entity.ownerId;
                if(entity.updatedTime>1448800000000)
                    entity.updatedAt=new Date(entity.updatedTime);
                delete entity.updatedTime;
            }
            cb(null, result);
        });
    });
};

Session.prototype.store=function(cb){

    var that=this;
    for(var index in this.entity)
        this.entity[index]=this[index];
    SesssionModel.save(this.entity,function(error,obj){
        if(error)
            return cb(error);

        return cb(null,that);
    });

};

Session.prototype.updateTime=function(cb){
    this.entity.updatedAt=new Date();
    var that=this;
    SesssionModel.update(this.entity,["updatedAt"],function(error){
        if(error)
            return cb(error);
        that.updatedAt=that.entity.updatedAt;
        if(cb)
            cb();
    });

};

Session.prototype.autoUpdateName=function(cb){

    //只有群才能自动重命名
    if(this.type!="group")
        return cb();

    //已经由用户定义过名称，不用再自动更名
    if(this.nameChanged)
        return cb();

    var that=this;
    thenjs()
        .then(function(cont){
            that.getMembers(cont);
        })
        .then(function(cont,members){
            if(members.length<0)
                return cb();

            var names=[];
            for(var i=0;i<members.length && names.length<4;i++){
                var member=members[i];
                if(!member.isDelete)
                    names.push(members[i].name);
            }

            var n=names.join(",");
            if(n==that.name)
                return cb();

            that.name=n;
            that.entity.updatedAt=new Date();
            that.entity.name=n;
            SesssionModel.update(that.entity,["name","updatedAt"],cont);
        })
        .then(function(cont){
            that.updatedAt=that.entity.updatedAt;
            that.name=that.entity.name;
            if(cb)
                cb();
        })
        .fail(function(cont,error){
            cb(error);
        })
};

Session.prototype.systemMessage_memberAdd=function(uid,member,cb){
    //如果是p2p，则第2个人时才发消息

    uid=uid||"system";

    var that=this;
    if(that.type=="p2p") {
        that.getMembers(function (error, list) {
            if (error)
                return cb();
            if (list.length != 2)
                return cb();
            that.addMessage(uid,JSON.stringify({"text":"你们现在可以开始聊天了。"}),"system",cb);
        })
    }
    else if(that.type=="group"){
        that.addMessage(uid,JSON.stringify({"text":(member.name||"有人")+"加入群聊"}),"system",cb);
    }
    else{
        return cb();
    }

};
Session.prototype.systemMessage_memberLeave=function(uid,member,cb){
    var that=this;
    uid=uid||"system";
    if(that.type=="group"){
        that.addMessage(uid,JSON.stringify({"text":(member.name||"有人")+"离开了群"}),"system",cb);
    }
    return cb();
};

Session.prototype.delete=function(cb){
    this.entity.isDelete=true;
    var that=this;
    SesssionModel.update(this.entity,["isDelete"],function(error){
        if(error)
            return cb(error);
        that.isDelete=that.entity.isDelete;
        if(cb)
            cb();
    });
};

Session.prototype.toJson=function(){
    var session=this;
    return {
        "id": session.id,
        "name": session.name,
        "nameChanged": session.nameChanged,
        "secureType": session.secureType ,
        "type": session.type,
        "description": session.description,
        "createdAt": session.createdAt,
        "updatedAt": session.updatedAt,
        "avatarUrl": session.avatarUrl
    };
};

Session.prototype._clearUnread=function(userId){

    var that=this;
    that.getMemberByUserId(userId,function(error,member){
        if(error)
            return;

        member.clearUnread(function(error){
            if(error)
                console.error(error);
        });
    });
};

Session.prototype.checkRight=function(uid,right,cb){

    var that=this;
    thenjs()
        .then(function(cont){
            that.getMembers(cont);
        })
        .then(function(cont,members){
            if(members.length<=0)
                return cb();

            that.getMemberByUserId(uid,cont);
        })
        .then(function(cont,member){

            if(!member || member.isDelete)
                return cb({code:403,error:"没有权限"});

            var role=member.role;
            //所有者有所有权限
            if(role=="master")
                return cb();

            //目前权限没有细分，开发者可以根据自己业务需要更改
            var can=false;
            switch(right){
                case "Session_Edit":
                case "Session_Delete":
                case "Member_Delete":
                case "Member_Delete_Self":
                case "Member_Add":
                case "Member_Edit":
                //case "Member_Edit_Self":
                    can=true;
                    break;
            }

            if(can)
                return cb();

            return cb({code:403,error:"没有权限"});
        })
        .fail(function(cont,error){
            cb(error);
        })

};

module.exports=Session;