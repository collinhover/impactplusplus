ig.module(
        'plusplus.entities.void'
    )
    .requires(
        'plusplus.core.entity'
    )
    .defines(function () {

        /**
         * Entity that does nothing and can be used as a target.
         * @class
         * @extends ig.EntityExtended
         * @memberof ig
         * @author Collin Hover - collinhover.com
         * @author Dominic Szablewski
         **/
        ig.EntityVoid = ig.global.EntityVoid = ig.EntityExtended.extend(/**@lends ig.EntityVoid.prototype */{

            // editor properties

            _wmDrawBox: true,
            _wmBoxColor: 'rgba(100, 100, 100, 0.7)',

            /**
             * Void entity have no update.
             * @override
             */
            update: function () {
            }

        });

    });