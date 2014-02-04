/**
 * Entity plant that randomly creates floating bubbles of light.
 * @extends ig.Character
 * @class ig.EntityTorch
 * @author Collin Hover - collinhover.com
 **/
ig.module(
    'game.entities.bubble-plant'
)
    .requires(
        'plusplus.core.config',
        'plusplus.core.timer',
        'plusplus.abstractities.character',
        'game.entities.bubbles',
        'plusplus.abilities.glow',
        'game.abilities.glow-bubble',
        'plusplus.helpers.utils'
)
    .defines(function() {
        "use strict";

        var _c = ig.CONFIG;
        var _ut = ig.utils;

        ig.global.EntityBubblePlant = ig.EntityBubblePlant = ig.Character.extend({

            performance: ig.EntityExtended.PERFORMANCE.STATIC,

            // size and sprite

            size: {
                x: 16,
                y: 16
            },
            offset: {
                x: 4,
                y: 4
            },

            animSheet: new ig.AnimationSheet(_c.PATH_TO_MEDIA + 'bubble_plant.png', 24, 24),

            animInit: "idleX",

            animSettings: {
                idleX: {
                    sequence: [0, 1, 2, 3, 4, 5],
                    frameTime: 0.1
                },
                throwPassX: {
                    sequence: [6, 7, 8, 9, 10, 11],
                    frameTime: 0.1
                },
                throwActivateX: {
                    sequence: [11, 10, 9, 8, 7, 6],
                    frameTime: 0.1
                }
            },

            // mimic level
            // if the character trying to mimic this
            // is not high enough level, the mimic will fail

            mimicLevel: _c.RANKS_MAP.EASY,

            // mimic effect

            mimicEffect: {
                entityClass: ig.EntityBubbles,
                followSettings: {
                    matchPerformance: true
                }
            },

            // light range to keep glow within

            rMax: 0.25,
            rMin: 0.25,
            gMax: 0.5,
            gMin: 0,
            bMax: 1,
            bMin: 0.75,

            // minimum brightness

            brightnessMin: 0.7,

            // delay between ability use

            abilityDelay: 1,

            // randomize ability delay

            randomDelay: 10,

            // invulnerable to use abilities infinitely

            invulnerable: true,

            // glow settings

            glowSettings: {
                sizeMod: 3,
                alpha: 0.1
            },

            // glow bubble settings

            glowBubbleSettings: {},

            /**
             * @override
             **/
            initTypes: function() {

                this.parent();

                _ut.addType(ig.EntityExtended, this, 'type', "MIMICABLE");

            },

            /**
             * @override
             **/
            initProperties: function() {

                this.parent();

                this.abilityTimer = new ig.Timer();

                // abilities

                this.glow = new ig.AbilityGlow(this);
                this.glowBubble = new ig.AbilityGlowBubble(this);

                this.abilities.addDescendants([
                    this.glow,
                    this.glowBubble
                ]);

            },

            /**
             * @override
             **/
            resetExtras: function() {

                // light color

                var gsl = this.glowSettings.light = this.glowSettings.light || {};
                var gbsl = this.glowBubbleSettings.light = this.glowBubbleSettings.light || {};

                gsl.r = this.rMin + Math.random() * (this.rMax - this.rMin);
                gsl.g = this.gMin + Math.random() * (this.gMax - this.gMin);
                gsl.b = this.bMin + Math.random() * (this.bMax - this.bMin);

                // keep lights relatively bright

                if (gsl.r < this.rMax * this.brightnessMin) {

                    gsl.g = Math.min(this.gMax, gsl.g / gsl.r);
                    gsl.b = Math.min(this.bMax, gsl.b / gsl.r);

                }

                if (gsl.g < this.gMax * this.brightnessMin) {

                    gsl.r = Math.min(this.rMax, gsl.r / gsl.g);
                    gsl.b = Math.min(this.bMax, gsl.b / gsl.g);

                }

                if (this.b < this.bMax * this.brightnessMin) {

                    gsl.r = Math.min(this.rMax, gsl.r / gsl.b);
                    gsl.g = Math.min(this.gMax, gsl.g / gsl.b);

                }

                gbsl.r = gsl.r;
                gbsl.g = gsl.g;
                gbsl.b = gsl.b;

                this.parent();

            },

            /**
             * @override
             */
            pause: function() {

                this.parent();

                this.abilityTimer.pause();

            },

            /**
             * @override
             */
            unpause: function() {

                this.parent();

                this.abilityTimer.unpause();

            },

            /**
             * @override
             **/
            updateVisible: function() {

                if (this.abilityDelay && this.abilityTimer.delta() >= 0) {

                    this.abilityTimer.set(this.abilityDelay + Math.random() * this.randomDelay);

                    this.glowBubble.activate({
                        offsetY: -this.size.y * 0.5
                    });

                }

                this.parent();

            }

        });

    });
