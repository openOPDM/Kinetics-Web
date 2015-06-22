/*global define:true */
define([
	'backbone',
	'underscore',
	'Models/Extension',
	'DataLayer/ModelSyncExtension',
	'DataLayer/ServerInteractionSerializersHash'
], function (Backbone, _, ExtensionModel, ModelSyncExtension, ServerInteractionSerializersHash) {
	'use strict';

	var ExtensionsCollection = Backbone.Collection.extend({
		model: ExtensionModel
	});


	ModelSyncExtension.extend(ExtensionsCollection.prototype, {
		'read': ServerInteractionSerializersHash.ExtensionManager.getAll
	});

	return ExtensionsCollection;
});
