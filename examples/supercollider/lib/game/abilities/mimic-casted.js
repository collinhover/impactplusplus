ig.module(
        'game.abilities.mimic-casted'
    )
    .requires(
        'plusplus.abilities.mimic',
        'plusplus.entities.effect-electricity',
        'game.entities.effect-mimic',
        'game.entities.effect-fail',
        'plusplus.helpers.utils',
        'plusplus.helpers.utilsvector2'
    )
    .defines(function () {
        "use strict";

        var _ut = ig.utils;
        var _utv2 = ig.utilsvector2;

        /**
         * Ability to mimic with casting.
         * @class
         * @extends ig.AbilityMimic
         * @memberof ig
         * @author Collin Hover - collinhover.com
         **/
        ig.AbilityMimicCasted = ig.AbilityMimic.extend(/**@lends ig.AbilityMimicCasted.prototype */{

            /**
             * Cast activate setup with animation 'mimicSetup'.
             * @type Object
             */
            activateSetupCastSettings: {
                animName: 'mimicSetup'
            },

            /**
             * Cast activate pass by duration of 1 second with animation 'mimicPass' and mimic effect.
             * @type Object
             */
            activatePassCastSettings: {
                delay: 1,
                animName: 'mimicPass',
                effects: [
                    {
                        entityClass: ig.EntityEffectMimic,
                        followSettings: {
                            matchPerformance: true,
                            offsetPct: _utv2.vector(1, -0.15)
                        }
                    }
                ]
            },

            /**
             * Cast activate by animation 'mimicActivate' and mimic effect.
             * @type Object
             */
            activateCastSettings: {
                animName: 'mimicActivate',
                effects: [
                    {
                        entityClass: ig.EntityEffectElectricity,
                        fade: true,
                        followSettings: {
                            matchPerformance: true
                        }
                    }
                ]
            },

            /**
             * Cast fail by duration of 0.5 seconds with animation 'mimicFail' and effect fail.
             * @type Object
             */
            failCastSettings: {
                delay: 0.5,
                animName: 'mimicFail',
                loop: false,
                effects: [
                    {
                        entityClass: ig.EntityEffectFail,
                        fade: true,
                        followSettings: {
                            matchPerformance: true,
                            offsetPct: _utv2.vector(1, -0.15)
                        }
                    }
                ]
            },

            /**
             * Cast deactivate from execute by animation 'mimicDeactivate'.
             * @type Object
             */
            deactivateFromExecuteCastSettings: {
                animName: 'mimicDeactivate'
            },

            /**
             * Ability can target self.
             * @type Boolean
             * @default
             */
            canTargetSelf: true,

            /**
             * @override
             **/
            initTypes: function () {

                // types

                _ut.addType(ig.Ability, this, 'type', "SPAMMABLE MIMIC");

                // able to target mimicable

                _ut.addType(ig.EntityExtended, this, 'typeTargetable', "MIMICABLE");

            },

            /**
             * @see ig.Ability.
             **/
            execute: function () {

                if (this.enabled) {

                    // cleanup when target is self

                    if (this.entity === this.entityTarget) {

                        this.cleanup();

                        this.cast(this.deactivateFromExecuteCastSettings);

                    }
                    else {

                        this.parent();

                    }

                }

            }

        });

    });