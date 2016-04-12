var db=require("../plugins/db");
var utils=require("../utils");

var Obj=db.define("Emoji",{
    clientId:db.String,
    package:db.String,
    type:db.String,
    name:db.String,
    url:db.String,
    width:db.Int,
    height:db.Int,
    isDelete:db.Boolean
});


var emojis=[
    {url:'/Emoji/expr_1.png',name:'微笑'},
    {url:'/Emoji/expr_2.png',name:'开心'},
    {url:'/Emoji/expr_3.png',name:'偷笑'},
    {url:'/Emoji/expr_4.png',name:'汗颜'},
    {url:'/Emoji/expr_5.png',name:'抓狂'},
    {url:'/Emoji/expr_6.png',name:'疑问'},
    {url:'/Emoji/expr_7.png',name:'耍酷'},
    {url:'/Emoji/expr_8.png',name:'发怒'},
    {url:'/Emoji/expr_9.png',name:'晕啊'},
    {url:'/Emoji/expr_10.png',name:'飞吻'},
    {url:'/Emoji/expr_11.png',name:'无语'},
    {url:'/Emoji/expr_12.png',name:'装酷'},
    {url:'/Emoji/expr_13.png',name:'郁闷'},
    {url:'/Emoji/expr_14.png',name:'白眼'},
    {url:'/Emoji/expr_15.png',name:'尴尬'},
    {url:'/Emoji/expr_16.png',name:'哭泣'},
    {url:'/Emoji/expr_17.png',name:'害羞'},
    {url:'/Emoji/expr_18.png',name:'惊讶'},
    {url:'/Emoji/expr_19.png',name:'沉默'},
    {url:'/Emoji/expr_20.png',name:'委屈'},
    {url:'/Emoji/expr_21.png',name:'期待'},
    {url:'/Emoji/expr_22.png',name:'奸笑'},
    {url:'/Emoji/expr_23.png',name:'困'},
    {url:'/Emoji/expr_24.png',name:'喜欢'},
    {url:'/Emoji/expr_25.png',name:'祈祷'},
    {url:'/Emoji/expr_26.png',name:'哼'},
    {url:'/Emoji/expr_27.png',name:'吃惊'},
    {url:'/Emoji/expr_28.png',name:'喷嚏'},
    {url:'/Emoji/expr_29.png',name:'鼓掌'},
    {url:'/Emoji/expr_30.png',name:'鄙视'},
    {url:'/Emoji/expr_31.png',name:'惊'},
    {url:'/Emoji/expr_32.png',name:'抠鼻'},
    {url:'/Emoji/expr_33.png',name:'剪刀'},
    {url:'/Emoji/expr_34.png',name:'拳头'},
    {url:'/Emoji/expr_35.png',name:'布'},
    {url:'/Emoji/expr_36.png',name:'赞'},
    {url:'/Emoji/expr_37.png',name:'玫瑰'},
    {url:'/Emoji/expr_38.png',name:'电话'},
    {url:'/Emoji/expr_39.png',name:'西瓜'},
    {url:'/Emoji/expr_40.png',name:'咖啡'}
];

for(var i=0;i<emojis.length;i++){
    var em=emojis[i];
    em.id="base_"+i;
    em.type="emoji";
    em.package="基本";
    em.height=84;
    em.width=84;
    em.isDelete=false;
    var d=new Date(2010,1,1);
    d.setSeconds(d.getSeconds()+i);
    em.updatedAt=d;
    em.createdAt=d;
}
var d=new Date(2010,1,1);
d.setSeconds(d.getSeconds()+emojis.length);


Obj.getEmojiList=function(clientId,clientTime,limit,offset,cb){

    var that=this;
    //先在集合中找：
    if(clientTime<d){
        return cb(null,{total_count:emojis.length+1,entries:emojis});
    }


    var where={clientId:clientId, updatedAt:{$gt:clientTime }};

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

Obj.getEmojiByName=function(clientId,name,cb){
    this.find({where:{clientId:clientId,name:name}}).then(function(obj){
        var result=obj;
        if(obj)
            result=db.checkId(obj.dataValues);
        if(cb)
            cb(null,result);
    });
};
Obj.getEmoji=function(clientId,id,cb){
    this.find({where:{clientId:clientId,id:id}}).then(function(obj){
        var result=obj;
        if(obj)
            result=db.checkId(obj.dataValues);
        if(cb)
            cb(null,result);
    });
};

module.exports=Obj;
