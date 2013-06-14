ig.module(
        'plusplus.entities.shape-climbable'
    )
    .requires(
        'plusplus.abstractities.shape'
    )
    .defines(function () {
        "use strict";

        /**
         * Entity for climbing areas, generated automatically by collision map conversion.
         * @class
         * @extends ig.Shape
         * @memberof ig
         * @author Collin Hover - collinhover.com
         **/
        ig.EntityShapeClimbable = ig.global.EntityShapeClimbable = ig.Shape.extend(/**@lends ig.EntityShapeClimbable.prototype */{

            /**
             * @override
             * @default
             */
            climbable: true

        });

    });