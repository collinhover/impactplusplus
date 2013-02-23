/**
 * Shared data object for help with game wide settings or data.
 * @author Collin Hover - collinhover.com
 **/
ig.module( 
	'game.helpers.shared' 
)
.defines( function(){ "use strict";

var _s = ig.shared = {};

_s.debug = true;

// throttle/debounce presets

_s.throttleDuration = 500;
_s.throttleDurationMedium = 250;
_s.throttleDurationShort = 60;

// how much of width/height of window to fill

_s.canvasWidthPct = 1;
_s.canvasHeightPct = 1;

// base size of game

_s.gameWidth = 320;
_s.gameHeight = 240;

// scale of game

_s.scale = 1;

} );