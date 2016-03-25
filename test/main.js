var context=require("./context");
var thenjs=require("thenjs");

module.exports=function(cb){

    var toUserId=1;
    //增加联系人，发起私聊
    var timeslip=new Date();
    var content="{text:'content--=-=-='}";
    var tobj={};
    thenjs()
        .then(function(cont){
            context.user.contacts.addContact(toUserId,cont);
        })
        .then(function(cont,contact){
            contact.getSession(cont);
        })
        .then(function(cont,session){
            tobj.session=session;
            session.addMessage(context.user.id,content,"text",cont)
        })
        .then(function(cont){
            context.client.users.get(toUserId,cont);
        })
        .then(function(cont,toUser){
            toUser.userConversations.getList(tobj.session.updatedAt,cont);
        })
        .then(function(cont,userConvrs){
            var msg=userConvrs[userConvrs.length-1].lastMessage;
            if(msg.content!=content)
                cont("内容不一致");
            cb();
        })
        .fail(function(cont,error){
            cb(error);
        });
};