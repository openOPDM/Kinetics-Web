define(['underscore'], function (_) {
	'use strict';

	var TimerManager = function (tick_callback, duration) {
		this._tick = tick_callback;
		this._duration = duration;
	};

	_.extend(TimerManager.prototype, {
		startTime: null,
		_timerId: null,

		/*
		 NOTE: THis method is not needed.
		 isRun:function () {
		 return this._timerId;
		 },*/

		ticks: function () {
			return this.startTime ? (new Date()) - this.startTime : 0;
		},

		stopTimer: function () {
			if (this._timerId) {
				this.startTime = null;
				clearInterval(this._timerId);
				this._timerId = null;
			}
		},

		startTimer: function () {
			this.startTime = new Date();
			this._timerId = setInterval(this._tick, this._duration);
		}
	});

	return TimerManager;
});
