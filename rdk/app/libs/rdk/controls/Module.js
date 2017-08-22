define(['rd.core'], function() {
    var moduleApp = angular.module("rd.controls.Module", ['rd.core']);
    moduleApp.directive('rdkModule', ['EventService', 'EventTypes', 'Utils', '$compile', '$controller', '$http', '$timeout',
        function(EventService, EventTypes, Utils, $compile, $controller, $http, $timeout) {
            var scopeDefine={
                id: '@?',
                url: '@?',
                controller: '@?',
                loadOnReady: '@?',
                initData: '=?',
                loadTimeout: '@?',

                initialized: '&?',
                loading: '&?',
                ready: '&?',
                destroy: '&?',
            };
            return {
                restrict: 'E',
                scope: scopeDefine,
                replace: true,
                template: '<div></div>',
                controller: ['$scope', 'EventService', 'EventTypes', function(scope, EventService, EventTypes) {
                    Utils.publish(scope, this);

                    this.loadModule = function(initData, url, controller, timeout) {
                        url = url ? url : scope.url;
                        controller = controller ? controller : scope.controller;
                        initData = initData ? initData : scope.initData;
                        timeout = timeout ? initData : scope.timeout;
                        scope.loadModule(url, controller, initData, timeout);
                    }

                    this.destroyModule = function() {
                        scope.destroyModule();
                    }

                    this.child = null;

                    //延迟更新一些属性
                    var thisController = this;
                    scope.$on('update_controller', function(event, data) {
                        if (event.targetScope !== scope) {
                            return;
                        }
                        thisController[data.key] = data.value;
                    });

                    //当前模块已经被销毁了
                    scope.$on('$destroy', function() {
                        //清理掉自己寄存在上下文中的数据
                        if (rdk[scope.id]) {
                            delete rdk[scope.id];
                        }
                        //自己被销毁了，尝试销毁自己的子级
                        scope.destroyModule();
                    });
                }],
                link: function(scope, element, attrs) {
                    Utils.checkEventHandlers(attrs,scopeDefine);
                    scope.url = Utils.getValue(scope.url, attrs.url, '');
                    scope.controller = Utils.getValue(scope.controller, attrs.controller, '');
                    scope.loadOnReady = Utils.isTrue(attrs.loadOnReady, true);
                    scope.loadTimeout = Utils.getValue(scope.loadTimeout, attrs.loadTimeout, 10000);
                    
                    scope.loadContext = undefined;
                    scope.loadModule = _load;
                    scope.destroyModule = _destroy;

                    var moduleScope;
                    var appScope = Utils.findAppScope(scope);

                    if (scope.loadOnReady && scope.url) {
                        _load(scope.url, scope.controller, scope.initData, scope.loadTimeout);
                    }

                    //发送就绪事件
                    if (scope.id) {
                        EventService.raiseControlEvent(scope, EventTypes.INITIALIZED, scope.id);
                    }

                    function _load(url, controller, initData, timeout) {
                        if (scope.loadContext !== undefined) {
                            console.warn('module has been loaded or been loading!');
                            return;
                        }

                        if (!url) {
                            console.warn('invalid module url')
                            return;
                        }

                        EventService.raiseControlEvent(scope, EventTypes.LOADING, scope.id);

                        scope.loadContext = {controller: controller, initData: initData};

                        var reg = /<([a-z]+)(\s*\w*?\s*=\s*".+?")*(\s*?>[\s\S]*?(<\/\1>)+|\s*\/>)/i;
                        if (reg.test(url)) {
                            //是一个html片段
                            _compileModule(url);
                        } else {
                            //是一个url，需要下载
                            url = url.replace(/(.+)(\.html)\s*$/i, function(found, fileName, extName) {
                                return application.version == '0.0.0' ? found : fileName + '-' + application.version + extName;
                            });
                            $http.get(url, {timeout: timeout}).success(_compileModule).error(_loadError)
                        }
                    }

                    function _compileModule(htmlSource) {
                        var html = $(htmlSource);
                        if (html.length == 0) {
                            console.error('模块HTML片段无效\n%s', htmlSource);
                            return;
                        }
                        if (html.length > 2 || html.attr('id')) {
                            //修复多根节点HTML片段
                            html = $('<div></div>').append(html);
                        }
                        var loadContext = scope.loadContext;
                        scope.loadContext = null;

                        var id = Utils.createUniqueId('module_');
                        html.attr('id', id);
                        element.append(html);

                        var ctrl = loadContext.controller;
                        var initData = loadContext.initData;
                        ctrl = ctrl ? ctrl : html.attr('controller');
                        ctrl = ctrl ? ctrl : '___DefaultModuleController___';
                        
                        moduleScope = appScope.$new();
                        moduleScope.$moduleId = scope.id ? scope.id : id;
                        //实例化一个控制器
                        if (angular.isObject(initData)) {
                            Utils.shallowCopy(initData, moduleScope);
                        } else {
                            moduleScope.initData = initData;
                        }

                        var moduleController =  $controller(ctrl, {$scope: moduleScope});
                        scope.$broadcast('update_controller', {key: 'child', value: moduleController});

                        $compile($('#' + id))(moduleScope);

                        $timeout(function() {
                            EventService.raiseControlEvent(scope, EventTypes.READY, scope.id);
                        }, 0);
                    }

                    function _loadError(data, status, headers, config) {
                        console.error('load module error(status: ' + status + '), url=' + config.url);
                    }

                    function _destroy() {
                        if (scope.loadContext === undefined) {
                            return;
                        }
                        scope.loadContext = undefined;

                        //destroy a module
                        element.empty();

                        moduleScope.$destroy();
                        moduleScope = undefined;

                        EventService.raiseControlEvent(scope, EventTypes.DESTROY, scope.id);
                    }
                }
            }
        }
    ]);

    moduleApp.controller('___DefaultModuleController___', function() {
        console.log('using default module controller...')
    });
});
