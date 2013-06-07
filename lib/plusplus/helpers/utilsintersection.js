ig.module(
        'plusplus.helpers.utilsintersection'
    )
    .defines(function () {
        "use strict";

        /**
         * Static utilities for intersections.
         * @memberof ig
         * @namespace ig.utilsintersection
         * @author Collin Hover - collinhover.com
         **/
        ig.utilsintersection = {};

        /**
         * Calculates bounds from a position and dimensions.
         * @param {Number} x x position of top left
         * @param {Number} y y position of top left
         * @param {Number} width width
         * @param {Number} height height
         * @returns {Object} bounding object
         * @example
         * // get bounds
         * var bounds = ig.utilsintersection.bounds( 0, 0, 100, 100 );
         * // left
         * bounds.minX;
         * // right
         * bounds.maxX;
         * // top
         * bounds.minY;
         * // bottom
         * bounds.maxY;
         * // width
         * bounds.width;
         * // height
         * bounds.height;
         **/
        ig.utilsintersection.bounds = function (x, y, width, height) {

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
         * Calculates bounds from min/max values.
         * @param {Number} minX x position of top left
         * @param {Number} minY y position of top left
         * @param {Number} maxX x position of bottom right
         * @param {Number} maxY y position of bottom right
         * @returns {Object} bounding object
         * @example
         * // get bounds
         * var bounds = ig.utilsintersection.boundsMinMax( 0, 0, 100, 100 );
         * // left
         * bounds.minX;
         * // right
         * bounds.maxX;
         * // top
         * bounds.minY;
         * // bottom
         * bounds.maxY;
         * // width
         * bounds.width;
         * // height
         * bounds.height;
         **/
        ig.utilsintersection.boundsMinMax = function (minX, minY, maxX, maxY) {

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
         * <span class="alert alert-info"><strong>Tip:</strong> each point should be an object with x and y values.</span>
         * @param {Array} points Array of points.
         * @returns {Object} bounding object
         * @example
         * // get bounds
         * var bounds = ig.utilsintersection.boundsOfPoints( [
         *      {x: 0, y: 0},
         *      {x: 100, y: 0},
         *      {x: 100, y: 100},
         *      {x: 0, y: 100}
         * ]);
         * // left
         * bounds.minX;
         * // right
         * bounds.maxX;
         * // top
         * bounds.minY;
         * // bottom
         * bounds.maxY;
         * // width
         * bounds.width;
         * // height
         * bounds.height;
         **/
        ig.utilsintersection.boundsOfPoints = function (points) {

            var i, il, point = points[ 0 ];
            var minX = point.x;
            var minY = point.y;
            var maxX = point.x;
            var maxY = point.y;

            for (i = 1, il = points.length; i < il; i++) {

                point = points[ i ];

                if (point.x < minX) minX = point.x;
                else if (point.x > maxX) maxX = point.x;
                if (point.y < minY) minY = point.y;
                else if (point.y > maxY) maxY = point.y;

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
         * Clones a bounds object, with the addition of optional offset position.
         * @param {Object} bounds bounds to clone
         * @param {Number} [offsetX=0] offset x
         * @param {Number} [offsetY=0] offset y
         * @returns {Object} bounding object clone.
         * @see ig.utilsintersection.bounds
         **/
        ig.utilsintersection.boundsClone = function (bounds, offsetX, offsetY) {

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
         * Copies a bounds object into another bounds object, with the addition of optional offset position and scale.
         * @param {Object} boundsA bounds source
         * @param {Object} boundsB bounds target
         * @param {Number} [offsetX=0] offset x
         * @param {Number} [offsetY=0] offset y
         * @param {Number} [scaleX=1] scale x
         * @param {Number} [scaleY=1] scale y
         * @returns {Object} bounding object based on bounds plus offset
         * @see ig.utilsintersection.bounds
         **/
        ig.utilsintersection.boundsCopy = function (boundsA, boundsB, offsetX, offsetY, scaleX, scaleY) {

            offsetX = offsetX || 0;
            offsetY = offsetY || 0;

            scaleX = scaleX || 1;
            scaleY = scaleY || 1;

            boundsA.minX = boundsB.minX * scaleX + offsetX;
            boundsA.maxX = boundsB.maxX * scaleX + offsetX;
            boundsA.minY = boundsB.minY * scaleY + offsetY;
            boundsA.maxY = boundsB.maxY * scaleY + offsetY;
            boundsA.width = boundsA.maxX - boundsA.minX;
            boundsA.height = boundsA.maxY - boundsA.minY;

            return boundsA;

        };

        /**
         * Copies the horizontal properties of a bounds object into another bounds object, with the addition of optional offset position and scale.
         * @param {Object} boundsA bounds source
         * @param {Object} boundsB bounds target
         * @param {Number} [offsetX=0] offset x
         * @param {Number} [scaleX=1] scale x
         * @returns {Object} bounding object based on bounds plus offset
         * @see ig.utilsintersection.bounds
         **/
        ig.utilsintersection.boundsCopyX = function (boundsA, boundsB, offsetX, scaleX) {

            offsetX = offsetX || 0;
            scaleX = scaleX || 1;

            boundsA.minX = boundsB.minX * scaleX + offsetX;
            boundsA.maxX = boundsB.maxX * scaleX + offsetX;
            boundsA.width = boundsA.maxX - boundsA.minX;

            return boundsA;

        };

        /**
         * Copies the vertical properties of a bounds object into another bounds object, with the addition of optional offset position and scale.
         * @param {Object} boundsA bounds source
         * @param {Object} boundsB bounds target
         * @param {Number} [offsetY=0] offset y
         * @param {Number} [scaleY=1] scale y
         * @returns {Object} bounding object based on bounds plus offset
         * @see ig.utilsintersection.bounds
         **/
        ig.utilsintersection.boundsCopyY = function (boundsA, boundsB, offsetY, scaleY) {

            offsetY = offsetY || 0;
            scaleY = scaleY || 1;

            boundsA.minY = boundsB.minY * scaleY + offsetY;
            boundsA.maxY = boundsB.maxY * scaleY + offsetY;
            boundsA.height = boundsA.maxY - boundsA.minY;

            return boundsA;

        };

        /**
         * Checks two 2D axis aligned bounding boxes: is A contained by B?
         * @param {Number} aminX A left
         * @param {Number} aminY A top
         * @param {Number} amaxX A right
         * @param {Number} amaxY A bottom
         * @param {Number} bminX B left
         * @param {Number} bminY B top
         * @param {Number} bmaxX B right
         * @param {Number} bmaxY B bottom
         * @returns {Boolean} whether bounds A contains bounds B
         **/
        ig.utilsintersection.AABBContains = function (aminX, aminY, amaxX, amaxY, bminX, bminY, bmaxX, bmaxY) {

            if (aminX >= bminX
                && amaxX <= bmaxX
                && aminY >= bminY
                && amaxY <= bmaxY) {
                return true;
            }

            return false;

        };

        /**
         * Checks two 2D axis aligned bounding boxes: does A intersect B?
         * @param {Number} aminX A left
         * @param {Number} aminY A top
         * @param {Number} amaxX A right
         * @param {Number} amaxY A bottom
         * @param {Number} bminX B left
         * @param {Number} bminY B top
         * @param {Number} bmaxX B right
         * @param {Number} bmaxY B bottom
         * @returns {Boolean} whether bounds intersect
         **/
        ig.utilsintersection.AABBIntersect = function (aminX, aminY, amaxX, amaxY, bminX, bminY, bmaxX, bmaxY) {

            if (amaxX < bminX) return false;
            if (aminX > bmaxX) return false;
            if (amaxY < bminY) return false;
            if (aminY > bmaxY) return false;

            return true;

        };

        /**
         * This is a convenience method to test intersection of two bounding boxes.
         * @param {Object} boundsA bounding object A
         * @param {Object} boundsB bounding object B
         * @returns {Boolean} whether bounds intersect
         * @see ig.utilsintersection.AABBIntersect
         **/
        ig.utilsintersection.boundsIntersect = function (boundsA, boundsB) {

            if (boundsA.maxX < boundsB.minX) return false;
            if (boundsA.minX > boundsB.maxX) return false;
            if (boundsA.maxY < boundsB.minY) return false;
            if (boundsA.minY > boundsB.maxY) return false;

            return true;

        };

        /**
         * This is a convenience method to test intersection of two bounding boxes.
         * @param {Object} bounds bounding object A
         * @param {Number} minX B left
         * @param {Number} minY B top
         * @param {Number} maxX B right
         * @param {Number} maxY B bottom
         * @returns {Boolean} whether bounds intersect
         * @see ig.utilsintersection.AABBIntersect
         **/
        ig.utilsintersection.boundsAABBIntersect = function (bounds, minX, minY, maxX, maxY) {

            if (bounds.maxX < minX) return false;
            if (bounds.minX > maxX) return false;
            if (bounds.maxY < minY) return false;
            if (bounds.minY > maxY) return false;

            return true;

        };

        /**
         * This is a convenience method to test intersection of a point with a bounding box.
         * @param {Number} x point x
         * @param {Number} y point y
         * @param {Number} minX bounds left
         * @param {Number} minY bounds top
         * @param {Number} maxX bounds right
         * @param {Number} maxY bounds bottom
         * @returns {Boolean} whether point is inside bounds
         * @see ig.utilsintersection.AABBIntersect
         **/
        ig.utilsintersection.pointInAABB = function (x, y, minX, minY, maxX, maxY) {

            if (x < minX) return false;
            if (x > maxX) return false;
            if (y < minY) return false;
            if (y > maxY) return false;

            return true;

        };

        /**
         * This is a convenience method to test intersection of a point with a bounding box.
         * @param {Number} x point x
         * @param {Number} y point y
         * @param {Number} bounds bounding object
         * @returns {Boolean} whether point is inside bounds
         * @see ig.utilsintersection.AABBIntersect
         **/
        ig.utilsintersection.pointInBounds = function (x, y, bounds) {

            if (x < bounds.minX) return false;
            if (x > bounds.maxX) return false;
            if (y < bounds.minY) return false;
            if (y > bounds.maxY) return false;

            return true;

        };

        /**
         * Checks if a point lies inside or on the edge of a circle.
         * @param {Number} x point x
         * @param {Number} y point y
         * @param {Number} cx center x of circle
         * @param {Number} cy center y of circle
         * @param {Number} radius radius of circle
         * @returns {Boolean} whether point is inside circle
         **/
        ig.utilsintersection.pointInCircle = function (x, y, cx, cy, radius) {

            var dx = cx - x;
            var dy = cy - y;
            var squareDistance = dx * dx + dy * dy;
            var squareRadius = radius * radius;

            return squareDistance < squareRadius;

        };

        /**
         Determine if a point is inside a polygon.
         * @param {Number} x point x
         * @param {Number} y point y
         * @param {Array} vertices array of vertices that defines a polygon
         * @returns {Boolean} true if polygon contains the given point
         **/
        ig.utilsintersection.pointInPolygon = function (x, y, vertices) {

            var i, j = vertices.length - 1;
            var oddNodes = false;

            for (i = 0; i < vertices.length; i++) {

                var va = vertices[ j ];
                var vb = vertices[ i ];

                // point is a vertex in polygon

                if (( va.x === x && va.y === y ) || ( vb.x === x && vb.y === y )) {

                    oddNodes = true;
                    break;

                }
                // raycast edges
                // odd number of crosses = inside polygon
                else if (( vb.y < y && va.y >= y || va.y < y && vb.y >= y ) && ( vb.x <= x || va.x <= x )) {

                    if (vb.x + ( y - vb.y ) / ( va.y - vb.y ) * ( va.x - vb.x ) < x) {

                        oddNodes = !oddNodes;

                    }

                }

                j = i;

            }

            return oddNodes;

        };

        /**
         * Finds all entities intersecting an axis aligned bounding box.
         * @param {Number} left left position.
         * @param {Number} top top position.
         * @param {Number} right right position.
         * @param {Number} bottom bottom position.
         * @param {Boolean} [targetable] only find entities that are targetable.
         * @param {Object} [layerName] name of layer to search.
         * @param {Boolean} [unsorted] whether to sort.
         * @returns {Array} list of all entities intersecting box.
         */
        ig.utilsintersection.entitiesInAABB = function (left, top, right, bottom, targetable, layerName, unsorted) {

            var intersected = [];
            var layer;
            var i, il;

            if (!layerName) {

                for (i = 0, il = ig.game.layers.length; i < il; i++) {

                    layer = ig.game.layers[i];

                    if (layer.name && layer.numEntities && ( !targetable || layer.itemsTargetable.length )) {

                        intersected = intersected.concat(ig.utilsintersection.entitiesInAABB(left, top, right, bottom, targetable, layer.name, true));

                    }

                }

            }
            else {

                layer = ig.game.layersMap[ layerName ];
                var entities = targetable ? layer.itemsTargetable : layer.items;

                // find if touch intersects bounding box of each entity

                for (i = 0, il = entities.length; i < il; i++) {

                    var entity = entities[ i ];
                    var bounds = entity.boundsDraw;
                    var intersects;

                    // fixed element bounds should not be relative to world space
                    // so we need to offset it by screen

                    if (entity.fixed) {

                        var screenX = ig.game.screen.x;
                        var screenY = ig.game.screen.y;

                        intersects = ig.utilsintersection.AABBIntersect(
                            bounds.minX + screenX, bounds.minY + screenY, bounds.maxX + screenX, bounds.maxY + screenY,
                            left, top, right, bottom
                        );

                    }
                    else {

                        intersects = ig.utilsintersection.boundsAABBIntersect(bounds, left, top, right, bottom);

                    }

                    if (intersects) {

                        intersected.push(entity);

                    }

                }

            }

            // sort by distance from center of aabb

            if (intersected.length > 1 && !unsorted) {

                ig.utilsintersection.sortByDistance( left + ( right - left ) * 0.5, top + ( bottom - top ) * 0.5, intersected );

            }

            return intersected;

        };

        /**
         * Gets if an axis aligned bounding box is in the screen.
         * @param {Number} x bounds top left x position
         * @param {Number} y bounds top left y position
         * @param {Number} width bounds width
         * @param {Number} height bounds height
         * @returns {Boolean} whether bounds is in screen
         **/
        ig.utilsintersection.getIsAABBInScreen = function (x, y, width, height) {

            var adjustedX = x - ig.game.screen.x;
            var adjustedY = y - ig.game.screen.y;

            return ig.utilsintersection.AABBIntersect(adjustedX, adjustedY, adjustedX + width, adjustedY + height, 0, 0, ig.system.width, ig.system.height);

        };

        /**
         * Sort a list of entities by distance to a point.
         * <span class="alert"><strong>IMPORTANT:</strong> this modifies the array in place.</span>
         * @param {Number} x x position
         * @param {Number} y y position
         * @param {Array} entities list of entities
         * @returns {Array} list of entities modified in place.
         **/
        ig.utilsintersection.sortByDistance = function sortByDistance( x, y, entities ) {

            entities.sort( function (a, b) {

                var aToCenterX = x - ( a.bounds.minX + a.bounds.width * 0.5 );
                var aToCenterY = y - ( a.bounds.minY + a.bounds.height * 0.5 );
                var aDistance = aToCenterX * aToCenterX + aToCenterY * aToCenterY;

                var bToCenterX = x - ( b.bounds.minX + b.bounds.width * 0.5 );
                var bToCenterY = y - ( b.bounds.minY + b.bounds.height * 0.5 );
                var bDistance = bToCenterX * bToCenterX + bToCenterY * bToCenterY;

                return aDistance - bDistance;

            } );

            return entities;

        };

    });