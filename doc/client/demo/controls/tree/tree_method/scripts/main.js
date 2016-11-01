define('main', ['rd.controls.Tree'], function() {
    // 创建一个RDK的应用
    var app = angular.module("rdk_app", ['rd.controls.Tree']);
    // 创建一个控制器
    app.controller('myCtrl', ['$scope', 'DataSourceService' ,function($scope, DataSourceService) {
        $scope.treeData = [{
            node: [{
                key: "specialtopic",
                label: "专题",
                open: true,
                icon: "/rdk/app/libs/ztree/css/zTreeStyle/img/diy/8.png",
            }, {
                node: [],
                key: "specialtopic",
                label: "总览",
            }],
            key: "e2e",
            label: "端到端定界定位",
            open: true,
            icon: "/rdk/app/libs/ztree/css/zTreeStyle/img/diy/1_open.png",
        }, {
            node: [{
                key: "monitoring",
                label: "监控",
                open: true,
                icon: "/rdk/app/libs/ztree/css/zTreeStyle/img/diy/8.png",
            }, {
                node: [],
                key: "reasonconfig",
                label: "原因配置",
                icon: "/rdk/app/libs/ztree/css/zTreeStyle/img/diy/8.png",
            }],
            key: "realtimeMonitor",
            label: "实时监控",
            icon: "/rdk/app/libs/ztree/css/zTreeStyle/img/diy/1_open.png",
        }];

        $scope.clickFun=function(event,data){
            //这就是zTreeObj
            console.log(rdk.mytree)
            //这是调用的zTree的方法，可以得到所有的勾选的节点的信息。
            var nodes = rdk.mytree.tree.getCheckedNodes(true);
            console.log(nodes)
        }
    }]);
});