/*global define:true */
define([
	'underscore',
	'backbone',
	'Controllers/Constants',
	'formatter'
], function (_, Backbone, Constants) {
	'use strict';

	return Backbone.Model.extend({
		defaults: {
			"state": Constants.ControllerState.Deactivated
		},

		initialize: function () {
			this._checkAttribute("applicationView");
			var router = this._checkAttribute("router");
		},

		_checkAttribute: function (attribute) {
			var value = this.get(attribute);
			if (value == null) {
				throw new Error("A '{0}' attribute not set.".format(attribute));
			}
			return value;
		},

		routeOut: function (/*route, params*/) {
			if (this.get("state") == Constants.ControllerState.Activated) {
				this.set("state", Constants.ControllerState.Deactivated);
				if (this.deactivate) {
					this.deactivate();
				}
			}
		},

		routeIn: function (route, params) {
			switch (this.get("state")) {
			case Constants.ControllerState.Deactivated:
				if (this.activate) {
					this.set("state", Constants.ControllerState.Activated);
					this.activate.apply(this, params);
				} else {
					throw new Error("A 'activate' method should be overridden in child class.");
				}
				if (this.initializeMenu) {
					this.initializeMenu();
				}
				break;

			case Constants.ControllerState.Sleep:
				if (false) {
					//todo fix resuming with data
					//seems to be completely broken at the moment, at least in the profile
					this._resume();
				} else {
					// There is no resume command, then controller should be deactivated first
					this.set("state", Constants.ControllerState.Deactivated);
					if (this.deactivate) {
						this.deactivate();
					}

					this.set("state", Constants.ControllerState.Activated);
					this.activate.apply(this, params);
				}
				if (this.initializeMenu) {
					this.initializeMenu();
				}
				break;
			}
		},

		_sleep: function (continueAction) {
			this.set("state", Constants.ControllerState.Sleep);
			this._continueAction = continueAction;
			if (this.view) {
				if (!this.view.hide) {
					throw new Error(("Controller '{0}':  There is no 'hide' method in current view." +
						"But controller have to sleep. View should implement 'show'/'hide' method pair in this case.")
						.format(this.get("name")));
				}
				this.view.hide();
			}
		},

		_resume: function () {
			this.set("state", Constants.ControllerState.Activated);
			if (this.view) {
				if (!this.view.show) {
					throw new Error(("Controller '{0}':  There is no 'show' method in current view." +
						"But controller have to resume. View should implement 'show'/'hide' method pair in this case.")
						.format(this.get("name")));
				}
				this.view.show();
			}
			if (this._continueAction) {
				this._continueAction();
			}
		},

		_reset: function (options) {
			options = options || {};
			_.defaults(options, {
				deleteModel: true
			});

			this.stopListening();

			if (options.deleteModel) {
				if (this.model) {
					if (this.model.dispose) {
						this.model.dispose();
					}
					delete this.model;
				}
				// Remove models collection if it defined
				if (this.models) {
					_.forEach(this.models, function (model, key, collection) {
						if (model.dispose) {
							model.dispose();
						}
						delete collection[key];
					});
				}
			}

			if (this.view) {
				this.view.remove();
				delete this.view;
			}
		},

		// Generate options for fetching some data from server.
		// NOTE:  This method should generalize building of options object in all inherited controllers.
		// TODO:  Refactor inherited controllers to use this method.
		_getFetchOptions: function (withAccountManager, success, wakeUp, controller) {
			var self = this;
			var options = {
				errorOther: function (model, xhr, options) {
					self.trigger("error", options.responseError);
				},
				errorUnauthenticated: function () {
					self._sleep(wakeUp);
//					self.trigger("unauthenticated", self.testSessionId); //looping welcome controller
				},
				success: controller ? function () {
					success.call(controller);
				} : success
			};
			if (withAccountManager) {
				options.accountManager = this.get("accountManager");
			}
			return options;
		}
	});

});