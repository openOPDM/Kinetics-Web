define([
	'underscore'
], function (_) {
	'use strict';

	var MultiDeletionCollectionExtension = {
		// Destroy the models on the server if it was already persisted.
		// Optimistically removes the model from its collection, if it has one.
		// If `wait: true` is passed, waits for the server to respond before removal.
		// NOTE: This method is almost full copied of method Backbone.Model.prototype.destroy
		// but adapted for multiple deleting by one query.
		destroyMany: function (sourceModels, options) {
			options = options ? _.clone(options) : {};

			var success = options.success;

			var destroy = function (model) {
				model.trigger('destroy', model, model.collection, options);
			};

			options.success = function (models, resp, options) {
				if (options.wait) {
					_.forEach(models, function (model) {
						destroy(model);
					});
				}
				if (success) {
					success(sourceModels, resp, options);
				}
			};

			var filteredModels = _.filter(sourceModels, function (model) {
				if (model.isNew()) {
					destroy(model);
					//options.success(this, null, options);
					return false;
				} else {
					return true;
				}
			});

			if (filteredModels.length > 0) {
				var xhr = this.sync('delete', filteredModels, options);
				if (!options.wait) {
					_.forEach(filteredModels, function (model) {
						destroy(model);
					});
				}
			} else {
				// Deleted only new models or anyone
				if (success) {
					success(sourceModels, null, options);
				}
			}
			return xhr;
		}
	};

	return {
		extend: function (collection) {
			_.extend(collection, MultiDeletionCollectionExtension);
		}
	};
});
