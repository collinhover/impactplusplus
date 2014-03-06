/**
 * Simple torch that gives off a glow.
 */
ig.module(
    'game.entities.torch'
)
    .requires(
        // note that anything in abstractities
        // is an abstract entity that needs to be extended
        'plusplus.abstractities.character',
        // require the glow ability
        // lets see some lights!
        'plusplus.abilities.glow',
        // if you want to use the config
        // don't forget to require it
        'plusplus.core.config',
        // and some utils
        'plusplus.helpers.utils'
)
    .defines(function() {
        "use strict";

        var _c = ig.CONFIG;
        var _ut = ig.utils;

        ig.EntityTorch = ig.global.EntityTorch = ig.Character.extend({

            size: {
                x: 8,
                y: 8
            },

            // torches don't need to collide

            collides: ig.EntityExtended.COLLIDES.NEVER,

            // torches don't move or update

            performance: ig.EntityExtended.PERFORMANCE.STATIC,

            // animations the Impact++ way
            // note that these animations are for
            // both side scrolling and top down mode
            // you will likely only need one or the other
            // so your animSettings will be much simpler

            animSheet: new ig.AnimationSheet('media/torch.png', 8, 8),

            animInit: "idleX",

            animSettings: {
                idleX: {
                    frameTime: 1,
                    sequence: _c.TOP_DOWN ? [3] : [0]
                },
                onX: {
                    frameTime: 0.1,
                    sequence: _c.TOP_DOWN ? [4, 5] : [1, 2]
                }
            },

            // never needs to flip on y

            canFlipX: true,
            canFlipY: false,

            // torches never die

            invulnerable: true,

            // settings for glow

            glowSettings: {
                sizeMod: 12,
                // these directly correlate
                // to ig.Entity light properties
                light: {
                    r: 1,
                    g: 0.85,
                    b: 0.7,
                    // cast shadows only on static entities
                    castsShadows: true
                }
            },

            // use this method to add properties
            // that need to be initialized one time
            // before the entity is added to the game

            initProperties: function() {

                this.parent();

                this.abilities.addDescendant(new ig.TorchGlow(this));

            }

        });

        /**
         * Ability for glowing like a torch. This should probably have its own module!
         **/
        ig.TorchGlow = ig.AbilityGlow.extend({

            activateComplete: function() {

                this.entity.animOverride(this.entity.getDirectionalAnimName("on"), {
                    loop: true
                });

                this.parent();

            },

            deactivateComplete: function() {

                this.entity.animRelease(this.entity.getDirectionalAnimName("on"));

                this.parent();

            }

        });

    });
