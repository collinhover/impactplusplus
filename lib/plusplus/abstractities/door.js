ig.module(
        'plusplus.abstractities.door'
    )
    .requires(
        'plusplus.entities.switch',
        'plusplus.helpers.utils'
    )
    .defines(function () {

        var _ut = ig.utils;

        /**
         * Entity that acts as an automatic door, opening and closing as an entity passes through.
         * <span class="alert alert-error"><strong>IMPORTANT:</strong> this is an abstract entity that should be extended.</span>
         * @class
         * @extends ig.EntitySwitch
         * @memberof ig
         * @author Collin Hover - collinhover.com
         */
        ig.Door = ig.EntitySwitch.extend(/**@lends ig.Door.prototype */{

            _wmDrawBox: false,
            _wmScalable: false,

            /**
             * @override
             * @default fixed
             */
            collides: ig.EntityExtended.COLLIDES.FIXED,

            frozen: false,

            /**
             * Doors can be locked.
             * @type Boolean
             * @default
             */
            locked: false,

            /**
             * Whether to become automatically locked after close.
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
            initTypes: function () {

                this.parent();

                _ut.addType(ig.EntityExtended, this, 'type', "DOOR");
                _ut.addType(ig.EntityExtended, this, 'checkAgainst', "CHARACTER");

            },

            /**
             * @override
             */
            spawn: function () {

                this.parent();

                // start locked

                if ( this.locked ) {

                    this.lock();

                }

            },

            /**
             * Checks whether door can open and adds check for if door is {@link ig.EntityExtended#oneWay}.
             * @override
             */
            canOpen: function (entity) {

                return this.parent(entity) && !this.locked && ( !this.oneWay || ( entity && !entity.getIsCollidingWithOneWay(this) ) );

            },

            /**
             * Opens door and sets {@link ig.Door#collides} to {@link ig.EntityExtended.COLLIDES.NEVER}.
             * @override
             */
            open: function () {

                this.parent();

                this.collides = ig.EntityExtended.COLLIDES.NEVER;

            },

            /**
             * Closes door and resets {@link ig.Door#collides} to {@link ig.EntityExtended.COLLIDES.FIXED}.
             * @override
             */
            close: function () {

                this.parent();

                this.collides = ig.EntityExtended.COLLIDES.FIXED;

                if (this.autoLock) {

                    this.lock();

                }

            },

            /**
             * Locks door.
             */
            lock: function () {

                this.locked = true;

                this.animOverride( this.getDirectionalAnimName( "lock" ), { lock: true } );

            },

            /**
             * Unlocks door.
             */
            unlock: function () {

                this.locked = false;
			
				var animName = this.entity.getDirectionalAnimName( "lock" );
				
				if ( this.entity.anims[ animName ] && this.entity.currentAnim === this.entity.anims[ animName ] ) {
					
					this.entity.animRelease();
				
				}

            }

        });

    });