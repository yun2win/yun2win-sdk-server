

var Messages=function(session){
    this.session=session;
};


Messages.prototype.addMessage=function(uid,content,type,cb){

    var that=this;
    var tobj=this;
    //保存消息
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
            MessageModel.save({
                clientId:that.sessions.client.id,
                sessionId:that.id,
                sender:uid,
                content:content,
                type:type,
                isDelete:false
            },cont);
        })
        //更新最后一条消息
        .then(function(cont,obj){

            tobj.message=new Message(that,obj);

            that.lastMessage={
                sender:uid,
                content:content,
                type:type,
                createdAt:obj.createdAt
            };

            //标注有新消息
            for(var i=0;i<tobj.members.length;i++){
                var m=tobj.members[i];
                if(m.userId!=uid)
                    m.unread=(m.unread||0)+1;
            }

            var lastDate=that.messageUpdatedAt || new Date(1900,1,1);
            that.messageUpdatedAt=obj.updatedAt;

            lastDate.setHours(lastDate.getHours()+config.session.userConvrKeepAlive);

            if(lastDate>obj.messageUpdatedAt)
                return cont();

            //如果消息发送间隔1个小时(config.session.userConvrKeepAlive)以上，需要所有会话都更新一次
            thenjs()
                .each(tobj.members,function(cont,member){
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




module.exports=Messages;