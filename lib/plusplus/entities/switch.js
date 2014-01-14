ig.module(
    'plusplus.entities.switch'
)
    .requires(
        'plusplus.entities.trigger-controller',
        'plusplus.helpers.utils'
)
    .defines(function() {

        var _ut = ig.utils;

        /**
         * Entity that acts as a presence activated trigger.
         * <span class="alert alert-info"><strong>Tip:</strong> if you're going to use a switch to open a door, make sure it is a triggered door!</span>
         * @class
         * @extends ig.EntityTriggerController
         * @memberof ig
         * @author Collin Hover - collinhover.com
         */
        ig.EntitySwitch = ig.global.EntitySwitch = ig.EntityTriggerController.extend( /**@lends ig.EntitySwitch.prototype */ {

            // editor properties

            _wmBoxColor: 'rgba( 150, 0, 255, 0.7 )',

            /**
             * Switches should be triggerable through collision.
             * @override
             * @default
             */
            triggerable: true,

            /**
             * Switches can be broken and not open or close.  Will play directional "broken" animation.
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
             * Switches can be blocked and not open or close. Will play directional "openBlocked" animation if blocked while closed, and directional "closeBlocked" animation if blocked while open.
             * @type Boolean
             * @default
             */
            blocked: false,

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
            initTypes: function() {

                this.parent();

                _ut.addType(ig.EntityExtended, this, 'type', "SWITCH");
                _ut.addType(ig.EntityExtended, this, 'checkAgainst', "CHARACTER");

            },

            /**
             * @override
             */
            spawn: function() {

                this.parent();

                // start state

                if (this.blocked) {

                    this.block();

                }

                if (this.broken) {

                    this.malfunction();

                }

            },

            /**
             * Activates switch and opens.
             * @override
             */
            activate: function(entity) {

                if (this.getCanOpen(entity)) {

                    this.open();

                    this.parent(entity);

                }

            },

            /**
             * Deactivates switch and closes.
             * @override
             */
            deactivate: function(entity) {

                if (this.getCanClose(entity)) {

                    this.close();

                    this.parent(entity);

                }

            },

            /**
             * Switches need to be able to open to be triggered.
             * @override
             */
            getCanTrigger: function(entity) {

                return this.parent(entity) && this.getCanOpen(entity);

            },

            /**
             * Checks if switch can open.
             * @param {ig.EntityExtended} entity entity trying to cause open.
             * @returns {Boolean} whether switch can open.
             */
            getCanOpen: function(entity) {

                return !this.activated && !this.broken && !this.blocked;

            },

            /**
             * Checks if switch can close.
             * @param {ig.EntityExtended} entity entity trying to cause close.
             * @returns {Boolean} whether switch can close.
             */
            getCanClose: function(entity) {

                return this.activated && !this.checking && !this.broken && !this.blocked;

            },

            /**
             * Opens switch and plays directional "open" animation.
             */
            open: function() {

                this.animOverride(this.getDirectionalAnimName("open"), {
                    lock: true
                });

                if (this.autoBreak) {

                    this.malfunction();

                }

            },

            /**
             * Closes switch and plays directional "open" animation.
             */
            close: function() {

                this.animOverride(this.getDirectionalAnimName("close"));

                if (this.autoBreak) {

                    this.malfunction();

                }

            },

            /**
             * Breaks switch and plays directional "broken" animation.
             */
            malfunction: function() {

                this.broken = true;

                this.animOverride(this.getDirectionalAnimName("broken"), {
                    lock: true
                });

            },

            /**
             * Fixes switch and stops playing directional "broken" animation.
             */
            fix: function() {

                this.broken = false;

                this.animRelease(this.getDirectionalAnimName("broken"));

            },

            /**
             * Blocks switch and plays directional "openBlocked" (when closed) or "closeBlocked" (when open) animation. Use when something is blocking switch, such as vines or rubble.
             */
            block: function() {

                this.blocked = true;

                this.animOverride(this.getDirectionalAnimName(this.activated ? "closeBlocked" : "openBlocked"), {
                    loop: true,
                    lock: true
                });

            },

            /**
             * Unblocks switch and stops playing directional "blocked" animation.
             */
            unblock: function() {

                this.blocked = false;

                this.animRelease(this.getDirectionalAnimName("openBlocked"));
                this.animRelease(this.getDirectionalAnimName("closeBlocked"));

            }

        });

    });
