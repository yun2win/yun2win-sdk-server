

var Message=function(session,entity){

    this.session=session;
    this.entity=entity;

    for(var index in this.entity)
        this[index]=this.entity[index];

};

Message.prototype.toJson=function(){
    return {
        id:this.id,
        type:this.type,
        sender:this.sender,
        content:this.content,
        createdAt:this.createdAt,
        updatedAt:this.updatedAt
    };
}

module.exports=Message;