(function() {
    // 这些变量和函数的说明，请参考 rdk/app/example/web/scripts/main.js 的注释
    var downloadDependency = [
        'rd.controls.Module', 'rd.services.PopupService', 'base/template/sample_module'
    ];
    var requiredComponents = [ ], ctx = {};
    var controllerDefination = ['$scope','PopupService', main];
    function main(scope,PopupService) {
        var moduleID;

        scope.load = function() {
            var sampleUrl = 'template/sample_module.html';
            var initData = {myData: 'load module manually...'};
            var myOption = {
                modal: true,
                effect: 'explode',
                x: 50,
                y: 50,
                // left: 50,
                // top: 50,         
                // right: 50,
                // bottom: 50,//bottom时有像素差
            }
            moduleID = PopupService.popup(sampleUrl, initData, myOption);
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