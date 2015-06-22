/*global define:true */
define([
	'jQuery',
	'underscore',
	'Controllers/Constants',
	'Controllers/ControllerBase',
	'Models/Constants',
	'Views/Constants',
	'Views/AnalystRoomView',
	'Models/AnalystPatientsCollection',
	'Utils/SimpleRequest',
	'formatter'
], function ($, _, Constants, ControllerBase, ModelsConstants, ViewsConstants, AnalystRoomView, AnalystPatientsCollection, SimpleRequest) {
	'use strict';

	return ControllerBase.extend({
		initialize: function () {
			ControllerBase.prototype.initialize.apply(this, arguments);
			this._checkAttribute("applicationView");
			this._checkAttribute("accountManager");

			this._applicationView = this._checkAttribute("applicationView");
			this._globalModels = this._checkAttribute("globalModels");
			_.bindAll(this, "_fetchData");
		},

		parseParams: function (params) {
			var result = {};
			if (params.length > 0) {
				result.email = params[0];
			}
			return result;
		},

		_getData: function () {
			this._initializeRowCollection();
			this._fetchData();
		},
		_setListeners: function () {
			this.listenTo(this.model, {
				"detail": this._onDetail,
				"unassign": this._onUnassign,
				"addExisting": this._onClickAddExisting,
				"createNew": this._onClickCreateNew
			});

			this.listenTo(this.get('accountManager'), {
				'project-changed-success': this._refreshView
			});
		},

		activate: function () {
			this._getData();
			this._initializeView();
			this._setListeners();

			// Initialize menu
			this._applicationView.header.showMenu(ViewsConstants.HeaderMenu.Analyst);

		},

		_refreshView: function () {
			this._getData();
			this._updateView();
			this._setListeners();
		},

		_onUnassign: function (model) {
			var that = this;
			SimpleRequest({
				target: 'AccountManager',
				method: 'unassignPatient',
				options: {
					sessionToken: this.get("accountManager").getSessionToken()
				},
				model: model,
				success: function (data) {
					that._fetchData();
					that.view.trigger('reset');
					that.get("accountManager").trigger('patient-list-updated');
				}
			});

		},

		_onClickAddExisting: function () {
			this.trigger("add-patient");
		},

		_onClickCreateNew: function () {
			this.trigger("create-patient");
		},

		_initializeView: function () {
			this.view = new AnalystRoomView({ model: this.model });

			// Show view
			this._applicationView.showView(this.view);
		},

		_updateView: function () {
			this.view = new AnalystRoomView({ model: this.model });

			// Show view
			this._applicationView.updateView(this.view);
		},

		_fetchData: function () {
			var options = this._getFetchOptions(true, this._patientsFetched, this._fetchData, this);
			this.model.fetch(options);
		},

		_patientsFetched: function () {
			this.get("accountManager").trigger('patient-list-updated', this.model.models);
		},

		_initializeRowCollection: function () {
			this.model = new AnalystPatientsCollection();
		},

		initializeMenu: function () {
			// Initialize menu
			this.get("applicationView").header.showMenu(ViewsConstants.HeaderMenu.Default, "analystRoom");
		},

		deactivate: function () {
			this._reset();
		},

		_onDetail: function (model) {
			this.trigger("detail", model.id);
			this.get("accountManager").trigger('viewed-user-updated', model.id);
		}

	});

});

