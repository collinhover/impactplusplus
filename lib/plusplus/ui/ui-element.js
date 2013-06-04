ig.module(
        'plusplus.ui.ui-element'
    )
    .requires(
        'plusplus.core.entity',
        'plusplus.helpers.signals',
        'plusplus.helpers.utils',
        'plusplus.helpers.utilsvector2'
    )
    .defines(function () {

        var _ut = ig.utils;
        var _utv2 = ig.utilsvector2;

        /**
         * User interface base element.
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
             * Whether UI element should act as if it is vertical instead of horizontal
             * @type Boolean
             * @default
             */
            vertical: false,

            /**
             * Whether to treat position as a percentage of screen size.
             * @type Boolean
             * @default
             */
            posAsPct: true,

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
             * Another UI element to link to.
             * <span class="alert alert-info"><strong>Tip:</strong> this allows for UI element chaining and pseudo parent/child transforms.</span>
             * <br>- a linked element will always resize and reposition after the element it is linked to
             * @type ig.UIElement
             * @default
             */
            linkedTo: null,

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
             * Signal dispatched when UI element is resized.
             * <br>- created on init.
             * @type ig.Signal
             */
            onResized: null,

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
                this.onResized = new ig.Signal();

            },

            /**
             * Called after UI element is added to game world.
             * <br>- calls first resize via {@link ig.UIElement#resize} or {@link ig.UIElement#link} if linked to another element.
             * @override
             **/
            ready: function () {

                this.parent();

                ig.game.onResized.add(this.resize, this);

                if (this.linkedTo) {

                    this.link(this.linkedTo);

                }
                else {

                    this.resize(true);

                }

            },

            /**
             * @override
             **/
            changePerformanceKinematic: function () {

                // change to entities layer if kinematic (i.e. uses physics) and on ui layer

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
             * Links ui element to another entity, making original resize after the element it is linked to.
             * <span class="alert alert-info"><strong>Tip:</strong> this allows for UI element chaining and pseudo parent/child transforms.</span>
             * <br>- a linked element will always resize and reposition after the element it is linked to
             * @param {ig.EntityExtended} entity to link to.
             **/
            link: function (entity) {

                if (entity !== this) {

                    // remove previous

                    this.unlink(false);

                    // setup new

                    this.linkedTo = entity;

                    if (this.linkedTo instanceof ig.UIElement) {

                        // swap listen to game resize with listen to linked resize

                        ig.game.onResized.remove(this.resize, this);
                        this.linkedTo.onResized.add(this.resize, this);
                        this.linkedTo.onRemoved.add(this.unlink, this);

                    }
                    else {

                        ig.game.onResized.add(this.resize, this);

                    }

                    // resize self

                    this.resize(true);

                }

            },

            /**
             * Unlinks ui element from linked element.
             * @param {Boolean} [resize=true] whether to resize after unlinking.
             **/
            unlink: function (resize) {

                if (this.linkedTo instanceof ig.UIElement) {

                    this.linkedTo.onResized.remove(this.resize, this);
                    this.linkedTo.onRemoved.remove(this.unlink, this);
                    ig.game.onResized.add(this.resize, this);

                }

                // resize self

                if (resize !== false) {

                    this.resize(true);

                }

            },

            /**
             * @override
             **/
            cleanup: function () {

                this.unlink(false);

                ig.game.onResized.remove(this.resize, this);

                if ( !ig.game.hasLevel ) {

                    this.onActivated.removeAll();
                    this.onActivated.forget();
                    this.onDeactivated.removeAll();
                    this.onDeactivated.forget();
                    this.onResized.removeAll();
                    this.onResized.forget();

                }

                this.parent();

            },

            /**
             * Repositions element when screen or linked to is resized.
             * @param {Boolean} [force] whether to force resize.
             **/
            resize: function (force) {

                // reposition only if not moving self

                if (!this.getIsMovingSelf()) {

                    this.recordLast();

                    // position relative to linked

                    if (this.linkedTo) {

                        this.pos.x = this.linkedTo.boundsDraw.minX;
                        this.pos.y = this.linkedTo.boundsDraw.minY;

                        if (this.vertical) {

                            this.pos.x += ( 1 - this.align.x ) * this.linkedTo.totalSizeX;

                        }
                        else {

                            this.pos.y += ( 1 - this.align.y ) * this.linkedTo.totalSizeY;

                        }

                    }
                    // convert pct to position
                    else if (this.posAsPct) {

                        this.pos.x = Math.round(this.posPct.x * ig.system.width);
                        this.pos.y = Math.round(this.posPct.y * ig.system.height);

                    }

                    // check if changed

                    this.recordChanges(force);

                }

                // redo textures if texturized

                if (this.textured) {

                    for (var animName in this.anims) {

                        this.anims[ animName ].texturize(this);

                    }

                }

                this.onResized.dispatch(this);

            },

            /**
             * UI element bounds and bounds draw should always be the same due to the addition of margins, align, and other misc items.
             * @override
             **/
            getBounds: function () {

                return this.getBoundsDraw();

            },

            /**
             * Gets total position accounting for margin and alignment.
             * @override
             **/
            getTotalPosX: function () {

                var pos = this.parent();

                // add aligned size

                pos += -this.align.x * this.totalSizeX;

                // add aligned margin

                var margin = this.marginAsPct ? Math.round(this.margin.x * ( this.marginAsPctSmallest ? ig.system.size : ig.system.width )) : this.margin.x;

                if (!this.linkedTo || this.vertical) {

                    pos += ( 1 - this.align.x ) * margin - this.align.x * margin;

                }

                return pos;

            },

            /**
             * Gets total position accounting for margin and alignment.
             * @override
             **/
            getTotalPosY: function () {

                var pos = this.parent();

                // add aligned size

                pos += -this.align.y * this.totalSizeY;

                // add aligned margin

                var margin = this.marginAsPct ? Math.round(this.margin.y * ( this.marginAsPctSmallest ? ig.system.size : ig.system.height )) : this.margin.y;

                if (!this.linkedTo || !this.vertical) {

                    pos += ( 1 - this.align.y ) * margin - this.align.y * margin;

                }

                return pos;

            },

            /**
             * Moves UI element to entity.
             * @override
             */
            moveToEntity: function (entity, settings) {

                this.align.x = this.align.y = this.margin.x = this.margin.y = 0;

                this.unlink();

                this.parent( entity, settings );

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