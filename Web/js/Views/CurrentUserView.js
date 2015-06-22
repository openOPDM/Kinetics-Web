/*global define:true */
define([
	'underscore',
	'backbone',
	'Models/Constants',
	'Utils/SimpleRequest',
	'text!Templates/CurrentUser.html'
], function (_, Backbone, ModelsConstants, SimpleRequest, templateHtml) {
	'use strict';

	return Backbone.View.extend({
		tagName: "div",
		className: "username",

		template: _.template(templateHtml),

		events: {
			"change .id-username": "_onChangePatient"
		},

		_analystMode: false,
		_patients: null,
		_viewedPatient: null,

		initialize: function () {
			this._checkAnalystMode();

			this.listenTo(this.model, {
				"change:currentUser": this._currentUserSwitched,
				"patient-list-updated": this._updatePatients,
				"viewed-user-updated": this._updateViewedUser
			});

			this._currentUserSwitched(this.model, this.model.get("currentUser"));
		},

		_checkAnalystMode: function () {
			this._analystMode = this.model.isUserSignedIn() && this.model.currentUser().get("isAnalyst");
		},

		render: function () {
			if (this._patients) {
				this._patients.user.sort(function (a, b) {
					if (a.secondName > b.secondName) {
						return 1;
					}
					if (a.secondName < b.secondName) {
						return -1;
					}
					return 0;
				});
			}

			this.$el.html(this.template({
				model: this.model,
				analystMode: this._analystMode,
				patients: this._patients
			}));
			if (this.model.viewedUser) {
				this.$('select option[value="' + this.model.viewedUser + '"]').attr('selected', true);
			} else {
				this.$('select option:first').attr('selected', true);
			}


			return this;
		},

		_currentUserSwitched: function (model, currentUser) {
			var previous = model.previous("currentUser");
			if (previous) {
				this.stopListening(previous);
			}

			if (currentUser) {
				this.listenTo(currentUser, "change", this._currentUserChanged);
				this._currentUserChanged(currentUser);
				this.$el.show();
			} else {
				this.$el.hide().find('>*').html('');
			}
		},

		_updatePatients: function (patients) {
			var that = this;
			if (!this._analystMode) {
				this._patients = null;
				return;
			}

			if (patients) {
				this._patients = {user: []};
				_.each(patients, function (patient) {
					that._patients.user.push({
						id: patient.get('id'),
						firstName: patient.get('firstName'),
						secondName: patient.get('secondName')
					});
				});
				this.render();
			} else {

				SimpleRequest({
					target: 'AccountManager',
					method: 'getPatients',
					options: {
						sessionToken: that.model.getSessionToken()
					},
					model: this.model,
					success: function (data) {
						that._patients = data;
						that.render();
					}
				});
			}


		},

		_updateViewedUser: function (id) {
			if (this._analystMode) {
				this.model.viewedUser = id;
				this.$('select option[value="' + id + '"]').attr('selected', true);
			}
		},

		_currentUserChanged: function (currentUser) {
			this.model.viewedUser = null; //this.model.currentUser().get('id');
			this._checkAnalystMode();
			this._updatePatients();
			this.render();
		},

		_onChangePatient: function () {
			var uId = parseInt(this.$('.id-username').val(), 10);
			if (uId === this.model.currentUser().get('id')) {
				uId = null;
				console.log('null', uId, this.model.currentUser().get('id'));
			}
			this.model.viewedUser = uId;
			this.model.trigger('viewed-patient-changed', parseInt(this.$('.id-username').val(), 10));
		},

		remove: function () {

		}
	});
});
