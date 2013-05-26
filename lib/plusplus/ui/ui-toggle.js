ig.module(
        'plusplus.ui.ui-toggle'
    )
    .requires(
        'plusplus.ui.ui-interactive'
    )
    .defines(function () {
        "use strict";

        /**
         * Interactive ui element that toggles states.
         * <br>- toggles between {@link ig.EntityExtended#activate} and {@link ig.EntityExtended#deactivate}
         * @class
         * @extends ig.UIInteractive
         * @memberof ig
         * @author Collin Hover - collinhover.com
         * @example
         * // it is easy to create a toggle button
         * ig.UIToggleButton = ig.UIInteractive.extend({
         *      // override the activate method to do something
         *      activate: function ( entity ) {
         *          // call parent activate
         *          this.parent();
         *          // and doing something
         *      },
         *      // override the deactivate method to do something else
         *      deactivate: function ( entity ) {
         *          // call parent deactivate
         *          this.parent();
         *          // and doing something else
         *      }
         * });
         * // then spawn an instance of the ig.UIToggleButton when the player is added to the game
         * // and player can click it to do something as well as something else
         */
        ig.UIToggle = ig.global.UIToggle = ig.UIInteractive.extend(/**@lends ig.UIToggle.prototype */{

            /**
             * Animation name for when toggled on.
             * @type String
             * @default
             */
            animNameActivate: 'on',

            /**
             * Animation name for when toggled off.
             * @type String
             * @default
             */
            animNameDeactivate: 'idle',

            /**
             * @override
             **/
            activate: function (entity) {

                this.currentAnim = this.anims[ this.animNameActivate ];

                this.parent(entity);

            },

            /**
             * @override
             **/
            deactivate: function (entity) {

                this.currentAnim = this.anims[ this.animNameDeactivate ];

                this.parent(entity);

            }

        });

    });