define(function () {
	return {
		// Round to nearby lower multiple of base
		floorInBase: function (n, base) {
			return base * Math.floor(n / base);
		},

		// Round to nearby upper multiple of base
		ceilInBase: function (n, base) {
			return base * Math.ceil(n / base);
		},

		getPrecision: function (number) {
			var precision = 0;
			number = Math.abs(number);
			if (number < 1 && number > 0) {
				precision = 0;
				while (Math.floor(number *= 10) == 0) {
					precision++;
				}
			}
			return precision;
		}
	};
});
