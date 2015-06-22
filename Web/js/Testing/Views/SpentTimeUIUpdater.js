define([
	'underscore'
], function (_) {
	'use strict';

	var SpentTimeUIUpdater = function () {
	};
	_.extend(SpentTimeUIUpdater.prototype, {
		findControls: function ($el) {
			this.$el = $el;
			this.$hoursCounter = this.$el.find(".hours-counter");
			this.$minutesCounter = this.$el.find(".minutes-counter");
			this.$spentTimeHours = this.$el.find(".spent-time-hours");
			this.$spentTimeMinutes = this.$el.find(".spent-time-minutes");
			this.$spentTimeSeconds = this.$el.find(".spent-time-seconds");
			this.$spentTimeHoursPluralEnds = this.$el.find(".spent-time-hours-plural-ends");
			this.$spentTimeMinutesPluralEnds = this.$el.find(".spent-time-minutes-plural-ends");
			this.$spentTimeSecondsPluralEnds = this.$el.find(".spent-time-seconds-plural-ends");
		},

		updateControls: function (spentTime) {
			this.$spentTimeHours.html(spentTime.hours);
			this.$spentTimeMinutes.html(spentTime.minutes);
			this.$spentTimeSeconds.html(spentTime.seconds);

			if (spentTime.seconds == 1) {
				this.$spentTimeSecondsPluralEnds.hide();
			} else {
				this.$spentTimeSecondsPluralEnds.show();
			}

			if (spentTime.hours > 0) {
				if (spentTime.hours == 1) {
					this.$spentTimeHoursPluralEnds.hide();
				} else {
					this.$spentTimeHoursPluralEnds.show();
				}
				this.$hoursCounter.show();
			} else {
				this.$hoursCounter.hide();
			}

			if (spentTime.minutes > 0) {
				if (spentTime.minutes == 1) {
					this.$spentTimeMinutesPluralEnds.hide();
				} else {
					this.$spentTimeMinutesPluralEnds.show();
				}
				this.$minutesCounter.show();
			} else {
				this.$minutesCounter.hide();
			}
		}
	});

	return SpentTimeUIUpdater;
});
