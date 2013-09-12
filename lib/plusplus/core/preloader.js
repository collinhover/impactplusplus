ig.module(
        'plusplus.core.preloader'
    )
    .requires(
        'plusplus.core.config',
        'plusplus.helpers.xhr',
        'plusplus.ui.ui-overlay'
    )
    .defines(function () {
        "use strict";

        var _c = ig.CONFIG;

        /**
         * Preloader handling asynchronous loading of levels and tilesets
         * @class
         * @extends ig.Class
         * @memberof ig
         * @author Benno Daenen - github.com/bdaenen
         **/
        ig.Preloader = ig.Class.extend(/**@lends ig.Class.prototype */{

            /**
             * Signal dispatched when preloader had loaded everything queued.
             * <br>- created on init.
             * @type ig.Signal
             */
            onReady: null,

            /**
             * If an ig.game.loadLevel was delayed because preloader wasn't ready, contains the object of the level.
             * <br>- created on init.
             * @type Object
             */
            delayedLevel: null,

            /**
             * If an ig.game.loadLevel was delayed because preloader wasn't ready, contains the name of the spawning entity.
             * <br>- created on init.
             * @type string
             */
            delayedSpawnerName: '',

            /**
             * Property to determine externally if the preloader has finished loading or not.
             * <br>- created on init.
             * @type boolean
             */
            ready: true,

            /**
             * UIOverlay used as the transitioner between levels.
             * <br>- created on init.
             * @type ig.UIOverlay
             */
            transitioner: null,

            // internal properties, do not modify

            _resourceCounter: 0,
            _levelsToLoad: [],

            /**
             * Initializes and creates onReady Signal
             */
            init: function() {

                this.onReady = new ig.Signal();

            },

            /**
             * Pushes a level inside the queue.
             * @param levelName
             */
            queueLevel: function(levelName) {

                this._levelsToLoad.push(levelName);

            },

            /**
             * Returns the length of the queue.
             * @returns Number
             */
            getQueueLength: function() {

                return this._levelsToLoad.length;

            },

            /**
             * Entirely clears the queue.
             */
            clearQueue: function() {

                this._levelsToLoad = [];

            },

            /**
             * Builds the preloader's UIOverlay.
             */
            createTransitioner: function() {

                this.transitioner = ig.game.spawnEntity(ig.UIOverlay, 0, 0, {
                    layerName: _c.TRANSITIONER_LAYER,
                    zIndex: _c.Z_INDEX_TRANSITIONER,
                    fillStyle: _c.TRANSITIONER_COLOR,
                    r: _c.TRANSITIONER_R,
                    g: _c.TRANSITIONER_G,
                    b: _c.TRANSITIONER_B,
                    alpha: 0
                });

            },

            /**
             * Preload all queued levels.
             */
            loadLevels: function() {

                for (var i = 0; i < this._levelsToLoad.length; i++) {

                    this.loadSingleLevel(this._levelsToLoad[i]);

                }

                this.clearQueue();

            },

            /**
             * Preload a single level.
             * @param levelName
             */
            loadSingleLevel: function(levelName) {

                if (this.ready) {

                    this.ready = false;

                }
                if (!this._resourceCounter) {

                    this._resourceCounter = ig.resources.length;

                }
                ig.global['Level' + levelName] = ig.xhr.get({
                    url: 'lib/game/levels/' + levelName + '.js',
                    onSuccess: this.preloadCallback,
                    callbackParams: {
                        levelName: levelName
                    },
                    context: this
                });

            },

            /**
             * Callback executed whenever a level was successfully downloaded.
             * @param response
             * @param options
             * @returns {boolean}
             */
            preloadCallback: function(response, options) {

                var data = response.response;

                // extract JSON from level

                var jsonMatch = data.match( /\/\*JSON\[\*\/([\s\S]*?)\/\*\]JSON\*\// );
                data = JSON.parse( jsonMatch ? jsonMatch[1] : data );
                ig.global['Level' + options.levelName] = data;
                for (var i = 0; i<data.layer.length;i++) {

                    var mapLayer = data.layer[i];
                    if (mapLayer.tilesetName) {

                        var newImg = new ig.Image(mapLayer.tilesetName);

                        // If the new image isn't loaded yet in a previous level
                        if (ig.resources.indexOf(newImg) == -1) {

                            ig.resources.push(newImg);
                            newImg.onLoaded.addOnce(this.imageLoadCallback, this);

                        }

                    }

                }

                return true;

            },

            /**
             * Callback for a loaded image
             */
            imageLoadCallback: function () {

                this._resourceCounter++;
                if (this._resourceCounter == ig.resources.length) {

                    this.ready = true;
                    if ( this.onReady ) {

                        this.onReady.dispatch(this);
                        this.onReady.removeAll();
                        this.onReady.forget();

                        // Reset the resourceCounter just in case something unexpected happened.

                        this._resourceCounter = 0;

                    }

                }
            },

            /**
             * Unload the current level and load the level when finished downloading.
             * @param spawnerName
             * @param level
             */
            delayLevelLoad: function(level, spawnerName) {
                this.delayedLevel = level;
                this.delayedSpawnerName = spawnerName;

                if (!this.transitioner) {

                    this.createTransitioner();

                }
                this.transitioner.fadeTo(1, {
                    onComplete: function () {
                        ig.game.unloadLevelDeferred();
                    }
                });
                this.onReady.addOnce(function() {
                    ig.game.loadLevelDeferred(this.delayedLevel, this.delayedSpawnerName);
                }, this)
            }

        });

    });
