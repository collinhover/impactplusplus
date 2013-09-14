ig.module(
        'game.entities.tutorial-spam'
    )
    .requires(
        'plusplus.entities.tutorial-tap',
        'plusplus.ui.ui-overlay'
    )
    .defines(function () {

        /**
         * Tutorial for spammable abilities.
         * @class
         * @extends ig.EntityTutorialTap
         * @memberof ig
         * @author Collin Hover - collinhover.com
         */
        ig.global.EntityTutorialSpam = ig.EntityTutorialSpam = ig.EntityTutorialTap.extend({

            // overlay

            overlayEntity: ig.UIOverlay,

            // explain action to player in text also

            textSettings: {
                text: 'tap to do a quick action!'
            }

        });

    });

