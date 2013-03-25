/**
 * Static utilities for math.
 * @author Collin Hover - collinhover.com
 **/
ig.module( 
	'game.helpers.utilsmath' 
)
.defines( function(){ "use strict";

var _utm = ig.utilsmath = {};

// constants

_utm.GOLDEN_ANGLE = Math.PI * (3 - Math.sqrt(5));
_utm.TWOPI = Math.PI * 2;
_utm.HALFPI = Math.PI * 0.5;

/**
* Checks two numbers to see if almost equal.
* @param {Number} Number a.
* @param {Number} Number b.
* @param {Number} Threshold.
* @returns {Boolean} true if numbers are almost equal.
**/
_utm.almostEqual = function ( a, b, threshold ) {
	
	if ( a === b ) return true;
	else {
		
		var d = b - a;
		
		return d > 0 ? d < threshold : d > -threshold;
	
	}
};

/**
* Checks two numbers to see if on opposite sides of zero.
* @param {Number} Number a.
* @param {Number} Number b.
* @returns {Boolean} true if numbers are on opposite sides of zero.
**/
_utm.oppositeSidesOfZero = function ( a, b ) {
	
	return ( a < 0 && b > 0 ) || ( a > 0 && b < 0 );
	
};

/**
* Checks the direction of a number.
* @param {Number} Number.
* @returns {Number} -1, 0, or 1
**/
_utm.direction = function ( n ) {
	
	return n === 0 ? 0 : ( n < 0 ? -1 : 1 );
	
};

/**
* Checks two numbers to see if a change in direction has occured.
* @param {Number} Number a.
* @param {Number} Number b.
* @returns {Boolean} true if numbers are on opposite sides of zero, or one is 0 and other is not.
**/
_utm.directionChange = function ( a, b ) {
	
	return ( a === 0 && b !== 0 ) || ( a !== 0 && b === 0 ) || _utm.oppositeSidesOfZero( a, b );
	
};


} );