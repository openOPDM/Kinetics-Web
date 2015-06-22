/*global define:true */
define([
	'underscore',
	'Controllers/WelcomeController',
	'Controllers/TestingController',
	'Controllers/TestRoomController',
	'Controllers/SignUpController',
	'Controllers/ConfirmController',
	'Controllers/ResetPasswordController',
	'Controllers/TestSessionReportController',
	'Controllers/TrendReportController',
	'Controllers/ProfileController',
	'Controllers/UserListController',
	'Controllers/AnalystRoomController',
	'Controllers/CreatePatientController',
	'Controllers/AddPatientController',
	'Controllers/TestCustomFieldsController',
	'Controllers/ProjectListController',
	'Controllers/NotFoundController',
	'Controllers/ExportController',
	'Controllers/InfoController',
	'Controllers/CreateProjectController',
	'Controllers/ManageController',
	'Controllers/AddUsersController',
	'Controllers/SharePopupController'

], function (_, WelcomeController, TestingController, TestRoomController, SignUpController, ConfirmController, ResetPasswordController, TestSessionReportController, TrendReportController, ProfileController, UserListController, AnalystRoomController, CreatePatientController, AddPatientController, TestCustomFieldsController, ProjectListController, NotFoundController, ExportController, InfoController, CreateProjectController, ManageController, AddUsersController, SharePopupController) {
	'use strict';

	return {
		create: function (application, applicationView, accountManager, router) {
			var params = {
				router: router,
				applicationView: applicationView,
				accountManager: accountManager
			};

			var testingController = new TestingController(params);
			var testRoomController = new TestRoomController(_.extend(params, {
				testingController: testingController,
				globalModels: application.globalModels
			}));

			var controllers = {
				welcomeController: new WelcomeController(params),
				testingController: testingController,
				testRoomController: testRoomController,
				signUpController: new SignUpController(params),
				confirmController: new ConfirmController(params),
				resetPasswordController: new ResetPasswordController(params),
				testSessionReportController: new TestSessionReportController(params),
				trendReportController: new TrendReportController(params),
				profileController: new ProfileController(_.extend(params, { homePage: application.homePage })),
				userListController: new UserListController(_.extend(params, { globalModels: application.globalModels })),
				analystRoomController: new AnalystRoomController(params),
				createPatientController: new CreatePatientController(params),
				addPatientController: new AddPatientController(params),
				testCustomFieldsController: new TestCustomFieldsController(params),
				projectListController: new ProjectListController(params),
				notFoundController: new NotFoundController(params),
				exportController: new ExportController(params),
				infoController: new InfoController(params),
				createProjectController: new CreateProjectController(params),
				manageController: new ManageController(params),
				addUsersController: new AddUsersController(params),
                SharePopupController: new SharePopupController(params)
			};

			_.forEach(controllers, function (controller, name) {
				controller.set("name", name);
			});

			return controllers;
		}
	};
});
