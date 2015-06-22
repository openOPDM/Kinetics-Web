// TODO: Load 'excanvas' library only if browser is lte IE 8
define([
	'underscore',
	'backbone',
	'Testing/Models/Constants',
	'text!Templates/KeyboardTestReportPart.html',
	'Views/ColorConstants',
	'excanvas',
	'jQuery.flot',
	'jQuery.flot.time',
	'formatter'
], function (_, Backbone, TestingConstants, templateHtml, ColorConstants) {
		'use strict';

		return Backbone.View.extend({
			tagName: "div",
			template: _.template(templateHtml),

			events: {
			},

			initialize: function () {
				_.bindAll(this, "_secondsFormatter", "_keyFormatter");
			},

			render: function () {
				this.$el.html(this.template({
					model: this.model,
					Constants: TestingConstants
				}));

				this.$graphContainer = this.$(".graph-container");
				this.$graphPlaceholder = this.$(".graph-placeholder");
				return this;
			},

			drawGraph: function () {
				if (this.model.get("state") == TestingConstants.TestResultState.Passed) {
					var spentTime = this.model.get("spentTime").ticks;
					var data = this._prepareSeries(this.model.get("raw"), spentTime);
					this._graph(this.$graphPlaceholder, data, spentTime);
				} else {
					this.$graphContainer.hide();
				}
			},

			_yValues: null,

			_secondsFormatter: function (val, axis, accuracy) {
				if (accuracy === undefined) {
					accuracy = 0;
				}
				return (val / 1000).toFixed(accuracy) + "s";
			},

			_keyFormatter: function (v, axis) {
				var keyName = _.find(this._yValues, function (value, key) {
					return value == v;
				});
				return keyName || "";
			},

			_linearizeTimings: function (keyRawData, yValue) {
				var downs = _.map(keyRawData.down, function (value) {
					return { e: 1, val: value };
				});

				var ups = _.map(keyRawData.up, function (value) {
					return { e: 0, val: value };
				});

				var events = _.union(ups, downs);
				events = _.sortBy(events, "val");

				var linearData = [];

				if (events.length > 0 && events[0].e == 0) {
					linearData.push([ 0, yValue ]);
				}

				var separator = false;
				for (var i = 0; i < events.length; i++) {
					if (events[i].e == 0) {
						separator = true;
					}
					else if (separator) {
						linearData.push(null);
						separator = false;
					}
					linearData.push([ events[i].val, yValue ]);
				}

				return linearData;
			},

			_getYValues: function (keys) {
				var yValues = {};
				if (this.model.attributes.testTag.indexOf('nm') > -1) {
					yValues.n = 1;
					yValues.m = 2;
				} else {
					yValues.p = 1;
					yValues.q = 2;
				}

				for (var i = 0, j = 3; i < keys.length; i++) {
					if (!yValues[keys[i]]) {
						yValues[keys[i]] = j++;
					}
				}
				return yValues;
			},

			_getColor: function (key, index) {
				var nm = this.model.attributes.testTag.indexOf('nm') > -1;
				if ((key === "m" && nm) || (key === "p" && !nm)) {
					return "green";
				}
				if ((key === "n" && nm) || (key === "q") && !nm) {
					return "blue";
				}
				return ColorConstants.RedTheme[index % ColorConstants.RedTheme.length];
			},

			_prepareSeries: function (testResultsRawData) {
				if (!(testResultsRawData instanceof Object)) {
					throw new Error("Invalid raw data format.");
				}

				var keys = _.keys(testResultsRawData);
				this._yValues = this._getYValues(keys);

				if (keys.length * 30 > 450) {
					$('.graph-container').css('height', keys.length * 30);
				}

				var i = 0;
				return _.map(testResultsRawData, function (keyRawData, key) {
					var data = this._linearizeTimings(keyRawData, this._yValues[key]);
					var label = key + " key";
					var color = this._getColor(key, i++);
					return { data: data, label: label, color: color };
				}, this);

			},

			_graph: function (placeholder, series, spentTime) {
				var yTicks = _.map(this._yValues, function (value, key) {
					return [ value, key ];
				});

				yTicks = _.sortBy(yTicks, function (pair) {
					return pair[0];
				});

				var first = _.first(yTicks);
				var last = _.last(yTicks);

				$.plot(placeholder, series, {
					series: {
						curvedLines: { active: true },
						lines: {
							show: true,
							lineWidth: 40,
							fill: false
						},
						points: {
							show: false
						}
					},
					shadowSize: 0,
					grid: {
						hoverable: true
					},
					xaxis: {
						mode: "time",
						min: 0,
						max: spentTime,
						tickFormatter: this._secondsFormatter
					},
					yaxis: {
						ticks: yTicks,
						min: 0,
						max: last ? last[0] + 1 : 1
					}
				});

				var previousPoint = null;
				var that = this;
				placeholder.bind("plothover", function (event, pos, item) {
					if (item) {
						if (previousPoint != item.dataIndex) {
							previousPoint = item.dataIndex;

							$("#tooltip").remove();
							var x = item.datapoint[0].toFixed(2),
								y = item.datapoint[1].toFixed(2);

							var tooltip = "{0}, time: {1}".format(item.series.label, that._secondsFormatter(x, null, 2));

							that._showTooltip(item.pageX, item.pageY, tooltip);
						}
					} else {
						$("#tooltip").fadeOut(500);
						previousPoint = null;
					}
				});
			},

			_showTooltip: function (x, y, contents) {
				$("<div id='tooltip'>" + contents + "</div>").css({
					position: "absolute",
					display: "none",
					top: y + 5,
					left: x + 5,
					border: "1px solid #fdd",
					padding: "2px",
					"background-color": "#fee",
					opacity: 0.80
				}).appendTo("body").fadeIn(1000);
			}
		});
	}
);