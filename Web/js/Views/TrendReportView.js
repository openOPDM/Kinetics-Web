/*global define:true */
define([
	'underscore',
	'backbone',
	'Models/Constants',
	'Views/Constants',
	'Views/KeyboardTestReportPartView',
	'Views/PatientInfoView',
	'text!Templates/TrendReport.html',
	'Utils/MathExtensions',
	'moment',
	'jQuery.ui',
	'jQuery.flot',
	'jQuery.flot.time',
	'jQuery.flot.curvedLines',
	'jQuery.flot.valuelabels',
	'jQuery.flot.navigate'
], function (_, Backbone, ModelsConstants, ViewsConstants, KeyboardTestReportPartView, PatientInfoView, templateHtml, MathExtensions, moment) {
	'use strict';

	var K = 10000000;

	return Backbone.View.extend({
		tagName: "div",
		className: "content-wrapper",
		template: _.template(templateHtml),

		format: "mm/dd/yy",

		events: {
			"change .id-type": "_onTypeFilterChanged",
			"click .id-button-shared-back": "_onBack"
		},

		initialize: function (options) {
			_.bindAll(this, "_fromDateChanged", "_toDateChanged");

			this._readOnly = options.readOnly;

			this.listenTo(this.model, {
				"change:graphData": this.drawGraph,
				"change:toDateMin": this._setToDateFilterLimits,
				"change:fromDateMax": this._setFromDateFilterLimits
			});

		},

		render: function () {
			this.$el.html(this.template({
				readOnly: this._readOnly
			}));

			this.$from = this.$(".id-from");
			this.$to = this.$(".id-to");
			this.$type = this.$(".id-type");

			this._initializeDateFilters();
			this._initializeTypeFilter();

			this.$graphPlaceholder = this.$(".id-trend-graph");

			return this;
		},

		_initializeGraphLabels: function () {
			this._graphLabels = {
				yAxisLabel: "",
				pointLabelMask: ""
			};
			switch (this.model.get("type")) {
			case ModelsConstants.TestSessionType.Keyboard:
				this._graphLabels.yAxisLabel = "keys/second";
				this._graphLabels.pointLabelMask = "{0}<br/>{1} {2}";
				break;

			case ModelsConstants.TestSessionType.TUG:
				this._graphLabels.yAxisLabel = "seconds";
				this._graphLabels.pointLabelMask = "{0}<br/>{1} {2}";
				break;

			case ModelsConstants.TestSessionType.PST:
				this._graphLabels.yAxisLabel = "JERK";
				this._graphLabels.pointLabelMask = "{0}<br/>{2}: {1}";
				break;

			default:
				break;
			}
		},

		_initializeTypeFilter: function () {
			var typeValues = this.model.get("typeValues");
			var $type = this.$type;

			$type.empty();
			_.forEach(typeValues, function (item) {
				$type.append($('<option></option>').attr("value", item.value).text(item.text));
			});

			var currentType = this.model.get("type");
			$type.val(currentType).attr("selected", true);
		},

		_initializeDateFilters: function () {
			this.$from.datepicker({
				changeMonth: true,
				numberOfMonths: 2,
				dateFormat: this.format,
				onClose: this._fromDateChanged
			});

			this.$to.datepicker({
				changeMonth: true,
				numberOfMonths: 2,
				dateFormat: this.format,
				onClose: this._toDateChanged
			});

			var fromDate = this.model.get("fromDate");
			var toDate = this.model.get("toDate");

			this.$from.val($.datepicker.formatDate(this.format, fromDate));
			this.$to.val($.datepicker.formatDate(this.format, toDate));

			this._setFromDateFilterLimits(this.model, this.model.get("fromDateMax"));
			this._setToDateFilterLimits(this.model, this.model.get("toDateMin"));
		},

		_setFromDateFilterLimits: function (model, fromDateMax) {
			if (fromDateMax) {
				this.$from.datepicker("option", "maxDate", fromDateMax);
			}
		},

		_setToDateFilterLimits: function (model, toDateMin) {
			if (toDateMin) {
				this.$to.datepicker("option", "minDate", toDateMin);
			}
		},

		_fromDateChanged: function (selectedDate) {
			var date = this.$from.datepicker("getDate");
			this.model.set("fromDate", date);
		},

		_toDateChanged: function (selectedDate) {
			var date = this.$to.datepicker("getDate");
			date = moment(date).add(ModelsConstants.FullDayOffset).toDate();
			this.model.set("toDate", date);
		},

		_onTypeFilterChanged: function () {
			var selectedType = this.$type.val();
			this.model.set("type", selectedType);
		},

		_getDataSeries: function (compositeData) {
			return _.map(compositeData, function (item) {
				return [item.tick / K, item.score];
			});
		},

		_tickGenerator: function (axis) {
			var ticks = [],
				max = axis.max * K,
				min = axis.min * K,
				range = max - min,
				delta = axis.delta * K,

				marginK = 0.4,
				margin = delta * marginK,

				lDelta,
				format,

				days = moment.duration(range).asDays(),
				hourDuration = moment.duration(1, "hour").asMilliseconds(),
				dayDuration = 24 * hourDuration,

				k, fk;

			if (days <= 2) {
				lDelta = delta * 0.5;
				k = dayDuration / lDelta;
				format = "H:mm";
				if (k > 1) {
					fk = MathExtensions.floorInBase(k, 0.5);
					axis.tickSize = dayDuration / fk;
				} else {
					axis.tickSize = dayDuration * MathExtensions.floorInBase(1 / k, 0.5);
				}
			} else if (days <= 10) {
				lDelta = delta * 0.45;
				k = dayDuration / lDelta;
				format = "D";
				if (k > 1) {
					lDelta = delta * 0.7;
					k = dayDuration / lDelta;
					fk = MathExtensions.floorInBase(k, 0.5);
					axis.tickSize = dayDuration / fk;
					if (fk > 1) {
						format = "D, H:mm";
					}
				} else {
					axis.tickSize = dayDuration * MathExtensions.floorInBase(1 / k, 0.5);
				}
			} else {
				lDelta = delta * 0.7;
				k = dayDuration / lDelta;
				format = "MMM D";
				if (k > 1) {
					lDelta = delta * 0.85;
					k = dayDuration / lDelta;
					fk = MathExtensions.floorInBase(k, 0.5);
					axis.tickSize = dayDuration / fk;
					if (fk > 1) {
						format = "MMM D, H:mm";
					}
				} else {
					axis.tickSize = dayDuration * MathExtensions.floorInBase(1 / k, 0.5);
				}

			}

			var start = min + margin,
				i = 0,
				v, dv;
			do {
				v = start + i * axis.tickSize;
				dv = moment(v).format(format);
				ticks.push([v / K, dv]);
				++i;
			} while (v <= max - margin * 2);

			return ticks;
		},

		drawGraph: function () {
			var fromDate = this.model.get("fromDate");
			var toDate = this.model.get("toDate");

			var graphData = this.model.get("graphData");

			this._initializeGraphLabels();

			var dataSeries = [];
			var minScoreValues = [];
			_.forEach(graphData, function (compositeData, key) {
				var series = this._getDataSeries(compositeData);
				// Determine minimal value of score in data series
				minScoreValues.push(_.min(series, function (pair) {
					return pair[1];
				})[1]);

				//dataSeries.push({ data:series, points:{ show:false }, lines:{ show:true, lineWidth:5 }, curvedLines:{ apply:true, fit:true, fitPointDist:0.000001 } });
				dataSeries.push({ data: series, points: { show: true }, lines: { show: true } });
			}, this);
			// Determine minimal value of score
			minScoreValues = _.without(minScoreValues, 0);
			var minValue = minScoreValues.length ? _.min(minScoreValues) : 0;

			this._valuePrecision = MathExtensions.getPrecision(minValue);

			var options = _.extend({}, ViewsConstants.flotOptions);

			options.xaxes[0] = _.extend({}, options.xaxes[0], {
				ticks: this._tickGenerator,
				min: fromDate.valueOf() / K,
				max: toDate.valueOf() / K
			});

			var panMin = fromDate.valueOf() / K,
				panMax = toDate.valueOf() / K,
				panMargin = (panMax - panMin) * 0.1;

			options.xaxis = {
				panRange: [panMin - panMargin, panMax + panMargin]
			};

			var $graphPlaceholder = this.$graphPlaceholder;

			var plot = $.plot($graphPlaceholder, dataSeries, options);
			$("<div class='axisLabel yaxisLabel'></div>")
				.text(this._graphLabels.yAxisLabel)
				.appendTo($graphPlaceholder);

			this._attachTooltipOnHover($graphPlaceholder);
			this._attachLabelRedrawing($graphPlaceholder, plot);
		},

		_attachLabelRedrawing: function ($graphPlaceholder, plot) {
			var that = this;
			// Add labels redraw by pan/zoom events
			var redrawLabels = function () {
				$graphPlaceholder.hide();

				$graphPlaceholder.find(".valueLabel, .valueLabelLight").each(function () {
					var value = $(this).text();
					$(this).text(that._labelFormatter(value, that._valuePrecision + 1));
				});

				$graphPlaceholder.show();

				var fromDate = new Date(plot.getXAxes()[0].min * K);
				var toDate = new Date(plot.getXAxes()[0].max * K);
				that.model.set({
					fromDate: fromDate,
					toDate: toDate
				}, { suppressRedraw: true });
				that.$from.val($.datepicker.formatDate(that.format, fromDate));
				that.$to.val($.datepicker.formatDate(that.format, toDate));
			};
			$graphPlaceholder.on("plotpan plotzoom", redrawLabels);
			redrawLabels();
		},

		_labelFormatter: function (value, precesion) {
			return (+value).toFixed(precesion);
		},

		_attachTooltipOnHover: function ($graphPlaceholder) {
			var that = this;
			var previousPoint = null;
			$graphPlaceholder.bind("plothover", function (event, pos, item) {
				if (item) {
					if (previousPoint !== item.dataIndex) {
						previousPoint = item.dataIndex;

						$("#tooltip").remove();
						var x = item.datapoint[0];
						var y = item.datapoint[1];

						var time = moment(x * K).format("L HH:mm:ss");
						var tooltip = that._graphLabels.pointLabelMask.format(time, that._labelFormatter(y, that._valuePrecision + 4), that._graphLabels.yAxisLabel);

						that._showTooltip(item.pageX, item.pageY, tooltip);
					}
				} else {
					$("#tooltip").fadeOut(50);
					previousPoint = null;
				}
			});
		},

		_showTooltip: function (x, y, contents) {
			var $tooltip = $("<div id='tooltip' class='tooltip'>" + contents + "</div>").css({
				display: "none",
				top: y + 15,
				left: x + 15
			}).appendTo("body");
			var tooltipWidth = $tooltip.outerWidth(),
				freeSpace = $(window).width() - x - 20;
			if (freeSpace < tooltipWidth)  {
				$tooltip.css({
					left: "auto",
					right: 0
				});
			}
			$tooltip.fadeIn(200);
		},

		_onBack: function () {
			this.trigger('back-shared');
		}

	});

});
