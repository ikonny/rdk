(function() {
    // 这些变量和函数的说明，请参考 rdk/app/example/web/scripts/main.js 的注释
    var imports = [
        'rd.services.MenuService', 'css!base/css/main'
    ];
    var extraModules = [ ];
    var controllerDefination = ['$scope', 'MenuService', main];
    function main(scope, MenuService) {
        var moduleID;
        var menuConfig = [
            {label: 'menu item 1', event: 'menu_item_1'},
            {label: 'menu item 2', event: 'menu_item_2'},
            {label: 'memu item 3', list: [
                {label: 'submenu item 1', event: 'sub_menu_item_1'},
                {label: 'submenu item 2', event: 'sub_menu_item_2'}
            ]},
            {label: 'memu item 4', list: [
                {label: 'submenu item 3', event: 'sub_menu_item_3'},
                {label: 'submenu item 4', event: 'sub_menu_item_4'}
            ]}
        ];

        scope.load = function(event){
            moduleID = MenuService.addMenu(menuConfig, 'mouse');
        }

        scope.close = function () {
            MenuService.destroyMenu(moduleID);
        }
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