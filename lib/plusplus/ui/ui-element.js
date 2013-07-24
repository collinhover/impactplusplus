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
             * Another UI element to link to.
             * <span class="alert alert-info"><strong>Tip:</strong> this allows for UI element chaining and pseudo parent/child transforms.</span>
             * <br>- a linked element will always refresh after the element it is linked to
             * @type ig.UIElement
             * @default
             */
            linkedTo: null,

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
             * Signal dispatched when UI element is refreshed.
             * <br>- created on init.
             * @type ig.Signal
             */
            onRefreshed: null,

            /**
             * Whether build needs change.
             * @type Boolean
             * @default
             */
            dirtyBuild: true,

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
                this.onRefreshed = new ig.Signal();

            },

            /**
             * Called after UI element is added to game world.
             * <br>- calls first refresh via {@link ig.UIElement#refresh} or {@link ig.UIElement#link} if linked to another element.
             * @override
             **/
            ready: function () {

                this.parent();

                ig.game.onResized.add(this.refresh, this);

                if (this.linkedTo) {

                    this.link(this.linkedTo);

                }
                else {

                    this.refresh(true);

                }

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
             * Links ui element to another entity, making original refresh after the element it is linked to.
             * <span class="alert alert-info"><strong>Tip:</strong> this allows for UI element chaining and pseudo parent/child transforms.</span>
             * <br>- a linked element will always refresh after the element it is linked to
             * @param {ig.EntityExtended} entity to link to.
             **/
            link: function (entity) {

                if (entity !== this) {

                    // remove previous

                    this.unlink(false);

                    // setup new

                    this.linkedTo = entity;

                    if (this.linkedTo instanceof ig.UIElement) {

                        // swap listen to game refresh with listen to linked refresh

                        ig.game.onResized.remove(this.refresh, this);
                        this.linkedTo.onRefreshed.add(this.refresh, this);
                        this.linkedTo.onRemoved.add(this.unlink, this);

                    }
                    else {

                        ig.game.onResized.add(this.refresh, this);

                    }

                    // refresh self

                    this.refresh(true);

                }

            },

            /**
             * Unlinks ui element from linked element.
             * @param {Boolean} [refresh=true] whether to refresh after unlinking.
             **/
            unlink: function (refresh) {

                if (this.linkedTo instanceof ig.UIElement) {

                    this.linkedTo.onRefreshed.remove(this.refresh, this);
                    this.linkedTo.onRemoved.remove(this.unlink, this);
                    ig.game.onResized.add(this.refresh, this);

                }

                // refresh self

                if (refresh !== false) {

                    this.refresh(true);

                }

            },

            /**
             * @override
             **/
            cleanup: function () {

                this.unlink(false);

                ig.game.onResized.remove(this.refresh, this);

                if ( !ig.game.hasLevel ) {

                    this.onActivated.removeAll();
                    this.onActivated.forget();
                    this.onDeactivated.removeAll();
                    this.onDeactivated.forget();
                    this.onRefreshed.removeAll();
                    this.onRefreshed.forget();

                }

                this.parent();

            },

            /**
             * Pseudo refresh when changed to make sure linkedTo elements update appropriately.
             * <br>- only affects movable or dynamic UI elements
             * @override
             **/
            recordChanges: function ( force ) {

                this.parent( force );

                if ( this.changed ) {

                    if ( this.performance === _c.STATIC ) {

                        this.changed = false;

                    }

                    this.onRefreshed.dispatch(this);

                }

            },

            /**
             * Refreshes element size, position, etc when screen is resized or linked to is refreshed.
             * @param {Boolean} [force] whether to force.
             **/
            refresh: function (force) {

                force = this.reposition( force ) || force;
                force = this.resize( force ) || force;

                if ( this.dirtyBuild || force ) {

                    this.rebuild();

                }

                this.onRefreshed.dispatch(this);

                return force;

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

                        this.pos.x = this.linkedTo.boundsDraw.minX;
                        this.pos.y = this.linkedTo.boundsDraw.minY;

                        if ( this.linkAlign.x !== 0 ) {

                            if ( this.linkAlign.x < 0 ) {

                                this.pos.x += this.linkAlign.x * this.boundsDraw.width;

                            }
                            else {

                                this.pos.x += this.linkAlign.x * this.linkedTo.boundsDraw.width;

                            }

                        }

                        if ( this.linkAlign.y !== 0 ) {

                            if ( this.linkAlign.y < 0 ) {

                                this.pos.y += this.linkAlign.y * this.boundsDraw.height;

                            }
                            else {

                                this.pos.y += this.linkAlign.y * this.linkedTo.boundsDraw.height;

                            }

                        }

                    }
                    // convert pct to position
                    else if (this.posAsPct) {

                        this.pos.x = this.posPct.x * ig.system.width;
                        this.pos.y = this.posPct.y * ig.system.height;

                    }

                }

            },

            /**
             * Refreshes size.
             * @param {Boolean} [force] whether to force.
             */
            resize: function ( force ) {

                this.recordChanges(force);
                this.recordLast();

            },

            /**
             * Refreshes element components.
             * <br>- only called when primary refresh changes element
             */
            rebuild: function () {

                this.dirtyBuild = false;

                if (this.textured) {

                    for (var animName in this.anims) {

                        this.anims[ animName ].texturize(this);

                    }

                }

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

                this.totalMarginX = this.marginAsPct ? Math.round(this.margin.x * ( this.marginAsPctSmallest ? ig.system.size : ig.system.width )) : this.margin.x;

                pos -= this.align.x * this.totalSizeX;

                if ( this.linkedTo ) {

                    pos += this.linkAlign.x * this.totalMarginX;

                }
                else {

                    pos += ( 1 - this.align.x ) * this.totalMarginX - this.align.x * this.totalMarginX;

                }

                return pos;

            },

            /**
             * Gets total position accounting for margin and alignment.
             * @override
             **/
            getTotalPosY: function () {

                var pos = this.parent();

                this.totalMarginY = this.marginAsPct ? Math.round(this.margin.y * ( this.marginAsPctSmallest ? ig.system.size : ig.system.height )) : this.margin.y;

                pos -= this.align.y * this.totalSizeY;

                if ( this.linkedTo ) {

                    pos += this.linkAlign.y * this.totalMarginY;

                }
                else {

                    pos += ( 1 - this.align.y ) * this.totalMarginY - this.align.y * this.totalMarginY;

                }

                return pos;

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