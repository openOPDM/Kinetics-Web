/*global define: true */
define([
	'backbone',
	'underscore',
	'Models/Constants',
	'Models/ErrorConstants',
	'DataLayer/ModelSyncExtension',
	'DataLayer/ServerInteractionSerializersHash',
	'backbone.localStorage'
], function (Backbone, _, Constants, ErrorConstants, ModelSyncExtension, ServerInteractionSerializersHash) {
	'use strict';

	var AnalystRoom = Backbone.Model.extend({
		initialize: function () {
		}
	});
	ModelSyncExtension.extend(AnalystRoom.prototype, {
		//'unassign': ServerInteractionSerializersHash.AccountManager.unassignPatient
	});

	return AnalystRoom;
});