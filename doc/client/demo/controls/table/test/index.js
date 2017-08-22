/*
===============================
    这些代码不重要，可无视
===============================
*/
(function() {
    var imports = [
        'base/demo',
        'rd.controls.Module'
    ];
    var extraModules = [ ];
    var controllerDefination = ['$scope', 'DataSourceService', main];
    function main(scope, DataSourceService) {
        imports.helper.initDataSourceService(DataSourceService);

        scope.load = function() {
            rdk.m.loadModule({}, 'demo.html');
        }

        scope.setTitle = function() {
            var dom = $("div[doc_title]");
            var demoUrl = location.pathname.match(/\/doc\/client\/demo\/(.*)\//)[1];
            document.title = dom.length == 0 ? demoUrl : $(dom[0]).attr('doc_title');
        }
    };

    require.config({paths:{helper: '/doc/tools/doc_js/doc_app_helper'}});
    imports.push({ url: 'blockUI', alias: 'blockUI' });
    imports.push({ url: 'helper', alias: 'helper' });
    define(/*fix-from*/application.import(imports)/*fix-to*/, start);
    function start() {
        application.initImports(imports, arguments);
        rdk.$injectDependency(application.getComponents(extraModules, imports));
        rdk.$ngModule.controller('RootController', controllerDefination);
        rdk.$ngModule.config(['blockUIConfig', function(blockUIConfig) {
            blockUIConfig.template = '<div class="block-ui-message-container">'
                + application.loadingImage + '</div>';
        }]);
    };
})();