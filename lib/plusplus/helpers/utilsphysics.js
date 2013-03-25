/**
 * Static utilities for physics.
 * @author Collin Hover - collinhover.com
 **/
ig.module(
	'game.helpers.utilsphysics'
)
.requires(
	'game.core.shared',
	'game.physics.box2d'
)
.defines( function(){ "use strict";

var _s = ig.shared;
var _b2 = ig.Box2D;
var _utp = ig.utilsphysics = {};

// static values used in conversions

var VELOCITY_TO_SPEED = 2.25;

// definition objects for tile to shape conversions

_utp.defaultTileVerticesDef = {};
_utp.defaultTileSegmentsDef = {};

/**
 * Converts between speed and velocity, useful for objects using a motorized joint.
 * @param {Number} velocity.
 * @param {Number} radius.
 * @returns {Number} converted.
 **/
_utp.getSpeedFromVelocity = function ( velocity, radius ) {
	
	return VELOCITY_TO_SPEED * velocity / ( radius * _s.SCALE_PHYSICS * 2 );
	
};

_utp.getVelocityFromSpeed = function ( speed, radius ) {
	
	return speed * ( radius * _s.SCALE_PHYSICS * 2 ) / VELOCITY_TO_SPEED;
	
};

/**
 * Converts plain objects with relative x and y to entity into b2Vec2.
 * @param {Array} vertices relative to entity.
 * @param {Number} half of entity size x to offset.
 * @param {Number} half of entity size x to offset.
 * @returns {Array} vertices relative to entity.
 **/
_utp.getb2Vectors = function ( vertices, halfSizeX, halfSizeY ) {
	
	halfSizeX = halfSizeX || 0;
	halfSizeY = halfSizeY || 0;
	
	var b2vertices = [];
	
	for ( var i = 0; i < vertices.length; i++ ){
		
		var vertex = vertices[ i ];
		
		b2vertices[ i ] = new _b2.Vec2(
			( vertex.x - halfSizeX ) * _s.SCALE_PHYSICS,
			( vertex.y - halfSizeY ) * _s.SCALE_PHYSICS
		);
		
	}
	
	return b2vertices;
	
};

/**
* Executes a callback on each item in a Box2D-like stack.
* @param {Object} heap.
* @param {Function} callback to call.
* @param {Object|Array} arguments to pass to the callback.
**/
_utp.forEachInStack = function ( heap, callback, args ) {
	
	var item = heap;
	while( item ) {
		callback.apply( item, args );
		var next = item.GetNext();
		item = item !== next && next;
	}
	
};

} );