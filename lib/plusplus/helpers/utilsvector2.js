/**
 * 2D Vector utilities so that we're not actually making vectors but regular objects.
 * @author Collin Hover - collinhover.com
 **/
ig.module( 
	'game.helpers.utilsvector2'
)
.requires(
    'game.helpers.utilsmath'
)
.defines(function(){ "use strict";

var _utm = ig.utilsmath;
var _utv2 = ig.utilsvector2 = {};

/**
* Generates a 2d vector-like object.
* @param {Number} x.
* @param {Number} y.
* @returns {Object} 2d vector.
**/
_utv2.vector = function ( x, y, v ) {
	
	v = v || {};
	
	_utv2.set( v, x || 0, y || 0 );
	
	return v;
	
};

_utv2.set = function ( v, x, y ) {
	
	v.x = x;
	v.y = y;
	
	return v;
	
};

_utv2.setScalar = function ( v, s ) {
	
	v.x = s;
	v.y = s;
	
	return v;
	
};

_utv2.clone = function ( v ) {
	
	return _utv2.vector( v.x, v.y );
	
};

_utv2.copy = function ( a, b ) {
	
	a.x = b.x;
	a.y = b.y;
	
	return a;
	
};

_utv2.zero = function ( v ) {
	
	v.x = 0;
	v.y = 0;
	
	return v;
	
};

_utv2.isZero = function ( v ) {
	
	return v.x === 0 && v.y === 0;
	
};

_utv2.isAlmostZero = function ( v ) {
	
	return _utm.almostEqual( v.x, 0, _s.PRECISION_ZERO ) && _utm.almostEqual( v.y, 0, _s.PRECISION_ZERO );
	
};

_utv2.equal = function ( a, b ) {
	
	return a.x === b.x && a.y === b.y;
	
};

_utv2.inverse = function ( v ) {
	
	v.x = -v.x;
	v.y = -v.y;
	
	return v;
	
};

_utv2.add = function ( a, b ) {
	
	a.x += b.x;
	a.y += b.y;
	
	return a;
	
};

_utv2.addVectors = function ( a, b ) {
	
	return { x: a.x + b.x, y: a.y + b.y };
	
};

_utv2.addScalar = function ( v, s ) {
	
	v.x += s;
	v.y += s;
	
	return v;
	
};

_utv2.subtract = function ( a, b ) {
	
	a.x -= b.x;
	a.y -= b.y;
	
	return a;
	
};

_utv2.subtractVectors = function ( a, b ) {
	
	return { x: a.x - b.x, y: a.y - b.y };
	
};

_utv2.subtractScalar = function ( v, s ) {
	
	v.x -= s;
	v.y -= s;
	
	return v;
	
};

_utv2.multiply = function ( a, b ) {
	
	a.x *= b.x;
	a.y *= b.y;
	
	return a;
	
};

_utv2.multiplyVectors = function ( a, b ) {
	
	return { x: a.x * b.x, y: a.y * b.y };
	
};

_utv2.multiplyScalar = function ( v, s ) {
	
	v.x *= s;
	v.y *= s;
	
	return v;
	
};

_utv2.divide = function ( a, b ) {
	
	a.x /= b.x;
	a.y /= b.y;
	
	return a;
	
};

_utv2.divideVectors = function ( a, b ) {
	
	return { x: a.x / b.x, y: a.y / b.y };
	
};

_utv2.divideScalar = function ( v, s ) {
	
	v.x /= s;
	v.y /= s;
	
	return v;
	
};

_utv2.min = function ( a, b ) {
	
	return { x: a.x < b.x ? a.x : b.x, y: a.y < b.y ? a.y : b.y };
	
};

_utv2.max = function ( a, b ) {
	
	return { x: a.x > b.x ? a.x : b.x, y: a.y > b.y ? a.y : b.y };
	
};

_utv2.abs = function ( v ) {
	
	if ( v.x < 0 ){
		
		v.x = -v.x;
		
	}
	
	if ( v.y < 0 ){
		
		v.y = -v.y;
		
	}
	
	return v;
	
};

_utv2.length = function ( v ) {
	
	return Math.sqrt( v.x * v.x + v.y * v.y );
	
};

_utv2.lengthSquared = function ( v ) {
	
	return v.x * v.x + v.y * v.y;
	
};

_utv2.normalize = function ( v ) {
	
	var length = _utv2.length( v );
	
	if ( length >= Number.MIN_VALUE ){
		
		var invLength = 1 / length;
		
		v.x *= invLength;
		v.y *= invLength;
		
	}
	
	return v;
	
};

_utv2.dot = function ( a, b ) {
	
	return a.x * b.x + a.y * b.y;
	
};

_utv2.cross = function ( a, b ) {
	
	return a.x * b.y - a.y * b.x;
	
};

_utv2.crossVF = function ( v, s ) {
	
	var x = v.x;
	v.x = s * v.y;
	v.y = -s * x;
	
	return v;
	
};

_utv2.crossFV = function ( v, s ) {
	
	var x = v.x;
	v.x = -s * v.y;
	v.y = s * x;
	
	return v;
	
};

_utv2.rotate = function ( v, angle, originX, originY ) {
	
	var s = Math.sin( angle );
	var c = Math.cos( angle );
	
	// translate point to origin
	
	var translatedX = v.x - originX;
	var translatedY = v.y - originY;
	
	// rotate point and undo translation
	
	v.x = originX + translatedX * c - translatedY * s;
	v.y = originY + translatedX * s + translatedY * c;
	
	return v;
	
};

/**
* Returns projected points.
* @param {Array} points.
* @param {Number} x offset.
* @param {Number} y offset.
* @param {Number} scale x applied before offset.
* @param {Number} scale y applied before offset.
* @param {Number} angle to rotate.
* @param {Number} angle x offset.
* @param {Number} angle y offset.
* @returns {Array} projected points.
**/
_utv2.projectPoints = function ( points, offsetX, offsetY, scaleX, scaleY, angle, angleOffsetX, angleOffsetY ) {
	
	offsetX = offsetX || 0;
	offsetY = offsetY || 0;
	scaleX = scaleX || 1;
	scaleY = scaleY || 1;
	angle = angle || 0;
	
	var pointsProjected = [];
	var i, il, point, pointRotated;
	
	if ( angle !== 0 ) {
		
		angleOffsetX = angleOffsetX || 0;
		angleOffsetY = angleOffsetY || 0;
		
		for ( i = 0, il = points.length; i < il; i++ ) {
			
			point = points[ i ];
			pointRotated = _utv2.rotate( point, angle, angleOffsetX, angleOffsetY );
			pointsProjected[ i ] = {
				x: pointRotated.x * scaleX + offsetX,
				y: pointRotated.y * scaleY + offsetY 
			};
			
		}
		
	}
	else {
		
		for ( i = 0, il = points.length; i < il; i++ ) {
			
			point = points[ i ];
			pointsProjected[ i ] = {
				x: point.x * scaleX + offsetX,
				y: point.y * scaleY + offsetY
			};
			
		}
		
	}
	
	return pointsProjected;
	
};

/**
* Finds center of a set of points
* @param {Array} Array of points.
* @returns {Object} Center point.
**/
_utv2.centerOfPoints = function ( points ) {
    
	var cx = 0;
    var cy = 0;
    var point;
    
    for ( var i = 0, il = points.length; i < il; i++ ) {
        
        point = points[ i ];
        cx += point.x;
        cy += point.y;
        
    }
    
    return { x: cx / il, y: cy / il };
    
};

/** Finds if 3 points are clockwise.
 * @param {Object} Point1 used as the pivot point.
 * @param {Object} Point2.
 * @param {Object} Point3.
 * @returns {Number} counter-clockwise if > 0, clockwise if < 0, and collinear if = 0.
 **/
_utv2.pointsCW = function ( p1, p2, p3) {
    return (p2.x - p1.x) * (p3.y - p1.y) - (p2.y - p1.y) * (p3.x - p1.x);
};

/**
* Gets signed radian between a and c from b.
* based on http://stackoverflow.com/questions/3486172/angle-between-3-points
* @param {Object} 2D point.
* @param {Object} 2D point.
* @param {Object} 2D point.
* @returns {Number} Signed radian.
**/
_utv2.radianBetweenPoints = function ( a, b, c ) {
	
	var abx = b.x - a.x;
	var aby = b.y - a.y;
	var cbx = b.x - c.x;
	var cby = b.y - c.y;

	var dot = ( abx * cbx + aby * cby );
	var cross = ( abx * cby - aby * cbx );

	var alpha = Math.atan2( cross, dot );

	return alpha;
	
};

/**
* Creates a convex hull shape from a set of points by Graham Scan in a clockwise direction.
* @param {Array} Array of points.
* @returns {Array} Sorted points.
**/
_utv2.pointsToConvexHull = function ( points ) {
	
	if ( points.length < 3 ) return points;
	
	// find the point with the smallest y
	
	var i, il;
	var indexMin = 0, pointMin = points[ indexMin ], point;
	
	for ( i = 1, il = points.length; i < il; i++ ) {
		
		point = points[ i ];
		
		if ( point.y === pointMin.y ) {
			
			if ( point.x < pointMin.x ) {
				indexMin = i;
				pointMin = point;
			}
			
		}
		else if ( point.y < pointMin.y ) {
			indexMin = i;
			pointMin = point;
		}
		
	}
	
	// sort points by angle from min
	
	var pointsByAngle = [ { x: pointMin.x, y: pointMin.y, index: indexMin } ];
	var pointFromMin;
	
	for ( i = 0, il = points.length; i < il; i++ ) {
		
		if ( i === indexMin ) continue;
		point = points[ i ];
		
		pointFromMin = { x: point.x, y: point.y };
		pointFromMin.angle = Math.atan( ( point.y - pointMin.y ) / ( point.x - pointMin.x) );
		
		if ( pointFromMin.angle < 0 ) pointFromMin.angle += Math.PI;
		
		pointFromMin.distance = ( point.x - pointMin.x ) * ( point.x - pointMin.x ) + ( point.y - pointMin.y ) * ( point.y - pointMin.y );
		pointFromMin.index = i;
		
		pointsByAngle.push( pointFromMin );
		
	}
	
	pointsByAngle.sort( function( a, b ) {
		
		if ( a.angle < b.angle ) return -1;
		else if ( a.angle > b.angle ) return 1;
		else {
			if ( a.distance < b.distance ) return -1;
			else if ( a.distance > b.distance ) return 1;
		}
		
		return 0;
		
	} );
	
	// search for convex hull
	// loc is location, and at end of search the final index
	
	var pointTemp;
	var loc = 1;
	
	for ( i = 2, il = points.length; i < il; i++ ) {
		
		// find next valid point
		
		while( _utv2.pointsCW( pointsByAngle[ loc - 1 ], pointsByAngle[ loc ], pointsByAngle[ i ] ) <= 0 ) {
			loc--;
		}
		
		loc++;
		pointTemp = pointsByAngle[ i ];
		pointsByAngle[ i ] = pointsByAngle[ loc ];
		pointsByAngle[ loc ] = pointTemp;
		
	}
	
	var pointsSorted = [];
	
	for ( i = 0; i <= loc; i++ ) {
		pointsSorted[ i ] = points[ pointsByAngle[ i ].index ];
	}
	
	return pointsSorted;
	
};

/** Finds the quadrant of a 2D point.
 * @param {Number} X position.
 * @param {Number} Y position.
 * @param {Number} origin x.
 * @param {Number} origin y.
 * @returns {Number} quadrants bitwise flag
 **/
_utv2.Q_1 = 1; // -x, -y
_utv2.Q_2 = 1 << 2; // x, -y
_utv2.Q_3 = 1 << 3; // -x, y
_utv2.Q_4 = 1 << 4; // x, y
_utv2.pointQuadrant = function ( x, y, originX, originY ) {
	
	var q;
	var dx = originX - x;
	var dy = originY - y;
	
	if ( dx === 0 && dy === 0) {
		
		q = _utv2.Q_1 | _utv2.Q_2 | _utv2.Q_3 | _utv2.Q_4;
		
	}
	else if ( dx === 0 ) {
		
		if ( dy < 0 ) q = _utv2.Q_3 | _utv2.Q_4;
		else q = _utv2.Q_1 | _utv2.Q_2;
		
	}
	else if ( dy === 0 ) {
		
		if ( dx < 0 ) q = _utv2.Q_2 | _utv2.Q_4;
		else q = _utv2.Q_1 | _utv2.Q_3;
		
	}
	else {
		
		q = 1;
		if ( dx < 0 ) q = 2;
		if ( dy < 0 ) q += 2;
		q = 1 << q;
		
	}
	
	return q;
	
};

} );