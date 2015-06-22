/*global define:true */
define([
	'Testing/Models/TestSessionResults',
	'Testing/Models/TestSession',
	'Testing/Models/TestScreens/TestScreenInstances',
	'Testing/Models/TestTransitionsInstance',
	'Utils/ConsoleStub',
	'formatter'
], function (TestSessionResults, TestSession, screens, testTransitions) {
	'use strict';

	// ================= TEST ==================================
	var testCase = function () {

		var testSessionResults = new TestSessionResults();
		var testSession = new TestSession({ "sessionResults": testSessionResults }, null, testTransitions);

		testSessionResults.on("change", function () {
			// Find add test result
			var testResults;
			var testTag;
			for (testTag in testSessionResults.changed) {
				// get tag of added test results
				testResults = testSessionResults.get(testTag);
				break;
			}

			testResults.on("change:spentTime", function () {
				var spentTime = testResults.get("spentTime");
				console.log("Test {4} TestResults['spentTime'] = {0} hours, {1} minutes, {2} seconds, {3} milliseconds".format(
					spentTime.hours,
					spentTime.minutes,
					spentTime.seconds,
					spentTime.milliseconds,
					testTag
				));
			});

			testResults.on("change:keyPresses", function () {
				var keyPresses = testResults.get("keyPresses");
				console.log("Test {1} TestResults['keyPresses'] = {0}".format(
					keyPresses,
					testTag));
			});
		});


		testSession.on("test:activated", function (stateItem) {
			console.log("event test:activated ------- {0} -----------".format(stateItem.stateName));
			screens.startScreen.startPressed();
		});

		var keyPressEmulationTimer;
		screens.testingPQScreen.on("state:activated", function () {
			console.log("testingPQScreen event state:activate");

			var switcher = false;
			keyPressEmulationTimer = setInterval(function () {
				var key = switcher ? 'p' : 'q';
				switcher = !switcher;

				console.log("testingPQScreen pressed key {0}".format(key));
				screens.testingPQScreen.keyDown(key);
			}, 600);
		});

		screens.testingPQScreen.on("change:remainedPresses", function () {
			console.log("testingPQScreen remainedPresses={0}".format(screens.testingPQScreen.get("remainedPresses")));
		});

		screens.testingPQScreen.on("state:deactivated", function () {
			clearInterval(keyPressEmulationTimer);
		});

		screens.testingNMScreen.on("state:activated", function () {
			console.log("testingNMScreen event state:activate");

			var switcher = false;
			keyPressEmulationTimer = setInterval(function () {
				var key = switcher ? 'n' : 'm';
				switcher = !switcher;

				console.log("testingNMScreen pressed key {0}".format(key));
				screens.testingNMScreen.keyDown(key);
			}, 600);
		});

		screens.testingNMScreen.on("change:remainedSeconds", function () {
			console.log("testingNMScreen remainedSeconds={0}".format(screens.testingNMScreen.get("remainedSeconds")));
		});

		screens.testingNMScreen.on("state:deactivated", function () {
			clearInterval(keyPressEmulationTimer);
		});

		var oneRepeat = true;
		screens.testPassedScreen.on("state:activated", function () {
			if (oneRepeat) {
				oneRepeat = false;

				setTimeout(function () {
					console.log("---------- Press REPEAT ------------");
					screens.testPassedScreen.repeatPressed();
					screens.startScreen.startPressed();
				}, 100);

			} else {

				setTimeout(function () {
					screens.testPassedScreen.nextPressed();
				}, 100);

			}
		});

		testSession.start();
	};

	return testCase;

	// ------------ RUN TEST ---------------
	//testCase();

	//=======================================================

});
