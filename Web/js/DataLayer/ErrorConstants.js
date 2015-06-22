/*global define: true */
define([
	'underscore',
	'formatter'
], function (_) {
	'use strict';
	var ErrorConstants = {
		UserIsSignedOut: {
			code: 1100,
			description: "User is signed out from system."
		},
		ServerErrorsCodes: {
			InvalidSessionToken: 716,
			NoPermission: 721,
			SessionTokenIsExpired: 717,
			UserIsNotActivated: 803,
			UserDoesNotExist: 801,
			DuplicateProjectName: 806,
			ProjectDisabled: 817,
			NoTestFound: 807,
			UserDisabled: 808,
			CannotAccessSharedData: 822,
			LastSiteAdmin: 821,
			TokenIsGenerated: 823
		},
		AjaxErrors: {
			Failed: {
				code: 1000,
				description: "Server request failed."
			},
			Timeout: {
				code: 1001,
				description: "Server request time out."
			},
			Abort: {
				code: 1002,
				description: "Request to server aborted."
			},
			ParserError: {
				code: 1003,
				description: "Server request failed. Parser error."
			}
		},
		UnknownRequestErrorCode: 1100
	};

	ErrorConstants.UnknownRequestError = function (textStatus) {
		return {
			code: ErrorConstants.UnknownRequestErrorCode,
			description: "Server request error. ({0}).".format(textStatus)
		};
	};

	ErrorConstants.AjaxErrorsByStatus = {
		"error": ErrorConstants.AjaxErrors.Failed,
		"timeout": ErrorConstants.AjaxErrors.Timeout,
		"abort": ErrorConstants.AjaxErrors.Abort,
		"parsererror": ErrorConstants.AjaxErrors.ParserError
	};

	ErrorConstants.genericErrors = {
		'invalidCredentials': 'Invalid credentials'
	};

	ErrorConstants.GetServerError = function (code) {
		return _.find(ErrorConstants.ServerErrorsCodes, function (value) {
			return value.code == code;
		});
	};

	return ErrorConstants;
});
