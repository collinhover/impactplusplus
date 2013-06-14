ig.module(
        'plusplus.abstractities.lever'
    )
    .requires(
        'plusplus.entities.switch',
        'plusplus.helpers.utils'
    )
    .defines(function () {

        var _ut = ig.utils;

        /**
         * Entity switch triggered by use / interaction instead of by collision.
         * <span class="alert alert-error"><strong>IMPORTANT:</strong> this is an abstract entity that should be extended.</span>
         * @class
         * @extends ig.EntitySwitch
         * @memberof ig
         * @author Collin Hover - collinhover.com
         */
        ig.Lever = ig.global.Lever = ig.EntitySwitch.extend(/**@lends ig.Lever.prototype */{

            /**
             * Levers should not be triggered through collision.
             * @override
             * @default
             */
            triggerable: false,

            /**
             * @override
             * @default
             */
            targetable: true,

            /**
             * Don't auto toggle lever open/close.
             * @override
             * @default
             */
            autoToggle: false,

            /**
             * Inits lever types.
             * <br>- adds {@link ig.EntityExtended.TYPE.LEVER} to {@link ig.EntityExtended#type}
             * <br>- adds {@link ig.EntityExtended.TYPE.INTERACTIVE} to {@link ig.EntityExtended#type}
             * @override
             */
            initTypes: function () {

                this.parent();

                _ut.addType(ig.EntityExtended, this, 'type', "LEVER INTERACTIVE");

            }

        });

    });