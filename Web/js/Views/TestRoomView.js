/*global define: true */
define([
	'underscore',
	'moment',
	'backbone',
	'DataLayer/Constants',
	'text!Templates/TestRoom.html',
	'text!Templates/TestRoomConfirmation.html',
	'Views/TestRoomResultRowView',
	'Views/PatientInfoView',
	'Models/Constants',
	'Models/TestSessionResultsRowCollection',
	'Utils/Dialog'
], function (_, moment, Backbone, DataLayerConstants, templateHtml, templateConfirmationHtml, TestRoomResultRowView, PatientInfoView, Constants, TestSessionResultsRowCollection, Dialog) {
	'use strict';

	return Backbone.View.extend({
		tagName: "div",
		className: "content-wrapper",
		template: _.template(templateHtml),
		templateConfirmation: _.template(templateConfirmationHtml),

		events: {
			"click .id-button-start-test": "_onStartTest",
			"click .all-check": "_onSelectAll",
			"click .id-button-delete": "_onDeleteSelected",
			"click .id-button-trend-report": "_onTrendReport",
			"click .id-button-share-all": "_onShareAll"
		},

		initialize: function (options) {
			var that = this;
			if (!this.model && this.model instanceof TestSessionResultsRowCollection) {
				throw new Error("Model not set or wrong type.");
			}

			this._adminMode = options.adminMode;
			this._ownTestRoom = options.ownTestRoom;
			this._analystMode = options.analystMode;
			this.model.readOnly = options.readOnly || false;
			this._readOnly = options.readOnly || false;
			this.model.analystMode = this._analystMode;
			this.model.ownRoom = this._ownTestRoom;

			this.listenTo(this.model, {
				"add": this._onAdd,
				"remove": this._onRemove,
				"reset": this._onReset
			});

			this._rowViews = {};

			this._initializeRowViews();

			this.dialog = new Dialog();
			this.listenTo(this.dialog, {
				'delete-confirmed': function () {
					that.trigger("delete", that._getSelectedModels());

					that._updateNoResultRow();

					// Reset "select all" check box
					if (that.$checkAll.hasClass("checked")) {
						that.$checkAll.removeClass("checked");
					}
				}
			});
		},

		ownTestRoom: function () {
			return this._ownTestRoom;
		},

		_initializeRowViews: function () {
			var that = this;
			_.forEach(this.model.models, function (rowModel) {
				this._rowViews[rowModel.cid] = new TestRoomResultRowView({
					model: rowModel,
					analystMode: that._analystMode,
					ownRoom: that._ownTestRoom,
					readOnly: that._readOnly
				});
			}, this);
		},

		_onAdd: function (rowModel) {
			var rowView = new TestRoomResultRowView({ model: rowModel });
			this._rowViews[rowModel.cid] = rowView;

			// Because by default results sorted by date new result have to be at first position.
			// NOTE: If sorting may be changeable by UI then this piece of code should be refactored.
			this.$headerRow.after(rowView.render().el);

			this._updateNoResultRow();
		},

		_onRemove: function (rowModel) {
			// Find row view by model id
			var rowView = this._rowViews[rowModel.cid];
			// Remove row view from DOM
			rowView.remove();
			// Destroy row view
			delete this._rowViews[rowModel.cid];

			this._updateNoResultRow();
		},

		_onReset: function () {
			this._removeAllRowsViews();
			this._initializeRowViews();

		},

		_onSelectAll: function () {
			this.$checkAll.toggleClass("checked");

			var checkedAll = this.$checkAll.hasClass("checked");
			_.each(this._rowViews, function (rowView) {
				rowView.selected(checkedAll);
			});
		},

		render: function () {
			var isAvanir = DataLayerConstants.branding === "Avanir";
			this.$el.html(this.template(_.extend(this.model, {
				_isAvanir: isAvanir
			})));
			this.$checkAll = this.$(".all-check .tick");
			this.$resultTable = this.$(".result-table");
			this.$headerRow = this.$(".result-header-row");
			this.$noResultsRow = this.$(".id-no-results");

			this._fillRows();
			return this;
		},

		showUserInfo: function (userProfile) {
			if (userProfile) {
				// Get container for patient info
				var headerContainer = this.$(".id-header-container h1");

				// Add patient info to container
				new PatientInfoView({
					model: userProfile,
					analystMode: this._analystMode,
					showProjects:  this.model.get('role') !== Constants.UserRole.SiteAdmin
				}).embed(headerContainer);
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

		_onStartTest: function () {
			this.trigger("start-test");
		},

		_onShareAll: function () {
			this.trigger('share-all');
		},

		_getSelectedModels: function () {
			var selected = [];
			_.each(this._rowViews, function (rowView) {
				if (rowView.selected()) {
					selected.push(rowView.model);
				}
			});
			return selected;
		},

		_onDeleteSelected: function () {
			var selectedModels = this._getSelectedModels();
			if (selectedModels.length) {
				this.dialog.show('confirm', this.templateConfirmation({ moment: moment, selected: selectedModels }), 'delete');
			}
		},

		_onTrendReport: function () {
			this.trigger("trend-report");
		},

		hide: function () {
			this.$el.hide();
		},

		show: function () {
			this.$el.show();
		}
	});

});
