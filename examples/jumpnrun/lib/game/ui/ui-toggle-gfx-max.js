ig.module(
        'game.ui.ui-toggle-gfx-max'
    )
    .requires(
        'plusplus.core.config',
        'plusplus.ui.ui-toggle'
    )
    .defines(function () {
        "use strict";

        var _c = ig.CONFIG;

        /**
         * Toggle for graphics performance.
         **/
        ig.UIToggleGfxMax = ig.global.UIToggleGfxMax = ig.UIToggle.extend({
		
			size: { x: 12, y: 12 },
			
            animSheet: new ig.AnimationSheet(_c.PATH_TO_MEDIA + 'icons_performance.png', 12, 12),
			
			// animations the Impact++ way
			animSettings: {
				idle: {
					frameTime: 1,
					sequence: [2]
				},
				on: {
					frameTime: 1,
					sequence: [3]
				}
			},
			
			// set the margin
			// treated as a pct
			margin: { x: 0.02, y: 0.02 },
			
            activate: function (entity) {

                if (!this.activated) {
					
					this.parent(entity);
							
					// add atmosphere
					// 125 is the time in ms, to match glow fade time
					
					ig.game.camera.addAtmosphere( 125 );
					
					// get all entities
					
					var entities = ig.game.entities;
					
					for ( var i = 0, il = entities.length; i < il; i++ ) {
						
						var entity = entities[ i ];
						
						// find any glow ability
						
						if ( entity.abilities ) {
							
							var abilities = entity.abilities.getDescendants();
							
							for ( var j = 0, jl = abilities.length; j < jl; j++ ) {
								
								var ability = abilities[ j ];
								
								// execute glow
								
								if ( ability instanceof ig.AbilityGlow ) {
									
									ability.execute();
									
								}
								
							}
							
						}
						
					}

                }

            },
			
            deactivate: function (entity) {

                if (this.activated) {
					
					this.parent(entity);

                }

            }

        });

    });