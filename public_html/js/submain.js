var recomSubApp = angular.module('app.recomsys.sub', ['app.recomsys']);

recomSubApp.controller('RightMenuController', function ($scope, userService, $location, $window, $cookieStore, $http, CONSTANTS) {
    $scope.user = userService.getUser();
    $scope.logout = function ()
    {
        $cookieStore.remove("recomApp");
        $location.path("/");
        $window.location.reload();
    };
});

recomSubApp.controller('DocViewerController', function ($scope, alertify, objTransferService, userService, $location, $window, $cookieStore, $http, CONSTANTS) {
    $scope.pdf = objTransferService.getObj();
    $scope.pdf.src = CONSTANTS.SERVICES.FILEPATH + $scope.pdf.document_url;
    $http.get(CONSTANTS.SERVICES.FILEPATH + $scope.pdf.document_url, {
        responseType: 'arraybuffer'
    }).then(function (response) {
        $scope.pdf.data = new Uint8Array(response.data);
    });
});
recomSubApp.controller('DocsController', function ($scope, alertify, userService, objTransferService, $location, $window, $cookieStore, $http, CONSTANTS) {
    $scope.user = userService.getUser();

    $scope.viewDocument = function (doc) {
        objTransferService.setObj(doc);
        $window.open(CONSTANTS.SERVICES.FILEPATH + doc.document_url, '_blank');

    };
    $scope.getDocuments = function () {
        if ($scope.user.type === 'student') {
            $.post(CONSTANTS.SERVICES.APIURL, {view: CONSTANTS.VIEW.GETDOCUMENTS, id: $scope.user.id})
                    .success(function (data) {
                        $scope.docs = data;
                        if (!$scope.$$phase)
                            $scope.$apply();
                    })
                    .error(function (xhr, status, error) {
                        // error handling
                        if (error !== undefined) {
                            alertify.logPosition("top center");
                            alertify.error("Something Went Wrong");


                        }

                    });
        }

    };
    $scope.getDocumentsOfStudent = function ($id) {
        if ($scope.user.type === 'college') {
            $.post(CONSTANTS.SERVICES.APIURL, {view: CONSTANTS.VIEW.GETDOCUMENTS, id: $id})
                    .success(function (data) {
                        $scope.docs = data;
                        if (!$scope.$$phase)
                            $scope.$apply();
                    })
                    .error(function (xhr, status, error) {
                        // error handling
                        if (error !== undefined) {
                            alertify.logPosition("top center");
                            alertify.error("Something Went Wrong");


                        }

                    });
        }

    };
    $scope.upload = function (fileName, file) {
        var form_data = new FormData();
        var data = {upfile: file, file_name: fileName, sid: $scope.user.id};
        for (var key in data) {
            form_data.append(key, data[key]);
        }
        $.ajax({
            url: CONSTANTS.SERVICES.UPLOADURL,
            data: form_data,
            processData: false,
            contentType: false,
            type: 'POST'}).success(function (data) {
            if (data.reply)
            {
                alertify.logPosition("top center");
                alertify.success(data.reply);
                $scope.getDocuments();
            }
            else
            {
                alertify.logPosition("top center");
                alertify.error(data);
            }
            if (!$scope.$$phase)
                $scope.$apply();
        })
                .error(function (xhr, status, error) {
                    // error handling
                    if (error !== undefined) {
                        alertify.logPosition("top center");
                        alertify.error("Something Went Wrong");


                    }

                });
    };
});
recomSubApp.controller('ViewApplicationsController', function ($scope, userService, objTransferService, $location, utilService, $cookieStore, $http, CONSTANTS) {
    $scope.user = userService.getUser();
    $scope.applications = [];

    $scope.reviewApplication = function (application) {
        objTransferService.setObj(application);
        $location.path('/reviewApplication');
    };
    $scope.getApplications = function () {
        $.post(CONSTANTS.SERVICES.APIURL, {view: CONSTANTS.VIEW.GETAPPLICATIONS, id: $scope.user.id, type: $scope.user.type})
                .success(function (data) {
                    $scope.applications = data;
                    if (!$scope.$$phase)
                        $scope.$apply();
                })
                .error(function (xhr, status, error) {
                    // error handling
                    if (error !== undefined) {
                        alertify.logPosition("top center");
                        alertify.error("Something Went Wrong");


                    }

                });

    };
    $scope.formatDate = function (dateStr) {
        return utilService.formatDate(new Date(dateStr));
    };
});
recomSubApp.controller('SignupController', function ($scope, alertify, $location, $window, $cookieStore, $http, CONSTANTS) {
    $scope.castes = [];

    $.post(CONSTANTS.SERVICES.APIURL, {view: CONSTANTS.VIEW.RESERVATIONS})
            .success(function (data) {
                $scope.castes = data;
                if (!$scope.$$phase)
                    $scope.$apply();
            })
            .error(function (xhr, status, error) {
                // error handling
                if (error !== undefined) {
                    alertify.logPosition("top center");
                    alertify.error("Something Went Wrong");


                }

            });

    function formatDate() {
        var monthNames = [
            "Jan", "Feb", "Mar",
            "Apr", "May", "Jun", "Jul",
            "Aug", "Sep", "Oct",
            "Nov", "Dec"
        ];

        var day = $scope.dob.getDate();
        var monthIndex = $scope.dob.getMonth();
        var year = $scope.dob.getFullYear();

        return day + ' ' + monthNames[monthIndex] + ' ' + year;
    }
    $scope.gotohome = function () {
        $location.path("/");
    };
    $scope.signup = function () {
        $scope.user.view = CONSTANTS.VIEW.SIGNUP;
        if ($scope.user.type === 'student')
            $scope.user.dob = formatDate();

        $.post(CONSTANTS.SERVICES.APIURL, $scope.user)
                .success(function (data) {
                    if (data.toString().includes('already'))
                    {
                        alertify.logPosition("top center");
                        alertify.error(data);

                    } else
                    {
                        alertify.logPosition("top center");
                        alertify.success(data);
                        $scope.gotohome();
                        if (!$scope.$$phase)
                            $scope.$apply();
                    }


                })
                .error(function (xhr, status, error) {
                    // error handling
                    if (error !== undefined) {
                        alertify.logPosition("top center");
                        alertify.error("Something Went Wrong");


                    }

                });

    };
});
recomSubApp.controller('ManageCoursesController', function ($scope, userService, alertify, $location, $window, $cookieStore, $http, CONSTANTS) {
    $scope.user = userService.getUser();

    $scope.streams = [];
    $scope.majors = [];
    $scope.specs = [];
    $scope.castes = [];
    $scope.getCastes = function () {

        $.post(CONSTANTS.SERVICES.APIURL, {view: CONSTANTS.VIEW.RESERVATIONS})
                .success(function (data) {
                    $scope.castes = data;
                    if (!$scope.$$phase)
                        $scope.$apply();
                })
                .error(function (xhr, status, error) {
                    // error handling
                    if (error !== undefined) {
                        alertify.logPosition("top center");
                        alertify.error("Something Went Wrong");


                    }

                });
    };
    $scope.courses = [];
    $scope.getStreams = function () {
        $.post(CONSTANTS.SERVICES.APIURL, {view: CONSTANTS.VIEW.GETCOLSTREAMS, id: $scope.user.id})
                .success(function (data) {
                    $scope.courses = data;
                    if (!$scope.$$phase)
                        $scope.$apply();

                })
                .error(function (xhr, status, error) {
                    // error handling
                    if (error !== undefined) {
                        alertify.logPosition("top center");
                        alertify.error("Something Went Wrong");


                    }

                });

    };
    $scope.gotoAdd = function () {
        $location.path("/addStream");
    };

    $scope.createStream = function () {
        $scope.stream.res = $scope.castes;
        $scope.stream.cid = $scope.user.id;

        for (var i = 0; i < $scope.sms.length; i++)
        {
            var sd = $scope.sms[i];
            if (sd.stream_name === $scope.stream.stream && sd.specialization === $scope.stream.specialization)
                $scope.stream.sid = sd.id;

        }
        $scope.stream.view = CONSTANTS.VIEW.ADDSTREAM;
        $.post(CONSTANTS.SERVICES.APIURL, $scope.stream)
                .success(function (data) {
                    alertify.logPosition("top center");
                    alertify.success(data.reply);
                    $location.path('/manageCourses');
                    if (!$scope.$$phase)
                        $scope.$apply();

                })
                .error(function (xhr, status, error) {
                    // error handling
                    if (error !== undefined) {
                        alertify.logPosition("top center");
                        alertify.error("Something Went Wrong");


                    }

                });


    };
    $scope.allocateSeats = function () {
        for (var i = 0; i < $scope.castes.length; i++)
        {
            $scope.castes[i].als = ($scope.castes[i].allocation_per / 100) * $scope.stream.ti;
        }

    };
    $scope.sms = [];
    $scope.getSMS = function () {
        $.post(CONSTANTS.SERVICES.APIURL, {view: CONSTANTS.VIEW.GETSMS})
                .success(function (data) {
                    $scope.sms = data;
                    for (var i = 0; i < $scope.sms.length; i++)
                    {
                        if ($scope.streams.indexOf($scope.sms[i].stream_name) === -1)
                            $scope.streams.push($scope.sms[i].stream_name);
                        if ($scope.majors.indexOf($scope.sms[i].major) === -1)
                            $scope.majors.push($scope.sms[i].major);
                        if ($scope.specs.indexOf($scope.sms[i].specialization) === -1)
                            $scope.specs.push($scope.sms[i].specialization);
                        if (!$scope.$$phase)
                            $scope.$apply();

                    }
                })
                .error(function (xhr, status, error) {
                    // error handling
                    if (error !== undefined) {
                        alertify.logPosition("top center");
                        alertify.error("Something Went Wrong");


                    }

                });
        $scope.getCastes();

    };
});
recomSubApp.controller('ManageProfileController', function ($scope, alertify, userService, $location, $window, $cookieStore, $http, CONSTANTS) {
    $scope.user = userService.getUser();
//    $scope.user.userType='student';
    $scope.majors = [];
    $scope.sms = [];
    if ($scope.user.type === 'student')
    {
        $.post(CONSTANTS.SERVICES.APIURL, {view: CONSTANTS.VIEW.RESERVATIONS})
                .success(function (data) {
                    $scope.castes = data;
                    if (!$scope.$$phase)
                        $scope.$apply();
                })
                .error(function (xhr, status, error) {
                    // error handling
                    if (error !== undefined) {
                        alertify.logPosition("top center");
                        alertify.error("Something Went Wrong");


                    }

                });

        $.post(CONSTANTS.SERVICES.APIURL, {view: CONSTANTS.VIEW.GETSMS})
                .success(function (data) {
                    $scope.sms = data;
                    for (var i = 0; i < $scope.sms.length; i++)
                    {
                        if ($scope.majors.indexOf($scope.sms[i].major) === -1)
                            $scope.majors.push($scope.sms[i].major);
                        if (!$scope.$$phase)
                            $scope.$apply();

                    }
                })
                .error(function (xhr, status, error) {
                    // error handling
                    if (error !== undefined) {
                        alertify.logPosition("top center");
                        alertify.error("Something Went Wrong");


                    }

                });



    }
    $scope.updateStudent = function () {
        $scope.user.dob = formatDate();
        $scope.user.view = CONSTANTS.VIEW.UPDATESTUDENT;
        $.post(CONSTANTS.SERVICES.APIURL, $scope.user)
                .success(function (data) {
                    //This sets cookies for application
                    $cookieStore.put("recomApp", data);

                    //This adds user object in userService
//                userService.addUser($user);

                    $scope.$emit('showUserName', {
                        show: true
                    });
                    //set cookie expiry (works when page is refreshed by user)
                    var now = new $window.Date(), //get the current date
                            // this will set the expiration to 1 hour
                            exp = new $window.Date(now.getDate() + 1);

                    $cookieStore.put("recomApp", data, {
                        expires: exp
                    });

                    $location.path("/home/dashboard");
                    if (!$scope.$$phase)
                        $scope.$apply();
                })
                .error(function (xhr, status, error) {
                    // error handling
                    if (error !== undefined) {
                        alertify.logPosition("top center");
                        alertify.error("Something Went Wrong");


                    }

                });
    };
    $scope.updateCollege = function () {
        $scope.user.view = CONSTANTS.VIEW.UPDATECOLLEGE;
        $.post(CONSTANTS.SERVICES.APIURL, $scope.user)
                .success(function (data) {
                    //This sets cookies for application
                    $cookieStore.put("recomApp", data);

                    //This adds user object in userService
//                userService.addUser($user);

                    $scope.$emit('showUserName', {
                        show: true
                    });
                    //set cookie expiry (works when page is refreshed by user)
                    var now = new $window.Date(), //get the current date
                            // this will set the expiration to 1 hour
                            exp = new $window.Date(now.getDate() + 1);

                    $cookieStore.put("recomApp", data, {
                        expires: exp
                    });

                    $location.path("/home/dashboard");
                    if (!$scope.$$phase)
                        $scope.$apply();
                })
                .error(function (xhr, status, error) {
                    // error handling
                    if (error !== undefined) {
                        alertify.logPosition("top center");
                        alertify.error("Something Went Wrong");


                    }

                });
    };
    function formatDate() {
        var monthNames = [
            "Jan", "Feb", "Mar",
            "Apr", "May", "Jun", "Jul",
            "Aug", "Sep", "Oct",
            "Nov", "Dec"
        ];

        var day = $scope.user.dob.getDate();
        var monthIndex = $scope.user.dob.getMonth();
        var year = $scope.user.dob.getFullYear();

        return day + ' ' + monthNames[monthIndex] + ' ' + year;
    }
    function parseDate(dateStr) {
//        console.log(dateStr);
        var date = new Date(dateStr);
        return date;
    }
    if ($scope.user.type === 'student')
        $scope.user.dob = parseDate($scope.user.dob);
    $scope.quals = ["H.S.C.", "Diploma"];
//console.log($scope.user.dob);
    $scope.changePassword = function () {
        $location.path("/changePassword");
    };
});
recomSubApp.controller('DashboardController', function ($scope, userService, $location, $window, $cookieStore, $http, CONSTANTS) {
    $scope.user = userService.getUser();
    var keys = Object.keys($scope.user);
    var len = keys.length;
    var comp = 0, incom = 0;
    console.log("keys " + len);
    for (var i = 0; i < len; i++) {
        if ($scope.user[keys[i]] === undefined || $scope.user[keys[i]] === null || $scope.user[keys[i]] === '')
            incom++;
        else
            comp++;
    }
    comp = (comp / len) * 100;
    incom = (incom / len) * 100;
    $scope.profileCompletionCount = [comp, incom];

    $scope.profileCompletionKey = ["Complete", "Incomplete"];

    $scope.collegeMatchCount = [7, 3, 10, 20];
    $scope.collegeMatchKey = ["BSC", "BCS", "BA", "BBA"];
    $scope.options = {legend: {display: true, position: 'right'}
    };

});
recomSubApp.controller('ReviewApplicationController', function ($scope, alertify, $location, userService, objTransferService, $http, CONSTANTS) {
    $scope.user = userService.getUser();
    $scope.application = objTransferService.getObj();
    if (!$scope.application.id)
        $location.path('/viewApplications');

    $scope.updateStatus = function (status)
    {
//        alertify.confirm("Are you sure you want to "+status+" the applicant?" ,
//                function () {
//                    alertify.success('Ok');
//                },
//                function () {
//                    alertify.error('Cancel');
//                });
        if (status === 'Reject')
            status = 'REJECTED';
        else
            status = "SELECTED";
        $.post(CONSTANTS.SERVICES.APIURL, {view: CONSTANTS.VIEW.UPDATEAPPLCATIONSTATUS, id: $scope.application.id, status:status})
                .success(function (data) {
                    if (data.includes('Successfully'))
                    {
                        alertify.logPosition("top center");
                        alertify.success(data);

                    } else
                    {
                        alertify.logPosition("top center");
                        alertify.error(data);
                    }
                    $location.path('/viewApplications');
                    if (!$scope.$$phase)
                        $scope.$apply();
                })
                .error(function (xhr, status, error) {
                    // error handling
                    if (error !== undefined) {
                        alertify.logPosition("top center");
                        alertify.error("Something Went Wrong");


                    }

                });
//                
    };
    $scope.getStudentDetails = function ()
    {
        $.post(CONSTANTS.SERVICES.APIURL, {view: CONSTANTS.VIEW.GETSTUDENTDETAILS, id: $scope.application.student_id})
                .success(function (data) {
                    $scope.student = data;
                    if (!$scope.$$phase)
                        $scope.$apply();
                })
                .error(function (xhr, status, error) {
                    // error handling
                    if (error !== undefined) {
                        alertify.logPosition("top center");
                        alertify.error("Something Went Wrong");


                    }

                });
    };
});
recomSubApp.controller('SearchCollegeController', function ($scope, alertify, $location, userService, objTransferService, $http, CONSTANTS) {
    $scope.user = userService.getUser();
    $scope.majors = [];
    $scope.majs = [];
    $scope.streams = [];
    $scope.strms = [];

    $scope.colleges = [];
    $scope.searchCollege = function () {
        $scope.searchCondition = objTransferService.getObj();
        $.post(CONSTANTS.SERVICES.APIURL, {view: CONSTANTS.VIEW.SEARCHCOLLEGE, condition: $scope.searchCondition})
                .success(function (data) {
                    $scope.colleges = data;
                    if (!$scope.$$phase)
                        $scope.$apply();
                })
                .error(function (xhr, status, error) {
                    // error handling
                    if (error !== undefined) {
                        alertify.logPosition("top center");
                        alertify.error("Something Went Wrong");


                    }

                });
    };
    $scope.getSMS = function () {
        $.post(CONSTANTS.SERVICES.APIURL, {view: CONSTANTS.VIEW.GETSMS})
                .success(function (data) {
                    $scope.sms = data;
                    for (var i = 0; i < $scope.sms.length; i++)
                    {
                        if ($scope.strms.indexOf($scope.sms[i].stream_name) === -1)
                        {
                            $scope.streams.push({name: $scope.sms[i].stream_name});
                            $scope.strms.push($scope.sms[i].stream_name);
                        }
                        if ($scope.majs.indexOf($scope.sms[i].major) === -1)
                        {
                            $scope.majors.push({name: $scope.sms[i].major});
                            $scope.majs.push($scope.sms[i].major);
                        }
                        if (!$scope.$$phase)
                            $scope.$apply();

                    }
                })
                .error(function (xhr, status, error) {
                    // error handling
                    if (error !== undefined) {
                        alertify.logPosition("top center");
                        alertify.error("Something Went Wrong");


                    }

                });
    };
    $scope.search = function () {
        $scope.searchCondition = "";
        $scope.searchCondition = $scope.searchCondition + "reservation_id=" + $scope.user.rid + " and cut_off<=" + $scope.user.percentage;
        var majorsCondition = ""
        for (var i = 0; i < $scope.majors.length; i++) {
            var maj = $scope.majors[i];
            if (maj.selected)
            {
                if (majorsCondition === "") {
                    majorsCondition = majorsCondition + " and (major='" + maj.name + "'";
                }
                else
                    majorsCondition = majorsCondition + " or major='" + maj.name + "'";
            }

        }
        var streamsCondition = "";
        for (var i = 0; i < $scope.streams.length; i++) {
            var maj = $scope.streams[i];
            if (maj.selected)
            {
                if (streamsCondition === "") {
                    streamsCondition = streamsCondition + " and (stream_name='" + maj.name + "'";
                }
                else
                    streamsCondition = streamsCondition + " or stream_name='" + maj.name + "'";
            }
        }
        if (streamsCondition)
            $scope.searchCondition += streamsCondition + ")";
        if (majorsCondition)
            $scope.searchCondition += majorsCondition + ")";
        objTransferService.setObj($scope.searchCondition);
        $location.path("/searchCollegeResults");
    };
    $scope.sendApplication = function () {
        $college = objTransferService.getObj();
        $req = {
            stud_id: $scope.user.id,
            college_id: $college.college_id,
            stream_id: $college.stream_id,
            view: CONSTANTS.VIEW.APPLYTOCOLLEGE
        };
        $.post(CONSTANTS.SERVICES.APIURL, $req)
                .success(function (data) {
                    if (data.reply.includes('Succesfully'))
                    {
                        alertify.logPosition("top center");
                        alertify.success(data.reply);

                    } else
                    {
                        alertify.logPosition("top center");
                        alertify.error(data.reply);
                    }
                    $location.path("/viewApplications");
                    if (!$scope.$$phase)
                        $scope.$apply();


                })
                .error(function (xhr, status, error) {
                    // error handling
                    if (error !== undefined) {
                        alertify.logPosition("top center");
                        alertify.error("Something Went Wrong");


                    }

                });
    };
    $scope.apply = function ($college) {
        objTransferService.setObj($college);
        $location.path("/applyToCollege");
    };
});
recomSubApp.controller('LoginController', function ($scope, alertify, $location, $window, $cookieStore, $http, CONSTANTS) {
    $scope.showHidePassword = 'password';
    $scope.togglePassword = function () {
        switch ($scope.showPassword)
        {
            case true:
                $scope.showHidePassword = 'text';
                break;
            case false:
                $scope.showHidePassword = 'password';
                break;
            default :
                $scope.showHidePassword = 'password';
        }
    };
    $scope.user = {};
    $scope.login = function () {
        //This authenticates user
        $scope.user.view = CONSTANTS.VIEW.LOGIN;
        $.post(CONSTANTS.SERVICES.APIURL, $scope.user)
                .success(function (data) {
                    //This sets cookies for application
                    $cookieStore.put("recomApp", data);

                    //This adds user object in userService
//                userService.addUser($user);

                    $scope.$emit('showUserName', {
                        show: true
                    });
                    //set cookie expiry (works when page is refreshed by user)
                    var now = new $window.Date(), //get the current date
                            // this will set the expiration to 1 hour
                            exp = new $window.Date(now.getDate() + 1);

                    $cookieStore.put("recomApp", data, {
                        expires: exp
                    });

                    $location.path("/home/dashboard");
                    if (!$scope.$$phase)
                        $scope.$apply();
                })
                .error(function (xhr, status, error) {
                    // error handling
                    if (error !== undefined) {
                        alertify.logPosition("top center");
                        alertify.error("Credentials Not Valid");


                    }

                });
    };

});
recomApp.directive('loading', ['$http', function ($)
    {
        return {
            restrict: 'A',
            link: function (scope, elm, attrs)
            {
                scope.isLoading = function () {
                    return $.pendingRequests.length > 0;
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
recomApp.service('objTransferService', function ($cookieStore) {
    var obj = {};
    var setObj = function (newObj) {
        obj = newObj;
        //$cookies.put("futuremaker", $user);
    };
    var getObj = function () {
        //$user = $cookies.get("futuremaker",$user);
        return obj;
    };
    return {
        setObj: setObj,
        getObj: getObj
    };
});
recomApp.service('utilService', ['$filter', function ($filter) {
        var formatDate = function (date) {
            return  $filter('date')(date, "dd MMM yyyy");
        };
        var formatDate_Date = function (date) {
            return  $filter('date')(date, "yyyy-MM-dd");
        };
        var formatTime = function (date) {
            return  $filter('date')(date, "hh:mm a");
        };

        return {
            formatDate_Date: formatDate_Date,
            formatDate: formatDate,
            formatTime: formatTime
        };
    }]);
recomApp.constant('CONSTANTS', (function () {
    // Define your variable
    var CONSTANTS = {};
    var SERVICES = {
//         APIURL: 'http://ec2-54-169-136-45.ap-southeast-1.compute.amazonaws.com/api/fm/v0/users'
//        APIURL: 'http://career.navigator.thesolutioncircle.in/ServiceController.php'
        APIURL: 'http://localhost/recom_api/ServiceController.php',
        FILEPATH: 'http://localhost/recom_api',
        UPLOADURL: 'http://localhost/recom_api/fileUpload.php'
//        BASE_PATH: 'http://192.168.1.115:8080/api/fm/v0/'
                // 'http://localhost:8080/api/fm/v0/' //'http://ec2-52-74-20-101.ap-southeast-1.compute.amazonaws.com/api/fm/v0/' 
    };
    var VIEWS = {
        LOGIN: 'login',
        RESERVATIONS: 'get reservations',
        SIGNUP: 'signup',
        ADDSTREAM: 'add college stream',
        GETSMS: 'get SMS',
        UPDATESTUDENT: 'update student',
        UPDATECOLLEGE: 'update college',
        GETDOCUMENTS: 'get documents',
        GETCOLSTREAMS: 'get college streams',
        SEARCHCOLLEGE: 'search college',
        APPLYTOCOLLEGE: 'apply to college',
        GETAPPLICATIONS: 'get applications',
        UPDATEAPPLCATIONSTATUS: 'update application status',
        GETSTUDENTDETAILS: 'get student details'
    };

    CONSTANTS.SERVICES = SERVICES;
    CONSTANTS.VIEW = VIEWS;
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