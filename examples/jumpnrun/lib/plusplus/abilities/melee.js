ig.module(
        'plusplus.abilities.melee'
    )
    .requires(
        'plusplus.core.config',
        'plusplus.abilities.ability-damage',
        'plusplus.entities.effect-pow',
        'plusplus.helpers.utils',
        'plusplus.helpers.utilsvector2'
    )
    .defines(function () {
        "use strict";

        var _c = ig.CONFIG;
        var _ut = ig.utils;
        var _utv2 = ig.utilsvector2;

        /**
         * Ability for melee action.
         * @class
         * @extends ig.AbilityDamage
         * @memberof ig
         * @author Collin Hover - collinhover.com
         **/
        ig.AbilityMelee = ig.AbilityDamage.extend(/**@lends ig.AbilityMelee.prototype */{
            /**
             * Range is based on effective size of the base character.
             * Generally, we want melee to have a bit larger range than what would be expected visually.
             * @type Number
             * @default
             */
            rangeX: _c.CHARACTER.SIZE_EFFECTIVE_X * 1.5,

            /**
             * Ability should find target automatically.
             * @type Boolean
             * @default
             */
            canFindTarget: true,

            /**
             * Cast activate by animation 'melee', while moving, with a pow effect.
             * @type Object
             */
            activateCastSettings: {
                animName: 'melee',
                moving: true,
                effects: [
                    {
                        entity: ig.EntityEffectPow,
                        ignoreDuration: true,
                        followTarget: true,
                        followSettings: {
                            matchPerformance: true,
                            randomOffsetPct: _utv2.vector(0.2, 0.2)
                        }
                    }
                ]
            },

            /**
             * Initializes melee types.
             * <br>- adds {@link ig.Ability.TYPE.SPAMMABLE} to {@link ig.Ability#type}
             * @override
             **/
            initTypes: function () {

                this.parent();

                _ut.addType(ig.Ability, this, 'type', "SPAMMABLE");

            },

            /**
             * @override
             **/
            clone: function (c) {

                if (c instanceof ig.AbilityMelee !== true) {

                    c = new ig.AbilityMelee();

                }

                return this.parent(c);

            }

        });

    });