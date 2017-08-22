﻿define(['angular', 'jquery'], function() {
    var utilsModule = angular.module("rd.services.Utils", []);
    utilsModule.service('Utils', ['RDKConst', function(RDKConst) {
        var _this = this;

        var _ready = false;
        //优先检测属性回调事件是否正确
        this.checkEventHandlers=function(attrs,scopeDefine){
            if(attrs['supressWarning'] !== undefined){
                return;
            }
            for(var prop in scopeDefine) {
                if (!scopeDefine[prop]) {
                    continue;
                }
                if (!scopeDefine[prop].match(/&/)) {
                    continue;
                }
                if (!attrs[prop]) {
                    continue;
                }
                if (!attrs[prop].match(/\(.*\)/)) {
                    continue;
                }
                console.warn('事件属性 %s 的值 %s 不该有圆括号！关于此警告请查看 ' +
                    'http://rdk.zte.com.cn/doc/#client/common/supress_warning.md', prop, attrs[prop]);
            }
        };

        var _onReadyCallbackList = [];

        this.swipeOnReadyCallbacks = function() {
            _ready = true;
            angular.forEach(_onReadyCallbackList, function(callback, key) {
                callback.call(this);
            });
            _onReadyCallbackList.splice(0, _onReadyCallbackList.length);
            _onReadyCallbackList = undefined;
        };

        this.onReady = function(callback) {
            if (_ready) {
                callback();
            } else {
                _onReadyCallbackList.push(callback);
            }
        }
        this.camel2snake = function(string) {
            //将首字母大写的形式转为下划线分隔的形式
            var newStr = '';
            for (i = 0; i < string.length; i++) {
                var asc = string.charCodeAt(i);
                if (asc >= 0x41 && asc <= 0x5a) {
                    //A-Z转为对应的a-z
                    newStr += '_' + String.fromCharCode(asc + 32);
                } else {
                    newStr += string.charAt(i);
                }
            }
            return newStr;
        }

        this.snake2camel = function(string) {
            //将下划线分隔的形式转为首字母大写的形式
            var newStr = '';
            var changeFlag = false;
            for (i = 0; i < string.length; i++) {
                var ch = string.charAt(i);


                if (ch == '_' || ch == '-') {
                    changeFlag = true;
                    continue;
                }
                if (changeFlag) {
                    changeFlag = false;
                    var asc = string.charCodeAt(i);
                    if (asc >= 0x61 && asc <= 0x7a) {
                        //a-z转为对应的A-Z
                        newStr += String.fromCharCode(asc - 32);
                    } else {
                        newStr += ch;
                    }
                } else {
                    newStr += ch;
                }
            }
            return newStr;
        }

        function _findProp(scope, prop, defaultValue) {
            var fun;
            try {
                fun = scope.$eval(prop, scope);
            } catch (err) {
                return null;
            }
            if (angular.isUndefined(fun)) {
                return scope.$parent ? _findProp(scope.$parent, prop, defaultValue) : defaultValue;
            } else {
                return fun;
            }
        }

        this.findProperty = function(scope, prop, defaultValue) {
            if (!prop) {
                return defaultValue;
            }
            return _findProp(scope, prop.trim(), defaultValue);
        }

        this.findFunction = function(scope, funcName, defaultValue) {
            if (!funcName) {
                return defaultValue;
            }
            funcName = funcName.replace(/\(.*\)/g, '').trim();
            return _findProp(scope, funcName, defaultValue);
        }

        this.findAppScope = function(scope) {
            function _findScope(scope) {
                if (!scope.hasOwnProperty("_rdk_controllerName")) {
                    return _findScope(scope.$parent)
                } else {
                    return scope;
                }
            }
            return _findScope(scope);
        }

        this.likePromise = function(object) {
            return object && typeof(object.then) === 'function';
        }

        var _uniqueIdIndex = 0;
        var _defaultPrefix = '__unique_id__';

        this.createUniqueId = function(prefix) {
            _uniqueIdIndex++;
            if (angular.isUndefined(prefix)) {
                prefix = _defaultPrefix;
            }
            return prefix + _uniqueIdIndex;
        };

        this.rebornUniqueId = function(element, prefix) {
            var rebornID = this.createUniqueId(prefix);
            element[0].querySelector("#" + _defaultPrefix).setAttribute("id", rebornID);
            return rebornID;
        };

        this.compile = function(scope, source) {
            if (angular.isUndefined(source)) {
                return source;
            }
            return source.replace(/{{(.+?)}}/g, function(matched, captured) {
                return scope.$eval(captured);
            });
        }

        this.isTrue = function(value, defaultValue) {
            if (defaultValue == undefined) {
                defaultValue = false;
            }
            if (value == null){
                return defaultValue;
            }
            return angular.isDefined(value) ? (((value == 'false') || (value === false)) ? false : true) : defaultValue;
        }

        this.getValue = function(scopeValue, attrValue, defaultValue) {
            return angular.isDefined(scopeValue) ? scopeValue : angular.isDefined(attrValue) ? attrValue : defaultValue;
        }
        this.isIE = function(){
            return !!window.ActiveXObject || "ActiveXObject" in window
        }
        this.safeApply = function(scope, fn) {
            var phase = scope.$root.$$phase;
            if (phase == '$apply' || phase == '$digest') {
                if (fn && (typeof(fn) === 'function')) {
                    fn();
                }
            } else {
                scope.$apply(fn);
            }
        };

        this.stringStartWith = function(str, prefix) {
            if (prefix == null || prefix == "" || str.length == 0 || prefix.length > str.length) {
                return false;
            }
            return str.substr(0, prefix.length) == prefix;
        }

        var CHARS = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'.split('');
        this.uuid = function() {
            var chars = CHARS,
                uuid = new Array(36),
                rnd = 0,
                r;
            for (var i = 0; i < 36; i++) {
                if (i == 8 || i == 13 || i == 18 || i == 23) {
                    uuid[i] = '-';
                } else if (i == 14) {
                    uuid[i] = '4';
                } else {
                    if (rnd <= 0x02) rnd = 0x2000000 + (Math.random() * 0x1000000) | 0;
                    r = rnd & 0xf;
                    rnd = rnd >> 4;
                    uuid[i] = chars[(i == 19) ? (r & 0x3) | 0x8 : r];
                }
            }
            return uuid.join('');
        }

        this.bindDataSource = function(tAttrs, toProp, fromProp, propError) {
            if (tAttrs[toProp]) {
                return;
            }
            if (!fromProp) {
                fromProp = 'ds';
            }
            if (tAttrs[fromProp]) {
                var expression = tAttrs[fromProp].replace(/(^|[}]{2})(.*?)([{]{2}|$)/g, '$1"$2"$3');
                var dataProp = '';
                angular.forEach(expression.split(/{{|}}/g), function(item) {
                    item = item.trim();
                    if (item == '""') {
                        return;
                    }
                    dataProp += '(' + item + ')+';
                });
                tAttrs[toProp] = 'this[' + dataProp.substring(0, dataProp.length - 1) + ']';
            } else {
                if (propError === false) return;
                console.error('至少需要提供 ds 或者 ' + toProp + ' 属性');
            }
        }

        this.publishScope = function(scope) {
            if (angular.isUndefined(scope.id)) {
                return;
            }

            if (angular.isDefined(rdk[scope.id]) && rdk[scope.id] !== scope) {
                console.warn('conflict dom node id: ' + scope.id);
            } else {
                rdk[scope.id] = scope;
            }
        }

        this.publish = function(scope, controller) {
            var id = scope.id;
            if (!id) {
                return;
            }

            if (angular.isDefined(rdk[id]) && rdk[id] !== controller) {
                console.warn('conflict dom node id: ' + id);
            } else {
                rdk[id] = controller;
            }

            scope.$on("$destroy", function() {
                delete rdk[id];
            });
        }

        this.shallowCopy = function(src, dest) {
            if (!dest) {
                dest = angular.isArray(src) ? [] : {};
            }
            angular.forEach(src, function(value, key) {
                dest[key] = value;
            });
            return dest;
        }
        this.isEmptyObject = function(obj) {
            if(!angular.isObject(obj)){
                console.error ("Utils isEmptyObject Method Parameter Error");
            }
            var prop;
            for (prop in obj){
                return false;
            }
            return true
        };
        this.contains = function(arr, object ,isHash) {
            if(typeof object ==="object" && angular.isArray(arr)){
                for(var i=0,len=arr.length ; i<len ; i++)
                {
                    //angular.equals 进行对象比较时把 "$"开头的属性给过滤掉了
                    if(!isHash && angular.equals(arr[i],object)){
                        return i
                    }
                    //ng-repeat track by 后 数组里每个对象元素不会再加了一个 $$hashKey 的属性 这个key由ng内部生成
                    //else if( isHash && arr[i].$$hashKey === object.$$hashKey){
                    else if( isHash && arr[i].$index === object.$index){ //$index是针对表格数据生成的行标识
                        return i
                    }
                }
                return -1;
            }else {
                return -1;
            }
        };
        //函数流的控制，函数被频繁调用的场景
        this.throttle = function(fn,interval){
            var _self = fn;
            var timer;
            var firstTime = true;
            return function (){
                var args = arguments;
                var _me = this;
                if(firstTime){
                    _self.apply(_me,args);
                    return firstTime = false;
                }
                if(timer){
                    return false;
                }
                timer = setTimeout(function(){
                    clearTimeout(timer);
                    timer = null;
                    _self.apply(_me,args);
                },interval || 200)
            }
        };
        //获取元素在页面中的偏移量
        this.getOffsetRect = function(element){
            var box=element.getBoundingClientRect();
            var body=document.body;
            var docElem=document.documentElement;
            var scrollTop=window.pageYOffset||docElem.scrollTop||body.scrollTop;
            var scrollLeft=window.pageXOffset||docElem.scrollLeft||body.scrollLeft;
            var clientTop=docElem.clientTop||body.clientTop;
            var clientLeft=docElem.clientLeft||body.clientLeft;
            var top=box.top+scrollTop-clientTop;
            var left=box.left+scrollLeft-clientLeft;
            return {
                //Math.round 兼容火狐浏览器bug
                top:Math.round(top),
                left:Math.round(left)
            }
        };
        //元素x方向进行边界检测
        this.offsetCheckX = function(element){
            var elemOffsetRect = this.getOffsetRect(element);
            return elemOffsetRect.left >= document.documentElement.clientWidth - element.offsetWidth
        };
        //获取被隐藏元素的物理尺寸
        this.getSize = function(element,targetEl) {
            var _addCss = { visibility: 'hidden' };
            var _oldCss = {};
            var _width;
            var _height;
            if (this.getStyle(element, "display") != "none") {
                return { width: !!targetEl ? targetEl.offsetWidth  : element.offsetWidth , height: !!targetEl ? targetEl.offsetHeight : element.offsetHeight };
            }
            for (var i in _addCss) {
                _oldCss[i] = this.getStyle(element, i);
            }
            this.setStyle(element, _addCss);
            var _isNgHide = element.classList.contains("ng-hide");
            _isNgHide && element.classList.remove("ng-hide");
            _width = !!targetEl ? targetEl.offsetWidth  : element.offsetWidth;
            _height =!!targetEl ? targetEl.offsetHeight : element.offsetHeight;
            this.setStyle(element, _oldCss);
            _isNgHide && element.classList.add("ng-hide");
            return { width: _width, height: _height };
        };
        this.isIEFlag = this.isIE();
        this.getStyle = function(element, styleName) {
            var result = element.style[styleName] ? element.style[styleName] : element.currentStyle ? element.currentStyle[styleName] : window.getComputedStyle(element, null)[styleName];
            // 注意IE坑：ie直接返回计算后的样式，计算后的样式IE盒子模型不是w3c标准模型还是有小数点误差
            //ie下有可能会返回 auto.......  返回offsetWidth..会有小数点误差
            if( (styleName =="width" || styleName =="height") && result =="auto"){
                var property="offset"+styleName[0].toUpperCase()+styleName.slice(1);
                return element[property]+"px";
            }
            return result
        };
        
        this.setStyle = function(element, obj){
            if (angular.isObject(obj)) {
                for (var property in obj) {
                    var cssNameArr = property.split("-");
                    for (var i = 1,len=cssNameArr.length; i < len; i++) {
                        cssNameArr[i] = cssNameArr[i].replace(cssNameArr[i].charAt(0), cssNameArr[i].charAt(0).toUpperCase());
                    }
                    var cssName = cssNameArr.join("");
                    element.style[cssName] = obj[property];
                }
            }
            else if (angular.isString(obj)) {
                element.style.cssText = obj;
            }
        };

        this.widthChangeAnimate = function(animateDom, widChangeDom){
            if(!animateDom || !widChangeDom){
                console.error ("WidthChangeAnimate Method Parameter Error");
            }
            //animateDom.parentNode.classList.add('clear-shake');
            var isIE = _this.isIE();
            if(isIE){
                animateDom.classList.add('width-change-animate-ie');
            }else{
                animateDom.classList.add('width-change-animate');
            }
            setTimeout(function(){
                if(animateDom.offsetWidth!=widChangeDom.offsetWidth){
                    animateDom.style.width = _this.getStyle(widChangeDom,"width");
                }
                setTimeout(function(){
                    animateDom.classList.remove('width-change-animate');
                   // animateDom.parentNode.classList.remove('clear-shake');
                    animateDom.classList.remove('width-change-animate-ie');
                },500);
            },0);
        };

        // 下面这几个函数提供了子级控件和父级控件之间的交互通道
        // 子级控件在自身数据有了变化之后，调用 callUpdater 通知父级
        // 通过控件的require属性无法做到任意父子级，因此通过这个方式实现

        this.childChange = function(scope, data) {
            var wrappedData = {
                ref: data
            };
            scope.$emit('child_change', wrappedData);
        }

        this.onChildChange = function(scope, handler) {
            var context = [handler];

            scope.$emit('init_child_change', scope);

            // 这里提及的 控件 和 子控件，都特指关注 child_change 的控件。
            // init_child_change事件一直往上冒，碰到最近一个控件就停下来
            // 每个控件都会把最近的子控件的scope保存在context中
            scope.$on('init_child_change', function(event, childScope) {
                if (event.targetScope == event.currentScope) {
                    //自己发的 init_child_change 事件，无视。
                    return;
                }

                context.push({
                    scope: childScope
                });
                event.stopPropagation();
            });

            scope.$on('child_change', function(event, wrappedData) {
                // child_change 事件发出时，需要把子控件中的数据
                // 更新到context中给 _callHandler 使用
                if (event.targetScope != event.currentScope) {
                    // 当 child_change 是自己发出的时，表示这是变化链的开始，
                    // context中没有任何子控件的数据
                    for (var i = 1; i < context.length; i++) {
                        if (context[i].scope == wrappedData.scope) {
                            break;
                        }
                    };
                    if (i >= context.length) {
                        console.warn('internal error, child scope not found!');
                        return;
                    }
                    context[i].data = wrappedData.ref;
                }

                //调用注册在当前控件上的child_change函数
                _callHandler(context, wrappedData);
                if (wrappedData.ref == RDKConst.STOP_PROPAGATIOIN) {
                    event.stopPropagation();
                }
                wrappedData.scope = scope;
            });

            function _callHandler(context, wrappedData) {
                var handler = context[0];
                if (!handler) {
                    return;
                }

                for (var idx = 0, len = context.length; idx < len; idx++) {
                    if (context[idx].data == wrappedData.ref) {
                        break;
                    }
                };
                try {
                    //处理后的数据更新到context上下文中
                    wrappedData.ref = handler(wrappedData.ref, context, idx >= len ? -1 : idx);
                } catch (e) {
                    console.warn('call handler error: ' + e);
                }
            }
        }

        this.getLocale = function(scope) {
            var lang = 'zh_cn';
            var appScope = this.findAppScope(scope);

            if ((appScope.i18n) && (appScope.i18n.$locale)) {
                lang = appScope.i18n.$locale;
            }
            lang = lang.toLowerCase();
            lang = lang.replace("-", "_");

            return lang;
        }

        this.getHtmlFraction = function(requestUrl){
            var domStr = '';
            $.ajax({
                type: "GET",
                async: false, 
                url: requestUrl, 
                cache: false,
                success: function(msg){
                    domStr = msg;
                }
            }); 
            return domStr;
        }

        this.getValueFromKey =function (obj, value){
            var propertyNames = Object.getOwnPropertyNames(obj);
            for (var i = 0; i < propertyNames.length; i++) {
                var property = propertyNames[i];
                if (obj[property] == value) break;
            }
            return propertyNames[i];
        }
    }]);

    utilsModule.service('RDKConst', [function() {
        //组件上下级交互时，停止传播的标志
        this.STOP_PROPAGATIOIN = '__stop_propagation_145812__'
    }]);

    utilsModule
        .directive('onFinishRender', ['$timeout',function($timeout) {
            return {
                restrict: 'A',
                link: function(scope, element, attr) {
                    if (scope.$last === true) {
                        $timeout(function() {
                            if(!attr.onFinishRender){ //事件默认为ngRepeatFinished
                                scope.$emit('ngRepeatFinished');
                            }else{
                                scope.$emit(attr.onFinishRender);
                            }
                        }, 0);
                    }
                    else if(attr.onFinishRender == "domRenderFinished"){
                        $timeout(function() {
                            scope.$emit(attr.onFinishRender);
                        }, 0);
                    }
                }
            }
        }])
        .directive('selectpicker', ['$timeout', 'EventService', 'EventTypes','Utils', function($timeout,EventService,EventTypes,Utils) {
            return {
                restrict: 'A',
                priority: 1000,
                scope:{
                    id:"@?"
                },
                controller: ['$scope', function(scope){
                    Utils.publish(scope, this);
                    //刷新selectpicker
                    this.refreshSelect = function(){
                        scope.refreshSelect();
                    }
                }],
                link: function(scope, elem, attrs) {
                    var MutationObserver = window.MutationObserver || window.WebKitMutationObserver || window.MozMutationObserver;
                    var selectpickerObserver;
                    scope.refreshSelect = _refreshSelectpicker;
                    if(!!MutationObserver)
                    {
                        selectpickerObserver=new MutationObserver(_refreshSelectpicker);
                        selectpickerObserver.observe(elem[0], {'childList': true});
                    }
                    $timeout(function(){
                        var size = attrs.selectpicker && parseInt(attrs.selectpicker) || 5;
                        $(elem).selectpicker({
                            style: 'btn',
                            size:size
                        });
                    }, 0);
                    scope.$on('$destroy', function() {
                        !!selectpickerObserver && selectpickerObserver.disconnect();
                        $(elem).selectpicker('destroy');
                    });
                    function _refreshSelectpicker(){
                        $timeout(function(){
                            $(elem).selectpicker('refresh');
                        },0)
                    }
                }
            };
        }])
});
