var thenjs=require("thenjs");
var UserConversationModel=require("../model/userConversation");
var UserConversation=require("./userConversation");
var config=require("../config");

var UserConversations=function(user){
    this.user=user;
    this.list=null;
};

UserConversations.prototype.getList=function(clientTime,filter_term,cb){

    //支持单参数访问
    if(clientTime && !cb) {
        cb = clientTime;
        clientTime=new Date(1900,1,1);
    }

    var that=this;
    var lastConvrs=[];
    var tobj=this;
    thenjs()
        .then(function(cont){
            if(that.list)
                return cont(null,that.list);

            var clientId=that.user.users.client.id;
            var userid=that.user.id;
            UserConversationModel.getLatest(clientId,userid,100,function(error,objs){
                if(that.list)
                    return  cont(null,that.list);
                that.list=[];
                for(var i=0;i<objs.length;i++){
                    that.list.push(new UserConversation(that,objs[i]));
                }
                cont(null,that.list);
            });

        })
        //找出1个小时内有更新的会话
        .then(function(cont){
            var timeslip=new Date();
            timeslip.setHours(timeslip.getHours()-config.session.userConvrKeepAlive);
            tobj.timeslip=timeslip;
            for(var i=0;i<that.list.length;i++){
                var obj=that.list[i];
                if(obj.type=="p2p" && obj.targetId==that.user.id)
                    continue;
                if(obj.updatedAt>=clientTime && (!filter_term || filter_term==obj.type))
                    lastConvrs.push(obj);
            }
            cont();
        })
        .each(lastConvrs,function(cont,uc){
            if(uc.updatedAt>tobj.timeslip || !uc.lastMessage)
                return uc.refresh(function(error){
                    if(error)
                        console.log("userSession["+uc.id+"] refresh error:"+error)
                    cont();
                });
            cont();
        })
        .then(function(cont,list){
            lastConvrs.sort(function(a,b){
                return a.updatedAt- b.updatedAt;
            });

            cb(null,lastConvrs);
        })
        .fail(function(cont,error){
            cb(error);
        });

};

UserConversations.prototype.getUserConversation=function(type,targetId,cb){
    var that=this;
    if(that.list){
        for(var i=0;i<that.list.length;i++)
            if(that.list[i].targetId==targetId && that.list[i].type==type)
                return cb(null,that.list[i]);
    }

    //不在缓存里？那从数据库里找
    thenjs()
        .then(function(ct){
            UserConversationModel.getByTargetId(that.user.id,that.user.users.client.id,type,targetId,ct);
        })
        .then(function(ct,entity){
            if(!entity)
                return cb();

            var uc=new UserConversation(that,entity);
            if(that.list)
                that.list.push(uc);
            cb(null,uc);
        })
        .fail(function(ct,error){
            cb(error);
        });
};

UserConversations.prototype.updateUserConversation=function(type,targetId,time,cb){
    //Update....
    //console.log("UserConversations.prototype.updateUserConversation");
    //console.log(this.user.id+'--'+type+'--'+targetId+'--'+time);

    var that=this;
    thenjs()
        .then(function(cont){
            //如果已缓存了，找到
            if(that.list){
                for(var i=0;i<that.list.length;i++)
                    if(that.list[i].targetId==targetId && that.list[i].type==type)
                        return cont(null,that.list[i]);
            }

            //不在缓存里？那从数据库里找
            thenjs()
                .then(function(ct){
                    UserConversationModel.getByTargetId(that.user.id,that.user.users.client.id,type,targetId,ct);
                })
                .then(function(ct,entity){
                    if(!entity)
                        return cont();

                    var uc=new UserConversation(that,entity);
                    if(that.list)
                        that.list.push(uc);
                    cont(null,uc);
                })
                .fail(function(ct,error){
                    cont(error);
                });
        })
        .then(function(cont,uc){
            if(!uc)
                cb();

            uc.updateTime(time,cont);
        })
        .then(function(cont){
            cb();
        })
        .fail(function(cont,error){
            cb(error);
        });

};

UserConversations.prototype.clearUnread=function(targetId){

    var that=this;
    if(that.list){
        for(var i=0;i<that.list.length;i++)
            if(that.list[i].targetId==targetId){
                that.clearUnread();
            }
    }
};

UserConversations.prototype.addUserConversation=function(type,targetId,name,avatarUrl,top,cb){

    //console.log("UserConversations.prototype.addUserConversation");
    //console.log(this.user.id+'--'+type+'--'+targetId+'--'+name+'--'+avatarUrl+'--');

    if(typeof top=="function" && !cb){
        cb=top;
        top=false;
    }

    var that=this;
    thenjs()
        .then(function(cont){
            that.getUserConversation(type,targetId,cont);
        })
        .then(function(cont,uc){
            if(uc){

                if(uc.isDelete){
                    uc.isDelete=false;
                    uc.type=type;
                    uc.name=name;
                    uc.targetId=targetId;
                    uc.updatedAt=new Date();
                    uc.store(function(error){
                        return cb(error,uc);
                    });
                }
                else
                   cb(null,uc);
                return;
            }

            UserConversationModel.save({
                clientId:that.user.users.client.id,
                ownerId:that.user.id,
                targetId:targetId,
                name:name,
                type:type,
                top:top,
                avatarUrl:avatarUrl,
                isDelete:false
            },cont);
        })
        .then(function(cont,entity){
            var uc=new UserConversation(that,entity);
            if(that.list)
                that.list.push(uc);
            cb(null,uc);
        })
        .fail(function(cont,error){
            cb(error);
        });

};

UserConversations.prototype.updateCache=function(obj,cb){

    var that=this;
    if(!that.list)
        return cb();

    var uc=null;
    for(var i=0;i<that.list.length;i++)
        if(that.list[i].id==obj.id) {
            uc = that.list[i];
            break;
        }

    if(uc)
        for(var index in obj)
            uc[index]=obj[index];
    uc.updatedAt=new Date();
    uc.entity.updatedAt=new Date();

    cb(null,uc);

};

UserConversations.prototype.get=function(id,cb){

    if(this.list){
        for(var i=0;i<this.list.length;i++){
            if(this.list[i].id==id)
                return cb(null,this.list[i]);
        }
    }

    var that=this;
    UserConversationModel.get(id,function(error,obj){
        if(error)
            return cb(error);
        if(!obj)
            return cb();

        cb(null,new UserConversation(that,obj));
    });

};


module.exports=UserConversations;