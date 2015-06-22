/*global define:true */
define([
	'underscore',
	'backbone',
	'Models/Constants',
	'Models/PSTRawDataParser',
	'Testing/Models/TestSessionResults',
	'DataLayer/ModelSyncExtension',
	'DataLayer/ServerInteractionSerializersHash'
], function (_, Backbone, Constants, PSTRawDataParser, TestSessionResults, ModelSyncExtension, ServerInteractionSerializersHash) {
	'use strict';

	// This class represents database record for session test results.
	// Represent abstraction layer between data base record and business logic objects that
	// represent keyboard and mobile tests results.
	// Responsible for persistence of test results to raw data on server side.
	var userId, TestSessionResultsRow = Backbone.Model.extend({
		'default': {
			id: null,
			userFirstName: null,
			userSecondName: null,
			type: null,
			score: null,
			isValid: null,
			creationDate: null,
			notes: null,
			rawData: null
		},

		getType: function () {
			return this.parseType()[0];
		},

		parseType: function () {
			return this.get("type").split("|");
		},

		getTestTaken: function () {
			var returnValue;
			var type = this.parseType();
			switch (type[0]) {
			case Constants.TestSessionType.Keyboard:
				returnValue = type[1];
				break;

			default:
				returnValue = this.get("type");
				break;
			}
			return returnValue;
		},

		initialize: function () {
		},

		parseRawData: function () {
			var returnValue;
			if (this.getType() === Constants.TestSessionType.PST) {
				returnValue = PSTRawDataParser.parse(this.get("rawData"));
			}
			return returnValue || {};
		},

		parseClientSystemInfo: function () {
			var systemInfo,
				rawData = this.get("rawData");
			if (!_.isNull(rawData)) {
				switch (this.getType()) {
				case Constants.TestSessionType.Keyboard:
					try {
						systemInfo = JSON.parse(_.unescape(rawData)).navigator.userAgent;
					} catch (e) {
						systemInfo = "";
					}
					break;
				case Constants.TestSessionType.PST:
					try {
						var parts = rawData.split(";");
						systemInfo = parts[parts.length - 1];
					} catch (e) {
						systemInfo = "";
					}
					break;
				case Constants.TestSessionType.TUG:
					systemInfo = rawData;
					break;
				default:
					systemInfo = "";
				}
			}

			return systemInfo;
		},

		buildTestSessionResults: function () {
			if (this.getType() !== Constants.TestSessionType.Keyboard) {
				throw new Error("Wrong test session type.");
			}

			var rawData = this.get("rawData");
			if (rawData != null) {
				try {
					rawData = JSON.parse(_.unescape(rawData));
				} catch (e) {
					rawData = null;
				}
			}

			var attributes = _.extend({
				createDate: this.get("creationDate"),
				totalScore: this.get("score"),
				notes: this.get("notes"),
				valid: this.get("isValid")
			}, rawData);

			return new TestSessionResults(attributes, { parse: true });

		},

		parse: function (resp, options) {
			var result = Backbone.Model.prototype.parse.call(this, resp, options);
			result.creationDate = new Date(result.creationDate);
			return result;
		},

		toJSON: function (options) {
			var result = Backbone.Model.prototype.toJSON.call(this, options);
			result.creationDate = result.creationDate ? result.creationDate.valueOf() : 0;
			return result;
		},

		configure: function (type) {
			switch (type) {
			case 'token':
				this.syncCommands.read = ServerInteractionSerializersHash.TestSessionManager.getDetailsByToken;
				break;
			default:
				this.syncCommands.read = ServerInteractionSerializersHash.TestSessionManager.getDetails;
				break;
			}
		}
	});

	// Static builder of instance
	TestSessionResultsRow.buildFromTestSessionResults = function (testSessionResults, userId) {
		var testSessionResultsJsonObject = testSessionResults.toJSON();
		testSessionResultsJsonObject.navigator = {
			userAgent: navigator.userAgent,
			platform: navigator.platform
		};
		var rawData = _.escape(JSON.stringify(testSessionResultsJsonObject));

		return new TestSessionResultsRow({
			type: Constants.TestSessionType.Keyboard + "|" + testSessionResults.passedTests(),
			score: testSessionResults.get("totalScore"),
			isValid: testSessionResults.get("valid"),
			creationDate: testSessionResults.get("createDate"),
			notes: testSessionResults.get("notes"),
			extension: testSessionResults.get("extension"),
			userId: userId || null,
			rawData: rawData
		});
	};

	ModelSyncExtension.extend(TestSessionResultsRow.prototype, {
		"create": ServerInteractionSerializersHash.TestSessionManager.add,
		"read": ServerInteractionSerializersHash.TestSessionManager.getDetails
	});

	return TestSessionResultsRow;
});
