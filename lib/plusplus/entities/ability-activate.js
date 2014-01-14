ig.module(
    'plusplus.entities.ability-activate'
)
    .requires(
        'plusplus.entities.trigger',
        'plusplus.helpers.utils'
)
    .defines(function() {
        "use strict";

        var _ut = ig.utils;

        /**
         * Trigger that activates an ability in targets.
         * @class
         * @extends ig.EntityTrigger
         * @memberof ig
         * @author Collin Hover - collinhover.com
         **/
        ig.EntityAbilityActivate = ig.global.EntityAbilityActivate = ig.EntityTrigger.extend( /**@lends ig.EntityAbilityExecute.prototype */ {

            // editor properties

            _wmBoxColor: 'rgba( 255, 0, 255, 0.7 )',

            /**
             * Ability's {@link ig.Ability#name}, overrides {@link ig.EntityTriggerAbility#abilityType}.
             * @type String
             * @default
             */
            abilityName: '',

            /**
             * Ability's {@link ig.Ability#type}. If set to a string, will be automatically converted to a bitflag.
             * @type String|Number|Bitflag
             * @default
             * @see ig.Ability.TYPE
             */
            abilityType: 0,

            /**
             * Ability Triggers should use checking entity as target.
             * @override
             * @default
             */
            useCheckingAsTarget: true,

            // internal property, do not modify

            _checkedEntity: null,

            /**
             * Resets and converts {@link ig.EntityTriggerAbility#abilityType} to an actual type via {@link ig.utils.addType}
             * @override
             */
            resetExtras: function() {

                // check type and convert to type value if is a valid string

                if (typeof this.abilityType === 'string' && this.abilityType) {

                    var abilityType = this.abilityType;

                    this.abilityType = 0;

                    _ut.addType(ig.Ability, this, 'abilityType', abilityType);

                }

                this.parent();

            },

            /**
             * @override
             */
            handleTargets: function(entity, needsActivation) {

                if (needsActivation !== false) {

                    this.activate(entity);

                }

                for (var i = 0, il = this.targetSequence.length; i < il; i++) {

                    var target = this.targetSequence[i];

                    if (target && target.abilities) {

                        if (this.abilityName) {

                            var ab = target.abilities.getDescendantByName(this.abilityName);

                            if (ab) {

                                ab.activate();

                            }

                        } else if (this.abilityType) {

                            var abs = target.abilities.getDescendantsByType(this.abilityType);

                            if (abs.length) {

                                for (var j = 0, jl = abs.length; j < jl; j++) {

                                    abs[j].activate();

                                }

                            }

                        }

                    }

                }

            }

        });

    });
