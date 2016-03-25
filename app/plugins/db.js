var config=require("../config");
var Sequelize=require("sequelize");

var sequelize = new Sequelize(config.db.database, config.db.username, config.db.password, {
    host: config.db.host,
    dialect: config.db.dialect,
    pool: {
        max: 5,
        min: 1,
        idle: 10000
    },
    logging:false
});



var initModel=function(model){

    model.get=function(id,cb){
        this.find(id).then(function(obj){
            var result=obj;
            if(obj)
                result=obj.dataValues;
            if(cb)
                cb(null,result);
        });
    };

    model.delete=function(id,cb){
        this.destroy({where:{id:id}}).then(function(obj){
            if(cb)
                cb();
        });
    };

    model.save=function(obj,cb){
        //insert
        if(!obj.id){
            this.create(obj).then(function(obj){
                if(cb)
                    cb(null,checkId(obj.dataValues));
            });
            return;
        }

        //update
        this._update(obj, {where:{id : obj.id}}).then(function(obj){
            if(cb)
                cb(null,obj);
        });
    };

    model._update=model.update;
    model.update=function(obj,parms,cb){
        var sobj={};
        for(var i=0;i<parms.length;i++){
            var key=parms[i];
            sobj[key]=obj[key];
        }
        this._update(sobj, {where:{id : obj.id}}).then(function(obj){
            if(cb)
                cb(null,obj);
        });
    };

    model.sync();

    return model;
};

var checkId=function(obj){
    if(!obj)
        return obj;
    obj.id=obj.id+"";
    return obj;
};
module.exports={
    Boolean:Sequelize.BOOLEAN,
    String:Sequelize.STRING,
    Text:Sequelize.TEXT,
    Int:Sequelize.INTEGER,
    BigInt:Sequelize.BIGINT,
    Float:Sequelize.FLOAT,
    DateTime:Sequelize.DATE,
    define:function(name,config){
        return initModel(sequelize.define(name,config));
    },
    checkId:checkId,
    fn:Sequelize.fn,
    col:Sequelize.col
};