ig.module(
    'plusplus.entities.conversation'
)
    .requires(
        'plusplus.core.timer',
        'plusplus.ui.ui-text',
        'plusplus.ui.ui-text-bubble',
        'plusplus.entities.trigger',
        'plusplus.helpers.utils'
)
    .defines(function() {
        "use strict";

        var _ut = ig.utils;

        /**
         * Trigger to start a conversation between one or more speakers.
         * @class
         * @extends ig.EntityTrigger
         * @memberof ig
         * @author Collin Hover - collinhover.com
         */
        ig.EntityConversation = ig.global.EntityConversation = ig.EntityTrigger.extend( /**@lends ig.EntityConversation.prototype */ {

            // editor properties

            _wmBoxColor: 'rgba(200, 200, 200, 0.7)',

            /**
             * Conversation steps.
             * <br>- automatically sorted by order on activate
             * @type Object
             * @example
             * // set player to say 'hello world'
             * // with special settings for message
             * conversation.steps[ 1 ] = {
             *      // entity that should say text
             *      name: 'player',
             *      // text to show
             *      text: 'hello world'
             *      // order of display, defaults to step number
             *      order: 1,
             *      // whether speaking entity should have control removed
             *      // defaults to conversation's locking property
             *      locking: true,
             *      // name of animation to play while talking
             *      // defaults to conversation's animNameTalk property
             *      animNameTalk: 'talk',
             *      // name of animation to play while listening
             *      // defaults to conversation's animNameListen property
             *      animNameListen: 'listen',
             *      // text entity settings
             *      settings: {...}
             * };
             * // the following is the same as the above
             * // only it adds onto the end of the conversation
             * conversation.addStep( 'hello world', 'player', 1, {...} );
             */
            steps: {},

            /**
             * Steps sorted by order.
             * @type Array
             */
            stepsSorted: [],

            /**
             * Conversation steps unused, autopopulated on activate.
             * <span class="alert"><strong>IMPORTANT:</strong> use {@link ig.EntityConversation#steps}</span>
             * @type Array
             * @readonly
             */
            stepsUnused: [],

            /**
             * Conversation steps used, autopopulated on activate.
             * <span class="alert"><strong>IMPORTANT:</strong> use {@link ig.EntityConversation#steps}</span>
             * @type Array
             * @readonly
             */
            stepsUsed: [],

            /**
             * Currently active step.
             * @type Object
             */
            step: null,

            /**
             * Currently active message entity that has a text property.
             * @type ig.EntityExtended
             */
            message: null,

            /**
             * Message entity class.
             * <span class="alert"><strong>IMPORTANT:</strong> overridden by {@link ig.EntityConversation#messageContainerEntity} when it is defined.</span>
             * @type ig.EntityExtended
             * @default
             */
            messageEntity: ig.UIText,

            /**
             * Currently active message container entity.
             * <span class="alert"><strong>IMPORTANT:</strong> this is only present when the message has a container!</span>
             * @type ig.EntityExtended
             */
            messageContainer: null,

            /**
             * Message container entity class.
             * <span class="alert"><strong>IMPORTANT:</strong> when defined, overrides {@link ig.EntityConversation#messageEntity}, and so this must handle the message itself.</span>
             * @type ig.EntityExtended
             * @default
             */
            messageContainerEntity: ig.UITextBubble,

            /**
             * Settings for messages.
             * @type Object
             */
            messageSettings: {},

            /**
             * Whether messages follow speaker.
             * @type Boolean
             * @default
             */
            messageFollowsSpeaker: true,

            /**
             * Settings for when messages follow speaker.
             * @type Object
             * @property {Boolean} matchPerformance true
             * @property {Vector2|Object} offsetPct 0 x -1.3
             */
            messageMoveToSettings: {
                matchPerformance: true,
                offsetPct: {
                    x: 0,
                    y: -1.3
                }
            },

            /**
             * Currently active speaker entity.
             * @type ig.EntityExtended
             * @readonly
             */
            speaker: null,

            /**
             * Last speaker entity.
             * @type ig.EntityExtended
             * @readonly
             */
            speakerLast: null,

            /**
             * Map of names of non speaking entities participating in conversation.
             * @type Array
             * @see ig.EntityTrigger#target
             */
            participate: {},

            /**
             * List of entities participating in conversation, including those not speaking, populated at start of conversation.
             * @type Array
             * @readonly
             */
            participating: [],

            /**
             * Whether conversation forces all participants to look at the entity speaking.
             * @type Boolean
             * @default
             */
            looking: true,

            /**
             * Whether conversation pauses game.
             * <span class="alert"><strong>IMPORTANT:</strong> only works when an advancing action is defined by {@link ig.EntityConversation#action}.</span>
             * @type Boolean
             * @default
             */
            pausing: false,

            /**
             * Whether conversation locks all entities and removes control. Only locks entities involved in conversation.
             * <span class="alert alert-info"><strong>Tip:</strong> this property can be defined in a step to affect only that step!</span>
             * @type Boolean
             * @default
             */
            locking: false,

            /**
             * Whether conversation locks the player and removes control. Does the same as {@link ig.EntityConversation#locking}, but for player only.
             * @type Boolean
             * @default
             */
            lockingPlayer: false,

            /**
             * Whether conversation can interrupt and cancel other conversations. This only applies when one of the speakers in this conversation is currently in another conversation.
             * @type Boolean
             * @default
             */
            interrupting: true,

            /**
             * Name of animation to play for each speaking entity, when they are talking.
             * <span class="alert alert-info"><strong>Tip:</strong> this property can be defined in a step to affect only that step!</span>
             * @type String
             * @default
             */
            animNameTalk: 'talk',

            /**
             * Name of animation to play for each speaking entity, when they are listening.
             * <span class="alert alert-info"><strong>Tip:</strong> this property can be defined in a step to affect only that step!</span>
             * @type String
             * @default
             */
            animNameListen: 'listen',

            /**
             * Whether camera should follow each speaker when active.
             * @type Boolean
             * @default
             */
            cameraFollows: true,

            /**
             * Whether camera should center on each speaker and message rather than just keep them in screen.
             * @type Boolean
             * @default
             */
            cameraCentered: false,

            /**
             * Whether conversation automatically advances.
             * @type Boolean
             * @default
             */
            autoAdvance: true,

            /**
             * Conversation auto advance timer.
             * <br>- created on init
             * @type ig.Timer
             */
            advanceTimer: null,

            /**
             * Duration in seconds per word for {@link ig.EntityConversation#autoAdvance}.
             * <br>- average reading speed is 250 words per minute, or 4 words per second.
             * @type Number
             * @default
             */
            durationPerLetter: 0.1,

            /**
             * Duration in seconds that a step should be visible for at minimum when {@link ig.EntityConversation#autoAdvance}.
             * @type Number
             * @default
             */
            durationPerStepMin: 1,

            /**
             * Input action to look for if not using {@link ig.EntityConversation#autoAdvance} to advance the conversation.
             * <span class="alert"><strong>IMPORTANT:</strong> only works when conversation pauses game via {@link ig.EntityConversation#pausing}.</span>
             * @type String
             * @default
             */
            action: 'tap',

            /**
             * Conversations should always trigger after delay.
             * @override
             * @default
             */
            triggerAfterDelay: true,

            /**
             * @override
             * @default
             */
            autoComplete: false,

            // internal properties, do not modify

            _order: 0,

            _step: null,

            _speakersModified: [],

            _cameraWasFollowing: null,

            /**
             * Initializes conversation properties.
             */
            initProperties: function() {

                this.parent();

                this.advanceTimer = new ig.Timer();

            },

            /**
             * Resets conversation extra properties.
             * @override
             */
            resetExtras: function() {

                // reprocess steps

                this.stepsSorted.length = 0;

                for (var name in this.steps) {

                    var step = this.steps[name];
                    var order = parseInt(step.order);

                    if (!_ut.isNumber(order)) {

                        order = step.order = parseInt(name);

                    }

                    if (!_ut.isNumber(order)) {

                        order = step.order = ++this._order;

                    } else if (order > this._order) {

                        this._order = order;

                    }

                    this._addStep(step);

                }

                this.parent();

            },

            /**
             * Adds step to conversation.
             * @param {String} text words to speak
             * @param {String} [speakerName] name of speaker entity
             * @param {Number} [order=last+1] order of step in conversation
             * @param {Object} [settings] settings that map directly to {@link ig.UIText}
             */
            addStep: function(text, speakerName, order, settings) {

                if (text && text.length > 0) {

                    if (!_ut.isNumber(order)) {

                        order = ++this._order;

                    } else if (order > this._order) {

                        this._order = order;

                    }

                    var step = this.steps[order] = {
                        name: speakerName,
                        text: text,
                        order: order,
                        settings: settings
                    };

                    this._addStep(step);

                }

            },

            /**
             * Adds a step object to steps list.
             * @param {Object} step
             * @private
             */
            _addStep: function(step) {

                this.stepsSorted.push(step);

                this.stepsSorted.sort(function(a, b) {

                    return a.order - b.order;

                });

                // if conversation is active

                if (this.activated) {

                    this._addUnusedStep(step);

                    this.stepsUnused.sort(function(a, b) {

                        return a.order - b.order;

                    });

                }

            },

            /**
             * @override
             */
            setup: function() {

                var i, il;

                // ensure that conversation does not pause without advancing action

                if (this.pausing && !this.action) {

                    this.pausing = false;
                    this.autoAdvance = true;

                }

                // check speaker conversation status
                // and interrupt other conversation

                if (this.interrupting) {

                    var interrupted = {};

                    for (i = 0, il = this.stepsSorted.length; i < il; i++) {

                        var step = this.stepsSorted[i];
                        var speaker = ig.game.namedEntities[step.name];
                        var conversation = speaker && speaker.conversation;

                        if (conversation && conversation !== this && !interrupted[conversation.id] && conversation instanceof ig.EntityConversation && conversation.activated) {

                            interrupted[conversation.id] = true;
                            conversation.deactivate();

                        }

                    }

                }

                // pause game

                if (this.pausing) {

                    ig.game.pause(true);

                    // unpause camera to allow it to move

                    if (ig.game.camera) {

                        ig.game.camera.unpause();

                    }

                    // unpause self to allow update

                    this.unpause();

                }

                // lock player

                if (this.lockingPlayer) {

                    var player = ig.game.getPlayer();
                    player && player.removeControl();

                }

                // get all steps

                this.stepsUnused.length = this.stepsUsed.length = this.participating.length = this._speakersModified.length = 0;

                for (i = 0, il = this.stepsSorted.length; i < il; i++) {

                    this._addUnusedStep(this.stepsSorted[i]);

                }

                this._speakersModified.length = 0;

                // get all non speaking participants

                for (var name in this.participate) {

                    var participant = ig.game.namedEntities[this.participate[name]];

                    if (participant) {

                        _ut.arrayCautiousAdd(this.participating, participant);

                    }

                }

                // start conversation

                this.nextStep();

                this.parent();

            },

            /**
             * @override
             */
            teardown: function() {

                // cleanup current step

                this.hideStep();

                // clean up

                this.speakerLast = null;
                this.stepsUnused.length = this.stepsUsed.length = this.participating.length = this._speakersModified.length = 0;

                // reset speakers

                for (var name in this.steps) {

                    var step = this.steps[name];
                    var speaker = ig.game.namedEntities[step.name];

                    if (speaker && _ut.indexOfValue(this._speakersModified, step.name) === -1) {

                        this._speakersModified.push(step.name);

                        speaker.conversation = undefined;

                        // return speaker control

                        if (step.locking || this.locking) {

                            speaker.addControl();

                        }

                        // release speaker from overrides

                        speaker.animRelease(speaker.getDirectionalAnimName(step.animNameTalk || this.animNameTalk));
                        speaker.animRelease(speaker.getDirectionalAnimName(step.animNameListen || this.animNameListen));

                    }

                }

                this._speakersModified.length = 0;

                // clear camera follow

                if (ig.game.camera) {

                    ig.game.camera.onTransitioned.remove(this.complete, this);
                    this._cameraWasFollowing = null;

                }

                // unlock player

                if (this.lockingPlayer) {

                    var player = ig.game.getPlayer();
                    player && player.addControl();

                }

                // unpause

                if (this.pausing) {

                    ig.game.unpause(true);

                }

                this.parent();

            },

            /**
             * Adds a step to the unused stack.
             * @param {Object} step
             * @private
             */
            _addUnusedStep: function(step) {

                this.stepsUnused.push(step);

                // setup speaker

                var name = step.name;
                var speaker = ig.game.namedEntities[name];

                if (speaker && _ut.indexOfValue(this._speakersModified, step.name) === -1) {

                    this._speakersModified.push(name);
                    this.participating.push(speaker);

                    speaker.conversation = this;

                    // unpause speaker

                    if (this.pausing) {

                        speaker.unpause();

                    }

                    // remove speaker control
                    // set speaker as listening

                    if (step.locking || this.locking) {

                        speaker.removeControl();

                        var animName;

                        if (typeof step.animNameListen !== 'undefined') {

                            animName = step.animNameListen;

                        } else {

                            animName = this.animNameListen;

                        }

                        if (animName) {

                            speaker.animOverride(speaker.getDirectionalAnimName(animName), {
                                loop: true
                            });

                        }

                    }

                }

            },

            /**
             * Starts next step in conversation.
             */
            nextStep: function() {

                this.hideStep();

                if (this.stepsUnused.length > 0) {

                    // swap step from unused to used

                    this._step = this.stepsUnused.shift();
                    this.stepsUsed.push(this._step);

                    // get speaker

                    if (this._step.name) {

                        this.speaker = ig.game.namedEntities[this._step.name];

                        if (this.speaker) {

                            // override speaker animation to talking

                            var unmoving = this._step.locking || this.locking;

                            if (unmoving) {

                                var animName;

                                if (typeof this._step.animNameTalk !== 'undefined') {

                                    animName = this._step.animNameTalk;

                                } else {

                                    animName = this.animNameTalk;

                                }

                                if (animName) {

                                    this.speaker.animOverride(this.speaker.getDirectionalAnimName(animName), {
                                        loop: true
                                    });

                                }

                            }

                            // all participants look at current speaker

                            if (this.looking) {

                                for (var i = 0, il = this.participating.length; i < il; i++) {

                                    var participant = this.participating[i];

                                    if (participant !== this.speaker) {

                                        participant.lookAt(this.speaker);

                                    }

                                }

                            }

                            // follow speaker with camera

                            if ((this.pausing || this.lockingPlayer || unmoving) && ig.game.camera && this.cameraFollows && this.speaker !== this.speakerLast) {

                                // remember original camera following entity

                                if (!this._cameraWasFollowing) {

                                    this._cameraWasFollowing = ig.game.camera.entity;

                                }

                                this._cameraFollowing = this.speaker;
                                ig.game.camera.onTransitioned.addOnce(this.showStep, this);
                                ig.game.camera.follow(this.speaker, false, this.cameraCentered);

                            } else {

                                this.showStep();

                            }

                        }

                    } else {

                        this.showStep();

                    }

                } else {

                    // return to original following entity before completing

                    if (ig.game.camera && this.cameraFollows && this._cameraWasFollowing) {

                        ig.game.camera.onTransitioned.addOnce(this.complete, this);
                        ig.game.camera.follow(this._cameraWasFollowing, false, true);
                        this._cameraWasFollowing = null;

                    } else {

                        this.complete();

                    }

                }

            },

            /**
             * Shows current step.
             */
            showStep: function() {

                if (this._step && this._step.text) {

                    // create message

                    var messageSettings = this.messageSettings;

                    if (this.speaker && this.messageFollowsSpeaker) {

                        messageSettings.fixed = messageSettings.fixed || false;

                    }

                    var messageContainer;

                    if (this.messageContainerEntity) {

                        messageSettings.textSettings = {
                            text: this._step.text
                        };
                        messageContainer = this.messageContainer = ig.game.spawnEntity(this.messageContainer || this.messageContainerEntity, 0, 0, ig.merge(messageSettings, this._step.settings));

                    } else {

                        messageSettings.text = this._step.text;
                        messageContainer = this.message = ig.game.spawnEntity(this.message || this.messageEntity, 0, 0, ig.merge(messageSettings, this._step.settings));

                    }

                    if (messageContainer.added) {

                        this.activateStep();

                    } else {

                        messageContainer.onAdded.addOnce(this.activateStep, this);

                    }

                } else {

                    this.activateStep();

                }

            },

            /**
             * Activates step when message added.
             */
            activateStep: function() {

                if (this._step) {

                    // swap step from inactive to active

                    this.step = this._step;
                    this._step = undefined;

                    var messageContainer;
                    var message;

                    // separate message into container and actual message (with text)

                    if (this.messageContainer) {

                        messageContainer = this.messageContainer;
                        message = this.message = messageContainer.message;

                    } else {

                        messageContainer = message = this.message;

                    }

                    if (message) {

                        // check if message has overflow

                        if (message.textOverflow) {

                            var overflow = message.textOverflow;

                            // reset message text

                            message.text = message.textDisplay || message.text;
                            message.textOverflow = "";

                            // add a new step with overflow

                            var overflowStep = ig.merge({}, this.step);

                            this.step.text = message.text;
                            overflowStep.text = overflow;

                            this._addStep(overflowStep);

                        }

                        // message follows speaker

                        if (this.speaker && this.messageFollowsSpeaker) {

                            messageContainer.unpause();
                            messageContainer.moveTo(this.speaker, this.messageMoveToSettings);

                            // camera follows message

                            if ((this.pausing || this.locking || this.lockingPlayer || this.step.locking) && ig.game.camera && this.cameraFollows && !messageContainer.fixed) {

                                // remember original camera following entity

                                if (!this._cameraWasFollowing) {

                                    this._cameraWasFollowing = ig.game.camera.entity;

                                }

                                this._cameraFollowing = messageContainer;
                                ig.game.camera.follow(messageContainer, false, this.cameraCentered);

                            }

                        }

                        if (this.autoAdvance) {

                            this.advanceTimer.set(Math.max(this.step.text.length * this.durationPerLetter, this.durationPerStepMin));

                        }

                    } else {

                        this.advanceTimer.set(this.durationPerStepMin);

                    }

                }

            },

            /**
             * Removes current step.
             */
            hideStep: function() {

                // kill current step

                if (this.messageContainer) {

                    this.messageContainer.onAdded.remove(this.activateStep, this);

                    if (!this.messageContainer._killed) {

                        ig.game.removeEntity(this.messageContainer);

                    }

                    this.messageContainer = null;

                }

                if (this.message) {

                    this.message.onAdded.remove(this.activateStep, this);

                    if (!this.message._killed) {

                        ig.game.removeEntity(this.message);

                    }

                    this.message = null;

                }

                if (this.speaker) {

                    // conversation continuing

                    if (this.stepsUnused.length > 0) {

                        // set speaker as listening

                        if (this.locking || (this.step && this.step.locking)) {

                            var animName;

                            if (this.step && typeof this.step.animNameListen !== 'undefined') {

                                animName = this.step.animNameListen;

                            } else {

                                animName = this.animNameListen;

                            }

                            if (animName) {

                                this.speaker.animOverride(this.speaker.getDirectionalAnimName(animName), {
                                    loop: true
                                });

                            }

                        }

                        // remember last speaker

                        this.speakerLast = this.speaker;

                    } else {

                        // release speaker from overrides

                        this.speaker.animRelease(this.speaker.getDirectionalAnimName(this.step.animNameTalk || this.animNameTalk));
                        this.speaker.animRelease(this.speaker.getDirectionalAnimName(this.step.animNameListen || this.animNameListen));

                    }

                    this.speaker = null;

                }

                if (ig.game.camera && this.cameraFollows) {

                    ig.game.camera.onTransitioned.remove(this.showStep, this);

                    if (ig.game.camera && this._cameraFollowing && ig.game.camera.entity === this._cameraFollowing) {

                        ig.game.camera.unfollow();

                    }

                    this._cameraFollowing = null;

                }

                this.step = this._step = null;

            },

            /**
             * @override
             **/
            pause: function() {

                this.parent();

                this.advanceTimer.pause();

            },

            /**
             * @override
             **/
            unpause: function() {

                this.parent();

                this.advanceTimer.unpause();

            },

            /**
             * @override
             */
            update: function() {

                if (this.step) {

                    // speaker is dead

                    if (this.speaker && this.speaker._killed) {

                        this.nextStep();

                    }
                    // auto advance
                    else if ((this.autoAdvance || (this.step && !this.step.text)) && this.advanceTimer.delta() >= 0) {

                        this.nextStep();

                    }
                    // wait for action
                    else if (ig.input.released(this.action)) {

                        this.nextStep();

                    }

                }

                this.parent();

            }

        });

    });
