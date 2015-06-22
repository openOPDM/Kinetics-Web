define(function () {
	'use strict';

	var TimeCalculation = {
		getTimeSpan: function (ticks) {
			var d = new Date(ticks);
			return {
				ticks: ticks,
				totalSeconds: ticks / 1000,
				hours: d.getUTCHours(),
				minutes: d.getMinutes(),
				seconds: d.getSeconds(),
				milliseconds: d.getMilliseconds()
			}
		}
	};
	return TimeCalculation;
});