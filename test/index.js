var config=require("../app/config");
var thenjs=require("thenjs");

var tester=[

    require("./init"),
    require("./main")
];

if(config.testing) {

    thenjs()
        .series(tester)
        .then(function(){
            console.log("all test is ok");
        })
        .fail(function (cont, error) {
            console.error("tester not ok");
            console.error(error.stack || error);
        });

}

//console.log(require("../app/plugins/pinyin")("行了行家行為中国和中國這是一個thisThtis.wfEwefw"));

