ig.module(
        'plusplus.entities.shape-solid'
    )
    .requires(
        'plusplus.abstractities.shape'
    )
    .defines(function () {
        "use strict";

        /**
         * Entity for light blocking, generated automatically by collision map conversion.
         * @class
         * @extends ig.Shape
         * @memberof ig
         * @author Collin Hover - collinhover.com
         **/
        ig.EntityShapeSolid = ig.global.EntityShapeSolid = ig.Shape.extend(/**@lends ig.EntityShapeSolid.prototype */{

            /**
             * @override
             * @default
             */
            opaque: true,

            /**
             * @override
             * @default
             */
            diffuse: 1,

            /**
             * @override
             * @default
             */
            hollow: true

        });

    });