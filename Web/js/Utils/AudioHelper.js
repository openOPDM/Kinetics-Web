/*global define:true */
define([
	'jQuery',
	'underscore',
	'lowLag'
], function ($, _, lowLag) {
	"use strict";
	var loaded = [],
		lowLagOptions = {'urlPrefix': 'audio/'},
		audioHelper,
		a = document.createElement('audio'),
		audioSupport = {
			basic: !!a.canPlayType,
			mp3: !!(a.canPlayType && a.canPlayType('audio/mpeg;').replace(/no/, '')),
			ogg: !!(a.canPlayType && a.canPlayType('audio/ogg; codecs="vorbis"').replace(/no/, '')),
			wav: !!(a.canPlayType && a.canPlayType('audio/wav; codecs="1"').replace(/no/, ''))
		},
		audioElements = {};
	if ($.browser.msie) {
		audioHelper = {
			play: audioSupport.basic ? function (audio) {
				if (!audioElements[audio]) {
					audioElements[audio] = $('#' + audio).get(0);
				}
				audioElements[audio].pause();
				audioElements[audio].currentTime = 0;
				audioElements[audio].play();
			} : $.noop,
			pause: function (audio) {
				audioElements[audio].currentTime = 0;
				audioElements[audio].pause();
			}
		};
	} else {
		lowLag.init(lowLagOptions);
		audioHelper = {
			play: function (sound) {
				if (_.indexOf(loaded, sound) < 0) {
					var soundOrder = !$.browser.mozilla ? [sound + '.mp3', sound + '.ogg', sound + '.wav'] : [sound + '.ogg', sound + '.mp3', sound + '.wav'];

					lowLag.load(soundOrder, sound);
					loaded.push(sound);
				}
				lowLag.play(sound);
			},
			pause: function (sound) {
				lowLag.pause(sound);
			}
		};
	}
	return audioHelper;
});