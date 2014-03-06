ig.module(
    'plusplus.entities.destructable-damage'
)
    .requires(
        'plusplus.entities.destructable',
        'plusplus.helpers.utils'
)
    .defines(function() {
        "use strict";

        var _ut = ig.utils;

        /**
         * Entity that is destroyed when triggered or damaged.
         * <br>- this entity can be destroyed either through another trigger or by taking damage
         * <br>- <strong>this entity can be destroyed through collision</strong>
         * @class
         * @extends ig.EntityDestructable
         * @memberof ig
         * @author Collin Hover - collinhover.com
         **/
        ig.EntityDestructableDamage = ig.global.EntityDestructableDamage = ig.EntityDestructable.extend( /**@lends ig.EntityDestructableDamage.prototype */ {

            /**
             * Destructable should be able to be targeted.
             * @override
             * @default
             */
            targetable: true,

            /**
             * <br>- adds {@link ig.EntityExtended.TYPE.DAMAGEABLE} to {@link ig.EntityExtended#type}
             * @override
             */
            initTypes: function() {

                this.parent();

                _ut.addType(ig.EntityExtended, this, 'type', "DAMAGEABLE");

            }

        });

    });
