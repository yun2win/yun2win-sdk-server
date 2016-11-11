
var Register=function(){

    this.email='';
    this.key='';

};

Register.prototype.init=function(){

    var parms=this.getUrlParms();
    this.email=parms.email;
    this.key=parms.key;
    $("#email").val(this.email);
    $("#key").val(this.key);

    if(this.email){
        var name=this.email.substr(0,this.email.indexOf("@"));
        $("#name").val(name);
    }

    var that=this;

    this.isExist(this.email,function(err,exist){

        if(exist){
            that.changePanel(true);
            return;
        }

        that.changePanel(false);


        that.submit=$("#submit");
        that.submit.on('click',function(){

            var account=$("#email").val();
            var key=$("#key").val();
            var name=$("#name").val();
            var password=$("#password").val();

            that.accept(account,password,name,key,function(error){

                $("#success").removeClass("hide");
                that.changePanel(true);
            });

        });
    });



};

Register.prototype.changePanel=function(download){

    if(download){

        $("#accept-panel").addClass("hide");
        $("#download-panel").removeClass("hide");

    }
    else{

        $("#download-panel").addClass("hide");
        $("#accept-panel").removeClass("hide");

    }

};

Register.prototype.isExist=function(account,cb){
    var url = '/v1/users/login';
    var params = {
        email: account,
        password:'test'
    };
    baseRequest.post(url, params, null, function(error){

        if(error && error.responseText.indexOf("用户不存在")>=0)
            return cb(null,false);

        cb(null,true);

    });

};

Register.prototype.accept=function(account,password,name,key,cb){

    cb = cb || nop;
    var url = '/v1/users/register';
    var params = {
        email: account,
        password:MD5(password),
        name: name,
        key:key
    };
    baseRequest.post(url, params, null, function(error){

        if(error){

            try{
                var j=JSON.parse(error.responseText);
                alert(j.message);
            }
            catch(ex){
                alert("很抱歉,未加入成功!");
            }

            return;
        }

        cb();

    });
};

Register.prototype.getUrlParms=function(){
    var parms={};
    var url = location.href;
    var uks=url.split('?');
    if(uks.length<=1)
        return parms;

    var pks=uks[1].split("&");
    for(var i=0;i<pks.length;i++){
        var pk=pks[i];
        var kvs=pk.split("=");
        if(kvs.length==2){
            parms[kvs[0]]=kvs[1];
        }
    }

    return parms;

};

var reg=new Register();
reg.init();

