define([
	'./StateTransitions',
	'./TestScreens/TestScreenInstances'
], function (StateTransitions, screens) {

	var screenTransitions = new StateTransitions("checkResults", [
		{
			stateName: "checkResults",
			state: screens.checkResults,
			transitions: [
				{ signal: "noResults", stateName: "start" },
				{ signal: "passed", stateName: "passed" },
				{ signal: "canceled", stateName: "canceled" }
			]
		},
		{
			stateName: "start",
			state: screens.startScreen,
			transitions: [
				{ signal: "start", stateName: "countdown" }
			]
		},
		{
			stateName: "countdown",
			state: screens.countdownScreen,
			transitions: [
				{ signal: "countdownEnds", stateName: "selectTest" },
				{ signal: "stop", stateName: "canceled" }
			]
		},
		{
			stateName: "selectTest",
			state: screens.selectTestState,
			transitions: [
				{ signal: "startNMTest", stateName: "testingNM" },
				{ signal: "startPQTest", stateName: "testingPQ" }
			]
		},
		{
			stateName: "testingNM",
			state: screens.testingNMScreen,
			transitions: [
				{ signal: "testEnds", stateName: "passed" },
				{ signal: "stop", stateName: "canceled" }
			]
		},
		{
			stateName: "testingPQ",
			state: screens.testingPQScreen,
			transitions: [
				{ signal: "testEnds", stateName: "passed" },
				{ signal: "stop", stateName: "canceled" }
			]
		},
		{
			stateName: "canceled",
			state: screens.testCanceledScreen,
			transitions: [
				{ signal: "repeat", stateName: "start" }
			]
		},
		{
			stateName: "passed",
			state: screens.testPassedScreen,
			transitions: [
				{ signal: "repeat", stateName: "start" }
			]
		}
	]);

	return screenTransitions;
});
