var recomApp = angular.module('app.recomsys', ['ngCookies','pdfjsViewer','file-model', 'ngResource', 'ngRoute', "ngTable", 'ngFileSaver', 'ngMessages', 'ngSanitize', 'selectize', '720kb.datepicker', 'ui.bootstrap', 'chart.js', 'ngAlertify', 'angular-thumbnails', 'app.recomsys.sub']);
recomApp.config(
        function ($compileProvider)
        {
            $compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|ftp|mailto|blob|chrome-extension):/);

            // Angular before v1.2 uses $compileProvider.urlSanitizationWhitelist(...)
        }
);
//This starts the application and event listeners are injected in it
recomApp.run(function ($rootScope, $route, $location, $cookieStore, $templateCache) {

    // Registers listener to watch route changes
    $rootScope.$on("$locationChangeStart", function () {

        //On refreshing page, keeps username of logged in user
        if ($cookieStore.get("recomApp")) {
            $rootScope.$broadcast('showUserName', {
                show: true
            });
        }
        else
        {
            $rootScope.$broadcast('showUserName', {
                show: false
            });
        }

        var restrictedPage = $.inArray($location.path(), ['/home', '/login', '/signup']) === -1;

        if (restrictedPage && (!$cookieStore.get("recomApp")))
        {
            $location.path('/home');
        }
    });
});
//Define Routing for application,contollers associated to html forms and active tabs in navigation bar. This is application configuration
recomApp.config(['$routeProvider', '$locationProvider',
    function ($routeProvider, $locationProvider) {
        $routeProvider.
                when('/#', {
                    templateUrl: 'templates/base.html',
                    activetab: 'Home'
                })
                .when('/home', {
                    templateUrl: 'templates/base.html',
                    activetab: 'Home'
                })
                .when('/login', {
                    templateUrl: 'templates/login.html',
                    activetab: 'Home'
                })
                .when('/signup', {
                    templateUrl: 'templates/signup.html',
                    activetab: 'Home'
                })
                .when('/home/dashboard', {
                    templateUrl: 'templates/dashboard.html',
                    activetab: 'Home'
                })
                .when('/searchColleges', {
                    templateUrl: 'templates/searchColleges.html',
                    activetab: 'Home'
                })
                .when('/searchCollegeResults', {
                    templateUrl: 'templates/searchCollegeResults.html',
                    activetab: 'Home'
                })
                .when('/addStream', {
                    templateUrl: 'templates/addCourse.html',
                    activetab: 'Home'
                })
                .when('/manageCourses', {
                    templateUrl: 'templates/manageCourses.html',
                    activetab: 'Home'
                })
                .when('/viewApplications', {
                    templateUrl: 'templates/viewApplications.html',
                    activetab: 'Home'
                })
                .when('/manageDocuments', {
                    templateUrl: 'templates/manageDocuments.html',
                    activetab: 'Home'
                })
                .when('/manageProfile', {
                    templateUrl: 'templates/manageProfile.html',
                    activetab: 'Home'
                })
                .when('/changePassword', {
                    templateUrl: 'templates/changePassword.html',
                    activetab: 'Home'
                })
                .when('/applyToCollege', {
                    templateUrl: 'templates/applyToCollege.html',
                    activetab: 'Home'
                })
                .when('/reviewApplication', {
                    templateUrl: 'templates/reviewApplication.html',
                    activetab: 'Home'
                })
                .otherwise({
                    redirectTo: '/home'
                });
    }]);



recomApp.controller('NavController', function ($scope, $location, $window, $cookieStore, $http) {

    $scope.states = {};
    $scope.states.activeMenuItem = 'home';
    $scope.menuItems = [{
            id: 'menuItem1',
            title: 'Home',
            template: '#/home',
            show: true
//            color:'#000'
        },
//        {
//            id: 'menuItem2',
//            title: 'Login',
//            template: '#/login',
////             color:'#000',
//            show: true
//        }, 
        {
            id: 'menuItem2',
            title: 'Signup',
            template: '#/signup',
            show: true
        },
        {
            id: 'menuItem3',
            title: 'Contact Us',
            template: '#/contactUs',
            show: true
        }
    ];
    $scope.$on('showUserName', function (event, args) {
        if (args.show) {
            $scope.user = args;
            $scope.menuItems[1].show = false;
            $scope.menuItems[0].show = false;
            $scope.menuItems[2].show = false;
        }
    });

}
);


