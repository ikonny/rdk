(function() {
    // 这些变量和函数的说明，请参考 rdk/app/example/web/scripts/main.js 的注释
    var imports = [
        'rd.controls.Module', 'base/template/sample_module'
    ];
    var extraModules = [ ];
    var controllerDefination = ['$scope','EventService','EventTypes', main];
    function main(scope,EventService,EventTypes ) {
        scope.load = function() {
            //mymodule是rdk_module节点的id属性值。
            //传递给loadModule函数的第一个参数是该模块的initData，
            //这个对象中的所有属性都会被拷贝到新模块的控制器作用域中
            //如果新模块未定义任何控制器，则initData将被无视。
            rdk.mymodule.loadModule({myData: 'load module manually...'});
        }
        scope.destroy = function() {
            rdk.mymodule.destroyModule();
        }
        EventService.register('mymodule', EventTypes.LOADING, function(){
            alert('当模块开始加载时发出此事件')
        });
        EventService.register('mymodule', EventTypes.READY, function(){
            alert('当模块一切准备就绪时发出此事件')
        });
        EventService.register('mymodule', EventTypes.DESTROY, function(){
            alert('当模块被销毁之后发出此事件')
        });
    }

    var controllerName = 'DemoController';
    //==========================================================================
    //                 从这里开始的代码、注释请不要随意修改
    //==========================================================================
    define(/*fix-from*/application.import(imports)/*fix-to*/, start);
    function start() {
        application.initImports(imports, arguments);
        rdk.$injectDependency(application.getComponents(extraModules, imports));
        rdk.$ngModule.controller(controllerName, controllerDefination);
    }
})();