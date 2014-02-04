ig.module(
    'game.abilities.eat'
)
    .requires(
        'plusplus.core.config',
        'plusplus.abilities.melee',
        'plusplus.helpers.utils'
)
    .defines(function() {
        "use strict";

        var _c = ig.CONFIG;
        var _ut = ig.utils;

        /**
         * Eating ability.
         * @class
         * @extends ig.AbilityMelee
         * @memberof ig
         * @author Collin Hover - collinhover.com
         */
        ig.AbilityEat = ig.global.AbilityEat = ig.AbilityMelee.extend( /**@lends ig.AbilityEat.prototype */ {

            /**
             * @override
             **/
            cooldownDelay: 1,

            /**
             * @override
             */
            rangeX: _c.CHARACTER.SIZE_EFFECTIVE_X * 0.5,

            /**
             * @override
             **/
            activateCastSettings: {
                animName: 'eat',
                moving: false
            },

            /**
             * @override
             **/
            initTypes: function() {

                //this.parent();

                _ut.addType(ig.EntityExtended, this, 'typeTargetable', "EDIBLE");

            },

            /**
             * @override
             **/
            clone: function(c) {

                if (c instanceof ig.AbilityEat !== true) {

                    c = new ig.AbilityEat();

                }

                return this.parent(c);

            }

        });

    });
