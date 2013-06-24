ig.module(
        'game.ui.ui-toggle-gfx-min'
    )
    .requires(
        'plusplus.core.config',
        'plusplus.ui.ui-toggle',
		'plusplus.abilities.glow'
    )
    .defines(function () {
        "use strict";

        var _c = ig.CONFIG;

        /**
         * Toggle for graphics performance.
         **/
        ig.UIToggleGfxMin = ig.global.UIToggleGfxMin = ig.UIToggle.extend({
		
			size: { x: 12, y: 12 },
			
            animSheet: new ig.AnimationSheet(_c.PATH_TO_MEDIA + 'icons_performance.png', 12, 12),
			
			// animations the Impact++ way
			animSettings: {
				idle: {
					frameTime: 1,
					sequence: [0]
				},
				on: {
					frameTime: 1,
					sequence: [1]
				}
			},
			
			// set the margin
			// treated as a pct
			margin: { x: 0.02, y: 0.02 },
			
            activate: function (entity) {

                if (!this.activated) {
					
					this.parent(entity);
					
					// remove atmosphere
					// 125 is the time in ms, to match glow fade time
					
					ig.game.camera.removeAtmosphere( 125 );
					
					// get all entities
					
					var entities = ig.game.entities;
					
					for ( var i = 0, il = entities.length; i < il; i++ ) {
						
						var entity = entities[ i ];
						
						// find any glow ability
						
						if ( entity.abilities ) {
							
							var abilities = entity.abilities.getDescendants();
							
							for ( var j = 0, jl = abilities.length; j < jl; j++ ) {
								
								var ability = abilities[ j ];
								
								// cleanup glow
								
								if ( ability instanceof ig.AbilityGlow ) {
									
									ability.cleanup();
									
								}
								
							}
							
						}
						
					}
					
					// remember to kill the player lights
					
					var player = ig.game.getEntityByName( 'player' );
					
					if ( player ) {
						
						player.onAdded.add( this.killPlayerLights, this );
						
					}

                }

            },
			
            deactivate: function (entity) {

                if (this.activated) {
					
					this.parent(entity);
					
					var player = ig.game.getEntityByName( 'player' );
					
					if ( player ) {
						
						player.onAdded.remove( this.killPlayerLights, this );
						
					}

                }

            },
			
			killPlayerLights: function () {
				
				var player = ig.game.getEntityByName( 'player' );
				
				if ( player ) {
					
					// find any glow ability
					
					if ( player.abilities ) {
						
						var abilities = player.abilities.getDescendants();
						
						for ( var j = 0, jl = abilities.length; j < jl; j++ ) {
							
							var ability = abilities[ j ];
							
							// cleanup glow
							
							if ( ability instanceof ig.AbilityGlow ) {
								
								ability.cleanup();
								
							}
							
						}
						
					}
					
				}
				
			}

        });

    });