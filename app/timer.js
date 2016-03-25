var time={};

time._actions=[];
time._step=1000*60;

time.__auto=setInterval(function(){

    var d=new Date();
    for(var i=0;i<time._actions.length;i++){
        try {
            time._actions[i](d);
        }
        catch(e){
            //throw e;
            console.error("timer error:"+ e.stack);
        }
    }

},time._step);

time.push=function(action){
  time._actions.push(action);
};

module.exports=time;
