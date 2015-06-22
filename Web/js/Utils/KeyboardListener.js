/*global define:true */
define(['jQuery', 'underscore', 'backbone', 'jQuery.hotkeys'], function ($, _, Backbone) {
	"use strict";
	function getKeyName(keyCode) {
		return jQuery.hotkeys.specialKeys[keyCode] || String.fromCharCode(keyCode).toLowerCase();
	}

	var KeyboardListener = function () {
		this.keyPressed = [];
		this.keysToIgnore = ["f1", "f2", "f3", "f4", "f5", "f6", "f7", "f8", "f9", "f10", "f11", "f12"];
		_.bindAll(this, "_onKeyDown", "_onKeyUp");
	};

	_.extend(KeyboardListener.prototype, Backbone.Events, {
		dummyInput: $('#dummy-input'),
		start: function () {
			// Clear cached keys
			this.keyPressed.splice(0, this.keyPressed.length);
			$(document).off();
			$(document).on("keydown", this._onKeyDown);
			$(document).on("keyup", this._onKeyUp);

			$(document).on("click", function () {
				$('#dummy-input').focus();
			});

		},

		stop: function () {
			// Clear cached keys
			this.keyPressed.splice(0, this.keyPressed.length);

			$(document).off();
		},

		_onKeyDown: function (event) {
			var keyName = getKeyName(event.which), fallback = $('#dummy-input');
			if (_.indexOf(this.keysToIgnore, keyName) < 0) {
				if (event.which > 0) {
					event.preventDefault();//prevent test flow disruption if one of the control keys is accidentally clicked
				} else {
					keyName = fallback.val().length ? fallback.val()[fallback.val().length - 1] : -1;
					$('.timer-seconds').prepend(keyName + ' keyDown!!<br>');
				}
				var isRepeat = false,
					i;
				for (i = 0; i < this.keyPressed.length; i++) {
					if (this.keyPressed[i] === keyName) {
						isRepeat = true;
						break;
					}
				}
				if (!isRepeat) {
					this.keyPressed.push(keyName);
					this.trigger("keydown", keyName, this.keyPressed);
				}
			}
			//return true;

		},

		_onKeyUp: function (event) {

			var keyName = getKeyName(event.which), fallback = $('#dummy-input');
			if (_.indexOf(this.keysToIgnore, keyName) < 0) {
				if (event.which > 0) {
					event.preventDefault();//prevent test flow disruption if one of the control keys is accidentally clicked
				} else {
					keyName = fallback.val().length ? fallback.val()[fallback.val().length - 1] : -1;
					fallback.val('');
					$('.timer-seconds').prepend(keyName + ' keyUp!!<br>');
				}
				for (var i = 0; i < this.keyPressed.length; i++) {
					if (this.keyPressed[i] === keyName) {
						this.keyPressed.splice(i, 1);
						this.trigger("keyup", keyName, this.keyPressed);
						break;
					}
				}
			}

		}

	});

	return KeyboardListener;
});