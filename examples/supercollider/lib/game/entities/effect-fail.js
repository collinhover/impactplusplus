/**
 * Entity effect to show failure on ability.
 * @extends ig.Effect
 * @class ig.EntityEffectFail
 * @author Collin Hover - collinhover.com
 */
ig.module(
    'game.entities.effect-fail'
)
    .requires(
        'plusplus.core.config',
        'plusplus.abstractities.effect',
        'plusplus.helpers.utilsvector2'
)
    .defines(function() {

        var _c = ig.CONFIG;
        var _utv2 = ig.utilsvector2;

        ig.global.EntityEffectFail = ig.EntityEffectFail = ig.Effect.extend({

            // size and sprites

            size: _utv2.vector(32, 32),
            animSheet: new ig.AnimationSheet(_c.PATH_TO_MEDIA + 'effect_fail.png', 32, 32),

            animSettings: {
                unknown: {
                    sequence: [0],
                    frameTime: 1
                },
                cost: {
                    sequence: [1],
                    frameTime: 1
                },
                distance: {
                    sequence: [2],
                    frameTime: 1
                },
                target: {
                    sequence: [3],
                    frameTime: 1
                },
                targetInvalid: {
                    sequence: [4],
                    frameTime: 1
                },
                cooldown: {
                    sequence: [5, 6, 7, 8],
                    frameTime: 0.1
                }
            }

        });

    });
