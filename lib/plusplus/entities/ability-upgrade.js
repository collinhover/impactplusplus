ig.module(
    'plusplus.entities.ability-upgrade'
)
    .requires(
        'plusplus.entities.ability-activate'
)
    .defines(function() {
        "use strict";

        /**
         * Ability trigger that changes the upgrade level of an ability in targets.
         * @class
         * @extends ig.EntityAbilityActivate
         * @memberof ig
         * @author Collin Hover - collinhover.com
         **/
        ig.EntityAbilityUpgrade = ig.global.EntityAbilityUpgrade = ig.EntityAbilityActivate.extend( /**@lends ig.EntityAbilityUpgrade.prototype */ {

            /**
             * Ability's {@link ig.Ability#rank} to change to.
             * @type Number|Boolean
             * @default
             */
            abilityRank: 0,

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

                                ab.changegrade(this.abilityRank);

                            }

                        } else if (this.abilityType) {

                            var abs = target.abilities.getDescendantsByType(this.abilityType);

                            if (abs.length) {

                                for (var j = 0, jl = abs.length; j < jl; j++) {

                                    abs[j].changegrade(this.abilityRank);

                                }

                            }

                        }

                    }

                }

            }

        });

    });
