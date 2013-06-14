ig.module(
        'plusplus.helpers.utilsvector2'
    )
    .requires(
        'plusplus.core.config',
        'plusplus.helpers.utilsmath'
    )
    .defines(function () {
        "use strict";

        var _c = ig.CONFIG;
        var _utm = ig.utilsmath;

        /**
         * Static utilities for 2d vectors.
         * @memberof ig
         * @namespace ig.utilsvector2
         * @author Collin Hover - collinhover.com
         **/
        ig.utilsvector2 = {};

        /**
         * Generates a plain object with properties of a 2d vector.
         * @param {Number} [x] x position
         * @param {Number} [y] y position
         * @param {Vector2|Object} [v] vector object
         * @returns {Vector2|Object} 2d vector or plain object with properties of a 2d vector
         **/
        ig.utilsvector2.vector = function (x, y, v) {

            v = v || {};

            ig.utilsvector2.set(v, x || 0, y || 0);

            return v;

        };

        /**
         * Sets 2d vector values.
         * <span class="alert"><strong>IMPORTANT:</strong>this modifies target vector in place.</span>
         * @param {Vector2|Object} v vector object or plain object with vector properties
         * @param {Number} x x position
         * @param {Number} y y position
         * @returns {Vector2|Object} 2d vector or plain object with properties of a 2d vector
         **/
        ig.utilsvector2.set = function (v, x, y) {

            v.x = x;
            v.y = y;

            return v;

        };

        /**
         * Sets 2d vector values from scalar.
         * <span class="alert"><strong>IMPORTANT:</strong>this modifies target vector in place.</span>
         * @param {Vector2|Object} v vector object or plain object with vector properties
         * @param {Number} s scalar
         * @returns {Vector2|Object} 2d vector or plain object with properties of a 2d vector
         **/
        ig.utilsvector2.setScalar = function (v, s) {

            v.x = s;
            v.y = s;

            return v;

        };

        /**
         * Generates a plain object with properties of a 2d vector by copying another.
         * @param {Vector2|Object} v vector object or plain object with vector properties
         * @returns {Vector2|Object} 2d vector or plain object with properties of a 2d vector
         **/
        ig.utilsvector2.clone = function (v) {

            return ig.utilsvector2.vector(v.x, v.y);

        };

        /**
         * Copies target 2d vector into source.
         * <span class="alert"><strong>IMPORTANT:</strong>this modifies target vector in place.</span>
         * @param {Vector2|Object} a vector target
         * @param {Vector2|Object} b vector source
         * @returns {Vector2|Object} 2d vector or plain object with properties of a 2d vector
         **/
        ig.utilsvector2.copy = function (a, b) {

            a.x = b.x;
            a.y = b.y;

            return a;

        };

        /**
         * Zeroes 2d vector values.
         * <span class="alert"><strong>IMPORTANT:</strong>this modifies target vector in place.</span>
         * @param {Vector2|Object} v vector object or plain object with vector properties
         * @returns {Vector2|Object} 2d vector or plain object with properties of a 2d vector
         **/
        ig.utilsvector2.zero = function (v) {

            v.x = 0;
            v.y = 0;

            return v;

        };

        /**
         * Checks 2d vector values to see if zero.
         * @param {Vector2|Object} v vector object or plain object with vector properties
         * @returns {Boolean} whether vector is zero
         **/
        ig.utilsvector2.isZero = function (v) {

            return v.x === 0 && v.y === 0;

        };

        /**
         * Checks 2d vector values to see if *almost* zero, based on {@link ig.CONFIG.PRECISION_ZERO}.
         * @param {Vector2|Object} v vector object or plain object with vector properties
         * @returns {Boolean} whether vector is almost zero
         * @see ig.CONFIG.PRECISION_ZERO
         **/
        ig.utilsvector2.isAlmostZero = function (v) {

            return _utm.almostEqual(v.x, 0, _c.PRECISION_ZERO) && _utm.almostEqual(v.y, 0, _c.PRECISION_ZERO);

        };

        /**
         * Checks if 2 vectors are equal.
         * @param {Vector2|Object} a vector
         * @param {Vector2|Object} b vector
         * @returns {Boolean} whether vectors are equal
         **/
        ig.utilsvector2.equal = function (a, b) {

            return a.x === b.x && a.y === b.y;

        };

        /**
         * Inverts 2d vector values.
         * <span class="alert"><strong>IMPORTANT:</strong>this modifies target vector in place.</span>
         * @param {Vector2|Object} v vector object or plain object with vector properties
         * @returns {Vector2|Object} 2d vector or plain object with properties of a 2d vector
         **/
        ig.utilsvector2.inverse = function (v) {

            v.x = -v.x;
            v.y = -v.y;

            return v;

        };

        /**
         * Adds vector source into target.
         * <span class="alert"><strong>IMPORTANT:</strong>this modifies target vector in place.</span>
         * @param {Vector2|Object} a vector target
         * @param {Vector2|Object} b vector source
         * @returns {Vector2|Object} 2d vector or plain object with properties of a 2d vector
         **/
        ig.utilsvector2.add = function (a, b) {

            a.x += b.x;
            a.y += b.y;

            return a;

        };

        /**
         * Adds two vectors and creates a new vector.
         * @param {Vector2|Object} a vector
         * @param {Vector2|Object} b vector
         * @returns {Vector2|Object} 2d vector or plain object with properties of a 2d vector
         **/
        ig.utilsvector2.addVectors = function (a, b) {

            return { x: a.x + b.x, y: a.y + b.y };

        };

        /**
         * Add scalar to vector target.
         * <span class="alert"><strong>IMPORTANT:</strong>this modifies target vector in place.</span>
         * @param {Vector2|Object} v vector target
         * @param {Number} s scalar
         * @returns {Vector2|Object} 2d vector or plain object with properties of a 2d vector
         **/
        ig.utilsvector2.addScalar = function (v, s) {

            v.x += s;
            v.y += s;

            return v;

        };

        /**
         * Subtracts vector source from target.
         * <span class="alert"><strong>IMPORTANT:</strong>this modifies target vector in place.</span>
         * @param {Vector2|Object} a vector target
         * @param {Vector2|Object} b vector source
         * @returns {Vector2|Object} 2d vector or plain object with properties of a 2d vector
         **/
        ig.utilsvector2.subtract = function (a, b) {

            a.x -= b.x;
            a.y -= b.y;

            return a;

        };

        /**
         * Subtracts two vectors and creates a new vector.
         * @param {Vector2|Object} a vector
         * @param {Vector2|Object} b vector
         * @returns {Vector2|Object} 2d vector or plain object with properties of a 2d vector
         **/
        ig.utilsvector2.subtractVectors = function (a, b) {

            return { x: a.x - b.x, y: a.y - b.y };

        };

        /**
         * Subtracts scalar from vector target.
         * <span class="alert"><strong>IMPORTANT:</strong>this modifies target vector in place.</span>
         * @param {Vector2|Object} v vector target
         * @param {Number} s scalar
         * @returns {Vector2|Object} 2d vector or plain object with properties of a 2d vector
         **/
        ig.utilsvector2.subtractScalar = function (v, s) {

            v.x -= s;
            v.y -= s;

            return v;

        };

        /**
         * Multiplies vector source by target.
         * <span class="alert"><strong>IMPORTANT:</strong>this modifies target vector in place.</span>
         * @param {Vector2|Object} a vector target
         * @param {Vector2|Object} b vector source
         * @returns {Vector2|Object} 2d vector or plain object with properties of a 2d vector
         **/
        ig.utilsvector2.multiply = function (a, b) {

            a.x *= b.x;
            a.y *= b.y;

            return a;

        };

        /**
         * Multiplies two vectors and creates a new vector.
         * @param {Vector2|Object} a vector
         * @param {Vector2|Object} b vector
         * @returns {Vector2|Object} 2d vector or plain object with properties of a 2d vector
         **/
        ig.utilsvector2.multiplyVectors = function (a, b) {

            return { x: a.x * b.x, y: a.y * b.y };

        };

        /**
         * Multiplies scalar by vector target.
         * <span class="alert"><strong>IMPORTANT:</strong>this modifies target vector in place.</span>
         * @param {Vector2|Object} v vector target
         * @param {Number} s scalar
         * @returns {Vector2|Object} 2d vector or plain object with properties of a 2d vector
         **/
        ig.utilsvector2.multiplyScalar = function (v, s) {

            v.x *= s;
            v.y *= s;

            return v;

        };

        /**
         * Divides vector source into target.
         * <span class="alert"><strong>IMPORTANT:</strong>this modifies target vector in place.</span>
         * @param {Vector2|Object} a vector target
         * @param {Vector2|Object} b vector source
         * @returns {Vector2|Object} 2d vector or plain object with properties of a 2d vector
         **/
        ig.utilsvector2.divide = function (a, b) {

            a.x /= b.x;
            a.y /= b.y;

            return a;

        };

        /**
         * Divides two vectors and creates a new vector.
         * @param {Vector2|Object} a vector
         * @param {Vector2|Object} b vector
         * @returns {Vector2|Object} 2d vector or plain object with properties of a 2d vector
         **/
        ig.utilsvector2.divideVectors = function (a, b) {

            return { x: a.x / b.x, y: a.y / b.y };

        };

        /**
         * Divides scalar into vector target.
         * <span class="alert"><strong>IMPORTANT:</strong>this modifies target vector in place.</span>
         * @param {Vector2|Object} v vector target
         * @param {Number} s scalar
         * @returns {Vector2|Object} 2d vector or plain object with properties of a 2d vector
         **/
        ig.utilsvector2.divideScalar = function (v, s) {

            v.x /= s;
            v.y /= s;

            return v;

        };

        /**
         * Finds the min values of two vectors and creates a new vector.
         * @param {Vector2|Object} a vector
         * @param {Vector2|Object} b vector
         * @returns {Vector2|Object} 2d vector or plain object with properties of a 2d vector
         **/
        ig.utilsvector2.min = function (a, b) {

            return { x: a.x < b.x ? a.x : b.x, y: a.y < b.y ? a.y : b.y };

        };

        /**
         * Finds the max values of two vectors and creates a new vector.
         * @param {Vector2|Object} a vector
         * @param {Vector2|Object} b vector
         * @returns {Vector2|Object} 2d vector or plain object with properties of a 2d vector
         **/
        ig.utilsvector2.max = function (a, b) {

            return { x: a.x > b.x ? a.x : b.x, y: a.y > b.y ? a.y : b.y };

        };

        /**
         * Absolutes 2d vector values.
         * @param {Vector2|Object} v vector object or plain object with vector properties
         * @returns {Vector2|Object} 2d vector or plain object with properties of a 2d vector
         **/
        ig.utilsvector2.abs = function (v) {

            if (v.x < 0) {

                v.x = -v.x;

            }

            if (v.y < 0) {

                v.y = -v.y;

            }

            return v;

        };

        /**
         * Gets length of 2d vector.
         * @param {Vector2|Object} v vector object or plain object with vector properties
         * @returns {Number} 2d vector length
         **/
        ig.utilsvector2.length = function (v) {

            return Math.sqrt(v.x * v.x + v.y * v.y);

        };

        /**
         * Gets squared length of 2d vector.
         * @param {Vector2|Object} v vector object or plain object with vector properties
         * @returns {Number} 2d vector length before square root
         **/
        ig.utilsvector2.lengthSquared = function (v) {

            return v.x * v.x + v.y * v.y;

        };

        /**
         * Normalizes 2d vector.
         * @param {Vector2|Object} v vector object or plain object with vector properties
         * @returns {Vector2|Object} 2d vector or plain object with properties of a 2d vector
         **/
        ig.utilsvector2.normalize = function (v) {

            var length = ig.utilsvector2.length(v);

            if (length >= Number.MIN_VALUE) {

                var invLength = 1 / length;

                v.x *= invLength;
                v.y *= invLength;

            }

            return v;

        };

        /**
         * Gets dot product of two vectors.
         * @param {Vector2|Object} a vector
         * @param {Vector2|Object} b vector
         * @returns {Number} dot product
         **/
        ig.utilsvector2.dot = function (a, b) {

            return a.x * b.x + a.y * b.y;

        };

        /**
         * Gets cross product of two vectors.
         * @param {Vector2|Object} a vector
         * @param {Vector2|Object} b vector
         * @returns {Number} cross product
         **/
        ig.utilsvector2.cross = function (a, b) {

            return a.x * b.y - a.y * b.x;

        };

        /**
         * Gets cross product of vector and scalar where s/-s.
         * @param {Vector2|Object} v vector
         * @param {Number} s scalar
         * @returns {Number} cross product
         **/
        ig.utilsvector2.crossVF = function (v, s) {

            var x = v.x;
            v.x = s * v.y;
            v.y = -s * x;

            return v;

        };

        /**
         * Gets cross product of vector and scalar where -s/s.
         * @param {Vector2|Object} v vector
         * @param {Number} s scalar
         * @returns {Number} cross product
         **/
        ig.utilsvector2.crossFV = function (v, s) {

            var x = v.x;
            v.x = -s * v.y;
            v.y = s * x;

            return v;

        };

        /**
         * Rotates a 2d vector.
         * @param {Vector2|Object} v vector
         * @param {Number} angle angle to rotate by
         * @param {Number} originX origin x / rotation point
         * @param {Number} originY origin y / rotation point
         * @returns {Vector2|Object} 2d vector or plain object with properties of a 2d vector
         */
        ig.utilsvector2.rotate = function (v, angle, originX, originY) {

            var s = Math.sin(angle);
            var c = Math.cos(angle);

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
         * @param {Array} points points to project
         * @param {Number} [offsetX=0] x offset.
         * @param {Number} [offsetY=0] y offset.
         * @param {Number} [scaleX=1] scale x applied before offset.
         * @param {Number} [scaleY=1] scale y applied before offset.
         * @param {Number} [angle=0] angle to rotate.
         * @param {Number} [angleOffsetX=0] angle x offset.
         * @param {Number} [angleOffsetY=0] angle y offset.
         * @returns {Array} projected points.
         **/
        ig.utilsvector2.projectPoints = function (points, offsetX, offsetY, scaleX, scaleY, angle, angleOffsetX, angleOffsetY) {

            offsetX = offsetX || 0;
            offsetY = offsetY || 0;
            scaleX = scaleX || 1;
            scaleY = scaleY || 1;
            angle = angle || 0;

            var pointsProjected = [];
            var i, il, point, pointRotated;

            if (angle !== 0) {

                angleOffsetX = angleOffsetX || 0;
                angleOffsetY = angleOffsetY || 0;

                for (i = 0, il = points.length; i < il; i++) {

                    point = points[ i ];
                    pointRotated = ig.utilsvector2.rotate(point, angle, angleOffsetX, angleOffsetY);
                    pointsProjected[ i ] = {
                        x: pointRotated.x * scaleX + offsetX,
                        y: pointRotated.y * scaleY + offsetY
                    };

                }

            }
            else {

                for (i = 0, il = points.length; i < il; i++) {

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
         * Finds center of a set of points.
         * @param {Array} points array of points.
         * @returns {Vector2|Object} 2d vector or plain object with properties of a 2d vector
         **/
        ig.utilsvector2.centerOfPoints = function (points) {

            var cx = 0;
            var cy = 0;
            var point;

            for (var i = 0, il = points.length; i < il; i++) {

                point = points[ i ];
                cx += point.x;
                cy += point.y;

            }

            return { x: cx / il, y: cy / il };

        };

        /** Finds if 3 points are clockwise.
         * <span class="alert"><strong>IMPORTANT:</strong> the first point is used as the pivot point.</span>
         * @param {Object} p1 point1
         * @param {Object} p2 point2
         * @param {Object} p3 point3
         * @returns {Number} counter-clockwise if > 0, clockwise if < 0, and collinear if = 0.
         **/
        ig.utilsvector2.pointsCW = function (p1, p2, p3) {
            return (p2.x - p1.x) * (p3.y - p1.y) - (p2.y - p1.y) * (p3.x - p1.x);
        };

        /**
         * Gets signed radian between a and c from b.
         * <br>- based on http://stackoverflow.com/questions/3486172/angle-between-3-points
         * @param {Object} a 2D point
         * @param {Object} b 2D point
         * @param {Object} c 2D point
         * @returns {Number} signed radian
         **/
        ig.utilsvector2.radianBetweenPoints = function (a, b, c) {

            var abx = b.x - a.x;
            var aby = b.y - a.y;
            var cbx = b.x - c.x;
            var cby = b.y - c.y;

            var dot = ( abx * cbx + aby * cby );
            var cross = ( abx * cby - aby * cbx );

            var alpha = Math.atan2(cross, dot);

            return alpha;

        };

        /**
         * Creates a convex hull shape from a set of points by Graham Scan in a clockwise direction.
         * @param {Array} points array of points
         * @returns {Array} sorted points
         **/
        ig.utilsvector2.pointsToConvexHull = function (points) {

            if (points.length < 3) return points;

            // find the point with the smallest y

            var i, il;
            var indexMin = 0, pointMin = points[ indexMin ], point;

            for (i = 1, il = points.length; i < il; i++) {

                point = points[ i ];

                if (point.y === pointMin.y) {

                    if (point.x < pointMin.x) {
                        indexMin = i;
                        pointMin = point;
                    }

                }
                else if (point.y < pointMin.y) {
                    indexMin = i;
                    pointMin = point;
                }

            }

            // sort points by angle from min

            var pointsByAngle = [
                { x: pointMin.x, y: pointMin.y, index: indexMin }
            ];
            var pointFromMin;

            for (i = 0, il = points.length; i < il; i++) {

                if (i === indexMin) continue;
                point = points[ i ];

                pointFromMin = { x: point.x, y: point.y };
                pointFromMin.angle = Math.atan(( point.y - pointMin.y ) / ( point.x - pointMin.x));

                if (pointFromMin.angle < 0) pointFromMin.angle += Math.PI;

                pointFromMin.distance = ( point.x - pointMin.x ) * ( point.x - pointMin.x ) + ( point.y - pointMin.y ) * ( point.y - pointMin.y );
                pointFromMin.index = i;

                pointsByAngle.push(pointFromMin);

            }

            pointsByAngle.sort(function (a, b) {

                if (a.angle < b.angle) return -1;
                else if (a.angle > b.angle) return 1;
                else {
                    if (a.distance < b.distance) return -1;
                    else if (a.distance > b.distance) return 1;
                }

                return 0;

            });

            // search for convex hull
            // loc is location, and at end of search the final index

            var pointTemp;
            var loc = 1;

            for (i = 2, il = points.length; i < il; i++) {

                // find next valid point

                while (ig.utilsvector2.pointsCW(pointsByAngle[ loc - 1 ], pointsByAngle[ loc ], pointsByAngle[ i ]) <= 0) {
                    loc--;
                }

                loc++;
                pointTemp = pointsByAngle[ i ];
                pointsByAngle[ i ] = pointsByAngle[ loc ];
                pointsByAngle[ loc ] = pointTemp;

            }

            var pointsSorted = [];

            for (i = 0; i <= loc; i++) {
                pointsSorted[ i ] = points[ pointsByAngle[ i ].index ];
            }

            return pointsSorted;

        };

        /**
         * Flag for quadrant 1, -x, -y
         * @type {number}
         * @see ig.utilsvector2.pointQuadrant
         */
        ig.utilsvector2.Q_1 = 1;

        /**
         * Flag for quadrant 2, x, -y
         * @type {number}
         * @see ig.utilsvector2.pointQuadrant
         */
        ig.utilsvector2.Q_2 = 1 << 2;

        /**
         * Flag for quadrant 2, -x, y
         * @type {number}
         * @see ig.utilsvector2.pointQuadrant
         */
        ig.utilsvector2.Q_3 = 1 << 3;

        /**
         * Flag for quadrant 2, x, y
         * @type {number}
         * @see ig.utilsvector2.pointQuadrant
         */
        ig.utilsvector2.Q_4 = 1 << 4;

        /** Finds the quadrant of a 2D point.
         * @param {Number} x X position
         * @param {Number} y Y position
         * @param {Number} originX origin x
         * @param {Number} originY origin y
         * @returns {Number} quadrants bitwise flag
         **/
        ig.utilsvector2.pointQuadrant = function (x, y, originX, originY) {

            var q;
            var dx = originX - x;
            var dy = originY - y;

            if (dx === 0 && dy === 0) {

                q = ig.utilsvector2.Q_1 | ig.utilsvector2.Q_2 | ig.utilsvector2.Q_3 | ig.utilsvector2.Q_4;

            }
            else if (dx === 0) {

                if (dy < 0) q = ig.utilsvector2.Q_3 | ig.utilsvector2.Q_4;
                else q = ig.utilsvector2.Q_1 | ig.utilsvector2.Q_2;

            }
            else if (dy === 0) {

                if (dx < 0) q = ig.utilsvector2.Q_2 | ig.utilsvector2.Q_4;
                else q = ig.utilsvector2.Q_1 | ig.utilsvector2.Q_3;

            }
            else {

                q = 1;
                if (dx < 0) q = 2;
                if (dy < 0) q += 2;
                q = 1 << q;

            }

            return q;

        };

        /**
         * Thresholds a 2d vector.
         * <span class="alert"><strong>IMPORTANT:</strong>this modifies target vector in place.</span>
         * @param {Object} v vector to convert
         * @param {Number} [thresholdX=0] how close to zero direction x can be before becoming 0
         * @param {Number} [thresholdY=0] how close to zero direction y can be before becoming 0
         * @returns {Vector2|Object} 2d vector or plain object with properties of a 2d vector
         */
        ig.utilsvector2.directionThreshold = function (v, thresholdX, thresholdY) {

            thresholdX = thresholdX || 0;
            thresholdY = thresholdY || 0;

            // check x/y against threshold to try and zero them out
            // defer to larger threshold

            if (thresholdY < thresholdX) {

                if (v.y !== 0) {

                    if (_utm.almostEqual(v.x, 0, thresholdX)) {

                        v.x = 0;

                    }

                }

                if (v.x !== 0) {

                    if (_utm.almostEqual(v.y, 0, thresholdY)) {

                        v.y = 0;

                    }

                }

            }
            else {

                if (v.x !== 0) {

                    if (_utm.almostEqual(v.y, 0, thresholdY)) {

                        v.y = 0;

                    }

                }

                if (v.y !== 0) {

                    if (_utm.almostEqual(v.x, 0, thresholdX)) {

                        v.x = 0;

                    }

                }

            }

            return v;

        };

        /**
         * Converts direction vector to string.
         * @param {Vector2|Object} v vector to convert
         * @returns {String} uppercase string name of closest direction to vector
         * @see ig.utilsvector2.DIRECTION
         */
        ig.utilsvector2.directionToString = function (v) {

            // get direction from x/y

            var xDir = _utm.direction(v.x);
            var yDir = _utm.direction(v.y);

            for (var direction in ig.utilsvector2.DIRECTION) {

                var dv = ig.utilsvector2.DIRECTION[ direction ];

                if (dv.x === xDir && dv.y === yDir) {

                    return direction;

                }

            }

            return 'NONE';

        };

        /**
         * Map of vectors for 9 directions separated by 45 degrees each.
         * @static
         * @readonly
         * @property {Vector2|Object} NONE vector corresponding to no direction
         * @property {Vector2|Object} LEFT vector corresponding to left direction
         * @property {Vector2|Object} RIGHT vector corresponding to right direction
         * @property {Vector2|Object} UP vector corresponding to up direction
         * @property {Vector2|Object} DOWN vector corresponding to down direction
         * @property {Vector2|Object} UPLEFT vector corresponding to up left direction
         * @property {Vector2|Object} UPRIGHT vector corresponding to up right direction
         * @property {Vector2|Object} DOWNLEFT vector corresponding to DOWNLEFT direction
         * @property {Vector2|Object} DOWNRIGHT vector corresponding to down right direction
         * @see ig.utilsvector2.directionToString
         */
        ig.utilsvector2.DIRECTION = {
            NONE: ig.utilsvector2.vector(),
            LEFT: ig.utilsvector2.vector(-1, 0),
            RIGHT: ig.utilsvector2.vector(1, 0),
            UP: ig.utilsvector2.vector(0, -1),
            DOWN: ig.utilsvector2.vector(0, 1),
            UPLEFT: ig.utilsvector2.vector(-1, -1),
            UPRIGHT: ig.utilsvector2.vector(1, -1),
            DOWNLEFT: ig.utilsvector2.vector(-1, 1),
            DOWNRIGHT: ig.utilsvector2.vector(1, 1)
        };

    });