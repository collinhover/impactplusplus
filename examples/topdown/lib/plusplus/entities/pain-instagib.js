ig.module(
        'plusplus.entities.pain-instagib'
    )
    .requires(
        'plusplus.entities.pain'
    )
    .defines(function () {
        "use strict";

        /**
         * Entity that instantly kills any triggering entity.
         * @class
         * @extends ig.EntityPain
         * @memberof ig
         * @author Collin Hover - collinhover.com
         **/
        ig.EntityPainInstagib = ig.global.EntityPainInstagib = ig.EntityPain.extend(/**@lends ig.EntityPainInstagib.prototype */{

            /**
             * @override
             * @default
             */
            damageAsPct: true,

            /**
             * @override
             * @default
             */
            damageUnblockable: true

        });

    });