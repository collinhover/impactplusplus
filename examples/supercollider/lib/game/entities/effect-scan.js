/**
 * Entity effect to show scanning.
 * @extends ig.Effect
 * @class ig.EntityEffectScan
 * @author Collin Hover - collinhover.com
 */
ig.module(
        'game.entities.effect-scan'
    )
    .requires(
        'plusplus.core.config',
        'plusplus.abstractities.effect',
        'plusplus.helpers.utilsvector2'
    )
    .defines(function () {

        var _c = ig.CONFIG;
        var _utv2 = ig.utilsvector2;

        ig.global.EntityEffectScan = ig.EntityEffectScan = ig.Effect.extend({

            // size and sprites

            size: _utv2.vector(32, 32),
            animSheet: new ig.AnimationSheet(_c.PATH_TO_MEDIA + 'effect_scan.png', 32, 32),

            animSettings: {
                idle: {
                    sequence: [0,1,2,3,4,5],
                    frameTime: 0.1
                }
            }

        });

    });