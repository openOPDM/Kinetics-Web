define([
	'Testing/Models/TestScreens/ScreenBase',
	'Testing/Models/TestScreens/CheckTestResultsState',
	'Testing/Models/TestScreens/StartScreen',
	'Testing/Models/TestScreens/CountdownScreen',
	'Testing/Models/TestScreens/SelectTestTypeState',
	'Testing/Models/TestScreens/TestEndsScreenBase',
	'Testing/Models/TestScreens/TestingNMScreen',
	'Testing/Models/TestScreens/TestingPQScreen',
	'Testing/Models/TestScreens/SummaryScreen',
	'Testing/Models/TestScreens/TestDetailsScreen'
], function (ScreenBase, CheckTestResultsState, StartScreen, CountdownScreen, SelectTestTypeState, TestEndsScreenBase, TestingNMScreen, TestingPQScreen, SummaryScreen, TestDetailsScreen) {
	'use strict';

	var TestScreens = {
		ScreenBase: ScreenBase,
		CheckTestResultsState: CheckTestResultsState,
		StartScreen: StartScreen,
		CountdownScreen: CountdownScreen,
		SelectTestTypeState: SelectTestTypeState,
		TestingNMScreen: TestingNMScreen,
		TestingPQScreen: TestingPQScreen,
		TestPassedScreen: TestEndsScreenBase.extend({}),
		TestCanceledScreen: TestEndsScreenBase.extend({}),
		SummaryScreen: SummaryScreen,
		TestDetailsScreen: TestDetailsScreen
	};


	return TestScreens;
});
