ig.module(
    'plusplus.ui.ui-toggle'
)
    .requires(
        'plusplus.ui.ui-interactive'
)
    .defines(function() {
        "use strict";

        /**
         * Interactive ui element that toggles states.
         * <br>- toggles between {@link ig.EntityExtended#activate} and {@link ig.EntityExtended#deactivate}
         * <span class="alert alert-info"><strong>Tip:</strong> Impact++ UIElements are meant to be used for simple user interfaces. If you need something complex, it is recommended that you use the DOM!</span>
         * @class
         * @extends ig.UIInteractive
         * @memberof ig
         * @author Collin Hover - collinhover.com
         * @example
         * // it is easy to create a toggle button
         * ig.UIToggleButton = ig.UIInteractive.extend({
         *      // override the activate method to do something
         *      activateComplete: function ( entity ) {
         *          // call parent activate
         *          this.parent();
         *          // and doing something
         *      },
         *      // override the deactivate method to do something else
         *      deactivateComplete: function ( entity ) {
         *          // call parent deactivate
         *          this.parent();
         *          // and doing something else
         *      }
         * });
         * // then spawn an instance of the ig.UIToggleButton when the player is added to the game
         * // and player can click it to do something as well as something else
         */
        ig.UIToggle = ig.global.UIToggle = ig.UIInteractive.extend( /**@lends ig.UIToggle.prototype */ {

            /**
             * @override
             **/
            activateComplete: function(entity) {

                this.parent(entity);

                this.animOverride(this.getDirectionalAnimName("on"), {
                    lock: true
                });

            },

            /**
             * @override
             **/
            deactivateComplete: function(entity) {

                this.parent(entity);

                this.animRelease(this.getDirectionalAnimName("on"));

            }

        });

    });
