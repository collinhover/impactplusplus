ig.module(
        'plusplus.ui.ui-text-box'
    )
    .requires(
        'plusplus.ui.ui-text-bubble'
    )
    .defines(function () {
        "use strict";

        /**
         * UI text bubble to be used for displaying text in a box, like a comic book narrative.
         * @class
         * @extends ig.UITextBubble
         * @memberof ig
         * @author Collin Hover - collinhover.com
         */
        ig.UITextBox = ig.global.UITextBox = ig.UITextBubble.extend(/**@lends ig.UITextBox.prototype */{

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