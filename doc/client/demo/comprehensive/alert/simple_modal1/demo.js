(function() {
    // 这些变量和函数的说明，请参考 rdk/app/example/web/scripts/main.js 的注释
    var downloadDependency = [
        'rd.attributes.modal','bootstrap','bootstrap-select','rd.controls.Button'
    ];
    var requiredComponents = [ ], ctx = {};
    var controllerDefination = ['$scope', 'EventService', main];
    function main(scope,EventService) {
        scope.setmodal = function(id, modal, position) {
            EventService.broadcast(id, modal, position);
            $('.selectpicker').selectpicker();
            $('.content>ul>li:nth-child(2)>i').click(function(){
                $(this).css({'background': '#5395d8',
                             'color': '#fff'}).siblings('i').css({'background': '#fff',
                                                             'color': '#999'})
            })
        }
    }

    var controllerName = 'DemoController';
    //==========================================================================
    //                 从这里开始的代码、注释请不要随意修改
    //==========================================================================
    define(/*fix-from*/application.getDownloads(downloadDependency)/*fix-to*/, start);
    function start() {
        application.initContext(ctx, arguments, downloadDependency);
        rdk.$injectDependency(application.getComponents(requiredComponents, downloadDependency));
        rdk.$ngModule.controller(controllerName, controllerDefination);
    }
})();