
var clients=require("../app/core/clients");
var thenjs=require("thenjs");

module.exports=function(router,oauth){

    router.get("/records/:day",oauth,function(req,res,next){

        try {
            var dayStr = req.params.day;
            var begin = new Date(dayStr);
            begin=new Date(begin.toDateString());
            var end=new Date(begin.toDateString());
            end.setDate(end.getDate()+1);
            var clientId = req.oauth.bearerToken.clientId;


            thenjs()
                .then(function(cont){
                    clients.get(clientId,cont);
                })
                .then(function(cont,client){
                    client.records.getBy(begin,end,cont);
                })
                .then(function(cont,obj){
                    res.json(obj)
                })
                .fail(function(cont,error){
                    next(error);
                });
        }
        catch(ex){
            next(ex);
        }

    });



};


