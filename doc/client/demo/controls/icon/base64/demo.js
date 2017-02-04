(function() {
    // 这些变量和函数的说明，请参考 rdk/app/example/web/scripts/main.js 的注释
    var imports = [
        'rd.controls.Icon'
    ];
    var extraModules = [ ];
    var controllerDefination = ['$scope', main];
    function main(scope) {
      scope.imgeCode ='data:image/png;base64,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'
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