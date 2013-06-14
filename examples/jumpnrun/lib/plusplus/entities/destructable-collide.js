ig.module(
        'plusplus.entities.destructable-collide'
    )
    .requires(
        'plusplus.entities.destructable'
    )
    .defines(function () {
        "use strict";

        /**
         * Entity that is destroyed when triggered or damaged or collided with.
         * <br>- this entity can be destroyed either through another trigger or by taking damage
         * <br>- <strong>this entity can be destroyed through collision</strong>
         * @class
         * @extends ig.EntityDestructable
         * @memberof ig
         * @author Collin Hover - collinhover.com
         **/
        ig.EntityDestructableCollide = ig.global.EntityDestructableCollide = ig.EntityDestructable.extend(/**@lends ig.EntityDestructableCollide.prototype */{

            /**
             * Destructable through collisions
             * @override
             * @default
             */
            triggerable: true

        });

    });