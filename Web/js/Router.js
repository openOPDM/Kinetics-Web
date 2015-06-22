/*global define:true */
define([
	'underscore',
	'backbone',
	'Controllers/ControllersHashFactory',
	'Views/Constants',
	'Models/Constants',
	'Utils/ConsoleStub',
	'formatter'
], function (_, Backbone, ControllersHashFactory, ViewsConstants, ModelsConstants) {
	'use strict';

	return Backbone.Router.extend({
		_homePage: null,

		initialize: function (options, application) {
			this.application = application;
			this._initializeApplicationView();
			this._initializeControllers();
			this._bindListeners();
		},

		_initializeApplicationView: function () {
		},

		_initializeControllers: function () {
			this.controllers = ControllersHashFactory.create(
				this.application,
				this.application.applicationView,
				this.application.accountManager,
				this);
		},

		// TODO:  Current routing solution should be reworked and generalized and this method should be refactored.
		_bindListeners: function () {
			var that = this;
			// Bind application view listeners
			this.listenTo(this.application.applicationView.header, {
				"back-to-test-room test-room": function () {
					var uId = that.application.accountManager.viewedUser;
					if (uId) {
						this.navigate("test-room/" + uId, { trigger: true });
					} else {
						this.navigate("test-room", { trigger: true });
					}
				},
				"back-to-welcome": function () {
					this.navigate("welcome", { trigger: true });
				},
				"trend-report": function () {
					var uId = that.application.accountManager.viewedUser;
					if (uId) {
						this.navigate("trend-report/" + uId, { trigger: true });
					} else {
						this.navigate("trend-report", { trigger: true });
					}
				},
				"user-list": function () {
					this.navigate("user-list", { trigger: true });
				},
				"custom-fields": function () {
					this.navigate("test-custom-fields", { trigger: true });
				},
				"analyst-room": function () {
					this.navigate("analyst-room", { trigger: true });
				},
				"project-list": function () {
					this.navigate("project-list", { trigger: true });
				},
				"extra": function () {
					this.navigate("extra", { trigger: true });
				},
				"profile": function () {
					var uId = that.application.accountManager.viewedUser;
					if (uId) {
						this.navigate("profile/" + uId, { trigger: true });
					} else {
						this.navigate("profile", { trigger: true });
					}
				}
			});

			// Bind account manager listeners
			this.listenTo(this.application.accountManager, {
				"sign-out": function (options) {
					//if (!/welcome/.test(Backbone.history.fragment)) {
					if (options && options.unauthenticated) {
						this.navigate("welcome/back/" + Backbone.history.fragment.replace(/welcome\/(back\/)?/, ''), { trigger: true });
					} else {
						this.navigate("welcome", { trigger: true });
					}
					//}
				},
				"project-changed-success": function () {
					this.navigate(this._homePage, { trigger: true });
				}
			});

			// Bind controllers' listeners
			this.listenTo(this.controllers.welcomeController, {
				"user-already-sign-in": function () {
					this.navigate(this._homePage, { trigger: true });
				},
				"sign-up": function (token) {
					if (token) {
						//this.moveTo('sign-up', 'signUp', {shareToken: token});
						this.navigate("sign-up/" + token, { trigger: true });
					} else {
						this.navigate("sign-up", { trigger: true });
					}
				},
				"authenticated": function (options) {
					this._checkCurrentUserRole();
					var location = options.back ? options.back : this._homePage;
					this.navigate(location, { trigger: true });
				},
				"user-is-not-activated": function (email, project) {
					this.moveTo("confirm", "confirm", { email: email, project: project });
				},
				"forgot-password": function (email) {
					this.moveTo("reset-password", "resetPassword", { email: email});
				}
			});

			this.listenTo(this.controllers.projectListController, {
				"create": function () {
					this.navigate("create-project", { trigger: true });
				},
				'manage-project': function (project) {
					this.navigate("manage/" + project, { trigger: true });
				}
			});

			this.listenTo(this.controllers.createProjectController, {
				"cancelCreate": function () {
					this.navigate("project-list", { trigger: true });
				},
				"project-creation-success": function (id) {
					this.moveTo("manage/" + id, 'manage', { manage: id, newProject: !!id });
				}
			});

			this.listenTo(this.controllers.exportController, {
				"cancelCreate": function () {
					this.navigate("project-list", { trigger: true });
				}
			});

            this.listenTo(this.controllers.infoController, {
                "wrongPage": function () {
                    this.navigate("not-found", { trigger: true });
                }
            });

			this.listenTo(this.controllers.signUpController, {
				"sign-up-success": function (email, invited, project, siteAdmin, fromProject, sharingToken) {
					switch (true) {
					case invited:
						this.navigate("welcome", { trigger: true });
						break;
					case siteAdmin:
						if (fromProject) {
							this.navigate("manage/" + fromProject, { trigger: true });
						} else {
							this.navigate("user-list", { trigger: true });
						}
						break;
					default:
						this.moveTo("confirm", "confirm", { email: email, project: project, sharingToken: sharingToken });
					}

				},
				'shared-login': function (shared) {
					this.navigate('shared/' + $.base64.encode(shared.userId) + '/' + $.base64.encode(shared.project), { trigger: true });
				},
				'shared-fail': function (shared) {
					this.navigate(this._homePage, { trigger: true });
				},
				'invalid-share-params': function () {
					this.navigate('not-found', { trigger: true });
				},
				'cancel-creation': function (project) {
					if (project) {
						this.navigate('manage/' + project, { trigger: true });
					} else {
						this.navigate("user-list", { trigger: true });
					}
				},
				"authenticated": function (options) {
					var location = options.back ? options.back : "test-room";
					this.navigate(location, { trigger: true });
				}
			});

			this.listenTo(this.controllers.confirmController, {
				"invalid-parameters": function () {
					this.navigate("welcome", { trigger: true });
				},
				"email-confirmed": function (email, token) {
					if (token) {
						this.moveTo("welcome/back/shared-test/" + token, "welcome", { email: email, backToLocation: 'shared-test/' + token });
					} else {
						this.moveTo("welcome", "welcome", { email: email});
					}

				}
			});

			this.listenTo(this.controllers.resetPasswordController, {
				"password-reset": function (email) {
					this.moveTo("welcome", "welcome", { email: email });
				}
			});

			this.listenTo(this.controllers.testingController, {
				"submitted cancel": function (patientId) {
					if (patientId) {
						this.navigate("test-room/" + patientId, { trigger: true });
					} else {
						this.navigate("test-room", { trigger: true });
					}
				},
				"sign-up": function () {
					this.navigate("sign-up", { trigger: true });
				},

				"user-test-room": function () {
					this.navigate('test-room', {trigger: true});
				},

				"error": this._errorHandler
			});

			this.listenTo(this.controllers.testRoomController, {
				"start-test": function (patientId) {
					if (patientId) {
						this.navigate("testing/" + patientId, { trigger: true });
					} else {
						this.navigate("testing", { trigger: true });
					}
				},
				"error": this._errorHandler,
				"invalid-parameters": function () {
					this.navigate(this._homePage, { trigger: true });
				},
				"detail": function (testSessionId) {
					this.navigate("report/" + testSessionId, { trigger: true });
				},
				"trend-report": function (userId, project) {
					switch (true) {
					case !!userId && !!project:
						this.navigate("shared-report/" + userId + '/' + project, { trigger: true });
						break;
					case !!userId:
						this.navigate("trend-report/" + userId, { trigger: true });
						break;
					default:
						this.navigate("trend-report", { trigger: true });
					}
				},
				"missing-user-id": function () {
					this.navigate("project-list", { trigger: true });
				},
				"parsing-error": function () {
					this.navigate("test-room", { trigger: true });
				},
				"change-patient": function (userId) {
					if (userId) {
						this.navigate("test-room/" + userId, { trigger: true });
					} else {
						this.navigate("test-room", { trigger: true });
					}
				},

				'show-shared': function (testId) {
					that.controllers.SharePopupController.activate(testId);
				},

				'share-all': function () {
					//this.moveTo('profile', 'profile', {sharing: true});
					that.controllers.SharePopupController.activate({});
				},

				'share-test': function (token, id) {
					that.controllers.SharePopupController.activate({token: token, id: id});
				}

			});

			this.listenTo(this.controllers.userListController, {
				"error": this._errorHandler,
				"detail": function (userId) {
					if (userId) {
						this.navigate("test-room/" + userId, { trigger: true });
					} else {
						this.navigate("test-room", { trigger: true });
					}

				},
				"change-url-params: search-text": function (searchText) {
					if (searchText) {
						this.navigate("user-list/find/" + searchText);
					} else {
						this.navigate("user-list");
					}


				},
				"test-custom-fields": function () {
					this.navigate("test-custom-fields", { trigger: true });
				},
				'create-user': function () {
					this.navigate('create-user', {trigger: true, createUser: true});
				}
			});

			this.listenTo(this.controllers.manageController, {
				"error": this._errorHandler,
				"detail": function (userId) {
					if (userId) {
						this.navigate("test-room/" + userId, { trigger: true });
					}

				},
				'invalid-project-code': function () {
					this.navigate("project-list", { trigger: true });
				},
				'create-user': function (project) {
					this.moveTo('create-user', 'signUp', {project: project});
				},
				'project-switched': function (id) {
					this.navigate("manage/" + id, { trigger: true });
				},
				'add-users': function (projectUsers, project, users) {
					this.moveTo('add-users', 'addUsers', {
						users: users,
						project: project,
						projectUsers: projectUsers
					});
				}
			});


			this.listenTo(this.controllers.addUsersController, {
				'not-enough-data': function () {
					this.navigate(this._homePage, { trigger: true });
				},
				'cancel': function (project) {
					this.navigate('manage/' + project, { trigger: true });
				},

				"error": this._errorHandler

			});

			this.listenTo(this.controllers.analystRoomController, {
				"error": this._errorHandler,
				"detail": function (userId) {
					this.navigate("test-room/" + userId, { trigger: true });
				},
				"add-patient": function () {
					this.navigate('add-patient', { trigger: true });
				},
				"create-patient": function () {
					this.navigate('create-patient', { trigger: true });
				},
				"invalid-parameters not-supported": function () {
					this.navigate(this._homePage, { trigger: true });
				}
			});

			this.listenTo(this.controllers.testCustomFieldsController, {
				"error": this._errorHandler,
				"back-admin-room": function () {
					this.navigate(this._homePage, { trigger: true });
				}
			});

			this.listenTo(this.controllers.createPatientController, {
				"error": this._errorHandler,
				"user-creation-success": function () {
					this.navigate(this._homePage, { trigger: true });
				},
				"cancel-creation": function () {
					this.navigate(this._homePage, { trigger: true });
				},
				"invalid-parameters not-supported": function () {
					this.navigate(this._homePage, { trigger: true });
				}

			});

			this.listenTo(this.controllers.addPatientController, {
				"create-patient-instead": function () {
					this.navigate("create-patient", { trigger: true });
				},
				"change-url-params: search-text": function (searchText) {
					if (searchText) {
						this.navigate("add-patient/find/" + searchText);
					} else {
						this.navigate("add-patient");
					}
				},
				"error": this._errorHandler
			});

			this.listenTo(this.controllers.testSessionReportController, {
				"error": this._errorHandler,
				"invalid-parameters not-supported": function () {
					this.navigate("test-room", { trigger: true });
				},
				"user-test-room": function (userId) {
					this.navigate("test-room/" + userId, { trigger: true });
				}
			});

			this.listenTo(this.controllers.trendReportController, {
				"error": this._errorHandler,
				"invalid-parameters not-supported": function () {
					this.navigate(this._homePage, { trigger: true });
				},
				"change-patient": function (userId) {
					if (userId) {
						this.navigate("trend-report/" + userId, { trigger: true });
					} else {
						this.navigate("trend-report", { trigger: true });
					}
				},
				"back-shared": function (userId, project) {
					this.navigate("shared/" + userId + '/' + project, { trigger: true });
				},
				"parsing-error": function () {
					this.navigate("test-room", { trigger: true });
				}
			});

			this.listenTo(this.controllers.profileController, {
				"error": this._errorHandler,
				"invalid-parameters not-supported": function () {
					this.navigate(this._homePage, { trigger: true });
				},
				"cancel": function () {
					this.navigate(this._homePage, { trigger: true });
				},
				"destroy": function () {
					this.navigate("welcome", { trigger: true });
				},
				"change-patient": function (userId) {
					if (userId) {
						this.navigate("profile/" + userId, { trigger: true });
					} else {
						this.navigate("profile", { trigger: true });
					}
				},

				'share-all': function () {
					that.controllers.SharePopupController.activate({});
				},

				'share-test': function (token) {
					that.controllers.SharePopupController.activate({token: token});
				}
			});

			this.listenTo(this.controllers.notFoundController, {
				"error": this._errorHandler,
				removeSlash: function (route) {
					this.navigate(route.replace(/\/$/, ''), {trigger: true});
				}
			});

			this.activeController = null;

			// Route listener
			this.on("route", this._onRoute);
		},

		_checkCurrentUserRole: function () {
			var header = this.application.applicationView.header;
			var currentUser = this.application.accountManager.currentUser();
			if (currentUser) {
				var role = currentUser.get("role");
				switch (role) {
				case ModelsConstants.UserRole.Analyst:
					header.defaultMenu(ViewsConstants.HeaderMenu.Analyst);
					this._homePage = "analyst-room";
					this.application.homePage.title = "Analyst room";
					break;
				case ModelsConstants.UserRole.SiteAdmin:
					header.defaultMenu(ViewsConstants.HeaderMenu.SiteAdmin);
					this._homePage = 'project-list';
					this.application.homePage.title = "Project list";
					break;
				case ModelsConstants.UserRole.Patient:
					header.defaultMenu(ViewsConstants.HeaderMenu.Patient);
					this._homePage = "test-room";
					this.application.homePage.title = "Test room";
					break;
				}
			}
		},

		_errorHandler: function (error) {
			//if (this.activeController) this.activeController.routeOut();
			console.log("Unexpected error. Error code {0}. {1}".format(error.code, error.description));
		},

		routes: {
			"": "welcome",
			"add-patient": "addPatient",
			"add-patient/:action/:command": "addPatient",
			"add-patient/:action/:command/*searchText": "addPatient",
			"add-patient/find/*searchText": "addPatient",
			"add-users": "addUsers",
			"analyst-room": "analystRoom",
			"confirm": "confirm",
			"confirm/:email/:code": "confirm",
			"confirm/:email/:code/:token": "confirm",
			"confirmPatientProfile": "signUp",
			"confirmPatientProfile/*id": "signUp",
			"create-patient": "createPatient",
			"create-project": "createProject",
			"create-user": "signUp",
			"extra": "export",
			"info/:page": "info",
			"manage/:id": "manage",
			"profile": "profile",
			"profile/:userId": "profile",
			"project-list": "projectList",
			"register-shared/:email/:shared/:project": "signUp",
			"report/:testResultId": "testSessionReport",
			"report/:testResultId/:action/:command": "testSessionReport",
			"reset-password": "resetPassword",
			"register-shared/:token/:user/:project": "signUp",
			"set-password/:email/:token": "resetPassword",
			"shared/:userId/:projectId": "testRoom",
			"shared-report/:userId/:project": "trendReport",
			"shared-test/:token": "testSessionReport",
			"sign-up": "signUp",
			"sign-up/:token": "signUp",
			"test-custom-fields": "testCustomFields",
			"test-room": "testRoom",
			"test-room/:userId": "testRoom",
			"testing": "testing",
			"testing/:action/:command": "testing",
			"testing/:id": "testing",
			"testing/:try": "testing",
			"trend-report": "trendReport",
			"trend-report/:userId": "trendReport",
			"user-list": "userList",
			"user-list/:action/:command": "userList",
			"user-list/:action/:command/*searchText": "userList",
			"user-list/find/*searchText": "userList",
			"welcome": "welcome",
			"welcome/back/*backToAction": "welcome",
			"*route": "notFound"

		},

		_getControllerByRoute: function (route) {
			return this.controllers[route + "Controller"];
		},

		moveTo: function (location, route, params) {
			this.navigate(location);

			var toController = this._getControllerByRoute(route);
			this._switchRoute(route, toController, [ params ]);
		},

		_onRoute: function (route, params) {
			var toController = this._getControllerByRoute(this._checkPermission(route) ? route : 'notFound');
			if (toController.parseParams) {
				params = [ toController.parseParams(params) ];
			}
			this._switchRoute(route, toController, params);
		},

		_switchRoute: function (route, toController, params) {
			this._checkCurrentUserRole();
			var fromController = this.activeController;

			console.log("Route '{0}' params: '{1}' from {2} to {3}".format(route, params,
				fromController ? fromController.get("name") : "begin state",
				toController ? toController.get("name") : "nothing"));

			//if (fromController != toController) {
			this.activeController = toController;
			if (fromController) {
				fromController.routeOut(route, params);
			}
			if (toController) {
				toController.routeIn(route, params);
			}
		},

		roleList: [
			'guest',
			ModelsConstants.UserRole.Patient,
			ModelsConstants.UserRole.Analyst,
			ModelsConstants.UserRole.SiteAdmin
		],

		permissionHash: [ //no need to mention notFound
			['signUp', 'testing', 'welcome', 'confirm', 'resetPassword', 'testSessionReport', 'resetPassword', 'testRoom', 'info'],
			['profile', 'testing', 'testRoom', 'testSessionReport', 'trendReport', 'welcome', 'info'],
			['addPatient', 'analystRoom', 'createPatient', 'profile', 'testing', 'testRoom', 'testSessionReport', 'trendReport', 'welcome', 'info'],
			['addUsers', 'createProject', 'export', 'manage', 'profile', 'projectList', 'signUp', 'testCustomFields', 'testRoom', 'userList', 'welcome', 'info']
		],

		_checkPermission: function (route) {
			var role = this.application.accountManager.currentUser() ?
					this.application.accountManager.currentUser().get('role') : null,
				roleIndex = _.indexOf(this.roleList, role);
			roleIndex = roleIndex >= 0 ? roleIndex : 0;

			return _.indexOf(this.permissionHash[roleIndex], route) >= 0;
		}
	});

});