/*global define:true */
define([
	'underscore',
	'backbone',
	'Router',
	'Views/ApplicationView',
	'Views/CurrentUserView',
	'Views/CurrentProjectView',
	'Models/AccountManager'
], function (_, Backbone, Router, ApplicationView, CurrentUserView, CurrentProjectView, AccountManager) {
	'use strict';

	var Application = function () {
		this.homePage = {};
		this.globalModels = {};

		this.accountManager = new AccountManager();
		this.applicationView = new ApplicationView({ model: { accountManager: this.accountManager } });

		var currentUserView = new CurrentUserView({ model: this.accountManager });
		this.applicationView.showView(currentUserView);

		var currentProjectView = new CurrentProjectView({ model: this.accountManager });
		this.applicationView.showView(currentProjectView);

		this.router = new Router(null, this);
		Backbone.history.start();
	};

	_.extend(Application.prototype, {});

	return Application;
});
