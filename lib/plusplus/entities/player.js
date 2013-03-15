ig.module(
	'plusplus.entities.player'
)
.requires(
	'plusplus.helpers.shared',
	'plusplus.helpers.utilsmath',
	'plusplus.helpers.utilsscreen',
	'plusplus.physics.box2d',
	'plusplus.core.character',
	'plusplus.abilities.ability'
)
.defines(function(){ "use strict";

var _s = ig.shared;
var _um = ig.utilsmath;
var _us = ig.utilsscreen;
var _b2 = ig.Box2D;

ig.global.EntityPlayer = ig.EntityPlayer = ig.Character.extend({
	
	size: { x: 8, y: 14 },
	offset: { x: 4, y: 2 },
	
	type: ig.Entity.TYPE.A,
	
	animSheet: new ig.AnimationSheet( 'media/player.png', 16, 24 ),
	
	airControl: 0.5,
	
	touch: { x: 0, y: 0, taps: 0 },
	
	touchHoldDistancePctThreshold: 0.05,
	touchHoldStartDurationThreshold: 0.15,
	touchHoldNoTapDurationThreshold: 0.3,
	
	touchSwipeDistancePctThreshold: 0.03,
	touchSwipeDirectionDifferencePctThreshold: 0.02,
	touchSwipeDurationThreshold: 0.3,
	touchSwipeResetDurationThreshold: 0.1,
	
	multiTapDelay: 0.3, // in seconds
	multiTapDistancePctThreshold: 0.05,
	
	init: function () {
		
	    this.parent.apply( this, arguments );
		
		// add animations
		
		this.addAnim( 'idle', 1, [0] );
		this.addAnim( 'jump', 0.07, [1,2] );
		this.addAnim( 'climb', 0.2, [3,4] );
		
		// add abilities
		
		this.abilities.addDescendants( [
			new ig.Ability( ig.Ability.TYPE.SECONDARY, this, {
				bindings: this.mimicTouching,
				bindingsCleanup: this.unmimic
			} ),
			new ig.Ability( ig.Ability.TYPE.TERTIARY, this, {
				bindings: this.unmimic
			} )
		] );
		
	},
	
	/*
	 * Updates location of touch.
	 * TODO: Handle multi-touch.
	 */
	updateTouches: function () {
		
		var mouse = ig.input.mouse;
		var mx = mouse.x;
		var my = mouse.y;
		var t = this.touch;
		
		if ( typeof t.lx === 'undefined' ) {
			
			t.lx = t.ly = 0;
			this.resetTouches();
			
		}
		else {
			
			t.lx = t.x;
			t.ly = t.y;
			t.dx = mx - t.x;
			t.dy = my - t.y;
			t.moved = t.dx !== 0 || t.dy !== 0;
			t.tdx += t.dx;
			t.tdy += t.dy;
			
			t.duration += ig.system.tick;
			
			// hold
			
			if ( t.duration >= this.touchHoldStartDurationThreshold ) {
				
				t.holding = true;
				
				if ( t.duration >= this.touchHoldNoTapDurationThreshold ) {
					
					t.holdingWithoutTap = true;
					
				}
				
				// swipe
				
				var swipeReset;
				
				t.durationSwipe += ig.system.tick;
				
				t.distx = Math.sqrt( t.dx * t.dx );
				t.disty = Math.sqrt( t.dy * t.dy );
				t.tdistx += t.distx;
				t.tdisty += t.disty;
				
				if ( t.swiping !== true ) {
					
					if ( t.durationSwipe > this.touchSwipeDurationThreshold ) {
						
						swipeReset = true;
						
					}
					else if ( t.tdistx >= ig.system.width * this.touchSwipeDistancePctThreshold
						|| t.tdisty >= ig.system.height * this.touchSwipeDistancePctThreshold ) {
						
						t.swiping = true;
						t.holdingWithoutTap = true;
						
						t.distDiff = t.distx - t.tdisty;
						
						if ( t.distDiff > 0 && t.distDiff >= ig.system.width * this.touchSwipeDirectionDifferencePctThreshold ) {
							
							t.swipex = true;
							
						}
						else if ( t.distDiff < 0 && t.distDiff <= -ig.system.height * this.touchSwipeDirectionDifferencePctThreshold ) {
							
							t.swipey = true;
							
						}
						
					}
					
				}
				
				// no movement, reset swipe
				if ( swipeReset === true || ( !t.moved && t.durationSwipe > this.touchSwipeResetDurationThreshold ) ) {
					
					t.swiping = t.swipex = t.swipey = false;
					t.durationSwipe = t.tdistx = t.tdisty = 0;
					
				}
				
			}
			
		}
		
		t.x = mx;
		t.y = my;
		t.worldx = mx + ig.game.screen.x;
		t.worldy = my + ig.game.screen.y;
		t.touching = true;
		
	},
	
	resetTouches: function () {
		
		var t = this.touch;
		
		t.dx = t.dy = t.tdx = t.tdy = t.distx = t.disty = t.tdistx = t.tdisty = t.duration = t.durationSwipe = 0;
		t.touching = t.holding = t.holdingWithoutTap = t.holdingMove = t.swiping = t.swipex = t.swipey = false;
		
	},
	
	/*
	 * Mimics touched entity.
	 */
	mimicTouching: function () {
		
		var t = this.touch;
		var intersected = _us.entitiesInAABB( t.worldx, t.worldy, t.worldx, t.worldy, this.getLayer() );
		var entity = intersected[ 0 ];
		
		// TODO: add check to see if can mimic
		if ( entity ) {
			
			this.mimic( entity );
			
		}
		else {
			
			this.unmimic();
			
		}
		
	},
	
	/*
	 * Instant tap response. Works best for movement.
	 * Ex: tapping twice will trigger tapping once and twice.
	 */
	handleInstantTaps: function () {
		
		var t = this.touch;
		
		if ( t.taps === 1 ) {
			
			// when tapped on character 
			
			if ( _um.AABBIntersectsAABB( t.worldx, t.worldy, t.worldx, t.worldy, this.pos.x, this.pos.y, this.pos.x + this.size.x, this.pos.y + this.size.y ) ) {
				
				
				
			}
			
		}
		
	},
	
	/*
	 * Delayed tap response to allow for override of multi-tap. Works best for abilities.
	 * Ex: tapping twice will not trigger the single tap response.
	 */
	handleDelayedTaps: function () {
		
		var t = this.touch;
		
		t.tapsLast = t.taps;
		t.taps = 0;
		
		// update touch world position since delay allows player to move
		
		t.worldx = t.x + ig.game.screen.x;
		t.worldy = t.y + ig.game.screen.y;
		
		// multi tap if more than 1 tap and all close enough
		if ( t.tapsLast > 1 && Math.sqrt( t.tdx * t.tdx + t.tdy * t.tdy ) <= ig.system.width * this.multiTapDistancePctThreshold ) {
			
			if ( t.tapsLast === 3 ) {
				
				var ab = this.abilities.getDescendantByName( ig.Ability.TYPE.TERTIARY );
				if ( ab ) ab.execute();
				
			}
			else {
				
				var ab = this.abilities.getDescendantByName( ig.Ability.TYPE.SECONDARY );
				if ( ab ) ab.execute();
				
			}
			
		}
		// single tap
		else {
			
			var ab = this.abilities.getDescendantByName( ig.Ability.TYPE.PRIMARY );
			if ( ab ) ab.execute();
			
		}
		
	},
	
	climbUp: function () {
		
		// if colliding with one way that is not climbable, disable and unground from
		
		if ( this.collidingWithOneWay ) {
			
			for ( var i = 0, il = this.contactingOneWay.length; i < il; i++ ) {
				
				var contactRecord = this.contactingOneWay[ i ];
				
				if ( contactRecord.enabled && !contactRecord.entityOneWay.climbable ) {
					
					contactRecord.enabled = false;
					this.collidingWithOneWay = Math.max( 0, this.collidingWithOneWay - 1 );
					
					this.unground( contactRecord.fixtureOneWay );
					
				}
				
			}
			
		}
		
		if ( !this.collidingWithOneWay ) {
			
			this.climb();
			
		}
		
		this.moveToUp();
		
	},
	
	climbDown: function () {
		
		// if colliding with one way, disable and unground from
		
		if ( this.collidingWithOneWay ) {
			
			for ( var i = 0, il = this.contactingOneWay.length; i < il; i++ ) {
				
				var contactRecord = this.contactingOneWay[ i ];
				
				if ( contactRecord.enabled ) {
					
					contactRecord.enabled = false;
					this.collidingWithOneWay = Math.max( 0, this.collidingWithOneWay - 1 );
					
					this.unground( contactRecord.fixtureOneWay );
					
				}
				
			}
			
		}
		
		if ( !this.grounded ) {
			
			this.climb();
			
		}
		
		this.moveToDown();
		
	},
	
	update: function() {
		
		var t = this.touch;
		
		// stop movement
		
		if ( this.movingTo !== true ) {
			
			if ( this.jumping ) {
				
				this.moveToStopHorizontal();
				
			}
			else {
				
				this.moveToStop();
				
			}
			
		}
		
		// touches
		
		if ( ig.input.state( 'touching' ) ) {
			
			this.updateTouches();
			
			// set facing direction
			
			this.flip = t.worldx - this.getCenterX() > 0 ? false : true;
			
			// move while touch holding
			
			if ( t.holding === true ) {
				
				var dx = t.worldx - this.pos.x;
				var dy = t.worldy - this.pos.y;
				var holdingMove = false;
				
				if ( _um.almostEqual( dx, 0, ig.system.width * this.touchHoldDistancePctThreshold ) !== true ) {
					
					holdingMove = true;
					
					if ( dx > 0 ) {
						
						this.moveToRight();
						
					}
					else {
						
						this.moveToLeft();
						
					}
					
				}
				
				if ( this.climbable && _um.almostEqual( dy, 0, ig.system.height * this.touchHoldDistancePctThreshold ) !== true ) {
					
					holdingMove = true;
					
					if ( dy > 0 ) {
						
						this.climbDown();
						
					}
					else {
						
						this.climbUp();
						
					}
					
				}
				
				t.holdingMove = holdingMove;
				
			}
			
		}
		
		if ( ig.input.released( 'touching' ) ) {
			
			if ( t.holdingWithoutTap !== true ) {
				
				t.taps++;
				t.tapTime = t.tapTimeCounter = Date.now() * 0.001;
				
				// do anything requiring an instant response
				
				this.handleInstantTaps();
				
			}
			else {
				
				t.taps = 0;
				
			}
			
			this.resetTouches();
			
		}
		
		// taps
		
		if ( t.taps > 0 ) {
			
			// do anything requiring a specific delayed response
			
			t.tapTimeCounter += ig.system.tick;
			
			if ( t.tapTimeCounter - t.tapTime >= this.multiTapDelay ) {
				
				this.handleDelayedTaps();
				
			}
			
		}
		
		// horizontal movement
		
		if( ig.input.state('right') ) {
			
			this.moveToRight();
			
		}
		else if( ig.input.state('left') ) {
			
			this.moveToLeft();
			
		}
		
		// vertical movement
		
		if ( this.climbable ) {
			
			if( ig.input.state('up') ) {
				
				this.climbUp();
				
			} 
			else if( ig.input.state('down') ) {
				
				this.climbDown();
				
			} 
			
		}
		
		if ( ig.input.state('jump') || ( t.swipey === true && t.tdy < 0 ) ) {
			
			this.jump();
			
		}
		
		this.parent();
		
	}
});

});