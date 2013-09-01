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
    .defines(function () {
        "use strict";

        var _ut = ig.utils;

        /**
         * Trigger to start a conversation between one or more speakers.
         * @class
         * @extends ig.EntityTrigger
         * @memberof ig
         * @author Collin Hover - collinhover.com
         */
        ig.EntityConversation = ig.global.EntityConversation = ig.EntityTrigger.extend(/**@lends ig.EntityConversation.prototype */{

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
             * conversation.addStep( 'player', 'hello world', 2, {...} );
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
                offsetPct: { x: 0, y: -1.3 }
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
            locking: true,

            /**
             * Whether conversation locks the player and removes control. Does the same as {@link ig.EntityConversation#locking}, but for player only.
             * @type Boolean
             * @default
             */
            lockingPlayer: false,

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
             * @type ig.TimerExtended
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
             * Conversations should not die until complete.
             * @override
             * @default
             */
            suicidal: false,

            /**
             * Conversations should always trigger.
             * @override
             * @default
             */
            triggerAfterDelay: true,

            // internal properties, do not modify

            _order: 0,

            _step: null,

            _speakersModified: {},

            /**
             * Initializes conversation properties.
             */
            initProperties: function () {

                this.parent();

                this.advanceTimer = new ig.TimerExtended( 0, this );

            },

            /**
             * Resets conversation extra properties.
             * @override
             */
            resetExtras: function () {

                // reprocess steps

                this.stepsSorted.length = 0;

                for ( var name in this.steps ) {

                    var step = this.steps[ name ];
                    var order = parseInt( step.order );

                    if ( !_ut.isNumber( order ) ) {

                        order = step.order = parseInt( name );

                    }

                    if ( !_ut.isNumber( order ) ) {

                        order = step.order = ++this._order;

                    }
                    else if ( order > this._order ) {

                        this._order = order;

                    }

                    this._addStep( step );

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
            addStep: function ( text, speakerName, order, settings ) {

                if ( text && text.length > 0 ) {

                    if ( !_ut.isNumber( order ) ) {

                        order = ++this._order;

                    }
                    else if ( order > this._order ) {

                        this._order = order;

                    }

                    var step = this.steps[ order ] = {
                        name: speakerName,
                        text: text,
                        order: order,
                        settings: settings
                    };

                    this._addStep( step );

                }

            },

            /**
             * Adds a step object to steps list.
             * @param {Object} step
             * @private
             */
            _addStep: function ( step ) {

                this.stepsSorted.push( step );

                this.stepsSorted.sort( function ( a, b ) {

                    return a.order - b.order;

                });

                // if conversation is active

                if ( this.activated ) {

                    this._addUnusedStep( step );

                    this.stepsUnused.sort( function ( a, b ) {

                        return a.order - b.order;

                    });

                }

            },

            /**
             * @override
             */
            setup: function () {

                // ensure that conversation does not pause without advancing action

                if ( this.pausing && !this.action ) {

                    this.pausing = false;
                    this.autoAdvance = true;

                }

                // pause game

                if ( this.pausing ) {

                    ig.game.pause( true );

                    // unpause camera to allow it to move

                    if ( ig.game.camera ) {

                        ig.game.camera.paused = false;

                    }

                    // unpause self to allow update

                    this.unpause();

                }

                // lock player

                if ( this.lockingPlayer ) {

                    ig.game.namedEntities.player && ig.game.namedEntities.player.removeControl();

                }

                // get all steps

                this.stepsUnused.length = this.stepsUsed.length = 0;
                this._speakersModified = {};

                for ( var i = 0, il = this.stepsSorted.length; i < il; i++ ) {

                    this._addUnusedStep( this.stepsSorted[ i ] );

                }

                // start conversation

                this.nextStep();

                this.parent();

            },

            /**
             * @override
             */
            teardown: function () {

                // cleanup current step

                this.hideStep();

                // clean up

                this.stepsUnused.length = this.stepsUsed.length = 0;
                this._speakersModified = {};

                // reset speakers

                for ( var name in this.steps ) {

                    var step = this.steps[ name ];
                    var speaker = ig.game.namedEntities[ step.name ];

                    if ( speaker && !this._speakersModified[ step.name ] ) {

                        this._speakersModified[ step.name ] = true;

                        // return speaker control

                        if ( step.locking || this.locking ) {

                            speaker.addControl();

                        }

                        // release speaker from overrides

                        var animNameTalk = speaker.getDirectionalAnimName( step.animNameTalk || this.animNameTalk );
                        var animNameListen = speaker.getDirectionalAnimName( step.animNameListen || this.animNameListen );

                        if ( ( speaker.anims[ animNameTalk ] && speaker.overridingAnim === speaker.anims[ animNameTalk ] )
                            || ( speaker.anims[ animNameListen ] && speaker.overridingAnim === speaker.anims[ animNameListen ] ) ) {

                            speaker.animRelease();

                        }

                    }

                }

                // unlock player

                if ( this.lockingPlayer ) {

                    ig.game.namedEntities.player && ig.game.namedEntities.player.addControl();

                }

                // unpause

                if ( this.pausing ) {

                    ig.game.unpause( true );

                }

                this.parent();

            },

            /**
             * Adds a step to the unused stack.
             * @param {Object} step
             * @private
             */
            _addUnusedStep: function ( step ) {

                this.stepsUnused.push( step );

                // setup speaker

                var name = step.name;
                var speaker = ig.game.namedEntities[ name ];

                if ( speaker && !this._speakersModified[ name ] ) {

                    this._speakersModified[ name ] = true;

                    var listen;

                    // unpause speaker

                    if ( this.pausing ) {

                        speaker.unpause();
                        listen = true;

                    }

                    // remove speaker control

                    if ( step.locking || this.locking ) {

                        speaker.removeControl();
                        listen = true;

                    }

                    // set speaker as listening

                    if ( listen ) {

                        speaker.animOverride( speaker.getDirectionalAnimName( step.animNameListen || this.animNameListen ), { loop: true } );

                    }

                }

            },

            /**
             * Starts next step in conversation.
             */
            nextStep: function () {

                this.hideStep();

                if ( this.stepsUnused.length > 0 ) {

                    // swap step from unused to used

                    this._step = this.stepsUnused.shift();
                    this.stepsUsed.push( this._step );

                    // get speaker

                    if ( this._step.name ) {

                        this.speaker = ig.game.namedEntities[ this._step.name ];

                        if ( this.speaker ) {

                            // set speaker as talking

                            this.speaker.animOverride( this.speaker.getDirectionalAnimName( this._step.animNameTalk || this.animNameTalk ), { loop: true } );

                            // follow speaker with camera

                            if ( this.pausing && ig.game.camera && this.cameraFollows && this.speaker !== this.speakerLast ) {

                                ig.game.camera.onTransitioned.addOnce( this.showStep, this );
                                ig.game.camera.follow( this.speaker, false, this.cameraCentered );

                            }
                            else {

                                this.showStep();

                            }

                        }

                    }
                    else {

                        this.showStep();

                    }

                }
                else {

                    this.complete();

                }

            },

            /**
             * Shows current step.
             */
            showStep: function () {

                if ( this._step ) {

                    // create message

                    var messageSettings = this.messageSettings;

                    if ( this.speaker && this.messageFollowsSpeaker ) {

                        messageSettings.fixed = messageSettings.fixed || false;

                    }

                    var messageContainer;

                    if ( this.messageContainerEntity ) {

                        messageSettings.textSettings = {
                            text: this._step.text
                        };
                        messageContainer = this.messageContainer = ig.game.spawnEntity( this.messageContainer || this.messageContainerEntity, 0, 0, ig.merge( messageSettings, this._step.settings ) );

                    }
                    else {

                        messageSettings.text = this._step.text;
                        messageContainer = this.message = ig.game.spawnEntity( this.message || this.messageEntity, 0, 0, ig.merge( messageSettings, this._step.settings ) );

                    }

                    if ( messageContainer.added ) {

                        this.activateStep();

                    }
                    else {

                        messageContainer.onAdded.addOnce( this.activateStep, this );

                    }

                }

            },

            /**
             * Activates step when message added.
             */
            activateStep: function () {

                if ( this._step ) {

                    // swap step from inactive to active

                    this.step = this._step;
                    this._step = undefined;

                    var messageContainer;
                    var message;

                    // separate message into container and actual message (with text)

                    if ( this.messageContainer ) {

                        messageContainer = this.messageContainer;
                        message = this.message = messageContainer.message;

                    }
                    else {

                        messageContainer = message = this.message;

                    }

                    // check if message has overflow

                    if ( message.textOverflow ) {

                        var overflow = message.textOverflow;

                        // reset message text

                        message.text = message.textDisplay || message.text;
                        message.textOverflow = "";

                        // add a new step with overflow

                        var overflowStep = ig.merge( {}, this.step );

                        this.step.text = message.text;
                        overflowStep.text = overflow;

                        this._addStep( overflowStep );

                    }

                    // message follows speaker

                    if ( this.speaker && this.messageFollowsSpeaker ) {

                        messageContainer.moveTo( this.speaker, this.messageMoveToSettings );
						messageContainer.unpause();

						// camera follows message

                        if ( this.pausing && this.cameraFollows && !messageContainer.fixed ) {

                            ig.game.camera.follow( messageContainer, false, this.cameraCentered );

                        }

                    }

                    // set method of advance

                    if ( this.autoAdvance ) {

                        this.advanceTimer.set( Math.max( this.step.text.length * this.durationPerLetter, this.durationPerStepMin ) );

                    }

                }

            },

            /**
             * Removes current step.
             */
            hideStep: function () {

                if ( ig.game.camera ) {

                    ig.game.camera.onTransitioned.remove( this.showStep, this );
                    ig.game.camera.unfollow();

                }

                // kill current step

                if ( this.messageContainer && !this.messageContainer._killed ) {

                    this.messageContainer.onAdded.remove( this.activateStep, this );

                    ig.game.removeEntity( this.messageContainer );

                    this.messageContainer = undefined;

                }

                if ( this.message && !this.message._killed ) {

                    this.message.onAdded.remove( this.activateStep, this );

                    ig.game.removeEntity( this.message );

                    this.message = undefined;

                }

                if ( this.speaker ) {

                    // conversation continuing

                    if ( this.stepsUnused.length > 0 ) {

                        // set speaker as listening

                        this.speaker.animOverride( this.getDirectionalAnimName( this.step.animNameListen || this.animNameListen ), { loop: true } );

                        // remember last speaker

                        this.speakerLast = this.speaker;

                    }
                    else {

                        // release speaker from overrides

                        var animNameTalk = this.speaker.getDirectionalAnimName( this.step.animNameTalk || this.animNameTalk );
                        var animNameListen = this.speaker.getDirectionalAnimName( this.step.animNameListen || this.animNameListen );

                        if ( ( this.speaker.anims[ animNameTalk ] && this.speaker.overridingAnim === this.speaker.anims[ animNameTalk ] )
                            || ( this.speaker.anims[ animNameListen ] && this.speaker.overridingAnim === this.speaker.anims[ animNameListen ] ) ) {

                            this.speaker.animRelease();

                        }

                    }

                    this.speaker = undefined;

                }

                this.step = this._step = undefined;

            },

            /**
             * @override
             */
            complete: function () {

                if ( this.stepsUnused.length === 0 && !this._step && !this.step ) {

                    this.parent();

                }

            },

            /**
             * @override
             */
            update: function () {

                if ( this.step ) {

                    // speaker is dead

                    if ( this.speaker && this.speaker._killed ) {

                        this.nextStep();

                    }
                    // auto advance
                    else if ( this.autoAdvance ) {

                        if ( this.advanceTimer.delta() >= 0 ) {

                            this.nextStep();

                        }

                    }
                    // wait for action
                    else if ( this.pausing && ig.input.pressed( this.action ) || ig.input.released( this.action ) ) {

                        this.nextStep();

                    }

                }

                this.parent();

            }

        });

    });