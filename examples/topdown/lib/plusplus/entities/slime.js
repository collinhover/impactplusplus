ig.module(
        'plusplus.entities.slime'
    )
    .requires(
        'plusplus.core.config',
        'plusplus.entities.lava'
    )
    .defines(function () {

        var _c = ig.CONFIG;

        /**
         * Instagib entity that looks like slime.
         * <span class="alert"><strong>IMPORTANT:</strong> this entity has a defined size and animation sheet!</span>
         * @class
         * @extends ig.EntityLava
         * @memberof ig
         * @author Collin Hover - collinhover.com
         **/
        ig.EntitySlime = ig.global.EntitySlime = ig.EntityLava.extend(/**@lends ig.EntitySlime.prototype */{

            /**
             * @override
             * @default texture_slime.png
             */
            animSheet: new ig.AnimationSheet(_c.PATH_TO_MEDIA + 'texture_slime.png', 16, 16)

        });

    });