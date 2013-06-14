ig.module(
        'plusplus.core.input'
    )
    .requires(
        'impact.input',
        'plusplus.core.config',
        'plusplus.helpers.utils',
        'plusplus.helpers.utilsintersection'
    )
    .defines(function () {

        var _c = ig.CONFIG;
        var _g = _c.GESTURE;
        var _ut = ig.utils;
        var _uti = ig.utilsintersection;

        /**
         * Improvements and expansion of default Input to include multi touch and gestures.
         * <br>- 1. instead of using ig.input.mouse, use {@link ig.Input#inputPoints}, {@link ig.Input#getInputPoint}, or {@link ig.Input#getInputPoints}
         * <br>- good news everybody, ig.input.mouse is still updated for backwards compatibility
         * <span class="alert alert-info"><strong>Tip:</strong> mouse and touches are both treated as input points so you can use them the same way anywhere.</span>
         * @class ig.Input
         * @memberof ig
         * @author Collin Hover - collinhover.com
         **/
        ig.Input.inject(/**@lends ig.Input.prototype */{

            /**
             * List of all active inputPoints.
             * @type Array
             * @see ig.InputPoint
             */
            inputPoints: [],

            /**
             * Initializes mouse and touch.
             * @see ig.Input
             **/
            initMouse: function () {

                this.parent();

                // cancel input on leave

                ig.system.canvas.addEventListener('mouseout', this.keycancel.bind(this), false);
                ig.system.canvas.addEventListener('mouseleave', this.keycancel.bind(this), false);

                if (ig.ua.touchDevice) {

                    // standard

                    ig.system.canvas.addEventListener('touchcancel', this.keycancel.bind(this), false);

                    // MS

                    ig.system.canvas.addEventListener('MSPointerOut', this.keycancel.bind(this), false);
                    ig.system.canvas.addEventListener('MSPointerLeave', this.keycancel.bind(this), false);

                }

            },

            /**
             * Listener for when a key, mouse button, or touch is down.
             * @param {Event} event.
             * @see ig.Input
             **/
            keydown: function (event) {

                if (event.type == 'mousedown'
                    || event.type == 'touchstart') {

                    // set inputPoint state

                    var inputPoint;

                    // try changed touches

                    if (event.changedTouches) {

                        for (var i = 0, il = event.changedTouches.length; i < il; i++) {

                            inputPoint = this.getInputPoint(event.changedTouches[ i ]);

                            inputPoint.touch = true;
                            inputPoint.setDown();

                        }

                    }
                    else {

                        inputPoint = this.getInputPoint(event);

                        inputPoint.setDown();

                    }

                }

                this.parent(event);

            },

            /**
             * Listener for when a key, mouse button, or touch is up.
             * @param {Event} event.
             * @see ig.Input
             **/
            keyup: function (event) {

                if (event.type === 'mouseup'
                    || event.type === 'touchend'
                    || event.type === 'mouseout'
                    || event.type === 'mouseleave'
                    || event.type === 'touchcancel') {

                    // set inputPoint state

                    var inputPoint;

                    // try changed touches

                    if (event.changedTouches) {

                        for (var i = 0, il = event.changedTouches.length; i < il; i++) {

                            inputPoint = this.getInputPoint(event.changedTouches[ i ]);

                            inputPoint.setUp();

                        }

                    }
                    else {

                        inputPoint = this.getInputPoint(event);

                        inputPoint.setUp();

                    }

                    // move

                    this.mousemove(event, true);

                }

                this.parent(event);

            },

            /**
             * Cancels an input event.
             * @param {Event} event
             **/
            keycancel: function (event) {

                var action = this.bindings[ event.button === 2 ? ig.KEY.MOUSE2 : ig.KEY.MOUSE1 ];
                if (action && this.actions[action]) {
                    this.keyup(event);
                }

            },

            /**
             * Repositions inputPoints based on event.
             * @param {Event} event
             **/
            mousemove: function (event) {

                var internalWidth = parseInt(ig.system.canvas.offsetWidth) || ig.system.realWidth;
                var scale = ig.system.scale * ( internalWidth / ig.system.realWidth );
                var boundsClient;

                if (ig.system.canvas.getBoundingClientRect) {

                    boundsClient = ig.system.canvas.getBoundingClientRect();

                }

                // try changed touches

                if (event.changedTouches) {

                    for (var i = 0, il = event.changedTouches.length; i < il; i++) {

                        this.inputPointMove(event.changedTouches[ i ], scale, boundsClient);

                    }

                }
                else {

                    this.inputPointMove(event, scale, boundsClient);

                }

                // update the original input mouse for stability

                var mousePoint = this.inputPoints[ 0 ];

                ig.input.mouse.x = mousePoint.x;
                ig.input.mouse.y = mousePoint.y;

            },

            /**
             * Repositions a inputPoint based on event, scale, and optionally, bounds.
             * @param {Event} event event object.
             * @param {Number} scale scale to modify event position with.
             * @param {Object} [boundsClient] bounding client rect of canvas.
             **/
            inputPointMove: function (event, scale, boundsClient) {

                var x = event.clientX;
                var y = event.clientY;

                if (boundsClient) {

                    x = x - boundsClient.left;
                    y = y - boundsClient.top;

                }

                x /= scale;
                y /= scale;

                var inputPoint = this.getInputPoint(event, x, y);

                inputPoint.reposition(x, y);

            },

            /**
             * Finds an inputPoint id based on search parameters.
             * @param {String|Object} [parameters] a string, or an object with identifier property.
             * @returns {String} id.
             **/
            getInputPointId: function (parameters) {

                // id
                if (typeof parameters === 'string') {

                    return parameters;

                }
                // object
                else if (parameters) {

                    // event

                    if (typeof parameters.identifier === 'string') {

                        return parameters.identifier;

                    }
                    // property / values
                    else if (parameters.properties && parameters.values) {

                        return _ut.indexOfProperties(this.inputPoints, parameters.properties, parameters.values);

                    }

                }

                // default to mouse

                return 0;

            },

            /**
             * Finds an inputPoint based on search parameters.
             * @param {String|Object} [parameters] a string, or an object with identifier property.
             * @returns {Object} a inputPoint.
             **/
            getInputPoint: function (parameters) {

                var id = this.getInputPointId(parameters);
                var inputPoint = this.inputPoints[ id ];

                // create new as needed

                if (!inputPoint) {

                    inputPoint = this.inputPoints[ id ] = new ig.InputPoint(0, 0, id);

                }

                return inputPoint;

            },

            /**
             * Finds all inputPoints based on properties and values.
             * @param {Array} properties array of property names.
             * @param {Array} values array of property values.
             * @returns {Array} list of input points that match.
             **/
            getInputPoints: function (properties, values) {

                var inputPoints = [];

                for (var i = 0, il = this.inputPoints.length; i < il; i++) {

                    var inputPoint = this.inputPoints[ i ];
                    var missing;

                    for (var j = 0, jl = properties.length; j < jl; j++) {

                        if (values[ j ] !== inputPoint[ properties[ j ] ]) {

                            missing = true;
                            break;

                        }

                    }

                    // if input point satisfies all property / value pairs

                    if (missing !== true) {

                        inputPoints.push(inputPoint);

                    }

                }

                return inputPoints;

            },

            /**
             * Removes an inputPoint from inputPoints based on search parameters.
             * @param {String|Object} [parameters] a string, or an object with identifier property.
             **/
            removeInputPoint: function (parameters) {

                // set up so input releases are triggered

                var id = this.getInputPointId(parameters);
                var inputPoint = this.inputPoints[ id ];

                if (inputPoint) {

                    inputPoint.setUp();

                    // remove from list

                    this.inputPoints.splice(id, 1);

                }

            },

            /**
             * Flags that an input has been pressed.
             * @param {String} code input code.
             * @see ig.KEY
             **/
            inputPressed: function (code) {

                var action = this.bindings[code];

                if (action) {

                    this.actions[action] = true;

                    if (!this.locks[action]) {

                        this.presses[action] = true;
                        this.locks[action] = true;

                    }

                }

            },

            /**
             * Flags that an input has been released.
             * @param {String} code input code.
             * @see ig.KEY
             **/
            inputReleased: function (code) {

                var action = this.bindings[code];

                if (action) {

                    this.delayedKeyup[action] = true;

                }

            },

            /**
             * Updates each input point to keep timed interactions accurate ( such as hold ).
             **/
            update: function () {

                for (var i = 0, il = this.inputPoints.length; i < il; i++) {

                    this.inputPoints[ i ].update();

                }

            }

        });

        /**
         * Input pointer for mouse, single touch, multi touch, and gestures.
         * <br>- unless otherwise noted, x and y values are in window coordinates.
         * <span class="alert alert-info"><strong>Tip:</strong> mouse and touches are both treated as input points so you can use them the same way anywhere.</span>
         * @class
         * @extends ig.Class
         * @memberof ig
         * @author Collin Hover - collinhover.com
         **/
        ig.InputPoint = ig.Class.extend(/**@lends ig.InputPoint.prototype */{

            /**
             * Unique id of input point, used to find input point in events.
             * @type Number
             * @default
             * @readonly
             */
            id: 0,

            /**
             * X position.
             * @type Number
             * @default
             * @readonly
             */
            x: 0,

            /**
             * Y position.
             * @type Number
             * @default
             * @readonly
             */
            y: 0,

            /**
             * Last x position.
             * @type Number
             * @default
             * @readonly
             */
            lastX: 0,

            /**
             * Last y position.
             * @type Number
             * @default
             * @readonly
             */
            lastY: 0,

            /**
             * X position in world coordinates.
             * @type Number
             * @default
             * @readonly
             */
            worldX: 0,

            /**
             * Y position in world coordinates.
             * @type Number
             * @default
             * @readonly
             */
            worldY: 0,

            /**
             * X distance travelled since last movement.
             * @type Number
             * @default
             * @readonly
             */
            deltaX: 0,

            /**
             * Y distance travelled since last movement.
             * @type Number
             * @default
             * @readonly
             */
            deltaY: 0,

            /**
             * X direction of movment.
             * @type Number
             * @default
             * @readonly
             */
            directionX: 0,

            /**
             * Y direction of movment.
             * @type Number
             * @default
             * @readonly
             */
            directionY: 0,

            /**
             * X distance travelled since last movement while in down state.
             * @type Number
             * @default
             * @readonly
             */
            downDeltaX: 0,

            /**
             * Y distance travelled since last movement while in down state.
             * @type Number
             * @default
             * @readonly
             */
            downDeltaY: 0,

            /**
             * X distance swiped.
             * @type Number
             * @default
             * @readonly
             */
            swipeDistanceX: 0,

            /**
             * Y distance swiped.
             * @type Number
             * @default
             * @readonly
             */
            swipeDistanceY: 0,

            /**
             * X distance travelled while swiping.
             * @type Number
             * @default
             * @readonly
             */
            swipeTotalDeltaX: 0,

            /**
             * Y distance travelled while swiping.
             * @type Number
             * @default
             * @readonly
             */
            swipeTotalDeltaY: 0,

            /**
             * Duration holding down.
             * @type Number
             * @default
             * @readonly
             */
            duration: 0,

            /**
             * List of targets found after tap.
             * @type Array
             * @readonly
             */
            targets: null,

            /**
             * List of targets found when input released.
             * @type Array
             * @readonly
             */
            targetsUp: null,

            /**
             * List of targets found when input down and moved.
             * @type Array
             * @readonly
             */
            targetsDown: null,

            /**
             * List of targets found when input first pressed.
             * @type Array
             * @readonly
             */
            targetsDownStart: null,

            /**
             * Whether input point is in down state.
             * @type Boolean
             * @readonly
             */
            down: false,

            /**
             * Whether input point tapped since last release.
             * @type Boolean
             * @readonly
             */
            tapped: false,

            /**
             * Whether input point is holding
             * @type Boolean
             * @readonly
             */
            holding: false,

            /**
             * Whether input point is long holding.
             * @type Boolean
             * @readonly
             */
            holdingActivate: false,

            /**
             * Whether input point has moved.
             * @type Boolean
             * @readonly
             */
            moved: false,

            /**
             * Whether input point is swiping horizontally.
             * @type Boolean
             * @readonly
             */
            swipingX: false,

            /**
             * Whether input point is swiping vertically.
             * @type Boolean
             * @readonly
             */
            swipingY: false,

            /**
             * Whether input point is swiping left.
             * @type Boolean
             * @readonly
             */
            swipingLeft: false,

            /**
             * Whether input point is swiping right.
             * @type Boolean
             * @readonly
             */
            swipingRight: false,

            /**
             * Whether input point is swiping up.
             * @type Boolean
             * @readonly
             */
            swipingUp: false,

            /**
             * Whether input point is swiping down.
             * @type Boolean
             * @readonly
             */
            swipingDown: false,

            // internal properties, do not modify

            _taps: 0,

            _downTotalDeltaX: 0,
            _downTotalDeltaY: 0,
            _directionDeltaTotalX: 0,
            _directionDeltaTotalY: 0,

            _durationReleased: 0,
            _durationSwipeTry: 0,

            _unpositioned: true,
            _movedWithReposition: false,
            _holdingActivatable: true,
            _downLast: false,
            _blockTap: false,

            /**
             * Initializes input point.
             * @param {Number} x x position to start.
             * @param {Number} y y position to start.
             * @param {Number|String} id input id, usually an index number.
             */
            init: function (x, y, id) {

                this.x = x || 0;
                this.y = y || 0;
                this.id = id || 0;

                this.targets = [];
                this.targetsUp = [];
                this.targetsDown = [];
                this.targetsDownStart = [];

                this.lastX = this.x;
                this.lastY = this.y;
                this.worldX = this.x + ig.game.screen.x;
                this.worldY = this.y + ig.game.screen.y;

            },

            /**
             * Reset input point properties.
             */
            reset: function () {

                this._unpositioned = true;
                this.lastX = this.x;
                this.lastY = this.y;
                this.worldX = this.x + ig.game.screen.x;
                this.worldY = this.y + ig.game.screen.y;
                this._taps = this._durationReleased = this.deltaX = this.deltaY = this.directionX = this.directionY = this._directionDeltaTotalX = this._directionDeltaTotalY = 0;
                this.moved = this._movedWithReposition = false;

                this.resetTargets();

                this.resetDown();

            },

            /**
             * Reset and clear all target lists.
             */
            resetTargets: function () {

                this.targets.length = this.targetsUp.length = this.targetsDown.length = this.targetsDownStart.length = 0;

            },

            /**
             * Reset input point down state specific properties.
             */
            resetDown: function () {

                if (this.down !== false) {

                    if (this.holding) {

                        ig.input.inputReleased(ig.KEY.HOLD);

                    }

                    this.duration = this.downDeltaX = this.downDeltaY = this._downTotalDeltaX = this._downTotalDeltaY = 0;
                    this.down = this._downLast = this.holding = this._blockTap = this.holdingActivate = false;
                    this._holdingActivatable = true;

                    this.resetSwipe();

                }

            },

            /**
             * Reset input point swipe state specific properties.
             */
            resetSwipe: function () {

                if (this.swiping !== false) {

                    ig.input.inputReleased(ig.KEY.SWIPE);

                    this.releaseSwipeX();
                    this.releaseSwipeY();

                    this.swiping = false;
                    this.resetSwipeValues();

                }

            },

            /**
             * Reset input point swipe property values.
             */
            resetSwipeValues: function () {

                this._durationSwipeTry = this.swipeDistanceX = this.swipeDistanceY = this.swipeTotalDeltaX = this.swipeTotalDeltaY = 0;

            },

            /**
             * Release input point from swiping horizontally.
             */
            releaseSwipeX: function () {

                if (this.swipingX) {

                    ig.input.inputReleased(ig.KEY.SWIPE_X);

                    if (this.swipingLeft) {

                        ig.input.inputReleased(ig.KEY.SWIPE_LEFT);
                        this.swipingLeft = false;

                    }
                    else if (this.swipingRight) {

                        ig.input.inputReleased(ig.KEY.SWIPE_RIGHT);
                        this.swipingRight = false;

                    }

                    this.swipingX = false;

                }

            },

            /**
             * Release input point from swiping vertically.
             */
            releaseSwipeY: function () {

                if (this.swipingY) {

                    ig.input.inputReleased(ig.KEY.SWIPE_Y);

                    if (this.swipingUp) {

                        ig.input.inputReleased(ig.KEY.SWIPE_UP);
                        this.swipingUp = false;

                    }
                    else if (this.swipingDown) {

                        ig.input.inputReleased(ig.KEY.SWIPE_DOWN);
                        this.swipingDown = false;

                    }

                    this.swipingY = false;

                }

            },

            /**
             * Set input point into down state.
             */
            setDown: function () {

                this.resetDown();
                this.down = true;

            },

            /**
             * Set input point into up state.
             */
            setUp: function () {

                if (this.down) {

                    // check taps

                    if (!this._blockTap) {

                        this.tapped = true;
                        this._taps++;
                        this._durationReleased = 0;

                        // always single tap

                        ig.input.inputReleased(ig.KEY.TAP);

                        // double tap and reset taps

                        if (this._taps === 2 && this._downTotalDeltaX * this._downTotalDeltaX + this._downTotalDeltaY * this._downTotalDeltaY <= ( this.screenSize * this.screenSize ) * _g.TAP_MULTI_DISTANCE_PCT) {

                            this._taps = 0;
                            ig.input.inputReleased(ig.KEY.TAP_DOUBLE);

                        }

                        // targets

                        if (_g.TARGET_TAP) {

                            if (_g.TARGET_DOWN_START) {

                                this.targets = this.targetsDownStart;

                            }
                            else {

                                this.targets = this.getTargets();

                            }

                        }

                    }
                    else {

                        this._taps = 0;
                        this.tapped = false;

                    }

                    // reset

                    this.resetDown();

                }

            },

            /**
             * Find all targets that collide with a bounding box created around input point and sized based on _g.TARGET_SEARCH_RADIUS.
             */
            getTargets: function () {

                var searchRadius = _g.TARGET_SEARCH_RADIUS / ig.system.scale;

                return _uti.entitiesInAABB(
                    this.worldX - searchRadius,
                    this.worldY - searchRadius,
                    this.worldX + searchRadius,
                    this.worldY + searchRadius,
                    true
                );

            },

            /**
             * Reposition input point.
             * @param {Number} x x position to move to.
             * @param {Number} y y position to move to.
             */
            reposition: function (x, y) {

                var directionChangedX;
                var directionChangedY;

                this.screenSize = Math.min(ig.system.width, ig.system.height);

                if (this._unpositioned) {

                    this.x = x;
                    this.y = y;
                    this._unpositioned = false;

                }
                else {

                    // delta

                    this.deltaX = x - this.x;
                    this.deltaY = y - this.y;

                    // direction

                    if (this.deltaX !== 0) {

                        var directionX = this.deltaX < 0 ? -1 : 1;

                        if (this.directionX !== directionX) {

                            this._directionDeltaTotalX += this.deltaX * directionX;

                            if (this._directionDeltaTotalX >= this.screenSize * _g.DIRECTION_SWITCH_PCT) {

                                directionChangedX = true;
                                this._directionDeltaTotalX = 0;
                                this.directionX = directionX;

                            }

                        }

                    }

                    if (this.deltaY !== 0) {

                        var directionY = this.deltaY < 0 ? -1 : 1;

                        if (this.directionY !== directionY) {

                            this._directionDeltaTotalY += this.deltaY * directionY;

                            if (this._directionDeltaTotalY >= this.screenSize * _g.DIRECTION_SWITCH_PCT) {

                                directionChangedY = true;
                                this._directionDeltaTotalY = 0;
                                this.directionY = directionY;

                            }

                        }

                    }

                    this._movedWithReposition = this.deltaX !== 0 || this.deltaY !== 0;

                    this.x = x;
                    this.y = y;

                }

                // world position

                this.worldX = this.x + ig.game.screen.x;
                this.worldY = this.y + ig.game.screen.y;

                // targets

                if (_g.TARGET_UP) {

                    this.targetsUp = this.getTargets();

                }

                // state

                if (this.down) {

                    // targets while down

                    if (_g.TARGET_DOWN) {

                        // copy targets from up

                        if (_g.TARGET_UP) {

                            this.targetsDown = this.targetsUp;

                        }
                        // find targets
                        else {

                            this.targetsDown = this.getTargets();

                        }

                    }

                    // start down

                    if (this._downLast !== this.down) {

                        this._downLast = this.down;

                        // targets

                        if (_g.TARGET_DOWN_START) {

                            // copy targets from down

                            if (_g.TARGET_DOWN) {

                                this.targetsDownStart = this.targetsDown;

                            }
                            // copy targets from up
                            else if (_g.TARGET_UP) {

                                this.targetsDownStart = this.targetsUp;

                            }
                            // find targets
                            else {

                                this.targetsDownStart = this.getTargets();

                            }

                        }

                    }

                    // delta while down

                    this.downDeltaX = this.deltaX;
                    this.downDeltaY = this.deltaY;
                    this._downTotalDeltaX += this.downDeltaX;
                    this._downTotalDeltaY += this.downDeltaY;

                    // check if moved too much to activate

                    if (this._holdingActivatable && this._downTotalDeltaX * this._downTotalDeltaX + this._downTotalDeltaY * this._downTotalDeltaY >= ( this.screenSize * this.screenSize ) * _g.HOLD_ACTIVATE_DISTANCE_PCT) {

                        this._holdingActivatable = false;

                    }

                    // swipe

                    this.swipeTotalDeltaX += this.downDeltaX;
                    this.swipeTotalDeltaY += this.downDeltaY;
                    this.swipeDistanceX = this.swipeTotalDeltaX < 0 ? -this.swipeTotalDeltaX : this.swipeTotalDeltaX;
                    this.swipeDistanceY = this.swipeTotalDeltaY < 0 ? -this.swipeTotalDeltaY : this.swipeTotalDeltaY;

                    // reset swipe values if not enough swipe distance in time

                    if (this.swiping !== true && this._durationSwipeTry > _g.SWIPE_DURATION_TRY ) {

                        this.resetSwipeValues();

                    }
                    // start swipe if enough distance
                    else {

                        // swiping x
                        if ( this.swipingX !== true && this.swipeDistanceX >= this.screenSize * _g.SWIPE_DISTANCE_PCT ) {

                            this.swiping = this._blockTap = true;
                            this._holdingActivatable = false;

                            ig.input.inputPressed(ig.KEY.SWIPE);

                            this.swipingX = directionChangedX = true;
                            ig.input.inputPressed(ig.KEY.SWIPE_X);

                        }

                        if ( this.swipingX && directionChangedX ) {

                            if (this.directionX === -1) {

                                if (this.swipingRight) {

                                    this.swipingRight = false;
                                    ig.input.inputReleased(ig.KEY.SWIPE_RIGHT);

                                }

                                this.swipingLeft = true;
                                ig.input.inputPressed(ig.KEY.SWIPE_LEFT);

                            }
                            else if (this.directionX === 1) {

                                if (this.swipingLeft) {

                                    this.swipingLeft = false;
                                    ig.input.inputReleased(ig.KEY.SWIPE_LEFT);

                                }

                                this.swipingRight = true;
                                ig.input.inputPressed(ig.KEY.SWIPE_RIGHT);

                            }

                        }

                        // swiping y
                        if ( this.swipingY !== true && this.swipeDistanceY >= this.screenSize * _g.SWIPE_DISTANCE_PCT) {

                            this.swiping = this._blockTap = true;
                            this._holdingActivatable = false;

                            ig.input.inputPressed(ig.KEY.SWIPE);

                            this.swipingY = directionChangedY = true;
                            ig.input.inputPressed(ig.KEY.SWIPE_Y);

                        }

                        if ( this.swipingY && directionChangedY ) {

                            if (this.directionY === -1) {

                                if (this.swipingDown) {

                                    this.swipingDown = false;
                                    ig.input.inputReleased(ig.KEY.SWIPE_DOWN);

                                }

                                this.swipingUp = true;
                                ig.input.inputPressed(ig.KEY.SWIPE_UP);

                            }
                            else if (this.directionY === 1) {

                                if (this.swipingUp) {

                                    this.swipingUp = false;
                                    ig.input.inputReleased(ig.KEY.SWIPE_UP);

                                }

                                this.swipingDown = true;
                                ig.input.inputPressed(ig.KEY.SWIPE_DOWN);

                            }

                        }

                    }

                }

            },

            /**
             * Update input point to record if moving, holding, etc.
             */
            update: function () {

                // movement

                this.moved = this.x - this.lastX !== 0 || this.y - this.lastY !== 0;
                this.lastX = this.x;
                this.lastY = this.y;
                this.worldX = this.x + ig.game.screen.x;
                this.worldY = this.y + ig.game.screen.y;

                // state

                if (this.down) {

                    this.duration += ig.system.tick;
                    this._durationSwipeTry += ig.system.tick;

                    // hold

                    if (!this.holding && this.duration >= _g.HOLD_DELAY) {

                        this.holding = true;

                        ig.input.inputPressed(ig.KEY.HOLD);

                    }

                    // tap block

                    if (!this._blockTap && this.duration >= _g.HOLD_DELAY_BLOCK_TAP) {

                        this._blockTap = true;

                    }

                    // activate

                    if (this._holdingActivatable && !this.holdingActivate && this.duration >= _g.HOLD_DELAY_ACTIVATE) {

                        this.holdingActivate = true;

                        ig.input.inputPressed(ig.KEY.HOLD_ACTIVATE);

                    }

                    // no movement, reset swipe

                    if (!this.moved && this._durationSwipeTry > _g.SWIPE_DURATION_RESET) {

                        this.resetSwipe();

                    }

                }
                else if (this._taps > 0) {

                    this._durationReleased += ig.system.tick;

                    if (this._durationReleased >= _g.RELEASE_DELAY) {

                        // if input point from touch, clear out upon release
                        // we don't need to track a touch that has been released, as it won't move

                        if (this.touch) {

                            ig.input.removeInputPoint(this.id);

                        }
                        // retain mouse input point and just reset taps
                        else {

                            this._taps = 0;

                        }

                    }

                }

            }

        });

        /*
         * Extra keys to support gestures.
         */
        ig.KEY.TAP = -6;
        ig.KEY.TAP_DOUBLE = -7;
        ig.KEY.HOLD = -9;
        ig.KEY.HOLD_ACTIVATE = -10;
        ig.KEY.SWIPE = -11;
        ig.KEY.SWIPE_X = -12;
        ig.KEY.SWIPE_Y = -13;
        ig.KEY.SWIPE_LEFT = -14;
        ig.KEY.SWIPE_RIGHT = -15;
        ig.KEY.SWIPE_UP = -16;
        ig.KEY.SWIPE_DOWN = -17;

    });