ig.module(
        'plusplus.entities.ability-upgrade'
    )
    .requires(
        'plusplus.entities.trigger',
        'plusplus.helpers.utils'
    )
    .defines(function () {
        "use strict";

        var _ut = ig.utils;

        /**
         * Entity that triggers an upgrade or downgrade of another entity's ability to a specific rank.
         * @class
         * @extends ig.EntityTrigger
         * @memberof ig
         * @author Collin Hover - collinhover.com
         **/
        ig.EntityAbilityUpgrade = ig.global.EntityAbilityUpgrade = ig.EntityTrigger.extend(/**@lends ig.EntityAbilityUpgrade.prototype */{

            // editor properties

            _wmBoxColor: 'rgba( 255, 0, 255, 0.7 )',

            /**
             * Name of ability to upgrade.
             * @type String
             */
            abilityName: '',

            /**
             * Type of ability to upgrade.
             * @type String|Number
             * @see ig.Ability.TYPE
             */
            abilityType: '',

            /**
             * Rank to upgrade ability to.
             * @type Number|Boolean
             * @default
             */
            abilityRank: 0,

            /**
             * Initializes entity types.
             * <br>- converts {@link ig.EntityAbilityUpgrade#abilityType} to an actual type via {@link ig.utils.addType}
             * @override
             **/
            initTypes: function () {

                this.parent();

                // check type and convert to type value if is a valid string

                if (typeof this.abilityType === 'string' && this.abilityType) {

                    var abilityType = this.abilityType;

                    this.abilityType = 0;

                    _ut.addType(ig.Ability, this, 'abilityType', abilityType);

                }

            },

            /**
             * Checks if triggering entity has ability by {@link ig.EntityAbilityUpgrade#abilityName} or {@link ig.EntityAbilityUpgrade#abilityType} and upgrades it.
             * @override
             **/
            activate: function (entity) {

                this.parent(entity);

                if (entity && entity.abilities) {

                    var abs;
                    var ab;

                    // by name

                    if (this.abilityName) {

                        ab = entity.abilities.getDescendantByName(_ut.getType(ig.Ability, this.abilityName));

                        if (ab) {

                            ab.changegrade(this.abilityRank);

                        }

                    }
                    else if (this.abilityType) {

                        abs = entity.abilities.getDescendantsByType(this.abilityType);

                        if (abs.length) {

                            for (var i = 0, il = abs.length; i < il; i++) {

                                abs[ i ].changegrade(this.abilityRank);

                            }

                        }

                    }

                }

            }

        });

    });