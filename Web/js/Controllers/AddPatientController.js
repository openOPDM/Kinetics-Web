/*global define:true */
define([
	'underscore',
	'Controllers/Constants',
	'Controllers/ControllerBase',
	'Models/AddPatient',
	'Views/Constants',
	'Views/AddPatientView',
	'Models/PatientProfileCollection',
	'text!Templates/PatientAddedMessage.html',
	'Utils/SimpleRequest',
	'Utils/Dialog',
	'formatter'
], function (_, Constants, ControllerBase, CreatePatient, ViewsConstants, AddPatientView, PatientProfileCollection, PatientAddedMessage, SimpleRequest, Dialog) {
	'use strict';

	return ControllerBase.extend({

		_PatientAddedMessage: _.template(PatientAddedMessage),

		initialize: function () {
			ControllerBase.prototype.initialize.apply(this, arguments);
			this._checkAttribute("accountManager");
			this._applicationView = this._checkAttribute("applicationView");
			this._globalModels = this._checkAttribute("globalModels");
			_.bindAll(this, "_fetchData");
			this.dialog = new Dialog();
		},

		activate: function (params) {
			this.view = new AddPatientView({ model: new CreatePatient() });

			this._checkSearchText(params.searchText);

			this._initializeRowCollection();
			this._initializeView();
			this._fetchData();

			this.listenTo(this.model, {
				'add-patient': this._onAddPatient
			});
			this.listenTo(this.view, {
				'create-patient-instead': this._onCreatePatient
			});
		},

		_onCreatePatient: function () {
			this.trigger('create-patient-instead');
		},

		parseParams: function (params) {
			var result = {};
			if (params.length === 1) {
				result.searchText = params[0];
			}
			if (params.length === 2 && params[0] === Constants.ActionMarker) {
				result.action = params[1];
			}
			if (params.length === 3) {
				result.searchText = params[2];
			}
			return result;
		},

		_initializeView: function () {
			this.view = new AddPatientView({ model: this.model, searchText: this._globalModels.searchText });

			this.listenTo(this.view, {
				'search': this._onSearch
			});

			this._applicationView.showView(this.view);
		},

		_initializeRowCollection: function () {
			this.model = new PatientProfileCollection();
		},

		_checkSearchText: function (searchText) {
			if (searchText !== undefined) {
				if (searchText !== this._globalModels.searchText) {
					// Reset cache
					searchText = this._prepareSearchText(searchText);
					this._globalModels.searchText = searchText;
				}
			} else if (this._globalModels.searchText) {
				// Add search text to url
				this.trigger("change-url-params: search-text", this._globalModels.searchText);
			}
		},

		initializeMenu: function () {
			this.get("applicationView").header.showMenu(ViewsConstants.HeaderMenu.Analyst);
		},

		_onAddPatient: function (model) {
			var that = this;
			SimpleRequest({
				target: 'AccountManager',
				method: 'assignPatient',
				options: {
					sessionToken: this.get("accountManager").getSessionToken()
				},
				model: model,
				success: function (data) {
					that._fetchData();
					that.view.trigger('reset');
					that.dialog.show('alert', that._PatientAddedMessage());
					that.get("accountManager").trigger('patient-list-updated');
				}
			});
		},

		_onSearch: function (searchData) {
			var searchText = '', searchBy;
			switch (true) {
			case !!$.trim(searchData.name):
				searchText = $.trim(searchData.name);
				searchBy = 'name';
				break;
			case !!$.trim(searchData.email):
				searchText = $.trim(searchData.email);
				searchBy = 'email';
				break;
			case !!$.trim(searchData.uid):
				searchText = $.trim(searchData.uid);
				searchBy = 'uid';
				break;
			default:
				searchBy = 'empty';
				searchText = ' ';
			}

			if (searchText) {
				this._globalModels.searchText = this._prepareSearchText(searchText);
				this.trigger("change-url-params: search-text", this._globalModels.searchText);
				this._fetchData(searchBy);
			}

		},

		_prepareSearchText: function (searchText) {
			return _.escape($.trim(searchText));
		},

		_fetchData: function (searchBy) {
			var options = this._getFetchOptions(true, null, this._fetchData);
			this.model.fetch(_.extend(options, { search: this._globalModels.searchText, searchBy: searchBy }));
		},

		deactivate: function () {
			this._reset();
			this._globalModels.searchText = undefined;
		}

	});

});
