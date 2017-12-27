var recomSubApp = angular.module('app.recomsys.sub', ['app.recomsys']);

recomSubApp.controller('RightMenuController', function ($scope, $location, $window, $cookieStore, $http, CONSTANTS) {
    $scope.logout = function ()
    {
        $cookieStore.remove("recomApp");
        $location.path("/");
        $window.location.reload();
    };
});

recomSubApp.controller('DashboardController', function ($scope, $location, $window, $cookieStore, $http, CONSTANTS) {
    $scope.profileCompletionCount = [70, 30];
    $scope.profileCompletionKey = ["Complete", "Incomplete"];

    $scope.collegeMatchCount = [7, 3, 10, 20];
    $scope.collegeMatchKey = ["BSC", "BCS", "BA", "BBA"];
    $scope.options = {legend: {display: true, position: 'right'}
    };

});
recomSubApp.controller('SearchCollegeController', function ($scope, $location, $window, $cookieStore, $http, CONSTANTS) {
    $scope.colleges = [
        {
            name: "D.Y. Patil Pimpri",
            course: "B.S.C",
            rating: 2,
            seatsAvailable: 34,
            fees: "15000",
            address: "Pune"

        },
        {
            name: "Fergussion College Pune",
            rating: 4,
            seatsAvailable: 4,
            course: "B.S.C", 
            fees: "12000",
            address: "Pune"

        }, {
            name: "MES Abbasaheb Garware College Pune",
            course: "B.COM.",
            fees: "10000",
            rating: 3.5,
            seatsAvailable: 24,
            address: "Pune"

        },
        {
            name: "Sinhagad College Of Science Ambegaon",
            course: "B.S.C",
            rating: 3,
            seatsAvailable: 14,
            fees: "18000",
            address: "Pune"

        },
        {
            name: "Sinhagad College Of Science Ambegaon",
            course: "B.S.C",
            rating: 3,
            seatsAvailable: 14,
            fees: "18000",
            address: "Pune"

        },
        {
            name: "Modern College Of Arts And Science",
            course: "B.A.",
            rating: 4,
            seatsAvailable: 40,
            fees: "13000",
            address: "Pune"

        }
    ];
    $scope.search = function () {
        $location.path("/searchCollegeResults");
    };
    $scope.apply = function () {
        $location.path("/applyToCollege");
    };
});
recomSubApp.controller('LoginController', function ($scope, $location, $window, $cookieStore, $http, CONSTANTS) {

    $scope.login = function () {
        //This authenticates user
        $authdata = utilities.Base64.encode("aditya.tapaswi@midasblue.com" + ':' + "Adtya123");
        $http.defaults.headers.common.Authorization = 'Basic ' + $authdata;

        //This is http request for geeting user object with API and user object as parameters
//        $http.get(CONSTANTS.SERVICES.USERS).success(function ($user) {

        //This sets cookies for application
        $cookieStore.put("recomApp", $authdata);

        //This adds user object in userService
//                userService.addUser($user);

        $scope.$emit('showUserName', {
            show: true
        });
        //set cookie expiry (works when page is refreshed by user)
        var now = new $window.Date(), //get the current date
                // this will set the expiration to 1 hour
                exp = new $window.Date(now.getDate() + 1);

        $cookieStore.put("recomApp", $authdata, {
            expires: exp
        });

        $location.path("/home/dashboard");

//            $scope.closeModal();

//        }).error(function (error) {
//            if (error !== undefined) {
//                if (error.message === 'HTTP 500 Internal Server Error')
//                {
//                    $scope.errorMessage = 'Username or Password Invalid ';
//                    alertify.logPosition("top center");
//                    alertify.error($scope.errorMessage);
//
//                } else {
//                    $scope.errorMessage = error.error || error.message;
//                    alertify.logPosition("top center");
//                    alertify.error($scope.errorMessage);
//                }
//            }
////            $location.path("/login");
//        });
    };

});
recomApp.directive('loading', ['$http', function ($http)
    {
        return {
            restrict: 'A',
            link: function (scope, elm, attrs)
            {
                scope.isLoading = function () {
                    return $http.pendingRequests.length > 0;
                };
                scope.$watch(scope.isLoading, function (v)
                {
                    if (v) {
                        elm.show();
                    } else {
                        elm.hide();
                    }
                });
            }
        };
    }]);
