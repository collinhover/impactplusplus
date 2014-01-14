ig.module(
    'plusplus.helpers.preloader'
)
    .requires(
        'plusplus.helpers.signals'
)
    .defines(function() {
        "use strict";

        /**
         * Preloader handling asynchronous loading of level tilesets (currently a work in progress to true load as required functionality!).
         * <span class="alert alert-danger"><strong>IMPORTANT:</strong> this does not load a level's required entities, modules, sounds, etc, only the images (i.e. tilesets, animation sheets, etc)</span>
         * @class
         * @extends ig.Class
         * @memberof ig
         * @author Benno Daenen - github.com/bdaenen
         **/
        ig.Preloader = ig.Class.extend( /**@lends ig.Class.prototype */ {

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

                var jsonMatch = data.match(/\/\*JSON\[\*\/([\s\S]*?)\/\*\]JSON\*\//);
                data = JSON.parse(jsonMatch ? jsonMatch[1] : data);
                ig.global['Level' + options.levelName] = data;
                for (var i = 0; i < data.layer.length; i++) {

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
            imageLoadCallback: function() {

                this._resourceCounter++;
                if (this._resourceCounter == ig.resources.length) {

                    this.ready = true;
                    if (this.onReady) {

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

            }

        });

        /**
         * Basic cross-browser XHR functionality. Only supports GET requests (for now).
         * @memberof ig
         * @namespace ig.xhr
         * @author Benno Daenen - github.com/bdaenen
         **/
        ig.xhr = {};

        ig.xhr._supportedFactoryIndex = 0;

        /**
         * Sends a GET XHR request.
         * @param  {String} options.url  Request URL
         * @param  {Function} [options.onSuccess]  Callback to execute when request has succeeded
         * @param  {Function} [options.onError]  Callback to execute when request has failed
         * @param  {Function} [options.onComplete]  Callback to execute when request has finished, successful or not
         * @param  {Object} [options.callbackParams]  Parameters to pass to callback function
         * @param  {Object} [options.context]  Context used for callback functions
         **/
        ig.xhr.get = function(options) {

            var req = this.createObject();

            if (!req) {

                return;

            }

            req.open('GET', options.url, true);

            req.onreadystatechange = function() {

                if (req.readyState != 4) {

                    return

                }

                if (req.status == 200 || req.status == 304) {

                    if (typeof options.onSuccess === 'function') {

                        options.onSuccess.call(options.context, req, options.callbackParams);

                    }

                } else {

                    if (typeof options.onError === 'function') {

                        options.onError.call(options.context, req, options.callbackParams);

                    }

                }

                if (typeof options.onComplete === 'function') {

                    options.onComplete.call(options.context, req, options.callbackParams);

                }

            };

            if (req.readyState == 4) {

                return;

            }

            req.send();

        };

        /**
         * Array holding several XHR factories for cross-browser compatibility
         * @type {Array}
         */
        ig.xhr.factories = [

            function() {
                return new XMLHttpRequest()
            },
            function() {
                return new ActiveXObject("Msxml2.XMLHTTP")
            },
            function() {
                return new ActiveXObject("Msxml3.XMLHTTP")
            },
            function() {
                return new ActiveXObject("Microsoft.XMLHTTP")
            }
        ];

        /**
         * Creates a new XHR object by calling a supported factory.
         * @returns XMLHttpRequest
         */
        ig.xhr.createObject = function() {

            if (this._supportedFactoryIndex) {

                return this.factories[this._supportedFactoryIndex]();

            } else {

                var xhrObject;
                for (var i = 0; i < this.factories.length; i++) {

                    try {
                        xhrObject = this.factories[i]();
                        this._supportedFactoryIndex = i;
                    } catch (e) {
                        continue;
                    }
                    break;

                }

            }

            if (!xhrObject) {

                throw new Error("Your browser is not supported.");

            }

            return xhrObject;

        }

    });
