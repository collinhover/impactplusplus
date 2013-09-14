ig.module(
        'plusplus.helpers.xhr'
    )
    .requires()
    .defines(function () {
        "use strict";

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
        ig.xhr.get = function (options) {

            var req = this.createObject();

            if (!req) {

                return;

            }

            req.open('GET', options.url, true);

            req.onreadystatechange = function () {

                if (req.readyState != 4) {

                    return

                }

                if (req.status == 200 || req.status == 304) {

                    if (typeof options.onSuccess === 'function') {

                        options.onSuccess.call(options.context, req, options.callbackParams);

                    }

                }
                else {

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
            function () {return new XMLHttpRequest()},
            function () {return new ActiveXObject("Msxml2.XMLHTTP")},
            function () {return new ActiveXObject("Msxml3.XMLHTTP")},
            function () {return new ActiveXObject("Microsoft.XMLHTTP")}
        ];

        /**
         * Creates a new XHR object by calling a supported factory.
         * @returns XMLHttpRequest
         */
        ig.xhr.createObject = function() {

            if (this._supportedFactoryIndex) {

                return this.factories[this._supportedFactoryIndex]();

            }
            else {

                var xhrObject;
                for (var i=0;i<this.factories.length;i++) {

                    try {
                        xhrObject = this.factories[i]();
                        this._supportedFactoryIndex = i;
                    }
                    catch (e) {
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