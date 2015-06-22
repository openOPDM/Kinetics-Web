/*global define:  true */
define([
	'underscore',
	'Testing/Views/ScreenViewBase',
	'text!Testing/Templates/StartScreen.html',
	'Utils/AudioHelper'
], function (_, ScreenViewBase, templateSource, sound) {
	'use strict';

	return ScreenViewBase.extend({
		events: {
			"click .id-button-back": "_onBack",
			"click .id-button-start": "_onStart",
			"click .id-button-next": "_onNext"
		},

		template: _.template(templateSource),

		initialize: function () {
			// Call base implementation
			ScreenViewBase.prototype.initialize.apply(this, arguments);

			this._accountManager = this.options.accountManager;

			this.listenTo(this.model, {
				"pause-video-tutorial": this._pauseVideoTutorial
			});
		},

		render: function () {
			ScreenViewBase.prototype.render.call(this);

			this.video = this.$(".id-video")[0];
			if (this.video) {
				this.$(".video-loading").fadeIn(100);
				this.$(".id-video").on("canplay", _.bind(function () {
					this.$(".video-loading").fadeOut(100);
				}, this));
			}

			// Hide Back button for first test
			if (this._testContext) {
				if (this._testContext.get("firstTest")) {
					this.$(".id-button-back").toggleClass("hidden");
				}
			}

			return this;
		},

		_pauseVideoTutorial: function () {
			if (this.video.pause) {
				this.video.pause();
			}
		},

		_onBack: function () {
			this.model.backPressed();
		},

		_onStart: function () {
			// Fixed bug introduced in 63f7cf3
			// No need to update ticket in try mode
			var currentUser = this._accountManager.get('currentUser');
			if (currentUser) {
				currentUser.fetch({
					accountManager: this._accountManager,
					getOwn: true,
					success: _.bind(this.startTest, this)
				});
			} else {
				this.startTest();
			}
		},

		_onNext: function () {
			this.model.nextPressed();
		},

		startTest: function () {
			$('#dummy-input').focus();
			sound.play('test-sound-start');
			this.model.startPressed();
		}
	});
});
