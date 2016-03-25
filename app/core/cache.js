
var timer=require("../timer");

var Cache=function(max){
    this.obj={};
    this.length=0;
    this.max=max || 500;

    this.init();
};

Cache.prototype.get=function(key,cb){
    if(!key)
        return cb();
    var v=this.obj[key];
    if(v)
        v= v.obj;
    cb(null,v);
};

Cache.prototype.set=function(key,obj,cb){
    var o=this.obj[key];

    if(o){
        var t=this.obj[key];
        t.obj=obj;
        t.date=new Date();
        return cb(null, obj);
    }

    this.length++;
    this.obj[key]={obj:obj,date:new Date()};

    if(this.length<this.max)
        return cb(null,obj);

    var lastKey=null;
    var lastDate=new Date();
    for(var index in this.obj){
        var t=this.obj[index];
        if(t.date<lastDate){
            lastDate= t.date;
            lastKey=index;
        }
    }
    if(!lastKey)
        delete this.obj[lastKey];
    cb(null,obj);
};

Cache.prototype.init=function(){
    var that=this;
    timer.push(function(d){

        if(d.getMinutes()%30!=0)
            return;

        var td=new Date();
        td.setMinutes(td.getMinutes()-30);

        for(var index in that.obj){
            var t=that.obj[index];
            if(t.date<td)
                delete that.obj[index];
        }

    });
};

module.exports=Cache;