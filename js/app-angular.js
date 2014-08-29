(function(){

    angular.module('appGCBA', ['ui.router', 'ui.bootstrap'])
        .config(function($stateProvider, $urlRouterProvider){

        $urlRouterProvider.otherwise("/main");

        $stateProvider
            .state("main", { abtract: true, url:"/main", templateUrl:"main.html" })
                .state("main.tab1", { url: "/tab1", templateUrl: "tab1.html" })
                .state("main.tab2", { url: "/tab2", templateUrl: "tab2.html" });


        }).controller("initCtrl", function($rootScope, $scope, $state){

            $scope.go = function(route){
                $state.go(route);
            }

            $scope.active = function(route){
                return $state.is(route);
            }

            $scope.tabs = [
                { heading: "Tab 1", route:"main.tab1", active:false },
                { heading: "Tab 2", route:"main.tab2", active:false },
            ];

            $scope.$on("$stateChangeSuccess", function() {
                $scope.tabs.forEach(function(tab) {
                    tab.active = $scope.active(tab.route);
                });
            });

    });

})();