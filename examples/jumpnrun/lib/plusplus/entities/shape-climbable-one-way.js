ig.module(
        'plusplus.entities.shape-climbable-one-way'
    )
    .requires(
        'plusplus.entities.shape-climbable',
        'plusplus.helpers.utilsvector2'
    )
    .defines(function () {
        "use strict";

        var _utv2 = ig.utilsvector2;

        /**
         * Entity for climbing areas, with a one way top for walking on, generated automatically by collision map conversion.
         * @class
         * @extends ig.EntityShapeClimbable
         * @memberof ig
         * @author Collin Hover - collinhover.com
         **/
        ig.EntityShapeClimbableOneWay = ig.global.EntityShapeClimbableOneWay = ig.EntityShapeClimbable.extend(/**@lends ig.EntityShapeClimbable.prototype */{

            /**
             * Unlike climbable, one-way climbable should collide.
             * @override
             * @default
             */
            collides: ig.Entity.COLLIDES.FIXED,

            /**
             * @override
             * @default
             */
            oneWay: true,

            /**
             * Collides only at top.
             * @override
             * @default 0 x -1
             */
            oneWayFacing: _utv2.vector(0, -1)

        });

    });