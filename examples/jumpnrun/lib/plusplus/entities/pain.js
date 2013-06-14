ig.module(
        'plusplus.entities.pain'
    )
    .requires(
        'plusplus.entities.trigger',
        'plusplus.helpers.utils'
    )
    .defines(function () {
        "use strict";

        var _ut = ig.utils;

        /**
         * Entity trigger that does damage to another entity upon activation.
         * @class
         * @extends ig.EntityTrigger
         * @memberof ig
         * @author Collin Hover - collinhover.com
         **/
        ig.EntityPain = ig.global.EntityPain = ig.EntityTrigger.extend(/**@lends ig.EntityPain.prototype */{

            // editor properties

            _wmBoxColor: 'rgba( 255, 0, 100, 0.7 )',

            /**
             * Damage done.
             * @type Number
             * @default
             */
            damage: 1,

            /**
             * Damage done is a percent of target's health.
             * @type Boolean
             * @default
             */
            damageAsPct: false,

            /**
             * Damage done cannot be blocked.
             * @type Boolean
             * @default
             */
            damageUnblockable: false,

            /**
             * @override
             * @default
             */
            once: false,

            /**
             * @override
             * @default
             */
            suicidal: false,

            /**
             * Initializes pain types.
             * <br>- adds {@link ig.EntityExtended.TYPE.CHARACTER} to {@link ig.EntityExtended#checkAgainst}
             * @override
             */
            initTypes: function () {

                this.parent();

                _ut.addType(ig.EntityExtended, this, 'checkAgainst', "CHARACTER");

            },

            /**
             * Does damage to triggering entity.
             * @override
             **/
            activate: function (entity) {

                var damage;

                if (this.damageAsPct) {

                    damage = entity.health * this.damage;

                }
                else {

                    damage = this.damage;

                }

                entity.receiveDamage(damage, this, this.damageUnblockable);

            }

        });

    });