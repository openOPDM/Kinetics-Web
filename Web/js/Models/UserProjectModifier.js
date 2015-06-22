/*global define: true */
define([
	'backbone',
	'DataLayer/ServerCommandExecutor',
	'DataLayer/ServerInteractionSerializersHash',
	'Utils/StringExtensions',
	'Utils/Dialog'
], function (Backbone, ServerCommandExecutor, ServerInteractionSerializersHash, StringExtensions, Dialog) {
	'use strict';

	return Backbone.Model.extend({
		defaults: {
			accountManager: null,
			project: null
		},

		projectsList: [],

		initialize: function () {
			if (this.has("accountManager")) {
				throw new Error("An 'accountManager' not set.");
			}
			this.dialog = new Dialog();
		},

		// Change the password of current user
		changeProject: function (options) {
			var that = this;
			var success = options.success;

			options.success = function (model, resp, options) {
				that.trigger("success");
				that._resetFields();
				if (success) success(model, resp, options);
			};

			var error = options.error;
			options.error = function (model, xhr, options) {
				that.trigger("error", options.responseError);
				that._resetFields();
				if (error) error(model, xhr, options);
			};

			ServerCommandExecutor.execute(this, ServerInteractionSerializersHash.ProjectManager.changeProjects, options);
		},

		_resetFields: function () {
			//todo: clear fields
//			this.trigger("resetFields");
		}
	});

});
