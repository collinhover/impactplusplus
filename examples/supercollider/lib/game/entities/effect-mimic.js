/**
 * Entity effect to show mimicking.
 * @extends ig.Effect
 * @class ig.EntityEffectMimic
 * @author Collin Hover - collinhover.com
 */
ig.module(
    'game.entities.effect-mimic'
)
    .requires(
        'plusplus.core.config',
        'plusplus.abstractities.effect',
        'plusplus.helpers.utilsvector2'
)
    .defines(function() {

        var _c = ig.CONFIG;
        var _utv2 = ig.utilsvector2;

        ig.global.EntityEffectMimic = ig.EntityEffectMimic = ig.Effect.extend({

            // size and sprites

            size: _utv2.vector(32, 32),
            animSheet: new ig.AnimationSheet(_c.PATH_TO_MEDIA + 'effect_mimic.png', 32, 32),

            animSettings: {
                idle: {
                    sequence: [0, 1, 2, 3],
                    frameTime: 0.1
                }
            }

        });

    });
