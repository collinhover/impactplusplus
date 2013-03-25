/**
 * Static utilities for general use.
 * @author Collin Hover - collinhover.com
 **/
ig.module( 
	'game.helpers.utils' 
)
.requires(
	'game.helpers.shims',
	'game.core.shared'
)
.defines( function(){ "use strict";

var _g = ig.global;
var _s = ig.shared;
var _ut = ig.utils = {};

/**
* Finds type of object, slower than typeof or instanceof but sometimes necessary.
* @param {Object} Target object
* @returns {String} Type of object
*/
_ut.type = function ( o ) {
	return o==null?o+'':Object.prototype.toString.call(o).slice(8,-1).toLowerCase();
};

/**
* Checks if target is number.
* @param {Object} Target object
* @returns {Boolean} true if number, false if not
*/
_ut.isNumber = function ( n ) {
	return !isNaN( n ) && isFinite( n ) && typeof n !== 'boolean';
};

/**
* Checks if target is array.
* @param {Object} Target object
* @returns {Boolean} true if array, false if not
**/
_ut.isArray = function ( target ) {
	return Object.prototype.toString.call( target ) === '[object Array]';
};

/**
* Ensures an object is an array.
* @param {Object} Target object
* @returns {Array} Array
**/
_ut.toArray = function ( target ) {
	
	return target ? ( _ut.isArray ( target ) !== true ? [ target ] : target ) : [];
	
};

/**
* Ensures an object is not an array.
* @param {Array} Target object or array
* @param {Number} Index of array to use if target is an array.
* @returns {Object} Object
**/
_ut.toNotArray = function ( target, index ) {
	
	return _ut.isArray( target ) === true ? target[ index || 0 ] : target;
	
};

/**
* Add element to target array only if not already in array.
* @param {Array} Target array
* @param {*} Single value to add
* @returns {Array} Array containing elements
**/
_ut.arrayCautiousAdd = function ( target, element ) {
	
	var index = _ut.indexOfValue( target, element );
	
	if ( index === -1 ) {
		
		target.push( element );
		
	}
	
	return target;
	
};

/**
* Add elements to target array only if not already in array.
* @param {Array} Target array
* @param {*} Single object or array of values to add
* @returns {Array} Array containing elements
**/
_ut.arrayCautiousAddMulti = function ( target, elements ) {
	
	var element, index;
	
	elements = _ut.toArray( elements );
	
	// for each element
	
	for ( var i = 0, il = elements.length; i < il; i++ ) {
		
		element = elements[ i ];
		
		if ( element !== target ) {
			
			index = _ut.indexOfValue( target, element );
			
			if ( index === -1 ) {
				
				target.push( element );
				
			}
			
		}
		
	}
	
	return target;
	
};

/**
* Removes element from target array.
* @param {Array} Target array
* @param {*} Single value to add
* @returns {Array} Array containing elements
**/
_ut.arrayCautiousRemove = function ( target, element ) {
	
	var index = _ut.indexOfValue( target, element );
	
	if ( index !== -1 ) {
		
		target.splice( index, 1 );
		
	}
	
	return target;
	
};

/**
* Removes elements from target array.
* @param {Array} Target array
* @param {*} Single object or array of values to add
* @returns {Array} Array containing elements
**/
_ut.arrayCautiousRemoveMulti = function ( target, elements ) {
	
	var element, index;
	
	elements = _ut.toArray( elements );
	
	// for each element
	
	for ( var i = 0, il = elements.length; i < il; i++ ) {
		
		element = elements[ i ];
		
		if ( element !== target ) {
			
			index = _ut.indexOfValue( target, element );
			
			if ( index !== -1 ) {
				
				target.splice( index, 1 );
				
			}
			
		}
		
	}
	
	return target;
	
};

/**
* Executes a callback on each item in an array, in the context of that item.
* @param {Array} Array to iterate over
* @param {Callback} Callback to call
* @param {Array} Arguments to pass
**/
_ut.forEach = function ( array, callback, args ) {
   
   for ( var i = 0, il = array.length; i < il; i++ ) {
	   
	   callback.apply( array[ i ], args );
	   
   }
   
};

/**
* Find the index of value in an array. May be faster than the native indexOf.
* @param {Array} Array to search
* @param {*} Value of property to match
* @returns {Number} >= 0 if found, -1 if not
**/
_ut.indexOfValue = function ( array, value ) {
	
	for ( var i = 0, il = array.length; i < il; i++ ) {
		
		if ( value === array[ i ] ) {
			
			return i;
			
		}
		
	}
	
	return -1;
	
};

/**
* Find the index of an object in an array with property = value.
* @param {Array} Array to search
* @param {String} Property name
* @param {*} Value of property to match
* @returns {Number} >= 0 if found, -1 if not
**/
_ut.indexOfProperty = function ( array, property, value ) {
	
	for ( var i = 0, il = array.length; i < il; i++ ) {
		
		if ( value === array[ i ][ property ] ) {
			
			return i;
			
		}
		
	}
	
	return -1;
	
};

/**
* Find the index of an object in an array matching all property values.
* @param {Array} Array to search.
* @param {Array} Property names.
* @param {Array} Values to match.
* @returns {Number} >= 0 if found, -1 if not
**/
_ut.indexOfProperties = function ( array, properties, values ) {
	
	for ( var i = 0, il = array.length; i < il; i++ ) {
		
		var obj = array[ i ];
		var missing = false;
		
		for ( var j = 0, jl = properties.length; j < jl; j++ ) {
			
			if ( values[ j ] !== obj[ properties[ j ] ] ) {
				
				missing = true;
				break;
				
			}
			
		}
		
		if ( missing !== true ) {
			
			return i;
			
		}
		
	}
	
	return -1;
	
};

/**
* Throttle a function to execute no more than once per delay (its like a cooldown), based on Ben Alman's jQuery Throttle / Debounce.
* @param {Function} Callback function
* @param {Number} (optional) Delay in ms
* @param {Boolean} (optional) Whether to allow a trailing execution
* @returns {Function} Throttled function.
**/
_ut.throttle = function ( callback, delay, trailing ) {
	
	var timeoutId;
	var timeLast = 0;
	
	if ( _ut.isNumber( delay ) !== true ) {
		
		delay = _s.throttleDuration;
		
	}
	
	function throttled () {
		
		var me = this;
		var elapsed = Date.now() - timeLast;
		var args = arguments;
		
		function execute () {
			
			timeLast = Date.now();
			callback.apply( me, args );
			
		}
		
		if ( elapsed > delay ) {
			
			timeoutId && _g.clearTimeout( timeoutId );
			
			execute();
			
		}
		else if ( trailing !== false ) {
			
			timeoutId && _g.clearTimeout( timeoutId );
			
			timeoutId = _g.setTimeout( execute, delay - elapsed );
			
		}
		
	}
	
	return throttled;
	
};

/**
* Debounce a function to execute only once delay reached between subsequent calls, based on Ben Alman's jQuery Throttle / Debounce.
* @param {Function} Callback function
* @param {Number} (optional) Delay in ms 
* @returns {Function} Debounced function.
**/
_ut.debounce = function ( callback, delay ) {
	
	var timeoutId;
	
	if ( _ut.isNumber( delay ) !== true ) {
		
		delay = _s.throttleDuration;
		
	}
	
	function debounced () {
		
		var me = this;
		var args = arguments;
		
		timeoutId && _g.clearTimeout( timeoutId );
		
		timeoutId = _g.setTimeout( function () {
			
			callback.apply( me, args );
			
		}, delay );
		
	}
	
	return debounced;
	
};

/**
* Cooldown a function to execute once and then, if successful, delay.
* @param {Function} Callback function that returns false if not successful.
* @param {Number} (optional) Delay in ms, though if it is 0 the original callback will be returned.
* @returns {Function} Cooldowned function.
**/
_ut.cooldown = function ( callback, delay, context ) {
	
	var timeLast = 0;
	
	if ( _ut.isNumber( delay ) !== true ) {
		
		delay = _s.throttleDuration;
		
	}
	else if ( delay === 0 ) {
		
		return callback;
		
	}
	
	function cooldowned () {
		
		var elapsed = Date.now() - timeLast;
		
		if ( elapsed > delay ) {
			
			if ( callback.apply( context || this, arguments ) !== false ) {
				
				timeLast = Date.now();
				
			}
			
		}
		
	}
	
	return cooldowned;
	
};

} );