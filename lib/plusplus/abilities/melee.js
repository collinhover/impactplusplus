ig.module(
    'plusplus.abilities.melee'
)
    .requires(
        'plusplus.core.config',
        'plusplus.abilities.ability-damage',
        'plusplus.entities.effect-pow',
        'plusplus.helpers.utils'
)
    .defines(function() {
        "use strict";

        var _c = ig.CONFIG;
        var _ut = ig.utils;

        /**
         * Ability for melee action.
         * <span class="alert alert-danger"><strong>IMPORTANT:</strong> always use abilities by calling the {@link ig.Ability#activate} method, and if the ability {@link ig.Ability#requiresTarget} make sure it {@link ig.Ability#canFindTarget} or you supply one via {@link ig.Ability#setEntityTarget} or {@link ig.Ability#setEntityTargetFirst}!</span>
         * @class
         * @extends ig.AbilityDamage
         * @memberof ig
         * @author Collin Hover - collinhover.com
         **/
        ig.AbilityMelee = ig.AbilityDamage.extend( /**@lends ig.AbilityMelee.prototype */ {

            /**
             * Ability can be done while moving.
             * @override
             * @default
             */
            movable: true,

            /**
             * Melee has a short cooldown.
             * @override
             * @default
             */
            cooldownDelay: 0.2,

            /**
             * Range is based on effective size of the base character.
             * Generally, we want melee to have a bit larger range than what would be expected visually.
             * @override
             * @default
             */
            rangeX: _c.CHARACTER.SIZE_EFFECTIVE_X * 1.5,

            /**
             * Ability should find target automatically.
             * @override
             * @default
             */
            canFindTarget: true,

            /**
             * Cast melee animation to setup.
             * @override
             */
            activateSetupCastSettings: {
                animName: 'melee',
                async: true
            },

            /**
             * Show pow effect if melee is successful.
             * @override
             */
            activateCastSettings: {
                effects: [{
                    entityClass: ig.EntityEffectPow,
                    ignoreDuration: true,
                    followTarget: true,
                    followSettings: {
                        matchPerformance: true,
                        randomOffsetPct: {
                            x: 0.2,
                            y: 0.2
                        }
                    }
                }]
            },

            /**
             * Initializes melee types.
             * <br>- adds {@link ig.Ability.TYPE.SPAMMABLE} to {@link ig.Ability#type}
             * @override
             **/
            initTypes: function() {

                this.parent();

                _ut.addType(ig.Ability, this, 'type', "SPAMMABLE");

            },

            /**
             * @override
             **/
            clone: function(c) {

                if (c instanceof ig.AbilityMelee !== true) {

                    c = new ig.AbilityMelee();

                }

                return this.parent(c);

            }

        });

    });
