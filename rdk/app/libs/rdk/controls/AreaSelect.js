define(['angular', 'rd.core', 'css!rd.styles.Bootstrap','css!rd.styles.FontAwesome','css!rd.styles.Area'], function () {
    var areaModule = angular.module('rd.controls.AreaSelect', ['rd.core']);
    areaModule.run(["$templateCache", function($templateCache) {
        $templateCache.put("province.html",
            '<div>\
                <div class="rdk-area-contain">\
                    <ul class="nav nav-tabs">\
                        <li ng-class="{active: $vm.activeTab == 1}"><a ng-click="$vm.activeTab = 1">{{$vm.userArr[0].name || provinceLabel || $vm.i18n.province}}</a></li>\
                    </ul>\
                    <div class="rdk-area-content">\
                        <div class="rdk-area-panel" ng-show="$vm.activeTab == 1">\
                            <ul ng-style="$vm.getWidth()">\
                                <li ng-repeat="province in $vm.dsProvinces.data.data track by $index" on-finish-render="provinceRender" ng-click="$vm.changeSelected(province,0)">\
                                    <span ng-if="multipleSelect" class="rdk-area-checkbox" >\
                                    <i ng-show="$vm.activeCurItemClass(province,0)" class="fa fa-check icon-selected"></i>\
                                    </span>\
                                    <a ng-if="!$vm.isNull(province)" ng-class="{selected:$vm.activeCurItemClass(province,0) && !multipleSelect}">{{province.name}}</a>\
                                    <a ng-if="$vm.isNull(province)" class="area-null">{{province.name}}</a>\
                                </li>\
                            </ul>\
                        </div>\
                    </div>\
                </div>\
            </div>'
        );
        $templateCache.put("city.html",
            '<div>\
                <div class="rdk-area-contain">\
                    <ul class="nav nav-tabs">\
                        <li ng-if="!freezeProvince" ng-class="{active: $vm.activeTab == 1}"><a ng-click="$vm.activeTab = 1">{{$vm.userArr[0].name || provinceLabel || $vm.i18n.province}}</a></li>\
                        <li ng-show="!!$vm.dsCitys.data.data.length" ng-class="{active: $vm.activeTab == 2}"><a ng-click="$vm.activeTab = 2">{{$vm.userArr[1].name || cityLabel || $vm.i18n.city}}</a></li>\
                    </ul>\
                    <div class="rdk-area-content">\
                        <div class="rdk-area-panel" ng-show="$vm.activeTab == 1" ng-if="!freezeProvince">\
                            <ul ng-style="$vm.getWidth()">\
                                <li ng-repeat="province in $vm.dsProvinces.data.data track by $index" on-finish-render="provinceRender">\
                                    <a ng-if="!$vm.isNull(province)" ng-click="$vm.clkProvinceNextLvOpen(province,0)" ng-class="{selected:$vm.activeCurItemClass(province,0)}">{{province.name}}</a>\
                                    <a ng-if="$vm.isNull(province)" class="area-null">{{province.name}}</a>\
                                </li>\
                            </ul>\
                        </div>\
                        <div class="rdk-area-panel" ng-show="$vm.activeTab == 2">\
                            <ul>\
                                <li ng-if="showAll" ng-click="$vm.selectAllProOrCity(\'全省\',\'lockCity\')" class="all-label"><a>{{$vm.i18n.allProv}}</a></li>\
                                <li ng-repeat="city in $vm.dsCitys.data.data" ng-click="$vm.changeSelected(city,1)">\
                                    <span ng-if="multipleSelect" class="rdk-area-checkbox" >\
                                    <i ng-show="$vm.activeCurItemClass(city,1)" class="fa fa-check icon-selected"></i>\
                                    </span>\
                                    <a ng-class="{selected:$vm.activeCurItemClass(city,1) && !multipleSelect}">{{city.name}}</a>\
                                </li>\
                            </ul>\
                        </div>\
                    </div>\
                </div>\
            </div>'
        );
        $templateCache.put("common.html",
            '<div>\
                <div class="rdk-area-contain">\
                    <ul class="nav nav-tabs">\
                        <li ng-class="{active: $vm.activeTab == 1}"><a ng-click="$vm.activeTab = 1">{{$vm.userArr[0].name || provinceLabel || $vm.i18n.province}}</a></li>\
                        <li ng-show="!!$vm.dsCitys.data.data.length" ng-class="{active: $vm.activeTab == 2}"><a ng-click="$vm.activeTab = 2">{{$vm.userArr[1].name || cityLabel || $vm.i18n.city}}</a></li>\
                        <li ng-show="!!$vm.dsAreas.data.data.length" ng-class="{active: $vm.activeTab == 3}"><a ng-click="$vm.activeTab = 3">{{$vm.userArr[2].name || areaLabel || $vm.i18n.area}}</a></li>\
                    </ul>\
                    <div class="rdk-area-content">\
                        <div class="rdk-area-panel" ng-show="$vm.activeTab == 1">\
                            <ul ng-style="$vm.getWidth()">\
                                <li ng-repeat="province in $vm.dsProvinces.data.data track by $index" on-finish-render="provinceRender">\
                                    <a ng-if="!$vm.isNull(province)" ng-click="$vm.clkProvinceNextLvOpen(province,0)" ng-class="{selected:$vm.activeCurItemClass(province,0)}">{{province.name}}</a>\
                                    <a ng-if="$vm.isNull(province)" class="area-null">{{province.name}}</a>\
                                </li>\
                            </ul>\
                        </div>\
                        <div class="rdk-area-panel" ng-show="$vm.activeTab == 2">\
                            <ul>\
                                <li ng-if="showAll || showAllProvince" ng-click="$vm.selectAllProOrCity(\'全省\')" class="all-label"><a>{{$vm.i18n.allProv}}</a></li>\
                                <li ng-repeat="city in $vm.dsCitys.data.data">\
                                    <a ng-click="$vm.clkCityNextLvOpen(city,1)" ng-class="{selected:$vm.activeCurItemClass(city,1)}">{{city.name}}</a>\
                                </li>\
                            </ul>\
                        </div>\
                        <div class="rdk-area-panel" ng-show="$vm.activeTab == 3">\
                            <ul>\
                                <li ng-if="showAll || showAllCity" ng-click="$vm.selectAllProOrCity(\'全市\')" class="all-label"><a>{{$vm.i18n.allCity}}</a></li>\
                                <li ng-repeat="area in $vm.dsAreas.data.data" ng-click="$vm.changeSelected(area,2)">\
                                    <span ng-if="multipleSelect" class="rdk-area-checkbox" >\
                                    <i ng-show="$vm.activeCurItemClass(area,2)" class="fa fa-check icon-selected"></i>\
                                    </span>\
                                    <a ng-class="{selected:$vm.activeCurItemClass(area,2) && !multipleSelect}">{{area.name}}</a>\
                                </li>\
                            </ul>\
                        </div>\
                    </div>\
               </div>\
           </div>'
        )
    }]);
    areaModule.directive('rdkAreaSelect', ['DataSourceService','EventService', 'Utils','EventTypes', function (DataSourceService,EventService,Utils,EventTypes) {
        var templates = {
            "province":"province.html",
            "city":"city.html"
        };
        var scopeDefine={
            id: '@?',
            areaData:'=?',
            change:'&?',
            provinceLabel:'@?',
            cityLabel:'@?',
            areaLabel:'@?',
            freezeProvince:"=?",
            showAll:"=?",
            showAllProvince:"=?",
            showAllCity:"=?",
            multipleSelect: '=?',
            multipleArea: '=?',
            delimiter: '@?',
            defaultSelected:"@?"
        };
        return {
            restrict: 'E',
            templateUrl: function(elem, attr){
                if(attr.granularity){
                    return templates[attr.granularity];
                }else{
                    return "common.html"
                }
            },
            replace: true,
            scope: scopeDefine,
            require:'^?rdkComboSelect',
            controller: ['$scope', function(scope){
                Utils.publish(scope, this);
                //外部可设置地区数据事件
                this.updateAreaData = function(data){
                    if(data==null)
                    {
                        return
                    }
                    scope.updateAreaData(data);
                }
            }],
            link:_link
        };

        function _link(scope,tElement,tAttrs,comboSelectCtrl) {
            Utils.checkEventHandlers(tAttrs,scopeDefine);
            var i18n = Utils.getLocale(scope);

            var $vm = scope.$vm = {
                resultData:"", //返回结果，字符串
                userArr:[], //数组:保存用户选择的省市区对象
                activeTab:1 //默认激活选项卡:省
            };
            var _hasOver=true; //选择是否结束标志
            var _hasDefaultReady = false; //读取默认地区数据是否完成
            var allProvinceTip=''; //提示"全省"
            var _areaNull = {name:'- -'};//空对象，当数据少于_areaCount时用于填充数据。
            var _areaCount = 6;
            var _provincesInNull=false; //省数据数组里是否存在空对象
            var _delimiter = Utils.getValue(scope.delimiter, tAttrs.delimiter, ' | ');//数据分割符
            var _multDelimiter="; "; //复选场景数据分割符

            //默认在选择项里显示：全省，全市标签
            scope.showAll=  Utils.isTrue(scope.showAll, true);
            scope.showAllProvince=  Utils.isTrue(scope.showAllProvince, false);
            scope.showAllCity=  Utils.isTrue(scope.showAllCity, false);
            scope.freezeProvince = Utils.isTrue(scope.freezeProvince, true);
            scope.multipleSelect = Utils.isTrue(scope.multipleSelect,tAttrs.multipleSelect, false);
            scope.multipleArea = Utils.isTrue(scope.multipleArea,tAttrs.multipleArea, false);

            _initializeI18n();
            _init();

            $vm.changeSelected = function(item,index){ //选择地区项，结束当前地区选择
                allProvinceTip='';
                if(!scope.multipleSelect){
                    !!item?$vm.userArr[index]=item:[];
                }
                else
                {
                    var containerIndex;
                    if(!$vm.userArr[index]){
                        $vm.userArr[index]=[];
                    }
                    containerIndex = Utils.contains($vm.userArr[index],item);
                    if(containerIndex==-1){
                        $vm.userArr[index].push(item);
                    }else{
                        $vm.userArr[index].splice(containerIndex,1);
                    }
                }
                _closeRdkArea();
            };
            $vm.selectAllProOrCity = function(allName,lock){ //选择全省或全市，结束当前地区选择
                if(allName=="全省"){
                    $vm.userArr.splice(1,2); //删除市区
                    if(lock=="lockCity" && scope.freezeProvince){
                        $vm.activeTab=2;
                        allProvinceTip=allName;
                    }else{
                        $vm.activeTab=1;
                        !!$vm.dsCitys?$vm.dsCitys.data.data=[]:null;
                        !!$vm.dsAreas?$vm.dsAreas.data.data=[]:null;
                    }
                }else if(allName=="全市"){
                    $vm.userArr.splice(2,1); //删除区
                    $vm.activeTab=2;
                    !!$vm.dsAreas?$vm.dsAreas.data.data=[]:null;
                }
                if(scope.multipleSelect){
                    !!comboSelectCtrl && comboSelectCtrl.changeOpenStatus();
                }
                _closeRdkArea();
            };

            //展开下一级 province-->city
            $vm.clkProvinceNextLvOpen=function(province,index){
                !!comboSelectCtrl && comboSelectCtrl.lockCloseShow();
                _queryCityByProvince(province);
                if(!scope.multipleArea && $vm.userArr[index] && !angular.equals($vm.userArr[index],province))
                {
                    $vm.userArr.splice(1,2); //删除市区
                    !!$vm.dsAreas?$vm.dsAreas.data.data=[]:null;
                }
                $vm.userArr[index]=province;
                $vm.activeTab=2;
                _hasOver=false;
            };
            //展开下一级 city-->area
            $vm.clkCityNextLvOpen=function(city,index){
                !!comboSelectCtrl && comboSelectCtrl.lockCloseShow();
                _queryAreaByCity(city);
                if(!scope.multipleArea && $vm.userArr[index] && !angular.equals($vm.userArr[index],city))
                {
                    $vm.userArr.splice(2,1); //删除区
                }
                $vm.userArr[index]=city;
                $vm.activeTab=3;
                _hasOver=false;
            };
            //激活已选择项的样式
            $vm.activeCurItemClass = function (item,index){
                if($vm.userArr.length && $vm.userArr[index]){
                    if(!angular.isArray($vm.userArr[index])){
                        return angular.equals($vm.userArr[index],item);
                    }else if(angular.isArray($vm.userArr[index])){
                        return Utils.contains($vm.userArr[index],item)!=-1;
                    }
                }
                else{
                    return false;
                }
            };
            $vm.isNull=function(province)
            {
                return province && angular.equals(province,_areaNull);
            };
            $vm.getWidth=function()
            {
                if(!_provincesInNull)
                {
                    return
                }
                return{
                    width:255+'px'
                }
            };
            //关闭选择框,返回选择结果信息
            function _closeRdkArea(){
                if(!scope.multipleSelect){
                    !!comboSelectCtrl && comboSelectCtrl.changeOpenStatus();
                }
                _hasOver=true;
                areaDataHandle();
            }
            //初始化获取所需数据源
            function _init(){
                if(!!tAttrs.dsProvince){
                    $vm.dsProvinces = DataSourceService.get(tAttrs.dsProvince);
                    if (!$vm.dsProvinces) {
                        throw 'rdk-area-select require ds_province attribute!';
                    }
                    EventService.register($vm.dsProvinces.id, EventTypes.RESULT, _provincesResultHandler);
                    $vm.dsProvinces.query();
                }
                if(!!tAttrs.dsCity){
                    $vm.dsCitys = DataSourceService.get(tAttrs.dsCity);
                    if (!$vm.dsCitys) {
                        throw 'rdk-area-select require ds_city attribute!';
                    }
                    EventService.register($vm.dsCitys.id, EventTypes.RESULT, _citysResultHandler);
                }
                if(!!tAttrs.dsArea){
                    $vm.dsAreas = DataSourceService.get(tAttrs.dsArea);
                    if (!$vm.dsAreas) {
                        throw 'rdk-area-select require ds_area attribute!';
                    }
                    EventService.register($vm.dsAreas.id, EventTypes.RESULT, _areasResultHandler);
                }
            }
            scope.updateAreaData=function(data){
                _hasDefaultReady=false;
                scope.areaData=data;
                _initDefaultAreaData();
            };
            function _initDefaultAreaData(){  //初始化地区默认数据
                if(tAttrs.defaultSelected=="the-one" && Utils.isEmptyObject(scope.areaData)){
                    _setDefaultAreaDataByDs(); //以数据源第一个记录为默认数据
                }
                _setDefaultAreaDataByUser(); //以用户随意设置的地区为默认数据
            }

            function _setDefaultAreaDataByDs(){
                var defaultProvince;
                if($vm.dsProvinces.data){
                    defaultProvince = $vm.dsProvinces.data.data[0];
                    $vm.userArr[0]=defaultProvince;
                    if(tAttrs.granularity=="province"){
                        areaDataHandle();
                        $vm.activeTab=1;
                    }
                    else if(tAttrs.granularity=="city")
                    {
                        defaultProvince.freezeProvince=scope.freezeProvince;
                        _queryCityByProvince(defaultProvince);
                        $vm.activeTab=2;
                    }else{
                        _queryCityByProvince(defaultProvince);
                        $vm.activeTab=3;
                    }
                }
            }
            function _setDefaultAreaDataByUser(){
                var defaultProvince;
                if($vm.dsProvinces.data && scope.areaData.province){
                    defaultProvince = _queryDataByName($vm.dsProvinces.data.data,scope.areaData.province);
                    $vm.userArr[0]=defaultProvince;
                    if(tAttrs.granularity=="province"){
                        areaDataHandle();
                        $vm.activeTab=1;
                    }else if(!scope.areaData.city){
                        if(tAttrs.granularity=="city"){
                            allProvinceTip=$vm.i18n.allProv;
                            defaultProvince.freezeProvince=scope.freezeProvince;
                        }
                        areaDataHandle();
                        _queryCityByProvince(defaultProvince);
                        $vm.activeTab=2;
                    }
                    else if(tAttrs.granularity=="city")
                    {
                        defaultProvince.freezeProvince=scope.freezeProvince;
                        _queryCityByProvince(defaultProvince);
                        $vm.activeTab=2;
                    }else{
                        _queryCityByProvince(defaultProvince);
                        $vm.activeTab=3;
                    }
                }
            }
            function areaDataHandle(){  //处理选择结果，更新视图显示及返回数据结果
                if(!_hasOver){
                    return
                }
                $vm.resultData="";
                if(!scope.multipleSelect){
                    _simpleDataHandle();
                }else{
                    _multipleDataHandle()
                }
                !!comboSelectCtrl && comboSelectCtrl.setValue($vm.resultData+allProvinceTip);
                var appScope = Utils.findAppScope(scope);
                var returnObj = {
                    province:null,
                    city:null,
                    area:null
                };
                if(!scope.multipleArea){
                    returnObj.province=$vm.userArr[0];
                    returnObj.city=$vm.userArr[1];
                }else{
                    delete  returnObj.province;
                    delete  returnObj.city;
                }
                returnObj.area=$vm.userArr[2];
                appScope[tAttrs.areaData]=returnObj;
                _hasDefaultReady=true;
                EventService.raiseControlEvent(scope, EventTypes.CHANGE, returnObj);
                returnObj=null;
            }

            function _provincesResultHandler(){
                for(var i=_areaCount , len = $vm.dsProvinces.data.data.length ; i>len ; i--)
                {
                    $vm.dsProvinces.data.data.push(_areaNull);
                }
                if(i===len)
                {
                    _provincesInNull=true; //provinces数组里存在空数据
                }
                if(_hasDefaultReady || !scope.areaData){
                    return
                }
                _initDefaultAreaData();
            }
            function _citysResultHandler(){
                if(_hasDefaultReady  || !scope.areaData){
                    return
                }
                var defaultCity;
                if($vm.dsCitys.data && scope.areaData.city){
                    defaultCity = _queryDataByName($vm.dsCitys.data.data,scope.areaData.city);
                    $vm.userArr[1]=defaultCity;
                    if(tAttrs.granularity!="city"){
                        _queryAreaByCity(defaultCity);
                    }else{
                        areaDataHandle();
                    }
                }else if(tAttrs.defaultSelected=="the-one"  && Utils.isEmptyObject(scope.areaData)){
                    defaultCity = $vm.dsCitys.data.data[0];
                    $vm.userArr[1]=defaultCity;
                    if(tAttrs.granularity!="city"){
                        _queryAreaByCity(defaultCity);
                    }else{
                        areaDataHandle();
                    }
                }
            }
            function _areasResultHandler(){
                if(_hasDefaultReady || !scope.areaData){
                    return
                }
                var defaultArea;
                if($vm.dsAreas.data && scope.areaData.area) {
                    defaultArea = _queryDataByName($vm.dsAreas.data.data, scope.areaData.area);
                    $vm.userArr[2] = defaultArea;
                }
                else if(tAttrs.defaultSelected=="the-one"  && Utils.isEmptyObject(scope.areaData)){
                    defaultArea = $vm.dsAreas.data.data[0];
                    $vm.userArr[2] = defaultArea;
                }
                areaDataHandle();
            }
            function _queryDataByName(dataArr,initObj){
                var result;
                angular.forEach(dataArr,function(data){
                    if(data.name==initObj.name || data.name.indexOf(initObj.name) !=-1){
                        result=data;
                        return;
                    }
                });
                return result;
            }
            function _queryCityByProvince(province){
                var cityCondition = {
                    provinceId: province.ProID
                };
                !!$vm.dsCitys && $vm.dsCitys.query(cityCondition);
            }
            function _queryAreaByCity(city){
                var areaCondition = {
                    cityId: city.CityID
                };
                !!$vm.dsAreas && $vm.dsAreas.query(areaCondition);
            }
            function _simpleDataHandle(){
                angular.forEach($vm.userArr,function(item){
                    if(!item.freezeProvince){
                        $vm.resultData +=item.name+_delimiter;
                    }else{
                        !!comboSelectCtrl && comboSelectCtrl.setCaption(item.name);
                    }
                });
                $vm.resultData = $vm.resultData.substring(0,$vm.resultData.length-_delimiter.length);
            }
            function _multipleDataHandle(){
                angular.forEach($vm.userArr,function(item){
                    if(!item.freezeProvince && !angular.isArray(item)){
                        $vm.resultData +=item.name+_delimiter;
                    }
                    else if(angular.isArray(item)){
                        angular.forEach(item,function(childItem){
                            $vm.resultData += childItem.name + _multDelimiter
                        })
                    }
                    else{
                        !!comboSelectCtrl && comboSelectCtrl.setCaption(item.name);
                    }
                });
                $vm.resultData = $vm.resultData.substring(0,$vm.resultData.length - _multDelimiter.length);
            }

            function _initializeI18n() {
                i18n = i18n.toLowerCase();
                if (i18n == 'zh_cn' || i18n == 'zh-cn') {
                    $vm.i18n = {
                        'province': '省',
                        'city': '市',
                        'area': '区',
                        'allProv':'全部',
                        'allCity':'全部'
                    }
                } else {
                    $vm.i18n = {
                        'province': 'Province',
                        'city': 'City',
                        'area': 'Area',
                        'allProv':'All',
                        'allCity':'All'
                    }
                }
            }
        }
    }])
})