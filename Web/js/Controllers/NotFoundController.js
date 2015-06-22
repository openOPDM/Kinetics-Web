/*global define: true */
define([
	'Controllers/Constants',
	'Controllers/ControllerBase',
	'DataLayer/ErrorConstants',
	'Views/Constants',
	'Models/Constants',
	'Views/NotFoundView',
	'formatter'
], function (Constants, ControllerBase, ErrorConstants, ViewsConstants, ModelsConstants, NotFoundView) {
	'use strict';
	return ControllerBase.extend({
		initialize: function () {
			ControllerBase.prototype.initialize.apply(this, arguments);
			this._checkAttribute("applicationView");

		},

		parseParams: function (params) {
			var result = {};
			if (params.length > 0) {
				result.route = params[0];
			}
			return result;
		},
		activate: function (params) {

			if (params.route && /\/$/.test(params.route)) {
				this.trigger('removeSlash', params.route);
				return;
			}

			var accountManager = this.get("accountManager");

			this.view = new NotFoundView();

			this.listenTo(this.view, {

			});

			// Initialize menu
			var applicationView = this.get("applicationView");

			//get user role and show proper menu
			var role = this.get("accountManager").get("currentUser") && this.get("accountManager").get("currentUser").get("role");
			switch (role) {
			case ModelsConstants.UserRole.Patient:
				applicationView.header.showMenu(ViewsConstants.HeaderMenu.Patient);
				break;
			case ModelsConstants.UserRole.Analyst:
				applicationView.header.showMenu(ViewsConstants.HeaderMenu.Analyst);
				break;
			case ModelsConstants.UserRole.SiteAdmin:
				applicationView.header.showMenu(ViewsConstants.HeaderMenu.SiteAdmin);
				break;
			default:
				applicationView.header.showMenu(ViewsConstants.HeaderMenu.Authorization);
			}

			// Show view
			applicationView.showView(this.view);
		},

		deactivate: function () {
			this._reset();
		}

	});
});
