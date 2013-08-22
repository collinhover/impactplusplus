ig.module(
        'plusplus.entities.switch'
    )
    .requires(
        'plusplus.entities.trigger-controller',
        'plusplus.helpers.utils'
    )
    .defines(function () {

        var _ut = ig.utils;

        /**
         * Entity that acts as a presence activated trigger.
         * @class
         * @extends ig.EntityTriggerController
         * @memberof ig
         * @author Collin Hover - collinhover.com
         */
        ig.EntitySwitch = ig.global.EntitySwitch = ig.EntityTriggerController.extend(/**@lends ig.EntitySwitch.prototype */{

            // editor properties

            _wmBoxColor: 'rgba( 150, 0, 255, 0.7 )',

            /**
             * Switches should be triggerable through collision.
             * @override
             * @default
             */
            triggerable: true,

            /**
             * Switches can be broken and not open or close.
             * @type Boolean
             * @default
             */
            broken: false,

            /**
             * Whether to become automatically broken after open or close.
             * @type Boolean
             * @default
             */
            autoBreak: false,

            /**
             * Switches should automatically toggle back to default state.
             * @override
             * @default
             */
            autoToggle: true,

            /**
             * Initializes switch types.
             * <br>- adds {@link ig.EntityExtended.TYPE.SWITCH} to {@link ig.EntityExtended#type}
             * <br>- adds {@link ig.EntityExtended.TYPE.CHARACTER} to {@link ig.EntityExtended#checkAgainst}
             * @override
             **/
            initTypes: function () {

                this.parent();

                _ut.addType(ig.EntityExtended, this, 'type', "SWITCH");
                _ut.addType(ig.EntityExtended, this, 'checkAgainst', "CHARACTER");

            },

            /**
             * @override
             */
            spawn: function () {

                this.parent();

                // start broken

                if ( this.broken ) {

                    this.malfunction();

                }

            },

            /**
             * Activates switch and opens.
             * @override
             */
            activate: function (entity) {

                if (this.canOpen(entity)) {

                    this.open();

                    this.parent(entity);

                }

            },

            /**
             * Deactivates switch and closes.
             * @override
             */
            deactivate: function (entity) {

                if (this.canClose(entity)) {

                    this.close();

                    this.parent(entity);

                }

            },

            /**
             * Checks if switch can open.
             * @returns {Boolean} whether switch can open.
             */
            canOpen: function (entity) {

                return !this.activated && !this.broken;

            },

            /**
             * Checks if switch can close.
             * @returns {Boolean} whether switch can close.
             */
            canClose: function (entity) {

                return this.activated && !this.checking && !this.broken;

            },

            /**
             * Opens switch.
             */
            open: function () {

                this.animOverride( this.getDirectionalAnimName( "open" ), { lock: true } );

                if (this.autoBreak) {

                    this.malfunction();

                }

            },

            /**
             * Closes switch.
             */
            close: function () {

                this.animOverride( this.getDirectionalAnimName( "close" ) );

                if (this.autoBreak) {

                    this.malfunction();

                }

            },

            /**
             * Breaks switch.
             */
            malfunction: function () {

                this.broken = true;

                this.animOverride(this.getDirectionalAnimName( "broken" ), { lock: true } );

            },

            /**
             * Fixes switch.
             */
            fix: function () {

                this.broken = false;
			
				var animName = this.entity.getDirectionalAnimName( "broken" );
				
				if ( this.entity.anims[ animName ] && this.entity.currentAnim === this.entity.anims[ animName ] ) {
					
					this.entity.animRelease();
				
				}

            }

        });

    });