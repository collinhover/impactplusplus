ig.module(
        'plusplus.entities.text'
    )
    .requires(
        'plusplus.ui.ui-text'
    )
    .defines(function () {
        "use strict";

        /**
         * Text for placement in game world, instead of as UI on screen.
         * @class
         * @extends ig.EntityExtended
         * @memberof ig
         * @author Collin Hover - collinhover.com
         */
        ig.EntityText = ig.global.EntityText = ig.UIText.extend(/**@lends ig.EntityText.prototype */{

            /**
             * Text entity should be placed on entities layer, not UI layer.
             * @override
             * @default
             */
            layerName: 'entities',

            /**
             * Text entity is not fixed in screen.
             * @override
             * @default
             */
            fixed: false,

            /**
             * Text entity is not positioned as a pct of screen size.
             * @override
             * @default
             */
            posAsPct: false,

            /**
             * Text entity margin is not a pct of screen size.
             * @override
             * @default
             */
            marginAsPct: false,

            /**
             * Text entity has default text.
             * @override
             * @default
             */
            text: 'set text property',

            /**
             * Text never ignores system scale.
             * @override
             * @default
             */
            ignoreSystemScale: false,

            /**
             * Text entity moves self.
             * @override
             **/
            getIsMovingSelf: function () {

                return true;

            }

        });

    });