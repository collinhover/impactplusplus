ig.module(
    'plusplus.ui.ui-text-box'
)
    .requires(
        'plusplus.ui.ui-text-bubble'
)
    .defines(function() {
        "use strict";

        /**
         * UI text bubble to be used for displaying text in a box, like a comic book narrative.
         * <span class="alert alert-info"><strong>IMPORTANT:</strong>UI text box is an {@link ig.UIOverlay}, which means it creates an {@link ig.UIText} and uses {@link ig.UIOverlay#textSettings} to control the settings!</span>
         * @class
         * @extends ig.UITextBubble
         * @memberof ig
         * @author Collin Hover - collinhover.com
         * @example
         * // see the UI overlay for a basic example of using overlays with text
         */
        ig.UITextBox = ig.global.UITextBox = ig.UITextBubble.extend( /**@lends ig.UITextBox.prototype */ {

            /**
             * @override
             * @default
             */
            cornerRadius: 0,

            /**
             * @override
             * @default
             */
            triangleLength: 0

        });

    });
