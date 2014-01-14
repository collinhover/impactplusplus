ig.module(
    'plusplus.ui.ui-element'
)
    .requires(
        'plusplus.core.config',
        'plusplus.core.entity',
        'plusplus.helpers.signals',
        'plusplus.helpers.utils'
)
    .defines(function() {
        "use strict";

        var _c = ig.CONFIG;
        var _ut = ig.utils;

        /**
         * User interface base element.
         * <span class="alert alert-info"><strong>Tip:</strong> Impact++ UIElements are meant to be used for simple user interfaces. If you need something complex, it is recommended that you use the DOM!</span>
         * @class
         * @extends ig.EntityExtended
         * @memberof ig
         * @author Collin Hover - collinhover.com
         */
        ig.UIElement = ig.global.UIElement = ig.EntityExtended.extend( /**@lends ig.UIElement.prototype */ {

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
            posPct: {
                x: 0,
                y: 0
            },

            /**
             * Alignment relative to screen size in values from 0 to 1.
             * @type Vector2
             * @default 0% (top left)
             */
            align: {
                x: 0,
                y: 0
            },

            /**
             * Pseudo margins that won't actually keep other elements away.
             * <br>- this is used to offset the element based on the pivot
             * @type Vector2
             * @default 0%
             */
            margin: {
                x: 0,
                y: 0
            },

            /**
             * Whether to treat margin as a percentage of screen size.
             * @type Boolean
             * @default
             */
            marginAsPct: true,

            /**
             * Whether to get margin percentages from smallest dimension in screen size.
             * @type Boolean
             * @default ig.CONFIG.UI.MARGIN_AS_PCT_SMALLEST
             */
            marginAsPctSmallest: _c.UI.MARGIN_AS_PCT_SMALLEST,

            /**
             * Whether margins should be calculated consistently at all scales. Ex: a button should be 15px away from the edge no matter the scale.
             * @type Boolean
             * @default ig.CONFIG.UI.MARGIN_SCALELESS
             */
            marginScaleless: _c.UI.MARGIN_SCALELESS,

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
             * Scale of system scale.
             * @type Number
             * @default
             */
            scaleOfSystemScale: _c.UI.SCALE_OF_SYSTEM_SCALE,

            /**
             * Minimum value of {@link ig.UIElement#scale}.
             * @type Number
             * @default ig.CONFIG.UI.SCALE_MIN
             */
            scaleMin: _c.UI.SCALE_MIN,

            /**
             * Maximum value of {@link ig.UIElement#scale}.
             * @type Number
             * @default ig.CONFIG.UI.SCALE_MAX
             */
            scaleMax: _c.UI.SCALE_MAX,

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
            linkAlign: {
                x: 0,
                y: 0
            },

            /**
             * Flips {@link ig.UIElement#linkAlign} so that coordinates are relative to inside of linkedTo element
             * @type Boolean
             * @default
             */
            linkAlignInside: false,

            /**
             * Automatically deactivates ui element during cleanup.
             * @type Boolean
             * @default
             */
            autoDeactivate: true,

            /**
             * @override
             **/
            initTypes: function() {

                this.parent();

                _ut.addType(ig.EntityExtended, this, 'type', "UI");

            },

            /**
             * @override
             **/
            changePerformanceDynamic: function() {

                // change to entities layer if dynamic (i.e. uses physics) and on ui layer

                if (this.layerName === 'ui') {

                    ig.game.removeItem(this, {
                        layerName: this.layerName
                    });

                    this.layerName = 'entities';

                    ig.game.addItem(this);

                }

            },

            /**
             * @override
             **/
            cleanup: function() {

                if (this.autoDeactivate) {

                    this.deactivate();

                }

                this.parent();

            },

            /**
             * Refreshes position.
             * @param {Boolean} [force] whether to force.
             */
            reposition: function(force) {

                var linkDir = this.linkAlignInside ? -1 : 1;

                // reposition only if not moving self

                if (!this.getIsMovingSelf()) {

                    // position relative to linked

                    if (this.linkedTo) {

                        var scaleSystemMod = this.scale / ig.system.scale;
                        var sizeDrawX = this.sizeDraw.x * scaleSystemMod;
                        var sizeDrawY = this.sizeDraw.y * scaleSystemMod;

                        var linkedScaleSystemMod = this.linkedTo.scale / ig.system.scale;
                        var linkedSizeDrawX = this.linkedTo.sizeDraw.x * linkedScaleSystemMod;
                        var linkedSizeDrawY = this.linkedTo.sizeDraw.y * linkedScaleSystemMod;

                        var diffX = (linkedSizeDrawX - sizeDrawX) * 0.5;
                        var diffY = (linkedSizeDrawY - sizeDrawY) * 0.5;

                        this.pos.x = this.linkedTo.posDraw.x + diffX;
                        this.pos.y = this.linkedTo.posDraw.y + diffY;

                        var offsetX = (linkedSizeDrawX + sizeDrawX * linkDir) * 0.5;
                        var offsetY = (linkedSizeDrawY + sizeDrawY * linkDir) * 0.5;

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

                    this.totalMarginX = Math.round(this.marginAsPct ? this.margin.x * (this.marginAsPctSmallest ? ig.system.size : ig.system.width) : this.margin.x);
                    this.totalMarginY = Math.round(this.marginAsPct ? this.margin.y * (this.marginAsPctSmallest ? ig.system.size : ig.system.height) : this.margin.y);

                    // divide margins by scale to ensure the margins are consistent across all scales

                    if (this.marginScaleless) {

                        this.totalMarginX /= this.scale;
                        this.totalMarginY /= this.scale;

                    }

                    if (this.linkedTo) {

                        this.pos.x += this.linkAlign.x * this.totalMarginX * linkDir;
                        this.pos.y += this.linkAlign.y * this.totalMarginY * linkDir;

                    } else {

                        this.pos.x = this.pos.x - this.align.x * this.sizeDraw.x * this.scaleMod + ((1 - this.align.x) * this.totalMarginX - this.align.x * this.totalMarginX);
                        this.pos.y = this.pos.y - this.align.y * this.sizeDraw.y * this.scaleMod + ((1 - this.align.y) * this.totalMarginY - this.align.y * this.totalMarginY);

                    }

                }

                return this.parent(force);

            },

            /**
             * Moves UI element to entity or position.
             * @override
             */
            moveTo: function(item, settings) {

                this.align.x = this.align.y = this.margin.x = this.margin.y = 0;

                this.unlink(false);

                return this.parent(item, settings);

            },

            /**
             * @override
             */
            link: function(entity, refresh) {

                if (!this.movingTo) {

                    this.parent(entity, refresh);

                } else {

                    this.unlink(false);

                }

            },

            /**
             * @override
             **/
            unlink: function(refresh) {

                // copy linked position as own position

                if (this.linkedTo && !this._killed && refresh !== false) {

                    var x = this.pos.x;
                    var y = this.pos.y;

                    x += this.align.x * this.sizeDraw.x * this.scaleMod - ((1 - this.align.x) * this.totalMarginX - this.align.x * this.totalMarginX);
                    y += this.align.y * this.sizeDraw.y * this.scaleMod - ((1 - this.align.y) * this.totalMarginY - this.align.y * this.totalMarginY);

                    if (this.posAsPct) {

                        this.posPct.x = x / ig.system.width;
                        this.posPct.y = y / ig.system.height;

                    } else {

                        this.resetState.pos.x = x;
                        this.resetState.pos.y = y;

                    }

                }

                this.parent(refresh);

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
