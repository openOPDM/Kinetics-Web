/*global define:  true */
define([
	'underscore',
	'Testing/Models/TestScreens/ScreenBase',
	'Utils/TimerManager',
	'Testing/Models/TimeCalculation',
	'Testing/Models/Constants',
	'Utils/AudioHelper',
	'Utils/ConsoleStub',
	'formatter'
], function (_, ScreenBase, TimerManager, TimeCalculation, Constants, sound) {
	'use strict';

	var clearObject = function (obj) {
		for (var key in obj) {
			delete obj[key];
		}
	};

	return ScreenBase.extend({
		defaults: {
			"expectedKey": null,
			"started": false,
			"percentsDone": -1
		},

		initialize: function () { /*attributes, options*/
			this._timerManager = new TimerManager(this._tick.bind(this), 1000);
		},

		activate: function () {
			// Call method form base prototype
			ScreenBase.prototype.activate.call(this);

			// Reset test results
			// NOTE: It should trigger test dexterity score calculation
			this._testResults.set({
				"spentTime": TimeCalculation.getTimeSpan(0),
				"keyPresses": 0
			});

			// Set flag to passing
			// NOTE: It should trigger total dexterity score calculation
			this._testResults.set("state", Constants.TestResultState.Passing);

			// Set or clear raw data array
			if (this._testResults.has("raw")) {
				clearObject(this._testResults.get("raw"));
			} else {
				this._testResults.set("raw", {});
			}

			this.set("percentsDone", 0);

			this._initializeExpectedKey();
			this._timerManager.startTimer();
			this.set("started", true);
		},

		deactivate: function () {
			this._timerManager.stopTimer();
			this.set("started", false);

			// Call base implementation
			ScreenBase.prototype.deactivate.call(this);
			this._testResults = null;
		},

		stopPressed: function () {
			this._timerManager.stopTimer();
			this.set("started", false);

			this._testResults.set("state", Constants.TestResultState.Canceled);
			this.trigger("signal:stop");
		},

		_checkContext: function () {
			// Call base implementation
			ScreenBase.prototype._checkContext.call(this);

			this._testResults = this._testContext.get("results");
			if (!this._testResults) {
				throw new Error("Test result not specified in current test context.");
			}
		},

		// Array of two expected key
		// Should be overridden in child prototypes
		_expectedKeySet: [],

		// Initialize first expected key as first key from set
		_initializeExpectedKey: function () {
			this.set("expectedKey", null);
		},

		// Toggle expected key
		_toggleExpectedKey: function () {
			switch (this.get("expectedKey")) {
			case this._expectedKeySet[0]:
				this.set("expectedKey", this._expectedKeySet[1]);
				break;
			case this._expectedKeySet[1]:
				this.set("expectedKey", this._expectedKeySet[0]);
				break;
			default:
				throw new Error("Invalid value of attribute 'expectedKey'.");
			}
		},

		// This method deactivate inner test logic and signals
		// that test ends and now owner can stores test results.
		_testPassed: function () {
			this._timerManager.stopTimer();
			this.set("started", false);
			this._testResults.set("state", Constants.TestResultState.Passed);
			sound.play('test-sound-finish');
			this.trigger("signal:testEnds");
		},

		keyDown: function (keyName) {
			if (this.get("started")) {
				// Add key down event to raw data
				var raw = this._testResults.get("raw"),
					keyLog = raw[keyName];
				if (!keyLog) {
					keyLog = raw[keyName] = {};
				}
				keyLog.down = keyLog.down || [];
				keyLog.down.push(this._timerManager.ticks());

				//console.log("Key down '{0}'. raw.{0}.down={1}".format(keyName, JSON.stringify(raw[keyName].down)));
				if (this.get("expectedKey") === null && _.indexOf(this._expectedKeySet, keyName) >= 0) {
					this.set("expectedKey", keyName);
					this._expectedKeyPressed(keyName);
					sound.play('test-sound-correct-beep');
				} else if (keyName === this.get("expectedKey")) {
					this._expectedKeyPressed(keyName);
					sound.play('test-sound-correct-beep');
				} else {
					sound.play('test-sound-wrong-beep');
				}
			}
		},

		keyUp: function (keyName) {
			if (this.get("started")) {
				// Add key up event to raw data
				var raw = this._testResults.get("raw"),
					keyLog = raw[keyName];
				if (!keyLog) {
					keyLog = raw[keyName] = {};
				}
				keyLog.up = keyLog.up || [];
				keyLog.up.push(this._timerManager.ticks());

				//console.log("Key up '{0}'. raw.{0}.up={1}".format(keyName, JSON.stringify(raw[keyName].up)));
			}
		}
	});
});

