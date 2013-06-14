ig.module(
        'plusplus.abstractities.door-usable'
    )
    .requires(
        'plusplus.core.config',
        'plusplus.abstractities.door',
        'plusplus.helpers.utils'
    )
    .defines(function () {

        var _c = ig.CONFIG;
        var _ut = ig.utils;

        /**
         * Entity that acts as a usable door, opening and closing when interacted with.
         * <span class="alert alert-error"><strong>IMPORTANT:</strong> this is an abstract entity that should be extended.</span>
         * @class
         * @extends ig.Door
         * @memberof ig
         * @author Collin Hover - collinhover.com
         */
        ig.DoorUsable = ig.Door.extend(/**@lends ig.DoorUsable.prototype */{

            /**
             * Door should not trigger through collisions.
             * @override
             * @default
             */
            triggerable: false,

            /**
             * Door should be able to be targeted.
             * @override
             * @default
             */
            targetable: true,

            /**
             * Door horizontal interaction range, based on {@link ig.CONFIG.CHARACTER.SIZE_EFFECTIVE_X}.
             * @override
             */
            rangeInteractableX: _c.CHARACTER.SIZE_EFFECTIVE_X,

            /**
             * Door vertical interaction range, based on {@link ig.CONFIG.CHARACTER.SIZE_EFFECTIVE_Y}.
             * @override
             */
            rangeInteractableY: _c.CHARACTER.SIZE_EFFECTIVE_Y,

            /**
             * Door should not auto toggle open/close.
             * @override
             * @default
             */
            autoToggle: false,

            /**
             * Inits door types.
             * <br>- adds {@link ig.EntityExtended.TYPE.INTERACTIVE} to {@link ig.EntityExtended#type}
             * @override
             */
            initTypes: function () {

                this.parent();

                _ut.addType(ig.EntityExtended, this, 'type', "INTERACTIVE");

            }

        });

    });