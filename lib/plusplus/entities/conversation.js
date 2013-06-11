ig.module(
        'plusplus.entities.conversation'
    )
    .requires(
        'plusplus.core.timer',
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
        ig.EntityConversation = ig.global.EntityConversation = ig.EntityTrigger.extend({

            // editor properties

            _wmBoxColor: 'rgba(200, 200, 200, 0.7)',

            /**
             * Conversation messages.
             * <br>- automatically sorted by order on activate
             * @type Object
             * @example
             * // set player to say 'hello npc' first
             * conversation.messages[ 1 ] = {
             *      name: 'player',
             *      says: 'hello npc'
             *      order: 1
             * };
             * // then have npc say 'hello player' second
             * // with special text settings that map directly to ig.UIText
             * conversation.messages[ 2 ] = {
             *      name: 'npc',
             *      says: 'hello player'
             *      order: 2,
             *      textSettings: {...}
             * };
             */
            messages: {},

            /**
             * Currently active message.
             * @type Object
             */
            message: null,

            /**
             * Currently active message entity.
             * @type ig.EntityExtended
             */
            messageEntity: null,

            /**
             * Currently active speaker entity.
             * @type ig.EntityExtended
             */
            speakerEntity: null,

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
             * @property {Vector2|Object} offsetPct 0 x -1.2
             */
            messageFollowsSettings: {
                matchPerformance: true,
                offsetPct: { x: 0, y: -1.2 }
            },

            /**
             * Conversation messages unused, autopopulated on activate.
             * <span class="alert"><strong>IMPORTANT:</strong> use {@link ig.EntityConversation#messages}</span>
             * @type Array
             * @readonly
             */
            messagesUnused: [],

            /**
             * Conversation messages used, autopopulated on activate.
             * <span class="alert"><strong>IMPORTANT:</strong> use {@link ig.EntityConversation#messages}</span>
             * @type Array
             * @readonly
             */
            messagesUsed: [],

            /**
             * Whether conversation pauses game.
             * <br>- when true, overrides {@link ig.EntityConversation#pausingWithPlayer}
             * @type Boolean
             * @default
             */
            pausing: false,

            /**
             * Whether camera should follow each speaker when active.
             * @type Boolean
             * @default
             */
            cameraFollows: true,

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
             * Input action to look for if not using {@link ig.EntityConversation#autoAdvance} to advance the conversation.
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

                this.parent();

                // process current messages to ensure order

                for ( var name in this.messages ) {

                    var message = this.messages[ name ];
                    var order = parseInt( message.order );

                    if ( !_ut.isNumber( order ) ) {

                        order = parseInt( name );

                    }

                    if ( !_ut.isNumber( order ) ) {

                        order = message.order = ++this._order;

                    }
                    else if ( order > this._order ) {

                        this._order = order;

                    }

                }

            },

            /**
             * Adds message to conversation.
             * @param {String} spokenWords words to speak
             * @param {String} [speakerName] name of speaker entity
             * @param {Number} [order=last+1] order of message in conversation
             * @param {Object} [textSettings] settings that map directly to {@link ig.UIText}
             */
            addMessage: function ( spokenWords, speakerName, order, textSettings ) {

                if ( spokenWords && spokenWords.length > 0 ) {

                    if ( !_ut.isNumber( order ) ) {

                        order = ++this._order;

                    }
                    else if ( order > this._order ) {

                        this._order = order;

                    }

                    this.messages[ order ] = {
                        name: speakerName,
                        says: spokenWords,
                        order: order,
                        settings: textSettings
                    };

                }

            },

            /**
             * Activates conversation.
             * @override
             */
            activate: function ( entity ) {

                if ( !this.activated ) {

                    this.parent( entity );

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

                    // get all messages

                    this.messagesUnused.length = this.messagesUsed.length = 0;

                    for ( var name in this.messages ) {

                        var message = this.messages[ name ];

                        this.messagesUnused.push( message );

                        // setup speaker when pausing

                        if ( this.pausing ) {

                            var speakerEntity = ig.game.namedEntities[ message.name ];

                            if ( speakerEntity ) {

                                // unpause speaker

                                speakerEntity.unpause();

                                // remove speaker control

                                speakerEntity.removeControl();

                            }

                        }

                    }

                    // sort by order

                    this.messagesUnused.sort( function ( a, b ) {

                        return a.order - b.order;

                    });

                    // start conversation

                    this.nextMessage();

                }

            },

            /**
             * Deactivates and kills conversation.
             * @override
             */
            deactivate: function ( entity ) {

                if ( this.activated ) {

                    this.parent( entity );

                    // handle pausing

                    if ( this.pausing ) {

                        // return speaker control

                        for ( var name in this.messages ) {

                            var speakerEntity = ig.game.namedEntities[ this.messages[ name ].name ];

                            if ( speakerEntity ) {

                                speakerEntity.addControl();

                            }

                        }

                        ig.game.unpause( true );

                    }

                    // cleanup current message

                    this.hideMessage();

                    // clear message lists

                    this.messagesUnused.length = this.messagesUsed.length = 0;

                    this.kill( true );

                }
            },

            /**
             * Starts next message in conversation.
             */
            nextMessage: function () {

                this.hideMessage();

                if ( this.messagesUnused.length > 0 ) {

                    // swap message from unused to used

                    this.message = this.messagesUnused.shift();
                    this.messagesUsed.push( this.message );

                    // get speaker

                    if ( this.message.name ) {

                        this.speakerEntity = ig.game.namedEntities[ this.message.name ];

                        if ( this.speakerEntity ) {

                            // set speaker as talking

                            this.speakerEntity.animOverride( 'talk', { loop: true } );

                            // follow speaker with camera

                            if ( ig.game.camera ) {

                                ig.game.camera.onTransitioned.addOnce( this.showMessage, this );
                                ig.game.camera.follow( this.speakerEntity );

                            }

                        }

                    }
                    else {

                        this.showMessage();

                    }

                }
                else {

                   this.deactivate();

                }

            },

            /**
             * Shows current message.
             */
            showMessage: function () {

                if ( this.message ) {

                    // create message entity

                    this.message.textSettings = this.message.textSettings || {};
                    this.message.textSettings.text = this.message.says;

                    this.messageEntity = ig.game.spawnEntity( this.messageEntity || ig.UIText, 0, 0, this.message.textSettings );

                    // follow speaker

                    if ( this.speakerEntity && this.messageFollowsSpeaker ) {

                        this.messageEntity.moveToEntity( this.speakerEntity, this.messageFollowsSettings );

                    }

                    // set method of advance

                    if ( this.autoAdvance ) {

                        this.advanceTimer.set( this.message.says.length * this.durationPerLetter );

                    }

                }

            },

            /**
             * Removes current message.
             */
            hideMessage: function () {

                if ( this.message ) {

                    // kill current message

                    if ( this.messageEntity && !this.messageEntity._killed ) {

                        ig.game.removeEntity( this.messageEntity );

                    }

                    if ( this.speakerEntity ) {

                        // release speaker from talking override

                        if ( this.speakerEntity.anims.talk && this.speakerEntity.overridingAnim === this.speakerEntity.anims.talk ) {

                            this.speakerEntity.animRelease();

                        }

                    }

                    if ( ig.game.camera ) {

                        ig.game.camera.onTransitioned.remove( this.showMessage, this );
                        ig.game.camera.unfollow();

                    }

                    this.message = this.messageEntity = this.speakerEntity = undefined;

                }

            },

            /**
             * Updates conversation.
             * @override
             */
            update: function () {

                if ( this.messageEntity ) {

                    // auto advance

                    if ( this.autoAdvance ) {

                        if ( this.advanceTimer.delta() >= 0 ) {

                            this.nextMessage();

                        }

                    }
                    // wait for action
                    else if ( ig.input.pressed( this.action ) || ig.input.released( this.action ) ) {

                        this.nextMessage();

                    }

                }

                this.parent();

            }

        });

    });