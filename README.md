Impact++ (r6dev)
========

###[DOCS](http://collinhover.github.com/impactplusplus) / [DEMO](http://collinhover.github.com/impactplusplus)  
  
####Overview

Expanding the [ImpactJS engine](http://impactjs.com "ImpactJS") by over x10 so you can kick-start your game project into a full featured experience for the web (and mobile!).
```
Impact++ is stable for ImpactJS v1.20 - v1.23
```
  
####Features
* Extended capability of ImpactJS's default classes to improve collisions, animations,...
* ```ig.CONFIG``` data driven configuration to allow you to change parameters without rebuilding or modifying the library
* ```ig.GameExtended``` game with layers, easy pausing, improved debugger,...
* ```ig.EntityExtended``` entities with lots of extra helper functions, opt-in performance, inheritance friendly animations,...
* ```ig.pathfinding``` efficient, garbage collector free pathfinding able to avoid entities and let you draw pathfinding maps in the editor
* ```ig.InputPoint``` input with multi-touch and gestures that works the same for mouse or touch
* ```ig.Camera``` camera for screen control, smooth target transitions, atmospheric overlays,...
* ```ig.UIElement``` a whole list of ui element entities to make text, buttons, overlays,...
* ```ig.Ability``` abilities that are entirely modular, have a built in casting system, upgrades,...
* ```ig.EntityLight``` lighting in real-time with shadows, dynamic alpha and/or color,...
* ```ig.Character``` abstract character class with options for moving, jumping, climbing,...
* ```ig.Creature``` abstract creature class with simple AI to find targets, move to, attack, use abilities, flee...
* ```ig.Player``` abstract player class with built in interaction and input handling,...
* ```ig.Tutorial``` abstract tutorial class to help you show your players how to do things
* ```ig.Spawner``` abstract spawner class with pooling for better performance
* ```ig.Particle``` abstract particle class with fading in and/or out, random velocities,...
* ```ig.EntityTrigger``` easy to use set of triggers for complex event driven behavior
* ```ig.EntityCheckpoint``` checkpoint for automatic player respawning on death
* ```ig.utils``` huge list of utility functions for vectors, drawing, intersections, math, tiles,...
* and too much more to reasonably list here!
  
####Download
[
![Download Zip](http://github.com/images/modules/download/zip.png)
](http://github.com/collinhover/impactplusplus/zipball/master/)
[
![Download Zip](http://github.com/images/modules/download/tar.png)
](http://github.com/collinhover/impactplusplus/tarball/master/)
  
##Getting Started
####First Steps
1. Download using one of the "Download" links and extract the files.
2. Copy the **impactplusplus/lib/plusplus** folder into your new or existing ImpactJS project **lib** directory.
3. Either copy the **impactplusplus/lib/weltmeister/config.js** into your projet's **lib/weltmeister** directory...
4. Or, if you have a custom Weltmeister config:
	* add ```'lib/plusplus/entities/*.js'``` to the ```entityFiles``` setting
	* change the ```collisionTiles.path``` setting to ```'lib/weltmeister/collisiontiles_plusplus_64.png'```
5. Make sure you're comfortable with the [ImpactJS Documentation](http://impactjs.com/documentation)
6. Load up the Impact++ Jump N' Run demo (see below) to review the basics
7. Dive into the [Impact++ Documentation](http://collinhover.github.com/impactplusplus)
  
####Demo: Jump N' Run
Check out the Jump N' Run demo for an overview of getting started with Impact++, located in the 'examples/jumpnrun' directory. Don't forget to copy the ImpactJS engine and Weltmeister files into the demo directory!
  
####Demo: SUPER COLLIDER!
Check out the SUPER COLLIDER demo for an overview of how to use almost every single feature in Impact++, located in the 'examples/supercollider' directory. Don't forget to copy the ImpactJS engine and Weltmeister files into the demo directory!
  
##FAQ
####Ejecta, Cocoonjs, etc?
Impact++ has been built from day one to be portable / wrappable to iOS, Android, Win8, etc. Tests are ongoing, but the library does nothing that should need special handling when porting or wrapping your game code for distribution as a mobile app. Please let us know if you find any issues!
  
####Custom Settings
	// edit the user config file at 'plusplus/config-user.js'
	// then you can set values
	// for any of the properties that appear in ig.CONFIG
	// and they will automatically be merged
	// over the base settings
	ig.CONFIG_USER = {
		// for example, one thing you'll probably want to set right away
		// is your own logo (in base64) for the loader
		LOADER_LOGO_SRC_MAIN: 'data:image/png;base64,...'
	};
  
####Design Philosophy
* _Modularity_ - code should be reusable whenever possible
* _Parametrize_ - projects should be able to change settings without modifying the library
* _Be agnostic_ - do not rely on device or browser specific functionality
* _Consistency_ - the codebase should look like a cohesive whole
* _Document_ - the codebase should be reasonably documented
  
####Contributing
We'd love it if you want to help make Impact++ better, so if you're interested take a look at [CONTRIBUTING](https://github.com/collinhover/impactplusplus/blob/master/CONTRIBUTING.md).
  
####License
Impact++ is licensed under the MIT license. For full license and information, see [LICENSE](https://github.com/collinhover/impactplusplus/blob/master/LICENSE.md).
  
##Changelog
Check out the [Releases](https://github.com/collinhover/impactplusplus/releases).
  
####r5 to r6 changes (in progress)
```
General
```  
* Added lots more examples, warnings, and tips to docs.
* More successful bug hunting!
* UI now intercepts and blocks tap input (no more ui + abilities firing on same tap!)
* Player control has undergone a significant change to decouple the player entity and input (see ig.PlayerManager)
  
```
CONFIG
```
* added `COLLISION.ALLOW_FIXED` to allow control of fixed to fixed collisions
* added `CREATURE.MOVE_TO_PREY_SETTINGS`
* added `CREATURE.MOVE_TO_PREDATOR_SETTINGS`
* added `CREATURE.MOVE_TO_TETHER_SETTINGS`
* added `CREATURE.MOVE_TO_WANDER_SETTINGS`
* deprecated `STATIC` and moved to a property of `ig.EntityExtended.PERFORMANCE`
* deprecated `MOVABLE` and moved to a property of `ig.EntityExtended.PERFORMANCE`
* deprecated `DYNAMIC` and moved to a property of `ig.EntityExtended.PERFORMANCE`
* removed `NEEDS_BOUNDS`
* `Z_INDEX_OVERLAY` renamed `Z_INDEX_BELOW_ALL`
  
```
ig.GameExtended
```    
* `shapesPasses` is now a plain object that takes property:value pairs instead of an array
* added `playerManager` and `playerManagerClass` properties (see ig.PlayerManager)
* `getPlayer` will no longer search for player by class unless `canSearchForPlayerByClass` is enabled (defaults to true)
* `getPlayer` will no longer search for player by type unless `canSearchForPlayerByType` is enabled (defaults to true)
* changed all instances of `respondInput` to `handleInput`
  
```
ig.CollisionMap
```    
* entities now each have their own collision map result property, `collisionMapResult`, to reduce garbage
* collision map result's `.collision.slope` is now guaranteed to be a boolean, instead of changing between boolean and object
* collision map result's `.collision.slope` object is now stored in the result's `.slope` property
* major bug fixes for collision map checks
* entities should no longer get stuck at corners of a slope and a flat tile
* entities should no longer fall through one way tiles when coming down a slope
* slope assistance velocity is now added to the entity's position instead of velocity
  
```
ig.EntityExtended
```    
* changed first parameter of `animRelease` to `name` to allow for releasing only when override matches name
* shifted original first parameter of `animRelease`, `silent`, to second parameter
* added `frame` and `stop` options to `animOverride` method
* added `collisionMapResult` property to hold collision map collision results
* removed  `needsBounds`,`bounds`, `getBounds`, `boundsDraw`, and `getBoundsDraw` as they are ignored in all calculations and are causing confusion 
* `distance` methods now account for fixed entities
* entities now set `movingY` correctly in top-down mode (thanks @Pattentrick for finding)
  
```
ig.Character
```    
* fixed incorrect examples in docs
* added `clearPath` method for better control of path clearing
  
```
ig.Player
```    
* `collides` defaults to `lite` instead of `active`
* removed `holdActivate` input response from default input handling
* ig.PlayerManager now handles basic input to action for the player character
* player now only handles input to the basic interaction ability
  
```
ig.PlayerManager
```    
* new abstracted way to control characters, allowing you to easily swap the character the player controls with input! 
* playerManager's `handleInput` covers move, jump, and climb by default, and attempts to call the managed entity's `handleInput` method 
* added settings to disable default gesture input handling in case you need hold or swipe
  
```
ig.Creature
```    
* `collides` defaults to `lite` instead of `passive` 
  
```
ig.Spawner
```    
* added `unspawnSilently` to allow unspawned entities to play death animation 
* added `onSpawnedAll`and `onUnspawnedAll` signals
  
```
ig.EntityTrigger
```    
* added `autoComplete` to allow triggers to manually call complete (fixes confusing behavior where `complete` is called twice)
* added `teardownWhenComplete` to defer teardown until deactivate or cleanup
  
```
ig.Switch
```    
* added 'blocked' property for cases when a switch is not broken but blocked by external factors
  
```
ig.Door
```    
* animation name for when locked renamed from `lock` to `locked`
  
```
ig.Hierarchy
```    
* removed `execute`
* added `activate` convenience method
* added `setEntity` convenience method
* added `setEntityOptions` convenience method
* added `setEntityTarget` convenience method
* added `setEntityTargetFirst` convenience method
* added `getUsing` convenience method
  
```
ig.Ability
```    
* `typeTargetable` and `groupTargetable` now match only when target has ALL types/groups matching instead of any one
* target is now checked after setup cast instead of before
* removed check for invalid target as is already doing that in target check
* abilities can now target any type or group if `typeTargetable === 0` and `groupTargetable === 0`
* added `once` property (default false) to control whether ability keeps `activated === true` after activate
* added `activateStrict` property (default true) to double check distance after all activate casting
* `execute` deprecated
* `activate` now does what `execute` used to do (to be more in line with rest of library)
* i.e. use abilities by calling `activate` instead of `execute`
* `activateComplete` now does what `activate` used to do
* `deactivate` now does what `deactivateSetup` used to do (to be more in line with rest of library)
* i.e. deactivate abilities by calling `deactivate` instead of `deactivateSetup`
* `deactivateComplete` now does what `deactivate` used to do
* abilities now check if in use (i.e. casting or channelling) to avoid chain executions that would block proper use
* `entityTarget` now automatically retained when ability is `channelled`
* `retainTargetChannel` removed
* `isEntityTargetable` now accounts for and returns false when ability entity and entityTarget are in same group
* `groupTargetable` overrides `isEntityTargetable` to allow for same group targets
* `cast` now looks for animation settings in `castSettings.animSettings` instead of `castSettings` itself
  
```
ig.AbilityMelee
```    
* animation is now casted during setup instead of when passed
* settings changed from `activateCastSettings` to `activateSetupCastSettings`
  
```
ig.EntityAbilityExecute
```    
* renamed to `ig.EntityAbilityActivate`
  
```
ig.UIElement
```    
* moved `onActivated` and `onDeactivated` to ig.UIInteractive
  
```
ig.UIInteractive
```    
* added `enabled` state
* added `activateComplete` and `deactivateComplete`, which are called during `activate/deactivate` if element is enabled 
* added `onActivated` and `onDeactivated` signals, called during their respective complete methods
  
```
ig.UIButton
```    
* added simple buttons with automatic animation handling!
  
```
ig.UIToggle
```    
* removed properties `animNameActivate` and `animNameDeactivate` in preference of using overriding animation
* refactored to use `activateComplete` and `deactivateComplete` due to ig.UIInteractive changes
  
```
ig.UIText
```    
* added property `autoRefreshText` to update text elements when their text properties are changed
  
```
ig.UIOverlay
```    
* automatically updates `message` (UIText element) when text property changed
  
```
ig.utilstile
```    
* now properly discards inner edges, instead of outer, when `options.discardEdgesInner === true`
* now properly ignores climbables when `options.ignoreClimbables === true`
* now properly ignores one ways when `options.ignoreOneWays === true`
  
```
ig.utilsintersection
```    
* `sortByDistance` much more accurate, slightly less performant
  
```
ig.pathfinding
```    
* pathfinding greatly improved for slopes (thanks @afflicto for finding), around walls, and entities
* fixed pathfinding bug that was finding paths through unwalkable areas 
* fixed pathfinding bug that was randomly delaying characters from finding paths (thanks @Pattentrick for finding)
* pathfinding should be much smoother as characters no longer make small unnecessary adjustments (thanks @Pattentrick for finding)
* `getNodeAt` renamed `getGridNode`
* `getWorldNodeAt` renamed `getNode` (to be more inline with ImpactJS)
* `isPointInGrid` renamed `isGridPointInGrid`
* `isWorldPointInGrid` renamed `isPointInGrid`
* `isWalkableAt` renamed `isGridWalkable`
* `isWorldWalkableAt` renamed `isWalkable`
* `getWalkableNodeAt` renamed `getGridWalkableNode`
* `getWorldWalkableNodeAt` renamed `getWalkableNode`
* `getWorldWalkableNodeChain` renamed `getWalkableNodeChain`
* `ig.pathfinding.Node` renamed `ig.PathNode`
* pathfinding node's `parent` renamed `prevNode`