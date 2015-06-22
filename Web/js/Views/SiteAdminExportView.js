/*global define:true */
define([
	'jQuery',
	'underscore',
	'backbone',
	'moment',
	'Views/Constants',
	'Models/Constants',
	'Models/ErrorConstants',
	'Utils/MathExtensions',
	'text!Templates/SiteAdminExport.html',
	'text!Templates/ExportHeader.csv',
	'text!Templates/ExportRow.csv',
	'text!Templates/ExportHeaderTabs.csv',
	'text!Templates/ExportRowTabs.csv',
	'jQuery.placeholder',
	'formatter',
	'jQuery.ui',
	'jQuery.flot',
	'jQuery.flot.time',
	'jQuery.flot.curvedLines',
	'jQuery.flot.valuelabels',
	'jQuery.flot.navigate'
], function ($, _, Backbone, moment, Constants, ModelsConstants, ErrorConstants, MathExtensions, templateHtml, csvHeader, csvRow, csvHeaderTabs, csvRowTabs) {
	'use strict';

	var K = 10000000;

	return Backbone.View.extend({
		tagName: "div",
		className: "content-wrapper export",
		template: _.template(templateHtml),
		csvHeaderTemplate: _.template($.browser.msie ? csvHeaderTabs : csvHeader),
		csvRowTemplate: _.template($.browser.msie ? csvRowTabs : csvRow),

		events: {
			"click .id-export": "_onExport",
			"keypress .export-data input": "_submitExportOnEnter",
			"click .id-cancel": "_onCancel",
			"click .id-show-analytics": "_onAnalytics",
			"keypress .analytics-reports input": "_submitAnalyticsOnEnter",
			"change #range-from": "_onExportDatesChanged",
			"change #range-to": "_onExportDatesChanged"
		},

		initialize: function () {

			this.listenTo(this.model, {
				'invalid': function (model, errors) {
					this._updateErrorMessage(errors);
				},
				'error': function (error) {
					this._updateErrorMessage([ error ]);
				},
				'export-data-ready': this._prepareExportData,
				'export-download-progress': function (state) {
					this.$('.stage1 .progress').progressbar('value', state);
				},
				'analytics-received': this._analyticsReceived
			});

		},

		render: function () {

			this.$el.html(this.template({
				Constants: ModelsConstants,
				model: this.model,
				eventList: this.options.eventList
			}));

			this.$from = this.$(".id-range-from");
			this.$to = this.$(".id-range-to");

			this.$eventFrom = this.$(".id-event-range-from");
			this.$eventTo = this.$(".id-event-range-to");

			this.$errorFrom = {
				"export-data": this.$(".id-error-from"),
				"analytics-reports": this.$(".id-event-error-from")
			};
			this.$errorTo = {
				"export-data": this.$(".id-error-to"),
				"analytics-reports": this.$(".id-event-error-to")
			};
			this.$errorGeneral = {
				"export-data": this.$('.id-error-general'),
				"analytics-reports": this.$('.id-event-error-general')
			};

			this.$graphPlaceholder = this.$(".id-trend-graph");

			this.$from.datepicker({
				dateFormat: 'mm/dd/yy',
				changeMonth: true,
				changeYear: true
			});

			this.$to.datepicker({
				dateFormat: 'mm/dd/yy',
				changeMonth: true,
				changeYear: true,
				maxDate: 'today'
			});

			this.$eventTo.datepicker({
				dateFormat: 'mm/dd/yy',
				changeMonth: true,
				changeYear: true,
				maxDate: 'today'
			});

			this.$eventFrom.datepicker({
				dateFormat: 'mm/dd/yy',
				changeMonth: true,
				changeYear: true
			});

			this.$('.stage').hide();
			this.$('.progress').progressbar(false);

			this.$("input, textarea").placeholder();

			this._hideErrorsAndStatuses();

			this.$('.profile-menu a').click(this._subMenuNavigation);
			var firstSubPage = this.$('.side-menu a').click(_.bind(this._subMenuNavigation, this)).first();
			firstSubPage.parents('li').addClass('active');
			this.$('.page-partial.' + firstSubPage.attr('class')).show();


			return this;
		},


		// Overload remove() method to reset reCaptcha inner state.
		remove: function () {
			// Call base implementation
			Backbone.View.prototype.remove.apply(this, arguments);
		},

		_hideErrorsAndStatuses: function () {

			this.$('.sign-row-error').hide().removeAttr('title');
			this.$('input, select').removeClass('errored');
		},

		_onCancel: function () {
			this.trigger('cancel', this.model);
		},

		_onExport: function () {
			this._hideErrorsAndStatuses();
			this.$('.id-export').attr('disabled', true);

			var values = {
				fromFormatted: $.trim(this.$from.val()),
				toFormatted: $.trim(this.$to.val())
			};


			if (this.model.set(values, { validate: true })) {
				this.$('.stage').hide();
				this.$('.stage1').show();
				this.$('.stage1 .progress').progressbar('value', false);
				this.trigger('export', this.model);
			}
		},

		_submitExportOnEnter: function (e) {
			if (e.keyCode === 13) {
				this._onExport();
			}
		},

		_prepareExportData: function (data, name) {

			this.$('.stage').hide();
			this.$('.stage2').show();
			this.$('.stage2 .progress').progressbar('value', false);

			var that = this,
				output = this.csvHeaderTemplate();

			_.each(data, function (e) {
				output += that.csvRowTemplate({'data': e});
			});
			data = undefined;
			this.$('.stage').hide();
			this.$('.stage3').show();

			if (!$.browser.msie) {
				this.$('.stage3 a').attr('href', 'data:text/csv;charset=utf-8,' + encodeURIComponent(output)).attr('download', name.replace(/\//g, '_'));
			} else {

				this.$('.stage3 a').off().click(function (e) {

					var oWin = window.open('about:blank', '_blank', 'width=100,height=100,menubar=no,location=no,resizable=no,scrollbars=no,status=no');
					oWin.document.write(output);
					var success = oWin.document.execCommand('SaveAs', true, name.replace(/\//g, '_'));
					oWin.close();

					e.preventDefault();
					return false;
				});

			}

			this.$('.id-export').attr('disabled', false);

		},

		_updateErrorMessage: function (errors) {
			var activeMenu = this.$(".page-partial:visible").hasClass("export-data") ?
				"export-data" : "analytics-reports";
			var $errorFrom = this.$errorFrom[activeMenu],
				$errorTo = this.$errorTo[activeMenu],
				$errorGeneral = this.$errorGeneral[activeMenu];
			this.$('.id-export').attr('disabled', false);
			_.forEach(errors, function (error) {
				var errored = {
					$container: null
				};

				switch (error.code) {
				case ErrorConstants.Validation.EmptyFromDate.code:
					errored.$container = $errorFrom;
					break;
				case ErrorConstants.Validation.EmptyToDate.code:
					errored.$container = $errorTo;
					break;
				case ErrorConstants.Validation.InvalidFromDate.code:
					errored.$container = $errorFrom;
					break;
				case ErrorConstants.Validation.InvalidToDate.code:
					errored.$container = $errorTo;
					break;
				case ErrorConstants.Validation.InvalidFutureDate.code:
					errored.$container = $errorTo;
					break;

				case ErrorConstants.Validation.MismatchedDates.code:
					errored.$container = $errorFrom;
					break;

				default:
					errored.$container = $errorGeneral;
					break;
				}


				errored.$container.show().html(error.description)
					.attr('title', error.description);

				errored.$input = errored.$input || errored.$container.closest('.sign-row').find('input[type!=radio], select');
				errored.$input.addClass('errored');

			}, this);
		},

		_subMenuNavigation: function (e) {
			e.preventDefault();
			var $menuContainer = $('.side-menu'),
				$oldSub = $('.side-menu .active a'),
				$newSub = $(e.currentTarget),
				oldSubClass = $oldSub.attr('class'),
				newSubClass = $newSub.attr('class'),
				active = $('.side-menu .active');

			if (oldSubClass === newSubClass || $menuContainer.is('.in-progress')) {
				return false;
			}
			$menuContainer.addClass('in-progress');
			active.removeClass('active');
			$newSub.parent().addClass('active');
			$('.content-container>.' + oldSubClass).fadeOut(function () {
				$('.content-container>.' + newSubClass).fadeIn(function () {
					$menuContainer.removeClass('in-progress');
				});
			});

			return false;
		},

		_onAnalytics: function () {
			this._hideErrorsAndStatuses();
			var values = {
				type: $('#event-type').val(),
				fromFormatted: $.trim(this.$eventFrom.val()),
				toFormatted: $.trim(this.$eventTo.val())
			};
			if (this.model.set(values, { validate: true })) {

				this.trigger('analytics', this.model);
			}
		},

		_submitAnalyticsOnEnter: function (e) {
			if (e.keyCode === 13) {
				this._onAnalytics();
			}
		},

		_analyticsReceived: function (data) {
			var fromDate = this.model.get("from"),
				toDate = this.model.get("to");

			var dataSeries = [{ data: [], points: { show: true }, lines: { show: true } }];
			var minScoreValues = [];
			_.forEach(data, function (item, key) {
				var series = [moment(item.date).valueOf() / K, item.total];

				dataSeries[0].data.push(series);
			}, this);


			// Determine minimal value of score
			var minValue = _.min(minScoreValues);

			this._valuePrecision = MathExtensions.getPrecision(minValue);

			var options = _.extend({}, Constants.flotOptions);

			options.xaxes[0] = _.extend({}, options.xaxes[0], {
				ticks: this._tickGenerator,
				min: moment(fromDate).valueOf() / K,
				max: moment(toDate).valueOf() / K
			});

			var panMin = fromDate.valueOf() / K,
				panMax = toDate.valueOf() / K,
				panMargin = (panMax - panMin) * 0.1;

			options.xaxis = {
				panRange: [panMin - panMargin, panMax + panMargin]
			};

			var $graphPlaceholder = this.$graphPlaceholder;
			this.$('.graph-container').show();
			var plot = $.plot($graphPlaceholder, dataSeries, options);
			this._attachTooltipOnHover($graphPlaceholder);
		},

		_attachTooltipOnHover: function ($graphPlaceholder) {
			var that = this;
			var previousPoint = null;
			$graphPlaceholder.bind("plothover", function (event, pos, item) {
				if (item) {
					if (previousPoint !== item.dataIndex) {
						previousPoint = item.dataIndex;

						$("#tooltip").remove();
						var x = item.datapoint[0],
							y = item.datapoint[1],

							time = moment(x * K).format("MMM Do YY");

						that._showTooltip(item.pageX, item.pageY, time);
					}
				} else {
					$("#tooltip").fadeOut(50);
					previousPoint = null;
				}
			});
		},

		_showTooltip: function (x, y, contents) {
			$("<div id='tooltip' class='tooltip'>" + contents + "</div>").css({
				display: "none",
				top: y + 15,
				left: x + 15
			}).appendTo("body").fadeIn(200);
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

		_onExportDatesChanged: function () {
			this.$('.stage3').hide();
		}

	});

});
