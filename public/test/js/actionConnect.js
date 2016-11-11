var ActionConnect=function(host,win){
    //只能1个实例
    var key="__connect__instance";
    if(window[key]){
        return window[key];
    }

    window[key]=this;
    this.index=1;
    this.callbacks=[];
    this.host=host;
    this.win=win;

    this.readyActions=[];

    this._init();
};
ActionConnect.prototype._init=function(){
    var that=this;
    window.onmessage=function(e){
        e=e||event;
        var text = e.data;

        console.log("browser recevie: "+text);
        try {
            var obj = JSON.parse(text);
            that.onReceive(obj);
        }
        catch(ex){
            console.log('error:'+ex);
        }
    };

    var ms=[];
    for(var index in this)
        ms.push(index);
    this.request("_genAllMethod",function(err,methods){

        for(var i=0;i<methods.length;i++){
            var method=methods[i];
            if(ms.indexOf(method)<0){
                that[method]=that._oper(method);
            }
        }

        for(var i=0;i<that.readyActions.length;i++){
            try{
                that.readyActions[i]();
            }
            catch(ex){}
        }

        this._isReady=true;
    });
};
ActionConnect.prototype._oper=function(method){
    var that=this;
    return function(){
        var params=[method];
        for(var i=0;i<arguments.length;i++) {
            var arg = arguments[i];
            params.push(arg);
        }
        that.request.apply(that,params);
    }
};
ActionConnect.prototype._genAllMethod=function(cb){

    var methods=[];
    for(var index in this.host){
        if(index.indexOf("_")==0)
            continue;

        if(typeof this.host[index] !='function')
            continue;

        methods.push(index);
    }
    cb(null,methods);

};
ActionConnect.prototype.ready=function(action){

    if(this._isReady)
        return action();

    if(action)
        this.readyActions.push(action);
};
ActionConnect.prototype.request=function(_actionName,_params,_cb){

    var action =null;
    var cb=null;
    var params=[];

    for(var i=0;i<arguments.length;i++){
        var arg = arguments[i];
        if(i==0)
            action=arg;
        else if(i==arguments.length-1 && typeof arg=='function')
            cb=arg;
        else
            params.push(arg);
    }

    this.index++;
    this.callbacks[this.index]=cb;
    this.sendMessage({index:this.index,action:action,params:params});
};
ActionConnect.prototype.response=function(index,action,params){

    if(!index || !action)
        return console.log("action index can't null");

    var that=this;
    this.doAction(action,params,function(error,result){
        that.sendMessage({index:index,type:'callback',error:error,result:result});
    });

};
ActionConnect.prototype.doAction=function(action,params,cb){

    if(action=="_genAllMethod"){
       return this._genAllMethod(cb);
    }

    var act=this.host[action];
    if(!act)
        return cb("方法不存在!");

    if(!params)
        params=[];
    if(params.length==undefined)
        params=[params];
    params.push(cb);

    act.apply(this.host,params);
};
ActionConnect.prototype.sendMessage=function(obj){
    this.win.postMessage(JSON.stringify(obj),"*");
};
ActionConnect.prototype.onReceive=function(obj){

    var index =obj.index;
    //request callback
    if(obj.type=="callback") {
        var error=obj.error;
        var result=obj.result;

        if(this.callbacks[index]){
            this.callbacks[index](error,result);
            delete this.callbacks[index];
        }
    }
    //response
    else{
        var action=obj.action;
        var params=obj.params;

        this.response(index,action,params);
    }
};
