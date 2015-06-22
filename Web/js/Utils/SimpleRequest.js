/*global define:true */
define([
	'jQuery',
	'underscore',
	'backbone',
	'DataLayer/Constants',
	'DataLayer/ServerInteractionSerializersHash'
], function ($, _, Backbone, DataConstants, ServerInteractionSerializersHash) {
	"use strict";
	//retrieve various required data from server and update constants
	return function (options) {

		var request = ServerInteractionSerializersHash[options.target][options.method].buildRequest(options.options, options.model);
		$.ajax({
			url: DataConstants.serverUrl,
			type: 'POST',
			contentType: 'application/json; charset=UTF-8',
			data: JSON.stringify(request),
			dataType: 'json',
			success: function (data) {
				if (!data.error) {
					options.success(data.response['function'] && data.response['function'].data);
				} else {
					if (options.error) {
						options.error();
					}
				}

			}
		});
	};

});