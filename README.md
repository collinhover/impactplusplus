Impact(JS) Extended (r1)
========
  
[See it in Action!](http://collinhover.github.com/mimic "Mimic")

####Overview
A series of extensions and additions to the [Impact javascript engine](http://impactjs.com "ImpactJS")

####Core Goal
The core goal of this project is to add some basic elements to Impact to make it easier and faster to start developing full featured games. Impact is a great engine, but it is fairly minimal to start. We've already created a slew of extra functionality, so why should you have to create it too?  
  
We also don't want to overlap too much with Jesse Freeman's [Impact Bootstrap](https://github.com/gamecook/Impact-Bootstrap "Impact-Bootstrap"), so you should definitely check it out also!  

####Features
* Box2D Physics (v2.1a + extra performance/bug fixes)  
* Utilities to convert Collision-maps to Box2D Physics shapes  
* 60+ new tiles for the collision map  
* Box2D Physics ready entities  
* (Realtime) Dynamic Lighting with options for shadows, gradient, pixel perfect, and more  
* Shadow casting entities  
* Static and Moving Character classes (abstract)  
* Cloneable Hierarchy class (abstract)  
* Abilities class (based on Hierarchy)  
* Huge list of Utility functions such as AABB intersections, Point-in-Polygon, and more  
* SignalsJS library integration for a fantastic event system  
* TWEENJS library integration  
  
And more to come! If you have anything to add, please don't hesitate to make a pull request!   

##How to Use
Download and merge the "lib" folder into your new or existing ImpactJS project directory (don't forget the ImpactJS engine), and have your main game extend "lib/game/core/game.js". Note that not all modules/classes will be loaded automatically, and you will need to require() them as needed.
  
##Contributors
[Collin Hover](http://collinhover.com "Collin Hover")  

---
  
*Copyright (C) 2013-Present Collin Hover and other contributors*  
*For full license and information, see [LICENSE](https://github.com/collinhover/impactextended/blob/master/LICENSE).*