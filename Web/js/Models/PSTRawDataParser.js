define(['underscore'], function (_) {
	return {
		parse: function (rawData) {
			if (rawData != null && !_.isString(rawData)) {
				throw new Error("Invalid argument exception.");
			}

			if (rawData == null) return null;

			var splitData = rawData.split(";");

			var parsedData = {
				AREA: splitData[0],
				RMS: splitData.length > 1 ? splitData[1] : null
			};

			return parsedData;
		}
	};
});