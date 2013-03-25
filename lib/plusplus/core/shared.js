/**
 * Shared data object for help with game wide settings or data.
 * @author Collin Hover - collinhover.com
 **/
ig.module( 
	'game.core.shared' 
)
.defines( function(){ "use strict";

var _s = ig.shared = {};

_s.debug = true;

// throttle/debounce presets

_s.throttleDuration = 500;
_s.throttleDurationShort = 60;
_s.throttleDurationMedium = 250;

// how much of width/height of window to fill

_s.canvasWidthPct = 1;
_s.canvasHeightPct = 1;

// base size of game

_s.gameWidth = 320;
_s.gameHeight = 240;

// scale of game

_s.SCALE = 4;

// use for entities that never move

_s.STATIC = "static";

// use for entities that can move but have no physics

_s.DYNAMIC = "dynamic";

// use for entities that have physics

_s.KINEMATIC = "kinematic";

// base size upon which base character speed is calculated

_s.CHARACTER_SIZE_BASE_X = 16;
_s.CHARACTER_SIZE_BASE_Y = 48;

// physics properties

_s.SCALE_PHYSICS = 0.1;

// precision and slop

_s.PRECISION_ZERO = 0.01;
_s.SLOP_PCT_ONE_SIDED = 0.15;

} );