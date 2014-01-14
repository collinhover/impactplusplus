ig.module(
    'plusplus.abstractities.door'
)
    .requires(
        'plusplus.entities.switch',
        'plusplus.helpers.utils'
)
    .defines(function() {

        var _ut = ig.utils;

        /**
         * Entity that acts as an automatic door, opening and closing as an entity passes through.
         * <span class="alert alert-error"><strong>IMPORTANT:</strong> this is an abstract entity that should be extended.</span>
         * @class
         * @extends ig.EntitySwitch
         * @memberof ig
         * @author Collin Hover - collinhover.com
         */
        ig.Door = ig.EntitySwitch.extend( /**@lends ig.Door.prototype */ {

            _wmDrawBox: false,
            _wmScalable: false,

            /**
             * @override
             * @default fixed
             */
            collides: ig.EntityExtended.COLLIDES.FIXED,

            /**
             * @override
             * @default
             */
            collidesChanges: true,

            /**
             * @override
             */
            frozen: false,

            /**
             * Doors can be locked. Will play directional "locked" animation.
             * @type Boolean
             * @default
             */
            locked: false,

            /**
             * Whether to automatically lock after close.
             * @type Boolean
             * @default
             */
            autoLock: false,

            /**
             * Inits door types.
             * <br>- adds {@link ig.EntityExtended.TYPE.DOOR} to {@link ig.EntityExtended#type}
             * <br>- adds {@link ig.EntityExtended.TYPE.CHARACTER} to {@link ig.EntityExtended#checkAgainst}
             * @override
             */
            initTypes: function() {

                this.parent();

                _ut.addType(ig.EntityExtended, this, 'type', "DOOR");
                _ut.addType(ig.EntityExtended, this, 'checkAgainst', "CHARACTER");

            },

            /**
             * Doors always collide with one way entities.
             * @override
             */
            getIsCollidingWithOneWay: function() {

                return true;

            },

            /**
             * @override
             */
            spawn: function() {

                // start locked

                if (this.locked) {

                    this.lock();

                }

                this.parent();

            },

            /**
             * Checks whether door can open and adds check for if door is {@link ig.EntityExtended#oneWay}.
             * @override
             */
            getCanOpen: function(entity) {

                return this.parent(entity) && !this.locked && (!this.oneWay || (entity && !entity.getIsCollidingWithOneWay(this)));

            },

            /**
             * Opens door and sets {@link ig.Door#collides} to {@link ig.EntityExtended.COLLIDES.NEVER}.
             * @override
             */
            open: function() {

                this.parent();

                this.collides = ig.EntityExtended.COLLIDES.NEVER;

            },

            /**
             * Closes door and resets {@link ig.Door#collides} to {@link ig.EntityExtended.COLLIDES.FIXED}.
             * @override
             */
            close: function() {

                this.parent();

                this.collides = ig.EntityExtended.COLLIDES.FIXED;

                if (this.autoLock) {

                    this.lock();

                }

            },

            /**
             * Locks door and plays directional "locked" animation.
             */
            lock: function() {

                this.locked = true;
                this.collides = ig.EntityExtended.COLLIDES.FIXED;

                this.animOverride(this.getDirectionalAnimName("locked"), {
                    lock: true
                });

            },

            /**
             * Unlocks door and stops playing directional "locked" animation.
             */
            unlock: function() {

                this.locked = false;

                this.animRelease(this.getDirectionalAnimName("locked"));

            }

        });

    });
