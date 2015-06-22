/*global define: true */
define([
	'moment',
	'backbone',
	'underscore',
	'Models/Constants',
	'Models/ErrorConstants',
	'DataLayer/Constants',
	'DataLayer/ModelSyncExtension',
	'DataLayer/ServerInteractionSerializersHash',
	'DataLayer/ServerCommandExecutor',
	'Utils/StringExtensions'
], function (moment, Backbone, _, Constants, ErrorConstants, DataConstants, ModelSyncExtension, ServerInteractionSerializersHash, ServerCommandExecutor, StringExtensions) {
	'use strict';

	return Backbone.Model.extend({
		defaults: {
			from: null,
			to: null,
			fromFormatted: null,
			toFormatted: null
		},

		initialize: function () {
			this.on({
				"change:fromFormatted": this._updateFrom,
				"change:toFormatted": this._updateTo
			});
		},

		_updateFrom: function () {
			var fromFormatted = this.get("fromFormatted");

			if (fromFormatted) {
				var from = moment(fromFormatted);
				if (from.isValid()) {
					this.set("from", from.valueOf());
				}
			}
		},

		_updateTo: function () {
			var toFormatted = this.get("toFormatted");

			if (toFormatted) {
				var to = moment(toFormatted);
				if (to.isValid()) {
					this.set("to", to.valueOf() + 24 * 60 * 60 * 1000);
				}
			}
		},

		validate: function (attrs, options) {
			options = options || {};
			var errors = [], from, to;

			if (StringExtensions.isTrimmedEmpty(attrs.fromFormatted)) {
				errors.push(ErrorConstants.Validation.EmptyFromDate);
			} else {
				from = moment(attrs.fromFormatted, "MM/DD/YYYY");
				if (!from.isValid()) {
					errors.push(ErrorConstants.Validation.InvalidFromDate);
				}
			}
			if (StringExtensions.isTrimmedEmpty(attrs.toFormatted)) {
				errors.push(ErrorConstants.Validation.EmptyToDate);
			} else {
				to = moment(attrs.toFormatted, "MM/DD/YYYY");
				if (!to.isValid()) {
					errors.push(ErrorConstants.Validation.InvalidToDate);
				}
				if (to.valueOf() > $.now().valueOf()) {
					errors.push(ErrorConstants.Validation.InvalidFutureDate);
				}
			}

			if (from && to && from.isValid() && to.isValid() && (from.valueOf() > to.valueOf())) {
				errors.push(ErrorConstants.Validation.MismatchedDates);
			}
			if (errors.length > 0) {
				return errors;
			}
		},

		toJSON: function (options) {
			var result = Backbone.Model.prototype.toJSON.call(this, options);

			if (options.local) {
				result = _.pick(result,
					"from",
					"to"
				);
			}

			return result;
		},

		export: function (accountManager) {
			var that = this,
				parsedResponse = [],
				size = 500,
				pages = 1,
				pagesLeft = 0;

			ServerCommandExecutor.execute(this, ServerInteractionSerializersHash.TestSessionManager.getTestsForExportCount, {
				accountManager: accountManager,
				sessionToken: accountManager.getSessionToken(),
				from: this.get('from'),
				to: this.get('to'),
				success: function (model, records) {
					that.trigger('export-download-progress', 10);

					if (records > size) {
						pages = Math.floor(records / size);
						if (records % size) {
							pages += 1;
						}
						size = Math.ceil(records / pages);
					}

					pagesLeft = pages;
					downloadChunk();

					that.listenTo(that, {'cancelExport': function () {
						pagesLeft = 0;
					}});

				},
				error: null
			});


			function downloadChunk() {
				ServerCommandExecutor.execute(that, ServerInteractionSerializersHash.TestSessionManager.getTestsForExport, {
					accountManager: accountManager,
					sessionToken: accountManager.getSessionToken(),
					from: that.get('from'),
					to: that.get('to'),
					page: pages - pagesLeft--,
					size: size,
					noLogging: true,
					success: function (model, data) {

						_.each(data, function (e) {
							var session = {
								subjectId: e.secondName,
								compositeScore: parseFloat(e.score).toFixed(2),
								assessmentDate: moment(e.creationDate).format('MM/DD/YYYY'),
								assessmentTime: moment(e.creationDate).format('HH:mm')
							};

							_.each(e.extension, function (e) {
								switch (e.name.toLowerCase()) {
								case 'visit':
									session.visit = e.value;
									break;
								case 'planned time point':
									session.timePoint = e.value;
									break;
								}
							});

							var testResultsCollection = JSON.parse(e.rawData.replace(/&quot;/g, '"')).testResultsCollection;
							_.each(testResultsCollection, function (e) {
								session[e.testTag + 'Score'] = e.score && e.score.toFixed(2);
								session[e.testTag + 'KeyPresses'] = e.keyPresses;
								session[e.testTag + 'Time'] = e.spentTime && Math.round(e.spentTime.totalSeconds);
								session[e.testTag + 'Inaccurate'] = - e.keyPresses;
								_.each(e.raw, function (k) {
									session[e.testTag + 'Inaccurate'] += k.down ? k.down.length : 0;
								});

							});
							parsedResponse.push(session);
						});

						if (pagesLeft === 0) {
							that.trigger('export-data-ready', parsedResponse, 'Export_' + that.get('fromFormatted') + '-' + that.get('toFormatted') + '.csv');
							parsedResponse = undefined;
						} else {
							that.trigger('export-download-progress', 10 + 90 * (pages - pagesLeft) / pages);
							downloadChunk();
						}
						data = undefined;
					},
					error: null
				});
			}



		},

		getAuditEvents: function (options) {
			ServerCommandExecutor.execute(this, ServerInteractionSerializersHash.AuditManager.getAuditEvents, {
				accountManager: options.accountManager,
				sessionToken: options.accountManager.getSessionToken(),
				success: options.success
			});
		},

		getAuditData: function (accountManager) {
			var that = this;

			ServerCommandExecutor.execute(this, ServerInteractionSerializersHash.AuditManager.getAuditData, {
				accountManager: accountManager,
				sessionToken: accountManager.getSessionToken(),
				from: this.get('from'),
				to: this.get('to'),
				eventType: this.get('type'),
				success: function (model, data, options) {
					that.trigger('analytics-received', data);
				}
			});
		}
	});
});
