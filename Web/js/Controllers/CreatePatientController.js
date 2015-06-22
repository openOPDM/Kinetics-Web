/*global define:true */
define([
	'Controllers/Constants',
	'Controllers/ControllerBase',
	'Models/CreatePatient',
	'Views/Constants',
	'Views/CreatePatientView',
	'formatter'
], function (Constants, ControllerBase, CreatePatient, ViewsConstants, CreatePatientView) {
	'use strict';

	return ControllerBase.extend({
		initialize: function () {
			ControllerBase.prototype.initialize.apply(this, arguments);
			this._checkAttribute("applicationView");
			this._checkAttribute("accountManager");
		},

		activate: function () {
			this.view = new CreatePatientView({ model: new CreatePatient() });

			// Start listening control events
			this.listenTo(this.view, {
				"create-patient": this._onCreatePatient,
				"cancel-creation": this._onCancel
			});

			// Show view
			this.get("applicationView").showView(this.view);
		},

		// Initialize menu
		initializeMenu: function () {
			this.get("applicationView").header.showMenu(ViewsConstants.HeaderMenu.Analyst);
		},

		deactivate: function () {
			this._reset();
		},

		_onCancel: function () {
			this.trigger('cancel-creation');
		},

		_onCreatePatient: function (model) {
			var that = this;
			model.attributes.sessionToken = this.get("accountManager").getSessionToken();
			model.save({}, {
				wait: true,
				error: function (model, xhr, options) {
					model.trigger("error", options.responseError);
				},
				success: function (/*model*/) {
					that.trigger("user-creation-success");
					that.get("accountManager").trigger('patient-list-updated');
				}
			});
		}
	});

});
