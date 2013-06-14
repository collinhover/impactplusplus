ig.module(
        'plusplus.ui.ui-interactive'
    )
    .requires(
        'plusplus.ui.ui-element',
        'plusplus.helpers.utils'
    )
    .defines(function () {
        "use strict";

        var _ut = ig.utils;

        /**
         * Interactive ui element.
         * @class
         * @extends ig.UIElement
         * @memberof ig
         * @author Collin Hover - collinhover.com
         * @example
         * // it is easy to create a clickable button
         * ig.UIButton = ig.UIInteractive.extend({
         *      // override the activate method to do something special when button interacted with
         *      activate: function ( entity ) {
         *          // call parent activate
         *          this.parent();
         *          // and doing some special things!
         *      },
         *      // but this will only work on the first click, then it won't respond again
         *      // so if the button should be able to be clicked repeatedly
         *      alwaysToggleActivate: true
         * });
         * // then spawn an instance of the ig.UIButton when the player is added to the game
         * // and player can click it to do special things
         */
        ig.UIInteractive = ig.global.UIInteractive = ig.UIElement.extend(/**@lends ig.UIInteractive.prototype */{

            /**
             * Interactive ui should be targetable.
             * @override
             */
            targetable: true,

            /**
             * Adds {@link ig.EntityExtended.TYPE.INTERACTIVE} type.
             * @override
             **/
            initTypes: function () {

                this.parent();

                _ut.addType(ig.EntityExtended, this, 'type', "INTERACTIVE");

            }

        });

    });