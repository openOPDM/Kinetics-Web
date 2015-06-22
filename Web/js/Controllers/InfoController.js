/*global define: true */
define([
    'underscore',
	'Controllers/Constants',
	'Controllers/ControllerBase',
	'DataLayer/ErrorConstants',
	'Views/Constants',
	'Models/Constants',
	'Views/InfoView',
	'formatter'
], function (_, Constants, ControllerBase, ErrorConstants, ViewsConstants, ModelsConstants, InfoView) {
	'use strict';
	return ControllerBase.extend({
		initialize: function () {
			ControllerBase.prototype.initialize.apply(this, arguments);
			this._checkAttribute("applicationView");
            this.validPages = ["privacy-policy", "terms-of-service", "eula"];
		},

		parseParams: function (params) {
			var result = {};
			if (params.length > 0) {
				result.page = params[0];
			}
			return result;
		},
		activate: function (params) {

            if (_.indexOf(this.validPages, params.page) >= 0) {
                var accountManager = this.get("accountManager");

                this.view = new InfoView({
                    page: params.page
                });

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
            } else {
                this.trigger("wrongPage");
            }
		},

		deactivate: function () {
			this._reset();
		}

	});
});
