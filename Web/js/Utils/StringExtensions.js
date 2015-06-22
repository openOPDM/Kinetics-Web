define(['jQuery', 'underscore'], function ($, _) {
	return {
		isEmpty: function (value) {
			return !_.isString(value) || (_.isString(value) && value.length == 0);
		},
		isTrimmedEmpty: function (value) {
			return !_.isString(value) || (_.isString(value) && $.trim(value).length == 0);
		}
	};
});
