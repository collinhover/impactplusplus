ig.module(
        'plusplus.helpers.utilsphysics'
    )
    .requires(
        'plusplus.core.config',
        'plusplus.physics.box2d'
    )
    .defines(function () {
        "use strict";

        var _c = ig.CONFIG;
        var _b2 = ig.Box2D;

        /**
         * Static utilities for physics.
         * @memberof ig
         * @namespace ig.utilsphysics
         * @author Collin Hover - collinhover.com
         **/
        ig.utilsphysics = {};

        // static values used in conversions

        var VELOCITY_TO_SPEED = 2.25;

        /**
         * Converts between speed and velocity, useful for objects using a motorized joint.
         * @param {Number} velocity
         * @param {Number} radius
         * @returns {Number} converted value
         **/
        ig.utilsphysics.getSpeedFromVelocity = function (velocity, radius) {

            return VELOCITY_TO_SPEED * velocity / ( radius * _c.SCALE_PHYSICS * 2 );

        };

        /**
         * Converts between speed and velocity, useful for objects using a motorized joint.
         * @param {Number} speed
         * @param {Number} radius
         * @returns {Number} converted value
         **/
        ig.utilsphysics.getVelocityFromSpeed = function (speed, radius) {

            return speed * ( radius * _c.SCALE_PHYSICS * 2 ) / VELOCITY_TO_SPEED;

        };

        /**
         * Converts plain objects with relative x and y to entity into b2Vec2.
         * @param {Array} vertices relative to entity
         * @param {Number} halfSizeX half of entity size x to offset
         * @param {Number} halfSizeY half of entity size x to offset
         * @returns {Array} vertices relative to entity
         **/
        ig.utilsphysics.getb2Vectors = function (vertices, halfSizeX, halfSizeY) {

            halfSizeX = halfSizeX || 0;
            halfSizeY = halfSizeY || 0;

            var b2vertices = [];

            for (var i = 0; i < vertices.length; i++) {

                var vertex = vertices[ i ];

                b2vertices[ i ] = new _b2.Vec2(
                    ( vertex.x - halfSizeX ) * _c.SCALE_PHYSICS,
                    ( vertex.y - halfSizeY ) * _c.SCALE_PHYSICS
                );

            }

            return b2vertices;

        };

        /**
         * Executes a callback on each item in a Box2D-like heap.
         * @param {Object} heap heap
         * @param {Function} callback callback to call
         * @param {Array} args arguments to pass to the callback
         **/
        ig.utilsphysics.forEachInStack = function (heap, callback, args) {

            var item = heap;
            while (item) {
                callback.apply(item, args);
                var next = item.GetNext();
                item = item !== next && next;
            }

        };

    });