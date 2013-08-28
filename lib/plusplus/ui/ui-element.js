ig.module(
        'plusplus.ui.ui-element'
    )
    .requires(
        'plusplus.core.config',
        'plusplus.core.entity',
        'plusplus.helpers.signals',
        'plusplus.helpers.utils',
        'plusplus.helpers.utilsvector2'
    )
    .defines(function () {

        var _c = ig.CONFIG;
        var _ut = ig.utils;
        var _utv2 = ig.utilsvector2;

        /**
         * User interface base element.
		 * <span class="alert alert-info"><strong>Tip:</strong> Impact++ UIElements are meant to be used for simple user interfaces. If you need something complex, it is recommended that you use the DOM!</span>
         * @class
         * @extends ig.EntityExtended
         * @memberof ig
         * @author Collin Hover - collinhover.com
         */
        ig.UIElement = ig.global.UIElement = ig.EntityExtended.extend(/**@lends ig.UIElement.prototype */{

            /**
             * @override
             * @default
             */
            layerName: 'ui',

            /**
             * UI elements generally do not need to be updated.
             * @override
             * @default
             */
            frozen: true,

            /**
             * UI elements are usually always visible.
             * <br>- this plays well when UI element is also {@link ig.UIElement#fixed}
             * @override
             * @default
             */
            visible: true,

            /**
             * UI elements are usually fixed in the screen.
             * @override
             * @default
             */
            fixed: true,

            /**
             * UI elements don't need to flip like entities.
             * @override
             */
            canFlipX: _c.UI.CAN_FLIP_X,

            /**
             * UI elements don't need to flip like entities.
             * @override
             */
            canFlipY: _c.UI.CAN_FLIP_Y,

            /**
             * Whether to get position as a percentage of screen size.
             * @type Boolean
             * @default
             */
            posAsPct: _c.UI.POS_AS_PCT,

            /**
             * Percentage of screen size to be converted to position in values from 0 to 1.
             * <span class="alert"><strong>IMPORTANT:</strong> this overrides pos property when {@link ig.UIElement#posAsPct} is true.</span>
             * @type Vector2
             * @default 0%
             */
            posPct: _utv2.vector(),

            /**
             * Alignment relative to screen size in values from 0 to 1.
             * @type Vector2
             * @default 0% (top left)
             */
            align: _utv2.vector(),

            /**
             * Pseudo margins that won't actually keep other elements away.
             * <br>- this is used to offset the element based on the pivot
             * @type Vector2
             * @default 0%
             */
            margin: _utv2.vector(),

            /**
             * Whether to treat margin as a percentage of screen size.
             * @type Boolean
             * @default
             */
            marginAsPct: true,

            /**
             * Whether to get margin percentages from smallest dimension in screen size.
             * @type Boolean
             * @default
             */
            marginAsPctSmallest: true,

            /**
             * Total horizontal margin, calculated during resize.
             * @type Number
             * @default
             * @readonly
             */
            totalMarginX: 0,

            /**
             * Total vertical margin, calculated during resize.
             * @type Number
             * @default
             * @readonly
             */
            totalMarginY: 0,

            /**
             * Scale that overrides system scale when {@link ig.UIElement#ignoreSystemScale} is true.
             * @type Number
             * @default ig.CONFIG.UI.SCALE
             */
            scale: _c.UI.SCALE,

            /**
             * Whether user interface elements should ignore system scale.
             * <span class="alert"><strong>IMPORTANT:</strong> when true, ui elements will not scale dynamically with view and instead will be fixed in size. This is usually ideal.</span>
             * @type Boolean
             * @default ig.CONFIG.UI.IGNORE_SYSTEM_SCALE
             */
            ignoreSystemScale: _c.UI.IGNORE_SYSTEM_SCALE,

            /**
             * Alignment in percent used to offset the element based on {@link ig.UIElement#linkedTo}'s size.
             * @type Vector2
             * @default 0%
             */
            linkAlign: _utv2.vector(),

            /**
             * Signal dispatched when UI element activated.
             * <br>- created on init.
             * @type ig.Signal
             */
            onActivated: null,

            /**
             * Signal dispatched when UI element deactivated.
             * <br>- created on init.
             * @type ig.Signal
             */
            onDeactivated: null,

            /**
             * @override
             **/
            initTypes: function () {

                this.parent();

                _ut.addType(ig.EntityExtended, this, 'type', "UI");

            },

            /**
             * @override
             **/
            initProperties: function () {

                this.parent();

                this.onActivated = new ig.Signal();
                this.onDeactivated = new ig.Signal();

            },

            /**
             * @override
             **/
            changePerformanceDynamic: function () {

                // change to entities layer if dynamic (i.e. uses physics) and on ui layer

                if (this.layerName === 'ui') {

                    ig.game.removeItem(this, { layerName: this.layerName } );

                    this.layerName = 'entities';

                    ig.game.addItem(this);

                }

            },

            /**
             * Does some activated behavior and dispatches {@link ig.UIElement#onActivated}.
             * @override
             **/
            activate: function () {

                this.parent();

                this.onActivated.dispatch(this);

            },

            /**
             * Does some activated behavior and dispatches {@link ig.UIElement#onDeactivated}.
             * @override
             **/
            deactivate: function () {

                this.parent();

                this.onDeactivated.dispatch(this);

            },

            /**
             * @override
             **/
            cleanup: function () {

                if ( !ig.game.hasLevel ) {

                    this.onActivated.removeAll();
                    this.onActivated.forget();
                    this.onDeactivated.removeAll();
                    this.onDeactivated.forget();

                }

                this.parent();

            },

            /**
             * Refreshes position.
             * @param {Boolean} [force] whether to force.
             */
            reposition: function ( force ) {

                // reposition only if not moving self

                if (!this.getIsMovingSelf()) {

                    // position relative to linked

                    if (this.linkedTo) {

                        var scaleMod = this.scale / this.linkedTo.scale;
                        var diffX = ( this.linkedTo.sizeDraw.x - this.sizeDraw.x * scaleMod ) * 0.5;
                        var diffY = ( this.linkedTo.sizeDraw.y - this.sizeDraw.y * scaleMod ) * 0.5;

                        this.pos.x = this.linkedTo.posDraw.x + diffX;
                        this.pos.y = this.linkedTo.posDraw.y + diffY;

                        var offsetX = this.linkedTo.sizeDraw.x * 0.5 + this.sizeDraw.x * 0.5;
                        var offsetY = this.linkedTo.sizeDraw.y * 0.5 + this.sizeDraw.y * 0.5;

                        this.pos.x += this.linkAlign.x * offsetX;
                        this.pos.y += this.linkAlign.y * offsetY;

                    }
                    // convert pct to position
                    else if (this.posAsPct) {

                        this.pos.x = this.posPct.x * ig.system.width;
                        this.pos.y = this.posPct.y * ig.system.height;

                    }
                    // revert to reset state
                    else {

                        this.pos.x = this.resetState.pos.x;
                        this.pos.y = this.resetState.pos.y;

                    }

                    // margins

                    this.totalMarginX = this.marginAsPct ? Math.round(this.margin.x * ( this.marginAsPctSmallest ? ig.system.size : ig.system.width )) : this.margin.x;
                    this.totalMarginY = this.marginAsPct ? Math.round(this.margin.y * ( this.marginAsPctSmallest ? ig.system.size : ig.system.height )) : this.margin.y;

                    if ( this.linkedTo ) {

                        this.pos.x += this.linkAlign.x * this.totalMarginX;
                        this.pos.y += this.linkAlign.y * this.totalMarginY;

                    }
                    else {

                        this.pos.x -= this.align.x * this.sizeDraw.x * this.scaleMod;
                        this.pos.y -= this.align.y * this.sizeDraw.y * this.scaleMod;

                        this.pos.x += ( 1 - this.align.x ) * this.totalMarginX - this.align.x * this.totalMarginX;
                        this.pos.y += ( 1 - this.align.y ) * this.totalMarginY - this.align.y * this.totalMarginY;

                    }

                }

                return this.parent( force );

            },

            /**
             * UI element bounds and bounds draw should always be the same due to the addition of margins, align, and other misc items.
             * @override
             **/
            getBounds: function () {

                return this.bounds = this.getBoundsDraw();

            },

            /**
             * Moves UI element to entity or position.
             * @override
             */
            moveTo: function (item, settings) {

                this.align.x = this.align.y = this.margin.x = this.margin.y = 0;

                this.unlink( false );

                return this.parent( item, settings );

            }

        });

        // definitions of extra types, to be used in dynamic checks (so we don't need to get type every time)

        _ut.getType(ig.EntityExtended, "UI");

        /**
         * UI type flag.
         * @memberof ig.EntityExtended.TYPE
         * @type Bitflag
         **/
        ig.EntityExtended.TYPE.UI;

    });