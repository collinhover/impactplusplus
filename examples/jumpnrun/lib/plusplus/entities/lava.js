ig.module(
        'plusplus.entities.lava'
    )
    .requires(
        'plusplus.core.config',
        'plusplus.entities.pain-instagib'
    )
    .defines(function () {
        "use strict";

        var _c = ig.CONFIG;

        /**
         * Instagib entity that looks like lava or boiling liquid.
         * <span class="alert"><strong>IMPORTANT:</strong> this entity has a defined animation sheet, and is resizeable and textured!!</span>
         * @class
         * @extends ig.EntityPainInstagib
         * @memberof ig
         * @author Collin Hover - collinhover.com
         **/
        ig.EntityLava = ig.global.EntityLava = ig.EntityPainInstagib.extend(/**@lends ig.EntityLava.prototype */{

            // editor properties

            _wmDrawBox: false,

            /**
             * @override
             * @default
             */
            frozen: false,

            /**
             * @override
             * @default
             */
            textured: true,

            /**
             * @override
             * @default texture_lava.png
             */
            animSheet: new ig.AnimationSheet(_c.PATH_TO_MEDIA + 'texture_lava.png', 16, 16),

            /**
             * @override
             * @default
             */
            animSettings: true,

            /**
             * @override
             * @default
             */
            animFrameTime: 0.25,

            /**
             * @override
             * @default
             */
            animSequenceCount: 2,

            /**
             * @override
             * @default [ 'SOLID', 'SURFACE', 'TOPRIGHT', 'TOPRIGHTROUND', 'TOPLEFT', 'TOPLEFTROUND', 'BOTTOMRIGHT', 'BOTTOMRIGHTROUND', 'BOTTOMLEFT', 'BOTTOMLEFTROUND' ]
             */
            animationTypes: [
                'SOLID',
                'SURFACE',
                'TOPRIGHT',
                'TOPRIGHTROUND',
                'TOPLEFT',
                'TOPLEFTROUND',
                'BOTTOMRIGHT',
                'BOTTOMRIGHTROUND',
                'BOTTOMLEFT',
                'BOTTOMLEFTROUND'
            ]

        });

    });