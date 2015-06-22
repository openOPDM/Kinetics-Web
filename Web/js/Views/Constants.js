/*global define:true */
define([
	'Utils/MathExtensions',
	'moment'
], function (MathExtensions, moment) { //why the hell do we even need this?
	"use strict";
	return {
		HeaderMenu: {
			Default: "default",
			Welcome: "welcome",
			Patient: "patient",
			Authorization: "auth",
			Testing: "testing",
			Analyst: "analyst",
			SiteAdmin: "site_admin"

		},
		ReCaptchaPublicKey: "6LdRDd8SAAAAAOPIzYl6zWv4IJfvYoh1kkixzAFK",

		flotOptions: {
			valueLabels: {
				show: true,
				showAsHtml: true
			},
			series: {
				color: "#00A4CA",
				curvedLines: {
					active: true
				}
			},
			grid: {
				show: true,
				borderWidth: {
					top: 0,
					bottom: 24,
					right: 0,
					left: 0
				},
				borderColor: "#ddd",
				tickColor: "rgba(255, 255, 255, 0)",
				margin: 0,
				hoverable: true,
				mouseActiveRadius: 30
			},
			xaxes: [{
				color: "#00A4CA",
				font: {
				}/*,
				ticks: function (axis) {
					var K = 10000000,
						ticks = [],
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
				}*/
			}],
			yaxes: [
				{
					show: true,
					min: 0
				}
			],
			yaxis: {
				zoomRange: false,
				panRange: false
			},
			zoom: {
				interactive: true
			},
			pan: {
				interactive: true
			}
		}
	};
});
