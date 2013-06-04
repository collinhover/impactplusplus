ig.module(
        'plusplus.entities.conversation'
    )
    .requires(
        'plusplus.core.timer',
        'plusplus.abstractities.player',
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
            pausing: true,

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
            durationPerWord: 0.4,

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

                    // get all messages

                    this.messagesUnused.length = 0;

                    for ( var name in this.messages ) {

                        this.messagesUnused.push( this.messages[ name ] );

                    }

                    // sort by order

                    this.messagesUnused.sort( function ( a, b ) {

                        return a.order - b.order;

                    });

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

                    if ( this.pausing ) {

                        ig.game.unpause( true );

                    }

                    this.hideMessage();

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

                        this.speakerEntity = ig.game.getEntityByName( this.message.name );

                        if ( this.speakerEntity ) {

                            // unpause speaker

                            if ( this.pausing ) {

                                this.speakerEntity.unpause();

                                // remove control if speaker is player

                                if ( this.speakerEntity instanceof ig.Player ) {

                                    this.speakerEntity.controllable = false;

                                }

                            }

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

                        var words = this.message.says.split( ' ' );
                        this.advanceTimer.set( words.length * this.durationPerWord );

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

                        // pause speaker

                        if ( this.pausing ) {

                            this.speakerEntity.pause();

                            // return control if speaker is player

                            if ( this.speakerEntity instanceof ig.Player ) {

                                this.speakerEntity.controllable = true;

                            }

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