recomApp.service('userService', ['$cookieStore', function ($cookieStore) {
        var user = $cookieStore.get("recomApp");
        var addUser = function (newObj) {
            user = newObj;
            //$cookies.put("futuremaker", $user);
        };
        var getUser = function () {
            //$user = $cookies.get("futuremaker",$user);
            return user;
        };
        return {
            addUser: addUser,
            getUser: getUser
        };
    }]);
recomApp.constant('CONSTANTS', (function () {
    // Define your variable
    var CONSTANTS = {};
    var SERVICES = {
//        BASE_PATH: 'http://ec2-54-169-136-45.ap-southeast-1.compute.amazonaws.com/api/fm/v0/'
        BASE_PATH: 'http://ec2-52-77-243-65.ap-southeast-1.compute.amazonaws.com/api/fm/v0/'
//        BASE_PATH: 'http://192.168.1.115:8080/api/fm/v0/'
                // 'http://localhost:8080/api/fm/v0/' //'http://ec2-52-74-20-101.ap-southeast-1.compute.amazonaws.com/api/fm/v0/' 
    };
    SERVICES.USERS = SERVICES.BASE_PATH + 'users';

    CONSTANTS.SERVICES = SERVICES;
    // Use the variable in your constants
    return CONSTANTS;
})());
(function () {
    'use strict';
    // attach utilities as a property of window
    var utilities = window.utilities || (window.utilities = {});
    // BEGIN API
    function helloWorld() {
        alert('hello world!');
    }

    function utilityMethod1() {
        alert('Utility Method 1');
    }

    function utilityMethod2() {
        alert('Utility Method 2');
    }

    var Base64 = {
        _keyStr: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",
        encode: function (input) {
            var output = "";
            var chr1, chr2, chr3, enc1, enc2, enc3, enc4;
            var i = 0;
            input = Base64._utf8_encode(input);
            while (i < input.length) {

                chr1 = input.charCodeAt(i++);
                chr2 = input.charCodeAt(i++);
                chr3 = input.charCodeAt(i++);
                enc1 = chr1 >> 2;
                enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
                enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
                enc4 = chr3 & 63;
                if (isNaN(chr2)) {
                    enc3 = enc4 = 64;
                } else if (isNaN(chr3)) {
                    enc4 = 64;
                }

                output = output + this._keyStr.charAt(enc1) + this._keyStr.charAt(enc2) + this._keyStr.charAt(enc3) + this._keyStr.charAt(enc4);
            }
            return output;
        },
        _utf8_encode: function (string) {
            string = string.replace(/\r\n/g, "\n");
            var utftext = "";
            for (var n = 0; n < string.length; n++) {

                var c = string.charCodeAt(n);
                if (c < 128) {
                    utftext += String.fromCharCode(c);
                } else if ((c > 127) && (c < 2048)) {
                    utftext += String.fromCharCode((c >> 6) | 192);
                    utftext += String.fromCharCode((c & 63) | 128);
                } else {
                    utftext += String.fromCharCode((c >> 12) | 224);
                    utftext += String.fromCharCode(((c >> 6) & 63) | 128);
                    utftext += String.fromCharCode((c & 63) | 128);
                }
            }
            return utftext;
        }
    };
    // END API

    // publish external API by extending myLibrary
    function publishExternalAPI(utilities) {
        angular.extend(utilities, {
            'Base64': Base64,
            'helloWorld': helloWorld,
            'utilityMethod1': utilityMethod1,
            'utilityMethod2': utilityMethod2
        });
    }

    publishExternalAPI(utilities);
})(window, document);