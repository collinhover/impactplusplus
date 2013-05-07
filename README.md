Impact++ (r3)
========

```
Hold up!

I'm glad you've found Impact++, but a major update is about to be dropped that includes:
 + full documentation (and maybe demos too!)
 + overhauls to many existing features and file structure
 + lots of new entities
 
ETA: late May, 2013.
```
  
[See it in Action!](http://collinhover.github.com/mimic "Mimic")

####Overview
A series of extensions and additions to the [Impact javascript engine](http://impactjs.com "ImpactJS")

####Core Goal
The core goal of this project is to add some basic elements to Impact to make it easier and faster to start developing full featured games. Impact is a great engine, but it is fairly minimal to start. We've already created a slew of extra functionality, so why should you have to create it too?  
  
We also don't want to overlap too much with Jesse Freeman's [Impact Bootstrap](https://github.com/gamecook/Impact-Bootstrap "Impact-Bootstrap"), so you should definitely check it out also!  

####Features
* Extended support for Impact's default collision system
* (optional) Box2D Physics (v2.1a + lots of performance/bug fixes)  
	* Physics ready entities with multi-type collision ignore checks (pass-through)
	* 60+ new tiles for the collision map  
	* Debug draw
* Lighting
	* Realtime moving and highly optimized  
	* Dynamic alpha and/or color  
	* Shadows  
	* Entities can cast shadows fully, only from edges (hollow), or none
	* Gradient or full  
	* Pixel perfect  
* Utilities to convert Collision-maps to shapes ( these are useful for lighting and shadows )
	* Solid Shapes ( convex )
	* Edge Shapes ( convex or concave )
	* Climbable Shapes ( convex )
	* One-way Shapes for up, down, left, or right ( convex )
* Character
	* Moving
	* Jumping
	* Climbing 
	* Can handle slopes like pros
* Entities
	* Destructable entity
	* Pain giving entity, including instagib version
	* Particle entity, including color and debris particles
	* Spawner entity for particle emitting or monster making
	* Trigger entity ( and all the above are also triggers )
* Cloneable Hierarchy class (abstract)  
* Abilities class (based on Hierarchy)  
* Huge list of Utility functions such as AABB intersections, Point-in-Polygon, and more  
* SignalsJS library integration for a fantastic event system  
* TWEENJS library integration  
* Expanded debug draw  
  
And more to come! If you have anything to add, please don't hesitate to make a pull request!   

##How to Use
```
Note that unlike Impact Bootstrap, not all modules/classes will be loaded automatically!
```  
* Download and merge the **lib** folder into your new or existing ImpactJS project directory
* Don't forget the ImpactJS engine, we can't provide this
* Now you have a choice:
	* If using Impact's default physics, have your main game extend **lib/plusplus/core/game.js**
	* For full featured physics, have your main game extend **lib/plusplus/physics/game.js**  
  
##Contributors
[Collin Hover](http://collinhover.com "Collin Hover")  

---
  
*Copyright (C) 2013-Present Collin Hover and other contributors*  
*For full license and information, see [LICENSE](https://github.com/collinhover/impactextended/blob/master/LICENSE).*
