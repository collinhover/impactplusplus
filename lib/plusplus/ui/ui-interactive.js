ig.module(
    'plusplus.ui.ui-interactive'
)
    .requires(
        'plusplus.ui.ui-element',
        'plusplus.helpers.utils'
)
    .defines(function() {
        "use strict";

        var _ut = ig.utils;

        /**
         * Interactive ui element.
         * <span class="alert alert-info"><strong>Tip:</strong> Impact++ UIElements are meant to be used for simple user interfaces. If you need something complex, it is recommended that you use the DOM!</span>
         * @class
         * @extends ig.UIElement
         * @memberof ig
         * @author Collin Hover - collinhover.com
         * @example
         * // it is easy to create a clickable button
         * myButtonClass = ig.UIInteractive.extend({
         *      // override the activate method to do something special when button interacted with
         *      activateComplete: function ( entity ) {
         *          // call parent activate
         *          this.parent();
         *          // do some activation behavior
         *      },
         *      // and since interactive elements are toggled by default
         *      // you can also do something when deactivated
         *      deactivateComplete: function ( entity ) {
         *          this.parent();
         *          // do some deactivation behavior
         *      }
         * });
         * // keep in mind that the default method
         * // for interacting with ui elements
         * // is to toggle activate and deactivate
         * // but if you only want an interactive element to be activated
         * // i.e. tapping always activates instead of toggling
         * myElement.alwaysToggleActivate = true;
         * // to have an interactive element do something
         * // just hook into the activated or deactivated signals
         * myButton.onActivated.add( myCallback, myContext );
         * // one way this can be used is for player jumping
         * myButton.onActivated.add( myPlayer.jump, myPlayer );
         * // then when we activate the element
         * // it will cause the player to jump
         * // we could also use it for player abilities
         * myButton.onActivated.add( myPlayer.specialAbility.activate, myPlayer.specialAbility );
         * // it will execute the player's special ability
         * // you can add as many callbacks to the signals as you need
         */
        ig.UIInteractive = ig.global.UIInteractive = ig.UIElement.extend( /**@lends ig.UIInteractive.prototype */ {

            /**
             * Interactive ui should be targetable.
             * @override
             */
            targetable: true,

            /**
             * Whether element is enabled and able to be activated/deactivated.
             * @type Boolean
             * @default
             */
            enabled: true,

            /**
             * Signal dispatched when UI element activated.
             * <br>- created on init.
             * @type ig.Signal
             */
            onActivated: null,

            /**
             * Signal dispatched when UI element deactivated.
             * <br>- created on init.
             * @type ig.Signal
             */
            onDeactivated: null,

            /**
             * Adds {@link ig.EntityExtended.TYPE.INTERACTIVE} type.
             * @override
             **/
            initTypes: function() {

                this.parent();

                _ut.addType(ig.EntityExtended, this, 'type', "INTERACTIVE");

            },

            /**
             * @override
             **/
            initProperties: function() {

                this.parent();

                this.onActivated = new ig.Signal();
                this.onDeactivated = new ig.Signal();

            },

            /**
             * @override
             */
            resetExtras: function() {

                this.parent();

                this.setEnabled(this.enabled);

            },

            /**
             * Sets element enabled state.
             * @param {Boolean} [enabled=false] whether enabled.
             */
            setEnabled: function(enabled) {

                if (enabled) {

                    this.enable();

                } else {

                    this.disable();

                }

            },

            /**
             * Enables element.
             */
            enable: function() {

                this.enabled = true;

                this.animRelease(this.getDirectionalAnimName("disabled"));

            },

            /**
             * Disables element.
             */
            disable: function() {

                if (this.activated) {

                    this.deactivate();

                }

                this.enabled = false;

                this.animOverride(this.getDirectionalAnimName("disabled"), {
                    lock: true
                });

            },

            /**
             * @override
             **/
            activate: function(entity) {

                if (this.enabled) {

                    this.activateComplete(entity);

                    this.parent(entity);

                }

            },

            /**
             * @override
             **/
            deactivate: function(entity) {

                if (this.enabled) {

                    this.deactivateComplete(entity);

                    this.parent(entity);

                }

            },

            /**
             * Called automatically when activated successfully to dispatch {@link ig.UIInteractive#onActivated}.
             * @param entity
             */
            activateComplete: function(entity) {

                this.onActivated.dispatch(this);

            },

            /**
             * Called automatically when deactivated successfully to dispatch {@link ig.UIInteractive#onDeactivated}.
             * @param entity
             */
            deactivateComplete: function(entity) {

                this.onDeactivated.dispatch(this);

            },

            /**
             * @override
             **/
            cleanup: function() {

                if (!ig.game.hasLevel) {

                    this.onActivated.removeAll();
                    this.onActivated.forget();
                    this.onDeactivated.removeAll();
                    this.onDeactivated.forget();

                }

                this.parent();

            }

        });

    });
