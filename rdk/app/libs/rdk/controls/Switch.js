/**
 * Created by 00100630 on 2016/12/23.
 */
define(['angular', 'jquery', 'rd.core',
  'css!rd.styles.FontAwesome', 'css!rd.styles.Bootstrap', 'css!rd.styles.Switch'], function() {
  var nInputApp = angular.module("rd.controls.Switch", ['rd.core']);
  nInputApp.directive('rdkSwitch', ['EventService', 'EventTypes','Utils', '$timeout','$compile', '$controller',
    function(EventService, EventTypes, Utils) {
      var scopeDefine = {
          checked: '=',
          onLabel: '@?',
          offLabel: '@?',
          enabled: '=?',
          change: '&?'
      };
      return {
        restrict: 'E',
        scope: scopeDefine,
        controller: ['$scope', function(scope){
          Utils.publish(scope, this);
          console.log(scope.onLabel)
          /* 组件对外开放函数 */
        }],
        template: function() {
          return '<div class="switcher"> \
            <div ng-class="{true:\'switch-on\', false:\'switch-off\'}[checked]" ng-click="enabled ? checked=!checked : null">\
              <input type="checkbox" checked={{checked}}>\
              <span class="switch-left" ng-show="checked">{{onLabel}}</span>\
              <button ng-disabled="!enabled" >&nbsp;</button>\
              <span class="switch-right" ng-show="!checked">{{offLabel}}</span>\
            </div>\
          </div>';
        },
        compile: function(tEle, tAttrs) {
          return {
            post: _link
          }
        }
      }

      function _link(scope, element, attrs) {
        Utils.checkEventHandlers(attrs,scopeDefine);
        scope.onLabel = Utils.getValue(scope.onLabel, attrs.onLabel, 'on');
        scope.offLabel = Utils.getValue(scope.offLabel, attrs.offLabel, 'off');
        scope.checked = Utils.isTrue(scope.checked, false);
        //scope.enabled = Utils.isTrue(scope.checked, true);
        scope.enabled = Utils.getValue(scope.enabled, attrs.enabled ,true);
        console.info(scope.enabled)
        scope.$watch('checked', function(val, old){
          if (val !== old) {
            EventService.raiseControlEvent(scope, EventTypes.CHANGE, val);
          }
        })
      }
    }
  ]);
});