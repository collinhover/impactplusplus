ig.module(
    'game.entities.leech-crab-hungry'
)
    .requires(
        'game.entities.leech-crab-wander',
        'plusplus.helpers.utils',
        'game.abilities.eat'
)
    .defines(function() {
        "use strict";

        var _ut = ig.utils;

        /**
         * Leech crab that is hungry and eats plants, and when no plants are around will wander.
         * @class
         * @extends ig.EntityLeechCrabWander
         * @memberof ig
         * @author Collin Hover - collinhover.com
         */
        ig.EntityLeechCrabHungry = ig.global.EntityLeechCrabHungry = ig.EntityLeechCrabWander.extend( /**@lends ig.EntityLeechCrabHungry.prototype */ {

            // we like plants and we cannot lie

            preyType: _ut.getType(ig.EntityExtended, "PLANT"),

            // same pathfinding settings as wander

            moveToPreySettings: {
                simple: true,
                avoidUngrounded: true
            },

            /**
             * @override
             **/
            initTypes: function() {

                this.parent();

                _ut.addType(ig.EntityExtended, this, 'preyType', "PLANT");

            },

            /**
             * @override
             **/
            initProperties: function() {

                this.parent();

                this.abilityEat = new ig.AbilityEat(this, {
                    // target will be provided by attack method
                    canFindTarget: false,
                    // we're a herbivore, so eat only plants
                    // eat ability also sets typeTargetable to EDIBLE
                    // so this way, we only target EDIBLE PLANT types
                    typeTargetable: "PLANT"
                });

            },

            /**
             * @override
             */
            attack: function(entity) {

                var closeEnough;

                if (this.grounded) {

                    this.abilityEat.setEntityTarget(entity);

                    if (this.abilityEat.entityTarget) {

                        this.abilityEat.activate();

                        return this.abilityEat.getActivelyUsing();

                    }

                }

                return this.parent(entity);

            }

        });

    });
