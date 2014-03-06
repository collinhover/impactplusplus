ig.module(
    'plusplus.abstractities.door-triggered'
)
    .requires(
        'plusplus.abstractities.door'
)
    .defines(function() {

        /**
         * Convenience door, opening and closing only when triggered and not with interaction or collision.
         * <span class="alert alert-error"><strong>IMPORTANT:</strong> this is an abstract entity that should be extended.</span>
         * @class
         * @extends ig.Door
         * @memberof ig
         * @author Collin Hover - collinhover.com
         */
        ig.DoorTriggered = ig.Door.extend( /**@lends ig.DoorTriggered.prototype */ {

            /**
             * Door should not trigger through collisions.
             * @override
             * @default
             */
            triggerable: false,

            /**
             * Door should not be able to be targeted.
             * @override
             * @default
             */
            targetable: false,

            /**
             * Door should not auto toggle open/close.
             * @override
             * @default
             */
            autoToggle: false,

            /**
             * Triggered doors do not care if another entity is colliding with them, they always close.
             * @override
             */
            getCanClose: function(entity) {

                return this.activated && !this.broken && !this.blocked;

            }

        });

    });
