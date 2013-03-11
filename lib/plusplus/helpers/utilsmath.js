/**
 * Static utilities for math.
 * @author Collin Hover - collinhover.com
 **/
ig.module( 
	'plusplus.helpers.utilsmath' 
)
.defines( function(){ "use strict";

var _um = ig.utilsmath = {};

// constants

_um.GOLDEN_ANGLE = Math.PI * (3 - Math.sqrt(5));
_um.TWOPI = 2*Math.PI;

/**
* Checks two numbers to see if almost equal.
* @param {Number} Number a.
* @param {Number} Number b.
* @param {Number} Threshold.
* @returns {Boolean} true if numbers are almost equal.
**/
_um.almostEqual = function ( a, b, threshold ) {
	
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
_um.oppositeSidesOfZero = function ( a, b ) {
	
	return ( a < 0 && b > 0 ) || ( a > 0 && b < 0 );
	
};

/**
* Checks the direction of a number.
* @param {Number} Number.
* @returns {Number} -1, 0, or 1
**/
_um.direction = function ( n ) {
	
	return n === 0 ? 0 : ( n < 0 ? -1 : 1 );
	
};

/**
* Returns projected points.
* @param {Array} points.
* @param {Number} x offset.
* @param {Number} y offset.
* @param {Number} scale applied after offset.
* @param {Number} angle to rotate.
* @param {Number} angle x offset.
* @param {Number} angle y offset.
* @returns {Array} projected points.
**/
_um.projectPoints = function ( points, offsetX, offsetY, scale, angle, angleOffsetX, angleOffsetY ) {
	
	offsetX = offsetX || 0;
	offsetY = offsetY || 0;
	scale = scale || 1;
	angle = angle || 0;
	
	var pointsProjected = [];
	var i, il, point, pointRotated;
	
	if ( angle !== 0 ) {
		
		angleOffsetX = angleOffsetX || 0;
		angleOffsetY = angleOffsetY || 0;
		
		for ( i = 0, il = points.length; i < il; i++ ) {
			
			point = points[ i ];
			pointRotated = _um.rotatePoint( point.x, point.y, angle, angleOffsetX, angleOffsetY );
			pointsProjected[ i ] = {
				x: ( pointRotated.x + offsetX ) * scale,
				y: ( pointRotated.y + offsetY ) * scale
			};
			
		}
		
	}
	else {
		
		for ( i = 0, il = points.length; i < il; i++ ) {
			
			point = points[ i ];
			pointsProjected[ i ] = {
				x: ( point.x + offsetX ) * scale,
				y: ( point.y + offsetY ) * scale
			};
			
		}
		
	}
	
	return pointsProjected;
	
};

/**
* Rotates a point by angle.
* @param {Number} Point x position.
* @param {Number} Point y position.
* @param {Number} Angle to rotate.
* @param {Number} Origin x position.
* @param {Number} Origin y position.
**/
_um.rotatePoint = function ( pointX, pointY, angle, originX, originY ) {
	
	var s = Math.sin( angle );
	var c = Math.cos( angle );

	// translate point back to origin
	
	var translatedX = pointX - originX;
	var translatedY = pointY - originY;

	// rotate point
	
	var rotatedX = translatedX * c - translatedY * s;
	var rotatedY = translatedX * s + translatedY * c;

	// translate point back
	
	return { x: rotatedX + originX, y: rotatedY + originY };
	
};

/**
* Finds center of a set of points
* @param {Array} Array of points.
* @returns {Object} Center point.
**/
_um.centerOfPoints = function ( points ) {
    
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

/**
* Returns bounds from a set of points.
* @param {Array} Array of points.
* @returns {Object} Bounds with min/max x/y.
**/
_um.boundsOfPoints = function ( points ) {
	
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
* Creates a convex hull shape from a set of points by Graham Scan in a clockwise direction.
* @param {Array} Array of points.
* @returns {Array} Sorted points.
**/
_um.pointsToConvexHull = function ( points ) {
	
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
		
		while( _um.pointsCW( pointsByAngle[ loc - 1 ], pointsByAngle[ loc ], pointsByAngle[ i ] ) <= 0 ) {
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
_um.Q_1 = 1; // -x, -y
_um.Q_2 = 1 << 2; // x, -y
_um.Q_3 = 1 << 3; // -x, y
_um.Q_4 = 1 << 4; // x, y
_um.pointQuadrant = function ( x, y, originX, originY ) {
	
	var q;
	var dx = originX - x;
	var dy = originY - y;
	
	if ( dx === 0 && dy === 0) {
		
		q = _um.Q_1 | _um.Q_2 | _um.Q_3 | _um.Q_4;
		
	}
	else if ( dx === 0 ) {
		
		if ( dy < 0 ) q = _um.Q_3 | _um.Q_4;
		else q = _um.Q_1 | _um.Q_2;
		
	}
	else if ( dy === 0 ) {
		
		if ( dx < 0 ) q = _um.Q_2 | _um.Q_4;
		else q = _um.Q_1 | _um.Q_3;
		
	}
	else {
		
		q = 1;
		if ( dx < 0 ) q = 2;
		if ( dy < 0 ) q += 2;
		q = 1 << q;
		
	}
	
	return q;
	
};

/** Finds if 3 points are clockwise.
 * @param {Object} Point1 used as the pivot point.
 * @param {Object} Point2.
 * @param {Object} Point3.
 * @returns {Number} counter-clockwise if > 0, clockwise if < 0, and collinear if = 0.
 **/
_um.pointsCW = function ( p1, p2, p3) {
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
_um.radianBetweenPoints = function ( a, b, c ) {
	
	var abx = b.x - a.x;
	var aby = b.y - a.y;
	var cbx = b.x - c.x;
	var cby = b.y - c.y;

	var dot = ( abx * cbx + aby * cby ); // dot product
	var cross = ( abx * cby - aby * cbx ); // cross product

	var alpha = Math.atan2( cross, dot );

	return alpha;
	
};

/**
* Checks two 2D axis aligned bounding boxes: is A contained by B.
* @param {Number} min/max for a/b
**/
_um.AABBContainedByAABB = function ( aminX, aminY, amaxX, amaxY, bminX, bminY, bmaxX, bmaxY ) {
	
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
_um.AABBIntersectsAABB = function ( aminX, aminY, amaxX, amaxY, bminX, bminY, bmaxX, bmaxY ) {
	
	if ( amaxX < bminX ) return false;
	if ( aminX > bmaxX ) return false;
	if ( amaxY < bminY ) return false;
	if ( aminY > bmaxY ) return false;
	
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
_um.pointInCircle = function ( x, y, cx, cy, radius ) {
	
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
_um.pointInPolygon = function ( x, y, vertices ) {
	
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