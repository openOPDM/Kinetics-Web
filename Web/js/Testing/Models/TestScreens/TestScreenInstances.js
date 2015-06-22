// Declare screen logic representative objects
define(['Testing/Models/TestScreens/TestScreens'], function (TestScreens) {
	'use strict';

	return {
		checkResults: new TestScreens.CheckTestResultsState(),
		startScreen: new TestScreens.StartScreen(),
		countdownScreen: new TestScreens.CountdownScreen(),
		selectTestState: new TestScreens.SelectTestTypeState(),
		testingNMScreen: new TestScreens.TestingNMScreen(),
		testingPQScreen: new TestScreens.TestingPQScreen(),
		testPassedScreen: new TestScreens.TestPassedScreen(),
		testCanceledScreen: new TestScreens.TestCanceledScreen(),
		summaryScreen: new TestScreens.SummaryScreen(),
		testDetailsScreen: new TestScreens.TestDetailsScreen()
	};
});

