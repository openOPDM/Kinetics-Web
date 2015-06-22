/*global define: true */
define([
	'jQuery',
	'underscore',
	'backbone',
	'text!Templates/AnalystRoom.html',
	'Models/UserProfileCollection',
	'Views/AnalystRoomRowView'
], function ($, _, Backbone, templateHtml, UserProfileCollection, UserListRowView) {
	'use strict';

	return Backbone.View.extend({
		tagName: "div",
		className: "content-wrapper analyst-room",
		template: _.template(templateHtml),

		events: {
			"click .id-button-create-new": "_onClickCreateNew",
			"click .id-button-add-existing": "_onClickAddExisting"
		},

		initialize: function () {
			if (!this.model && this.model instanceof UserProfileCollection) {
				throw new Error("Model not set or wrong type.");
			}

			this._initializeRowViews();
			//this._fillRows();

			this.listenTo(this.model, {
				"reset": this._onReset
			});

			this._rowViews = {};

		},

		_onReset: function () {
			this._removeAllRowsViews();
			this._initializeRowViews();
			this._fillRows();
		},

		// Remove view from DOM
		remove: function () {
			// Destroy row views
			this._removeAllRowsViews();

			// Call base implementation
			Backbone.View.prototype.remove.call(this);
		},

		// Destroy all row view
		_removeAllRowsViews: function () {
			_.each(this._rowViews, function (rowView, key, collection) {
				rowView.remove();
				delete collection[key];
			});
		},

		_initializeRowViews: function () {
			if (this.model) {
				_.forEach(this.model.models, function (rowModel) {
					this._rowViews[rowModel.cid] = new UserListRowView({ model: rowModel });
				}, this);
			}
		},

		_fillRows: function () {
			_.each(this.model.models, function (rowModel) {
				var rowView = this._rowViews[rowModel.cid];
				this.$resultTable.append(rowView.render().el);
			}, this);

			this._updateNoResultRow();
		},

		_updateNoResultRow: function () {
			if (this.model.length > 0) {
				this.$noResultsRow.hide();
			} else {
				this.$noResultsRow.show();
			}
		},

		render: function () {
			this.$el.html(this.template(this.model.attributes));

			this.$noResultsRow = this.$(".id-no-results");
			this.$resultTable = this.$(".result-table");

			return this;
		},

		hide: function () {
			this.$el.hide();
		},

		show: function () {
			this.$el.show();
		},

		_onClickAddExisting: function () {
			this.model.trigger("addExisting");
		},

		_onClickCreateNew: function () {
			this.model.trigger("createNew");
		}
	});

});
