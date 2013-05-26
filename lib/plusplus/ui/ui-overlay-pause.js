ig.module(
        'plusplus.ui.ui-overlay-pause'
    )
    .requires(
        'plusplus.ui.ui-overlay'
    )
    .defines(function () {

        /**
         * UI overlay to be used during game pause.
         * @class
         * @extends ig.UIOverlay
         * @memberof ig
         * @author Collin Hover - collinhover.com
         */
        ig.UIOverlayPause = ig.global.UIOverlayPause = ig.UIOverlay.extend(/**@lends ig.UIOverlayPause.prototype */{

            /**
             * Overlay should be on ui layer so it is not paused.
             * @override
             */
            layerName: 'ui',

            /**
             * Let player know game is paused.
             * @override
             */
            textSettings: {
                text: "PAUSED"
            }

        });

    });