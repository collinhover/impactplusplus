/**
 * Static utilities for intersections.
 * @author Collin Hover - collinhover.com
 **/
ig.module( 
	'game.helpers.utilsintersection' 
)
.defines( function(){ "use strict";

var _uti = ig.utilsintersection = {};

/**
* @returns {Object} bounding object based on x, y, width, and height
**/
_uti.bounds = function ( x, y, width, height ) {
	
	return {
		minX: x,
		minY: y,
		maxX: x + width,
		maxY: y + height,
		width: width,
		height: height
	};
	
};

/**
* @returns {Object} bounding object based on min/max x/y
**/
_uti.boundsMinMax = function ( minX, minY, maxX, maxY ) {
	
	return {
		minX: minX,
		minY: minY,
		maxX: maxX,
		maxY: maxY,
		width: maxX - minX,
		height: maxY - minY
	};
	
};

/**
* Returns bounds from a set of points.
* @param {Array} Array of points.
* @returns {Object} Bounds with min/max x/y.
**/
_uti.boundsOfPoints = function ( points ) {
	
	var i, il, point = points[ 0 ];
	var minX = point.x;
	var minY = point.y;
	var maxX = point.x;
	var maxY = point.y;
	
	for ( i = 1, il = points.length; i < il; i++ ) {
		
		point = points[ i ];
		
		if ( point.x < minX ) minX = point.x;
		else if ( point.x > maxX ) maxX = point.x;
		if ( point.y < minY ) minY = point.y;
		else if ( point.y > maxY ) maxY = point.y;
		
	}
	
	return {
		minX: minX,
		minY: minY,
		maxX: maxX,
		maxY: maxY,
		width: maxX - minX,
		height: maxY - minY
	};
	
};

/**
* @returns {Object} bounding object based on bounds plus offset
**/
_uti.boundsClone = function ( bounds, offsetX, offsetY ) {
	
	offsetX = offsetX || 0;
	offsetY = offsetY || 0;
	
	var minX = bounds.minX + offsetX;
	var minY = bounds.minY + offsetY;
	var maxX = bounds.maxX + offsetX;
	var maxY = bounds.maxY + offsetY;
	
	return {
		minX: minX,
		minY: minY,
		maxX: maxX,
		maxY: maxY,
		width: maxX - minX,
		height: maxY - minY
	};
	
};

/**
* @returns {Object} bounding object based on bounds plus offset
**/
_uti.boundsCopy = function ( boundsA, boundsB, offsetX, offsetY, scaleX, scaleY ) {
	
	_uti.boundsCopyX( boundsA, boundsB, offsetX, scaleX );
	_uti.boundsCopyY( boundsA, boundsB, offsetY, scaleY );
	
	return boundsA;
	
};
/**
* @returns {Object} bounding object based on bounds plus offset
**/
_uti.boundsCopyX = function ( boundsA, boundsB, offsetX, scaleX ) {
	
	offsetX = offsetX || 0;
	scaleX = scaleX || 1;
	
	boundsA.minX = boundsB.minX * scaleX + offsetX;
	boundsA.maxX = boundsB.maxX * scaleX + offsetX;
	boundsA.width = boundsA.maxX - boundsA.minX;
	
	return boundsA;
	
};
/**
* @returns {Object} bounding object based on bounds plus offset
**/
_uti.boundsCopyY = function ( boundsA, boundsB, offsetY, scaleY ) {
	
	offsetY = offsetY || 0;
	scaleY = scaleY || 1;
	
	boundsA.minY = boundsB.minY * scaleY + offsetY;
	boundsA.maxY = boundsB.maxY * scaleY + offsetY;
	boundsA.height = boundsA.maxY - boundsA.minY;
	
	return boundsA;
	
};

/**
* Checks two 2D axis aligned bounding boxes: is A contained by B.
* @param {Number} min/max for a/b
**/
_uti.AABBContainedByAABB = function ( aminX, aminY, amaxX, amaxY, bminX, bminY, bmaxX, bmaxY ) {
	
	if ( aminX >= bminX
		&& amaxX <= bmaxX
		&& aminY >= bminY
		&& amaxY <= bmaxY ) {
		return true;
	}
	
	return false;
	
};

/**
* Checks two 2D axis aligned bounding boxes: is A intersects B.
* @param {Number} min/max for a/b
**/
_uti.AABBIntersectsAABB = function ( aminX, aminY, amaxX, amaxY, bminX, bminY, bmaxX, bmaxY ) {
	
	if ( amaxX < bminX ) return false;
	if ( aminX > bmaxX ) return false;
	if ( amaxY < bminY ) return false;
	if ( aminY > bmaxY ) return false;
	
	return true;
	
};

/**
* See _uti.AABBIntersectsAABB.
**/
_uti.AABBIntersectsAABBBounds = function ( boundsA, boundsB ) {
	
	if ( boundsA.maxX < boundsB.minX ) return false;
	if ( boundsA.minX > boundsB.maxX ) return false;
	if ( boundsA.maxY < boundsB.minY ) return false;
	if ( boundsA.minY > boundsB.maxY ) return false;
	
	return true;
	
};

/**
* Checks if a point lies inside or on the edge of a circle.
* @param {Number} x of point.
* @param {Number} y of point.
* @param {Number} center x of circle.
* @param {Number} center y of circle.
* @param {Number} radius of circle.
**/
_uti.pointInCircle = function ( x, y, cx, cy, radius ) {
	
	var dx = cx - x;
	var dy = cy - y;
	var squareDistance = dx * dx + dy * dy;
	var squareRadius = radius * radius;
	
    return squareDistance < squareRadius;
	
}

/**
Determine if a point is inside a polygon.
@param {Vec2} The point to be checked.
@returns {Boolean} True if this contains the given point.
**/
_uti.pointInPolygon = function ( x, y, vertices ) {
	
	var i, j = vertices.length - 1;
	var oddNodes = false;
	
	for ( i = 0; i < vertices.length; i++ ) {
		
		var va = vertices[ j ];
		var vb = vertices[ i ];
		
		// point is a vertex in polygon
		
		if ( ( va.x === x && va.y === y ) || ( vb.x === x && vb.y === y ) ) {
			
			oddNodes = true;
			break;
			
		}
		// raycast edges
		// odd number of crosses = inside polygon
		else if ( ( vb.y < y && va.y >= y || va.y < y && vb.y >= y ) && ( vb.x <= x || va.x <= x ) ) {
			
			if ( vb.x + ( y - vb.y ) / ( va.y - vb.y ) * ( va.x - vb.x ) < x ) {
				
				oddNodes = !oddNodes;
				
			}
			
		}
		
		j = i;
		
	}
	
	return oddNodes;
	
};

} );