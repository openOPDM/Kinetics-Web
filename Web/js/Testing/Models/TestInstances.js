define([
	'Testing/Models/Test',
	'Testing/Models/TestPropertiesHash',
	'Testing/Models/ScreenTransitionsInstance'
], function (Test, testPropertiesHash, screenTransitions) {
	// Declare tests of test session
	var tests = {
		rightNMTest: new Test(null, null, testPropertiesHash.rightNMTest, screenTransitions),
		leftNMTest: new Test(null, null, testPropertiesHash.leftNMTest, screenTransitions),
		rightPQTest: new Test(null, null, testPropertiesHash.rightPQTest, screenTransitions),
		leftPQTest: new Test(null, null, testPropertiesHash.leftPQTest, screenTransitions)
	};

	return tests;
});