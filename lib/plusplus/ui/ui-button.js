ig.module(
    'plusplus.ui.ui-button'
)
    .requires(
        'plusplus.ui.ui-interactive'
)
    .defines(function() {
        "use strict";

        /**
         * UI button to execute a function within a context.
         * <span class="alert alert-info"><strong>Tip:</strong> Impact++ UIElements are meant to be used for simple user interfaces. If you need something complex, it is recommended that you use the DOM!</span>
         * @class
         * @extends ig.UIInteractive
         * @memberof ig
         * @author Collin Hover - collinhover.com
         * @example
         * // ui buttons are simple interactive elements
         * // that automatically handle setting animations
         * // based on the state of the button's 'alwaysToggleActivate' property
         * // so when alwaysToggleActivate === true
         * // animations will always be "tapped" + direction
         * // and when alwaysToggleActivate === false
         * // animations will always be "pressed" (activated) or "released" (deactivated) + direction
         * // keep in mind that the default method
         * // for interacting with ui elements
         * // is to toggle activate and deactivate
         * // but in the case of a button, by default it always activates
         * // i.e. tapping always activates instead of toggling
         * myButton.alwaysToggleActivate = true;
         * // to have a button do something
         * // just hook into the activated or deactivated signals
         * myButton.onActivated.add( myCallback, myContext );
         * // one way this can be used is for player jumping
         * myButton.onActivated.add( myPlayer.jump, myPlayer );
         * // then when we activate the button
         * // it will cause the player to jump
         * // we could also use it for player abilities
         * myButton.onActivated.add( myPlayer.specialAbility.activate, myPlayer.specialAbility );
         * // it will execute the player's special ability
         * // you can add as many callbacks to the signals as you need
         */
        ig.UIButton = ig.global.UIButton = ig.UIInteractive.extend( /**@lends ig.UIButton.prototype */ {

            /**
             * UI buttons usually want to always activate instead of toggling between.
             * @override
             */
            alwaysToggleActivate: true,

            /**
             * @override
             **/
            activateComplete: function(entity) {

                this.parent(entity);

                this.animRelease();

                if (!this.alwaysToggleActivate) {

                    this.animOverride(this.getDirectionalAnimName("pressed"), {
                        lock: true
                    });

                } else {

                    this.animOverride(this.getDirectionalAnimName("tapped"));

                }

            },

            /**
             * @override
             **/
            deactivateComplete: function(entity) {

                this.parent(entity);

                this.animRelease();

                if (!this.alwaysToggleActivate) {

                    this.animOverride(this.getDirectionalAnimName("released"), {
                        lock: true
                    });

                } else {

                    this.animOverride(this.getDirectionalAnimName("tapped"));

                }

            }

        });

    });
