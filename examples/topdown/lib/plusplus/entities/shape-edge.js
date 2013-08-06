ig.module(
        'plusplus.entities.shape-edge'
    )
    .requires(
        'plusplus.entities.shape-solid'
    )
    .defines(function () {
        "use strict";

        /**
         * Entity for world edge map shapes, generated automatically by collision map conversion.
         * @class
         * @extends ig.EntityShapeSolid
         * @memberof ig
         * @author Collin Hover - collinhover.com
         **/
        ig.EntityShapeEdge = ig.global.EntityShapeEdge = ig.EntityShapeSolid.extend(/**@lends ig.EntityShapeEdge.prototype */{

            /**
             * Compose as a collection of edges instead of a shape.
             * <br>- this has an effect in box2d only
             */
            bodyShape: 'edge'

        });

    });