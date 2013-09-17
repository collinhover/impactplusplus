/**
 * Bubbles!
 * @extends ig.EntityExtended
 * @class ig.EntityBubbles
 * @author Collin Hover - collinhover.com
 */
ig.module(
        'game.entities.bubbles'
    )
    .requires(
        'plusplus.core.config',
        'plusplus.core.entity'
    )
    .defines(function () {

        var _c = ig.CONFIG;

        ig.global.EntityBubbles = ig.EntityBubbles = ig.EntityExtended.extend({

            // size and sprite

            size: { x: 12, y: 12 },
            animSheet: new ig.AnimationSheet(_c.PATH_TO_MEDIA + 'bubbles.png', 12, 12),
			
            animSettings: {
                idle: {
                    sequence: [0,1,2,3,4],
                    frameTime: 0.2
                }
            }

        });

    });