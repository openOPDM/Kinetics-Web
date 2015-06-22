/*global define:true */
define([
	'backbone',
	'underscore',
	'Models/Constants',
	'Utils/MathExtensions',
	'moment'
], function (Backbone, _, Constants, MathExtensions, moment) {
	'use strict';

	var dayLength = moment.duration(1, "day").asMilliseconds();

	return Backbone.Model.extend({
		defaults: {
			testResults: null,
			fromDate: null,
			toDate: null,
			fromDateMax: null,
			toDateMin: null,
			typeValues: null,
			type: null,
			allData: null,
			graphData: null
		},

		initialize: function () {
			var testResults = this.get("testResults");
			if (!testResults) {
				throw new Error("A 'testResultCollection' not set.");
			}

			this._initializeTypeFilter();
			this._initializeDataRanges();
			this._initializeDateFilters();

			this.on({
				"change:toDate change:fromDate": this._recalculateGraphData,
				"change:type": this._onTypeFilterChanged
				// NOTE: It used without graph interaction when data loaded exactly for selected date range
				// to prevent drawing graph without y axis
				//"change:graphDataRange":this._calculateDateFilterLimit
			});

			this._recalculateGraphData();
		},

		_initializeTypeFilter: function () {
			var testResults = this.get("testResults");
			var groupedByType = testResults.groupBy(function (row) {
				return row.getType();
			});

			var keyboardExists = false;
			var typeValues = _(groupedByType).keys().map(function (typeTag) {
				if (typeTag == Constants.TestSessionType.Keyboard) {
					keyboardExists = true;
				}

				var caption = Constants.TestSessionTypeCaptions[typeTag] || typeTag;
				return {
					value: typeTag,
					text: caption
				};
			});

			this.set("typeValues", typeValues);

			if (typeValues.length > 0) {
				var defaultValue = keyboardExists ? Constants.TestSessionType.Keyboard : typeValues[0].value;
				this.set("type", defaultValue);
			}
		},

		_calculateDateFilterLimit: function (model, range) {
			if (range) {
				this.set({
					"fromDateMax": new Date(range.max),
					"toDateMin": new Date(range.min)
				});
			} else {
				this.unset("fromDateMax");
				this.unset("toDateMin");
			}
		},

		_correctDateFilterRange: function (fromDate, toDate) {
			var ranges = this.get("dataRanges");

			// Get range of current type filter
			var type = this.get("type");
			var range = ranges[type];

			if (range && (toDate < range.min || fromDate > range.max)) {
				toDate = range.max;
				fromDate = new Date(MathExtensions.floorInBase(
					moment(toDate)
						.subtract('month', 1)
						.valueOf(),
					dayLength));

				return {
					fromDate: fromDate,
					toDate: toDate
				}
			}
		},

		_initializeDateFilters: function () {
			var now = moment();
			var nowDate = moment([now.year(), now.month(), now.date()]);
			var range = {
				toDate: nowDate.clone().add(Constants.FullDayOffset).toDate(),
				fromDate: nowDate.clone().subtract(1, "month").toDate()
			};

			range = this._correctDateFilterRange(range.fromDate, range.toDate) || range;

			this.set(range);
		},

		_initializeDataRanges: function () {
			var ranges = this._getDataRangesByType();

			// Round range dates by day
			for (var type in ranges) {
				var range = ranges[type];
				range.min = new Date(range.min.getFullYear(), range.min.getMonth(), range.min.getDate());
				range.max = moment([range.max.getFullYear(), range.max.getMonth(), range.max.getDate()])
					.add(Constants.FullDayOffset).toDate();
			}

			this.set("dataRanges", ranges);
		},

		_getDataRangesByType: function () {
			var testResults = this.get("testResults");
			var groupedByType = testResults.groupBy(function (row) {
				return row.getType();
			});

			var result = {};
			_.forEach(groupedByType, function (rows, type) {
				var min = _.min(rows, function (row) {
					return row.get("creationDate");
				});
				var max = _.max(rows, function (row) {
					return row.get("creationDate");
				});
				result[type] = {
					max: max.get("creationDate"),
					min: min.get("creationDate")
				};
			});

			return result;
		},

		dispose: function () {
			this.off();
		},

		_allData: null,

		// TODO: This method is temporary solution and should be deprecated in favor of
		// getting data form server with data period filter
		_getFilteredData: function (fromDate, toDate) {
			var testResults = this.get("testResults");

			// Create pairs of data series for graph and group data by type
			return testResults.filter(function (row) {
				var creationDate = row.get("creationDate");
				return creationDate >= fromDate && creationDate <= toDate;
			});
		},

		_getCreationDateDateFromRow: function (row) {
			var creationDate = row.get("creationDate");
			return creationDate.valueOf();
		},

		_getDayFromRowCreationDate: function (row) {
			var creationDate = row.get("creationDate");
			return (new Date(
				creationDate.getFullYear(),
				creationDate.getMonth(),
				creationDate.getDate())).valueOf();
		},

		// Calculate collapse period and score in this period
		_normalizeData: function (rows, getGroupTimestamp, collapsedScoreCalculator) {
			var result = [];
			var timeStampNewValue;
			var timeStampValue = null;
			var rowsGroup = null;
			var groupScore;

			var createNewGroup = function () {
				if (rowsGroup) {
					// Calculate collapsed score
					groupScore = collapsedScoreCalculator(rowsGroup);
					// Add new group
					result.push({
						tick: timeStampValue,
						rows: rowsGroup,
						score: groupScore
					});
				}

				// Create new empty group
				rowsGroup = [];
				// Store current group factor
				timeStampValue = timeStampNewValue;
			};

			for (var i = 0; i < rows.length; i++) {
				// Calculate group factor
				timeStampNewValue = getGroupTimestamp(rows[i]);

				// Check end of group
				if (timeStampNewValue != timeStampValue) {
					createNewGroup();
				}
				rowsGroup.push(rows[i]);
			}

			// Create last group
			createNewGroup();

			return result;
		},

		_onTypeFilterChanged: function () {
			var fromDate = this.get("fromDate");
			var toDate = this.get("toDate");

			var range = this._correctDateFilterRange(fromDate, toDate);
			if (range) {
				// Set new values of date filter
				this.set(range);
			} else {
				this._recalculateGraphData();
			}
		},

		// Collapse scores in period as average of scores in that period.
		_calculateAverageScores: function (rows) {
			var avg = 0;
			if (rows.length > 0) {
				var sum = 0;
				for (var i = 0; i < rows.length; i++) {
					sum += rows[i].get("score");
				}
				avg = sum / rows.length;
			}
			return avg;
		},

		_recalculateGraphData: function (model, value, options) {
			var fromDate = this.get("fromDate");
			var toDate = this.get("toDate");

			if (!fromDate || !toDate) {
				throw new Error("Invalid values of filter attributes 'toDate' or 'fromDate'.");
			}

			// NOTE: In case graph with interaction there is no calculation of data min/max in visible range
			// and logic of limitation date filter simplified
			this._calculateDateFilterLimit(null, { min: fromDate, max: toDate });

			if (options && options.suppressRedraw) return;

			// Clear old graph data
			this.unset("graphData");


			var filteredRows = this.get("testResults").models;

			var groupedRowsByType = _.groupBy(filteredRows, function (row) {
				return row.getType();
			});

			// Filter data by type
			var type = this.get("type");
			if (type) groupedRowsByType = _.pick(groupedRowsByType, type);

			// Set timestamp period to 24 hours in milliseconds
			var timestampPeriod = moment.duration(1, "day").asMilliseconds();
			this.set("timestampPeriod", timestampPeriod);

			// Prepare data for graph view
			var graphData = {};
			_.forEach(groupedRowsByType, function (rows, type) {
				// NOTE: Now used period in one day and collapsing scores as average by scores in that day.
				// but it may not corrected in consideration of medical purposes.
				graphData[type] = this._normalizeData(
					rows,
					this._getCreationDateDateFromRow,
					this._calculateAverageScores
				);
			}, this);

			var range = this._getDataRange(graphData);

			this.set({
				graphData: graphData,
				graphDataRange: range
			});
		},

		_getDataRange: function (graphData) {
			var minList = [], maxList = [];
			var getTick = function (item) {
				return item.tick;
			};

			var dataExists = false;
			_.forEach(graphData, function (rows, type) {
				if (rows.length > 0) {
					minList.push(_.min(rows, getTick));
					maxList.push(_.max(rows, getTick));
					dataExists = true;
				}
			});

			var range;
			if (dataExists) {
				var min = _.min(minList, getTick);
				var max = _.max(maxList, getTick);
				range = { min: min.tick, max: max.tick};
			} else {
				range = null;
			}

			return range;
		}
	});

});
