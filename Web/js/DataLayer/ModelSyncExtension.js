/*global define: true */
define([
	'underscore',
	'backbone',
	'DataLayer/Constants',
	'DataLayer/ErrorConstants',
	'DataLayer/ServerCommandExecutor',
	'Utils/ConsoleStub',
	'formatter'
], function (_, Backbone, Constants, ErrorConstants, ServerCommandExecutor) {
	'use strict';

	var ModelSyncExtension = {
		_responseParsers: {},
		_requestFactories: {},

		sync: function (method, model, options) {
			options = options || {};
			if (options.local) {
				var dbId = this.id;
				if (options.localId) {
					this.set("dbId", this.id, { silent: true });
					this.set(this.idAttribute, options.localId, { silent: true });
				}

				// Save original toJSON and switch to version bound with current options parameter
				var toJSON = model.toJSON;
				if (toJSON) {
					model.toJSON = _.bind(model.toJSON, model, options);
				}

				Backbone.localSync(method, model, options);

				// Restore original function
				if (toJSON) {
					model.toJSON = toJSON;
				}

				if (options.localId) {
					dbId = this.get("dbId");
					this.unset("dbId", { silent: true });
					this.set(this.idAttribute, dbId, { silent: true });
				}
			} else {
				this.serverSync(method, model, options);
			}
		},

		// This query return user data only for currently signed in user
		serverSync: function (method, model, options) {
			console.log("Server request. Method={0}".format(method));

			// Find request factory
			var command = this.syncCommands[method];
			if (!command) {
				throw new Error("Method '{0}' not supported by this model instance. There is not server command object for this method.".format(method));
			}

			// Call internal method
			if (!ServerCommandExecutor._check(model, command, options)) {
				return;
			}

			// Get request json
			var requestObject = command.buildRequest(options, model);
			var requestJson = JSON.stringify(requestObject);

			// Set parse method for one call
			var oldParse = this.parse;
			this.parse = function (resp, options) {
				var parseResult = command.parseResponse(resp, options);
				// Unset parser to prevent invalid next call with another command context
				this.parse = oldParse;
				return parseResult;
			};

			var that = this;
			var error = options.error;
			options.error = function (model, xhr, options) {
				if (error) {
					error(model, xhr, options);
				}
				that._modelTrigger('error', model, xhr, options);
			};

			var success = options.success;
			options.success = function (model, resp, options) {
				if (success) {
					success(model, resp, options);
				}
				that._modelTrigger('sync', model, resp, options);
			};

			console.log("Server request. JSON={0}".format(requestJson));

			var xhr = ServerCommandExecutor._executeAjax(model, requestJson, options);

			this._modelTrigger('request', model, xhr, options);
		},

		_modelTrigger: function (event, model, param1, options) {
			if (_.isArray(model)) {
				_.forEach(model, function (m) {
					m.trigger(event, m, param1, options);
				});
			} else {
				model.trigger(event, model, param1, options);
			}
		}

	};

	return {
		extend: function (model, commands) {
			_.extend(model, ModelSyncExtension);
			model.syncCommands = commands || {};
		}
	};
});