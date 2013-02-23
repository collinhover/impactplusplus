/**
 * Static utilities for screen.
 * @author Collin Hover - collinhover.com
 **/
 ig.module( 
	'game.helpers.utilsscreen' 
)
.requires(
	'game.helpers.utilsmath'
)
.defines( function(){ "use strict";

var _um = ig.utilsmath;
var _us = ig.utilsscreen = {};

/**
 * Gets if an axis aligned bounding box is in the screen.
 **/
_us.getIsAABBInScreen = function ( x, y, width, height ) {
	
	var adjustedX = x - ig.game.screen.x;
	var adjustedY = y - ig.game.screen.y;
	
	return _um.AABBIntersectsAABB( adjustedX, adjustedY, adjustedX + width, adjustedY + height, 0, 0, ig.system.width, ig.system.height );
	
};

} );