define([
	'backbone',
	'Testing/Views/ScreenViewsSetFactory',
	'Testing/Views/NavigationPanelView',
	'Testing/Views/TestAudioView'
], function (Backbone, ScreenViewsSetFactory, NavigationPanelView, TestAudioView) {
	'use strict';

	return Backbone.View.extend({
		initialize: function () {
			this.testViews = ScreenViewsSetFactory.createViews({accountManager: this.options.accountManager});
			this._initializeNavigationPanel();
			this._initializeTestAudio();
		},

		_initializeNavigationPanel: function () {
			// Prepare model for navigation panel
			var stages = _.map(this.model.testTransitions.table, function (stateItem) {
				return stateItem.state;
			});
			this.navigationPanelView = new NavigationPanelView({ model: stages });
		},
		_initializeTestAudio: function () {
			this.testAudioView = new TestAudioView();
		},

		render: function () {
			this.$el.append(this.navigationPanelView.el);

			for (var i = 0; i < this.testViews.length; i++) {
				var testView = this.testViews[i];
				this.$el.append(testView.el);
			}
			this.$el.append(this.testAudioView.el);
			return this;
		},

		// Remove this view by taking the screen viand navigation panel ew elements out of the DOM.
		remove: function () {
			this.navigationPanelView.$el.remove();

			for (var i = 0; i < this.testViews.length; i++) {
				var testView = this.testViews[i];
				testView.$el.remove();
			}

			this.testAudioView.$el.remove();
			return this;
		},

		hide: function () {
			this.navigationPanelView.$el.hide();
			for (var i = 0; i < this.testViews.length; i++) {
				var testView = this.testViews[i];
				testView.$el.hide();
			}
		},

		show: function () {
			this.navigationPanelView.$el.show();
			for (var i = 0; i < this.testViews.length; i++) {
				var testView = this.testViews[i];
				testView.$el.show();
			}
		}
	});

});
