ig.module(
    'game.entities.tutorial-jump'
)
    .requires(
        'plusplus.entities.tutorial-swipe',
        'plusplus.ui.ui-overlay'
)
    .defines(function() {

        /**
         * Tutorial for jumping.
         * @class
         * @extends ig.EntityTutorialSwipe
         * @memberof ig
         * @author Collin Hover - collinhover.com
         */
        ig.global.EntityTutorialJump = ig.EntityTutorialJump = ig.EntityTutorialSwipe.extend({

            // don't look for action

            actions: [],

            // looking for player jumping

            properties: ['jumping'],

            // overlay

            overlayEntity: ig.UIOverlay,

            // explain action to player in text also

            textSettings: {
                text: 'swipe up to jump!'
            }

        });

    });
