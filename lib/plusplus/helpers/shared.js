/**
 * Shared data object for help with game wide settings or data.
 * @author Collin Hover - collinhover.com
 **/
ig.module( 
	'plusplus.helpers.shared' 
)
.defines( function(){ "use strict";

var _s = ig.shared = {};

_s.debug = true;

// throttle/debounce presets

_s.throttleDuration = 500;
_s.throttleDurationShort = 60;
_s.throttleDurationMedium = 250;


_s.zeroPrecision = 0.01;

// how much of width/height of window to fill

_s.canvasWidthPct = 1;
_s.canvasHeightPct = 1;

// base size of game

_s.gameWidth = 320;
_s.gameHeight = 240;

// scale of game

_s.scale = 5;

// physics properties

_s.physicsScale = 0.1;
_s.oneSidedSlopPct = 0.15;

} );