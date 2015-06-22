/*global define: true */
define([
	'underscore',
	'Controllers/Constants',
	'Controllers/ControllerBase',
	'DataLayer/Constants',
	'DataLayer/ErrorConstants',
	'Views/Constants',
	'Views/SiteAdminExportView',
	'Models/Extra',
	'formatter'
], function (_, Constants, ControllerBase, DataConstants, ErrorConstants, ViewsConstants, SiteAdminExportView, Extra) {
	'use strict';
	return ControllerBase.extend({

		_flotOptions: {

		},

		initialize: function () {
			ControllerBase.prototype.initialize.apply(this, arguments);
			this._checkAttribute("applicationView");
			this._checkAttribute("accountManager");

			this._applicationView = this._checkAttribute("applicationView");
			this._globalModels = this._checkAttribute("globalModels");
		},

		activate: function (params) {
			var that = this;
			this.model = new Extra();

			this.model.getAuditEvents({
				accountManager: this.get('accountManager'),
				success: function (model, data, options) {
					that.view = new SiteAdminExportView({
						model: that.model,
						eventList: data
					});
					that.listenTo(that.view, {
						'export': function (model) {
							model.export(that.get("accountManager"));
						},
						"cancel": function (model) {
							model.trigger('cancelExport');
							that.trigger('cancelCreate');
						},
						'analytics': function (model) {
							model.getAuditData(that.get("accountManager"));
						}
					});

					that.get("applicationView").showView(that.view);
					that._applicationView.header.showMenu(ViewsConstants.HeaderMenu.SiteAdmin, 'export');
				}
			});


		},

		_onError: function (error, options) {

		},

		deactivate: function () {
			this._reset();
		}

	});
});
