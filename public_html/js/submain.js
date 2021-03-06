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
recomSubApp.controller('AdmitCardController', function ($scope, alertify, userService, objTransferService, $location, $window, $cookieStore, utilService, CONSTANTS) {
    $scope.application = objTransferService.getObj();
    $scope.user = userService.getUser();
    $scope.today = new Date();
    if (!$scope.application.id)
        $location.path('/viewApplications');
    $scope.getPaymentDetails = function () {
        $scope.loading = true;
        $.post(CONSTANTS.SERVICES.APIURL, {view: CONSTANTS.VIEW.GETPAYMENTDETAILS, id: $scope.application.id})
                .success(function (data) {
                    if (data.purchase_token)
                        $scope.application.pay_id = data.purchase_token;
                    $scope.loading = false;
                    if (!$scope.$$phase)
                        $scope.$apply();
                })
                .error(function (xhr, status, error) {
                    // error handling
                    if (error !== undefined) {
                        alertify.logPosition("top center");
                        alertify.error("Something Went Wrong");
                    }
                    $scope.loading = false;
                    if (!$scope.$$phase)
                        $scope.$apply();
                });
    };
    $scope.download = function () {
        $scope.loading = true;
        html2canvas(document.getElementById('admitCard'), {
            onrendered: function (canvas) {
                $scope.loading = false;
                var data = canvas.toDataURL();
                var docDefinition = {
                    content: [{
                            image: data,
                            width: 500,
                        }]
                };
                pdfMake.createPdf(docDefinition).download($scope.user.name + " admit card.pdf");
            }
        });

    };
    $scope.formatDate = function (dateStr) {
        return utilService.formatDate(dateStr);
    };
});
recomSubApp.controller('DocsController', function ($scope, alertify, userService, objTransferService, $ngConfirm, $window, $cookieStore, $http, CONSTANTS) {
    $scope.user = userService.getUser();

    $scope.viewDocument = function (doc) {
        objTransferService.setObj(doc);
        $window.open(CONSTANTS.SERVICES.FILEPATH + doc.document_url, '_blank');

    };
    $scope.deleteDoc = function ($doc) {
        $ngConfirm({
            icon: 'fa fa-question',
            closeIcon: true,
            closeIconClass: 'fa fa-close',
            title: 'Confirm!',
            theme: 'supervan',
            type: "blue",
            content: '<strong>Are You Sure?</strong> You Want To Delete This?',
            scope: $scope,
            buttons: {
                sayBoo: {
                    text: 'Yes',
                    btnClass: 'btn-danger',
                    action: function (scope, button) {
                        $scope.loading = true;
                        $doc.view = CONSTANTS.VIEW.DELETEDOCUMENT;
                        $.post(CONSTANTS.SERVICES.APIURL, $doc)
                                .success(function (data) {
                                    if (data.includes('Successfully')) {
                                        alertify.logPosition("top center");
                                        alertify.success(data);
                                        $scope.getDocuments();
                                    }
                                    $scope.loading = false;
                                    if (!$scope.$$phase)
                                        $scope.$apply();
                                })
                                .error(function (xhr, status, error) {
                                    // error handling
                                    if (error !== undefined) {
                                        alertify.logPosition("top center");
                                        alertify.error("Faied To Delete Document");
                                    }
                                    $scope.loading = false;
                                    if (!$scope.$$phase)
                                        $scope.$apply();

                                });
                    }
                },
                somethingElse: {
                    text: 'No',
                    btnClass: 'btn-success',
                    action: function (scope, button) {

                    }
                }
            }
        });
    };
    $scope.getDocuments = function () {
        if ($scope.user.type === 'student') {
            $scope.loading = true;
            $.post(CONSTANTS.SERVICES.APIURL, {view: CONSTANTS.VIEW.GETDOCUMENTS, id: $scope.user.id})
                    .success(function (data) {
                        $scope.docs = data;
                        $scope.loading = false;
                        if (!$scope.$$phase)
                            $scope.$apply();
                    })
                    .error(function (xhr, status, error) {
                        // error handling
                        if (error !== undefined) {
                            alertify.logPosition("top center");
                            alertify.error("No Documents Found");
                        }
                        $scope.loading = false;
                        if (!$scope.$$phase)
                            $scope.$apply();

                    });
        }

    };
    $scope.getDocumentsOfStudent = function ($id) {
        if ($scope.user.type === 'college') {
            $scope.loading = true;
            $.post(CONSTANTS.SERVICES.APIURL, {view: CONSTANTS.VIEW.GETDOCUMENTS, id: $id})
                    .success(function (data) {
                        $scope.docs = data;
                        $scope.loading = false;
                        if (!$scope.$$phase)
                            $scope.$apply();
                    })
                    .error(function (xhr, status, error) {
                        // error handling
                        if (error !== undefined) {
                            alertify.logPosition("top center");
                            alertify.error("Failed To Get Docunents");
                        }
                        $scope.loading = false;
                        if (!$scope.$$phase)
                            $scope.$apply();

                    });
        }

    };
    $scope.upload = function (fileName, file) {
        var form_data = new FormData();
        var data = {upfile: file, file_name: fileName, sid: $scope.user.id};
        for (var key in data) {
            form_data.append(key, data[key]);
        }
        $scope.loading = true;
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
            $scope.loading = false;
            if (!$scope.$$phase)
                $scope.$apply();
        })
                .error(function (xhr, status, error) {
                    // error handling
                    if (error !== undefined) {
                        alertify.logPosition("top center");
                        alertify.error("Document Upload Failed");
                    }
                    $scope.loading = false;
                    if (!$scope.$$phase)
                        $scope.$apply();
                });
    };
});
recomSubApp.controller('ViewApplicationsController', function ($scope, userService, objTransferService, $location, utilService, $cookieStore, $window, CONSTANTS) {
    $scope.user = userService.getUser();
    $scope.applications = [];

    $scope.goToAdmitCard = function ($application) {
        objTransferService.setObj($application);
        $location.path('/admitCard');
    };
    $scope.gotoPayment = function ($application) {
        $scope.loading = true;
        $.post(CONSTANTS.SERVICES.APIURL, {view: CONSTANTS.VIEW.MAKEPAYMENT, amount: $application.fees,
            purpose: "Fees for " + $application.stream_name,
            phone: $scope.user.contact,
            name: $scope.user.name,
            email: $scope.user.email
        })
                .success(function (data) {
                    $scope.loading = false;
                    if (!$scope.$$phase)
                        $scope.$apply();
                    $scope.reponse = JSON.parse(data);
                    objTransferService.setObjUsingCookie($application);
                    if ($scope.reponse.payment_request && $scope.reponse.payment_request.longurl)
                        $window.location.href = $scope.reponse.payment_request.longurl;
                    else {
                        alertify.logPosition("top center");
                        alertify.error("Couldn't Process Payment Request");
                    }

                })
                .error(function (xhr, status, error) {
                    // error handling
                    if (error !== undefined) {
                        alertify.logPosition("top center");
                        alertify.error("Couldn't Process Payment Request");
                    }
                    $scope.loading = false;
                    if (!$scope.$$phase)
                        $scope.$apply();

                });

    };
    $scope.reviewApplication = function (application) {
        objTransferService.setObj(application);
        $location.path('/reviewApplication');
    };
    $scope.getApplications = function () {
        $scope.loading = true;
        $.post(CONSTANTS.SERVICES.APIURL, {view: CONSTANTS.VIEW.GETAPPLICATIONS, id: $scope.user.id, type: $scope.user.type})
                .success(function (data) {
                    $scope.applications = data;
                    $scope.loading = false;
                    if (!$scope.$$phase)
                        $scope.$apply();
                })
                .error(function (xhr, status, error) {
                    // error handling
                    if (error !== undefined) {
                        alertify.logPosition("top center");
                        alertify.error("No applications yet");
                    }
                    $scope.loading = false;
                    if (!$scope.$$phase)
                        $scope.$apply();

                });

    };
    $scope.formatDate = function (dateStr) {
        return utilService.formatDate(new Date(dateStr));
    };
});
recomSubApp.controller('SignupController', function ($scope, alertify, $location, $window, $cookieStore, $http, CONSTANTS) {
    $scope.castes = [];
    $scope.statesArrray = [
        {"code": "AN", "name": "Andaman and Nicobar Islands"},
        {"code": "AP", "name": "Andhra Pradesh"},
        {"code": "AR", "name": "Arunachal Pradesh"},
        {"code": "AS", "name": "Assam"},
        {"code": "BR", "name": "Bihar"},
        {"code": "CG", "name": "Chandigarh"},
        {"code": "CH", "name": "Chhattisgarh"},
        {"code": "DH", "name": "Dadra and Nagar Haveli"},
        {"code": "DD", "name": "Daman and Diu"},
        {"code": "DL", "name": "Delhi"},
        {"code": "GA", "name": "Goa"},
        {"code": "GJ", "name": "Gujarat"},
        {"code": "HR", "name": "Haryana"},
        {"code": "HP", "name": "Himachal Pradesh"},
        {"code": "JK", "name": "Jammu and Kashmir"},
        {"code": "JH", "name": "Jharkhand"},
        {"code": "KA", "name": "Karnataka"},
        {"code": "KL", "name": "Kerala"},
        {"code": "LD", "name": "Lakshadweep"},
        {"code": "MP", "name": "Madhya Pradesh"},
        {"code": "MH", "name": "Maharashtra"},
        {"code": "MN", "name": "Manipur"},
        {"code": "ML", "name": "Meghalaya"},
        {"code": "MZ", "name": "Mizoram"},
        {"code": "NL", "name": "Nagaland"},
        {"code": "OR", "name": "Odisha"},
        {"code": "PY", "name": "Puducherry"},
        {"code": "PB", "name": "Punjab"},
        {"code": "RJ", "name": "Rajasthan"},
        {"code": "SK", "name": "Sikkim"},
        {"code": "TN", "name": "Tamil Nadu"},
        {"code": "TS", "name": "Telangana"},
        {"code": "TR", "name": "Tripura"},
        {"code": "UK", "name": "Uttarakhand"},
        {"code": "UP", "name": "Uttar Pradesh"},
        {"code": "WB", "name": "West Bengal"}
    ];
    $scope.loading = true;
    $.post(CONSTANTS.SERVICES.APIURL, {view: CONSTANTS.VIEW.RESERVATIONS})
            .success(function (data) {
                $scope.castes = data;
                $scope.loading = false;
                if (!$scope.$$phase)
                    $scope.$apply();
            })
            .error(function (xhr, status, error) {
                // error handling
//                if (error !== undefined) {
//                    alertify.logPosition("top center");
//                    alertify.error("Something Went Wrong");
//                }
                $scope.loading = false;
                if (!$scope.$$phase)
                    $scope.$apply();

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
        $scope.loading = true;
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
                    }
                    $scope.loading = false;
                    if (!$scope.$$phase)
                        $scope.$apply();


                })
                .error(function (xhr, status, error) {
                    // error handling
                    if (error !== undefined) {
                        alertify.logPosition("top center");
                        alertify.error("Registration Failed!");
                    }
                    $scope.loading = false;
                    if (!$scope.$$phase)
                        $scope.$apply();

                });

    };
});
recomSubApp.controller('ViewAdmissionsController', function ($scope, userService, alertify, $location, objTransferService, $cookieStore, $http, CONSTANTS) {
    $scope.admissions = objTransferService.getObj();
    if (!$scope.admissions.length)
        $location.path('/manageCourses');
    $scope.viewProfile = function (application) {
        objTransferService.setObj(application);
        $location.path('/viewProfile');
    };
});
recomSubApp.controller('ManageCoursesController', function ($scope, userService, alertify, $location, objTransferService, $cookieStore, $http, CONSTANTS) {
    $scope.user = userService.getUser();

    $scope.majorsFilter = [];
    $scope.majors = [];
    $scope.stream = {};
    $scope.majorsEvents = {onSelectionChanged: function () {
            $scope.major = "";
            $scope.majorsFilter.map(function (maj, key) {
                if (key !== $scope.majorsFilter.length - 1)
                    $scope.major = $scope.major + maj.label + ",";
                else
                    $scope.major = $scope.major + maj.label;

            });
            $scope.getSMS('stream', $scope.major, undefined);
        }};
    $scope.specFilter = [];
    $scope.specializations = [];
    $scope.specEvents = {onSelectionChanged: function () {
            $scope.loading = true;
            $.post(CONSTANTS.SERVICES.APIURL, {view: CONSTANTS.VIEW.GETSTREAMID, major: $scope.majorsFilter[0].label, stream: $scope.streamsFilter[0].label, spec: $scope.specFilter[0].label})
                    .success(function (data) {
                        $scope.stream.sid = data.id;
                        $scope.loading = false;
                        if (!$scope.$$phase)
                            $scope.$apply();
                    })
                    .error(function (xhr, status, error) {
                        // error handling
                        $scope.loading = false;
                        if (!$scope.$$phase)
                            $scope.$apply();

                    });
        }};
    $scope.streamsFilter = [];
    $scope.streams = [];
    $scope.streamsEvents = {onSelectionChanged: function () {
            if ($scope.streamsFilter[0].label !== 'Custom') {
                $scope.streamf = "";
                $scope.streamsFilter.map(function (maj, key) {
                    if (key !== $scope.streamsFilter.length - 1)
                        $scope.streamf = $scope.streamf + maj.label + ",";
                    else
                        $scope.streamf = $scope.streamf + maj.label;

                });
                $scope.getSMS('spec', $scope.major, $scope.streamf);
            }
            else
                $scope.stream.major = $scope.majorsFilter[0].label;
        }};
    $scope.settings = {selectionLimit: 1, smartButtonMaxItems: 3, smartButtonTextConverter: function (itemText) {
            return itemText;
        }};

    $scope.castes = [];
    $scope.getCastes = function () {
        $scope.loading = true;
        $.post(CONSTANTS.SERVICES.APIURL, {view: CONSTANTS.VIEW.RESERVATIONS})
                .success(function (data) {
                    $scope.castes = data;
                    $scope.loading = false;
                    if (!$scope.$$phase)
                        $scope.$apply();
                })
                .error(function (xhr, status, error) {
                    // error handling
                    $scope.loading = false;
                    if (!$scope.$$phase)
                        $scope.$apply();

                });
    };
    $scope.viewAdmissions = function (course) {
        $scope.loading = true;
        $.post(CONSTANTS.SERVICES.APIURL, {view: CONSTANTS.VIEW.GETADMISSIONSFORCOURSE, sid: course.stream_id, cid: course.college_id})
                .success(function (data) {
                    if (data.length) {
                        objTransferService.setObj(data);
                        $location.path('/viewAdmissions');
                    }
                    $scope.loading = false;
                    if (!$scope.$$phase)
                        $scope.$apply();
                })
                .error(function (xhr, status, error) {
                    // error handling
                    if (error !== undefined) {
                        alertify.logPosition("top center");
                        alertify.error("No Admissions Found");
                    }
                    $scope.loading = false;
                    if (!$scope.$$phase)
                        $scope.$apply();

                });
    };
    $scope.courses = [];
    $scope.getStreams = function () {
        $scope.loading = true;
        $.post(CONSTANTS.SERVICES.APIURL, {view: CONSTANTS.VIEW.GETCOLSTREAMS, id: $scope.user.id})
                .success(function (data) {
                    $scope.courses = data;
                    $scope.loading = false;
                    if (!$scope.$$phase)
                        $scope.$apply();

                })
                .error(function (xhr, status, error) {
                    // error handling
                    if (error !== undefined) {
                        alertify.logPosition("top center");
                        alertify.error("No courses found");
                    }
                    $scope.loading = false;
                    if (!$scope.$$phase)
                        $scope.$apply();

                });

    };
    $scope.gotoAdd = function () {
        $location.path("/addStream");
    };

    $scope.createStream = function () {
        $scope.stream.res = $scope.castes;
        $scope.stream.cid = $scope.user.id;
        if ($scope.streamsFilter[0].label === 'Custom') {
            $scope.stream.duration = $scope.stream.duration + ' ' + $scope.yorm;
            $scope.stream.sid = undefined;
        }
        $scope.stream.view = CONSTANTS.VIEW.ADDSTREAM;
        $scope.loading = true;
        $.post(CONSTANTS.SERVICES.APIURL, $scope.stream)
                .success(function (data) {
                    alertify.logPosition("top center");
                    alertify.success(data.reply);
                    $location.path('/manageCourses');
                    $scope.loading = false;
                    if (!$scope.$$phase)
                        $scope.$apply();

                })
                .error(function (xhr, status, error) {
                    // error handling
                    if (error !== undefined) {
                        alertify.logPosition("top center");
                        alertify.error("Stream Creation Failed");

                    }
                    $scope.loading = false;
                    if (!$scope.$$phase)
                        $scope.$apply();

                });


    };
    $scope.allocateSeats = function () {
        for (var i = 0; i < $scope.castes.length; i++)
        {
            $scope.castes[i].als = ($scope.castes[i].allocation_per / 100) * $scope.stream.ti;
        }

    };

    $scope.getSMS = function (type, majors, streams) {
        $scope.loading = true;
        $.post(CONSTANTS.SERVICES.APIURL, {view: CONSTANTS.VIEW.GETSMS, type: type, majors: majors, streams: streams})
                .success(function (data) {
                    if (type === 'major') {
                        $scope.majors = data;
                    }
                    else if (type === 'stream')
                    {
                        $scope.streams = data;
                        $scope.streams.push({label: 'Custom', id: 'Custom'});
                    }
                    else
                        $scope.specializations = data;
                    $scope.loading = false;
                    if (!$scope.$$phase)
                        $scope.$apply();


                })
                .error(function (xhr, status, error) {
                    // error handling
                    $scope.loading = false;
                    if (!$scope.$$phase)
                        $scope.$apply();

                });
        $scope.getCastes();

    };
});
recomSubApp.controller('ContactUsController', function ($scope, alertify, userService, $location, $window, $cookieStore, $http, CONSTANTS) {
    $scope.sendMsg = function () {
        $scope.msg.view = CONSTANTS.VIEW.CONTACTUS;
        $scope.loading = true;
        $.post(CONSTANTS.SERVICES.APIURL, $scope.msg)
                .success(function (data) {
                    if (data === 'Insertion Success')
                    {
                        alertify.logPosition("top center");
                        alertify.success("We have registered your feedback. Thank You!");
                    }
                    $location.path("/home");
                    $scope.loading = false;
                    if (!$scope.$$phase)
                        $scope.$apply();
                })
                .error(function (xhr, status, error) {
                    // error handling
                    if (error !== undefined) {
                        alertify.logPosition("top center");
                        alertify.error("Please Try Again We Need Your Valuable Feedback!!");
                    }
                    $scope.loading = false;
                    if (!$scope.$$phase)
                        $scope.$apply();

                });
    };
});
recomSubApp.controller('ManageProfileController', function ($scope, alertify, userService, $location, $window, $cookieStore, $http, CONSTANTS) {
    $scope.user = userService.getUser();
//    $scope.user.userType='student';
    $scope.statesArrray = [
        {"code": "AN", "name": "Andaman and Nicobar Islands"},
        {"code": "AP", "name": "Andhra Pradesh"},
        {"code": "AR", "name": "Arunachal Pradesh"},
        {"code": "AS", "name": "Assam"},
        {"code": "BR", "name": "Bihar"},
        {"code": "CG", "name": "Chandigarh"},
        {"code": "CH", "name": "Chhattisgarh"},
        {"code": "DH", "name": "Dadra and Nagar Haveli"},
        {"code": "DD", "name": "Daman and Diu"},
        {"code": "DL", "name": "Delhi"},
        {"code": "GA", "name": "Goa"},
        {"code": "GJ", "name": "Gujarat"},
        {"code": "HR", "name": "Haryana"},
        {"code": "HP", "name": "Himachal Pradesh"},
        {"code": "JK", "name": "Jammu and Kashmir"},
        {"code": "JH", "name": "Jharkhand"},
        {"code": "KA", "name": "Karnataka"},
        {"code": "KL", "name": "Kerala"},
        {"code": "LD", "name": "Lakshadweep"},
        {"code": "MP", "name": "Madhya Pradesh"},
        {"code": "MH", "name": "Maharashtra"},
        {"code": "MN", "name": "Manipur"},
        {"code": "ML", "name": "Meghalaya"},
        {"code": "MZ", "name": "Mizoram"},
        {"code": "NL", "name": "Nagaland"},
        {"code": "OR", "name": "Odisha"},
        {"code": "PY", "name": "Puducherry"},
        {"code": "PB", "name": "Punjab"},
        {"code": "RJ", "name": "Rajasthan"},
        {"code": "SK", "name": "Sikkim"},
        {"code": "TN", "name": "Tamil Nadu"},
        {"code": "TS", "name": "Telangana"},
        {"code": "TR", "name": "Tripura"},
        {"code": "UK", "name": "Uttarakhand"},
        {"code": "UP", "name": "Uttar Pradesh"},
        {"code": "WB", "name": "West Bengal"}
    ];
    $scope.majors = [];
    $scope.sms = [];
    if ($scope.user && $scope.user.type === 'student')
    {
        $scope.loading = true;
        $.post(CONSTANTS.SERVICES.APIURL, {view: CONSTANTS.VIEW.RESERVATIONS})
                .success(function (data) {
                    $scope.castes = data;
                    $scope.loading = false;
                    if (!$scope.$$phase)
                        $scope.$apply();
                })
                .error(function (xhr, status, error) {
                    // error handling
                    $scope.loading = false;
                    if (!$scope.$$phase)
                        $scope.$apply();

                });
        $scope.loading = true;
        $.post(CONSTANTS.SERVICES.APIURL, {view: CONSTANTS.VIEW.GETSMS, type: 'major'})
                .success(function (data) {
                    $scope.majors = data;
                    $scope.loading = false;
                    if (!$scope.$$phase)
                        $scope.$apply();
                })
                .error(function (xhr, status, error) {
                    // error handling
                    $scope.loading = false;
                    if (!$scope.$$phase)
                        $scope.$apply();

                });



    }
    $scope.gotoResetLink = function () {
        $scope.loading = true;
        $.post(CONSTANTS.SERVICES.APIURL, {view: CONSTANTS.VIEW.GETRESETLINK, email: $scope.reset.email})
                .success(function (data) {
                    if (data.type)
                    {
                        $location.path("/forgotPass").search({email: $scope.reset.email, type: data.type});

                    }
                    $scope.loading = false;
                    if (!$scope.$$phase)
                        $scope.$apply();
                })
                .error(function (xhr, status, error) {
                    // error handling
                    if (error !== undefined) {
                        alertify.logPosition("top center");
                        alertify.error("Email Not Valid");


                    }
                    $scope.loading = false;
                    if (!$scope.$$phase)
                        $scope.$apply();

                });
    };
    $scope.getSearchParams = function () {
        $scope.reset = {};
        if ($location.$$search.email)
        {
            $scope.reset.email = $location.$$search.email;
            $scope.reset.type = $location.$$search.type;
        }
    };
    $scope.resetPass = function () {
        if ($scope.reset.password === $scope.reset.cpass) {
            $scope.loading = true;
            $.post(CONSTANTS.SERVICES.APIURL, {view: CONSTANTS.VIEW.CHANGEPASSWORD, type: $scope.reset.type, email: $scope.reset.email, pass: $scope.reset.password})
                    .success(function (data) {
                        if (data.reply.includes('Password Update Succesfully'))
                        {
                            alertify.logPosition("top center");
                            alertify.success(data + " Please Login With New Credentials");
                            $cookieStore.remove("recomApp");
                            $location.path("/");
                            $window.location.reload();
                        }
                        $scope.loading = false;
                        if (!$scope.$$phase)
                            $scope.$apply();
                    })
                    .error(function (xhr, status, error) {
                        // error handling
                        if (error !== undefined) {
                            alertify.logPosition("top center");
                            alertify.error("Password Update Failed");
                        }
                        $scope.loading = false;
                        if (!$scope.$$phase)
                            $scope.$apply();

                    });
        }
        else {
            alertify.logPosition("top center");
            alertify.error("Password Should Match Confirm Password");
        }

    };
    $scope.changePass = function () {
        if ($scope.oldpass === $scope.user.password) {
            if ($scope.password === $scope.cpass) {
                $scope.loading = true;
                $.post(CONSTANTS.SERVICES.APIURL, {view: CONSTANTS.VIEW.CHANGEPASSWORD, type: $scope.user.type, email: $scope.user.email, pass: $scope.password})
                        .success(function (data) {
                            if (data.reply.includes('Password Update Succesfully'))
                            {
                                alertify.logPosition("top center");
                                alertify.success(data + " Please Login With New Credentials");
                                $cookieStore.remove("recomApp");
                                $location.path("/");
                                $window.location.reload();
                            }
                            $scope.loading = false;
                            if (!$scope.$$phase)
                                $scope.$apply();
                        })
                        .error(function (xhr, status, error) {
                            // error handling
                            if (error !== undefined) {
                                alertify.logPosition("top center");
                                alertify.error("Password Update Failed");
                            }
                            $scope.loading = false;
                            if (!$scope.$$phase)
                                $scope.$apply();

                        });
            }
            else {
                alertify.logPosition("top center");
                alertify.error("Password Should Match Confirm Password");
            }
        }
        else
        {
            alertify.logPosition("top center");
            alertify.error("Please Enter Correct Old Password");
        }
    };
    $scope.updateStudent = function () {
        $scope.user.dob = formatDate();
        $scope.user.view = CONSTANTS.VIEW.UPDATESTUDENT;
        $scope.loading = true;
        $.post(CONSTANTS.SERVICES.APIURL, $scope.user)
                .success(function (data) {
                    $scope.loading = false;
                    if (!$scope.$$phase)
                        $scope.$apply();
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
                        alertify.error("Failed To Update Profile");


                    }
                    $scope.loading = false;
                    if (!$scope.$$phase)
                        $scope.$apply();

                });
    };
    $scope.updateCollege = function () {
        $scope.user.view = CONSTANTS.VIEW.UPDATECOLLEGE;
        $scope.loading = true;
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
                    $scope.loading = false;
                    if (!$scope.$$phase)
                        $scope.$apply();
                })
                .error(function (xhr, status, error) {
                    // error handling
                    if (error !== undefined) {
                        alertify.logPosition("top center");
                        alertify.error("Profile Updation Failed");
                    }
                    $scope.loading = false;
                    if (!$scope.$$phase)
                        $scope.$apply();

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
    if ($scope.user && $scope.user.type === 'student')
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
//    console.log("keys " + len);
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

    $scope.getDocCount = function ()
    {
        if ($scope.user.type === 'student') {
            $scope.loading = true;
            $.post(CONSTANTS.SERVICES.APIURL, {view: CONSTANTS.VIEW.GETDOCCOUNT, id: $scope.user.id})
                    .success(function (data) {
                        $scope.user.doc_count = data.count;
                        var comp = (data.count / 3) * 100;
                        var incom = ((3 - data.count) / 3) * 100;
                        $scope.docCompletionCount = [comp, incom];

                        $scope.docCompletionKey = ["Complete", "Incomplete"];

                        $scope.loading = false;
                        if (!$scope.$$phase)
                            $scope.$apply();
                    })
                    .error(function (xhr, status, error) {
                        // error handling
                        $scope.loading = false;
                        if (!$scope.$$phase)
                            $scope.$apply();

                    });
        }
    };
});
recomSubApp.controller('ReviewApplicationController', function ($scope, alertify, $location, userService, objTransferService, $http, CONSTANTS) {
    $scope.user = userService.getUser();
    $scope.application = objTransferService.getObj();
    if (!$scope.application.id)
        $location.path('/viewApplications');

    $scope.updateStatus = function (status)
    {
        if (status === 'Reject')
            status = 'REJECTED';
        else
            status = "SELECTED";
        $scope.loading = true;
        $.post(CONSTANTS.SERVICES.APIURL, {view: CONSTANTS.VIEW.UPDATEAPPLCATIONSTATUS, id: $scope.application.id, status: status})
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
                    $scope.loading = false;
                    if (!$scope.$$phase)
                        $scope.$apply();
                })
                .error(function (xhr, status, error) {
                    // error handling
                    if (error !== undefined) {
                        alertify.logPosition("top center");
                        alertify.error("Failed To Update Application Status");


                    }
                    $scope.loading = false;
                    if (!$scope.$$phase)
                        $scope.$apply();

                });
//                
    };
    $scope.getStudentDetails = function ()
    {
        $scope.loading = true;
        $.post(CONSTANTS.SERVICES.APIURL, {view: CONSTANTS.VIEW.GETSTUDENTDETAILS, id: $scope.application.student_id})
                .success(function (data) {
                    $scope.student = data;
                    $scope.loading = false;
                    if (!$scope.$$phase)
                        $scope.$apply();
                })
                .error(function (xhr, status, error) {
                    // error handling
                    if (error !== undefined) {
                        alertify.logPosition("top center");
                        alertify.error("Something Went Wrong");
                    }
                    $scope.loading = false;
                    if (!$scope.$$phase)
                        $scope.$apply();

                });
    };
});
recomSubApp.controller('RedirectController', function ($scope, alertify, $location, userService, objTransferService, $http, CONSTANTS) {
    $scope.user = userService.getUser();
    $scope.application = objTransferService.getObjUsingCookie();
    if ($location.$$search.payment_id)
    {
        $scope.loading = true;
        $.post(CONSTANTS.SERVICES.APIURL, {
            view: CONSTANTS.VIEW.ADMITSTUDENT,
            student_id: $scope.application.student_id,
            college_id: $scope.application.college_id,
            app_id: $scope.application.id,
            pay_id: $location.$$search.payment_id,
            stream_id: $scope.application.stream_id
        })
                .success(function (data) {
                    if (data.includes('Successfully'))
                        $location.path('/viewApplications');
                    $scope.loading = false;
                    if (!$scope.$$phase)
                        $scope.$apply();
                })
                .error(function (xhr, status, error) {
                    // error handling
                    if (error !== undefined) {
                        alertify.logPosition("top center");
                        alertify.error("Payment Registration Failed");

                    }
                    $scope.loading = false;
                    if (!$scope.$$phase)
                        $scope.$apply();

                });

    }
    else {
        alertify.logPosition("top center");
        alertify.error("Payment Failed");
        $location.path('/viewApplications');
    }
});
recomSubApp.controller('SearchCollegeController', function ($scope, alertify, $location, userService, objTransferService, $http, CONSTANTS) {
    $scope.user = userService.getUser();
    $scope.majors = [];
    $scope.majs = [];
    $scope.streams = [];
    $scope.strms = [];
    $scope.statesFilter = [];
    $scope.states = [];
    $scope.statesEvents = {onSelectionChanged: function () {
            $scope.getCities();
        }};
    $scope.majorsFilter = [];
    $scope.majors = [];
    $scope.majorsEvents = {onSelectionChanged: function () {
            $scope.major = "";
            $scope.majorsFilter.map(function (maj, key) {
                if (key !== $scope.majorsFilter.length - 1)
                    $scope.major = $scope.major + maj.label + ",";
                else
                    $scope.major = $scope.major + maj.label;

            });
            $scope.getSMS('stream', $scope.major, undefined);
        }};
    $scope.specFilter = [];
    $scope.specializations = [];
    $scope.streamsFilter = [];
    $scope.streams = [];
    $scope.streamsEvents = {onSelectionChanged: function () {
            $scope.stream = "";
            $scope.streamsFilter.map(function (maj, key) {
                if (key !== $scope.streamsFilter.length - 1)
                    $scope.stream = $scope.stream + maj.label + ",";
                else
                    $scope.stream = $scope.stream + maj.label;

            });
            $scope.getSMS('spec', $scope.major, $scope.stream);
        }};
    $scope.settings = {smartButtonMaxItems: 3, smartButtonTextConverter: function (itemText) {
            return itemText;
        }};
    $scope.citiesFilter = [];
    $scope.cities = [];
    $scope.colleges = [];
    if (Object.keys(objTransferService.getObj()).length <= 0)
    {
        $location.path('/searchColleges');
    }
    $scope.loading = true;
    $.post(CONSTANTS.SERVICES.APIURL, {view: CONSTANTS.VIEW.GETADMISSIONSTATUS, id: $scope.user.id})
            .success(function (data) {
                if (data === 'true') {
                    $scope.admitted = true;
                    if ($location.$$path === '/searchCollegeResults') {
                        alertify.logPosition("top center");
                        alertify.error("You are already admitted so you can't apply");
                    }
                }
                else
                    $scope.admitted = false;
                if ($scope.user.doc_count)
                    $scope.admitted = $scope.admitted || $scope.user.doc_count !== "3";

                $scope.loading = false;
                if (!$scope.$$phase)
                    $scope.$apply();
            })
            .error(function (xhr, status, error) {
                $scope.loading = false;
                if (!$scope.$$phase)
                    $scope.$apply();

            });


    $scope.getCities = function () {
        var filter = "";
        $scope.statesFilter.map(function (state, key) {
            if (key !== $scope.statesFilter.length - 1)
                filter = filter + state.label + ",";
            else
                filter = filter + state.label;

        });
        $scope.loading = true;
        $.post(CONSTANTS.SERVICES.APIURL, {view: CONSTANTS.VIEW.GETCITIES, states: filter})
                .success(function (data) {
                    $scope.cities = data;
                    $scope.loading = false;
                    if (!$scope.$$phase)
                        $scope.$apply();
                })
                .error(function (xhr, status, error) {
                    // error handling
                    $scope.loading = false;
                    if (!$scope.$$phase)
                        $scope.$apply();

                });
    };
    $scope.searchCollege = function () {
        $scope.searchCondition = objTransferService.getObj();
        $scope.loading = true;
        $.post(CONSTANTS.SERVICES.APIURL, {view: CONSTANTS.VIEW.SEARCHCOLLEGE, condition: $scope.searchCondition})
                .success(function (data) {
                    $scope.colleges = data;
                    $scope.loading = false;
                    if (!$scope.$$phase)
                        $scope.$apply();
                })
                .error(function (xhr, status, error) {
                    // error handling
                    if (error !== undefined) {
                        alertify.logPosition("top center");
                        alertify.error("No Colleges Found");
                    }
                    $scope.loading = false;
                    if (!$scope.$$phase)
                        $scope.$apply();

                });
        $scope.loading = true;
        $.post(CONSTANTS.SERVICES.APIURL, {view: CONSTANTS.VIEW.GETDOCCOUNT, id: $scope.user.id})
                .success(function (data) {
                    $scope.user.doc_count = data.count;
                    if (data.count !== "3")
                    {
                        $scope.admitted = true;
                        alertify.logPosition("top center");
                        alertify.error("You Can't Apply As You Haven't Uploaded Mandatory Documents.");
                    }
                    $scope.loading = false;
                    if (!$scope.$$phase)
                        $scope.$apply();
                })
                .error(function (xhr, status, error) {
                    // error handling
                    $scope.loading = false;
                    if (!$scope.$$phase)
                        $scope.$apply();

                });
    };
    $scope.getSMS = function (type, majors, streams) {
        $scope.loading = true;
        $.post(CONSTANTS.SERVICES.APIURL, {view: CONSTANTS.VIEW.GETSMS, type: type, majors: majors, streams: streams})
                .success(function (data) {

                    if (type === 'major') {
                        $scope.majors = data;
                    }
                    else if (type === 'stream')
                    {
                        $scope.streams = data;
                    }
                    else
                        $scope.specializations = data;
                    $scope.loading = false;
                    if (!$scope.$$phase)
                        $scope.$apply();


                })
                .error(function (xhr, status, error) {
                    // error handling
                    $scope.loading = false;
                    if (!$scope.$$phase)
                        $scope.$apply();

                });

    };
    $scope.getStates = function () {
        $scope.loading = true;
        $.post(CONSTANTS.SERVICES.APIURL, {view: CONSTANTS.VIEW.GETSTATES})
                .success(function (data) {
                    $scope.states = data;
                    $scope.loading = false;
                    if (!$scope.$$phase)
                        $scope.$apply();
                })
                .error(function (xhr, status, error) {
                    $scope.loading = false;
                    if (!$scope.$$phase)
                        $scope.$apply();

                });
    };
    $scope.search = function () {
        $scope.searchCondition = "";
        $scope.searchCondition = $scope.searchCondition + "reservation_id=" + $scope.user.rid + " and cut_off<=" + $scope.user.percentage;
        var majorsCondition = "";
        for (var i = 0; i < $scope.majorsFilter.length; i++) {
            var maj = $scope.majorsFilter[i];
            if (majorsCondition === "") {
                majorsCondition = majorsCondition + " and (major='" + maj.label + "'";
            }
            else
                majorsCondition = majorsCondition + " or major='" + maj.label + "'";


        }
        var streamsCondition = "";
        for (var i = 0; i < $scope.streamsFilter.length; i++) {
            var maj = $scope.streamsFilter[i];

            if (streamsCondition === "") {
                streamsCondition = streamsCondition + " and (stream_name='" + maj.label + "'";
            }
            else
                streamsCondition = streamsCondition + " or stream_name='" + maj.label + "'";

        }
        var specCondition = "";
        for (var i = 0; i < $scope.specFilter.length; i++) {
            var maj = $scope.specFilter[i];

            if (specCondition === "") {
                specCondition = specCondition + " and (specialization='" + maj.label + "'";
            }
            else
                specCondition = specCondition + " or specialization='" + maj.label + "'";

        }
        var statesCondition = "";
        for (var i = 0; i < $scope.statesFilter.length; i++) {
            var maj = $scope.statesFilter[i];
            if (statesCondition === "") {
                statesCondition = statesCondition + " and (state='" + maj.label + "'";
            }
            else
                statesCondition = statesCondition + " or state='" + maj.label + "'";

        }
        var citiesCondition = "";
        for (var i = 0; i < $scope.citiesFilter.length; i++) {
            var maj = $scope.citiesFilter[i];
            if (citiesCondition === "") {
                citiesCondition = citiesCondition + " and (city='" + maj.label + "'";
            }
            else
                citiesCondition = citiesCondition + " or city='" + maj.label + "'";

        }
        if (streamsCondition)
            $scope.searchCondition += streamsCondition + ")";
        if (majorsCondition)
            $scope.searchCondition += majorsCondition + ")";
        if (specCondition)
            $scope.searchCondition += specCondition + ")";
        if (statesCondition)
            $scope.searchCondition += statesCondition + ")";
        if (citiesCondition)
            $scope.searchCondition += citiesCondition + ")";
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
        $scope.loading = true;
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
                    $scope.loading = false;
                    if (!$scope.$$phase)
                        $scope.$apply();

                })
                .error(function (xhr, status, error) {
                    // error handling
                    if (error !== undefined) {
                        alertify.logPosition("top center");
                        alertify.error("Application Failed.. Please Try Again");
                    }
                    $scope.loading = false;
                    if (!$scope.$$phase)
                        $scope.$apply();

                });
    };
    $scope.apply = function ($college) {
        objTransferService.setObj($college);
        $location.path("/applyToCollege");
    };
});
recomSubApp.controller('LoginController', function ($scope, alertify, $location, $window, $cookieStore, userService, CONSTANTS) {
    $scope.showHidePassword = 'password';
    if (userService.getUser())
    {
        $location.path("/home/dashboard");

    }
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
        $scope.loading = true;
        $.post(CONSTANTS.SERVICES.APIURL, $scope.user)
                .success(function (data) {
                    //This sets cookies for application
                    $cookieStore.put("recomApp", data);

                    //This adds user object in userService
                    userService.addUser(data);

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
                    $scope.loading = false;
                    if (!$scope.$$phase)
                        $scope.$apply();
                })
                .error(function (xhr, status, error) {
                    // error handling
                    if (error !== undefined) {
                        alertify.logPosition("top center");
                        alertify.error("Credentials Not Valid");


                    }
                    $scope.loading = false;
                    if (!$scope.$$phase)
                        $scope.$apply();

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
    var setObjUsingCookie = function (newObj) {

        $cookieStore.put("object", newObj);
    };
    var getObj = function () {
        //$user = $cookies.get("futuremaker",$user);
        return obj;
    };
    var getObjUsingCookie = function () {
        //$user = $cookies.get("futuremaker",$user);
        return $cookieStore.get("object");
    };
    return {
        setObj: setObj,
        setObjUsingCookie: setObjUsingCookie,
        getObjUsingCookie: getObjUsingCookie,
        getObj: getObj
    };
});
recomApp.service('utilService', ['$filter', function ($filter) {
        var formatDate = function (date) {
            return  $filter('date')(date, "dd MMM yyyy");
        };
        var datediff = function (date) {
            var d1 = new Date(date);
            var d2 = new Date();
            var timeDiff = d2.getTime() - d1.getTime();
            var DaysDiff = timeDiff / (1000 * 3600 * 24);
            if (DaysDiff < 2)
                DaysDiff = d2.getDate() - d1.getDate();
            return DaysDiff;
        }
        var datediffGreater = function (date) {
            var d1 = new Date(date);
            var d2 = new Date();
            var timeDiff = d1.getTime() - d2.getTime();
            var DaysDiff = timeDiff / (1000 * 3600 * 24);
            if (DaysDiff < 2)
                DaysDiff = d1.getDate() - d2.getDate();
            return DaysDiff;
        }
        var formatChatDate = function (date) {
            return  $filter('date')(date, "dd MMM");
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
            formatTime: formatTime,
            formatChatDate: formatChatDate,
            datediff: datediff,
            datediffGreater: datediffGreater
        };
    }]);
recomApp.constant('CONSTANTS', (function () {
    // Define your variable
    var CONSTANTS = {};
    var SERVICES = {
//         APIURL: 'http://ec2-54-169-136-45.ap-southeast-1.compute.amazonaws.com/api/fm/v0/users'
        APIURL: 'http://career-navigator.thesolutioncircle.in/api/ServiceController.php',
//        APIURL: 'http://localhost/recom_api/ServiceController.php',
//        FILEPATH: 'http://localhost/recom_api',
        FILEPATH: 'http://career-navigator.thesolutioncircle.in/api',
//        UPLOADURL: 'http://localhost/recom_api/fileUpload.php',
        UPLOADURL: 'http://career-navigator.thesolutioncircle.in/api/fileUpload.php'
//        BASE_PATH: 'http://192.168.1.115:8080/api/fm/v0/'
                // 'http://localhost:8080/api/fm/v0/' //'http://ec2-52-74-20-101.ap-southeast-1.compute.amazonaws.com/api/fm/v0/' 
    };
    var INSTAMOJO = {
        "Card Number": "4242 4242 4242 4242",
        "Exp MM/YY": "01/20",
        "CVV": "111",
        "Second Factor Authentication code": "1221"
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
        GETSTUDENTDETAILS: 'get student details',
        ADMITSTUDENT: 'admit student',
        MAKEPAYMENT: 'make payment',
        GETADMISSIONSTATUS: 'get admission status',
        GETCITIES: 'get cities',
        GETSTATES: 'get states',
        GETSTREAMID: 'get stream id',
        GETDOCCOUNT: 'get doc count',
        DELETEDOCUMENT: 'delete document',
        CHANGEPASSWORD: 'change password',
        GETPAYMENTDETAILS: 'get payment details',
        GETADMISSIONSFORCOURSE: 'get admissions for course',
        GETRESETLINK: 'get reset link',
        CONTACTUS: 'contact us'
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