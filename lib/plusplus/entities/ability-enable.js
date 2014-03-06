ig.module(
    'plusplus.entities.ability-enable'
)
    .requires(
        'plusplus.entities.ability-activate'
)
    .defines(function() {
        "use strict";

        /**
         * Ability trigger that enables (or disables) abilities in targets.
         * @class
         * @extends ig.EntityAbilityActivate
         * @memberof ig
         * @author Collin Hover - collinhover.com
         **/
        ig.EntityAbilityEnable = ig.global.EntityAbilityEnable = ig.EntityAbilityActivate.extend( /**@lends ig.EntityAbilityEnable.prototype */ {

            /**
             * Whether to enable Ability's {@link ig.Ability#enabled}.
             * @type Boolean
             * @default
             */
            abilityEnabling: true,

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

                                ab.setEnabled(this.abilityEnabling);

                            }

                        } else if (this.abilityType) {

                            var abs = target.abilities.getDescendantsByType(this.abilityType);

                            if (abs.length) {

                                for (var j = 0, jl = abs.length; j < jl; j++) {

                                    abs[j].setEnabled(this.abilityEnabling);

                                }

                            }

                        }

                    }

                }

            }

        });

    });
