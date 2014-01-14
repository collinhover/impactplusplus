ig.module(
    'plusplus.abstractities.shape'
)
    .requires(
        'plusplus.core.entity',
        'plusplus.helpers.utils'
)
    .defines(function() {
        "use strict";

        var _ut = ig.utils;

        /**
         * Entity generated automatically by collision map conversion.
         * <span class="alert alert-error"><strong>IMPORTANT:</strong> this is an abstract entity that should be extended.</span>
         * @class
         * @extends ig.EntityExtended
         * @memberof ig
         * @author Collin Hover - collinhover.com
         **/
        ig.Shape = ig.EntityExtended.extend( /**@lends ig.Shape.prototype */ {

            // editor properties

            _wmScalable: true,
            _wmDrawBox: true,
            _wmBoxColor: 'rgba( 0, 255, 255, 0.7)',

            /**
             * Whether entity should skip updating.
             * @type Boolean
             * @default
             */
            frozen: true,

            /**
             * Shapes should get opaque area from vertices.
             * @type Boolean
             * @default
             */
            opaqueFromVertices: true,

            /**
             * Initializes shape types.
             * <br>- adds {@link ig.EntityExtended.TYPE.SHAPE} to {@link ig.EntityExtended#type}
             * @override
             */
            initTypes: function() {

                this.parent();

                _ut.addType(ig.EntityExtended, this, 'type', "SHAPE");

            }

        });

    });
