/*global define:true */
define([
	'underscore',
	'backbone',
	'DataLayer/Constants',
	'DataLayer/ErrorConstants',
	'Utils/ErrorDisplay',
	'Utils/ConsoleStub'
], function (_, Backbone, Constants, ErrorConstants, ErrorDisplay) {
	'use strict';

	return {
		// Method execute the command with specified options.
		// Supported callbacks in options:
		// Signature of success callback: function(model, resp, options)
		// Signature of error callback: function(model, xhr, options)
		// Signature of errorUnauthenticated callback: function(responseError, options)
		// Signature of errorOther callback: function(model, xhr, options);
		// Signature of abort callback: function(responseError, options)
		execute: function (model, command, options) {
			var success = options.success;
			options.success = function (model, resp, options) {
				if (success) {
					success(model, command.parseResponse(resp), options);
				}
			};

			if (!this._check(null, command, options)) {
				return;
			}

			var jsonObject = command.buildRequest(options);
			var json = JSON.stringify(jsonObject);

			console.log("Server request. JSON={0}".format(json));

			this._executeAjax(model, json, options);
		},

		// Method execute Axaj request.
		// Supported callbacks in options:
		// Signature of success callback: function(model, resp, options)
		// Signature of error callback: function(model, xhr, options)
		// Signature of errorUnauthenticated callback: function(responseError, options)
		// Signature of errorOther callback: function(model, xhr, options);
		// Signature of abort callback: function(responseError, options)
		_executeAjax: function (model, requestJson, options) {
			// Initialize success handler
			var success = options.success;
			options.success = function (resp) {

				ErrorDisplay.hide('no-connection');

				if (resp.response.error) {
					// Save error description from server
					var responseError = resp.response.error;
					// Call overridden error handler from options
					options.error(xhr, null, null, responseError);
				} else {
					if (!options.noLogging) {
						console.log("Server request SUCCESS. Response={0}".format(JSON.stringify(resp)));
					}
					if (success) {
						success(model, resp, options);
					}
				}
			};

			// Initialize error handler
			var error = options.error;
			options.error = function (xhr, textStatus, errorThrown, responseError) {
				// Save description of server error
				responseError = responseError ||
					ErrorConstants.AjaxErrorsByStatus[textStatus] ||
					ErrorConstants.UnknownRequestError(errorThrown);

				options.responseError = responseError;

				console.log("Server request FAILED. Error code {0}. {1}".format(
					responseError.code,
					responseError.description));

				if (_.indexOf([ErrorConstants.AjaxErrors.Failed.code,
								ErrorConstants.AjaxErrors.Timeout.code,
								ErrorConstants.AjaxErrors.Abort.code], responseError.code) >= 0) {
					ErrorDisplay.show('no-connection');
				}

				if (responseError.code == ErrorConstants.ServerErrorsCodes.InvalidSessionToken ||
					responseError.code == ErrorConstants.ServerErrorsCodes.SessionTokenIsExpired) {
					if (options.accountManager) {
						options.accountManager.resetCredentials();
						options.accountManager.trigger('sign-out', {unauthenticated: true});
					}
					if (options.errorUnauthenticated) {
						options.errorUnauthenticated(responseError, options);
					}

					//cleaning storage the hard way
					localStorage.clear();

				} else if (responseError.code == ErrorConstants.AjaxErrors.Abort) {
					if (options.abort) {
						options.abort(responseError, options);
					}
				} else {
					if (options.errorOther) {
						options.errorOther(model, xhr, options);
					}
				}
				if (error) {
					error(model, xhr, options);
				}
			};

			// Initialize query parameters
			var params = {
				url: Constants.serverUrl,
				contentType: "application/json",
				type: "POST",
				processData: false,
				dataType: "json",
				data: requestJson
			};

			// Make the request, allowing the user to override any Ajax options.
			var xhr = options.xhr = Backbone.ajax(_.extend(params, options));

			return xhr;
		},

		// This helper method define default value for command parameter 'signInRequired'.
		// If attribute set then method get sessionToken and set it into options object.
		// If in this case there is no account manager object in options exception will be thrown and method return false.
		// Otherwise method return false.
		_check: function (model, command, options) {
			var signInRequired = command.signInRequired !== undefined ? command.signInRequired : true;

			// Check account manager
			var accountManager = options.accountManager;

			var result = true;
			if (signInRequired) {
				if (!accountManager) {
					throw new Error("Account manager not set");
				}

				if (!accountManager.isUserSignedIn()) {
					options.responseError = ErrorConstants.UserIsSignedOut;

					console.log("Server request FAILED. Error code {0}. {1}".format(
						options.responseError.code,
						options.responseError.description));

                    options.accountManager.trigger('sign-out', {unauthenticated: true});

					if (options.errorUnauthenticated) {
						options.errorUnauthenticated(options.responseError);
					}
					if (options.error) {
						options.error(model, null, options);
					}

					result = false;
				} else {
					// Get current session token
					options.sessionToken = accountManager.getSessionToken();
				}
			}

			return result;
		}
	};

});

