/**
 * Box2D v2.1a + performance fixes and made into Impact module under namespace ig.Box2D.
 * See http://box2d.org/ for documentation.
 * @author Erin Catto - box2d.org
 * @author Collin Hover - collinhover.com
 **/
ig.module(
	'plusplus.physics.box2d'
)
.defines(function(){

var Box2D = ig.Box2D = {};

function extend(a, b){
    for (var c in b){
        a[c] = b[c];
    }
}

function isInstanceOf(obj, _constructor){
    while (typeof obj === "object"){
        if (obj.constructor === _constructor){
            return true;
        }
        obj = obj._super;
    }
    return false;
}

Box2D.BoundValues = function(){
    this.__varz();
    this.__constructor.apply(this, arguments);
};

Box2D.BoundValues.prototype.__constructor = function(){
    this.lowerValues =[];
    this.lowerValues[0] = 0;
    this.lowerValues[1] = 0;
    this.upperValues =[];
    this.upperValues[0] = 0;
    this.upperValues[1] = 0;
};

Box2D.BoundValues.prototype.__varz = function(){
};
Box2D.BoundValues.prototype.lowerValues = undefined;
 Box2D.BoundValues.prototype.upperValues = undefined;

Box2D.PairManager = function(){
    this.__varz();
    this.__constructor.apply(this, arguments);
};

Box2D.PairManager.prototype.__constructor = function(){
    this.m_pairs =[];
    this.m_pairBuffer =[];
    this.m_pairCount = 0;
    this.m_pairBufferCount = 0;
    this.m_freePair = undefined;
};

Box2D.PairManager.prototype.__varz = function(){
};
 Box2D.PairManager.prototype.AddPair = function(proxy1, proxy2){
    var pair = proxy1.pairs[proxy2];
    if (typeof pair !== "undefined"){
        return pair;
    }
    if (typeof this.m_freePair === "undefined"){
        this.m_freePair = new Box2D.Pair();
        this.m_pairs.push(this.m_freePair);
    }
    pair = this.m_freePair;
    this.m_freePair = pair.next;
    pair.proxy1 = proxy1;
    pair.proxy2 = proxy2;
    pair.status = 0;
    pair.userData = undefined;
    pair.next = undefined;
    proxy1.pairs[proxy2] = pair;
    proxy2.pairs[proxy1] = pair;
    ++ this.m_pairCount;
    return pair;
};

Box2D.PairManager.prototype.RemovePair = function(proxy1, proxy2){
    var pair = proxy1.pairs[proxy2];
    if (typeof pair === "undefined"){
        return undefined;
    }
    var userData = pair.userData;
    delete proxy1.pairs[proxy2];
    delete proxy2.pairs[proxy1];
    pair.next = this.m_freePair;
    pair.proxy1 = undefined;
    pair.proxy2 = undefined;
    pair.userData = undefined;
    pair.status = 0;
    this.m_freePair = pair;
    -- this.m_pairCount;
    return userData;
};

Box2D.PairManager.prototype.Find = function(proxy1, proxy2){
    return proxy1.pairs[proxy2];
};

Box2D.PairManager.prototype.ValidateBuffer = function(){
};
 Box2D.PairManager.prototype.ValidateTable = function(){
};
 Box2D.PairManager.prototype.Initialize = function(broadPhase){
    this.m_broadPhase = broadPhase;
};

Box2D.PairManager.prototype.AddBufferedPair = function(proxy1, proxy2){
    var pair = this.AddPair(proxy1, proxy2);
    if (pair.IsBuffered() === false){
        pair.SetBuffered();
        this.m_pairBuffer[this.m_pairBufferCount] = pair;
        ++ this.m_pairBufferCount;
    }
    pair.ClearRemoved();
    if (Box2D.BroadPhase.s_validate){
        this.ValidateBuffer();
    }
};

Box2D.PairManager.prototype.RemoveBufferedPair = function(proxy1, proxy2){
    var pair = this.Find(proxy1, proxy2);
    if (typeof pair === "undefined"){
        return;
    }
    if (pair.IsBuffered() === false){
        pair.SetBuffered();
        this.m_pairBuffer[this.m_pairBufferCount] = pair;
        ++ this.m_pairBufferCount;
    }
    pair.SetRemoved();
    if (Box2D.BroadPhase.s_validate){
        this.ValidateBuffer();
    }
};
 
Box2D.PairManager.prototype.Commit = function(callback){
    var i = 0;
    var removeCount = 0;
    for (i = 0;i < this.m_pairBufferCount; ++i){
        var pair = this.m_pairBuffer[i];
        pair.ClearBuffered();
        var proxy1 = pair.proxy1;
        var proxy2 = pair.proxy2;
        if (pair.IsRemoved()){
        }
        else {
            if (pair.IsFinal() === false){
                callback(proxy1.userData, proxy2.userData);
            }
        }
    }
    this.m_pairBufferCount = 0;
    if (Box2D.BroadPhase.s_validate){
        this.ValidateTable();
    }
};
 Box2D.PairManager.prototype.m_broadPhase = undefined;
 Box2D.PairManager.prototype.m_pairs = undefined;
 Box2D.PairManager.prototype.m_freePair = undefined;
 Box2D.PairManager.prototype.m_pairCount = 0;
 Box2D.PairManager.prototype.m_pairBuffer = undefined;
 Box2D.PairManager.prototype.m_pairBufferCount = 0;

Box2D.TimeStep = function(){
    this.__varz();
    this.__constructor.apply(this, arguments);
};

Box2D.TimeStep.prototype.__constructor = function(){
};
 Box2D.TimeStep.prototype.__varz = function(){
};
 Box2D.TimeStep.prototype.Set = function(step){
    this.dt = step.dt;
    this.inv_dt = step.inv_dt;
    this.positionIterations = step.positionIterations;
    this.velocityIterations = step.velocityIterations;
    this.warmStarting = step.warmStarting;
};
 Box2D.TimeStep.prototype.dt = undefined;
 Box2D.TimeStep.prototype.inv_dt = undefined;
 Box2D.TimeStep.prototype.dtRatio = undefined;
 Box2D.TimeStep.prototype.velocityIterations = 0;
 Box2D.TimeStep.prototype.positionIterations = 0;
 Box2D.TimeStep.prototype.warmStarting = undefined;

Box2D.Controller = function(){
    this.__varz();
    this.__constructor.apply(this, arguments);
};

Box2D.Controller.prototype.__constructor = function(){
};
 Box2D.Controller.prototype.__varz = function(){
};
 Box2D.Controller.prototype.Step = function(step){
};
 Box2D.Controller.prototype.Draw = function(debugDraw){
};
 Box2D.Controller.prototype.AddBody = function(body){
    var edge = new Box2D.ControllerEdge();
    edge.controller = this;
    edge.body = body;
    edge.nextBody = this.m_bodyList;
    edge.prevBody = undefined;
    this.m_bodyList = edge;
    if (edge.nextBody){
        edge.nextBody.prevBody = edge;
    }
    this.m_bodyCount++;
    edge.nextController = body.m_controllerList;
    edge.prevController = undefined;
    body.m_controllerList = edge;
    if (edge.nextController){
        edge.nextController.prevController = edge;
    }
    body.m_controllerCount++;
};

Box2D.Controller.prototype.RemoveBody = function(body){
    var edge = body.m_controllerList;
    while (edge && edge.controller != this){
        edge = edge.nextController;
    }
    if (edge.prevBody){
        edge.prevBody.nextBody = edge.nextBody;
    }
    if (edge.nextBody){
        edge.nextBody.prevBody = edge.prevBody;
    }
    if (edge.nextController){
        edge.nextController.prevController = edge.prevController;
    }
    if (edge.prevController){
        edge.prevController.nextController = edge.nextController;
    }
    if (this.m_bodyList == edge){
        this.m_bodyList = edge.nextBody;
    }
    if (body.m_controllerList == edge){
        body.m_controllerList = edge.nextController;
    }
    body.m_controllerCount--;
    this.m_bodyCount--;
};

Box2D.Controller.prototype.Clear = function(){
    while (this.m_bodyList){
        this.RemoveBody(this.m_bodyList.body);
    }
};

Box2D.Controller.prototype.GetNext = function(){
    return this.m_next;
};

Box2D.Controller.prototype.GetWorld = function(){
    return this.m_world;
};

Box2D.Controller.prototype.GetBodyList = function(){
    return this.m_bodyList;
};
 Box2D.Controller.prototype.m_next = undefined;
 Box2D.Controller.prototype.m_prev = undefined;
 Box2D.Controller.prototype.m_world = undefined;

Box2D.GravityController = function(){
    Box2D.Controller.prototype.__varz.call(this);
    this.__varz();
    this.__constructor.apply(this, arguments);
};
 extend(Box2D.GravityController.prototype, Box2D.Controller.prototype);
 Box2D.GravityController.prototype._super = Box2D.Controller.prototype;

Box2D.GravityController.prototype.__constructor = function(){
    this._super.__constructor.apply(this, arguments);
};

Box2D.GravityController.prototype.__varz = function(){
};
 Box2D.GravityController.prototype.Step = function(step){
    var i = undefined;
    var body1 = undefined;
    var p1 = undefined;
    var mass1 = 0;
    var j = undefined;
    var body2 = undefined;
    var p2 = undefined;
    var dx = 0;
    var dy = 0;
    var r2 = 0;
    var f = undefined;
    if (this.invSqr){
        for (i = this.m_bodyList;i;i = i.nextBody){
            body1 = i.body;
            p1 = body1.GetWorldCenter();
            mass1 = body1.GetMass();
            for (j = this.m_bodyList;j != i;j = j.nextBody){
                body2 = j.body;
                p2 = body2.GetWorldCenter();
                dx = p2.x - p1.x;
                dy = p2.y - p1.y;
                r2 = dx * dx + dy * dy;
                if (r2 < Number.MIN_VALUE){
                    continue;
                }
                f = new Box2D.Vec2(dx, dy);
                f.Multiply(this.G / r2 / Math.sqrt(r2) * mass1 * body2.GetMass());
                if (body1.IsAwake()){
                    body1.ApplyForce(f, p1);
                }
                f.Multiply( - 1);
                if (body2.IsAwake()){
                    body2.ApplyForce(f, p2);
                }
            }
        }
    }
    else {
        for (i = this.m_bodyList;i;i = i.nextBody){
            body1 = i.body;
            p1 = body1.GetWorldCenter();
            mass1 = body1.GetMass();
            for (j = this.m_bodyList;j != i;j = j.nextBody){
                body2 = j.body;
                p2 = body2.GetWorldCenter();
                dx = p2.x - p1.x;
                dy = p2.y - p1.y;
                r2 = dx * dx + dy * dy;
                if (r2 < Number.MIN_VALUE){
                    continue;
                }
                f = new Box2D.Vec2(dx, dy);
                f.Multiply(this.G / r2 * mass1 * body2.GetMass());
                if (body1.IsAwake()){
                    body1.ApplyForce(f, p1);
                }
                f.Multiply( - 1);
                if (body2.IsAwake()){
                    body2.ApplyForce(f, p2);
                }
            }
        }
    }
};
 Box2D.GravityController.prototype.G = 1;
 Box2D.GravityController.prototype.invSqr = true;

Box2D.DestructionListener = function(){
    this.__varz();
    this.__constructor.apply(this, arguments);
};

Box2D.DestructionListener.prototype.__constructor = function(){
};
 Box2D.DestructionListener.prototype.__varz = function(){
};
 Box2D.DestructionListener.prototype.SayGoodbyeJoint = function(joint){
};
 Box2D.DestructionListener.prototype.SayGoodbyeFixture = function(fixture){
};
 Box2D.ContactEdge = function(){
    this.__varz();
    this.__constructor.apply(this, arguments);
};

Box2D.ContactEdge.prototype.__constructor = function(){
};
 Box2D.ContactEdge.prototype.__varz = function(){
};
Box2D.ContactEdge.prototype.other = undefined;
 Box2D.ContactEdge.prototype.contact = undefined;
 Box2D.ContactEdge.prototype.prev = undefined;
 Box2D.ContactEdge.prototype.next = undefined;

Box2D.EdgeChainDef = function(){
    this.__varz();
    this.__constructor.apply(this, arguments);
};

Box2D.EdgeChainDef.prototype.__constructor = function(){
    this.vertexCount = 0;
    this.isALoop = true;
    this.vertices =[];
};

Box2D.EdgeChainDef.prototype.__varz = function(){
};
Box2D.EdgeChainDef.prototype.vertices = undefined;
 Box2D.EdgeChainDef.prototype.vertexCount = undefined;
 Box2D.EdgeChainDef.prototype.isALoop = undefined;

Box2D.Vec2 = function(x_, y_){
    if (arguments.length == 2){
        this.x = x_;
        this.y = y_;
    }
};

Box2D.Vec2.Make = function(x_, y_){
    return new Box2D.Vec2(x_, y_);
};

Box2D.Vec2.prototype.SetZero = function(){
    this.x = 0;
    this.y = 0;
	return this;
};

Box2D.Vec2.prototype.Set = function(x_, y_){
    this.x = x_;
    this.y = y_;
	return this;
};

Box2D.Vec2.prototype.SetV = function(v){
    this.x = v.x;
    this.y = v.y;
	return this;
};

Box2D.Vec2.prototype.GetNegative = function(){
    return new Box2D.Vec2( -this.x, -this.y );
};

Box2D.Vec2.prototype.NegativeSelf = function(){
    this.x = - this.x;
    this.y = - this.y;
	return this;
};

Box2D.Vec2.prototype.Copy = function(){
    return new Box2D.Vec2(this.x, this.y);
};

Box2D.Vec2.prototype.Add = function(v){
    this.x += v.x;
    this.y += v.y;
	return this;
};

Box2D.Vec2.prototype.Subtract = function(v){
    this.x -= v.x;
    this.y -= v.y;
	return this;
};
 
 Box2D.Vec2.prototype.Multiply = function(a){
    this.x *= a;
    this.y *= a;
	return this;
};
 
 Box2D.Vec2.prototype.MulM = function(A){
    var tX = this.x;
    this.x = A.col1.x * tX + A.col2.x * this.y;
    this.y = A.col1.y * tX + A.col2.y * this.y;
	return this;
};
 
 Box2D.Vec2.prototype.MulTM = function(A){
    var tX = Box2D.Math.Dot(this, A.col1);
    this.y = Box2D.Math.Dot(this, A.col2);
    this.x = tX;
	return this;
};
 
 Box2D.Vec2.prototype.CrossVF = function(s){
    var tX = this.x;
    this.x = s * this.y;
    this.y = - s * tX;
	return this;
};
 
 Box2D.Vec2.prototype.CrossFV = function(s){
    var tX = this.x;
    this.x = - s * this.y;
    this.y = s * tX;
	return this;
};
 
 Box2D.Vec2.prototype.MinV = function(b){
    this.x = this.x < b.x ? this.x: b.x;
    this.y = this.y < b.y ? this.y: b.y;
	return this;
};
 
 Box2D.Vec2.prototype.MaxV = function(b){
    this.x = this.x > b.x ? this.x: b.x;
    this.y = this.y > b.y ? this.y: b.y;
	return this;
};
 
 Box2D.Vec2.prototype.Abs = function(){
    if (this.x < 0){
        this.x = - this.x;
    }
    if (this.y < 0){
        this.y = - this.y;
    }
	return this;
};
 
 Box2D.Vec2.prototype.Length = function(){
    return Math.sqrt(this.x * this.x + this.y * this.y);
};
 
 Box2D.Vec2.prototype.LengthSquared = function(){
    return this.x * this.x + this.y * this.y;
};
 
 Box2D.Vec2.prototype.Normalize = function(){
    var length = Math.sqrt(this.x * this.x + this.y * this.y);
    if (length < Number.MIN_VALUE){
        return 0;
    }
    var invLength = 1 / length;
    this.x *= invLength;
    this.y *= invLength;
	return length;
};
 
 Box2D.Vec2.prototype.IsValid = function(){
    return Box2D.Math.IsValid(this.x) && Box2D.Math.IsValid(this.y);
};
 Box2D.Vec2.prototype.x = 0;
 Box2D.Vec2.prototype.y = 0;
 
 Box2D.Vec3 = function(x, y, z){
    if (arguments.length == 3){
        this.x = x;
        this.y = y;
        this.z = z;
    }
};
 
 Box2D.Vec3.prototype.SetZero = function(){
    this.x = this.y = this.z = 0;
	return this;
};
 
 Box2D.Vec3.prototype.Set = function(x, y, z){
    this.x = x;
    this.y = y;
    this.z = z;
	return this;
};
 
 Box2D.Vec3.prototype.SetV = function(v){
    this.x = v.x;
    this.y = v.y;
    this.z = v.z;
	return this;
};
 
 Box2D.Vec3.prototype.GetNegative = function(){
    return new Box2D.Vec3( - this.x, - this.y, - this.z);
};
 
 Box2D.Vec3.prototype.NegativeSelf = function(){
    this.x = - this.x;
    this.y = - this.y;
    this.z = - this.z;
	return this;
};
 
 Box2D.Vec3.prototype.Copy = function(){
    return new Box2D.Vec3(this.x, this.y, this.z);
};
 
 Box2D.Vec3.prototype.Add = function(v){
    this.x += v.x;
    this.y += v.y;
    this.z += v.z;
	return this;
};
 
 Box2D.Vec3.prototype.Subtract = function(v){
    this.x -= v.x;
    this.y -= v.y;
    this.z -= v.z;
	return this;
};
 
 Box2D.Vec3.prototype.Multiply = function(a){
    this.x *= a;
    this.y *= a;
    this.z *= a;
	return this;
};
 Box2D.Vec3.prototype.x = 0;
 Box2D.Vec3.prototype.y = 0;
 Box2D.Vec3.prototype.z = 0;
 
 Box2D.DistanceProxy = function(){
    this.__varz();
    this.__constructor.apply(this, arguments);
};
 
 Box2D.DistanceProxy.prototype.__constructor = function(){
};
 Box2D.DistanceProxy.prototype.__varz = function(){
};
 Box2D.DistanceProxy.prototype.Set = function(shape){
    switch (shape.GetType()){
        case Box2D.Shape.e_circleShape: 
            var circle = shape;
            this.m_vertices =[];
            this.m_vertices[0] = circle.m_p;
            this.m_count = 1;
            this.m_radius = circle.m_radius;
            break;
        case Box2D.Shape.e_polygonShape: 
            var polygon = shape;
            this.m_vertices = polygon.m_vertices;
            this.m_count = polygon.m_vertexCount;
            this.m_radius = polygon.m_radius;
            break;
        default: 
            Box2D.Settings.b2Assert(false);
    }
};
 
 Box2D.DistanceProxy.prototype.GetSupport = function(d){
    var bestIndex = 0;
    var bestValue = this.m_vertices[0].x * d.x + this.m_vertices[0].y * d.y;
    for (var i = 1;i < this.m_count; ++i){
        var value = this.m_vertices[i].x * d.x + this.m_vertices[i].y * d.y;
        if (value > bestValue){
            bestIndex = i;
            bestValue = value;
        }
    }
    return bestIndex;
};
 
 Box2D.DistanceProxy.prototype.GetSupportVertex = function(d){
    var bestIndex = 0;
    var bestValue = this.m_vertices[0].x * d.x + this.m_vertices[0].y * d.y;
    for (var i = 1;i < this.m_count; ++i){
        var value = this.m_vertices[i].x * d.x + this.m_vertices[i].y * d.y;
        if (value > bestValue){
            bestIndex = i;
            bestValue = value;
        }
    }
    return this.m_vertices[bestIndex];
};
 
 Box2D.DistanceProxy.prototype.GetVertexCount = function(){
    return this.m_count;
};
 
 Box2D.DistanceProxy.prototype.GetVertex = function(index){
    Box2D.Settings.b2Assert(0 <= index && index < this.m_count);
    return this.m_vertices[index];
};
 Box2D.DistanceProxy.prototype.m_vertices = undefined;
 Box2D.DistanceProxy.prototype.m_count = 0;
 Box2D.DistanceProxy.prototype.m_radius = undefined;
 
 Box2D.ContactFactory = function(){
    this.__varz();
    this.__constructor.apply(this, arguments);
};
 
 Box2D.ContactFactory.prototype.__constructor = function(allocator){
    this.m_allocator = allocator;
    this.InitializeRegisters();
};
 
 Box2D.ContactFactory.prototype.__varz = function(){
};
 Box2D.ContactFactory.prototype.AddType = function(createFcn, destroyFcn, type1, type2){
    this.m_registers[type1][type2].createFcn = createFcn;
    this.m_registers[type1][type2].destroyFcn = destroyFcn;
    this.m_registers[type1][type2].primary = true;
    if (type1 != type2){
        this.m_registers[type2][type1].createFcn = createFcn;
        this.m_registers[type2][type1].destroyFcn = destroyFcn;
        this.m_registers[type2][type1].primary = false;
    }
};
 
 Box2D.ContactFactory.prototype.InitializeRegisters = function(){
    this.m_registers =[];
    for (var i = 0;i < Box2D.Shape.e_shapeTypeCount;i++){
        this.m_registers[i] =[];
        for (var j = 0;j < Box2D.Shape.e_shapeTypeCount;j++){
            this.m_registers[i][j] = new Box2D.ContactRegister();
        }
    }
    this.AddType(Box2D.CircleContact.Create, Box2D.CircleContact.Destroy, Box2D.Shape.e_circleShape, Box2D.Shape.e_circleShape);
    this.AddType(Box2D.PolyAndCircleContact.Create, Box2D.PolyAndCircleContact.Destroy, Box2D.Shape.e_polygonShape, 
       Box2D.Shape.e_circleShape);
    this.AddType(Box2D.PolygonContact.Create, Box2D.PolygonContact.Destroy, Box2D.Shape.e_polygonShape, Box2D.Shape.e_polygonShape);
    this.AddType(Box2D.EdgeAndCircleContact.Create, Box2D.EdgeAndCircleContact.Destroy, Box2D.Shape.e_edgeShape, Box2D.Shape.e_circleShape);
    this.AddType(Box2D.PolyAndEdgeContact.Create, Box2D.PolyAndEdgeContact.Destroy, Box2D.Shape.e_polygonShape, Box2D.Shape.e_edgeShape);
};
 
 Box2D.ContactFactory.prototype.Create = function(fixtureA, fixtureB){
    var type1 = fixtureA.GetType();
    var type2 = fixtureB.GetType();
    var reg = this.m_registers[type1][type2];
    var c;
    if (reg.pool){
        c = reg.pool;
        reg.pool = c.m_next;
        reg.poolCount--;
        c.Reset(fixtureA, fixtureB);
        return c;
    }
    var createFcn = reg.createFcn;
    if (typeof createFcn !== "undefined"){
        if (reg.primary){
            c = createFcn(this.m_allocator);
            c.Reset(fixtureA, fixtureB);
            return c;
        }
        else {
            c = createFcn(this.m_allocator);
            c.Reset(fixtureB, fixtureA);
            return c;
        }
    }
    else {
        return undefined;
    }
};
 
 Box2D.ContactFactory.prototype.Destroy = function(contact){
    if (contact.m_manifold.m_pointCount > 0){
        contact.m_fixtureA.m_body.SetAwake(true);
        contact.m_fixtureB.m_body.SetAwake(true);
    }
    var type1 = contact.m_fixtureA.GetType();
    var type2 = contact.m_fixtureB.GetType();
    var reg = this.m_registers[type1][type2];
    if (true){
        reg.poolCount++;
        contact.m_next = reg.pool;
        reg.pool = contact;
    }
    var destroyFcn = reg.destroyFcn;
    destroyFcn(contact, this.m_allocator);
};
 Box2D.ContactFactory.prototype.m_registers = undefined;
 Box2D.ContactFactory.prototype.m_allocator = undefined;
 
 Box2D.ConstantAccelController = function(){
    Box2D.Controller.prototype.__varz.call(this);
    this.__varz();
    this.__constructor.apply(this, arguments);
};
 extend(Box2D.ConstantAccelController.prototype, Box2D.Controller.prototype);
 Box2D.ConstantAccelController.prototype._super = Box2D.Controller.prototype;
 
 Box2D.ConstantAccelController.prototype.__constructor = function(){
    this._super.__constructor.apply(this, arguments);
};
 
 Box2D.ConstantAccelController.prototype.__varz = function(){
    this.A = new Box2D.Vec2(0, 0);
};
 
 Box2D.ConstantAccelController.prototype.Step = function(step){
    var smallA = new Box2D.Vec2(this.A.x * step.dt, this.A.y * step.dt);
    for (var i = this.m_bodyList;i;i = i.nextBody){
        var body = i.body;
        if ( ! body.IsAwake()){
            continue;
        }
        body.SetLinearVelocity(new Box2D.Vec2(body.GetLinearVelocity().x + smallA.x, body.GetLinearVelocity().y + 
           smallA.y));
    }
};
 Box2D.ConstantAccelController.prototype.A = new Box2D.Vec2(0, 0);
 
 Box2D.SeparationFunction = function(){
    this.__varz();
    this.__constructor.apply(this, arguments);
};
 
 Box2D.SeparationFunction.prototype.__constructor = function(){
};
 Box2D.SeparationFunction.prototype.__varz = function(){
    this.m_localPoint = new Box2D.Vec2();
    this.m_axis = new Box2D.Vec2();
};
 Box2D.SeparationFunction.e_points = 1;
 Box2D.SeparationFunction.e_faceA = 2;
 Box2D.SeparationFunction.e_faceB = 4;
 
 Box2D.SeparationFunction.prototype.Initialize = function(cache, proxyA, transformA, proxyB, transformB){
    this.m_proxyA = proxyA;
    this.m_proxyB = proxyB;
    var count = cache.count;
    Box2D.Settings.b2Assert(0 < count && count < 3);
    var localPointA;
    var localPointA1;
    var localPointA2;
    var localPointB;
    var localPointB1;
    var localPointB2;
    var pointAX;
    var pointAY;
    var pointBX;
    var pointBY;
    var normalX;
    var normalY;
    var tMat;
    var tVec;
    var s;
    var sgn;
    if (count == 1){
        this.m_type = Box2D.SeparationFunction.e_points;
        localPointA = this.m_proxyA.GetVertex(cache.indexA[0]);
        localPointB = this.m_proxyB.GetVertex(cache.indexB[0]);
        tVec = localPointA;
        tMat = transformA.R;
        pointAX = transformA.position.x + (tMat.col1.x * tVec.x + tMat.col2.x * tVec.y);
        pointAY = transformA.position.y + (tMat.col1.y * tVec.x + tMat.col2.y * tVec.y);
        tVec = localPointB;
        tMat = transformB.R;
        pointBX = transformB.position.x + (tMat.col1.x * tVec.x + tMat.col2.x * tVec.y);
        pointBY = transformB.position.y + (tMat.col1.y * tVec.x + tMat.col2.y * tVec.y);
        this.m_axis.x = pointBX - pointAX;
        this.m_axis.y = pointBY - pointAY;
        this.m_axis.Normalize();
    }
    else {
        if (cache.indexB[0] == cache.indexB[1]){
            this.m_type = Box2D.SeparationFunction.e_faceA;
            localPointA1 = this.m_proxyA.GetVertex(cache.indexA[0]);
            localPointA2 = this.m_proxyA.GetVertex(cache.indexA[1]);
            localPointB = this.m_proxyB.GetVertex(cache.indexB[0]);
            this.m_localPoint.x = 0.5 * (localPointA1.x + localPointA2.x);
            this.m_localPoint.y = 0.5 * (localPointA1.y + localPointA2.y);
            this.m_axis = Box2D.Math.CrossVF(Box2D.Math.SubtractVV(localPointA2, localPointA1), 1);
            this.m_axis.Normalize();
            tVec = this.m_axis;
            tMat = transformA.R;
            normalX = tMat.col1.x * tVec.x + tMat.col2.x * tVec.y;
            normalY = tMat.col1.y * tVec.x + tMat.col2.y * tVec.y;
            tVec = this.m_localPoint;
            tMat = transformA.R;
            pointAX = transformA.position.x + (tMat.col1.x * tVec.x + tMat.col2.x * tVec.y);
            pointAY = transformA.position.y + (tMat.col1.y * tVec.x + tMat.col2.y * tVec.y);
            tVec = localPointB;
            tMat = transformB.R;
            pointBX = transformB.position.x + (tMat.col1.x * tVec.x + tMat.col2.x * tVec.y);
            pointBY = transformB.position.y + (tMat.col1.y * tVec.x + tMat.col2.y * tVec.y);
            s = (pointBX - pointAX) * normalX + (pointBY - pointAY) * normalY;
            if (s < 0){
                this.m_axis.NegativeSelf();
            }
        }
        else {
            if (cache.indexA[0] == cache.indexA[0]){
                this.m_type = Box2D.SeparationFunction.e_faceB;
                localPointB1 = this.m_proxyB.GetVertex(cache.indexB[0]);
                localPointB2 = this.m_proxyB.GetVertex(cache.indexB[1]);
                localPointA = this.m_proxyA.GetVertex(cache.indexA[0]);
                this.m_localPoint.x = 0.5 * (localPointB1.x + localPointB2.x);
                this.m_localPoint.y = 0.5 * (localPointB1.y + localPointB2.y);
                this.m_axis = Box2D.Math.CrossVF(Box2D.Math.SubtractVV(localPointB2, localPointB1), 1);
                this.m_axis.Normalize();
                tVec = this.m_axis;
                tMat = transformB.R;
                normalX = tMat.col1.x * tVec.x + tMat.col2.x * tVec.y;
                normalY = tMat.col1.y * tVec.x + tMat.col2.y * tVec.y;
                tVec = this.m_localPoint;
                tMat = transformB.R;
                pointBX = transformB.position.x + (tMat.col1.x * tVec.x + tMat.col2.x * tVec.y);
                pointBY = transformB.position.y + (tMat.col1.y * tVec.x + tMat.col2.y * tVec.y);
                tVec = localPointA;
                tMat = transformA.R;
                pointAX = transformA.position.x + (tMat.col1.x * tVec.x + tMat.col2.x * tVec.y);
                pointAY = transformA.position.y + (tMat.col1.y * tVec.x + tMat.col2.y * tVec.y);
                s = (pointAX - pointBX) * normalX + (pointAY - pointBY) * normalY;
                if (s < 0){
                    this.m_axis.NegativeSelf();
                }
            }
            else {
                localPointA1 = this.m_proxyA.GetVertex(cache.indexA[0]);
                localPointA2 = this.m_proxyA.GetVertex(cache.indexA[1]);
                localPointB1 = this.m_proxyB.GetVertex(cache.indexB[0]);
                localPointB2 = this.m_proxyB.GetVertex(cache.indexB[1]);
                var pA = Box2D.Math.MulX(transformA, localPointA);
                var dA = Box2D.Math.MulMV(transformA.R, Box2D.Math.SubtractVV(localPointA2, localPointA1));
                var pB = Box2D.Math.MulX(transformB, localPointB);
                var dB = Box2D.Math.MulMV(transformB.R, Box2D.Math.SubtractVV(localPointB2, localPointB1));
                var a = dA.x * dA.x + dA.y * dA.y;
                var e = dB.x * dB.x + dB.y * dB.y;
                var r = Box2D.Math.SubtractVV(dB, dA);
                var c = dA.x * r.x + dA.y * r.y;
                var f = dB.x * r.x + dB.y * r.y;
                var b = dA.x * dB.x + dA.y * dB.y;
                var denom = a * e - b * b;
                s = 0;
                if (denom !== 0){
                    s = Box2D.Math.Clamp((b * f - c * e) / denom, 0, 1);
                }
                var t = (b * s + f) / e;
                if (t < 0){
                    t = 0;
                    s = Box2D.Math.Clamp((b - c) / a, 0, 1);
                }
                localPointA = new Box2D.Vec2();
                localPointA.x = localPointA1.x + s * (localPointA2.x - localPointA1.x);
                localPointA.y = localPointA1.y + s * (localPointA2.y - localPointA1.y);
                localPointB = new Box2D.Vec2();
                localPointB.x = localPointB1.x + s * (localPointB2.x - localPointB1.x);
                localPointB.y = localPointB1.y + s * (localPointB2.y - localPointB1.y);
                if (s === 0 || s == 1){
                    this.m_type = Box2D.SeparationFunction.e_faceB;
                    this.m_axis = Box2D.Math.CrossVF(Box2D.Math.SubtractVV(localPointB2, localPointB1), 1);
                    this.m_axis.Normalize();
                    this.m_localPoint = localPointB;
                    tVec = this.m_axis;
                    tMat = transformB.R;
                    normalX = tMat.col1.x * tVec.x + tMat.col2.x * tVec.y;
                    normalY = tMat.col1.y * tVec.x + tMat.col2.y * tVec.y;
                    tVec = this.m_localPoint;
                    tMat = transformB.R;
                    pointBX = transformB.position.x + (tMat.col1.x * tVec.x + tMat.col2.x * tVec.y);
                    pointBY = transformB.position.y + (tMat.col1.y * tVec.x + tMat.col2.y * tVec.y);
                    tVec = localPointA;
                    tMat = transformA.R;
                    pointAX = transformA.position.x + (tMat.col1.x * tVec.x + tMat.col2.x * tVec.y);
                    pointAY = transformA.position.y + (tMat.col1.y * tVec.x + tMat.col2.y * tVec.y);
                    sgn = (pointAX - pointBX) * normalX + (pointAY - pointBY) * normalY;
                    if (s < 0){
                        this.m_axis.NegativeSelf();
                    }
                }
                else {
                    this.m_type = Box2D.SeparationFunction.e_faceA;
                    this.m_axis = Box2D.Math.CrossVF(Box2D.Math.SubtractVV(localPointA2, localPointA1), 1);
                    this.m_localPoint = localPointA;
                    tVec = this.m_axis;
                    tMat = transformA.R;
                    normalX = tMat.col1.x * tVec.x + tMat.col2.x * tVec.y;
                    normalY = tMat.col1.y * tVec.x + tMat.col2.y * tVec.y;
                    tVec = this.m_localPoint;
                    tMat = transformA.R;
                    pointAX = transformA.position.x + (tMat.col1.x * tVec.x + tMat.col2.x * tVec.y);
                    pointAY = transformA.position.y + (tMat.col1.y * tVec.x + tMat.col2.y * tVec.y);
                    tVec = localPointB;
                    tMat = transformB.R;
                    pointBX = transformB.position.x + (tMat.col1.x * tVec.x + tMat.col2.x * tVec.y);
                    pointBY = transformB.position.y + (tMat.col1.y * tVec.x + tMat.col2.y * tVec.y);
                    sgn = (pointBX - pointAX) * normalX + (pointBY - pointAY) * normalY;
                    if (s < 0){
                        this.m_axis.NegativeSelf();
                    }
                }
            }
        }
    }
};
 
 Box2D.SeparationFunction.prototype.Evaluate = function(transformA, transformB){
    var axisA;
    var axisB;
    var localPointA;
    var localPointB;
    var pointA;
    var pointB;
    var seperation;
    var normal;
    switch (this.m_type){
        case Box2D.SeparationFunction.e_points: 
            axisA = Box2D.Math.MulTMV(transformA.R, this.m_axis);
            axisB = Box2D.Math.MulTMV(transformB.R, this.m_axis.GetNegative());
            localPointA = this.m_proxyA.GetSupportVertex(axisA);
            localPointB = this.m_proxyB.GetSupportVertex(axisB);
            pointA = Box2D.Math.MulX(transformA, localPointA);
            pointB = Box2D.Math.MulX(transformB, localPointB);
            seperation = (pointB.x - pointA.x) * this.m_axis.x + (pointB.y - pointA.y) * this.m_axis.y;
            return seperation;
        case Box2D.SeparationFunction.e_faceA: 
            normal = Box2D.Math.MulMV(transformA.R, this.m_axis);
            pointA = Box2D.Math.MulX(transformA, this.m_localPoint);
            axisB = Box2D.Math.MulTMV(transformB.R, normal.GetNegative());
            localPointB = this.m_proxyB.GetSupportVertex(axisB);
            pointB = Box2D.Math.MulX(transformB, localPointB);
            seperation = (pointB.x - pointA.x) * normal.x + (pointB.y - pointA.y) * normal.y;
            return seperation;
        case Box2D.SeparationFunction.e_faceB: 
            normal = Box2D.Math.MulMV(transformB.R, this.m_axis);
            pointB = Box2D.Math.MulX(transformB, this.m_localPoint);
            axisA = Box2D.Math.MulTMV(transformA.R, normal.GetNegative());
            localPointA = this.m_proxyA.GetSupportVertex(axisA);
            pointA = Box2D.Math.MulX(transformA, localPointA);
            seperation = (pointA.x - pointB.x) * normal.x + (pointA.y - pointB.y) * normal.y;
            return seperation;
        default: 
            Box2D.Settings.b2Assert(false);
            return 0;
    }
};
 Box2D.SeparationFunction.prototype.m_proxyA = undefined;
 Box2D.SeparationFunction.prototype.m_proxyB = undefined;
 Box2D.SeparationFunction.prototype.m_type = 0;
 Box2D.SeparationFunction.prototype.m_localPoint = new Box2D.Vec2();
 Box2D.SeparationFunction.prototype.m_axis = new Box2D.Vec2();
 
 Box2D.DynamicTreePair = function(){
    this.__varz();
    this.__constructor.apply(this, arguments);
};
 
 Box2D.DynamicTreePair.prototype.__constructor = function(){
};
 Box2D.DynamicTreePair.prototype.__varz = function(){
};
Box2D.DynamicTreePair.prototype.proxyA = undefined;
 Box2D.DynamicTreePair.prototype.proxyB = undefined;
 
 Box2D.ContactConstraintPoint = function(){
    this.__varz();
    this.__constructor.apply(this, arguments);
};
 
 Box2D.ContactConstraintPoint.prototype.__constructor = function(){
};
 Box2D.ContactConstraintPoint.prototype.__varz = function(){
    this.localPoint = new Box2D.Vec2();
    this.rA = new Box2D.Vec2();
    this.rB = new Box2D.Vec2();
};
 Box2D.ContactConstraintPoint.prototype.localPoint = new Box2D.Vec2();
 Box2D.ContactConstraintPoint.prototype.rA = new Box2D.Vec2();
 Box2D.ContactConstraintPoint.prototype.rB = new Box2D.Vec2();
 Box2D.ContactConstraintPoint.prototype.normalImpulse = undefined;
 Box2D.ContactConstraintPoint.prototype.tangentImpulse = undefined;
 Box2D.ContactConstraintPoint.prototype.normalMass = undefined;
 Box2D.ContactConstraintPoint.prototype.tangentMass = undefined;
 Box2D.ContactConstraintPoint.prototype.equalizedMass = undefined;
 Box2D.ContactConstraintPoint.prototype.velocityBias = undefined;
 
 Box2D.ControllerEdge = function(){
    this.__varz();
    this.__constructor.apply(this, arguments);
};
 
 Box2D.ControllerEdge.prototype.__constructor = function(){
};
 Box2D.ControllerEdge.prototype.__varz = function(){
};
Box2D.ControllerEdge.prototype.controller = undefined;
 Box2D.ControllerEdge.prototype.body = undefined;
 Box2D.ControllerEdge.prototype.prevBody = undefined;
 Box2D.ControllerEdge.prototype.nextBody = undefined;
 Box2D.ControllerEdge.prototype.prevController = undefined;
 Box2D.ControllerEdge.prototype.nextController = undefined;
 
 Box2D.DistanceInput = function(){
    this.__varz();
    this.__constructor.apply(this, arguments);
};
 
 Box2D.DistanceInput.prototype.__constructor = function(){
};
 Box2D.DistanceInput.prototype.__varz = function(){
};
Box2D.DistanceInput.prototype.proxyA = undefined;
 Box2D.DistanceInput.prototype.proxyB = undefined;
 Box2D.DistanceInput.prototype.transformA = undefined;
 Box2D.DistanceInput.prototype.transformB = undefined;
 Box2D.DistanceInput.prototype.useRadii = undefined;
 
 Box2D.Settings = function(){
    this.__varz();
    this.__constructor.apply(this, arguments);
};
 
 Box2D.Settings.prototype.__constructor = function(){
};
 Box2D.Settings.prototype.__varz = function(){
};
 Box2D.Settings.b2MixFriction = function(friction1, friction2){
    return Math.sqrt(friction1 * friction2);
};
 
 Box2D.Settings.b2MixRestitution = function(restitution1, restitution2){
    return restitution1 > restitution2 ? restitution1: restitution2;
};
 
 Box2D.Settings.b2Assert = function(a){
    if ( ! a){
        throw "Assertion Failed";
    }
};
 Box2D.Settings.VERSION = "2.1alpha";
 Box2D.Settings.USHRT_MAX = 65535;
 Box2D.Settings.b2_pi = Math.PI;
 Box2D.Settings.b2_maxManifoldPoints = 2;
 Box2D.Settings.b2_aabbExtension = 0.1;
 Box2D.Settings.b2_aabbMultiplier = 2;
 Box2D.Settings.b2_linearSlop = 0.005;
 Box2D.Settings.b2_angularSlop = 2 / 180 * Box2D.Settings.b2_pi;
 Box2D.Settings.b2_polygonRadius = 2 * Box2D.Settings.b2_linearSlop;
 Box2D.Settings.b2_toiSlop = 8 * Box2D.Settings.b2_linearSlop;
 Box2D.Settings.b2_maxTOIContactsPerIsland = 32;
 Box2D.Settings.b2_maxTOIJointsPerIsland = 32;
 Box2D.Settings.b2_velocityThreshold = 1;
 Box2D.Settings.b2_maxLinearCorrection = 0.2;
 Box2D.Settings.b2_maxAngularCorrection = 8 / 180 * Box2D.Settings.b2_pi;
 Box2D.Settings.b2_maxTranslation = 2;
 Box2D.Settings.b2_maxTranslationSquared = Box2D.Settings.b2_maxTranslation * Box2D.Settings.b2_maxTranslation;
 Box2D.Settings.b2_maxRotation = 0.5 * Box2D.Settings.b2_pi;
 Box2D.Settings.b2_maxRotationSquared = Box2D.Settings.b2_maxRotation * Box2D.Settings.b2_maxRotation;
 Box2D.Settings.b2_contactBaumgarte = 0.2;
 Box2D.Settings.b2_timeToSleep = 0.5;
 Box2D.Settings.b2_linearSleepTolerance = 0.01;
 Box2D.Settings.b2_angularSleepTolerance = 2 / 180 * Box2D.Settings.b2_pi;
 
 Box2D.Proxy = function(){
    this.__varz();
    this.__constructor.apply(this, arguments);
};
 
 Box2D.Proxy.prototype.__constructor = function(){
};
 Box2D.Proxy.prototype.__varz = function(){
    this.lowerBounds =[];
    this.upperBounds =[];
    this.pairs = {};
};
 
 Box2D.Proxy.prototype.IsValid = function(){
    return this.overlapCount != Box2D.BroadPhase.b2_invalid;
};
 Box2D.Proxy.prototype.lowerBounds =[];
 Box2D.Proxy.prototype.upperBounds =[];
 Box2D.Proxy.prototype.overlapCount = 0;
 Box2D.Proxy.prototype.timeStamp = 0;
 Box2D.Proxy.prototype.pairs = {};
 Box2D.Proxy.prototype.next = undefined;
 Box2D.Proxy.prototype.userData = undefined;
 
 Box2D.Point = function(){
    this.__varz();
    this.__constructor.apply(this, arguments);
};
 
 Box2D.Point.prototype.__constructor = function(){
};
 Box2D.Point.prototype.__varz = function(){
    this.p = new Box2D.Vec2();
};
 
 Box2D.Point.prototype.Support = function(xf, vX, vY){
    return this.p;
};
 
 Box2D.Point.prototype.GetFirstVertex = function(xf){
    return this.p;
};
 Box2D.Point.prototype.p = new Box2D.Vec2();
 
 Box2D.WorldManifold = function(){
    this.__varz();
    this.__constructor.apply(this, arguments);
};
 
 Box2D.WorldManifold.prototype.__constructor = function(){
    this.m_points =[];
    for (var i = 0;i < Box2D.Settings.b2_maxManifoldPoints;i++){
        this.m_points[i] = new Box2D.Vec2();
    }
};
 
 Box2D.WorldManifold.prototype.__varz = function(){
    this.m_normal = new Box2D.Vec2();
};
 
 Box2D.WorldManifold.prototype.Initialize = function(manifold, xfA, radiusA, xfB, radiusB){
    if (manifold.m_pointCount === 0){
        return;
    }
    var i = 0;
    var tVec;
    var tMat;
    var normalX;
    var normalY;
    var planePointX;
    var planePointY;
    var clipPointX;
    var clipPointY;
    switch (manifold.m_type){
        case Box2D.Manifold.e_circles: 
            tMat = xfA.R;
            tVec = manifold.m_localPoint;
            var pointAX = xfA.position.x + tMat.col1.x * tVec.x + tMat.col2.x * tVec.y;
            var pointAY = xfA.position.y + tMat.col1.y * tVec.x + tMat.col2.y * tVec.y;
            tMat = xfB.R;
            tVec = manifold.m_points[0].m_localPoint;
            var pointBX = xfB.position.x + tMat.col1.x * tVec.x + tMat.col2.x * tVec.y;
            var pointBY = xfB.position.y + tMat.col1.y * tVec.x + tMat.col2.y * tVec.y;
            var dX = pointBX - pointAX;
            var dY = pointBY - pointAY;
            var d2 = dX * dX + dY * dY;
            if (d2 > Number.MIN_VALUE * Number.MIN_VALUE){
                var d = Math.sqrt(d2);
                this.m_normal.x = dX / d;
                this.m_normal.y = dY / d;
            }
            else {
                this.m_normal.x = 1;
                this.m_normal.y = 0;
            }
            var cAX = pointAX + radiusA * this.m_normal.x;
            var cAY = pointAY + radiusA * this.m_normal.y;
            var cBX = pointBX - radiusB * this.m_normal.x;
            var cBY = pointBY - radiusB * this.m_normal.y;
            this.m_points[0].x = 0.5 * (cAX + cBX);
            this.m_points[0].y = 0.5 * (cAY + cBY);
            break;
        case Box2D.Manifold.e_faceA: 
            tMat = xfA.R;
            tVec = manifold.m_localPlaneNormal;
            normalX = tMat.col1.x * tVec.x + tMat.col2.x * tVec.y;
            normalY = tMat.col1.y * tVec.x + tMat.col2.y * tVec.y;
            tMat = xfA.R;
            tVec = manifold.m_localPoint;
            planePointX = xfA.position.x + tMat.col1.x * tVec.x + tMat.col2.x * tVec.y;
            planePointY = xfA.position.y + tMat.col1.y * tVec.x + tMat.col2.y * tVec.y;
            this.m_normal.x = normalX;
            this.m_normal.y = normalY;
            for (i = 0;i < manifold.m_pointCount;i++){
                tMat = xfB.R;
                tVec = manifold.m_points[i].m_localPoint;
                clipPointX = xfB.position.x + tMat.col1.x * tVec.x + tMat.col2.x * tVec.y;
                clipPointY = xfB.position.y + tMat.col1.y * tVec.x + tMat.col2.y * tVec.y;
                this.m_points[i].x = clipPointX + 0.5 * (radiusA - (clipPointX - planePointX) * normalX - (clipPointY - planePointY) * normalY - radiusB) * normalX;
                this.m_points[i].y = clipPointY + 0.5 * (radiusA - (clipPointX - planePointX) * normalX - (clipPointY - planePointY) * normalY - radiusB) * normalY;
            }
            break;
        case Box2D.Manifold.e_faceB: 
            tMat = xfB.R;
            tVec = manifold.m_localPlaneNormal;
            normalX = tMat.col1.x * tVec.x + tMat.col2.x * tVec.y;
            normalY = tMat.col1.y * tVec.x + tMat.col2.y * tVec.y;
            tMat = xfB.R;
            tVec = manifold.m_localPoint;
            planePointX = xfB.position.x + tMat.col1.x * tVec.x + tMat.col2.x * tVec.y;
            planePointY = xfB.position.y + tMat.col1.y * tVec.x + tMat.col2.y * tVec.y;
            this.m_normal.x = - normalX;
            this.m_normal.y = - normalY;
            for (i = 0;i < manifold.m_pointCount;i++){
                tMat = xfA.R;
                tVec = manifold.m_points[i].m_localPoint;
                clipPointX = xfA.position.x + tMat.col1.x * tVec.x + tMat.col2.x * tVec.y;
                clipPointY = xfA.position.y + tMat.col1.y * tVec.x + tMat.col2.y * tVec.y;
                this.m_points[i].x = clipPointX + 0.5 * (radiusB - (clipPointX - planePointX) * normalX - (clipPointY - planePointY) * normalY - radiusA) * normalX;
                this.m_points[i].y = clipPointY + 0.5 * (radiusB - (clipPointX - planePointX) * normalX - (clipPointY - planePointY) * normalY - radiusA) * normalY;
            }
            break;
    }
};
 Box2D.WorldManifold.prototype.m_normal = new Box2D.Vec2();
 Box2D.WorldManifold.prototype.m_points = undefined;
 
 Box2D.RayCastOutput = function()    {
    this.__varz();
    this.__constructor.apply(this, arguments);
};
 
 Box2D.RayCastOutput.prototype.__constructor = function(){
};
 Box2D.RayCastOutput.prototype.__varz = function(){
    this.normal = new Box2D.Vec2();
};
 Box2D.RayCastOutput.prototype.normal = new Box2D.Vec2();
 Box2D.RayCastOutput.prototype.fraction = undefined;
 
 Box2D.ConstantForceController = function(){
    Box2D.Controller.prototype.__varz.call(this);
    this.__varz();
    this.__constructor.apply(this, arguments);
};
 extend(Box2D.ConstantForceController.prototype, Box2D.Controller.prototype);
 Box2D.ConstantForceController.prototype._super = Box2D.Controller.prototype;
 
 Box2D.ConstantForceController.prototype.__constructor = function(){
    this._super.__constructor.apply(this, arguments);
};
 
 Box2D.ConstantForceController.prototype.__varz = function(){
    this.F = new Box2D.Vec2(0, 0);
};
 
 Box2D.ConstantForceController.prototype.Step = function(step){
    for (var i = this.m_bodyList;i;i = i.nextBody){
        var body = i.body;
        if ( ! body.IsAwake()){
            continue;
        }
        body.ApplyForce(this.F, body.GetWorldCenter());
    }
};
 Box2D.ConstantForceController.prototype.F = new Box2D.Vec2(0, 0);
 
 Box2D.MassData = function(){
    this.__varz();
    this.__constructor.apply(this, arguments);
};
 
 Box2D.MassData.prototype.__constructor = function(){
};
 Box2D.MassData.prototype.__varz = function(){
    this.center = new Box2D.Vec2(0, 0);
};
 Box2D.MassData.prototype.mass = 0;
 Box2D.MassData.prototype.center = new Box2D.Vec2(0, 0);
 Box2D.MassData.prototype.I = 0;
 
 Box2D.DynamicTree = function(){
    this.__varz();
    this.__constructor.apply(this, arguments);
};
 
 Box2D.DynamicTree.prototype.__constructor = function(){
    this.m_root = undefined;
    this.m_freeList = undefined;
    this.m_path = 0;
    this.m_insertionCount = 0;
};
 
 Box2D.DynamicTree.prototype.__varz = function(){
};
 Box2D.DynamicTree.prototype.AllocateNode = function(){
    if (this.m_freeList){
        var node = this.m_freeList;
        this.m_freeList = node.parent;
        node.parent = undefined;
        node.child1 = undefined;
        node.child2 = undefined;
        return node;
    }
    return new Box2D.DynamicTreeNode();
};
 
 Box2D.DynamicTree.prototype.FreeNode = function(node)    {
    node.parent = this.m_freeList;
    this.m_freeList = node;
};
 
 Box2D.DynamicTree.prototype.InsertLeaf = function(leaf){
    ++ this.m_insertionCount;
    if (typeof this.m_root === "undefined"){
        this.m_root = leaf;
        this.m_root.parent = undefined;
        return;
    }
    var center = leaf.aabb.GetCenter();
    var sibling = this.m_root;
    if (sibling.IsLeaf() === false){
        do {
            var child1 = sibling.child1;
            var child2 = sibling.child2;
            var norm1 = Math.abs((child1.aabb.lowerBound.x + child1.aabb.upperBound.x) / 2 - center.x) + Math.abs((child1.aabb.lowerBound.y + child1.aabb.upperBound.y) / 2 - center.y);
            var norm2 = Math.abs((child2.aabb.lowerBound.x + child2.aabb.upperBound.x) / 2 - center.x) + Math.abs((child2.aabb.lowerBound.y + child2.aabb.upperBound.y) / 2 - 
               center.y);
            if (norm1 < norm2){
                sibling = child1;
            }
            else {
                sibling = child2;
            }
        }while (sibling.IsLeaf() === false);
    }
    var node1 = sibling.parent;
    var node2 = this.AllocateNode();
    node2.parent = node1;
    node2.userData = undefined;
    node2.aabb.Combine(leaf.aabb, sibling.aabb);
    if (node1){
        if (sibling.parent.child1 == sibling){
            node1.child1 = node2;
        }
        else {
            node1.child2 = node2;
        }
        node2.child1 = sibling;
        node2.child2 = leaf;
        sibling.parent = node2;
        leaf.parent = node2;
        do {
            if (node1.aabb.Contains(node2.aabb)){
                break;
            }
            node1.aabb.Combine(node1.child1.aabb, node1.child2.aabb);
            node2 = node1;
            node1 = node1.parent;
        }while (node1);
    }
    else {
        node2.child1 = sibling;
        node2.child2 = leaf;
        sibling.parent = node2;
        leaf.parent = node2;
        this.m_root = node2;
    }
};
 
 Box2D.DynamicTree.prototype.RemoveLeaf = function(leaf){
    if (leaf == this.m_root){
        this.m_root = undefined;
        return;
    }
    var node2 = leaf.parent;
    var node1 = node2.parent;
    var sibling;
    if (node2.child1 == leaf){
        sibling = node2.child2;
    }
    else {
        sibling = node2.child1;
    }
    if (node1){
        if (node1.child1 == node2){
            node1.child1 = sibling;
        }
        else {
            node1.child2 = sibling;
        }
        sibling.parent = node1;
        this.FreeNode(node2);
        while (node1){
            var oldAABB = node1.aabb;
            node1.aabb = Box2D.AABB.Combine(node1.child1.aabb, node1.child2.aabb);
            if (oldAABB.Contains(node1.aabb)){
                break;
            }
            node1 = node1.parent;
        }
    }
    else {
        this.m_root = sibling;
        sibling.parent = undefined;
        this.FreeNode(node2);
    }
};
 
 Box2D.DynamicTree.prototype.CreateProxy = function(aabb, userData){
    var node = this.AllocateNode();
    var extendX = Box2D.Settings.b2_aabbExtension;
    var extendY = Box2D.Settings.b2_aabbExtension;
    node.aabb.lowerBound.x = aabb.lowerBound.x - extendX;
    node.aabb.lowerBound.y = aabb.lowerBound.y - extendY;
    node.aabb.upperBound.x = aabb.upperBound.x + extendX;
    node.aabb.upperBound.y = aabb.upperBound.y + extendY;
    node.userData = userData;
    this.InsertLeaf(node);
    return node;
};
 
 Box2D.DynamicTree.prototype.DestroyProxy = function(proxy){
    this.RemoveLeaf(proxy);
    this.FreeNode(proxy);
};
 
 Box2D.DynamicTree.prototype.MoveProxy = function(proxy, aabb, displacement){
    Box2D.Settings.b2Assert(proxy.IsLeaf());
    if (proxy.aabb.Contains(aabb)){
        return false;
    }
    this.RemoveLeaf(proxy);
    var extendX = Box2D.Settings.b2_aabbExtension + Box2D.Settings.b2_aabbMultiplier * (displacement.x > 0 ? 
       displacement.x: - displacement.x);
    var extendY = Box2D.Settings.b2_aabbExtension + Box2D.Settings.b2_aabbMultiplier * (displacement.y > 0 ? 
       displacement.y: - displacement.y);
    proxy.aabb.lowerBound.x = aabb.lowerBound.x - extendX;
    proxy.aabb.lowerBound.y = aabb.lowerBound.y - extendY;
    proxy.aabb.upperBound.x = aabb.upperBound.x + extendX;
    proxy.aabb.upperBound.y = aabb.upperBound.y + extendY;
    this.InsertLeaf(proxy);
    return true;
};
 
 Box2D.DynamicTree.prototype.Rebalance = function(iterations){
    if (typeof this.m_root === "undefined"){
        return;
    }
    for (var i = 0;i < iterations;i++){
        var node = this.m_root;
        var bit = 0;
        while (node.IsLeaf() === false){
            node = this.m_path >> bit & 1 ? node.child2: node.child1;
            bit = bit + 1 & 31;
        }
        ++ this.m_path;
        this.RemoveLeaf(node);
        this.InsertLeaf(node);
    }
};
 
 Box2D.DynamicTree.prototype.GetFatAABB = function(proxy){
    return proxy.aabb;
};
 
 Box2D.DynamicTree.prototype.GetUserData = function(proxy){
    return proxy.userData;
};
 
 Box2D.DynamicTree.prototype.Query = function(callback, aabb){
    if (typeof this.m_root === "undefined"){
        return;
    }
    var stack =[];
    var count = 0;
    stack[count++] = this.m_root;
    while (count > 0){
        var node = stack[ -- count];
        if (node.aabb.TestOverlap(aabb)){
            if (node.IsLeaf()){
                var proceed = callback(node);
                if ( ! proceed){
                    return;
                }
            }
            else {
                stack[count++] = node.child1;
                stack[count++] = node.child2;
            }
        }
    }
};
 
 Box2D.DynamicTree.prototype.RayCast = function(callback, input){
    if (typeof this.m_root === "undefined"){
        return;
    }
    var p1 = input.p1;
    var p2 = input.p2;
    var r = Box2D.Math.SubtractVV(p1, p2);
    r.Normalize();
    var v = Box2D.Math.CrossFV(1, r);
    var abs_v = Box2D.Math.AbsV(v);
    var maxFraction = input.maxFraction;
    var segmentAABB = new Box2D.AABB();
    var tX;
    var tY;
    tX = p1.x + maxFraction * (p2.x - p1.x);
    tY = p1.y + maxFraction * (p2.y - p1.y);
    segmentAABB.lowerBound.x = Math.min(p1.x, tX);
    segmentAABB.lowerBound.y = Math.min(p1.y, tY);
    segmentAABB.upperBound.x = Math.max(p1.x, tX);
    segmentAABB.upperBound.y = Math.max(p1.y, tY);
    var stack =[];
    var count = 0;
    stack[count++] = this.m_root;
    while (count > 0)        {
        var node = stack[ -- count];
        if (node.aabb.TestOverlap(segmentAABB) === false){
            continue;
        }
        var c = node.aabb.GetCenter();
        var h = node.aabb.GetExtents();
        var separation = Math.abs(v.x * (p1.x - c.x) + v.y * (p1.y - c.y)) - abs_v.x * h.x - abs_v.y * h.y;
        if (separation > 0){
            continue;
        }
        if (node.IsLeaf()){
            var subInput = new Box2D.RayCastInput();
            subInput.p1 = input.p1;
            subInput.p2 = input.p2;
            subInput.maxFraction = input.maxFraction;
            maxFraction = callback(subInput, node);
            if (maxFraction === 0){
                return;
            }
            tX = p1.x + maxFraction * (p2.x - p1.x);
            tY = p1.y + maxFraction * (p2.y - p1.y);
            segmentAABB.lowerBound.x = Math.min(p1.x, tX);
            segmentAABB.lowerBound.y = Math.min(p1.y, tY);
            segmentAABB.upperBound.x = Math.max(p1.x, tX);
            segmentAABB.upperBound.y = Math.max(p1.y, tY);
        }
        else {
            stack[count++] = node.child1;
            stack[count++] = node.child2;
        }
    }
};
 Box2D.DynamicTree.prototype.m_root = undefined;
 Box2D.DynamicTree.prototype.m_freeList = undefined;
 Box2D.DynamicTree.prototype.m_path = 0;
 Box2D.DynamicTree.prototype.m_insertionCount = 0;
 
 Box2D.JointEdge = function(){
    this.__varz();
    this.__constructor.apply(this, arguments);
};
 
 Box2D.JointEdge.prototype.__constructor = function(){
};
 Box2D.JointEdge.prototype.__varz = function(){
};
Box2D.JointEdge.prototype.other = undefined;
 Box2D.JointEdge.prototype.joint = undefined;
 Box2D.JointEdge.prototype.prev = undefined;
 Box2D.JointEdge.prototype.next = undefined;
 
 Box2D.RayCastInput = function(){
    this.__varz();
    this.__constructor.apply(this, arguments);
};
 
 Box2D.RayCastInput.prototype.__constructor = function(p1, p2, maxFraction){
    if (p1){
        this.p1.SetV(p1);
    }
    if (p2){
        this.p2.SetV(p2);
    }
    if (maxFraction){
        this.maxFraction = maxFraction;
    }
};
 
 Box2D.RayCastInput.prototype.__varz = function(){
    this.p1 = new Box2D.Vec2();
    this.p2 = new Box2D.Vec2();
};
 Box2D.RayCastInput.prototype.p1 = new Box2D.Vec2();
 Box2D.RayCastInput.prototype.p2 = new Box2D.Vec2();
 Box2D.RayCastInput.prototype.maxFraction = undefined;
 
 var Features = function(){
    this.__varz();
    this.__constructor.apply(this, arguments);
};
 
 Features.prototype.__constructor = function(){
};
 Features.prototype.__varz = function(){
};Features.prototype.__defineGetter__("referenceEdge", function(){
    return this._referenceEdge;
});
 Features.prototype.__defineSetter__("referenceEdge", function(value){
    this._referenceEdge = value;
    this._m_id._key = this._m_id._key & 4294967040 | this._referenceEdge & 255;
});
 Features.prototype.__defineGetter__("incidentEdge", function(){
    return this._incidentEdge;
});
 Features.prototype.__defineSetter__("incidentEdge", function(value){
    this._incidentEdge = value;
    this._m_id._key = this._m_id._key & 4294902015 | this._incidentEdge << 8 & 65280;
});
 Features.prototype.__defineGetter__("incidentVertex", function(){
    return this._incidentVertex;
});
 Features.prototype.__defineSetter__("incidentVertex", function(value){
    this._incidentVertex = value;
    this._m_id._key = this._m_id._key & 4278255615 | this._incidentVertex << 16 & 16711680;
});
 Features.prototype.__defineGetter__("flip", function(){
    return this._flip;
});
 Features.prototype.__defineSetter__("flip", function(value){
    this._flip = value;
    this._m_id._key = this._m_id._key & 16777215 | this._flip << 24 & 4278190080;
});
 Features.prototype._referenceEdge = 0;
 Features.prototype._incidentEdge = 0;
 Features.prototype._incidentVertex = 0;
 Features.prototype._flip = 0;
 Features.prototype._m_id = undefined;
 
 Box2D.FilterData = function(){
    this.__varz();
    this.__constructor.apply(this, arguments);
};
 
 Box2D.FilterData.prototype.__constructor = function(){
};
 Box2D.FilterData.prototype.__varz = function(){
    this.categoryBits = 1;
    this.maskBits = 65535;
};
 
 Box2D.FilterData.prototype.Copy = function(){
    var copy = new Box2D.FilterData();
    copy.categoryBits = this.categoryBits;
    copy.maskBits = this.maskBits;
    copy.groupIndex = this.groupIndex;
    return copy;
};
 Box2D.FilterData.prototype.categoryBits = 1;
 Box2D.FilterData.prototype.maskBits = 65535;
 Box2D.FilterData.prototype.groupIndex = 0;
 
 Box2D.AABB = function(){
    this.__varz();
    this.__constructor.apply(this, arguments);
};
 
 Box2D.AABB.prototype.__constructor = function(){
};
 Box2D.AABB.prototype.__varz = function(){
    this.lowerBound = new Box2D.Vec2();
    this.upperBound = new Box2D.Vec2();
};
 
 Box2D.AABB.Combine = function(aabb1, aabb2){
    var aabb = new Box2D.AABB();
    aabb.Combine(aabb1, aabb2);
    return aabb;
};
 
 Box2D.AABB.prototype.IsValid = function(){
    var dX = this.upperBound.x - this.lowerBound.x;
    var dY = this.upperBound.y - this.lowerBound.y;
    var valid = dX >= 0 && dY >= 0;
    valid = valid && this.lowerBound.IsValid() && this.upperBound.IsValid();
    return valid;
};
 
 Box2D.AABB.prototype.GetCenter = function(){
    return new Box2D.Vec2((this.lowerBound.x + this.upperBound.x) / 2, (this.lowerBound.y + this.upperBound.y) / 2);
};
 
 Box2D.AABB.prototype.GetExtents = function(){
    return new Box2D.Vec2((this.upperBound.x - this.lowerBound.x) / 2, (this.upperBound.y - this.lowerBound.y) / 2);
};
 
 Box2D.AABB.prototype.Contains = function(aabb){
    var result = true && this.lowerBound.x <= aabb.lowerBound.x && this.lowerBound.y <= aabb.lowerBound.y && aabb.upperBound.x <= 
       this.upperBound.x && aabb.upperBound.y <= this.upperBound.y;
    return result;
};
 
 Box2D.AABB.prototype.RayCast = function(output, input){
    var tmin = - Number.MAX_VALUE;
    var tmax = Number.MAX_VALUE;
    var pX = input.p1.x;
    var pY = input.p1.y;
    var dX = input.p2.x - input.p1.x;
    var dY = input.p2.y - input.p1.y;
    var absDX = Math.abs(dX);
    var absDY = Math.abs(dY);
    var normal = output.normal;
    var inv_d;
    var t1;
    var t2;
    var t3;
    var s;
    if (absDX < Number.MIN_VALUE){
        if (pX < this.lowerBound.x || this.upperBound.x < pX){
            return false;
        }
    }
    else {
        inv_d = 1 / dX;
        t1 = (this.lowerBound.x - pX) * inv_d;
        t2 = (this.upperBound.x - pX) * inv_d;
        s = - 1;
        if (t1 > t2){
            t3 = t1;
            t1 = t2;
            t2 = t3;
            s = 1;
        }
        if (t1 > tmin){
            normal.x = s;
            normal.y = 0;
            tmin = t1;
        }
        tmax = Math.min(tmax, t2);
        if (tmin > tmax){
            return false;
        }
    }
    if (absDY < Number.MIN_VALUE){
        if (pY < this.lowerBound.y || this.upperBound.y < pY){
            return false;
        }
    }
    else {
        inv_d = 1 / dY;
        t1 = (this.lowerBound.y - pY) * inv_d;
        t2 = (this.upperBound.y - pY) * inv_d;
        s = - 1;
        if (t1 > t2){
            t3 = t1;
            t1 = t2;
            t2 = t3;
            s = 1;
        }
        if (t1 > tmin){
            normal.y = s;
            normal.x = 0;
            tmin = t1;
        }
        tmax = Math.min(tmax, t2);
        if (tmin > tmax){
            return false;
        }
    }
    output.fraction = tmin;
    return true;
};
 
 Box2D.AABB.prototype.TestOverlap = function(other){
    var d1X = other.lowerBound.x - this.upperBound.x;
    var d1Y = other.lowerBound.y - this.upperBound.y;
    var d2X = this.lowerBound.x - other.upperBound.x;
    var d2Y = this.lowerBound.y - other.upperBound.y;
    if (d1X > 0 || d1Y > 0){
        return false;
    }
    if (d2X > 0 || d2Y > 0){
        return false;
    }
    return true;
};
 
 Box2D.AABB.prototype.Combine = function(aabb1, aabb2){
    this.lowerBound.x = Math.min(aabb1.lowerBound.x, aabb2.lowerBound.x);
    this.lowerBound.y = Math.min(aabb1.lowerBound.y, aabb2.lowerBound.y);
    this.upperBound.x = Math.max(aabb1.upperBound.x, aabb2.upperBound.x);
    this.upperBound.y = Math.max(aabb1.upperBound.y, aabb2.upperBound.y);
};
 Box2D.AABB.prototype.lowerBound = new Box2D.Vec2();
 Box2D.AABB.prototype.upperBound = new Box2D.Vec2();
 
 Box2D.Jacobian = function(){
    this.__varz();
    this.__constructor.apply(this, arguments);
};
 
 Box2D.Jacobian.prototype.__constructor = function(){
};
 Box2D.Jacobian.prototype.__varz = function(){
    this.linearA = new Box2D.Vec2();
    this.linearB = new Box2D.Vec2();
};
 
 Box2D.Jacobian.prototype.SetZero = function(){
    this.linearA.SetZero();
    this.angularA = 0;
    this.linearB.SetZero();
    this.angularB = 0;
};
 
 Box2D.Jacobian.prototype.Set = function(x1, a1, x2, a2){
    this.linearA.SetV(x1);
    this.angularA = a1;
    this.linearB.SetV(x2);
    this.angularB = a2;
};
 
 Box2D.Jacobian.prototype.Compute = function(x1, a1, x2, a2){
    return this.linearA.x * x1.x + this.linearA.y * x1.y + this.angularA * a1 + (this.linearB.x * x2.x + this.linearB.y * 
       x2.y) + this.angularB * a2;
};
 Box2D.Jacobian.prototype.linearA = new Box2D.Vec2();
 Box2D.Jacobian.prototype.angularA = undefined;
 Box2D.Jacobian.prototype.linearB = new Box2D.Vec2();
 Box2D.Jacobian.prototype.angularB = undefined;
 
 Box2D.Bound = function(){
    this.__varz();
    this.__constructor.apply(this, arguments);
};
 
 Box2D.Bound.prototype.__constructor = function(){
};
 Box2D.Bound.prototype.__varz = function(){
};
 Box2D.Bound.prototype.IsLower = function(){
    return (this.value & 1) === 0;
};
 
 Box2D.Bound.prototype.IsUpper = function(){
    return (this.value & 1) == 1;
};
 
 Box2D.Bound.prototype.Swap = function(b){
    var tempValue = this.value;
    var tempProxy = this.proxy;
    var tempStabbingCount = this.stabbingCount;
    this.value = b.value;
    this.proxy = b.proxy;
    this.stabbingCount = b.stabbingCount;
    b.value = tempValue;
    b.proxy = tempProxy;
    b.stabbingCount = tempStabbingCount;
};
 Box2D.Bound.prototype.value = 0;
 Box2D.Bound.prototype.proxy = undefined;
 Box2D.Bound.prototype.stabbingCount = 0;
 
 Box2D.SimplexVertex = function(){
    this.__varz();
    this.__constructor.apply(this, arguments);
};
 
 Box2D.SimplexVertex.prototype.__constructor = function(){
};
 Box2D.SimplexVertex.prototype.__varz = function(){
};
 Box2D.SimplexVertex.prototype.Set = function(other){
    this.wA.SetV(other.wA);
    this.wB.SetV(other.wB);
    this.w.SetV(other.w);
    this.a = other.a;
    this.indexA = other.indexA;
    this.indexB = other.indexB;
};
 Box2D.SimplexVertex.prototype.wA = undefined;
 Box2D.SimplexVertex.prototype.wB = undefined;
 Box2D.SimplexVertex.prototype.w = undefined;
 Box2D.SimplexVertex.prototype.a = undefined;
 Box2D.SimplexVertex.prototype.indexA = 0;
 Box2D.SimplexVertex.prototype.indexB = 0;
 
 Box2D.Mat22 = function(){
    this.__varz();
    this.__constructor.apply(this, arguments);
};
 
 Box2D.Mat22.prototype.__constructor = function(){
    this.col1.x = this.col2.y = 1;
};
 
 Box2D.Mat22.prototype.__varz = function(){
    this.col1 = new Box2D.Vec2();
    this.col2 = new Box2D.Vec2();
};
 
 Box2D.Mat22.FromAngle = function(angle){
    var mat = new Box2D.Mat22();
    mat.Set(angle);
    return mat;
};
 
 Box2D.Mat22.FromVV = function(c1, c2){
    var mat = new Box2D.Mat22();
    mat.SetVV(c1, c2);
    return mat;
};
 
 Box2D.Mat22.prototype.Set = function(angle){
    var c = Math.cos(angle);
    var s = Math.sin(angle);
    this.col1.x = c;
    this.col2.x = - s;
    this.col1.y = s;
    this.col2.y = c;
};
 
 Box2D.Mat22.prototype.SetVV = function(c1, c2){
    this.col1.SetV(c1);
    this.col2.SetV(c2);
};
 
 Box2D.Mat22.prototype.Copy = function(){
    var mat = new Box2D.Mat22();
    mat.SetM(this);
    return mat;
};
 
 Box2D.Mat22.prototype.SetM = function(m){
    this.col1.SetV(m.col1);
    this.col2.SetV(m.col2);
};
 
 Box2D.Mat22.prototype.AddM = function(m){
    this.col1.x += m.col1.x;
    this.col1.y += m.col1.y;
    this.col2.x += m.col2.x;
    this.col2.y += m.col2.y;
};
 
 Box2D.Mat22.prototype.SetIdentity = function(){
    this.col1.x = 1;
    this.col2.x = 0;
    this.col1.y = 0;
    this.col2.y = 1;
};
 
 Box2D.Mat22.prototype.SetZero = function(){
    this.col1.x = 0;
    this.col2.x = 0;
    this.col1.y = 0;
    this.col2.y = 0;
};
 
 Box2D.Mat22.prototype.GetAngle = function(){
    return Math.atan2(this.col1.y, this.col1.x);
};
 
 Box2D.Mat22.prototype.GetInverse = function(out){
    var a = this.col1.x;
    var b = this.col2.x;
    var c = this.col1.y;
    var d = this.col2.y;
    var det = a * d - b * c;
    if (det !== 0){
        det = 1 / det;
    }
    out.col1.x = det * d;
    out.col2.x = - det * b;
    out.col1.y = - det * c;
    out.col2.y = det * a;
    return out;
};
 
 Box2D.Mat22.prototype.Solve = function(out, bX, bY){
    var a11 = this.col1.x;
    var a12 = this.col2.x;
    var a21 = this.col1.y;
    var a22 = this.col2.y;
    var det = a11 * a22 - a12 * a21;
    if (det !== 0){
        det = 1 / det;
    }
    out.x = det * (a22 * bX - a12 * bY);
    out.y = det * (a11 * bY - a21 * bX);
    return out;
};
 
 Box2D.Mat22.prototype.Abs = function(){
    this.col1.Abs();
    this.col2.Abs();
};
 Box2D.Mat22.prototype.col1 = new Box2D.Vec2();
 Box2D.Mat22.prototype.col2 = new Box2D.Vec2();
 
 Box2D.SimplexCache = function(){
    this.__varz();
    this.__constructor.apply(this, arguments);
};
 
 Box2D.SimplexCache.prototype.__constructor = function(){
};
 Box2D.SimplexCache.prototype.__varz = function(){
    this.indexA =[];
    this.indexB =[];
};
 Box2D.SimplexCache.prototype.metric = undefined;
 Box2D.SimplexCache.prototype.count = 0;
 Box2D.SimplexCache.prototype.indexA =[];
 Box2D.SimplexCache.prototype.indexB =[];
 
 Box2D.Shape = function(){
    this.__varz();
    this.__constructor.apply(this, arguments);
};
 
 Box2D.Shape.prototype.__constructor = function(){
    this.m_type = Box2D.Shape.e_unknownShape;
    this.m_radius = Box2D.Settings.b2_linearSlop;
};
 
 Box2D.Shape.prototype.__varz = function(){
};
 Box2D.Shape.TestOverlap = function(shape1, transform1, shape2, transform2){
    var input = new Box2D.DistanceInput();
    input.proxyA = new Box2D.DistanceProxy();
    input.proxyA.Set(shape1);
    input.proxyB = new Box2D.DistanceProxy();
    input.proxyB.Set(shape2);
    input.transformA = transform1;
    input.transformB = transform2;
    input.useRadii = true;
    var simplexCache = new Box2D.SimplexCache();
    simplexCache.count = 0;
    var output = new Box2D.DistanceOutput();
    Box2D.Distance.Distance(output, simplexCache, input);
    return output.distance < 10 * Number.MIN_VALUE;
};
 Box2D.Shape.e_hitCollide = 1;
 Box2D.Shape.e_missCollide = 0;
 Box2D.Shape.e_startsInsideCollide = - 1;
 Box2D.Shape.e_unknownShape = - 1;
 Box2D.Shape.e_circleShape = 0;
 Box2D.Shape.e_polygonShape = 1;
 Box2D.Shape.e_edgeShape = 2;
 Box2D.Shape.e_shapeTypeCount = 3;
 
 Box2D.Shape.prototype.Copy = function(){
    return undefined;
};
 
 Box2D.Shape.prototype.Set = function(other){
    this.m_radius = other.m_radius;
};
 
 Box2D.Shape.prototype.GetType = function(){
    return this.m_type;
};
 
 Box2D.Shape.prototype.TestPoint = function(xf, p){
    return false;
};
 
 Box2D.Shape.prototype.RayCast = function(output, input, transform){
    return false;
};
 
 Box2D.Shape.prototype.ComputeAABB = function(aabb, xf){
};
 Box2D.Shape.prototype.ComputeMass = function(massData, density){
};
 Box2D.Shape.prototype.ComputeSubmergedArea = function(normal, offset, xf, c){
    return 0;
};
 Box2D.Shape.prototype.m_type = 0;
 Box2D.Shape.prototype.m_radius = undefined;
 
 Box2D.Segment = function(){
    this.__varz();
    this.__constructor.apply(this, arguments);
};
 
 Box2D.Segment.prototype.__constructor = function(){
};
 Box2D.Segment.prototype.__varz = function(){
    this.p1 = new Box2D.Vec2();
    this.p2 = new Box2D.Vec2();
};
 
 Box2D.Segment.prototype.TestSegment = function(lambda, normal, segment, maxLambda){
    var s = segment.p1;
    var rX = segment.p2.x - s.x;
    var rY = segment.p2.y - s.y;
    var dX = this.p2.x - this.p1.x;
    var dY = this.p2.y - this.p1.y;
    var nX = dY;
    var nY = - dX;
    var k_slop = 100 * Number.MIN_VALUE;
    var denom = - (rX * nX + rY * nY);
    if (denom > k_slop){
        var bX = s.x - this.p1.x;
        var bY = s.y - this.p1.y;
        var a = bX * nX + bY * nY;
        if (0 <= a && a <= maxLambda * denom){
            var mu2 = - rX * bY + rY * bX;
            if ( - k_slop * denom <= mu2 && mu2 <= denom * (1 + k_slop)){
                a /= denom;
                var nLen = Math.sqrt(nX * nX + nY * nY);
                nX /= nLen;
                nY /= nLen;
                lambda[0] = a;
                normal.Set(nX, nY);
                return true;
            }
        }
    }
    return false;
};
 
 Box2D.Segment.prototype.Extend = function(aabb){
    this.ExtendForward(aabb);
    this.ExtendBackward(aabb);
};
 
 Box2D.Segment.prototype.ExtendForward = function(aabb){
    var dX = this.p2.x - this.p1.x;
    var dY = this.p2.y - this.p1.y;
    var lambda = Math.min(dX > 0 ? (aabb.upperBound.x - this.p1.x) / dX: dX < 0 ? (aabb.lowerBound.x - this.p1.x) / dX: Number.POSITIVE_INFINITY, dY > 0 ? (aabb.upperBound.y - this.p1.y) / dY: dY < 0 ? (aabb.lowerBound.y - 
       this.p1.y) / dY: Number.POSITIVE_INFINITY);
    this.p2.x = this.p1.x + dX * lambda;
    this.p2.y = this.p1.y + dY * lambda;
};
 
 Box2D.Segment.prototype.ExtendBackward = function(aabb){
    var dX = - this.p2.x + this.p1.x;
    var dY = - this.p2.y + this.p1.y;
    var lambda = Math.min(dX > 0 ? (aabb.upperBound.x - this.p2.x) / dX: dX < 0 ? (aabb.lowerBound.x - this.p2.x) / dX: Number.POSITIVE_INFINITY, dY > 0 ? (aabb.upperBound.y - this.p2.y) / dY: dY < 0 ? 
       (aabb.lowerBound.y - this.p2.y) / dY: Number.POSITIVE_INFINITY);
    this.p1.x = this.p2.x + dX * lambda;
    this.p1.y = this.p2.y + dY * lambda;
};
 Box2D.Segment.prototype.p1 = new Box2D.Vec2();
 Box2D.Segment.prototype.p2 = new Box2D.Vec2();
 
 Box2D.ContactRegister = function(){
    this.__varz();
    this.__constructor.apply(this, arguments);
};
 
 Box2D.ContactRegister.prototype.__constructor = function(){
};
 Box2D.ContactRegister.prototype.__varz = function(){
};
Box2D.ContactRegister.prototype.createFcn = undefined;
 Box2D.ContactRegister.prototype.destroyFcn = undefined;
 Box2D.ContactRegister.prototype.primary = undefined;
 Box2D.ContactRegister.prototype.pool = undefined;
 Box2D.ContactRegister.prototype.poolCount = 0;
 
 Box2D.DebugDraw = function(){
    this.__varz();
    this.__constructor.apply(this, arguments);
};
 
 Box2D.DebugDraw.prototype.__constructor = function(){
    this.m_drawFlags = 0;
};
 
 Box2D.DebugDraw.prototype.__varz = function(){
};
Box2D.DebugDraw.e_shapeBit = 1;
 Box2D.DebugDraw.e_jointBit = 2;
 Box2D.DebugDraw.e_aabbBit = 4;
 Box2D.DebugDraw.e_pairBit = 8;
 Box2D.DebugDraw.e_centerOfMassBit = 16;
 Box2D.DebugDraw.e_controllerBit = 32;
 
 Box2D.DebugDraw.prototype.SetFlags = function(flags){
    this.m_drawFlags = flags;
};
 
 Box2D.DebugDraw.prototype.GetFlags = function(){
    return this.m_drawFlags;
};
 
 Box2D.DebugDraw.prototype.AppendFlags = function(flags){
    this.m_drawFlags |= flags;
};
 
 Box2D.DebugDraw.prototype.ClearFlags = function(flags){
    this.m_drawFlags &= ~ flags;
};
 
 Box2D.DebugDraw.prototype.SetSprite = function(sprite){
    this.m_sprite = sprite;
};
 
 Box2D.DebugDraw.prototype.GetSprite = function(){
    return this.m_sprite;
};
 
 Box2D.DebugDraw.prototype.SetDrawScale = function(drawScale){
    this.m_drawScale = drawScale;
};
 
 Box2D.DebugDraw.prototype.GetDrawScale = function(){
    return this.m_drawScale;
};
 
 Box2D.DebugDraw.prototype.SetLineThickness = function(lineThickness){
    this.m_lineThickness = lineThickness;
};
 
 Box2D.DebugDraw.prototype.GetLineThickness = function(){
    return this.m_lineThickness;
};
 
 Box2D.DebugDraw.prototype.SetAlpha = function(alpha){
    this.m_alpha = alpha;
};
 
 Box2D.DebugDraw.prototype.GetAlpha = function(){
    return this.m_alpha;
};
 
 Box2D.DebugDraw.prototype.SetFillAlpha = function(alpha){
    this.m_fillAlpha = alpha;
};
 
 Box2D.DebugDraw.prototype.GetFillAlpha = function(){
    return this.m_fillAlpha;
};
 
 Box2D.DebugDraw.prototype.SetXFormScale = function(xformScale){
    this.m_xformScale = xformScale;
};
 
 Box2D.DebugDraw.prototype.GetXFormScale = function(){
    return this.m_xformScale;
};
 
 Box2D.DebugDraw.prototype.Clear = function(){
    this.m_sprite.clearRect(0, 0, this.m_sprite.canvas.width, this.m_sprite.canvas.height);
};
 
 Box2D.DebugDraw.prototype.Y = function(y){
    return this.m_sprite.canvas.height - y;
};
 
 Box2D.DebugDraw.prototype.ToWorldPoint = function(localPoint){
    return new Box2D.Vec2(localPoint.x / this.m_drawScale, this.Y(localPoint.y) / this.m_drawScale);
};
 
 Box2D.DebugDraw.prototype.ColorStyle = function(color, alpha){
    return "rgba(" + color.r +", " + color.g +", " + color.b +", " + alpha +")";
};
 
 Box2D.DebugDraw.prototype.DrawPolygon = function(vertices, vertexCount, color){
    this.m_sprite.graphics.lineStyle(this.m_lineThickness, color.color, this.m_alpha);
    this.m_sprite.graphics.moveTo(vertices[0].x * this.m_drawScale, vertices[0].y * this.m_drawScale);
    for (var i = 1;i < vertexCount;i++){
        this.m_sprite.graphics.lineTo(vertices[i].x * this.m_drawScale, vertices[i].y * this.m_drawScale);
    }
    this.m_sprite.graphics.lineTo(vertices[0].x * this.m_drawScale, vertices[0].y * this.m_drawScale);
};
 
 Box2D.DebugDraw.prototype.DrawSolidPolygon = function(vertices, vertexCount, color){
    this.m_sprite.strokeStyle = this.ColorStyle(color, this.m_alpha);
    this.m_sprite.lineWidth = this.m_lineThickness;
    this.m_sprite.fillStyle = this.ColorStyle(color, this.m_fillAlpha);
    this.m_sprite.beginPath();
    this.m_sprite.moveTo(vertices[0].x * this.m_drawScale, this.Y(vertices[0].y * this.m_drawScale));
    for (var i = 1;i < vertexCount;i++){
        this.m_sprite.lineTo(vertices[i].x * this.m_drawScale, this.Y(vertices[i].y * this.m_drawScale));
    }
    this.m_sprite.lineTo(vertices[0].x * this.m_drawScale, this.Y(vertices[0].y * this.m_drawScale));
    this.m_sprite.fill();
    this.m_sprite.stroke();
    this.m_sprite.closePath();
};
 
 Box2D.DebugDraw.prototype.DrawCircle = function(center, radius, color){
    this.m_sprite.graphics.lineStyle(this.m_lineThickness, color.color, this.m_alpha);
    this.m_sprite.graphics.drawCircle(center.x * this.m_drawScale, center.y * this.m_drawScale, radius * this.m_drawScale);
};
 
 Box2D.DebugDraw.prototype.DrawSolidCircle = function(center, radius, axis, color){
    this.m_sprite.strokeStyle = this.ColorStyle(color, this.m_alpha);
    this.m_sprite.lineWidth = this.m_lineThickness;
    this.m_sprite.fillStyle = this.ColorStyle(color, this.m_fillAlpha);
    this.m_sprite.beginPath();
    this.m_sprite.arc(center.x * this.m_drawScale, this.Y(center.y * this.m_drawScale), radius * this.m_drawScale, 0, 
       Math.PI * 2, true);
    this.m_sprite.fill();
    this.m_sprite.stroke();
    this.m_sprite.closePath();
};
 
 Box2D.DebugDraw.prototype.DrawSegment = function(p1, p2, color){
    this.m_sprite.lineWidth = this.m_lineThickness;
    this.m_sprite.strokeStyle = this.ColorStyle(color, this.m_alpha);
    this.m_sprite.beginPath();
    this.m_sprite.moveTo(p1.x * this.m_drawScale, this.Y(p1.y * this.m_drawScale));
    this.m_sprite.lineTo(p2.x * this.m_drawScale, this.Y(p2.y * this.m_drawScale));
    this.m_sprite.stroke();
    this.m_sprite.closePath();
};
 
 Box2D.DebugDraw.prototype.DrawTransform = function(xf){
    this.m_sprite.lineWidth = this.m_lineThickness;
    this.m_sprite.strokeStyle = this.ColorStyle(new Box2D.Color(255, 0, 0), this.m_alpha);
    this.m_sprite.beginPath();
    this.m_sprite.moveTo(xf.position.x * this.m_drawScale, this.Y(xf.position.y * this.m_drawScale));
    this.m_sprite.lineTo((xf.position.x + this.m_xformScale * xf.R.col1.x) * this.m_drawScale, this.Y((xf.position.y + this.m_xformScale * xf.R.col1.y) * this.m_drawScale));
    this.m_sprite.stroke();
    this.m_sprite.closePath();
    this.m_sprite.strokeStyle = this.ColorStyle(new Box2D.Color(0, 255, 0), this.m_alpha);
    this.m_sprite.beginPath();
    this.m_sprite.moveTo(xf.position.x * this.m_drawScale, this.Y(xf.position.y * this.m_drawScale));
    this.m_sprite.lineTo((xf.position.x + this.m_xformScale * xf.R.col2.x) * this.m_drawScale, this.Y((xf.position.y + this.m_xformScale * xf.R.col2.y) * this.m_drawScale));
    this.m_sprite.stroke();
    this.m_sprite.closePath();
};
 Box2D.DebugDraw.prototype.m_drawFlags = 0;
 Box2D.DebugDraw.prototype.m_sprite = undefined;
 Box2D.DebugDraw.prototype.m_drawScale = 1;
 Box2D.DebugDraw.prototype.m_lineThickness = 1;
 Box2D.DebugDraw.prototype.m_alpha = 1;
 Box2D.DebugDraw.prototype.m_fillAlpha = 1;
 Box2D.DebugDraw.prototype.m_xformScale = 1;
 
 Box2D.Sweep = function(){
    this.__varz();
    this.__constructor.apply(this, arguments);
};
 
 Box2D.Sweep.prototype.__constructor = function(){
};
 Box2D.Sweep.prototype.__varz = function(){
    this.localCenter = new Box2D.Vec2();
    this.c0 = new Box2D.Vec2();
    this.c = new Box2D.Vec2();
};
 
 Box2D.Sweep.prototype.Set = function(other){
    this.localCenter.SetV(other.localCenter);
    this.c0.SetV(other.c0);
    this.c.SetV(other.c);
    this.a0 = other.a0;
    this.a = other.a;
    this.t0 = other.t0;
};
 
 Box2D.Sweep.prototype.Copy = function(){
    var copy = new Box2D.Sweep();
    copy.localCenter.SetV(this.localCenter);
    copy.c0.SetV(this.c0);
    copy.c.SetV(this.c);
    copy.a0 = this.a0;
    copy.a = this.a;
    copy.t0 = this.t0;
    return copy;
};
 
 Box2D.Sweep.prototype.GetTransform = function(xf, alpha){
    xf.position.x = (1 - alpha) * this.c0.x + alpha * this.c.x;
    xf.position.y = (1 - alpha) * this.c0.y + alpha * this.c.y;
    var angle = (1 - alpha) * this.a0 + alpha * this.a;
    xf.R.Set(angle);
    var tMat = xf.R;
    xf.position.x -= tMat.col1.x * this.localCenter.x + tMat.col2.x * this.localCenter.y;
    xf.position.y -= tMat.col1.y * this.localCenter.x + tMat.col2.y * this.localCenter.y;
};
 
 Box2D.Sweep.prototype.Advance = function(t){
    if (this.t0 < t && 1 - this.t0 > Number.MIN_VALUE){
        var alpha = (t - this.t0) / (1 - this.t0);
        this.c0.x = (1 - alpha) * this.c0.x + alpha * this.c.x;
        this.c0.y = (1 - alpha) * this.c0.y + alpha * this.c.y;
        this.a0 = (1 - alpha) * this.a0 + alpha * this.a;
        this.t0 = t;
    }
};
 Box2D.Sweep.prototype.localCenter = new Box2D.Vec2();
 Box2D.Sweep.prototype.c0 = new Box2D.Vec2();
 Box2D.Sweep.prototype.c = new Box2D.Vec2();
 Box2D.Sweep.prototype.a0 = undefined;
 Box2D.Sweep.prototype.a = undefined;
 Box2D.Sweep.prototype.t0 = undefined;
 
 Box2D.DistanceOutput = function(){
    this.__varz();
    this.__constructor.apply(this, arguments);
};
 
 Box2D.DistanceOutput.prototype.__constructor = function(){
};
 Box2D.DistanceOutput.prototype.__varz = function(){
    this.pointA = new Box2D.Vec2();
    this.pointB = new Box2D.Vec2();
};
 Box2D.DistanceOutput.prototype.pointA = new Box2D.Vec2();
 Box2D.DistanceOutput.prototype.pointB = new Box2D.Vec2();
 Box2D.DistanceOutput.prototype.distance = undefined;
 Box2D.DistanceOutput.prototype.iterations = 0;
 
 Box2D.Mat33 = function(){
    this.__varz();
    this.__constructor.apply(this, arguments);
};
 
 Box2D.Mat33.prototype.__constructor = function(c1, c2, c3){
    if ( ! c1 && ! c2 && ! c3){
        this.col1.SetZero();
        this.col2.SetZero();
        this.col3.SetZero();
    }
    else {
        this.col1.SetV(c1);
        this.col2.SetV(c2);
        this.col3.SetV(c3);
    }
};
 
 Box2D.Mat33.prototype.__varz = function(){
    this.col1 = new Box2D.Vec3();
    this.col2 = new Box2D.Vec3();
    this.col3 = new Box2D.Vec3();
};
 
 Box2D.Mat33.prototype.SetVVV = function(c1, c2, c3){
    this.col1.SetV(c1);
    this.col2.SetV(c2);
    this.col3.SetV(c3);
};
 
 Box2D.Mat33.prototype.Copy = function(){
    return new Box2D.Mat33(this.col1, this.col2, this.col3);
};
 
 Box2D.Mat33.prototype.SetM = function(m){
    this.col1.SetV(m.col1);
    this.col2.SetV(m.col2);
    this.col3.SetV(m.col3);
};
 
 Box2D.Mat33.prototype.AddM = function(m){
    this.col1.x += m.col1.x;
    this.col1.y += m.col1.y;
    this.col1.z += m.col1.z;
    this.col2.x += m.col2.x;
    this.col2.y += m.col2.y;
    this.col2.z += m.col2.z;
    this.col3.x += m.col3.x;
    this.col3.y += m.col3.y;
    this.col3.z += m.col3.z;
};
 
 Box2D.Mat33.prototype.SetIdentity = function(){
    this.col1.x = 1;
    this.col2.x = 0;
    this.col3.x = 0;
    this.col1.y = 0;
    this.col2.y = 1;
    this.col3.y = 0;
    this.col1.z = 0;
    this.col2.z = 0;
    this.col3.z = 1;
};
 
 Box2D.Mat33.prototype.SetZero = function(){
    this.col1.x = 0;
    this.col2.x = 0;
    this.col3.x = 0;
    this.col1.y = 0;
    this.col2.y = 0;
    this.col3.y = 0;
    this.col1.z = 0;
    this.col2.z = 0;
    this.col3.z = 0;
};
 
 Box2D.Mat33.prototype.Solve22 = function(out, bX, bY){
    var a11 = this.col1.x;
    var a12 = this.col2.x;
    var a21 = this.col1.y;
    var a22 = this.col2.y;
    var det = a11 * a22 - a12 * a21;
    if (det !== 0){
        det = 1 / det;
    }
    out.x = det * (a22 * bX - a12 * bY);
    out.y = det * (a11 * bY - a21 * bX);
    return out;
};
 
 Box2D.Mat33.prototype.Solve33 = function(out, bX, bY, bZ){
    var a11 = this.col1.x;
    var a21 = this.col1.y;
    var a31 = this.col1.z;
    var a12 = this.col2.x;
    var a22 = this.col2.y;
    var a32 = this.col2.z;
    var a13 = this.col3.x;
    var a23 = this.col3.y;
    var a33 = this.col3.z;
    var det = a11 * (a22 * a33 - a32 * a23) + a21 * (a32 * a13 - a12 * a33) + a31 * (a12 * a23 - a22 * a13);
    if (det !== 0){
        det = 1 / det;
    }
    out.x = det * (bX * (a22 * a33 - a32 * a23) + bY * (a32 * a13 - a12 * a33) + bZ * (a12 * a23 - a22 * a13));
    out.y = det * (a11 * (bY * a33 - bZ * a23) + a21 * (bZ * a13 - bX * a33) + a31 * (bX * a23 - bY * a13));
    out.z = det * (a11 * (a22 * bZ - a32 * bY) + a21 * (a32 * bX - a12 * bZ) + a31 * (a12 * bY - a22 * bX));
    return out;
};
 Box2D.Mat33.prototype.col1 = new Box2D.Vec3();
 Box2D.Mat33.prototype.col2 = new Box2D.Vec3();
 Box2D.Mat33.prototype.col3 = new Box2D.Vec3();
 
 Box2D.PositionSolverManifold = function(){
    this.__varz();
    this.__constructor.apply(this, arguments);
};
 
 Box2D.PositionSolverManifold.prototype.__constructor = function(){
    this.m_normal = new Box2D.Vec2();
    this.m_separations =[];
    this.m_points =[];
    for (var i = 0;i < Box2D.Settings.b2_maxManifoldPoints;i++){
        this.m_points[i] = new Box2D.Vec2();
    }
};
 
 Box2D.PositionSolverManifold.prototype.__varz = function(){
};
Box2D.PositionSolverManifold.circlePointA = new Box2D.Vec2();
 Box2D.PositionSolverManifold.circlePointB = new Box2D.Vec2();
 
 Box2D.PositionSolverManifold.prototype.Initialize = function(cc){
    Box2D.Settings.b2Assert(cc.pointCount > 0);
    var i = 0;
    var clipPointX;
    var clipPointY;
    var tMat;
    var tVec;
    var planePointX;
    var planePointY;
    switch (cc.type){
        case Box2D.Manifold.e_circles: 
            tMat = cc.bodyA.m_xf.R;
            tVec = cc.localPoint;
            var pointAX = cc.bodyA.m_xf.position.x + (tMat.col1.x * tVec.x + tMat.col2.x * tVec.y);
            var pointAY = cc.bodyA.m_xf.position.y + (tMat.col1.y * tVec.x + tMat.col2.y * tVec.y);
            tMat = cc.bodyB.m_xf.R;
            tVec = cc.points[0].localPoint;
            var pointBX = cc.bodyB.m_xf.position.x + (tMat.col1.x * tVec.x + tMat.col2.x * tVec.y);
            var pointBY = cc.bodyB.m_xf.position.y + (tMat.col1.y * tVec.x + tMat.col2.y * tVec.y);
            var dX = pointBX - pointAX;
            var dY = pointBY - pointAY;
            var d2 = dX * dX + dY * dY;
            if (d2 > Number.MIN_VALUE * Number.MIN_VALUE){
                var d = Math.sqrt(d2);
                this.m_normal.x = dX / d;
                this.m_normal.y = dY / d;
            }
            else {
                this.m_normal.x = 1;
                this.m_normal.y = 0;
            }
            this.m_points[0].x = 0.5 * (pointAX + pointBX);
            this.m_points[0].y = 0.5 * (pointAY + pointBY);
            this.m_separations[0] = dX * this.m_normal.x + dY * this.m_normal.y - cc.radius;
            break;
        case Box2D.Manifold.e_faceA: 
            tMat = cc.bodyA.m_xf.R;
            tVec = cc.localPlaneNormal;
            this.m_normal.x = tMat.col1.x * tVec.x + tMat.col2.x * tVec.y;
            this.m_normal.y = tMat.col1.y * tVec.x + tMat.col2.y * tVec.y;
            tMat = cc.bodyA.m_xf.R;
            tVec = cc.localPoint;
            planePointX = cc.bodyA.m_xf.position.x + (tMat.col1.x * tVec.x + tMat.col2.x * tVec.y);
            planePointY = cc.bodyA.m_xf.position.y + (tMat.col1.y * tVec.x + tMat.col2.y * tVec.y);
            tMat = cc.bodyB.m_xf.R;
            for (i = 0;i < cc.pointCount; ++i){
                tVec = cc.points[i].localPoint;
                clipPointX = cc.bodyB.m_xf.position.x + (tMat.col1.x * tVec.x + tMat.col2.x * tVec.y);
                clipPointY = cc.bodyB.m_xf.position.y + (tMat.col1.y * tVec.x + tMat.col2.y * tVec.y);
                this.m_separations[i] = (clipPointX - planePointX) * this.m_normal.x + (clipPointY - planePointY) * this.m_normal.y - cc.radius;
                this.m_points[i].x = clipPointX;
                this.m_points[i].y = clipPointY;
            }
            break;
        case Box2D.Manifold.e_faceB: 
            tMat = cc.bodyB.m_xf.R;
            tVec = cc.localPlaneNormal;
            this.m_normal.x = tMat.col1.x * tVec.x + tMat.col2.x * tVec.y;
            this.m_normal.y = tMat.col1.y * tVec.x + tMat.col2.y * tVec.y;
            tMat = cc.bodyB.m_xf.R;
            tVec = cc.localPoint;
            planePointX = cc.bodyB.m_xf.position.x + (tMat.col1.x * tVec.x + tMat.col2.x * tVec.y);
            planePointY = cc.bodyB.m_xf.position.y + (tMat.col1.y * tVec.x + tMat.col2.y * tVec.y);
            tMat = cc.bodyA.m_xf.R;
            for (i = 0;i < cc.pointCount; ++i){
                tVec = cc.points[i].localPoint;
                clipPointX = cc.bodyA.m_xf.position.x + (tMat.col1.x * tVec.x + tMat.col2.x * tVec.y);
                clipPointY = cc.bodyA.m_xf.position.y + (tMat.col1.y * tVec.x + tMat.col2.y * tVec.y);
                this.m_separations[i] = (clipPointX - planePointX) * this.m_normal.x + (clipPointY - planePointY) * this.m_normal.y - cc.radius;
                this.m_points[i].Set(clipPointX, clipPointY);
            }
            this.m_normal.x *= - 1;
            this.m_normal.y *= - 1;
            break;
    }
};
 Box2D.PositionSolverManifold.prototype.m_normal = undefined;
 Box2D.PositionSolverManifold.prototype.m_points = undefined;
 Box2D.PositionSolverManifold.prototype.m_separations = undefined;
 
 Box2D.OBB = function(){
    this.__varz();
    this.__constructor.apply(this, arguments);
};
 
 Box2D.OBB.prototype.__constructor = function(){
};
 Box2D.OBB.prototype.__varz = function(){
    this.R = new Box2D.Mat22();
    this.center = new Box2D.Vec2();
    this.extents = new Box2D.Vec2();
};
 Box2D.OBB.prototype.R = new Box2D.Mat22();
 Box2D.OBB.prototype.center = new Box2D.Vec2();
 Box2D.OBB.prototype.extents = new Box2D.Vec2();
 
 Box2D.Pair = function(){
    this.__varz();
    this.__constructor.apply(this, arguments);
};
 
 Box2D.Pair.prototype.__constructor = function(){
};
 Box2D.Pair.prototype.__varz = function(){
};
Box2D.Pair.b2_nullProxy = Box2D.Settings.USHRT_MAX;
 Box2D.Pair.e_pairBuffered = 1;
 Box2D.Pair.e_pairRemoved = 2;
 Box2D.Pair.e_pairFinal = 4;
 
 Box2D.Pair.prototype.SetBuffered = function(){
    this.status |= Box2D.Pair.e_pairBuffered;
};
 
 Box2D.Pair.prototype.ClearBuffered = function(){
    this.status &= ~ Box2D.Pair.e_pairBuffered;
};
 
 Box2D.Pair.prototype.IsBuffered = function(){
    return (this.status & Box2D.Pair.e_pairBuffered) == Box2D.Pair.e_pairBuffered;
};
 
 Box2D.Pair.prototype.SetRemoved = function(){
    this.status |= Box2D.Pair.e_pairRemoved;
};
 
 Box2D.Pair.prototype.ClearRemoved = function(){
    this.status &= ~ Box2D.Pair.e_pairRemoved;
};
 
 Box2D.Pair.prototype.IsRemoved = function(){
    return (this.status & Box2D.Pair.e_pairRemoved) == Box2D.Pair.e_pairRemoved;
};
 
 Box2D.Pair.prototype.SetFinal = function(){
    this.status |= Box2D.Pair.e_pairFinal;
};
 
 Box2D.Pair.prototype.IsFinal = function(){
    return (this.status & Box2D.Pair.e_pairFinal) == Box2D.Pair.e_pairFinal;
};
 Box2D.Pair.prototype.userData = undefined;
 Box2D.Pair.prototype.proxy1 = undefined;
 Box2D.Pair.prototype.proxy2 = undefined;
 Box2D.Pair.prototype.next = undefined;
 Box2D.Pair.prototype.status = 0;
 
 Box2D.FixtureDef = function(){
    this.__varz();
    this.__constructor.apply(this, arguments);
};
 
 Box2D.FixtureDef.prototype.__constructor = function(){
    this.shape = undefined;
    this.userData = undefined;
    this.friction = 0.2;
    this.restitution = 0;
    this.density = 0;
    this.filter.categoryBits = 1;
    this.filter.maskBits = 65535;
    this.filter.groupIndex = 0;
    this.isSensor = false;
};
 
 Box2D.FixtureDef.prototype.__varz = function(){
    this.filter = new Box2D.FilterData();
};
 Box2D.FixtureDef.prototype.shape = undefined;
 Box2D.FixtureDef.prototype.userData = undefined;
 Box2D.FixtureDef.prototype.friction = undefined;
 Box2D.FixtureDef.prototype.restitution = undefined;
 Box2D.FixtureDef.prototype.density = undefined;
 Box2D.FixtureDef.prototype.isSensor = undefined;
 Box2D.FixtureDef.prototype.filter = new Box2D.FilterData();
 
 Box2D.ContactID = function(){
    this.__varz();
    this.__constructor.apply(this, arguments);
};
 
 Box2D.ContactID.prototype.__constructor = function(){
    this.features._m_id = this;
};
 
 Box2D.ContactID.prototype.__varz = function(){
    this.features = new Features();
};
 
 Box2D.ContactID.prototype.Set = function(id){
    this._key = id._key;
};
 
 Box2D.ContactID.prototype.Copy = function(){
    var id = new Box2D.ContactID();
    id.key = this._key;
    return id;
};
 Box2D.ContactID.prototype.__defineSetter__("key", function(){
    return this._key;
});
 Box2D.ContactID.prototype.__defineSetter__("key", function(value){
    this._key = value;
    this.features._referenceEdge = this._key & 255;
    this.features._incidentEdge = (this._key & 65280) >> 8 & 255;
    this.features._incidentVertex = (this._key & 16711680) >> 16 & 255;
    this.features._flip = (this._key & 4278190080) >> 24 & 255;
});
 Box2D.ContactID.prototype._key = 0;
 Box2D.ContactID.prototype.features = new Features();
 
 Box2D.Transform = function(){
    this.__varz();
    this.__constructor.apply(this, arguments);
};
 
 Box2D.Transform.prototype.__constructor = function(pos, r){
    if (pos){
        this.position.SetV(pos);
        this.R.SetM(r);
    }
};
 
 Box2D.Transform.prototype.__varz = function(){
    this.position = new Box2D.Vec2();
    this.R = new Box2D.Mat22();
};
 
 Box2D.Transform.prototype.Initialize = function(pos, r){
    this.position.SetV(pos);
    this.R.SetM(r);
};
 
 Box2D.Transform.prototype.SetIdentity = function(){
    this.position.SetZero();
    this.R.SetIdentity();
};
 
 Box2D.Transform.prototype.Set = function(x){
    this.position.SetV(x.position);
    this.R.SetM(x.R);
};
 
 Box2D.Transform.prototype.GetAngle = function(){
    return Math.atan2(this.R.col1.y, this.R.col1.x);
};
 Box2D.Transform.prototype.position = new Box2D.Vec2();
 Box2D.Transform.prototype.R = new Box2D.Mat22();
 
 Box2D.EdgeShape = function(){
    Box2D.Shape.prototype.__varz.call(this);
    this.__varz();
    this.__constructor.apply(this, arguments);
};
 extend(Box2D.EdgeShape.prototype, Box2D.Shape.prototype);
 Box2D.EdgeShape.prototype._super = Box2D.Shape.prototype;
 
 Box2D.EdgeShape.prototype.__constructor = function(v1, v2){
    this._super.__constructor.apply(this,[]);
    this.m_type = Box2D.Shape.e_edgeShape;
    this.m_prevEdge = undefined;
    this.m_nextEdge = undefined;
    this.m_v1 = v1;
    this.m_v2 = v2;
    this.m_direction.Set(this.m_v2.x - this.m_v1.x, this.m_v2.y - this.m_v1.y);
	this.m_length = this.m_direction.Normalize();
    this.m_normal.Set(this.m_direction.y, - this.m_direction.x);
    this.m_coreV1.Set( - Box2D.Settings.b2_toiSlop * (this.m_normal.x - this.m_direction.x) + this.m_v1.x, - Box2D.Settings.b2_toiSlop * (this.m_normal.y - this.m_direction.y) + this.m_v1.y);
    this.m_coreV2.Set( - Box2D.Settings.b2_toiSlop * (this.m_normal.x + this.m_direction.x) + this.m_v2.x, - Box2D.Settings.b2_toiSlop * (this.m_normal.y + this.m_direction.y) + 
       this.m_v2.y);
    this.m_cornerDir1 = this.m_normal;
    this.m_cornerDir2.Set( - this.m_normal.x, - this.m_normal.y);
};
 
 Box2D.EdgeShape.prototype.__varz = function(){
    this.s_supportVec = new Box2D.Vec2();
    this.m_v1 = new Box2D.Vec2();
    this.m_v2 = new Box2D.Vec2();
    this.m_coreV1 = new Box2D.Vec2();
    this.m_coreV2 = new Box2D.Vec2();
    this.m_normal = new Box2D.Vec2();
    this.m_direction = new Box2D.Vec2();
    this.m_cornerDir1 = new Box2D.Vec2();
    this.m_cornerDir2 = new Box2D.Vec2();
};
 
 Box2D.EdgeShape.prototype.SetPrevEdge = function(edge, core, cornerDir, convex){
    this.m_prevEdge = edge;
    this.m_coreV1 = core;
    this.m_cornerDir1 = cornerDir;
    this.m_cornerConvex1 = convex;
};
 
 Box2D.EdgeShape.prototype.SetNextEdge = function(edge, core, cornerDir, convex){
    this.m_nextEdge = edge;
    this.m_coreV2 = core;
    this.m_cornerDir2 = cornerDir;
    this.m_cornerConvex2 = convex;
};
 
 Box2D.EdgeShape.prototype.TestPoint = function(transform, p){
    return false;
};
 
 Box2D.EdgeShape.prototype.RayCast = function(output, input, transform){
    var tMat;
    var rX = input.p2.x - input.p1.x;
    var rY = input.p2.y - input.p1.y;
    tMat = transform.R;
    var v1X = transform.position.x + (tMat.col1.x * this.m_v1.x + tMat.col2.x * this.m_v1.y);
    var v1Y = transform.position.y + (tMat.col1.y * this.m_v1.x + tMat.col2.y * this.m_v1.y);
    var nX = transform.position.y + (tMat.col1.y * this.m_v2.x + tMat.col2.y * this.m_v2.y) - v1Y;
    var nY = - (transform.position.x + (tMat.col1.x * this.m_v2.x + tMat.col2.x * this.m_v2.y) - v1X);
    var k_slop = 100 * Number.MIN_VALUE;
    var denom = - (rX * nX + rY * nY);
    if (denom > k_slop){
        var bX = input.p1.x - v1X;
        var bY = input.p1.y - v1Y;
        var a = bX * nX + bY * nY;
        if (0 <= a && a <= input.maxFraction * denom){
            var mu2 = - rX * bY + rY * bX;
            if ( - k_slop * denom <= mu2 && mu2 <= denom * (1 + k_slop)){
                a /= denom;
                output.fraction = a;
                var nLen = Math.sqrt(nX * nX + nY * nY);
                output.normal.x = nX / nLen;
                output.normal.y = nY / nLen;
                return true;
            }
        }
    }
    return false;
};
 
 Box2D.EdgeShape.prototype.ComputeAABB = function(aabb, transform){
    var tMat = transform.R;
    var v1X = transform.position.x + (tMat.col1.x * this.m_v1.x + tMat.col2.x * this.m_v1.y);
    var v1Y = transform.position.y + (tMat.col1.y * this.m_v1.x + tMat.col2.y * this.m_v1.y);
    var v2X = transform.position.x + (tMat.col1.x * this.m_v2.x + tMat.col2.x * this.m_v2.y);
    var v2Y = transform.position.y + (tMat.col1.y * this.m_v2.x + tMat.col2.y * this.m_v2.y);
    if (v1X < v2X){
        aabb.lowerBound.x = v1X;
        aabb.upperBound.x = v2X;
    }
    else {
        aabb.lowerBound.x = v2X;
        aabb.upperBound.x = v1X;
    }
    if (v1Y < v2Y){
        aabb.lowerBound.y = v1Y;
        aabb.upperBound.y = v2Y;
    }
    else {
        aabb.lowerBound.y = v2Y;
        aabb.upperBound.y = v1Y;
    }
};
 
 Box2D.EdgeShape.prototype.ComputeMass = function(massData, density){
    massData.mass = 0;
    massData.center.SetV(this.m_v1);
    massData.I = 0;
};
 
 Box2D.EdgeShape.prototype.ComputeSubmergedArea = function(normal, offset, xf, c){
    var v0 = new Box2D.Vec2(normal.x * offset, normal.y * offset);
    var v1 = Box2D.Math.MulX(xf, this.m_v1);
    var v2 = Box2D.Math.MulX(xf, this.m_v2);
    var d1 = Box2D.Math.Dot(normal, v1) - offset;
    var d2 = Box2D.Math.Dot(normal, v2) - offset;
    if (d1 > 0){
        if (d2 > 0){
            return 0;
        }
        else {
            v1.x = - d2 / (d1 - d2) * v1.x + d1 / (d1 - d2) * v2.x;
            v1.y = - d2 / (d1 - d2) * v1.y + d1 / (d1 - d2) * v2.y;
        }
    }
    else {
        if (d2 > 0){
            v2.x = - d2 / (d1 - d2) * v1.x + d1 / (d1 - d2) * v2.x;
            v2.y = - d2 / (d1 - d2) * v1.y + d1 / (d1 - d2) * v2.y;
        }
        else {
        }
    }
    c.x = (v0.x + v1.x + v2.x) / 3;
    c.y = (v0.y + v1.y + v2.y) / 3;
    return 0.5 * ((v1.x - v0.x) * (v2.y - v0.y) - (v1.y - v0.y) * (v2.x - v0.x));
};
 
 Box2D.EdgeShape.prototype.GetLength = function(){
    return this.m_length;
};
 
 Box2D.EdgeShape.prototype.GetVertex1 = function(){
    return this.m_v1;
};
 
 Box2D.EdgeShape.prototype.GetVertex2 = function(){
    return this.m_v2;
};
 
 Box2D.EdgeShape.prototype.GetCoreVertex1 = function(){
    return this.m_coreV1;
};
 
 Box2D.EdgeShape.prototype.GetCoreVertex2 = function(){
    return this.m_coreV2;
};
 
 Box2D.EdgeShape.prototype.GetNormalVector = function(){
    return this.m_normal;
};
 
 Box2D.EdgeShape.prototype.GetDirectionVector = function(){
    return this.m_direction;
};
 
 Box2D.EdgeShape.prototype.GetCorner1Vector = function(){
    return this.m_cornerDir1;
};
 
 Box2D.EdgeShape.prototype.GetCorner2Vector = function(){
    return this.m_cornerDir2;
};
 
 Box2D.EdgeShape.prototype.Corner1IsConvex = function(){
    return this.m_cornerConvex1;
};
 
 Box2D.EdgeShape.prototype.Corner2IsConvex = function(){
    return this.m_cornerConvex2;
};
 
 Box2D.EdgeShape.prototype.GetFirstVertex = function(xf){
    var tMat = xf.R;
    return new Box2D.Vec2(xf.position.x + (tMat.col1.x * this.m_coreV1.x + tMat.col2.x * this.m_coreV1.y), xf.position.y + 
       (tMat.col1.y * this.m_coreV1.x + tMat.col2.y * this.m_coreV1.y));
};
 
 Box2D.EdgeShape.prototype.GetNextEdge = function(){
    return this.m_nextEdge;
};
 
 Box2D.EdgeShape.prototype.GetPrevEdge = function(){
    return this.m_prevEdge;
};
 
 Box2D.EdgeShape.prototype.Support = function(xf, dX, dY){
    var tMat = xf.R;
    var v1X = xf.position.x + (tMat.col1.x * this.m_coreV1.x + tMat.col2.x * this.m_coreV1.y);
    var v1Y = xf.position.y + (tMat.col1.y * this.m_coreV1.x + tMat.col2.y * this.m_coreV1.y);
    var v2X = xf.position.x + (tMat.col1.x * this.m_coreV2.x + tMat.col2.x * this.m_coreV2.y);
    var v2Y = xf.position.y + (tMat.col1.y * this.m_coreV2.x + tMat.col2.y * this.m_coreV2.y);
    if (v1X * dX + v1Y * dY > v2X * dX + v2Y * dY){
        this.s_supportVec.x = v1X;
        this.s_supportVec.y = v1Y;
    }
    else {
        this.s_supportVec.x = v2X;
        this.s_supportVec.y = v2Y;
    }
    return this.s_supportVec;
};
 Box2D.EdgeShape.prototype.s_supportVec = new Box2D.Vec2();
 Box2D.EdgeShape.prototype.m_v1 = new Box2D.Vec2();
 Box2D.EdgeShape.prototype.m_v2 = new Box2D.Vec2();
 Box2D.EdgeShape.prototype.m_coreV1 = new Box2D.Vec2();
 Box2D.EdgeShape.prototype.m_coreV2 = new Box2D.Vec2();
 Box2D.EdgeShape.prototype.m_length = undefined;
 Box2D.EdgeShape.prototype.m_normal = new Box2D.Vec2();
 Box2D.EdgeShape.prototype.m_direction = new Box2D.Vec2();
 Box2D.EdgeShape.prototype.m_cornerDir1 = new Box2D.Vec2();
 Box2D.EdgeShape.prototype.m_cornerDir2 = new Box2D.Vec2();
 Box2D.EdgeShape.prototype.m_cornerConvex1 = undefined;
 Box2D.EdgeShape.prototype.m_cornerConvex2 = undefined;
 Box2D.EdgeShape.prototype.m_nextEdge = undefined;
 Box2D.EdgeShape.prototype.m_prevEdge = undefined;
 
 Box2D.BuoyancyController = function(){
    Box2D.Controller.prototype.__varz.call(this);
    this.__varz();
    this.__constructor.apply(this, arguments);
};
 extend(Box2D.BuoyancyController.prototype, Box2D.Controller.prototype);
 Box2D.BuoyancyController.prototype._super = Box2D.Controller.prototype;
 
 Box2D.BuoyancyController.prototype.__constructor = function(){
    this._super.__constructor.apply(this, arguments);
};
 
 Box2D.BuoyancyController.prototype.__varz = function(){
    this.normal = new Box2D.Vec2(0, - 1);
    this.velocity = new Box2D.Vec2(0, 0);
};
 
 Box2D.BuoyancyController.prototype.Step = function(step){
    if ( ! this.m_bodyList){
        return;
    }
    if (this.useWorldGravity){
        this.gravity = this.GetWorld().GetGravity().Copy();
    }
    for (var i = this.m_bodyList;i;i = i.nextBody){
        var body = i.body;
        if (body.IsAwake() === false){
            continue;
        }
        var areac = new Box2D.Vec2();
        var massc = new Box2D.Vec2();
        var area = 0;
        var mass = 0;
        for (var fixture = body.GetFixtureList();fixture;fixture = fixture.GetNext()){
            var sc = new Box2D.Vec2();
            var sarea = fixture.GetShape().ComputeSubmergedArea(this.normal, this.offset, body.GetTransform(), sc);
            area += sarea;
            areac.x += sarea * sc.x;
            areac.y += sarea * sc.y;
            var shapeDensity;
            if (this.useDensity){
                shapeDensity = 1;
            }
            else {
                shapeDensity = 1;
            }
            mass += sarea * shapeDensity;
            massc.x += sarea * sc.x * shapeDensity;
            massc.y += sarea * sc.y * shapeDensity;
        }
        areac.x /= area;
        areac.y /= area;
        massc.x /= mass;
        massc.y /= mass;
        if (area < Number.MIN_VALUE){
            continue;
        }
        var buoyancyForce = this.gravity.GetNegative();
        buoyancyForce.Multiply(this.density * area);
        body.ApplyForce(buoyancyForce, massc);
        var dragForce = body.GetLinearVelocityFromWorldPoint(areac);
        dragForce.Subtract(this.velocity);
        dragForce.Multiply( - this.linearDrag * area);
        body.ApplyForce(dragForce, areac);
        body.ApplyTorque( - body.GetInertia() / body.GetMass() * area * body.GetAngularVelocity() * this.angularDrag);
    }
};
 
 Box2D.BuoyancyController.prototype.Draw = function(debugDraw){
    var r = 1E3;
    var p1 = new Box2D.Vec2();
    var p2 = new Box2D.Vec2();
    p1.x = this.normal.x * this.offset + this.normal.y * r;
    p1.y = this.normal.y * this.offset - this.normal.x * r;
    p2.x = this.normal.x * this.offset - this.normal.y * r;
    p2.y = this.normal.y * this.offset + this.normal.x * r;
    var color = new Box2D.Color(0, 0, 1);
    debugDraw.DrawSegment(p1, p2, color);
};
 Box2D.BuoyancyController.prototype.normal = new Box2D.Vec2(0, - 1);
 Box2D.BuoyancyController.prototype.offset = 0;
 Box2D.BuoyancyController.prototype.density = 0;
 Box2D.BuoyancyController.prototype.velocity = new Box2D.Vec2(0, 0);
 Box2D.BuoyancyController.prototype.linearDrag = 2;
 Box2D.BuoyancyController.prototype.angularDrag = 1;
 Box2D.BuoyancyController.prototype.useDensity = false;
 Box2D.BuoyancyController.prototype.useWorldGravity = true;
 Box2D.BuoyancyController.prototype.gravity = undefined;
 
 Box2D.Body = function(){
    this.__varz();
    this.__constructor.apply(this, arguments);
};
 
 Box2D.Body.prototype.__constructor = function(bd, world){
    this.m_flags = 0;
    if (bd.bullet){
        this.m_flags |= Box2D.Body.e_bulletFlag;
    }
    if (bd.fixedRotation){
        this.m_flags |= Box2D.Body.e_fixedRotationFlag;
    }
    if (bd.allowSleep){
        this.m_flags |= Box2D.Body.e_allowSleepFlag;
    }
    if (bd.awake){
        this.m_flags |= Box2D.Body.e_awakeFlag;
    }
    if (bd.active){
        this.m_flags |= Box2D.Body.e_activeFlag;
    }
    this.m_world = world;
    this.m_xf.position.SetV(bd.position);
    this.m_xf.R.Set(bd.angle);
    this.m_sweep.localCenter.SetZero();
    this.m_sweep.t0 = 1;
    this.m_sweep.a0 = this.m_sweep.a = bd.angle;
    var tMat = this.m_xf.R;
    var tVec = this.m_sweep.localCenter;
    this.m_sweep.c.x = tMat.col1.x * tVec.x + tMat.col2.x * tVec.y;
    this.m_sweep.c.y = tMat.col1.y * tVec.x + tMat.col2.y * tVec.y;
    this.m_sweep.c.x += this.m_xf.position.x;
    this.m_sweep.c.y += this.m_xf.position.y;
    this.m_sweep.c0.SetV(this.m_sweep.c);
    this.m_jointList = undefined;
    this.m_controllerList = undefined;
    this.m_contactList = undefined;
    this.m_controllerCount = 0;
    this.m_prev = undefined;
    this.m_next = undefined;
    this.m_linearVelocity.SetV(bd.linearVelocity);
    this.m_angularVelocity = bd.angularVelocity;
    this.m_linearDamping = bd.linearDamping;
    this.m_angularDamping = bd.angularDamping;
    this.m_force.Set(0, 0);
    this.m_torque = 0;
    this.m_sleepTime = 0;
    this.m_type = bd.type;
    if (this.m_type == Box2D.Body.b2_dynamicBody){
        this.m_mass = 1;
        this.m_invMass = 1;
    }
    else {
        this.m_mass = 0;
        this.m_invMass = 0;
    }
    this.m_I = 0;
    this.m_invI = 0;
    this.m_inertiaScale = bd.inertiaScale;
    this.m_userData = bd.userData;
    this.m_fixtureList = undefined;
    this.m_fixtureCount = 0;
	if (this.m_type == Box2D.Body.b2_staticBody){
	    this.SetAwake(false);
	}
};
 
 Box2D.Body.prototype.__varz = function(){
    this.m_xf = new Box2D.Transform();
    this.m_sweep = new Box2D.Sweep();
    this.m_linearVelocity = new Box2D.Vec2();
    this.m_force = new Box2D.Vec2();
};
 Box2D.Body.b2_staticBody = 0;
 Box2D.Body.b2_kinematicBody = 1;
 Box2D.Body.b2_dynamicBody = 2;
 Box2D.Body.s_xf1 = new Box2D.Transform();
 Box2D.Body.e_islandFlag = 1;
 Box2D.Body.e_awakeFlag = 2;
 Box2D.Body.e_allowSleepFlag = 4;
 Box2D.Body.e_bulletFlag = 8;
 Box2D.Body.e_fixedRotationFlag = 16;
 Box2D.Body.e_activeFlag = 32;
 
 Box2D.Body.prototype.connectEdges = function(s1, s2, angle1){
    var angle2 = Math.atan2(s2.GetDirectionVector().y, s2.GetDirectionVector().x);
    var coreOffset = Math.tan((angle2 - angle1) * 0.5);
    var core = Box2D.Math.MulFV(coreOffset, s2.GetDirectionVector());
    core = Box2D.Math.SubtractVV(core, s2.GetNormalVector());
    core = Box2D.Math.MulFV(Box2D.Settings.b2_toiSlop, core);
    core = Box2D.Math.AddVV(core, s2.GetVertex1());
    var cornerDir = Box2D.Math.AddVV(s1.GetDirectionVector(), s2.GetDirectionVector());
    cornerDir.Normalize();
    var convex = Box2D.Math.Dot(s1.GetDirectionVector(), s2.GetNormalVector()) > 0;
    s1.SetNextEdge(s2, core, cornerDir, convex);
    s2.SetPrevEdge(s1, core, cornerDir, convex);
    return angle2;
};
 
 Box2D.Body.prototype.SynchronizeFixtures = function(){
    var xf1 = Box2D.Body.s_xf1;
    xf1.R.Set(this.m_sweep.a0);
    var tMat = xf1.R;
    var tVec = this.m_sweep.localCenter;
    xf1.position.x = this.m_sweep.c0.x - (tMat.col1.x * tVec.x + tMat.col2.x * tVec.y);
    xf1.position.y = this.m_sweep.c0.y - (tMat.col1.y * tVec.x + tMat.col2.y * tVec.y);
    var f;
    var broadPhase = this.m_world.m_contactManager.m_broadPhase;
    for (f = this.m_fixtureList;f;f = f.m_next){
        f.Synchronize(broadPhase, xf1, this.m_xf);
    }
};
 
 Box2D.Body.prototype.SynchronizeTransform = function(){
    this.m_xf.R.Set(this.m_sweep.a);
    var tMat = this.m_xf.R;
    var tVec = this.m_sweep.localCenter;
    this.m_xf.position.x = this.m_sweep.c.x - (tMat.col1.x * tVec.x + tMat.col2.x * tVec.y);
    this.m_xf.position.y = this.m_sweep.c.y - (tMat.col1.y * tVec.x + tMat.col2.y * tVec.y);
};
 
 Box2D.Body.prototype.ShouldCollide = function(other){
    if (this.m_type != Box2D.Body.b2_dynamicBody && other.m_type != Box2D.Body.b2_dynamicBody){
        return false;
    }
    for (var jn = this.m_jointList;jn;jn = jn.next){
        if (jn.other == other){
            if (jn.joint.m_collideConnected === false){
                return false;
            }
        }
    }
    return true;
};
 
 Box2D.Body.prototype.Advance = function(t){
    this.m_sweep.Advance(t);
    this.m_sweep.c.SetV(this.m_sweep.c0);
    this.m_sweep.a = this.m_sweep.a0;
    this.SynchronizeTransform();
};
 
 Box2D.Body.prototype.CreateFixture = function(def){
    if (this.m_world.IsLocked() === true){
        return undefined;
    }
    var fixture = new Box2D.Fixture();
    fixture.Create(this, this.m_xf, def);
    if (this.m_flags & Box2D.Body.e_activeFlag){
        var broadPhase = this.m_world.m_contactManager.m_broadPhase;
        fixture.CreateProxy(broadPhase, this.m_xf);
    }
    fixture.m_next = this.m_fixtureList;
    this.m_fixtureList = fixture;
    ++ this.m_fixtureCount;
    fixture.m_body = this;
    if (fixture.m_density > 0){
        this.ResetMassData();
    }
    this.m_world.m_flags |= Box2D.World.e_newFixture;
    return fixture;
};
 
 Box2D.Body.prototype.CreateFixture2 = function(shape, density){
    var def = new Box2D.FixtureDef();
    def.shape = shape;
    def.density = density;
    return this.CreateFixture(def);
};
 
 Box2D.Body.prototype.DestroyFixture = function(fixture){
    if (this.m_world.IsLocked() === true){
        return;
    }
    var node = this.m_fixtureList;
    var ppF = undefined;
    var found = false;
    while (typeof node !== "undefined"){
        if (node == fixture){
            if (ppF){
                ppF.m_next = fixture.m_next;
            }
            else {
                this.m_fixtureList = fixture.m_next;
            }
            found = true;
            break;
        }
        ppF = node;
        node = node.m_next;
    }
    var edge = this.m_contactList;
    while (edge){
        var c = edge.contact;
        edge = edge.next;
        var fixtureA = c.GetFixtureA();
        var fixtureB = c.GetFixtureB();
        if (fixture == fixtureA || fixture == fixtureB){
            this.m_world.m_contactManager.Destroy(c);
        }
    }
    if (this.m_flags & Box2D.Body.e_activeFlag){
        var broadPhase = this.m_world.m_contactManager.m_broadPhase;
        fixture.DestroyProxy(broadPhase);
    }
    else {
    }
    fixture.Destroy();
    fixture.m_body = undefined;
    fixture.m_next = undefined;
    --this.m_fixtureCount;
    this.ResetMassData();
};
 
 Box2D.Body.prototype.SetPositionAndAngle = function(position, angle){
    var f;
    if (this.m_world.IsLocked() === true){
        return;
    }
    this.m_xf.R.Set(angle);
    this.m_xf.position.SetV(position);
    var tMat = this.m_xf.R;
    var tVec = this.m_sweep.localCenter;
    this.m_sweep.c.x = tMat.col1.x * tVec.x + tMat.col2.x * tVec.y;
    this.m_sweep.c.y = tMat.col1.y * tVec.x + tMat.col2.y * tVec.y;
    this.m_sweep.c.x += this.m_xf.position.x;
    this.m_sweep.c.y += this.m_xf.position.y;
    this.m_sweep.c0.SetV(this.m_sweep.c);
    this.m_sweep.a0 = this.m_sweep.a = angle;
    var broadPhase = this.m_world.m_contactManager.m_broadPhase;
    for (f = this.m_fixtureList;f;f = f.m_next){
        f.Synchronize(broadPhase, this.m_xf, this.m_xf);
    }
    this.m_world.m_contactManager.FindNewContacts();
};
 
 Box2D.Body.prototype.SetTransform = function(xf){
    this.SetPositionAndAngle(xf.position, xf.GetAngle());
};
 
 Box2D.Body.prototype.GetTransform = function(){
    return this.m_xf;
};
 
 Box2D.Body.prototype.GetPosition = function(){
    return this.m_xf.position;
};
 
 Box2D.Body.prototype.SetPosition = function(position){
    this.SetPositionAndAngle(position, this.GetAngle());
};
 
 Box2D.Body.prototype.GetAngle = function(){
    return this.m_sweep.a;
};
 
 Box2D.Body.prototype.SetAngle = function(angle){
    this.SetPositionAndAngle(this.GetPosition(), angle);
};
 
 Box2D.Body.prototype.GetWorldCenter = function(){
    return this.m_sweep.c;
};
 
 Box2D.Body.prototype.GetLocalCenter = function(){
    return this.m_sweep.localCenter;
};
 
 Box2D.Body.prototype.SetLinearVelocity = function(v){
    if (this.m_type == Box2D.Body.b2_staticBody){
        return;
    }
    this.m_linearVelocity.SetV(v);
};
 
 Box2D.Body.prototype.GetLinearVelocity = function(){
    return this.m_linearVelocity;
};
 
 Box2D.Body.prototype.SetAngularVelocity = function(omega){
    if (this.m_type == Box2D.Body.b2_staticBody){
        return;
    }
    this.m_angularVelocity = omega;
};
 
 Box2D.Body.prototype.GetAngularVelocity = function(){
    return this.m_angularVelocity;
};
 
 Box2D.Body.prototype.GetDefinition = function(){
    var bd = new Box2D.BodyDef();
    bd.type = this.GetType();
    bd.allowSleep = (this.m_flags & Box2D.Body.e_allowSleepFlag) == Box2D.Body.e_allowSleepFlag;
    bd.angle = this.GetAngle();
    bd.angularDamping = this.m_angularDamping;
    bd.angularVelocity = this.m_angularVelocity;
    bd.fixedRotation = (this.m_flags & Box2D.Body.e_fixedRotationFlag) == Box2D.Body.e_fixedRotationFlag;
    bd.bullet = (this.m_flags & Box2D.Body.e_bulletFlag) == Box2D.Body.e_bulletFlag;
    bd.awake = (this.m_flags & Box2D.Body.e_awakeFlag) == Box2D.Body.e_awakeFlag;
    bd.linearDamping = this.m_linearDamping;
    bd.linearVelocity.SetV(this.GetLinearVelocity());
    bd.position = this.GetPosition();
    bd.userData = this.GetUserData();
    return bd;
};
 
 Box2D.Body.prototype.ApplyForce = function(force, point){
    if (this.m_type != Box2D.Body.b2_dynamicBody){
        return;
    }
    if (this.IsAwake() === false){
        this.SetAwake(true);
    }
    this.m_force.x += force.x;
    this.m_force.y += force.y;
    this.m_torque += (point.x - this.m_sweep.c.x) * force.y - (point.y - this.m_sweep.c.y) * force.x;
};
 
 Box2D.Body.prototype.ApplyTorque = function(torque){
    if (this.m_type != Box2D.Body.b2_dynamicBody){
        return;
    }
    if (this.IsAwake() === false){
        this.SetAwake(true);
    }
    this.m_torque += torque;
};
 
 Box2D.Body.prototype.ApplyImpulse = function(impulse, point){
    if (this.m_type != Box2D.Body.b2_dynamicBody){
        return;
    }
    if (this.IsAwake() === false){
        this.SetAwake(true);
    }
    this.m_linearVelocity.x += this.m_invMass * impulse.x;
    this.m_linearVelocity.y += this.m_invMass * impulse.y;
    this.m_angularVelocity += this.m_invI * ((point.x - this.m_sweep.c.x) * impulse.y - (point.y - this.m_sweep.c.y) * 
       impulse.x);
};
 
 Box2D.Body.prototype.Split = function(callback){
    var linearVelocity = this.GetLinearVelocity().Copy();
    var angularVelocity = this.GetAngularVelocity();
    var center = this.GetWorldCenter();
    var body1 = this;
    var body2 = this.m_world.CreateBody(this.GetDefinition());
    var prev;
    for (var f = body1.m_fixtureList;f;){
        if (callback(f)){
            var next = f.m_next;
            if (prev){
                prev.m_next = next;
            }
            else {
                body1.m_fixtureList = next;
            }
            body1.m_fixtureCount--;
            f.m_next = body2.m_fixtureList;
            body2.m_fixtureList = f;
            body2.m_fixtureCount++;
            f.m_body = body2;
            f = next;
        }
        else {
            prev = f;
            f = f.m_next;
        }
    }
    body1.ResetMassData();
    body2.ResetMassData();
    var center1 = body1.GetWorldCenter();
    var center2 = body2.GetWorldCenter();
    var velocity1 = Box2D.Math.AddVV(linearVelocity, Box2D.Math.CrossFV(angularVelocity, Box2D.Math.SubtractVV(center1, 
       center)));
    var velocity2 = Box2D.Math.AddVV(linearVelocity, Box2D.Math.CrossFV(angularVelocity, Box2D.Math.SubtractVV(center2, 
       center)));
    body1.SetLinearVelocity(velocity1);
    body2.SetLinearVelocity(velocity2);
    body1.SetAngularVelocity(angularVelocity);
    body2.SetAngularVelocity(angularVelocity);
    body1.SynchronizeFixtures();
    body2.SynchronizeFixtures();
    return body2;
};
 
 Box2D.Body.prototype.Merge = function(other){
    var body1 = this;
    var body2 = other;
    var f;
    for (f = other.m_fixtureList;f;){
        var next = f.m_next;
        other.m_fixtureCount--;
        f.m_next = body1.m_fixtureList;
        body1.m_fixtureList = f;
        body1.m_fixtureCount++;
        f.m_body = undefined;
        f = next;
    }
    body2.m_fixtureCount = 0;
	
    var center1 = body1.GetWorldCenter();
    var center2 = body2.GetWorldCenter();
    var velocity1 = body1.GetLinearVelocity().Copy();
    var velocity2 = body2.GetLinearVelocity().Copy();
    var angular1 = body1.GetAngularVelocity();
    var angular = body2.GetAngularVelocity();
    body1.ResetMassData();
    this.SynchronizeFixtures();
};
 
 Box2D.Body.prototype.GetMass = function(){
    return this.m_mass;
};
 
 Box2D.Body.prototype.GetInertia = function(){
    return this.m_I;
};
 
 Box2D.Body.prototype.GetMassData = function(data){
    data.mass = this.m_mass;
    data.I = this.m_I;
    data.center.SetV(this.m_sweep.localCenter);
};
 
 Box2D.Body.prototype.SetMassData = function(massData){
    Box2D.Settings.b2Assert(this.m_world.IsLocked() === false);
    if (this.m_world.IsLocked() === true){
        return;
    }
    if (this.m_type != Box2D.Body.b2_dynamicBody){
        return;
    }
    this.m_invMass = 0;
    this.m_I = 0;
    this.m_invI = 0;
    this.m_mass = massData.mass;
    if (this.m_mass <= 0){
        this.m_mass = 1;
    }
    this.m_invMass = 1 / this.m_mass;
    if (massData.I > 0 && (this.m_flags & Box2D.Body.e_fixedRotationFlag) === 0){
        this.m_I = massData.I - this.m_mass * (massData.center.x * massData.center.x + massData.center.y * massData.center.y);
        this.m_invI = 1 / this.m_I;
    }
    var oldCenter = this.m_sweep.c.Copy();
    this.m_sweep.localCenter.SetV(massData.center);
    this.m_sweep.c0.SetV(Box2D.Math.MulX(this.m_xf, this.m_sweep.localCenter));
    this.m_sweep.c.SetV(this.m_sweep.c0);
    this.m_linearVelocity.x += this.m_angularVelocity * - (this.m_sweep.c.y - oldCenter.y);
    this.m_linearVelocity.y += this.m_angularVelocity * + (this.m_sweep.c.x - oldCenter.x);
};
 
 Box2D.Body.prototype.ResetMassData = function(){
    this.m_mass = 0;
    this.m_invMass = 0;
    this.m_I = 0;
    this.m_invI = 0;
    this.m_sweep.localCenter.SetZero();
    if (this.m_type == Box2D.Body.b2_staticBody || this.m_type == Box2D.Body.b2_kinematicBody){
        return;
    }
    var center = Box2D.Vec2.Make(0, 0);
    for (var f = this.m_fixtureList;f;f = f.m_next){
        if (f.m_density === 0){
            continue;
        }
        var massData = f.GetMassData();
        this.m_mass += massData.mass;
        center.x += massData.center.x * massData.mass;
        center.y += massData.center.y * massData.mass;
        this.m_I += massData.I;
    }
    if (this.m_mass > 0){
        this.m_invMass = 1 / this.m_mass;
        center.x *= this.m_invMass;
        center.y *= this.m_invMass;
    }
    else {
        this.m_mass = 1;
        this.m_invMass = 1;
    }
    if (this.m_I > 0 && (this.m_flags & Box2D.Body.e_fixedRotationFlag) === 0){
        this.m_I -= this.m_mass * (center.x * center.x + center.y * center.y);
        this.m_I *= this.m_inertiaScale;
        Box2D.Settings.b2Assert(this.m_I > 0);
        this.m_invI = 1 / this.m_I;
    }
    else {
        this.m_I = 0;
        this.m_invI = 0;
    }
    var oldCenter = this.m_sweep.c.Copy();
    this.m_sweep.localCenter.SetV(center);
    this.m_sweep.c0.SetV(Box2D.Math.MulX(this.m_xf, this.m_sweep.localCenter));
    this.m_sweep.c.SetV(this.m_sweep.c0);
    this.m_linearVelocity.x += this.m_angularVelocity * - (this.m_sweep.c.y - oldCenter.y);
    this.m_linearVelocity.y += this.m_angularVelocity * + (this.m_sweep.c.x - oldCenter.x);
};
 
 Box2D.Body.prototype.GetWorldPoint = function(localPoint){
    var A = this.m_xf.R;
    var u = new Box2D.Vec2(A.col1.x * localPoint.x + A.col2.x * localPoint.y, A.col1.y * localPoint.x + A.col2.y * 
       localPoint.y);
    u.x += this.m_xf.position.x;
    u.y += this.m_xf.position.y;
    return u;
};
 
 Box2D.Body.prototype.GetWorldVector = function(localVector){
    return Box2D.Math.MulMV(this.m_xf.R, localVector);
};
 
 Box2D.Body.prototype.GetLocalPoint = function(worldPoint){
    return Box2D.Math.MulXT(this.m_xf, worldPoint);
};
 
 Box2D.Body.prototype.GetLocalVector = function(worldVector){
    return Box2D.Math.MulTMV(this.m_xf.R, worldVector);
};
 
 Box2D.Body.prototype.GetLinearVelocityFromWorldPoint = function(worldPoint){
    return new Box2D.Vec2(this.m_linearVelocity.x - this.m_angularVelocity * (worldPoint.y - this.m_sweep.c.y), this.m_linearVelocity.y + 
       this.m_angularVelocity * (worldPoint.x - this.m_sweep.c.x));
};
 
 Box2D.Body.prototype.GetLinearVelocityFromLocalPoint = function(localPoint){
    var A = this.m_xf.R;
    var worldPoint = new Box2D.Vec2(A.col1.x * localPoint.x + A.col2.x * localPoint.y, A.col1.y * localPoint.x + A.col2.y * 
       localPoint.y);
    worldPoint.x += this.m_xf.position.x;
    worldPoint.y += this.m_xf.position.y;
    return new Box2D.Vec2(this.m_linearVelocity.x - this.m_angularVelocity * (worldPoint.y - this.m_sweep.c.y), this.m_linearVelocity.y + this.m_angularVelocity * (worldPoint.x - 
       this.m_sweep.c.x));
};
 
 Box2D.Body.prototype.GetLinearDamping = function(){
    return this.m_linearDamping;
};
 
 Box2D.Body.prototype.SetLinearDamping = function(linearDamping){
    this.m_linearDamping = linearDamping;
};
 
 Box2D.Body.prototype.GetAngularDamping = function(){
    return this.m_angularDamping;
};
 
 Box2D.Body.prototype.SetAngularDamping = function(angularDamping){
    this.m_angularDamping = angularDamping;
};
 
 Box2D.Body.prototype.SetType = function(type){
    if (this.m_type == type){
        return;
    }
    this.m_type = type;
    this.ResetMassData();
    if (this.m_type == Box2D.Body.b2_staticBody){
        this.m_linearVelocity.SetZero();
        this.m_angularVelocity = 0;
    }
    this.SetAwake(true);
    this.m_force.SetZero();
    this.m_torque = 0;
    for (var ce = this.m_contactList;ce;ce = ce.next)        {
        ce.contact.FlagForFiltering();
    }
};
 
 Box2D.Body.prototype.GetType = function(){
    return this.m_type;
};
 
 Box2D.Body.prototype.SetBullet = function(flag){
    if (flag){
        this.m_flags |= Box2D.Body.e_bulletFlag;
    }
    else {
        this.m_flags &= ~ Box2D.Body.e_bulletFlag;
    }
};
 
 Box2D.Body.prototype.IsBullet = function(){
    return (this.m_flags & Box2D.Body.e_bulletFlag) == Box2D.Body.e_bulletFlag;
};
 
 Box2D.Body.prototype.SetSleepingAllowed = function(flag){
    if (flag){
        this.m_flags |= Box2D.Body.e_allowSleepFlag;
    }
    else {
        this.m_flags &= ~ Box2D.Body.e_allowSleepFlag;
        this.SetAwake(true);
    }
};
 
 Box2D.Body.prototype.SetAwake = function(flag){
    if (flag && this.m_type !== Box2D.Body.b2_staticBody ){
        this.m_flags |= Box2D.Body.e_awakeFlag;
        this.m_sleepTime = 0;
    }
    else {
        this.m_flags &= ~ Box2D.Body.e_awakeFlag;
        this.m_sleepTime = 0;
        this.m_linearVelocity.SetZero();
        this.m_angularVelocity = 0;
        this.m_force.SetZero();
        this.m_torque = 0;
    }
};
 
 Box2D.Body.prototype.IsAwake = function(){
    return (this.m_flags & Box2D.Body.e_awakeFlag) == Box2D.Body.e_awakeFlag;
};
 
 Box2D.Body.prototype.SetFixedRotation = function(fixed){
    if (fixed){
        this.m_flags |= Box2D.Body.e_fixedRotationFlag;
    }
    else {
        this.m_flags &= ~ Box2D.Body.e_fixedRotationFlag;
    }
    this.ResetMassData();
};
 
 Box2D.Body.prototype.IsFixedRotation = function(){
    return (this.m_flags & Box2D.Body.e_fixedRotationFlag) == Box2D.Body.e_fixedRotationFlag;
};
 
 Box2D.Body.prototype.SetActive = function(flag){
    if (flag == this.IsActive()){
        return;
    }
    var broadPhase;
    var f;
    if (flag){
        this.m_flags |= Box2D.Body.e_activeFlag;
        broadPhase = this.m_world.m_contactManager.m_broadPhase;
        for (f = this.m_fixtureList;f;f = f.m_next){
            f.CreateProxy(broadPhase, this.m_xf);
        }
    }
    else {
        this.m_flags &= ~ Box2D.Body.e_activeFlag;
        broadPhase = this.m_world.m_contactManager.m_broadPhase;
        for (f = this.m_fixtureList;f;f = f.m_next){
            f.DestroyProxy(broadPhase);
        }
        var ce = this.m_contactList;
        while (ce){
            var ce0 = ce;
            ce = ce.next;
            this.m_world.m_contactManager.Destroy(ce0.contact);
        }
        this.m_contactList = undefined;
    }
};
 
 Box2D.Body.prototype.IsActive = function(){
    return (this.m_flags & Box2D.Body.e_activeFlag) == Box2D.Body.e_activeFlag;
};
 
 Box2D.Body.prototype.IsSleepingAllowed = function(){
    return (this.m_flags & Box2D.Body.e_allowSleepFlag) == Box2D.Body.e_allowSleepFlag;
};
 
 Box2D.Body.prototype.GetFixtureList = function(){
    return this.m_fixtureList;
};
 
 Box2D.Body.prototype.GetJointList = function(){
    return this.m_jointList;
};
 
 Box2D.Body.prototype.GetControllerList = function(){
    return this.m_controllerList;
};
 
 Box2D.Body.prototype.GetContactList = function(){
    return this.m_contactList;
};
 
 Box2D.Body.prototype.GetNext = function(){
    return this.m_next;
};
 
 Box2D.Body.prototype.GetUserData = function(){
    return this.m_userData;
};
 
 Box2D.Body.prototype.SetUserData = function(data){
    this.m_userData = data;
};
 
 Box2D.Body.prototype.GetWorld = function(){
    return this.m_world;
};
 Box2D.Body.prototype.m_flags = 0;
 Box2D.Body.prototype.m_type = 0;
 Box2D.Body.prototype.m_islandIndex = 0;
 Box2D.Body.prototype.m_xf = new Box2D.Transform();
 Box2D.Body.prototype.m_sweep = new Box2D.Sweep();
 Box2D.Body.prototype.m_linearVelocity = new Box2D.Vec2();
 Box2D.Body.prototype.m_angularVelocity = undefined;
 Box2D.Body.prototype.m_force = new Box2D.Vec2();
 Box2D.Body.prototype.m_torque = undefined;
 Box2D.Body.prototype.m_world = undefined;
 Box2D.Body.prototype.m_prev = undefined;
 Box2D.Body.prototype.m_next = undefined;
 Box2D.Body.prototype.m_fixtureList = undefined;
 Box2D.Body.prototype.m_fixtureCount = 0;
 Box2D.Body.prototype.m_controllerList = undefined;
 Box2D.Body.prototype.m_controllerCount = 0;
 Box2D.Body.prototype.m_jointList = undefined;
 Box2D.Body.prototype.m_contactList = undefined;
 Box2D.Body.prototype.m_mass = undefined;
 Box2D.Body.prototype.m_invMass = undefined;
 Box2D.Body.prototype.m_I = undefined;
 Box2D.Body.prototype.m_invI = undefined;
 Box2D.Body.prototype.m_inertiaScale = undefined;
 Box2D.Body.prototype.m_linearDamping = undefined;
 Box2D.Body.prototype.m_angularDamping = undefined;
 Box2D.Body.prototype.m_sleepTime = undefined;
 Box2D.Body.prototype.m_userData = undefined;
 
 Box2D.ContactImpulse = function(){
    this.__varz();
    this.__constructor.apply(this, arguments);
};
 
 Box2D.ContactImpulse.prototype.__constructor = function(){
};
 Box2D.ContactImpulse.prototype.__varz = function(){
    this.normalImpulses =[];
    this.tangentImpulses =[];
};
 Box2D.ContactImpulse.prototype.normalImpulses =[];
 Box2D.ContactImpulse.prototype.tangentImpulses =[];
 
 Box2D.TensorDampingController = function(){
    Box2D.Controller.prototype.__varz.call(this);
    this.__varz();
    this.__constructor.apply(this, arguments);
};
 extend(Box2D.TensorDampingController.prototype, Box2D.Controller.prototype);
 Box2D.TensorDampingController.prototype._super = Box2D.Controller.prototype;
 
 Box2D.TensorDampingController.prototype.__constructor = function(){
    this._super.__constructor.apply(this, arguments);
};
 
 Box2D.TensorDampingController.prototype.__varz = function(){
    this.T = new Box2D.Mat22();
};
 
 Box2D.TensorDampingController.prototype.SetAxisAligned = function(xDamping, yDamping){
    this.T.col1.x = - xDamping;
    this.T.col1.y = 0;
    this.T.col2.x = 0;
    this.T.col2.y = - yDamping;
    if (xDamping > 0 || yDamping > 0){
        this.maxTimestep = 1 / Math.max(xDamping, yDamping);
    }
    else {
        this.maxTimestep = 0;
    }
};
 
 Box2D.TensorDampingController.prototype.Step = function(step){
    var timestep = step.dt;
    if (timestep <= Number.MIN_VALUE){
        return;
    }
    if (timestep > this.maxTimestep && this.maxTimestep > 0){
        timestep = this.maxTimestep;
    }
    for (var i = this.m_bodyList;i;i = i.nextBody){
        var body = i.body;
        if ( ! body.IsAwake()){
            continue;
        }
        var damping = body.GetWorldVector(Box2D.Math.MulMV(this.T, body.GetLocalVector(body.GetLinearVelocity())));
        body.SetLinearVelocity(new Box2D.Vec2(body.GetLinearVelocity().x + damping.x * timestep, body.GetLinearVelocity().y + 
           damping.y * timestep));
    }
};
 Box2D.TensorDampingController.prototype.T = new Box2D.Mat22();
 Box2D.TensorDampingController.prototype.maxTimestep = 0;
 
 Box2D.ManifoldPoint = function()    {
    this.__varz();
    this.__constructor.apply(this, arguments);
};
 
 Box2D.ManifoldPoint.prototype.__constructor = function(){
    this.Reset();
};
 
 Box2D.ManifoldPoint.prototype.__varz = function(){
    this.m_localPoint = new Box2D.Vec2();
    this.m_id = new Box2D.ContactID();
};
 
 Box2D.ManifoldPoint.prototype.Reset = function(){
    this.m_localPoint.SetZero();
    this.m_normalImpulse = 0;
    this.m_tangentImpulse = 0;
    this.m_id.key = 0;
};
 
 Box2D.ManifoldPoint.prototype.Set = function(m){
    this.m_localPoint.SetV(m.m_localPoint);
    this.m_normalImpulse = m.m_normalImpulse;
    this.m_tangentImpulse = m.m_tangentImpulse;
    this.m_id.Set(m.m_id);
};
 Box2D.ManifoldPoint.prototype.m_localPoint = new Box2D.Vec2();
 Box2D.ManifoldPoint.prototype.m_normalImpulse = undefined;
 Box2D.ManifoldPoint.prototype.m_tangentImpulse = undefined;
 Box2D.ManifoldPoint.prototype.m_id = new Box2D.ContactID();
 
 Box2D.PolygonShape = function(){
    Box2D.Shape.prototype.__varz.call(this);
    this.__varz();
    this.__constructor.apply(this, arguments);
};
 extend(Box2D.PolygonShape.prototype, Box2D.Shape.prototype);
 Box2D.PolygonShape.prototype._super = Box2D.Shape.prototype;
 
 Box2D.PolygonShape.prototype.__constructor = function(){
    this._super.__constructor.apply(this, arguments);
    this.m_type = Box2D.Shape.e_polygonShape;
    this.m_centroid = new Box2D.Vec2();
    this.m_vertices =[];
    this.m_normals =[];
};
 
 Box2D.PolygonShape.prototype.__varz = function(){
};
 Box2D.PolygonShape.AsArray = function(vertices, vertexCount){
    var polygonShape = new Box2D.PolygonShape();
    polygonShape.SetAsArray(vertices, vertexCount);
    return polygonShape;
};
 
 Box2D.PolygonShape.AsVector = function(vertices, vertexCount){
    var polygonShape = new Box2D.PolygonShape();
    polygonShape.SetAsVector(vertices, vertexCount);
    return polygonShape;
};
 
 Box2D.PolygonShape.AsBox = function(hx, hy){
    var polygonShape = new Box2D.PolygonShape();
    polygonShape.SetAsBox(hx, hy);
    return polygonShape;
};
 
 Box2D.PolygonShape.AsOrientedBox = function(hx, hy, center, angle){
    var polygonShape = new Box2D.PolygonShape();
    polygonShape.SetAsOrientedBox(hx, hy, center, angle);
    return polygonShape;
};
 
 Box2D.PolygonShape.AsEdge = function(v1, v2){
    var polygonShape = new Box2D.PolygonShape();
    polygonShape.SetAsEdge(v1, v2);
    return polygonShape;
};
 
 Box2D.PolygonShape.ComputeCentroid = function(vs, count){
    var c = new Box2D.Vec2();
    var area = 0;
    var p1X = 0;
    var p1Y = 0;
    var inv3 = 1 / 3;
    for (var i = 0;i < count; ++i){
        var p2 = vs[i];
        var p3 = i + 1 < count ? vs[i + 1]: vs[0];
        var e1X = p2.x - p1X;
        var e1Y = p2.y - p1Y;
        var e2X = p3.x - p1X;
        var e2Y = p3.y - p1Y;
        var D = e1X * e2Y - e1Y * e2X;
        var triangleArea = 0.5 * D;
        area += triangleArea;
        c.x += triangleArea * inv3 * (p1X + p2.x + p3.x);
        c.y += triangleArea * inv3 * (p1Y + p2.y + p3.y);
    }
    c.x *= 1 / area;
    c.y *= 1 / area;
    return c;
};
 
 Box2D.PolygonShape.ComputeOBB = function(obb, vs, count){
    var i = 0;
    var p =[];
    for (i = 0;i < count; ++i){
        p[i] = vs[i];
    }
    p[count] = p[0];
    var minArea = Number.MAX_VALUE;
    for (i = 1;i <= count; ++i){
        var root = p[i - 1];
        var uxX = p[i].x - root.x;
        var uxY = p[i].y - root.y;
        var length = Math.sqrt(uxX * uxX + uxY * uxY);
        uxX /= length;
        uxY /= length;
        var uyX = - uxY;
        var uyY = uxX;
        var lowerX = Number.MAX_VALUE;
        var lowerY = Number.MAX_VALUE;
        var upperX = - Number.MAX_VALUE;
        var upperY = - Number.MAX_VALUE;
        for (var j = 0;j < count; ++ j){
            var dX = p[j].x - root.x;
            var dY = p[j].y - root.y;
            var rX = uxX * dX + uxY * dY;
            var rY = uyX * dX + uyY * dY;
            if (rX < lowerX){
                lowerX = rX;
            }
            if (rY < lowerY){
                lowerY = rY;
            }
            if (rX > upperX){
                upperX = rX;
            }
            if (rY > upperY){
                upperY = rY;
            }
        }
        var area = (upperX - lowerX) * (upperY - lowerY);
        if (area < 0.95 * minArea){
            minArea = area;
            obb.R.col1.x = uxX;
            obb.R.col1.y = uxY;
            obb.R.col2.x = uyX;
            obb.R.col2.y = uyY;
            var centerX = 0.5 * (lowerX + upperX);
            var centerY = 0.5 * (lowerY + upperY);
            var tMat = obb.R;
            obb.center.x = root.x + (tMat.col1.x * centerX + tMat.col2.x * centerY);
            obb.center.y = root.y + (tMat.col1.y * centerX + tMat.col2.y * centerY);
            obb.extents.x = 0.5 * (upperX - lowerX);
            obb.extents.y = 0.5 * (upperY - lowerY);
        }
    }
};
 Box2D.PolygonShape.s_mat = new Box2D.Mat22();
 
 Box2D.PolygonShape.prototype.Validate = function(){
    return false;
};
 
 Box2D.PolygonShape.prototype.Reserve = function(count){
    for (var i = this.m_vertices.length;i < count;i++){
        this.m_vertices[i] = new Box2D.Vec2();
        this.m_normals[i] = new Box2D.Vec2();
    }
};
 
 Box2D.PolygonShape.prototype.Copy = function(){
    var s = new Box2D.PolygonShape();
    s.Set(this);
    return s;
};
 
 Box2D.PolygonShape.prototype.Set = function(other){
    this._super.Set.apply(this,[other]);
    if (isInstanceOf(other, Box2D.PolygonShape)){
        var other2 = other;
        this.m_centroid.SetV(other2.m_centroid);
        this.m_vertexCount = other2.m_vertexCount;
        this.Reserve(this.m_vertexCount);
        for (var i = 0;i < this.m_vertexCount;i++){
            this.m_vertices[i].SetV(other2.m_vertices[i]);
            this.m_normals[i].SetV(other2.m_normals[i]);
        }
    }
};
 
 Box2D.PolygonShape.prototype.SetAsArray = function(vertices, vertexCount){
    var v =[];
    var tVec;
    for (var i = 0;i < vertices.length;i++){
        tVec = vertices[i];
        v.push(tVec);
    }
    this.SetAsVector(v, vertexCount);
};
 
 Box2D.PolygonShape.prototype.SetAsVector = function(vertices, vertexCount){
    if (typeof vertexCount == "undefined"){
        vertexCount = vertices.length;
    }
    Box2D.Settings.b2Assert(2 <= vertexCount);
    this.m_vertexCount = vertexCount;
    this.Reserve(vertexCount);
    var i = 0;
    for (i = 0;i < this.m_vertexCount;i++){
        this.m_vertices[i].SetV(vertices[i]);
    }
    for (i = 0;i < this.m_vertexCount; ++i){
        var i1 = i;
        var i2 = i + 1 < this.m_vertexCount ? i + 1: 0;
        var edge = Box2D.Math.SubtractVV(this.m_vertices[i2], this.m_vertices[i1]);
        Box2D.Settings.b2Assert(edge.LengthSquared() > Number.MIN_VALUE);
        this.m_normals[i].SetV(Box2D.Math.CrossVF(edge, 1));
        this.m_normals[i].Normalize();
    }
    this.m_centroid = Box2D.PolygonShape.ComputeCentroid(this.m_vertices, this.m_vertexCount);
};
 
 Box2D.PolygonShape.prototype.SetAsBox = function(hx, hy){
    this.m_vertexCount = 4;
    this.Reserve(4);
    this.m_vertices[0].Set( - hx, - hy);
    this.m_vertices[1].Set(hx, - hy);
    this.m_vertices[2].Set(hx, hy);
    this.m_vertices[3].Set( - hx, hy);
    this.m_normals[0].Set(0, - 1);
    this.m_normals[1].Set(1, 0);
    this.m_normals[2].Set(0, 1);
    this.m_normals[3].Set( - 1, 0);
    this.m_centroid.SetZero();
};
 
 Box2D.PolygonShape.prototype.SetAsOrientedBox = function(hx, hy, center, angle){
    this.m_vertexCount = 4;
    this.Reserve(4);
    this.m_vertices[0].Set( - hx, - hy);
    this.m_vertices[1].Set(hx, - hy);
    this.m_vertices[2].Set(hx, hy);
    this.m_vertices[3].Set( - hx, hy);
    this.m_normals[0].Set(0, - 1);
    this.m_normals[1].Set(1, 0);
    this.m_normals[2].Set(0, 1);
    this.m_normals[3].Set( - 1, 0);
    this.m_centroid = center;
    var xf = new Box2D.Transform();
    xf.position = center;
    xf.R.Set(angle);
    for (var i = 0;i < this.m_vertexCount; ++i){
        this.m_vertices[i] = Box2D.Math.MulX(xf, this.m_vertices[i]);
        this.m_normals[i] = Box2D.Math.MulMV(xf.R, this.m_normals[i]);
    }
};
 
 Box2D.PolygonShape.prototype.SetAsEdge = function(v1, v2){
    this.m_vertexCount = 2;
    this.Reserve(2);
    this.m_vertices[0].SetV(v1);
    this.m_vertices[1].SetV(v2);
    this.m_centroid.x = 0.5 * (v1.x + v2.x);
    this.m_centroid.y = 0.5 * (v1.y + v2.y);
    this.m_normals[0] = Box2D.Math.CrossVF(Box2D.Math.SubtractVV(v2, v1), 1);
    this.m_normals[0].Normalize();
    this.m_normals[1].x = - this.m_normals[0].x;
    this.m_normals[1].y = - this.m_normals[0].y;
};
 
 Box2D.PolygonShape.prototype.TestPoint = function(xf, p){
    var tVec;
    var tMat = xf.R;
    var tX = p.x - xf.position.x;
    var tY = p.y - xf.position.y;
    var pLocalX = tX * tMat.col1.x + tY * tMat.col1.y;
    var pLocalY = tX * tMat.col2.x + tY * tMat.col2.y;
    for (var i = 0;i < this.m_vertexCount; ++i){
        tVec = this.m_vertices[i];
        tX = pLocalX - tVec.x;
        tY = pLocalY - tVec.y;
        tVec = this.m_normals[i];
        var dot = tVec.x * tX + tVec.y * tY;
        if (dot > 0){
            return false;
        }
    }
    return true;
};
 
 Box2D.PolygonShape.prototype.RayCast = function(output, input, transform){
    var lower = 0;
    var upper = input.maxFraction;
    var tX;
    var tY;
    var tMat;
    var tVec;
    tX = input.p1.x - transform.position.x;
    tY = input.p1.y - transform.position.y;
    tMat = transform.R;
    var p1X = tX * tMat.col1.x + tY * tMat.col1.y;
    var p1Y = tX * tMat.col2.x + tY * tMat.col2.y;
    tX = input.p2.x - transform.position.x;
    tY = input.p2.y - transform.position.y;
    tMat = transform.R;
    var p2X = tX * tMat.col1.x + tY * tMat.col1.y;
    var p2Y = tX * tMat.col2.x + tY * tMat.col2.y;
    var dX = p2X - p1X;
    var dY = p2Y - p1Y;
    var index = - 1;
    for (var i = 0;i < this.m_vertexCount; ++i){
        tVec = this.m_vertices[i];
        tX = tVec.x - p1X;
        tY = tVec.y - p1Y;
        tVec = this.m_normals[i];
        var numerator = tVec.x * tX + tVec.y * tY;
        var denominator = tVec.x * dX + tVec.y * dY;
        if (denominator === 0){
            if (numerator < 0){
                return false;
            }
        }
        else {
            if (denominator < 0 && numerator < lower * denominator){
                lower = numerator / denominator;
                index = i;
            }
            else {
                if (denominator > 0 && numerator < upper * denominator){
                    upper = numerator / denominator;
                }
            }
        }
        if (upper < lower - Number.MIN_VALUE){
            return false;
        }
    }
    if (index >= 0){
        output.fraction = lower;
        tMat = transform.R;
        tVec = this.m_normals[index];
        output.normal.x = tMat.col1.x * tVec.x + tMat.col2.x * tVec.y;
        output.normal.y = tMat.col1.y * tVec.x + tMat.col2.y * tVec.y;
        return true;
    }
    return false;
};
 
 Box2D.PolygonShape.prototype.ComputeAABB = function(aabb, xf){
    var tMat = xf.R;
    var tVec = this.m_vertices[0];
    var lowerX = xf.position.x + (tMat.col1.x * tVec.x + tMat.col2.x * tVec.y);
    var lowerY = xf.position.y + (tMat.col1.y * tVec.x + tMat.col2.y * tVec.y);
    var upperX = lowerX;
    var upperY = lowerY;
    for (var i = 1;i < this.m_vertexCount; ++i){
        tVec = this.m_vertices[i];
        var vX = xf.position.x + (tMat.col1.x * tVec.x + tMat.col2.x * tVec.y);
        var vY = xf.position.y + (tMat.col1.y * tVec.x + tMat.col2.y * tVec.y);
        lowerX = lowerX < vX ? lowerX: vX;
        lowerY = lowerY < vY ? lowerY: vY;
        upperX = upperX > vX ? upperX: vX;
        upperY = upperY > vY ? upperY: vY;
    }
    aabb.lowerBound.x = lowerX - this.m_radius;
    aabb.lowerBound.y = lowerY - this.m_radius;
    aabb.upperBound.x = upperX + this.m_radius;
    aabb.upperBound.y = upperY + this.m_radius;
};
 
 Box2D.PolygonShape.prototype.ComputeMass = function(massData, density){
    if (this.m_vertexCount == 2){
        massData.center.x = 0.5 * (this.m_vertices[0].x + this.m_vertices[1].x);
        massData.center.y = 0.5 * (this.m_vertices[0].y + this.m_vertices[1].y);
        massData.mass = 0;
        massData.I = 0;
        return;
    }
    var centerX = 0;
    var centerY = 0;
    var area = 0;
    var I = 0;
    var p1X = 0;
    var p1Y = 0;
    var k_inv3 = 1 / 3;
    for (var i = 0;i < this.m_vertexCount; ++i){
        var p2 = this.m_vertices[i];
        var p3 = i + 1 < this.m_vertexCount ? this.m_vertices[i + 1]: this.m_vertices[0];
        var e1X = p2.x - p1X;
        var e1Y = p2.y - p1Y;
        var e2X = p3.x - p1X;
        var e2Y = p3.y - p1Y;
        var D = e1X * e2Y - e1Y * e2X;
        var triangleArea = 0.5 * D;
        area += triangleArea;
        centerX += triangleArea * k_inv3 * (p1X + p2.x + p3.x);
        centerY += triangleArea * k_inv3 * (p1Y + p2.y + p3.y);
        var px = p1X;
        var py = p1Y;
        var ex1 = e1X;
        var ey1 = e1Y;
        var ex2 = e2X;
        var ey2 = e2Y;
        var intx2 = k_inv3 * (0.25 * (ex1 * ex1 + ex2 * ex1 + ex2 * ex2) + (px * ex1 + px * ex2)) + 0.5 * px * px;
        var inty2 = k_inv3 * (0.25 * (ey1 * ey1 + ey2 * ey1 + ey2 * ey2) + (py * ey1 + py * ey2)) + 0.5 * py * py;
        I += D * (intx2 + inty2);
    }
    massData.mass = density * area;
    centerX *= 1 / area;
    centerY *= 1 / area;
    massData.center.Set(centerX, centerY);
    massData.I = density * I;
};
 
 Box2D.PolygonShape.prototype.ComputeSubmergedArea = function(normal, offset, xf, c){
    var normalL = Box2D.Math.MulTMV(xf.R, normal);
    var offsetL = offset - Box2D.Math.Dot(normal, xf.position);
    var depths =[];
    var diveCount = 0;
    var intoIndex = - 1;
    var outoIndex = - 1;
    var lastSubmerged = false;
    var i = 0;
    for (i = 0;i < this.m_vertexCount; ++i){
        depths[i] = Box2D.Math.Dot(normalL, this.m_vertices[i]) - offsetL;
        var isSubmerged = depths[i] < - Number.MIN_VALUE;
        if (i > 0){
            if (isSubmerged){
                if ( ! lastSubmerged){
                    intoIndex = i - 1;
                    diveCount++;
                }
            }
            else {
                if (lastSubmerged){
                    outoIndex = i - 1;
                    diveCount++;
                }
            }
        }
        lastSubmerged = isSubmerged;
    }
    switch (diveCount){
        case 0: 
            if (lastSubmerged){
                var md = new Box2D.MassData();
                this.ComputeMass(md, 1);
                c.SetV(Box2D.Math.MulX(xf, md.center));
                return md.mass;
            }
            else {
                return 0;
            }
            break;
        case 1: 
            if (intoIndex == - 1){
                intoIndex = this.m_vertexCount - 1;
            }
            else {
                outoIndex = this.m_vertexCount - 1;
            }
            break;
    }
    var intoIndex2 = (intoIndex + 1) % this.m_vertexCount;
    var outoIndex2 = (outoIndex + 1) % this.m_vertexCount;
    var intoLamdda = (0 - depths[intoIndex]) / (depths[intoIndex2] - depths[intoIndex]);
    var outoLamdda = (0 - depths[outoIndex]) / (depths[outoIndex2] - depths[outoIndex]);
    var intoVec = new Box2D.Vec2(this.m_vertices[intoIndex].x * (1 - intoLamdda) + this.m_vertices[intoIndex2].x * 
       intoLamdda, this.m_vertices[intoIndex].y * (1 - intoLamdda) + this.m_vertices[intoIndex2].y * intoLamdda);
    var outoVec = new Box2D.Vec2(this.m_vertices[outoIndex].x * (1 - outoLamdda) + this.m_vertices[outoIndex2].x * outoLamdda, this.m_vertices[outoIndex].y * 
       (1 - outoLamdda) + this.m_vertices[outoIndex2].y * outoLamdda);
    var area = 0;
    var center = new Box2D.Vec2();
    var p2 = this.m_vertices[intoIndex2];
    var p3;
    i = intoIndex2;
    while (i != outoIndex2){
        i = (i + 1) % this.m_vertexCount;
        if (i == outoIndex2){
            p3 = outoVec;
        }
        else {
            p3 = this.m_vertices[i];
        }
        var triangleArea = 0.5 * ((p2.x - intoVec.x) * (p3.y - intoVec.y) - (p2.y - intoVec.y) * (p3.x - intoVec.x));
        area += triangleArea;
        center.x += triangleArea * (intoVec.x + p2.x + p3.x) / 3;
        center.y += triangleArea * (intoVec.y + p2.y + p3.y) / 3;
        p2 = p3;
    }
    center.Multiply(1 / area);
    c.SetV(Box2D.Math.MulX(xf, center));
    return area;
};
 
 Box2D.PolygonShape.prototype.GetVertexCount = function(){
    return this.m_vertexCount;
};
 
 Box2D.PolygonShape.prototype.GetVertices = function(){
    return this.m_vertices;
};
 
 Box2D.PolygonShape.prototype.GetNormals = function(){
    return this.m_normals;
};
 
 Box2D.PolygonShape.prototype.GetSupport = function(d){
    var bestIndex = 0;
    var bestValue = this.m_vertices[0].x * d.x + this.m_vertices[0].y * d.y;
    for (var i = 1;i < this.m_vertexCount; ++i){
        var value = this.m_vertices[i].x * d.x + this.m_vertices[i].y * d.y;
        if (value > bestValue){
            bestIndex = i;
            bestValue = value;
        }
    }
    return bestIndex;
};
 
 Box2D.PolygonShape.prototype.GetSupportVertex = function(d){
    var bestIndex = 0;
    var bestValue = this.m_vertices[0].x * d.x + this.m_vertices[0].y * d.y;
    for (var i = 1;i < this.m_vertexCount; ++i){
        var value = this.m_vertices[i].x * d.x + this.m_vertices[i].y * d.y;
        if (value > bestValue){
            bestIndex = i;
            bestValue = value;
        }
    }
    return this.m_vertices[bestIndex];
};
 Box2D.PolygonShape.prototype.m_centroid = undefined;
 Box2D.PolygonShape.prototype.m_vertices = undefined;
 Box2D.PolygonShape.prototype.m_normals = undefined;
 Box2D.PolygonShape.prototype.m_vertexCount = 0;
 
 Box2D.Fixture = function(){
    this.__varz();
    this.__constructor.apply(this, arguments);
};
 
 Box2D.Fixture.prototype.__constructor = function(){
    this.m_aabb = new Box2D.AABB();
    this.m_userData = undefined;
    this.m_body = undefined;
    this.m_next = undefined;
    this.m_shape = undefined;
    this.m_density = 0;
    this.m_friction = 0;
    this.m_restitution = 0;
};
 
 Box2D.Fixture.prototype.__varz = function()    {
    this.m_filter = new Box2D.FilterData();
};
 
 Box2D.Fixture.prototype.Create = function(body, xf, def){
    this.m_userData = def.userData;
    this.m_friction = def.friction;
    this.m_restitution = def.restitution;
    this.m_body = body;
    this.m_next = undefined;
    this.m_filter = def.filter.Copy();
    this.m_isSensor = def.isSensor;
    this.m_shape = def.shape.Copy();
    this.m_density = def.density;
};
 
 Box2D.Fixture.prototype.Destroy = function(){
    this.m_shape = undefined;
};
 
 Box2D.Fixture.prototype.CreateProxy = function(broadPhase, xf){
    this.m_shape.ComputeAABB(this.m_aabb, xf);
    this.m_proxy = broadPhase.CreateProxy(this.m_aabb, this);
};
 
 Box2D.Fixture.prototype.DestroyProxy = function(broadPhase){
    if (typeof this.m_proxy === "undefined"){
        return;
    }
    broadPhase.DestroyProxy(this.m_proxy);
    this.m_proxy = undefined;
};
 
 Box2D.Fixture.prototype.Synchronize = function(broadPhase, transform1, transform2){
    if ( ! this.m_proxy){
        return;
    }
    var aabb1 = new Box2D.AABB();
    var aabb2 = new Box2D.AABB();
    this.m_shape.ComputeAABB(aabb1, transform1);
    this.m_shape.ComputeAABB(aabb2, transform2);
    this.m_aabb.Combine(aabb1, aabb2);
    var displacement = Box2D.Math.SubtractVV(transform2.position, transform1.position);
    broadPhase.MoveProxy(this.m_proxy, this.m_aabb, displacement);
};
 
 Box2D.Fixture.prototype.GetType = function(){
    return this.m_shape.GetType();
};
 
 Box2D.Fixture.prototype.GetShape = function(){
    return this.m_shape;
};
 
 Box2D.Fixture.prototype.SetSensor = function(sensor){
    if (this.m_isSensor == sensor){
        return;
    }
    this.m_isSensor = sensor;
    if (typeof this.m_body === "undefined"){
        return;
    }
    var edge = this.m_body.GetContactList();
    while (edge){
        var contact = edge.contact;
        var fixtureA = contact.GetFixtureA();
        var fixtureB = contact.GetFixtureB();
        if (fixtureA == this || fixtureB == this){
            contact.SetSensor(fixtureA.IsSensor() || fixtureB.IsSensor());
        }
        edge = edge.next;
    }
};
 
 Box2D.Fixture.prototype.IsSensor = function(){
    return this.m_isSensor;
};
 
 Box2D.Fixture.prototype.SetFilterData = function(filter){
    this.m_filter = filter.Copy();
    if (this.m_body){
        return;
    }
    var edge = this.m_body.GetContactList();
    while (edge){
        var contact = edge.contact;
        var fixtureA = contact.GetFixtureA();
        var fixtureB = contact.GetFixtureB();
        if (fixtureA == this || fixtureB == this){
            contact.FlagForFiltering();
        }
        edge = edge.next;
    }
};
 
 Box2D.Fixture.prototype.GetFilterData = function(){
    return this.m_filter.Copy();
};
 
 Box2D.Fixture.prototype.GetBody = function(){
    return this.m_body;
};
 
 Box2D.Fixture.prototype.GetNext = function(){
    return this.m_next;
};
 
 Box2D.Fixture.prototype.GetUserData = function(){
    return this.m_userData;
};
 
 Box2D.Fixture.prototype.SetUserData = function(data){
    this.m_userData = data;
};
 
 Box2D.Fixture.prototype.TestPoint = function(p){
    return this.m_shape.TestPoint(this.m_body.GetTransform(), p);
};
 
 Box2D.Fixture.prototype.RayCast = function(output, input){
    return this.m_shape.RayCast(output, input, this.m_body.GetTransform());
};
 
 Box2D.Fixture.prototype.GetMassData = function(massData){
    if (typeof massData === "undefined"){
        massData = new Box2D.MassData();
    }
    this.m_shape.ComputeMass(massData, this.m_density);
    return massData;
};
 
 Box2D.Fixture.prototype.SetDensity = function(density){
    this.m_density = density;
};
 
 Box2D.Fixture.prototype.GetDensity = function(){
    return this.m_density;
};
 
 Box2D.Fixture.prototype.GetFriction = function(){
    return this.m_friction;
};
 
 Box2D.Fixture.prototype.SetFriction = function(friction){
    this.m_friction = friction;
};
 
 Box2D.Fixture.prototype.GetRestitution = function(){
    return this.m_restitution;
};
 
 Box2D.Fixture.prototype.SetRestitution = function(restitution){
    this.m_restitution = restitution;
};
 
 Box2D.Fixture.prototype.GetAABB = function(){
    return this.m_aabb;
};
 Box2D.Fixture.prototype.m_massData = undefined;
 Box2D.Fixture.prototype.m_aabb = undefined;
 Box2D.Fixture.prototype.m_density = undefined;
 Box2D.Fixture.prototype.m_next = undefined;
 Box2D.Fixture.prototype.m_body = undefined;
 Box2D.Fixture.prototype.m_shape = undefined;
 Box2D.Fixture.prototype.m_friction = undefined;
 Box2D.Fixture.prototype.m_restitution = undefined;
 Box2D.Fixture.prototype.m_proxy = undefined;
 Box2D.Fixture.prototype.m_filter = new Box2D.FilterData();
 Box2D.Fixture.prototype.m_isSensor = undefined;
 Box2D.Fixture.prototype.m_userData = undefined;
 
 Box2D.DynamicTreeNode = function(){
    this.__varz();
    this.__constructor.apply(this, arguments);
};
 
 Box2D.DynamicTreeNode.prototype.__constructor = function(){
};
 Box2D.DynamicTreeNode.prototype.__varz = function(){
    this.aabb = new Box2D.AABB();
};
 
 Box2D.DynamicTreeNode.prototype.IsLeaf = function(){
    return typeof this.child1 === "undefined";
};
 Box2D.DynamicTreeNode.prototype.userData = undefined;
 Box2D.DynamicTreeNode.prototype.aabb = new Box2D.AABB();
 Box2D.DynamicTreeNode.prototype.parent = undefined;
 Box2D.DynamicTreeNode.prototype.child1 = undefined;
 Box2D.DynamicTreeNode.prototype.child2 = undefined;
 
 Box2D.BodyDef = function(){
    this.__varz();
    this.__constructor.apply(this, arguments);
};
 
 Box2D.BodyDef.prototype.__constructor = function(){
    this.userData = undefined;
    this.position.Set(0, 0);
    this.angle = 0;
    this.linearVelocity.Set(0, 0);
    this.angularVelocity = 0;
    this.linearDamping = 0;
    this.angularDamping = 0;
    this.allowSleep = true;
    this.awake = true;
    this.fixedRotation = false;
    this.bullet = false;
    this.type = Box2D.Body.b2_staticBody;
    this.active = true;
    this.inertiaScale = 1;
};
 
 Box2D.BodyDef.prototype.__varz = function(){
    this.position = new Box2D.Vec2();
    this.linearVelocity = new Box2D.Vec2();
};
 Box2D.BodyDef.prototype.type = 0;
 Box2D.BodyDef.prototype.position = new Box2D.Vec2();
 Box2D.BodyDef.prototype.angle = undefined;
 Box2D.BodyDef.prototype.linearVelocity = new Box2D.Vec2();
 Box2D.BodyDef.prototype.angularVelocity = undefined;
 Box2D.BodyDef.prototype.linearDamping = undefined;
 Box2D.BodyDef.prototype.angularDamping = undefined;
 Box2D.BodyDef.prototype.allowSleep = undefined;
 Box2D.BodyDef.prototype.awake = undefined;
 Box2D.BodyDef.prototype.fixedRotation = undefined;
 Box2D.BodyDef.prototype.bullet = undefined;
 Box2D.BodyDef.prototype.active = undefined;
 Box2D.BodyDef.prototype.userData = undefined;
 Box2D.BodyDef.prototype.inertiaScale = undefined;
 
 Box2D.DynamicTreeBroadPhase = function(){
    this.__varz();
    this.__constructor.apply(this, arguments);
};
 
 Box2D.DynamicTreeBroadPhase.prototype.__constructor = function(){
};
 Box2D.DynamicTreeBroadPhase.prototype.__varz = function(){
    this.m_tree = new Box2D.DynamicTree();
    this.m_moveBuffer =[];
    this.m_pairBuffer =[];
};
 
 Box2D.DynamicTreeBroadPhase.prototype.BufferMove = function(proxy){
    this.m_moveBuffer[this.m_moveBuffer.length] = proxy;
};
 
 Box2D.DynamicTreeBroadPhase.prototype.UnBufferMove = function(proxy){
    var i = this.m_moveBuffer.indexOf(proxy);
    this.m_moveBuffer.splice(i, 1);
};
 
 Box2D.DynamicTreeBroadPhase.prototype.ComparePairs = function(pair1, pair2){
    return 0;
};
 
 Box2D.DynamicTreeBroadPhase.prototype.CreateProxy = function(aabb, userData){
    var proxy = this.m_tree.CreateProxy(aabb, userData);
    ++ this.m_proxyCount;
    this.BufferMove(proxy);
    return proxy;
};
 
 Box2D.DynamicTreeBroadPhase.prototype.DestroyProxy = function(proxy){
    this.UnBufferMove(proxy);
    -- this.m_proxyCount;
    this.m_tree.DestroyProxy(proxy);
};
 
 Box2D.DynamicTreeBroadPhase.prototype.MoveProxy = function(proxy, aabb, displacement){
    var buffer = this.m_tree.MoveProxy(proxy, aabb, displacement);
    if (buffer){
        this.BufferMove(proxy);
    }
};
 
 Box2D.DynamicTreeBroadPhase.prototype.TestOverlap = function(proxyA, proxyB){
    var aabbA = this.m_tree.GetFatAABB(proxyA);
    var aabbB = this.m_tree.GetFatAABB(proxyB);
    return aabbA.TestOverlap(aabbB);
};
 
 Box2D.DynamicTreeBroadPhase.prototype.GetUserData = function(proxy){
    return this.m_tree.GetUserData(proxy);
};
 
 Box2D.DynamicTreeBroadPhase.prototype.GetFatAABB = function(proxy){
    return this.m_tree.GetFatAABB(proxy);
};
 
 Box2D.DynamicTreeBroadPhase.prototype.GetProxyCount = function(){
    return this.m_proxyCount;
};
 
 Box2D.DynamicTreeBroadPhase.prototype.UpdatePairs = function(callback){
    var queryProxy;
	var i;
    this.m_pairCount = 0;
    for ( i = 0;i < this.m_moveBuffer.length;i++){
        queryProxy = this.m_moveBuffer[i];
        var that = this;
        
        function QueryCallback(proxy){
            if (proxy == queryProxy){
                return true;
            }
            if (that.m_pairCount == that.m_pairBuffer.length){
                that.m_pairBuffer[that.m_pairCount] = new Box2D.DynamicTreePair();
            }
            var pair = that.m_pairBuffer[that.m_pairCount];
            pair.proxyA = proxy < queryProxy ? proxy: queryProxy;
            pair.proxyB = proxy >= queryProxy ? proxy: queryProxy;
            ++ that.m_pairCount;
            return true;
        }
        var fatAABB = this.m_tree.GetFatAABB(queryProxy);
        this.m_tree.Query(QueryCallback, fatAABB);
    }
    this.m_moveBuffer.length = 0;
    for ( i = 0;i < this.m_pairCount;){
        var primaryPair = this.m_pairBuffer[i];
        var userDataA = this.m_tree.GetUserData(primaryPair.proxyA);
        var userDataB = this.m_tree.GetUserData(primaryPair.proxyB);
        callback(userDataA, userDataB);
        ++i;
        while (i < this.m_pairCount){
            var pair = this.m_pairBuffer[i];
            if (pair.proxyA != primaryPair.proxyA || pair.proxyB != primaryPair.proxyB){
                break;
            }
            ++i;
        }
    }
};
 
 Box2D.DynamicTreeBroadPhase.prototype.Query = function(callback, aabb){
    this.m_tree.Query(callback, aabb);
};
 
 Box2D.DynamicTreeBroadPhase.prototype.RayCast = function(callback, input){
    this.m_tree.RayCast(callback, input);
};
 
 Box2D.DynamicTreeBroadPhase.prototype.Validate = function(){
};
 Box2D.DynamicTreeBroadPhase.prototype.Rebalance = function(iterations){
    this.m_tree.Rebalance(iterations);
};
 Box2D.DynamicTreeBroadPhase.prototype.m_tree = new Box2D.DynamicTree();
 Box2D.DynamicTreeBroadPhase.prototype.m_proxyCount = 0;
 Box2D.DynamicTreeBroadPhase.prototype.m_moveBuffer =[];
 Box2D.DynamicTreeBroadPhase.prototype.m_pairBuffer =[];
 Box2D.DynamicTreeBroadPhase.prototype.m_pairCount = 0;
 
 Box2D.BroadPhase = function(){
    this.__varz();
    this.__constructor.apply(this, arguments);
};
 
 Box2D.BroadPhase.prototype.__constructor = function(worldAABB){
    var i = 0;
    this.m_pairManager.Initialize(this);
    this.m_worldAABB = worldAABB;
    this.m_proxyCount = 0;
    this.m_bounds =[];
    for (i = 0;i < 2;i++){
        this.m_bounds[i] =[];
    }
    var dX = worldAABB.upperBound.x - worldAABB.lowerBound.x;
    var dY = worldAABB.upperBound.y - worldAABB.lowerBound.y;
    this.m_quantizationFactor.x = Box2D.Settings.USHRT_MAX / dX;
    this.m_quantizationFactor.y = Box2D.Settings.USHRT_MAX / dY;
    this.m_timeStamp = 1;
    this.m_queryResultCount = 0;
};
 
 Box2D.BroadPhase.prototype.__varz = function(){
    this.m_pairManager = new Box2D.PairManager();
    this.m_proxyPool =[];
    this.m_querySortKeys =[];
    this.m_queryResults =[];
    this.m_quantizationFactor = new Box2D.Vec2();
};
 
 Box2D.BroadPhase.BinarySearch = function(bounds, count, value){
    var low = 0;
    var high = count - 1;
    while (low <= high){
        var mid = Math.round((low + high) / 2);
        var bound = bounds[mid];
        if (bound.value > value){
            high = mid - 1;
        }
        else {
            if (bound.value < value){
                low = mid + 1;
            }
            else {
                return mid;
            }
        }
    }
    return low;
};
 Box2D.BroadPhase.s_validate = false;
 Box2D.BroadPhase.b2_invalid = Box2D.Settings.USHRT_MAX;
 Box2D.BroadPhase.b2_nullEdge = Box2D.Settings.USHRT_MAX;
 
 Box2D.BroadPhase.prototype.ComputeBounds = function(lowerValues, upperValues, aabb){
    var minVertexX = aabb.lowerBound.x;
    var minVertexY = aabb.lowerBound.y;
    minVertexX = Box2D.Math.Min(minVertexX, this.m_worldAABB.upperBound.x);
    minVertexY = Box2D.Math.Min(minVertexY, this.m_worldAABB.upperBound.y);
    minVertexX = Box2D.Math.Max(minVertexX, this.m_worldAABB.lowerBound.x);
    minVertexY = Box2D.Math.Max(minVertexY, this.m_worldAABB.lowerBound.y);
    var maxVertexX = aabb.upperBound.x;
    var maxVertexY = aabb.upperBound.y;
    maxVertexX = Box2D.Math.Min(maxVertexX, this.m_worldAABB.upperBound.x);
    maxVertexY = Box2D.Math.Min(maxVertexY, this.m_worldAABB.upperBound.y);
    maxVertexX = Box2D.Math.Max(maxVertexX, this.m_worldAABB.lowerBound.x);
    maxVertexY = Box2D.Math.Max(maxVertexY, this.m_worldAABB.lowerBound.y);
    lowerValues[0] = parseInt(this.m_quantizationFactor.x * (minVertexX - this.m_worldAABB.lowerBound.x), 10) & Box2D.Settings.USHRT_MAX - 1;
    upperValues[0] = parseInt(this.m_quantizationFactor.x * (maxVertexX - this.m_worldAABB.lowerBound.x), 10) % 65535 | 1;
    lowerValues[1] = parseInt(this.m_quantizationFactor.y * (minVertexY - this.m_worldAABB.lowerBound.y), 10) & Box2D.Settings.USHRT_MAX - 1;
    upperValues[1] = parseInt(this.m_quantizationFactor.y * (maxVertexY - this.m_worldAABB.lowerBound.y), 10) % 65535 | 1;
};
 
 Box2D.BroadPhase.prototype.TestOverlapValidate = function(p1, p2){
    for (var axis = 0;axis < 2; ++ axis){
        var bounds = this.m_bounds[axis];
        var bound1 = bounds[p1.lowerBounds[axis]];
        var bound2 = bounds[p2.upperBounds[axis]];
        if (bound1.value > bound2.value){
            return false;
        }
        bound1 = bounds[p1.upperBounds[axis]];
        bound2 = bounds[p2.lowerBounds[axis]];
        if (bound1.value < bound2.value){
            return false;
        }
    }
    return true;
};
 
 Box2D.BroadPhase.prototype.QueryAxis = function(lowerQueryOut, upperQueryOut, lowerValue, upperValue, bounds, 
   boundCount, axis){
    var lowerQuery = Box2D.BroadPhase.BinarySearch(bounds, boundCount, lowerValue);
    var upperQuery = Box2D.BroadPhase.BinarySearch(bounds, boundCount, upperValue);
    var bound;
    for (var j = lowerQuery;j < upperQuery; ++ j){
        bound = bounds[j];
        if (bound.IsLower()){
            this.IncrementOverlapCount(bound.proxy);
        }
    }
    if (lowerQuery > 0){
        var i = lowerQuery - 1;
        bound = bounds[i];
        var s = bound.stabbingCount;
        while (s){
            bound = bounds[i];
            if (bound.IsLower()){
                var proxy = bound.proxy;
                if (lowerQuery <= proxy.upperBounds[axis]){
                    this.IncrementOverlapCount(bound.proxy);
                    -- s;
                }
            }
            -- i;
        }
    }
    lowerQueryOut[0] = lowerQuery;
    upperQueryOut[0] = upperQuery;
};
 
 Box2D.BroadPhase.prototype.IncrementOverlapCount = function(proxy){
    if (proxy.timeStamp < this.m_timeStamp){
        proxy.timeStamp = this.m_timeStamp;
        proxy.overlapCount = 1;
    }
    else {
        proxy.overlapCount = 2;
        this.m_queryResults[this.m_queryResultCount] = proxy;
        ++ this.m_queryResultCount;
    }
};
 
 Box2D.BroadPhase.prototype.IncrementTimeStamp = function(){
    if (this.m_timeStamp == Box2D.Settings.USHRT_MAX){
        for (var i = 0;i < this.m_proxyPool.length; ++i){
            this.m_proxyPool[i].timeStamp = 0;
        }
        this.m_timeStamp = 1;
    }
    else {
        ++ this.m_timeStamp;
    }
};
 
 Box2D.BroadPhase.prototype.InRange = function(aabb){
    var dX;
    var dY;
    var d2X;
    var d2Y;
    dX = aabb.lowerBound.x;
    dY = aabb.lowerBound.y;
    dX -= this.m_worldAABB.upperBound.x;
    dY -= this.m_worldAABB.upperBound.y;
    d2X = this.m_worldAABB.lowerBound.x;
    d2Y = this.m_worldAABB.lowerBound.y;
    d2X -= aabb.upperBound.x;
    d2Y -= aabb.upperBound.y;
    dX = Box2D.Math.Max(dX, d2X);
    dY = Box2D.Math.Max(dY, d2Y);
    return Box2D.Math.Max(dX, dY) < 0;
};
 
 Box2D.BroadPhase.prototype.CreateProxy = function(aabb, userData){
    var index = 0;
    var proxy;
    var i = 0;
    var j = 0;
    if ( ! this.m_freeProxy){
        this.m_freeProxy = this.m_proxyPool[this.m_proxyCount] = new Box2D.Proxy();
        this.m_freeProxy.next = undefined;
        this.m_freeProxy.timeStamp = 0;
        this.m_freeProxy.overlapCount = Box2D.BroadPhase.b2_invalid;
        this.m_freeProxy.userData = undefined;
        for (i = 0;i < 2;i++){
            j = this.m_proxyCount * 2;
            this.m_bounds[i][j++] = new Box2D.Bound();
            this.m_bounds[i][j] = new Box2D.Bound();
        }
    }
    proxy = this.m_freeProxy;
    this.m_freeProxy = proxy.next;
    proxy.overlapCount = 0;
    proxy.userData = userData;
    var boundCount = 2 * this.m_proxyCount;
    var lowerValues =[];
    var upperValues =[];
    this.ComputeBounds(lowerValues, upperValues, aabb);
    for (var axis = 0;axis < 2; ++ axis){
        var bounds = this.m_bounds[axis];
        var lowerIndex = 0;
        var upperIndex = 0;
        var lowerIndexOut =[];
        lowerIndexOut.push(lowerIndex);
        var upperIndexOut =[];
        upperIndexOut.push(upperIndex);
        this.QueryAxis(lowerIndexOut, upperIndexOut, lowerValues[axis], upperValues[axis], bounds, boundCount, axis);
        lowerIndex = lowerIndexOut[0];
        upperIndex = upperIndexOut[0];
        bounds.splice(upperIndex, 0, bounds[bounds.length - 1]);
        bounds.length--;
        bounds.splice(lowerIndex, 0, bounds[bounds.length - 1]);
        bounds.length--;
        ++ upperIndex;
        var tBound1 = bounds[lowerIndex];
        var tBound2 = bounds[upperIndex];
        tBound1.value = lowerValues[axis];
        tBound1.proxy = proxy;
        tBound2.value = upperValues[axis];
        tBound2.proxy = proxy;
        var tBoundAS3 = bounds[parseInt(lowerIndex - 1, 10)];
        tBound1.stabbingCount = lowerIndex === 0 ? 0: tBoundAS3.stabbingCount;
        tBoundAS3 = bounds[parseInt(upperIndex - 1, 10)];
        tBound2.stabbingCount = tBoundAS3.stabbingCount;
        for (index = lowerIndex;index < upperIndex; ++index)            {
            tBoundAS3 = bounds[index];
            tBoundAS3.stabbingCount++;
        }
        for (index = lowerIndex;index < boundCount + 2; ++index){
            tBound1 = bounds[index];
            var proxy2 = tBound1.proxy;
            if (tBound1.IsLower()){
                proxy2.lowerBounds[axis] = index;
            }
            else {
                proxy2.upperBounds[axis] = index;
            }
        }
    }
    ++ this.m_proxyCount;
    for (i = 0;i < this.m_queryResultCount; ++i){
        this.m_pairManager.AddBufferedPair(proxy, this.m_queryResults[i]);
    }
    this.m_queryResultCount = 0;
    this.IncrementTimeStamp();
    return proxy;
};
 
 Box2D.BroadPhase.prototype.DestroyProxy = function(proxy_){
    var proxy = proxy_;
    var tBound1;
    var tBound2;
    var boundCount = 2 * this.m_proxyCount;
    for (var axis = 0;axis < 2; ++ axis){
        var bounds = this.m_bounds[axis];
        var lowerIndex = proxy.lowerBounds[axis];
        var upperIndex = proxy.upperBounds[axis];
        tBound1 = bounds[lowerIndex];
        var lowerValue = tBound1.value;
        tBound2 = bounds[upperIndex];
        var upperValue = tBound2.value;
        bounds.splice(upperIndex, 1);
        bounds.splice(lowerIndex, 1);
        bounds.push(tBound1);
        bounds.push(tBound2);
        var tEnd = boundCount - 2;
        for (var index = lowerIndex;index < tEnd; ++index){
            tBound1 = bounds[index];
            var proxy2 = tBound1.proxy;
            if (tBound1.IsLower()){
                proxy2.lowerBounds[axis] = index;
            }
            else {
                proxy2.upperBounds[axis] = index;
            }
        }
        tEnd = upperIndex - 1;
        for (var index2 = lowerIndex;index2 < tEnd; ++index2){
            tBound1 = bounds[index2];
            tBound1.stabbingCount--;
        }
        var ignore =[];
        this.QueryAxis(ignore, ignore, lowerValue, upperValue, bounds, boundCount - 2, axis);
    }
    for (var i = 0;i < this.m_queryResultCount; ++i){
        this.m_pairManager.RemoveBufferedPair(proxy, this.m_queryResults[i]);
    }
    this.m_queryResultCount = 0;
    this.IncrementTimeStamp();
    proxy.userData = undefined;
    proxy.overlapCount = Box2D.BroadPhase.b2_invalid;
    proxy.lowerBounds[0] = Box2D.BroadPhase.b2_invalid;
    proxy.lowerBounds[1] = Box2D.BroadPhase.b2_invalid;
    proxy.upperBounds[0] = Box2D.BroadPhase.b2_invalid;
    proxy.upperBounds[1] = Box2D.BroadPhase.b2_invalid;
    proxy.next = this.m_freeProxy;
    this.m_freeProxy = proxy;
    -- this.m_proxyCount;
};
 
 Box2D.BroadPhase.prototype.MoveProxy = function(proxy_, aabb, displacement){
    var proxy = proxy_;
    var as3arr;
    var as3int = 0;
    var axis = 0;
    var index = 0;
    var bound;
    var prevBound;
    var nextBound;
    var nextProxyId = 0;
    var nextProxy;
	var prevProxy;
    if (typeof proxy === "undefined"){
        return;
    }
    if (aabb.IsValid() === false){
        return;
    }
    var boundCount = 2 * this.m_proxyCount;
    var newValues = new Box2D.BoundValues();
    this.ComputeBounds(newValues.lowerValues, newValues.upperValues, aabb);
    var oldValues = new Box2D.BoundValues();
    for (axis = 0;axis < 2; ++ axis){
        bound = this.m_bounds[axis][proxy.lowerBounds[axis]];
        oldValues.lowerValues[axis] = bound.value;
        bound = this.m_bounds[axis][proxy.upperBounds[axis]];
        oldValues.upperValues[axis] = bound.value;
    }
    for (axis = 0;axis < 2; ++ axis){
        var bounds = this.m_bounds[axis];
        var lowerIndex = proxy.lowerBounds[axis];
        var upperIndex = proxy.upperBounds[axis];
        var lowerValue = newValues.lowerValues[axis];
        var upperValue = newValues.upperValues[axis];
        bound = bounds[lowerIndex];
        var deltaLower = lowerValue - bound.value;
        bound.value = lowerValue;
        bound = bounds[upperIndex];
        var deltaUpper = upperValue - bound.value;
        bound.value = upperValue;
        if (deltaLower < 0){
            index = lowerIndex;
            while (index > 0 && lowerValue < bounds[parseInt(index - 1, 10)].value){
                bound = bounds[index];
                prevBound = bounds[parseInt(index - 1, 10)];
                prevProxy = prevBound.proxy;
                prevBound.stabbingCount++;
                if (prevBound.IsUpper() === true){
                    if (this.TestOverlapBound(newValues, prevProxy)){
                        this.m_pairManager.AddBufferedPair(proxy, prevProxy);
                    }
                    as3arr = prevProxy.upperBounds;
                    as3int = as3arr[axis];
                    as3int++;
                    as3arr[axis] = as3int;
                    bound.stabbingCount++;
                }
                else {
                    as3arr = prevProxy.lowerBounds;
                    as3int = as3arr[axis];
                    as3int++;
                    as3arr[axis] = as3int;
                    bound.stabbingCount--;
                }
                as3arr = proxy.lowerBounds;
                as3int = as3arr[axis];
                as3int--;
                as3arr[axis] = as3int;
                bound.Swap(prevBound);
                -- index;
            }
        }
        if (deltaUpper > 0){
            index = upperIndex;
            while (index < boundCount - 1 && bounds[parseInt(index + 1, 10)].value <= upperValue){
                bound = bounds[index];
                nextBound = bounds[parseInt(index + 1, 10)];
                nextProxy = nextBound.proxy;
                nextBound.stabbingCount++;
                if (nextBound.IsLower() === true){
                    if (this.TestOverlapBound(newValues, nextProxy)){
                        this.m_pairManager.AddBufferedPair(proxy, nextProxy);
                    }
                    as3arr = nextProxy.lowerBounds;
                    as3int = as3arr[axis];
                    as3int--;
                    as3arr[axis] = as3int;
                    bound.stabbingCount++;
                }
                else {
                    as3arr = nextProxy.upperBounds;
                    as3int = as3arr[axis];
                    as3int--;
                    as3arr[axis] = as3int;
                    bound.stabbingCount--;
                }
                as3arr = proxy.upperBounds;
                as3int = as3arr[axis];
                as3int++;
                as3arr[axis] = as3int;
                bound.Swap(nextBound);
                index++;
            }
        }
        if (deltaLower > 0){
            index = lowerIndex;
            while (index < boundCount - 1 && bounds[parseInt(index + 1, 10)].value <= lowerValue){
                bound = bounds[index];
                nextBound = bounds[parseInt(index + 1, 10)];
                nextProxy = nextBound.proxy;
                nextBound.stabbingCount--;
                if (nextBound.IsUpper()){
                    if (this.TestOverlapBound(oldValues, nextProxy)){
                        this.m_pairManager.RemoveBufferedPair(proxy, nextProxy);
                    }
                    as3arr = nextProxy.upperBounds;
                    as3int = as3arr[axis];
                    as3int--;
                    as3arr[axis] = as3int;
                    bound.stabbingCount--;
                }
                else {
                    as3arr = nextProxy.lowerBounds;
                    as3int = as3arr[axis];
                    as3int--;
                    as3arr[axis] = as3int;
                    bound.stabbingCount++;
                }
                as3arr = proxy.lowerBounds;
                as3int = as3arr[axis];
                as3int++;
                as3arr[axis] = as3int;
                bound.Swap(nextBound);
                index++;
            }
        }
        if (deltaUpper < 0){
            index = upperIndex;
            while (index > 0 && upperValue < bounds[parseInt(index - 1, 10)].value){
                bound = bounds[index];
                prevBound = bounds[parseInt(index - 1, 10)];
                prevProxy = prevBound.proxy;
                prevBound.stabbingCount--;
                if (prevBound.IsLower() === true){
                    if (this.TestOverlapBound(oldValues, prevProxy)){
                        this.m_pairManager.RemoveBufferedPair(proxy, prevProxy);
                    }
                    as3arr = prevProxy.lowerBounds;
                    as3int = as3arr[axis];
                    as3int++;
                    as3arr[axis] = as3int;
                    bound.stabbingCount--;
                }
                else {
                    as3arr = prevProxy.upperBounds;
                    as3int = as3arr[axis];
                    as3int++;
                    as3arr[axis] = as3int;
                    bound.stabbingCount++;
                }
                as3arr = proxy.upperBounds;
                as3int = as3arr[axis];
                as3int--;
                as3arr[axis] = as3int;
                bound.Swap(prevBound);
                index--;
            }
        }
    }
};

Box2D.BroadPhase.prototype.UpdatePairs = function(callback){
    this.m_pairManager.Commit(callback);
};
 
 Box2D.BroadPhase.prototype.TestOverlap = function(proxyA, proxyB){
    var proxyA_ = proxyA;
    var proxyB_ = proxyB;
    if (proxyA_.lowerBounds[0] > proxyB_.upperBounds[0]){
        return false;
    }
    if (proxyB_.lowerBounds[0] > proxyA_.upperBounds[0]){
        return false;
    }
    if (proxyA_.lowerBounds[1] > proxyB_.upperBounds[1]){
        return false;
    }
    if (proxyB_.lowerBounds[1] > proxyA_.upperBounds[1]){
        return false;
    }
    return true;
};
 
 Box2D.BroadPhase.prototype.GetUserData = function(proxy){
    return proxy.userData;
};
 
 Box2D.BroadPhase.prototype.GetFatAABB = function(proxy_){
    var aabb = new Box2D.AABB();
    var proxy = proxy_;
    aabb.lowerBound.x = this.m_worldAABB.lowerBound.x + this.m_bounds[0][proxy.lowerBounds[0]].value / this.m_quantizationFactor.x;
    aabb.lowerBound.y = this.m_worldAABB.lowerBound.y + this.m_bounds[1][proxy.lowerBounds[1]].value / this.m_quantizationFactor.y;
    aabb.upperBound.x = this.m_worldAABB.lowerBound.x + this.m_bounds[0][proxy.upperBounds[0]].value / this.m_quantizationFactor.x;
    aabb.upperBound.y = this.m_worldAABB.lowerBound.y + this.m_bounds[1][proxy.upperBounds[1]].value / this.m_quantizationFactor.y;
    return aabb;
};
 
 Box2D.BroadPhase.prototype.GetProxyCount = function(){
    return this.m_proxyCount;
};
 
 Box2D.BroadPhase.prototype.Query = function(callback, aabb){
    var lowerValues =[];
    var upperValues =[];
    this.ComputeBounds(lowerValues, upperValues, aabb);
    var lowerIndex = 0;
    var upperIndex = 0;
    var lowerIndexOut =[];
    lowerIndexOut.push(lowerIndex);
    var upperIndexOut =[];
    upperIndexOut.push(upperIndex);
    this.QueryAxis(lowerIndexOut, upperIndexOut, lowerValues[0], upperValues[0], this.m_bounds[0], 2 * this.m_proxyCount, 0);
    this.QueryAxis(lowerIndexOut, upperIndexOut, lowerValues[1], upperValues[1], this.m_bounds[1], 2 * this.m_proxyCount, 1);
    for (var i = 0;i < this.m_queryResultCount; ++i){
        var proxy = this.m_queryResults[i];
        if ( ! callback(proxy)){
            break;
        }
    }
    this.m_queryResultCount = 0;
    this.IncrementTimeStamp();
};
 
 Box2D.BroadPhase.prototype.Validate = function(){
    var pair;
    var proxy1;
    var proxy2;
    var overlap;
    for (var axis = 0;axis < 2; ++ axis){
        var bounds = this.m_bounds[axis];
        var boundCount = 2 * this.m_proxyCount;
        var stabbingCount = 0;
        for (var i = 0;i < boundCount; ++i){
            var bound = bounds[i];
            if (bound.IsLower() === true){
                stabbingCount++;
            }
            else {
                stabbingCount--;
            }
        }
    }
};
 
 Box2D.BroadPhase.prototype.Rebalance = function(iterations){
};
 Box2D.BroadPhase.prototype.RayCast = function(callback, input){
    var subInput = new Box2D.RayCastInput();
    subInput.p1.SetV(input.p1);
    subInput.p2.SetV(input.p2);
    subInput.maxFraction = input.maxFraction;
    var dx = (input.p2.x - input.p1.x) * this.m_quantizationFactor.x;
    var dy = (input.p2.y - input.p1.y) * this.m_quantizationFactor.y;
    var sx = dx < - Number.MIN_VALUE ? - 1: dx > Number.MIN_VALUE ? 1: 0;
    var sy = dy < - Number.MIN_VALUE ? - 1: dy > Number.MIN_VALUE ? 1: 0;
    var p1x = this.m_quantizationFactor.x * (input.p1.x - this.m_worldAABB.lowerBound.x);
    var p1y = this.m_quantizationFactor.y * (input.p1.y - this.m_worldAABB.lowerBound.y);
    var startValues =[];
    var startValues2 =[];
    startValues[0] = parseInt(p1x, 10) & Box2D.Settings.USHRT_MAX - 1;
    startValues[1] = parseInt(p1y, 10) & Box2D.Settings.USHRT_MAX - 1;
    startValues2[0] = startValues[0] + 1;
    startValues2[1] = startValues[1] + 1;
    var startIndices =[];
    var xIndex = 0;
    var yIndex = 0;
    var proxy;
    var lowerIndex = 0;
    var upperIndex = 0;
    var lowerIndexOut =[];
    lowerIndexOut.push(lowerIndex);
    var upperIndexOut =[];
    upperIndexOut.push(upperIndex);
    this.QueryAxis(lowerIndexOut, upperIndexOut, startValues[0], startValues2[0], this.m_bounds[0], 2 * this.m_proxyCount, 
       0);
    if (sx >= 0){
        xIndex = upperIndexOut[0] - 1;
    }
    else {
        xIndex = lowerIndexOut[0];
    }
    this.QueryAxis(lowerIndexOut, upperIndexOut, startValues[1], startValues2[1], this.m_bounds[1], 2 * this.m_proxyCount, 
       1);
    if (sy >= 0){
        yIndex = upperIndexOut[0] - 1;
    }
    else {
        yIndex = lowerIndexOut[0];
    }
    for (var i = 0;i < this.m_queryResultCount;i++){
        subInput.maxFraction = callback(this.m_queryResults[i], subInput);
    }
    for (;;){
        var xProgress = 0;
        var yProgress = 0;
        xIndex += sx >= 0 ? 1: - 1;
        if (xIndex < 0 || xIndex >= this.m_proxyCount * 2){
            break;
        }
        if (sx !== 0){
            xProgress = (this.m_bounds[0][xIndex].value - p1x) / dx;
        }
        yIndex += sy >= 0 ? 1: - 1;
        if (yIndex < 0 || yIndex >= this.m_proxyCount * 2){
            break;
        }
        if (sy !== 0){
            yProgress = (this.m_bounds[1][yIndex].value - p1y) / dy;
        }
        for (;;){
            if (sy === 0 || sx !== 0 && xProgress < yProgress){
                if (xProgress > subInput.maxFraction){
                    break;
                }
                if (sx > 0 ? this.m_bounds[0][xIndex].IsLower(): this.m_bounds[0][xIndex].IsUpper()){
                    proxy = this.m_bounds[0][xIndex].proxy;
                    if (sy >= 0){
                        if (proxy.lowerBounds[1] <= yIndex - 1 && proxy.upperBounds[1] >= yIndex){
                            subInput.maxFraction = callback(proxy, subInput);
                        }
                    }
                    else {
                        if (proxy.lowerBounds[1] <= yIndex && proxy.upperBounds[1] >= yIndex + 1){
                            subInput.maxFraction = callback(proxy, subInput);
                        }
                    }
                }
                if (subInput.maxFraction === 0){
                    break;
                }
                if (sx > 0){
                    xIndex++;
                    if (xIndex == this.m_proxyCount * 2){
                        break;
                    }
                }
                else {
                    xIndex--;
                    if (xIndex < 0){
                        break;
                    }
                }
                xProgress = (this.m_bounds[0][xIndex].value - p1x) / dx;
            }
            else {
                if (yProgress > subInput.maxFraction){
                    break;
                }
                if (sy > 0 ? this.m_bounds[1][yIndex].IsLower(): this.m_bounds[1][yIndex].IsUpper()){
                    proxy = this.m_bounds[1][yIndex].proxy;
                    if (sx >= 0){
                        if (proxy.lowerBounds[0] <= xIndex - 1 && proxy.upperBounds[0] >= xIndex){
                            subInput.maxFraction = callback(proxy, subInput);
                        }
                    }
                    else {
                        if (proxy.lowerBounds[0] <= xIndex && proxy.upperBounds[0] >= xIndex + 1){
                            subInput.maxFraction = callback(proxy, subInput);
                        }
                    }
                }
                if (subInput.maxFraction === 0){
                    break;
                }
                if (sy > 0){
                    yIndex++;
                    if (yIndex == this.m_proxyCount * 2){
                        break;
                    }
                }
                else {
                    yIndex--;
                    if (yIndex < 0){
                        break;
                    }
                }
                yProgress = (this.m_bounds[1][yIndex].value - p1y) / dy;
            }
        }
        break;
    }
    this.m_queryResultCount = 0;
    this.IncrementTimeStamp();
    return;
};
 
 Box2D.BroadPhase.prototype.TestOverlapBound = function(b, p){
    for (var axis = 0;axis < 2; ++ axis){
        var bounds = this.m_bounds[axis];
        var bound = bounds[p.upperBounds[axis]];
        if (b.lowerValues[axis] > bound.value){
            return false;
        }
        bound = bounds[p.lowerBounds[axis]];
        if (b.upperValues[axis] < bound.value){
            return false;
        }
    }
    return true;
};
 Box2D.BroadPhase.prototype.m_pairManager = new Box2D.PairManager();
 Box2D.BroadPhase.prototype.m_proxyPool =[];
 Box2D.BroadPhase.prototype.m_freeProxy = undefined;
 Box2D.BroadPhase.prototype.m_bounds = undefined;
 Box2D.BroadPhase.prototype.m_querySortKeys =[];
 Box2D.BroadPhase.prototype.m_queryResults =[];
 Box2D.BroadPhase.prototype.m_queryResultCount = 0;
 Box2D.BroadPhase.prototype.m_worldAABB = undefined;
 Box2D.BroadPhase.prototype.m_quantizationFactor = new Box2D.Vec2();
 Box2D.BroadPhase.prototype.m_proxyCount = 0;
 Box2D.BroadPhase.prototype.m_timeStamp = 0;
 
 Box2D.Manifold = function(){
    this.__varz();
    this.__constructor.apply(this, arguments);
};
 
 Box2D.Manifold.prototype.__constructor = function(){
    this.m_points =[];
    for (var i = 0;i < Box2D.Settings.b2_maxManifoldPoints;i++){
        this.m_points[i] = new Box2D.ManifoldPoint();
    }
    this.m_localPlaneNormal = new Box2D.Vec2();
    this.m_localPoint = new Box2D.Vec2();
};
 
 Box2D.Manifold.prototype.__varz = function(){
};
Box2D.Manifold.e_circles = 1;
 Box2D.Manifold.e_faceA = 2;
 Box2D.Manifold.e_faceB = 4;
 
 Box2D.Manifold.prototype.Reset = function(){
    for (var i = 0;i < Box2D.Settings.b2_maxManifoldPoints;i++){
        this.m_points[i].Reset();
    }
    this.m_localPlaneNormal.SetZero();
    this.m_localPoint.SetZero();
    this.m_type = 0;
    this.m_pointCount = 0;
};
 
 Box2D.Manifold.prototype.Set = function(m){
    this.m_pointCount = m.m_pointCount;
    for (var i = 0;i < Box2D.Settings.b2_maxManifoldPoints;i++){
        this.m_points[i].Set(m.m_points[i]);
    }
    this.m_localPlaneNormal.SetV(m.m_localPlaneNormal);
    this.m_localPoint.SetV(m.m_localPoint);
    this.m_type = m.m_type;
};
 
 Box2D.Manifold.prototype.Copy = function(){
    var copy = new Box2D.Manifold();
    copy.Set(this);
    return copy;
};
 Box2D.Manifold.prototype.m_points = undefined;
 Box2D.Manifold.prototype.m_localPlaneNormal = undefined;
 Box2D.Manifold.prototype.m_localPoint = undefined;
 Box2D.Manifold.prototype.m_type = 0;
 Box2D.Manifold.prototype.m_pointCount = 0;
 
 Box2D.CircleShape = function(){
    Box2D.Shape.prototype.__varz.call(this);
    this.__varz();
    this.__constructor.apply(this, arguments);
};
 extend(Box2D.CircleShape.prototype, Box2D.Shape.prototype);
 Box2D.CircleShape.prototype._super = Box2D.Shape.prototype;
 
 Box2D.CircleShape.prototype.__constructor = function(radius){
    this._super.__constructor.apply(this,[]);
    this.m_type = Box2D.Shape.e_circleShape;
    this.m_radius = radius;
};
 
 Box2D.CircleShape.prototype.__varz = function(){
    this.m_p = new Box2D.Vec2();
};
 
 Box2D.CircleShape.prototype.Copy = function(){
    var s = new Box2D.CircleShape();
    s.Set(this);
    return s;
};
 
 Box2D.CircleShape.prototype.Set = function(other){
    this._super.Set.apply(this,[other]);
    if (isInstanceOf(other, Box2D.CircleShape)){
        var other2 = other;
        this.m_p.SetV(other2.m_p);
    }
};
 
 Box2D.CircleShape.prototype.TestPoint = function(transform, p){
    var tMat = transform.R;
    var dX = transform.position.x + (tMat.col1.x * this.m_p.x + tMat.col2.x * this.m_p.y);
    var dY = transform.position.y + (tMat.col1.y * this.m_p.x + tMat.col2.y * this.m_p.y);
    dX = p.x - dX;
    dY = p.y - dY;
    return dX * dX + dY * dY <= this.m_radius * this.m_radius;
};
 
 Box2D.CircleShape.prototype.RayCast = function(output, input, transform){
    var tMat = transform.R;
    var positionX = transform.position.x + (tMat.col1.x * this.m_p.x + tMat.col2.x * this.m_p.y);
    var positionY = transform.position.y + (tMat.col1.y * this.m_p.x + tMat.col2.y * this.m_p.y);
    var sX = input.p1.x - positionX;
    var sY = input.p1.y - positionY;
    var b = sX * sX + sY * sY - this.m_radius * this.m_radius;
    var rX = input.p2.x - input.p1.x;
    var rY = input.p2.y - input.p1.y;
    var c = sX * rX + sY * rY;
    var rr = rX * rX + rY * rY;
    var sigma = c * c - rr * b;
    if (sigma < 0 || rr < Number.MIN_VALUE){
        return false;
    }
    var a = - (c + Math.sqrt(sigma));
    if (0 <= a && a <= input.maxFraction * rr){
        a /= rr;
        output.fraction = a;
        output.normal.x = sX + a * rX;
        output.normal.y = sY + a * rY;
        output.normal.Normalize();
        return true;
    }
    return false;
};
 
 Box2D.CircleShape.prototype.ComputeAABB = function(aabb, transform)    {
    var tMat = transform.R;
    var pX = transform.position.x + (tMat.col1.x * this.m_p.x + tMat.col2.x * this.m_p.y);
    var pY = transform.position.y + (tMat.col1.y * this.m_p.x + tMat.col2.y * this.m_p.y);
    aabb.lowerBound.Set(pX - this.m_radius, pY - this.m_radius);
    aabb.upperBound.Set(pX + this.m_radius, pY + this.m_radius);
};
 
 Box2D.CircleShape.prototype.ComputeMass = function(massData, density){
    massData.mass = density * Box2D.Settings.b2_pi * this.m_radius * this.m_radius;
    massData.center.SetV(this.m_p);
    massData.I = massData.mass * (0.5 * this.m_radius * this.m_radius + (this.m_p.x * this.m_p.x + this.m_p.y * this.m_p.y));
};
 
 Box2D.CircleShape.prototype.ComputeSubmergedArea = function(normal, offset, xf, c){
    var p = Box2D.Math.MulX(xf, this.m_p);
    var l = - (Box2D.Math.Dot(normal, p) - offset);
    if (l < - this.m_radius + Number.MIN_VALUE){
        return 0;
    }
    if (l > this.m_radius){
        c.SetV(p);
        return Math.PI * this.m_radius * this.m_radius;
    }
    var r2 = this.m_radius * this.m_radius;
    var l2 = l * l;
    var area = r2 * (Math.asin(l / this.m_radius) + Math.PI / 2) + l * Math.sqrt(r2 - l2);
    var com = - 2 / 3 * Math.pow(r2 - l2, 1.5) / area;
    c.x = p.x + normal.x * com;
    c.y = p.y + normal.y * com;
    return area;
};
 
 Box2D.CircleShape.prototype.GetLocalPosition = function(){
    return this.m_p;
};
 
 Box2D.CircleShape.prototype.SetLocalPosition = function(position){
    this.m_p.SetV(position);
};
 
 Box2D.CircleShape.prototype.GetRadius = function(){
    return this.m_radius;
};
 
 Box2D.CircleShape.prototype.SetRadius = function(radius){
    this.m_radius = radius;
};
 Box2D.CircleShape.prototype.m_p = new Box2D.Vec2();
 
 Box2D.Joint = function(){
    this.__varz();
    this.__constructor.apply(this, arguments);
};
 
 Box2D.Joint.prototype.__constructor = function(def){
    Box2D.Settings.b2Assert(def.bodyA != def.bodyB);
    this.m_type = def.type;
    this.m_prev = undefined;
    this.m_next = undefined;
    this.m_bodyA = def.bodyA;
    this.m_bodyB = def.bodyB;
    this.m_collideConnected = def.collideConnected;
    this.m_islandFlag = false;
    this.m_userData = def.userData;
};
 
 Box2D.Joint.prototype.__varz = function(){
    this.m_edgeA = new Box2D.JointEdge();
    this.m_edgeB = new Box2D.JointEdge();
    this.m_localCenterA = new Box2D.Vec2();
    this.m_localCenterB = new Box2D.Vec2();
};
 
 Box2D.Joint.Create = function(def, allocator){
    var joint = undefined;
    switch (def.type){
        case Box2D.Joint.e_distanceJoint: 
            joint = new Box2D.DistanceJoint(def);
            break;
        case Box2D.Joint.e_mouseJoint: 
            joint = new Box2D.MouseJoint(def);
            break;
        case Box2D.Joint.e_prismaticJoint: 
            joint = new Box2D.PrismaticJoint(def);
            break;
        case Box2D.Joint.e_revoluteJoint: 
            joint = new Box2D.RevoluteJoint(def);
            break;
        case Box2D.Joint.e_pulleyJoint: 
            joint = new Box2D.PulleyJoint(def);
            break;
        case Box2D.Joint.e_gearJoint: 
            joint = new Box2D.GearJoint(def);
            break;
        case Box2D.Joint.e_lineJoint: 
            joint = new Box2D.LineJoint(def);
            break;
        case Box2D.Joint.e_weldJoint: 
            joint = new Box2D.WeldJoint(def);
            break;
        case Box2D.Joint.e_frictionJoint: 
            joint = new Box2D.FrictionJoint(def);
            break;
        default: 
            break;
    }
    return joint;
};
 
 Box2D.Joint.Destroy = function(joint, allocator){
};
Box2D.Joint.e_unknownJoint = 0;
 Box2D.Joint.e_revoluteJoint = 1;
 Box2D.Joint.e_prismaticJoint = 2;
 Box2D.Joint.e_distanceJoint = 3;
 Box2D.Joint.e_pulleyJoint = 4;
 Box2D.Joint.e_mouseJoint = 5;
 Box2D.Joint.e_gearJoint = 6;
 Box2D.Joint.e_lineJoint = 7;
 Box2D.Joint.e_weldJoint = 8;
 Box2D.Joint.e_frictionJoint = 9;
 Box2D.Joint.e_inactiveLimit = 0;
 Box2D.Joint.e_atLowerLimit = 1;
 Box2D.Joint.e_atUpperLimit = 2;
 Box2D.Joint.e_equalLimits = 3;
 
 Box2D.Joint.prototype.InitVelocityConstraints = function(step){
};
 Box2D.Joint.prototype.SolveVelocityConstraints = function(step){
};
 Box2D.Joint.prototype.FinalizeVelocityConstraints = function(){
};
 Box2D.Joint.prototype.SolvePositionConstraints = function(baumgarte){
    return false;
};
 
 Box2D.Joint.prototype.GetType = function(){
    return this.m_type;
};
 
 Box2D.Joint.prototype.GetAnchorA = function(){
    return undefined;
};
 
 Box2D.Joint.prototype.GetAnchorB = function(){
    return undefined;
};
 
 Box2D.Joint.prototype.GetReactionForce = function(inv_dt){
    return undefined;
};
 
 Box2D.Joint.prototype.GetReactionTorque = function(inv_dt){
    return 0;
};
 
 Box2D.Joint.prototype.GetBodyA = function(){
    return this.m_bodyA;
};
 
 Box2D.Joint.prototype.GetBodyB = function(){
    return this.m_bodyB;
};
 
 Box2D.Joint.prototype.GetNext = function(){
    return this.m_next;
};
 
 Box2D.Joint.prototype.GetUserData = function(){
    return this.m_userData;
};
 
 Box2D.Joint.prototype.SetUserData = function(data){
    this.m_userData = data;
};
 
 Box2D.Joint.prototype.IsActive = function(){
    return this.m_bodyA.IsActive() && this.m_bodyB.IsActive();
};
 Box2D.Joint.prototype.m_type = 0;
 Box2D.Joint.prototype.m_prev = undefined;
 Box2D.Joint.prototype.m_next = undefined;
 Box2D.Joint.prototype.m_edgeA = new Box2D.JointEdge();
 Box2D.Joint.prototype.m_edgeB = new Box2D.JointEdge();
 Box2D.Joint.prototype.m_bodyA = undefined;
 Box2D.Joint.prototype.m_bodyB = undefined;
 Box2D.Joint.prototype.m_islandFlag = undefined;
 Box2D.Joint.prototype.m_collideConnected = undefined;
 Box2D.Joint.prototype.m_userData = undefined;
 Box2D.Joint.prototype.m_localCenterA = new Box2D.Vec2();
 Box2D.Joint.prototype.m_localCenterB = new Box2D.Vec2();
 Box2D.Joint.prototype.m_invMassA = undefined;
 Box2D.Joint.prototype.m_invMassB = undefined;
 Box2D.Joint.prototype.m_invIA = undefined;
 Box2D.Joint.prototype.m_invIB = undefined;
 
 Box2D.LineJoint = function(){
    Box2D.Joint.prototype.__varz.call(this);
    this.__varz();
    this.__constructor.apply(this, arguments);
};
 extend(Box2D.LineJoint.prototype, Box2D.Joint.prototype);
 Box2D.LineJoint.prototype._super = Box2D.Joint.prototype;
 
 Box2D.LineJoint.prototype.__constructor = function(def){
    this._super.__constructor.apply(this,[def]);
    var tMat;
    var tX;
    var tY;
    this.m_localAnchor1.SetV(def.localAnchorA);
    this.m_localAnchor2.SetV(def.localAnchorB);
    this.m_localXAxis1.SetV(def.localAxisA);
    this.m_localYAxis1.x = - this.m_localXAxis1.y;
    this.m_localYAxis1.y = this.m_localXAxis1.x;
    this.m_impulse.SetZero();
    this.m_motorMass = 0;
    this.m_motorImpulse = 0;
    this.m_lowerTranslation = def.lowerTranslation;
    this.m_upperTranslation = def.upperTranslation;
    this.m_maxMotorForce = def.maxMotorForce;
    this.m_motorSpeed = def.motorSpeed;
    this.m_enableLimit = def.enableLimit;
    this.m_enableMotor = def.enableMotor;
    this.m_limitState = Box2D.Joint.e_inactiveLimit;
    this.m_axis.SetZero();
    this.m_perp.SetZero();
};
 
 Box2D.LineJoint.prototype.__varz = function()    {
    this.m_localAnchor1 = new Box2D.Vec2();
    this.m_localAnchor2 = new Box2D.Vec2();
    this.m_localXAxis1 = new Box2D.Vec2();
    this.m_localYAxis1 = new Box2D.Vec2();
    this.m_axis = new Box2D.Vec2();
    this.m_perp = new Box2D.Vec2();
    this.m_K = new Box2D.Mat22();
    this.m_impulse = new Box2D.Vec2();
};
 
 Box2D.LineJoint.prototype.InitVelocityConstraints = function(step){
    var bA = this.m_bodyA;
    var bB = this.m_bodyB;
    var tMat;
    var tX;
    this.m_localCenterA.SetV(bA.GetLocalCenter());
    this.m_localCenterB.SetV(bB.GetLocalCenter());
    var xf1 = bA.GetTransform();
    var xf2 = bB.GetTransform();
    tMat = bA.m_xf.R;
    var r1X = this.m_localAnchor1.x - this.m_localCenterA.x;
    var r1Y = this.m_localAnchor1.y - this.m_localCenterA.y;
    tX = tMat.col1.x * r1X + tMat.col2.x * r1Y;
    r1Y = tMat.col1.y * r1X + tMat.col2.y * r1Y;
    r1X = tX;
    tMat = bB.m_xf.R;
    var r2X = this.m_localAnchor2.x - this.m_localCenterB.x;
    var r2Y = this.m_localAnchor2.y - this.m_localCenterB.y;
    tX = tMat.col1.x * r2X + tMat.col2.x * r2Y;
    r2Y = tMat.col1.y * r2X + tMat.col2.y * r2Y;
    r2X = tX;
    var dX = bB.m_sweep.c.x + r2X - bA.m_sweep.c.x - r1X;
    var dY = bB.m_sweep.c.y + r2Y - bA.m_sweep.c.y - r1Y;
    this.m_invMassA = bA.m_invMass;
    this.m_invMassB = bB.m_invMass;
    this.m_invIA = bA.m_invI;
    this.m_invIB = bB.m_invI;
    this.m_axis.SetV(Box2D.Math.MulMV(xf1.R, this.m_localXAxis1));
    this.m_a1 = (dX + r1X) * this.m_axis.y - (dY + r1Y) * this.m_axis.x;
    this.m_a2 = r2X * this.m_axis.y - r2Y * this.m_axis.x;
    this.m_motorMass = this.m_invMassA + this.m_invMassB + this.m_invIA * this.m_a1 * this.m_a1 + this.m_invIB * this.m_a2 * this.m_a2;
    this.m_motorMass = this.m_motorMass > Number.MIN_VALUE ? 1 / this.m_motorMass: 0;
    this.m_perp.SetV(Box2D.Math.MulMV(xf1.R, this.m_localYAxis1));
    this.m_s1 = (dX + r1X) * this.m_perp.y - (dY + r1Y) * this.m_perp.x;
    this.m_s2 = r2X * this.m_perp.y - r2Y * this.m_perp.x;
    var m1 = this.m_invMassA;
    var m2 = this.m_invMassB;
    var i1 = this.m_invIA;
    var i2 = this.m_invIB;
    this.m_K.col1.x = m1 + m2 + i1 * this.m_s1 * this.m_s1 + i2 * this.m_s2 * this.m_s2;
    this.m_K.col1.y = i1 * this.m_s1 * this.m_a1 + i2 * this.m_s2 * this.m_a2;
    this.m_K.col2.x = this.m_K.col1.y;
    this.m_K.col2.y = m1 + m2 + i1 * this.m_a1 * this.m_a1 + i2 * this.m_a2 * this.m_a2;
    if (this.m_enableLimit){
        var jointTransition = this.m_axis.x * dX + this.m_axis.y * dY;
        if (Box2D.Math.Abs(this.m_upperTranslation - this.m_lowerTranslation) < 2 * Box2D.Settings.b2_linearSlop){
            this.m_limitState = Box2D.Joint.e_equalLimits;
        }
        else {
            if (jointTransition <= this.m_lowerTranslation){
                if (this.m_limitState != Box2D.Joint.e_atLowerLimit){
                    this.m_limitState = Box2D.Joint.e_atLowerLimit;
                    this.m_impulse.y = 0;
                }
            }
            else {
                if (jointTransition >= this.m_upperTranslation){
                    if (this.m_limitState != Box2D.Joint.e_atUpperLimit){
                        this.m_limitState = Box2D.Joint.e_atUpperLimit;
                        this.m_impulse.y = 0;
                    }
                }
                else {
                    this.m_limitState = Box2D.Joint.e_inactiveLimit;
                    this.m_impulse.y = 0;
                }
            }
        }
    }
    else {
        this.m_limitState = Box2D.Joint.e_inactiveLimit;
    }
    if (this.m_enableMotor === false){
        this.m_motorImpulse = 0;
    }
    if (step.warmStarting){
        this.m_impulse.x *= step.dtRatio;
        this.m_impulse.y *= step.dtRatio;
        this.m_motorImpulse *= step.dtRatio;
        var PX = this.m_impulse.x * this.m_perp.x + (this.m_motorImpulse + this.m_impulse.y) * this.m_axis.x;
        var PY = this.m_impulse.x * this.m_perp.y + (this.m_motorImpulse + this.m_impulse.y) * this.m_axis.y;
        var L1 = this.m_impulse.x * this.m_s1 + (this.m_motorImpulse + this.m_impulse.y) * this.m_a1;
        var L2 = this.m_impulse.x * this.m_s2 + (this.m_motorImpulse + this.m_impulse.y) * this.m_a2;
        bA.m_linearVelocity.x -= this.m_invMassA * PX;
        bA.m_linearVelocity.y -= this.m_invMassA * PY;
        bA.m_angularVelocity -= this.m_invIA * L1;
        bB.m_linearVelocity.x += this.m_invMassB * PX;
        bB.m_linearVelocity.y += this.m_invMassB * PY;
        bB.m_angularVelocity += this.m_invIB * L2;
    }
    else {
        this.m_impulse.SetZero();
        this.m_motorImpulse = 0;
    }
};
 
 Box2D.LineJoint.prototype.SolveVelocityConstraints = function(step){
    var bA = this.m_bodyA;
    var bB = this.m_bodyB;
    var v1 = bA.m_linearVelocity;
    var w1 = bA.m_angularVelocity;
    var v2 = bB.m_linearVelocity;
    var w2 = bB.m_angularVelocity;
    var PX;
    var PY;
    var L1;
    var L2;
    if (this.m_enableMotor && this.m_limitState != Box2D.Joint.e_equalLimits){
        var Cdot = this.m_axis.x * (v2.x - v1.x) + this.m_axis.y * (v2.y - v1.y) + this.m_a2 * w2 - this.m_a1 * w1;
        var impulse = this.m_motorMass * (this.m_motorSpeed - Cdot);
        var oldImpulse = this.m_motorImpulse;
        var maxImpulse = step.dt * this.m_maxMotorForce;
        this.m_motorImpulse = Box2D.Math.Clamp(this.m_motorImpulse + impulse, - maxImpulse, maxImpulse);
        impulse = this.m_motorImpulse - oldImpulse;
        PX = impulse * this.m_axis.x;
        PY = impulse * this.m_axis.y;
        L1 = impulse * this.m_a1;
        L2 = impulse * this.m_a2;
        v1.x -= this.m_invMassA * PX;
        v1.y -= this.m_invMassA * PY;
        w1 -= this.m_invIA * L1;
        v2.x += this.m_invMassB * PX;
        v2.y += this.m_invMassB * PY;
        w2 += this.m_invIB * L2;
    }
    var Cdot1 = this.m_perp.x * (v2.x - v1.x) + this.m_perp.y * (v2.y - v1.y) + this.m_s2 * w2 - this.m_s1 * w1;
    if (this.m_enableLimit && this.m_limitState != Box2D.Joint.e_inactiveLimit){
        var Cdot2 = this.m_axis.x * (v2.x - v1.x) + this.m_axis.y * (v2.y - v1.y) + this.m_a2 * w2 - this.m_a1 * w1;
        var f1 = this.m_impulse.Copy();
        var df = this.m_K.Solve(new Box2D.Vec2(), - Cdot1, - Cdot2);
        this.m_impulse.Add(df);
        if (this.m_limitState == Box2D.Joint.e_atLowerLimit){
            this.m_impulse.y = Box2D.Math.Max(this.m_impulse.y, 0);
        }
        else {
            if (this.m_limitState == Box2D.Joint.e_atUpperLimit){
                this.m_impulse.y = Box2D.Math.Min(this.m_impulse.y, 0);
            }
        }
        var b = - Cdot1 - (this.m_impulse.y - f1.y) * this.m_K.col2.x;
        var f2r;
        if (this.m_K.col1.x !== 0){
            f2r = b / this.m_K.col1.x + f1.x;
        }
        else {
            f2r = f1.x;
        }
        this.m_impulse.x = f2r;
        df.x = this.m_impulse.x - f1.x;
        df.y = this.m_impulse.y - f1.y;
        PX = df.x * this.m_perp.x + df.y * this.m_axis.x;
        PY = df.x * this.m_perp.y + df.y * this.m_axis.y;
        L1 = df.x * this.m_s1 + df.y * this.m_a1;
        L2 = df.x * this.m_s2 + df.y * this.m_a2;
        v1.x -= this.m_invMassA * PX;
        v1.y -= this.m_invMassA * PY;
        w1 -= this.m_invIA * L1;
        v2.x += this.m_invMassB * PX;
        v2.y += this.m_invMassB * PY;
        w2 += this.m_invIB * L2;
    }
    else {
        var df2;
        if (this.m_K.col1.x !== 0){
            df2 = - Cdot1 / this.m_K.col1.x;
        }
        else {
            df2 = 0;
        }
        this.m_impulse.x += df2;
        PX = df2 * this.m_perp.x;
        PY = df2 * this.m_perp.y;
        L1 = df2 * this.m_s1;
        L2 = df2 * this.m_s2;
        v1.x -= this.m_invMassA * PX;
        v1.y -= this.m_invMassA * PY;
        w1 -= this.m_invIA * L1;
        v2.x += this.m_invMassB * PX;
        v2.y += this.m_invMassB * PY;
        w2 += this.m_invIB * L2;
    }
    bA.m_linearVelocity.SetV(v1);
    bA.m_angularVelocity = w1;
    bB.m_linearVelocity.SetV(v2);
    bB.m_angularVelocity = w2;
};
 
 Box2D.LineJoint.prototype.SolvePositionConstraints = function(baumgarte){
    var limitC;
    var oldLimitImpulse;
    var bA = this.m_bodyA;
    var bB = this.m_bodyB;
    var c1 = bA.m_sweep.c;
    var a1 = bA.m_sweep.a;
    var c2 = bB.m_sweep.c;
    var a2 = bB.m_sweep.a;
    var tMat;
    var tX;
    var m1;
    var m2;
    var i1;
    var i2;
    var linearError = 0;
    var angularError = 0;
    var active = false;
    var C2 = 0;
    var R1 = Box2D.Mat22.FromAngle(a1);
    var R2 = Box2D.Mat22.FromAngle(a2);
    tMat = R1;
    var r1X = this.m_localAnchor1.x - this.m_localCenterA.x;
    var r1Y = this.m_localAnchor1.y - this.m_localCenterA.y;
    tX = tMat.col1.x * r1X + tMat.col2.x * r1Y;
    r1Y = tMat.col1.y * r1X + tMat.col2.y * r1Y;
    r1X = tX;
    tMat = R2;
    var r2X = this.m_localAnchor2.x - this.m_localCenterB.x;
    var r2Y = this.m_localAnchor2.y - this.m_localCenterB.y;
    tX = tMat.col1.x * r2X + tMat.col2.x * r2Y;
    r2Y = tMat.col1.y * r2X + tMat.col2.y * r2Y;
    r2X = tX;
    var dX = c2.x + r2X - c1.x - r1X;
    var dY = c2.y + r2Y - c1.y - r1Y;
    if (this.m_enableLimit){
        this.m_axis = Box2D.Math.MulMV(R1, this.m_localXAxis1);
        this.m_a1 = (dX + r1X) * this.m_axis.y - (dY + r1Y) * this.m_axis.x;
        this.m_a2 = r2X * this.m_axis.y - r2Y * this.m_axis.x;
        var translation = this.m_axis.x * dX + this.m_axis.y * dY;
        if (Box2D.Math.Abs(this.m_upperTranslation - this.m_lowerTranslation) < 2 * Box2D.Settings.b2_linearSlop){
            C2 = Box2D.Math.Clamp(translation, - Box2D.Settings.b2_maxLinearCorrection, Box2D.Settings.b2_maxLinearCorrection);
            linearError = Box2D.Math.Abs(translation);
            active = true;
        }
        else {
            if (translation <= this.m_lowerTranslation){
                C2 = Box2D.Math.Clamp(translation - this.m_lowerTranslation + Box2D.Settings.b2_linearSlop, - Box2D.Settings.b2_maxLinearCorrection, 
                   0);
                linearError = this.m_lowerTranslation - translation;
                active = true;
            }
            else {
                if (translation >= this.m_upperTranslation){
                    C2 = Box2D.Math.Clamp(translation - this.m_upperTranslation + Box2D.Settings.b2_linearSlop, 0, 
                       Box2D.Settings.b2_maxLinearCorrection);
                    linearError = translation - this.m_upperTranslation;
                    active = true;
                }
            }
        }
    }
    this.m_perp = Box2D.Math.MulMV(R1, this.m_localYAxis1);
    this.m_s1 = (dX + r1X) * this.m_perp.y - (dY + r1Y) * this.m_perp.x;
    this.m_s2 = r2X * this.m_perp.y - r2Y * this.m_perp.x;
    var impulse = new Box2D.Vec2();
    var C1 = this.m_perp.x * dX + this.m_perp.y * dY;
    linearError = Box2D.Math.Max(linearError, Box2D.Math.Abs(C1));
    angularError = 0;
    if (active){
        m1 = this.m_invMassA;
        m2 = this.m_invMassB;
        i1 = this.m_invIA;
        i2 = this.m_invIB;
        this.m_K.col1.x = m1 + m2 + i1 * this.m_s1 * this.m_s1 + i2 * this.m_s2 * this.m_s2;
        this.m_K.col1.y = i1 * this.m_s1 * this.m_a1 + i2 * this.m_s2 * this.m_a2;
        this.m_K.col2.x = this.m_K.col1.y;
        this.m_K.col2.y = m1 + m2 + i1 * this.m_a1 * this.m_a1 + i2 * this.m_a2 * this.m_a2;
        this.m_K.Solve(impulse, - C1, - C2);
    }
    else {
        m1 = this.m_invMassA;
        m2 = this.m_invMassB;
        i1 = this.m_invIA;
        i2 = this.m_invIB;
        var k11 = m1 + m2 + i1 * this.m_s1 * this.m_s1 + i2 * this.m_s2 * this.m_s2;
        var impulse1;
        if (k11 !== 0){
            impulse1 = - C1 / k11;
        }
        else {
            impulse1 = 0;
        }
        impulse.x = impulse1;
        impulse.y = 0;
    }
    var PX = impulse.x * this.m_perp.x + impulse.y * this.m_axis.x;
    var PY = impulse.x * this.m_perp.y + impulse.y * this.m_axis.y;
    var L1 = impulse.x * this.m_s1 + impulse.y * this.m_a1;
    var L2 = impulse.x * this.m_s2 + impulse.y * this.m_a2;
    c1.x -= this.m_invMassA * PX;
    c1.y -= this.m_invMassA * PY;
    a1 -= this.m_invIA * L1;
    c2.x += this.m_invMassB * PX;
    c2.y += this.m_invMassB * PY;
    a2 += this.m_invIB * L2;
    bA.m_sweep.a = a1;
    bB.m_sweep.a = a2;
    bA.SynchronizeTransform();
    bB.SynchronizeTransform();
    return linearError <= Box2D.Settings.b2_linearSlop && angularError <= Box2D.Settings.b2_angularSlop;
};
 
 Box2D.LineJoint.prototype.GetAnchorA = function(){
    return this.m_bodyA.GetWorldPoint(this.m_localAnchor1);
};
 
 Box2D.LineJoint.prototype.GetAnchorB = function(){
    return this.m_bodyB.GetWorldPoint(this.m_localAnchor2);
};
 
 Box2D.LineJoint.prototype.GetReactionForce = function(inv_dt){
    return new Box2D.Vec2(inv_dt * (this.m_impulse.x * this.m_perp.x + (this.m_motorImpulse + this.m_impulse.y) * this.m_axis.x), 
       inv_dt * (this.m_impulse.x * this.m_perp.y + (this.m_motorImpulse + this.m_impulse.y) * this.m_axis.y));
};
 
 Box2D.LineJoint.prototype.GetReactionTorque = function(inv_dt){
    return inv_dt * this.m_impulse.y;
};
 
 Box2D.LineJoint.prototype.GetJointTranslation = function(){
    var bA = this.m_bodyA;
    var bB = this.m_bodyB;
    var tMat;
    var p1 = bA.GetWorldPoint(this.m_localAnchor1);
    var p2 = bB.GetWorldPoint(this.m_localAnchor2);
    var dX = p2.x - p1.x;
    var dY = p2.y - p1.y;
    var axis = bA.GetWorldVector(this.m_localXAxis1);
    var translation = axis.x * dX + axis.y * dY;
    return translation;
};
 
 Box2D.LineJoint.prototype.GetJointSpeed = function(){
    var bA = this.m_bodyA;
    var bB = this.m_bodyB;
    var tMat;
    tMat = bA.m_xf.R;
    var r1X = this.m_localAnchor1.x - bA.m_sweep.localCenter.x;
    var r1Y = this.m_localAnchor1.y - bA.m_sweep.localCenter.y;
    var tX = tMat.col1.x * r1X + tMat.col2.x * r1Y;
    r1Y = tMat.col1.y * r1X + tMat.col2.y * r1Y;
    r1X = tX;
    tMat = bB.m_xf.R;
    var r2X = this.m_localAnchor2.x - bB.m_sweep.localCenter.x;
    var r2Y = this.m_localAnchor2.y - bB.m_sweep.localCenter.y;
    tX = tMat.col1.x * r2X + tMat.col2.x * r2Y;
    r2Y = tMat.col1.y * r2X + tMat.col2.y * r2Y;
    r2X = tX;
    var p1X = bA.m_sweep.c.x + r1X;
    var p1Y = bA.m_sweep.c.y + r1Y;
    var p2X = bB.m_sweep.c.x + r2X;
    var p2Y = bB.m_sweep.c.y + r2Y;
    var dX = p2X - p1X;
    var dY = p2Y - p1Y;
    var axis = bA.GetWorldVector(this.m_localXAxis1);
    var v1 = bA.m_linearVelocity;
    var v2 = bB.m_linearVelocity;
    var w1 = bA.m_angularVelocity;
    var w2 = bB.m_angularVelocity;
    var speed = dX * - w1 * axis.y + dY * w1 * axis.x + (axis.x * (v2.x - w2 * r2Y - v1.x + w1 * r1Y) + axis.y * (v2.y + w2 * r2X - v1.y - w1 * r1X));
    return speed;
};
 
 Box2D.LineJoint.prototype.IsLimitEnabled = function(){
    return this.m_enableLimit;
};
 
 Box2D.LineJoint.prototype.EnableLimit = function(flag){
    this.m_bodyA.SetAwake(true);
    this.m_bodyB.SetAwake(true);
    this.m_enableLimit = flag;
};
 
 Box2D.LineJoint.prototype.GetLowerLimit = function(){
    return this.m_lowerTranslation;
};
 
 Box2D.LineJoint.prototype.GetUpperLimit = function(){
    return this.m_upperTranslation;
};
 
 Box2D.LineJoint.prototype.SetLimits = function(lower, upper){
    this.m_bodyA.SetAwake(true);
    this.m_bodyB.SetAwake(true);
    this.m_lowerTranslation = lower;
    this.m_upperTranslation = upper;
};
 
 Box2D.LineJoint.prototype.IsMotorEnabled = function(){
    return this.m_enableMotor;
};
 
 Box2D.LineJoint.prototype.EnableMotor = function(flag){
    this.m_bodyA.SetAwake(true);
    this.m_bodyB.SetAwake(true);
    this.m_enableMotor = flag;
};
 
 Box2D.LineJoint.prototype.SetMotorSpeed = function(speed){
    this.m_bodyA.SetAwake(true);
    this.m_bodyB.SetAwake(true);
    this.m_motorSpeed = speed;
};
 
 Box2D.LineJoint.prototype.GetMotorSpeed = function(){
    return this.m_motorSpeed;
};
 
 Box2D.LineJoint.prototype.SetMaxMotorForce = function(force){
    this.m_bodyA.SetAwake(true);
    this.m_bodyB.SetAwake(true);
    this.m_maxMotorForce = force;
};
 
 Box2D.LineJoint.prototype.GetMaxMotorForce = function(){
    return this.m_maxMotorForce;
};
 
 Box2D.LineJoint.prototype.GetMotorForce = function(){
    return this.m_motorImpulse;
};
 Box2D.LineJoint.prototype.m_localAnchor1 = new Box2D.Vec2();
 Box2D.LineJoint.prototype.m_localAnchor2 = new Box2D.Vec2();
 Box2D.LineJoint.prototype.m_localXAxis1 = new Box2D.Vec2();
 Box2D.LineJoint.prototype.m_localYAxis1 = new Box2D.Vec2();
 Box2D.LineJoint.prototype.m_axis = new Box2D.Vec2();
 Box2D.LineJoint.prototype.m_perp = new Box2D.Vec2();
 Box2D.LineJoint.prototype.m_s1 = undefined;
 Box2D.LineJoint.prototype.m_s2 = undefined;
 Box2D.LineJoint.prototype.m_a1 = undefined;
 Box2D.LineJoint.prototype.m_a2 = undefined;
 Box2D.LineJoint.prototype.m_K = new Box2D.Mat22();
 Box2D.LineJoint.prototype.m_impulse = new Box2D.Vec2();
 Box2D.LineJoint.prototype.m_motorMass = undefined;
 Box2D.LineJoint.prototype.m_motorImpulse = undefined;
 Box2D.LineJoint.prototype.m_lowerTranslation = undefined;
 Box2D.LineJoint.prototype.m_upperTranslation = undefined;
 Box2D.LineJoint.prototype.m_maxMotorForce = undefined;
 Box2D.LineJoint.prototype.m_motorSpeed = undefined;
 Box2D.LineJoint.prototype.m_enableLimit = undefined;
 Box2D.LineJoint.prototype.m_enableMotor = undefined;
 Box2D.LineJoint.prototype.m_limitState = 0;
 
 Box2D.ContactSolver = function(){
    this.__varz();
    this.__constructor.apply(this, arguments);
};
 
 Box2D.ContactSolver.prototype.__constructor = function(){
};
 Box2D.ContactSolver.prototype.__varz = function(){
    this.m_step = new Box2D.TimeStep();
    this.m_constraints =[];
};
 Box2D.ContactSolver.s_worldManifold = new Box2D.WorldManifold();
 Box2D.ContactSolver.s_psm = new Box2D.PositionSolverManifold();
 
 Box2D.ContactSolver.prototype.Initialize = function(step, contacts, contactCount, allocator){
    var contact;
    this.m_step.Set(step);
    this.m_allocator = allocator;
    var i = 0;
    var tVec;
    var tMat;
    this.m_constraintCount = contactCount;
    while (this.m_constraints.length < this.m_constraintCount){
        this.m_constraints[this.m_constraints.length] = new Box2D.ContactConstraint();
    }
    for (i = 0;i < contactCount; ++i){
        contact = contacts[i];
        var fixtureA = contact.m_fixtureA;
        var fixtureB = contact.m_fixtureB;
        var shapeA = fixtureA.m_shape;
        var shapeB = fixtureB.m_shape;
        var radiusA = shapeA.m_radius;
        var radiusB = shapeB.m_radius;
        var bodyA = fixtureA.m_body;
        var bodyB = fixtureB.m_body;
        var manifold = contact.GetManifold();
        var friction = Box2D.Settings.b2MixFriction(fixtureA.GetFriction(), fixtureB.GetFriction());
        var restitution = Box2D.Settings.b2MixRestitution(fixtureA.GetRestitution(), fixtureB.GetRestitution());
        var vAX = bodyA.m_linearVelocity.x;
        var vAY = bodyA.m_linearVelocity.y;
        var vBX = bodyB.m_linearVelocity.x;
        var vBY = bodyB.m_linearVelocity.y;
        var wA = bodyA.m_angularVelocity;
        var wB = bodyB.m_angularVelocity;
        Box2D.Settings.b2Assert(manifold.m_pointCount > 0);
        Box2D.ContactSolver.s_worldManifold.Initialize(manifold, bodyA.m_xf, radiusA, bodyB.m_xf, radiusB);
        var normalX = Box2D.ContactSolver.s_worldManifold.m_normal.x;
        var normalY = Box2D.ContactSolver.s_worldManifold.m_normal.y;
        var cc = this.m_constraints[i];
        cc.bodyA = bodyA;
        cc.bodyB = bodyB;
        cc.manifold = manifold;
        cc.normal.x = normalX;
        cc.normal.y = normalY;
        cc.pointCount = manifold.m_pointCount;
        cc.friction = friction;
        cc.restitution = restitution;
        cc.localPlaneNormal.x = manifold.m_localPlaneNormal.x;
        cc.localPlaneNormal.y = manifold.m_localPlaneNormal.y;
        cc.localPoint.x = manifold.m_localPoint.x;
        cc.localPoint.y = manifold.m_localPoint.y;
        cc.radius = radiusA + radiusB;
        cc.type = manifold.m_type;
        for (var k = 0;k < cc.pointCount; ++ k){
            var cp = manifold.m_points[k];
            var ccp = cc.points[k];
            ccp.normalImpulse = cp.m_normalImpulse;
            ccp.tangentImpulse = cp.m_tangentImpulse;
            ccp.localPoint.SetV(cp.m_localPoint);
            var rAX = ccp.rA.x = Box2D.ContactSolver.s_worldManifold.m_points[k].x - bodyA.m_sweep.c.x;
            var rAY = ccp.rA.y = Box2D.ContactSolver.s_worldManifold.m_points[k].y - bodyA.m_sweep.c.y;
            var rBX = ccp.rB.x = Box2D.ContactSolver.s_worldManifold.m_points[k].x - bodyB.m_sweep.c.x;
            var rBY = ccp.rB.y = Box2D.ContactSolver.s_worldManifold.m_points[k].y - bodyB.m_sweep.c.y;
            var rnA = rAX * normalY - rAY * normalX;
            var rnB = rBX * normalY - rBY * normalX;
            rnA *= rnA;
            rnB *= rnB;
            var kNormal = bodyA.m_invMass + bodyB.m_invMass + bodyA.m_invI * rnA + bodyB.m_invI * rnB;
            ccp.normalMass = 1 / kNormal;
            var kEqualized = bodyA.m_mass * bodyA.m_invMass + bodyB.m_mass * bodyB.m_invMass;
            kEqualized += bodyA.m_mass * bodyA.m_invI * rnA + bodyB.m_mass * bodyB.m_invI * rnB;
            ccp.equalizedMass = 1 / kEqualized;
            var tangentX = normalY;
            var tangentY = - normalX;
            var rtA = rAX * tangentY - rAY * tangentX;
            var rtB = rBX * tangentY - rBY * tangentX;
            rtA *= rtA;
            rtB *= rtB;
            var kTangent = bodyA.m_invMass + bodyB.m_invMass + bodyA.m_invI * rtA + bodyB.m_invI * rtB;
            ccp.tangentMass = 1 / kTangent;
            ccp.velocityBias = 0;
            var tX = vBX - wB * rBY - vAX + wA * rAY;
            var tY = vBY + wB * rBX - vAY - wA * rAX;
            var vRel = cc.normal.x * tX + cc.normal.y * tY;
            if (vRel < - Box2D.Settings.b2_velocityThreshold){
                ccp.velocityBias += - cc.restitution * vRel;
            }
        }
        if (cc.pointCount == 2){
            var ccp1 = cc.points[0];
            var ccp2 = cc.points[1];
            var invMassA = bodyA.m_invMass;
            var invIA = bodyA.m_invI;
            var invMassB = bodyB.m_invMass;
            var invIB = bodyB.m_invI;
            var rn1A = ccp1.rA.x * normalY - ccp1.rA.y * normalX;
            var rn1B = ccp1.rB.x * normalY - ccp1.rB.y * normalX;
            var rn2A = ccp2.rA.x * normalY - ccp2.rA.y * normalX;
            var rn2B = ccp2.rB.x * normalY - ccp2.rB.y * normalX;
            var k11 = invMassA + invMassB + invIA * rn1A * rn1A + invIB * rn1B * rn1B;
            var k22 = invMassA + invMassB + invIA * rn2A * rn2A + invIB * rn2B * rn2B;
            var k12 = invMassA + invMassB + invIA * rn1A * rn2A + invIB * rn1B * rn2B;
            var k_maxConditionNumber = 100;
            if (k11 * k11 < k_maxConditionNumber * (k11 * k22 - k12 * k12)){
                cc.K.col1.Set(k11, k12);
                cc.K.col2.Set(k12, k22);
                cc.K.GetInverse(cc.normalMass);
            }
            else {
                cc.pointCount = 1;
            }
        }
    }
};
 
 Box2D.ContactSolver.prototype.InitVelocityConstraints = function(step){
    var tVec;
    var tVec2;
    var tMat;
    for (var i = 0;i < this.m_constraintCount; ++i){
        var c = this.m_constraints[i];
        var bodyA = c.bodyA;
        var bodyB = c.bodyB;
        var invMassA = bodyA.m_invMass;
        var invIA = bodyA.m_invI;
        var invMassB = bodyB.m_invMass;
        var invIB = bodyB.m_invI;
        var normalX = c.normal.x;
        var normalY = c.normal.y;
        var tangentX = normalY;
        var tangentY = - normalX;
        var tX;
        var j = 0;
        var tCount = 0;
        if (step.warmStarting){
            tCount = c.pointCount;
            for (j = 0;j < tCount; ++ j){
                var ccp = c.points[j];
                ccp.normalImpulse *= step.dtRatio;
                ccp.tangentImpulse *= step.dtRatio;
                var PX = ccp.normalImpulse * normalX + ccp.tangentImpulse * tangentX;
                var PY = ccp.normalImpulse * normalY + ccp.tangentImpulse * tangentY;
                bodyA.m_angularVelocity -= invIA * (ccp.rA.x * PY - ccp.rA.y * PX);
                bodyA.m_linearVelocity.x -= invMassA * PX;
                bodyA.m_linearVelocity.y -= invMassA * PY;
                bodyB.m_angularVelocity += invIB * (ccp.rB.x * PY - ccp.rB.y * PX);
                bodyB.m_linearVelocity.x += invMassB * PX;
                bodyB.m_linearVelocity.y += invMassB * PY;
            }
        }
        else {
            tCount = c.pointCount;
            for (j = 0;j < tCount; ++ j){
                var ccp2 = c.points[j];
                ccp2.normalImpulse = 0;
                ccp2.tangentImpulse = 0;
            }
        }
    }
};
 
 Box2D.ContactSolver.prototype.SolveVelocityConstraints = function(){
    var j = 0;
    var ccp;
    var rAX;
    var rAY;
    var rBX;
    var rBY;
    var dvX;
    var dvY;
    var vn;
    var vt;
    var lambda;
    var maxFriction;
    var newImpulse;
    var PX;
    var PY;
    var dX;
    var dY;
    var P1X;
    var P1Y;
    var P2X;
    var P2Y;
    var tMat;
    var tVec;
    for (var i = 0;i < this.m_constraintCount; ++i){
        var c = this.m_constraints[i];
        var bodyA = c.bodyA;
        var bodyB = c.bodyB;
        var wA = bodyA.m_angularVelocity;
        var wB = bodyB.m_angularVelocity;
        var vA = bodyA.m_linearVelocity;
        var vB = bodyB.m_linearVelocity;
        var invMassA = bodyA.m_invMass;
        var invIA = bodyA.m_invI;
        var invMassB = bodyB.m_invMass;
        var invIB = bodyB.m_invI;
        var normalX = c.normal.x;
        var normalY = c.normal.y;
        var tangentX = normalY;
        var tangentY = - normalX;
        var friction = c.friction;
        var tX;
        for (j = 0;j < c.pointCount;j++)            {
            ccp = c.points[j];
            dvX = vB.x - wB * ccp.rB.y - vA.x + wA * ccp.rA.y;
            dvY = vB.y + wB * ccp.rB.x - vA.y - wA * ccp.rA.x;
            vt = dvX * tangentX + dvY * tangentY;
            lambda = ccp.tangentMass * - vt;
            maxFriction = friction * ccp.normalImpulse;
            newImpulse = Box2D.Math.Clamp(ccp.tangentImpulse + lambda, - maxFriction, maxFriction);
            lambda = newImpulse - ccp.tangentImpulse;
            PX = lambda * tangentX;
            PY = lambda * tangentY;
            vA.x -= invMassA * PX;
            vA.y -= invMassA * PY;
            wA -= invIA * (ccp.rA.x * PY - ccp.rA.y * PX);
            vB.x += invMassB * PX;
            vB.y += invMassB * PY;
            wB += invIB * (ccp.rB.x * PY - ccp.rB.y * PX);
            ccp.tangentImpulse = newImpulse;
        }
        var tCount = c.pointCount;
        if (c.pointCount == 1){
            ccp = c.points[0];
            dvX = vB.x - wB * ccp.rB.y - vA.x + wA * ccp.rA.y;
            dvY = vB.y + wB * ccp.rB.x - vA.y - wA * ccp.rA.x;
            vn = dvX * normalX + dvY * normalY;
            lambda = - ccp.normalMass * (vn - ccp.velocityBias);
            newImpulse = ccp.normalImpulse + lambda;
            newImpulse = newImpulse > 0 ? newImpulse: 0;
            lambda = newImpulse - ccp.normalImpulse;
            PX = lambda * normalX;
            PY = lambda * normalY;
            vA.x -= invMassA * PX;
            vA.y -= invMassA * PY;
            wA -= invIA * (ccp.rA.x * PY - ccp.rA.y * PX);
            vB.x += invMassB * PX;
            vB.y += invMassB * PY;
            wB += invIB * (ccp.rB.x * PY - ccp.rB.y * PX);
            ccp.normalImpulse = newImpulse;
        }
        else {
            var cp1 = c.points[0];
            var cp2 = c.points[1];
            var aX = cp1.normalImpulse;
            var aY = cp2.normalImpulse;
            var dv1X = vB.x - wB * cp1.rB.y - vA.x + wA * cp1.rA.y;
            var dv1Y = vB.y + wB * cp1.rB.x - vA.y - wA * cp1.rA.x;
            var dv2X = vB.x - wB * cp2.rB.y - vA.x + wA * cp2.rA.y;
            var dv2Y = vB.y + wB * cp2.rB.x - vA.y - wA * cp2.rA.x;
            var vn1 = dv1X * normalX + dv1Y * normalY;
            var vn2 = dv2X * normalX + dv2Y * normalY;
            var bX = vn1 - cp1.velocityBias;
            var bY = vn2 - cp2.velocityBias;
            tMat = c.K;
            bX -= tMat.col1.x * aX + tMat.col2.x * aY;
            bY -= tMat.col1.y * aX + tMat.col2.y * aY;
            var k_errorTol = 0.0010;
            for (;;){
                tMat = c.normalMass;
                var xX = - (tMat.col1.x * bX + tMat.col2.x * bY);
                var xY = - (tMat.col1.y * bX + tMat.col2.y * bY);
                if (xX >= 0 && xY >= 0){
                    dX = xX - aX;
                    dY = xY - aY;
                    P1X = dX * normalX;
                    P1Y = dX * normalY;
                    P2X = dY * normalX;
                    P2Y = dY * normalY;
                    vA.x -= invMassA * (P1X + P2X);
                    vA.y -= invMassA * (P1Y + P2Y);
                    wA -= invIA * (cp1.rA.x * P1Y - cp1.rA.y * P1X + cp2.rA.x * P2Y - cp2.rA.y * P2X);
                    vB.x += invMassB * (P1X + P2X);
                    vB.y += invMassB * (P1Y + P2Y);
                    wB += invIB * (cp1.rB.x * P1Y - cp1.rB.y * P1X + cp2.rB.x * P2Y - cp2.rB.y * P2X);
                    cp1.normalImpulse = xX;
                    cp2.normalImpulse = xY;
                    break;
                }
                xX = - cp1.normalMass * bX;
                xY = 0;
                vn1 = 0;
                vn2 = c.K.col1.y * xX + bY;
                if (xX >= 0 && vn2 >= 0){
                    dX = xX - aX;
                    dY = xY - aY;
                    P1X = dX * normalX;
                    P1Y = dX * normalY;
                    P2X = dY * normalX;
                    P2Y = dY * normalY;
                    vA.x -= invMassA * (P1X + P2X);
                    vA.y -= invMassA * (P1Y + P2Y);
                    wA -= invIA * (cp1.rA.x * P1Y - cp1.rA.y * P1X + cp2.rA.x * P2Y - cp2.rA.y * P2X);
                    vB.x += invMassB * (P1X + P2X);
                    vB.y += invMassB * (P1Y + P2Y);
                    wB += invIB * (cp1.rB.x * P1Y - cp1.rB.y * P1X + cp2.rB.x * P2Y - cp2.rB.y * P2X);
                    cp1.normalImpulse = xX;
                    cp2.normalImpulse = xY;
                    break;
                }
                xX = 0;
                xY = - cp2.normalMass * bY;
                vn1 = c.K.col2.x * xY + bX;
                vn2 = 0;
                if (xY >= 0 && vn1 >= 0)                    {
                    dX = xX - aX;
                    dY = xY - aY;
                    P1X = dX * normalX;
                    P1Y = dX * normalY;
                    P2X = dY * normalX;
                    P2Y = dY * normalY;
                    vA.x -= invMassA * (P1X + P2X);
                    vA.y -= invMassA * (P1Y + P2Y);
                    wA -= invIA * (cp1.rA.x * P1Y - cp1.rA.y * P1X + cp2.rA.x * P2Y - cp2.rA.y * P2X);
                    vB.x += invMassB * (P1X + P2X);
                    vB.y += invMassB * (P1Y + P2Y);
                    wB += invIB * (cp1.rB.x * P1Y - cp1.rB.y * P1X + cp2.rB.x * P2Y - cp2.rB.y * P2X);
                    cp1.normalImpulse = xX;
                    cp2.normalImpulse = xY;
                    break;
                }
                xX = 0;
                xY = 0;
                vn1 = bX;
                vn2 = bY;
                if (vn1 >= 0 && vn2 >= 0)                    {
                    dX = xX - aX;
                    dY = xY - aY;
                    P1X = dX * normalX;
                    P1Y = dX * normalY;
                    P2X = dY * normalX;
                    P2Y = dY * normalY;
                    vA.x -= invMassA * (P1X + P2X);
                    vA.y -= invMassA * (P1Y + P2Y);
                    wA -= invIA * (cp1.rA.x * P1Y - cp1.rA.y * P1X + cp2.rA.x * P2Y - cp2.rA.y * P2X);
                    vB.x += invMassB * (P1X + P2X);
                    vB.y += invMassB * (P1Y + P2Y);
                    wB += invIB * (cp1.rB.x * P1Y - cp1.rB.y * P1X + cp2.rB.x * P2Y - cp2.rB.y * P2X);
                    cp1.normalImpulse = xX;
                    cp2.normalImpulse = xY;
                    break;
                }
                break;
            }
        }
        bodyA.m_angularVelocity = wA;
        bodyB.m_angularVelocity = wB;
    }
};
 
 Box2D.ContactSolver.prototype.FinalizeVelocityConstraints = function(){
    for (var i = 0;i < this.m_constraintCount; ++i){
        var c = this.m_constraints[i];
        var m = c.manifold;
        for (var j = 0;j < c.pointCount; ++ j){
            var point1 = m.m_points[j];
            var point2 = c.points[j];
            point1.m_normalImpulse = point2.normalImpulse;
            point1.m_tangentImpulse = point2.tangentImpulse;
        }
    }
};
 
 Box2D.ContactSolver.prototype.SolvePositionConstraints = function(baumgarte){
    var minSeparation = 0;
    for (var i = 0;i < this.m_constraintCount;i++){
        var c = this.m_constraints[i];
        var bodyA = c.bodyA;
        var bodyB = c.bodyB;
        var invMassA = bodyA.m_mass * bodyA.m_invMass;
        var invIA = bodyA.m_mass * bodyA.m_invI;
        var invMassB = bodyB.m_mass * bodyB.m_invMass;
        var invIB = bodyB.m_mass * bodyB.m_invI;
        Box2D.ContactSolver.s_psm.Initialize(c);
        var normal = Box2D.ContactSolver.s_psm.m_normal;
        for (var j = 0;j < c.pointCount;j++){
            var ccp = c.points[j];
            var point = Box2D.ContactSolver.s_psm.m_points[j];
            var separation = Box2D.ContactSolver.s_psm.m_separations[j];
            var rAX = point.x - bodyA.m_sweep.c.x;
            var rAY = point.y - bodyA.m_sweep.c.y;
            var rBX = point.x - bodyB.m_sweep.c.x;
            var rBY = point.y - bodyB.m_sweep.c.y;
            minSeparation = minSeparation < separation ? minSeparation: separation;
            var C = Box2D.Math.Clamp(baumgarte * (separation + Box2D.Settings.b2_linearSlop), - Box2D.Settings.b2_maxLinearCorrection, 
               0);
            var impulse = - ccp.equalizedMass * C;
            var PX = impulse * normal.x;
            var PY = impulse * normal.y;
            bodyA.m_sweep.c.x -= invMassA * PX;
            bodyA.m_sweep.c.y -= invMassA * PY;
            bodyA.m_sweep.a -= invIA * (rAX * PY - rAY * PX);
            bodyA.SynchronizeTransform();
            bodyB.m_sweep.c.x += invMassB * PX;
            bodyB.m_sweep.c.y += invMassB * PY;
            bodyB.m_sweep.a += invIB * (rBX * PY - rBY * PX);
            bodyB.SynchronizeTransform();
        }
    }
    return minSeparation > - 1.5 * Box2D.Settings.b2_linearSlop;
};
 Box2D.ContactSolver.prototype.m_step = new Box2D.TimeStep();
 Box2D.ContactSolver.prototype.m_allocator = undefined;
 Box2D.ContactSolver.prototype.m_constraints =[];
 Box2D.ContactSolver.prototype.m_constraintCount = 0;
 
 Box2D.Simplex = function(){
    this.__varz();
    this.__constructor.apply(this, arguments);
};
 
 Box2D.Simplex.prototype.__constructor = function(){
    this.m_vertices[0] = this.m_v1;
    this.m_vertices[1] = this.m_v2;
    this.m_vertices[2] = this.m_v3;
};
 
 Box2D.Simplex.prototype.__varz = function(){
    this.m_v1 = new Box2D.SimplexVertex();
    this.m_v2 = new Box2D.SimplexVertex();
    this.m_v3 = new Box2D.SimplexVertex();
    this.m_vertices =[];
};
 
 Box2D.Simplex.prototype.ReadCache = function(cache, proxyA, transformA, proxyB, transformB){
    Box2D.Settings.b2Assert(0 <= cache.count && cache.count <= 3);
	var v;
    var wALocal;
    var wBLocal;
    this.m_count = cache.count;
    var vertices = this.m_vertices;
    for (var i = 0;i < this.m_count;i++){
        v = vertices[i];
        v.indexA = cache.indexA[i];
        v.indexB = cache.indexB[i];
        wALocal = proxyA.GetVertex(v.indexA);
        wBLocal = proxyB.GetVertex(v.indexB);
        v.wA = Box2D.Math.MulX(transformA, wALocal);
        v.wB = Box2D.Math.MulX(transformB, wBLocal);
        v.w = Box2D.Math.SubtractVV(v.wB, v.wA);
        v.a = 0;
    }
    if (this.m_count > 1){
        var metric1 = cache.metric;
        var metric2 = this.GetMetric();
        if (metric2 < 0.5 * metric1 || 2 * metric1 < metric2 || metric2 < Number.MIN_VALUE){
            this.m_count = 0;
        }
    }
    if (this.m_count === 0){
        v = vertices[0];
        v.indexA = 0;
        v.indexB = 0;
        wALocal = proxyA.GetVertex(0);
        wBLocal = proxyB.GetVertex(0);
        v.wA = Box2D.Math.MulX(transformA, wALocal);
        v.wB = Box2D.Math.MulX(transformB, wBLocal);
        v.w = Box2D.Math.SubtractVV(v.wB, v.wA);
        this.m_count = 1;
    }
};
 
 Box2D.Simplex.prototype.WriteCache = function(cache){
    cache.metric = this.GetMetric();
    cache.count = parseInt(this.m_count, 10);
    var vertices = this.m_vertices;
    for (var i = 0;i < this.m_count;i++){
        cache.indexA[i] = parseInt(vertices[i].indexA, 10);
        cache.indexB[i] = parseInt(vertices[i].indexB, 10);
    }
};
 
 Box2D.Simplex.prototype.GetSearchDirection = function(){
    switch (this.m_count){
        case 1: 
            return this.m_v1.w.GetNegative();
        case 2: 
            var e12 = Box2D.Math.SubtractVV(this.m_v2.w, this.m_v1.w);
            var sgn = Box2D.Math.CrossVV(e12, this.m_v1.w.GetNegative());
            if (sgn > 0){
                return Box2D.Math.CrossFV(1, e12);
            }
            return Box2D.Math.CrossVF(e12, 1);
        default: 
            Box2D.Settings.b2Assert(false);
            return new Box2D.Vec2();
    }
};

Box2D.Simplex.prototype.GetClosestPoint = function(){
    switch (this.m_count){
        case 0: 
            Box2D.Settings.b2Assert(false);
            return new Box2D.Vec2();
        case 1: 
            return this.m_v1.w;
        case 2: 
            return new Box2D.Vec2(this.m_v1.a * this.m_v1.w.x + this.m_v2.a * this.m_v2.w.x, this.m_v1.a * this.m_v1.w.y + 
               this.m_v2.a * this.m_v2.w.y);
        default: 
            Box2D.Settings.b2Assert(false);
            return new Box2D.Vec2();
    }
};
 
 Box2D.Simplex.prototype.GetWitnessPoints = function(pA, pB){
    switch (this.m_count){
        case 0: 
            Box2D.Settings.b2Assert(false);
            break;
        case 1: 
            pA.SetV(this.m_v1.wA);
            pB.SetV(this.m_v1.wB);
            break;
        case 2: 
            pA.x = this.m_v1.a * this.m_v1.wA.x + this.m_v2.a * this.m_v2.wA.x;
            pA.y = this.m_v1.a * this.m_v1.wA.y + this.m_v2.a * this.m_v2.wA.y;
            pB.x = this.m_v1.a * this.m_v1.wB.x + this.m_v2.a * this.m_v2.wB.x;
            pB.y = this.m_v1.a * this.m_v1.wB.y + this.m_v2.a * this.m_v2.wB.y;
            break;
        case 3: 
            pB.x = pA.x = this.m_v1.a * this.m_v1.wA.x + this.m_v2.a * this.m_v2.wA.x + this.m_v3.a * this.m_v3.wA.x;
            pB.y = pA.y = this.m_v1.a * this.m_v1.wA.y + this.m_v2.a * this.m_v2.wA.y + this.m_v3.a * this.m_v3.wA.y;
            break;
        default: 
            Box2D.Settings.b2Assert(false);
            break;
    }
};
 
 Box2D.Simplex.prototype.GetMetric = function()    {
    switch (this.m_count){
        case 0: 
            Box2D.Settings.b2Assert(false);
            return 0;
        case 1: 
            return 0;
        case 2: 
            return Box2D.Math.SubtractVV(this.m_v1.w, this.m_v2.w).Length();
        case 3: 
            return Box2D.Math.CrossVV(Box2D.Math.SubtractVV(this.m_v2.w, this.m_v1.w), Box2D.Math.SubtractVV(this.m_v3.w, 
               this.m_v1.w));
        default: 
            Box2D.Settings.b2Assert(false);
            return 0;
    }
};
 
 Box2D.Simplex.prototype.Solve2 = function(){
    var w1 = this.m_v1.w;
    var w2 = this.m_v2.w;
    var e12 = Box2D.Math.SubtractVV(w2, w1);
    var d12_2 = - (w1.x * e12.x + w1.y * e12.y);
    if (d12_2 <= 0){
        this.m_v1.a = 1;
        this.m_count = 1;
        return;
    }
    var d12_1 = w2.x * e12.x + w2.y * e12.y;
    if (d12_1 <= 0){
        this.m_v2.a = 1;
        this.m_count = 1;
        this.m_v1.Set(this.m_v2);
        return;
    }
    var inv_d12 = 1 / (d12_1 + d12_2);
    this.m_v1.a = d12_1 * inv_d12;
    this.m_v2.a = d12_2 * inv_d12;
    this.m_count = 2;
};
 
 Box2D.Simplex.prototype.Solve3 = function(){
    var w1 = this.m_v1.w;
    var w2 = this.m_v2.w;
    var w3 = this.m_v3.w;
    var e12 = Box2D.Math.SubtractVV(w2, w1);
    var w1e12 = Box2D.Math.Dot(w1, e12);
    var w2e12 = Box2D.Math.Dot(w2, e12);
    var d12_1 = w2e12;
    var d12_2 = - w1e12;
    var e13 = Box2D.Math.SubtractVV(w3, w1);
    var w1e13 = Box2D.Math.Dot(w1, e13);
    var w3e13 = Box2D.Math.Dot(w3, e13);
    var d13_1 = w3e13;
    var d13_2 = - w1e13;
    var e23 = Box2D.Math.SubtractVV(w3, w2);
    var w2e23 = Box2D.Math.Dot(w2, e23);
    var w3e23 = Box2D.Math.Dot(w3, e23);
    var d23_1 = w3e23;
    var d23_2 = - w2e23;
    var n123 = Box2D.Math.CrossVV(e12, e13);
    var d123_1 = n123 * Box2D.Math.CrossVV(w2, w3);
    var d123_2 = n123 * Box2D.Math.CrossVV(w3, w1);
    var d123_3 = n123 * Box2D.Math.CrossVV(w1, w2);
    if (d12_2 <= 0 && d13_2 <= 0){
        this.m_v1.a = 1;
        this.m_count = 1;
        return;
    }
    if (d12_1 > 0 && d12_2 > 0 && d123_3 <= 0){
        var inv_d12 = 1 / (d12_1 + d12_2);
        this.m_v1.a = d12_1 * inv_d12;
        this.m_v2.a = d12_2 * inv_d12;
        this.m_count = 2;
        return;
    }
    if (d13_1 > 0 && d13_2 > 0 && d123_2 <= 0){
        var inv_d13 = 1 / (d13_1 + d13_2);
        this.m_v1.a = d13_1 * inv_d13;
        this.m_v3.a = d13_2 * inv_d13;
        this.m_count = 2;
        this.m_v2.Set(this.m_v3);
        return;
    }
    if (d12_1 <= 0 && d23_2 <= 0){
        this.m_v2.a = 1;
        this.m_count = 1;
        this.m_v1.Set(this.m_v2);
        return;
    }
    if (d13_1 <= 0 && d23_1 <= 0){
        this.m_v3.a = 1;
        this.m_count = 1;
        this.m_v1.Set(this.m_v3);
        return;
    }
    if (d23_1 > 0 && d23_2 > 0 && d123_1 <= 0){
        var inv_d23 = 1 / (d23_1 + d23_2);
        this.m_v2.a = d23_1 * inv_d23;
        this.m_v3.a = d23_2 * inv_d23;
        this.m_count = 2;
        this.m_v1.Set(this.m_v3);
        return;
    }
    var inv_d123 = 1 / (d123_1 + d123_2 + d123_3);
    this.m_v1.a = d123_1 * inv_d123;
    this.m_v2.a = d123_2 * inv_d123;
    this.m_v3.a = d123_3 * inv_d123;
    this.m_count = 3;
};
 Box2D.Simplex.prototype.m_v1 = new Box2D.SimplexVertex();
 Box2D.Simplex.prototype.m_v2 = new Box2D.SimplexVertex();
 Box2D.Simplex.prototype.m_v3 = new Box2D.SimplexVertex();
 Box2D.Simplex.prototype.m_vertices =[];
 Box2D.Simplex.prototype.m_count = 0;
 
 Box2D.WeldJoint = function(){
    Box2D.Joint.prototype.__varz.call(this);
    this.__varz();
    this.__constructor.apply(this, arguments);
};
 extend(Box2D.WeldJoint.prototype, Box2D.Joint.prototype);
 Box2D.WeldJoint.prototype._super = Box2D.Joint.prototype;
 
 Box2D.WeldJoint.prototype.__constructor = function(def){
    this._super.__constructor.apply(this,[def]);
    this.m_localAnchorA.SetV(def.localAnchorA);
    this.m_localAnchorB.SetV(def.localAnchorB);
    this.m_referenceAngle = def.referenceAngle;
    this.m_impulse.SetZero();
    this.m_mass = new Box2D.Mat33();
};
 
 Box2D.WeldJoint.prototype.__varz = function(){
    this.m_localAnchorA = new Box2D.Vec2();
    this.m_localAnchorB = new Box2D.Vec2();
    this.m_impulse = new Box2D.Vec3();
    this.m_mass = new Box2D.Mat33();
};
 
 Box2D.WeldJoint.prototype.InitVelocityConstraints = function(step)    {
    var tMat;
    var tX;
    var bA = this.m_bodyA;
    var bB = this.m_bodyB;
    tMat = bA.m_xf.R;
    var rAX = this.m_localAnchorA.x - bA.m_sweep.localCenter.x;
    var rAY = this.m_localAnchorA.y - bA.m_sweep.localCenter.y;
    tX = tMat.col1.x * rAX + tMat.col2.x * rAY;
    rAY = tMat.col1.y * rAX + tMat.col2.y * rAY;
    rAX = tX;
    tMat = bB.m_xf.R;
    var rBX = this.m_localAnchorB.x - bB.m_sweep.localCenter.x;
    var rBY = this.m_localAnchorB.y - bB.m_sweep.localCenter.y;
    tX = tMat.col1.x * rBX + tMat.col2.x * rBY;
    rBY = tMat.col1.y * rBX + tMat.col2.y * rBY;
    rBX = tX;
    var mA = bA.m_invMass;
    var mB = bB.m_invMass;
    var iA = bA.m_invI;
    var iB = bB.m_invI;
    this.m_mass.col1.x = mA + mB + rAY * rAY * iA + rBY * rBY * iB;
    this.m_mass.col2.x = - rAY * rAX * iA - rBY * rBX * iB;
    this.m_mass.col3.x = - rAY * iA - rBY * iB;
    this.m_mass.col1.y = this.m_mass.col2.x;
    this.m_mass.col2.y = mA + mB + rAX * rAX * iA + rBX * rBX * iB;
    this.m_mass.col3.y = rAX * iA + rBX * iB;
    this.m_mass.col1.z = this.m_mass.col3.x;
    this.m_mass.col2.z = this.m_mass.col3.y;
    this.m_mass.col3.z = iA + iB;
    if (step.warmStarting){
        this.m_impulse.x *= step.dtRatio;
        this.m_impulse.y *= step.dtRatio;
        this.m_impulse.z *= step.dtRatio;
        bA.m_linearVelocity.x -= mA * this.m_impulse.x;
        bA.m_linearVelocity.y -= mA * this.m_impulse.y;
        bA.m_angularVelocity -= iA * (rAX * this.m_impulse.y - rAY * this.m_impulse.x + this.m_impulse.z);
        bB.m_linearVelocity.x += mB * this.m_impulse.x;
        bB.m_linearVelocity.y += mB * this.m_impulse.y;
        bB.m_angularVelocity += iB * (rBX * this.m_impulse.y - rBY * this.m_impulse.x + this.m_impulse.z);
    }
    else {
        this.m_impulse.SetZero();
    }
};
 
 Box2D.WeldJoint.prototype.SolveVelocityConstraints = function(step){
    var tMat;
    var tX;
    var bA = this.m_bodyA;
    var bB = this.m_bodyB;
    var vA = bA.m_linearVelocity;
    var wA = bA.m_angularVelocity;
    var vB = bB.m_linearVelocity;
    var wB = bB.m_angularVelocity;
    var mA = bA.m_invMass;
    var mB = bB.m_invMass;
    var iA = bA.m_invI;
    var iB = bB.m_invI;
    tMat = bA.m_xf.R;
    var rAX = this.m_localAnchorA.x - bA.m_sweep.localCenter.x;
    var rAY = this.m_localAnchorA.y - bA.m_sweep.localCenter.y;
    tX = tMat.col1.x * rAX + tMat.col2.x * rAY;
    rAY = tMat.col1.y * rAX + tMat.col2.y * rAY;
    rAX = tX;
    tMat = bB.m_xf.R;
    var rBX = this.m_localAnchorB.x - bB.m_sweep.localCenter.x;
    var rBY = this.m_localAnchorB.y - bB.m_sweep.localCenter.y;
    tX = tMat.col1.x * rBX + tMat.col2.x * rBY;
    rBY = tMat.col1.y * rBX + tMat.col2.y * rBY;
    rBX = tX;
    var Cdot1X = vB.x - wB * rBY - vA.x + wA * rAY;
    var Cdot1Y = vB.y + wB * rBX - vA.y - wA * rAX;
    var Cdot2 = wB - wA;
    var impulse = new Box2D.Vec3();
    this.m_mass.Solve33(impulse, - Cdot1X, - Cdot1Y, - Cdot2);
    this.m_impulse.Add(impulse);
    vA.x -= mA * impulse.x;
    vA.y -= mA * impulse.y;
    wA -= iA * (rAX * impulse.y - rAY * impulse.x + impulse.z);
    vB.x += mB * impulse.x;
    vB.y += mB * impulse.y;
    wB += iB * (rBX * impulse.y - rBY * impulse.x + impulse.z);
    bA.m_angularVelocity = wA;
    bB.m_angularVelocity = wB;
};
 
 Box2D.WeldJoint.prototype.SolvePositionConstraints = function(baumgarte){
    var tMat;
    var tX;
    var bA = this.m_bodyA;
    var bB = this.m_bodyB;
    tMat = bA.m_xf.R;
    var rAX = this.m_localAnchorA.x - bA.m_sweep.localCenter.x;
    var rAY = this.m_localAnchorA.y - bA.m_sweep.localCenter.y;
    tX = tMat.col1.x * rAX + tMat.col2.x * rAY;
    rAY = tMat.col1.y * rAX + tMat.col2.y * rAY;
    rAX = tX;
    tMat = bB.m_xf.R;
    var rBX = this.m_localAnchorB.x - bB.m_sweep.localCenter.x;
    var rBY = this.m_localAnchorB.y - bB.m_sweep.localCenter.y;
    tX = tMat.col1.x * rBX + tMat.col2.x * rBY;
    rBY = tMat.col1.y * rBX + tMat.col2.y * rBY;
    rBX = tX;
    var mA = bA.m_invMass;
    var mB = bB.m_invMass;
    var iA = bA.m_invI;
    var iB = bB.m_invI;
    var C1X = bB.m_sweep.c.x + rBX - bA.m_sweep.c.x - rAX;
    var C1Y = bB.m_sweep.c.y + rBY - bA.m_sweep.c.y - rAY;
    var C2 = bB.m_sweep.a - bA.m_sweep.a - this.m_referenceAngle;
    var k_allowedStretch = 10 * Box2D.Settings.b2_linearSlop;
    var positionError = Math.sqrt(C1X * C1X + C1Y * C1Y);
    var angularError = Box2D.Math.Abs(C2);
    if (positionError > k_allowedStretch){
        iA *= 1;
        iB *= 1;
    }
    this.m_mass.col1.x = mA + mB + rAY * rAY * iA + rBY * rBY * iB;
    this.m_mass.col2.x = - rAY * rAX * iA - rBY * rBX * iB;
    this.m_mass.col3.x = - rAY * iA - rBY * iB;
    this.m_mass.col1.y = this.m_mass.col2.x;
    this.m_mass.col2.y = mA + mB + rAX * rAX * iA + rBX * rBX * iB;
    this.m_mass.col3.y = rAX * iA + rBX * iB;
    this.m_mass.col1.z = this.m_mass.col3.x;
    this.m_mass.col2.z = this.m_mass.col3.y;
    this.m_mass.col3.z = iA + iB;
    var impulse = new Box2D.Vec3();
    this.m_mass.Solve33(impulse, - C1X, - C1Y, - C2);
    bA.m_sweep.c.x -= mA * impulse.x;
    bA.m_sweep.c.y -= mA * impulse.y;
    bA.m_sweep.a -= iA * (rAX * impulse.y - rAY * impulse.x + impulse.z);
    bB.m_sweep.c.x += mB * impulse.x;
    bB.m_sweep.c.y += mB * impulse.y;
    bB.m_sweep.a += iB * (rBX * impulse.y - rBY * impulse.x + impulse.z);
    bA.SynchronizeTransform();
    bB.SynchronizeTransform();
    return positionError <= Box2D.Settings.b2_linearSlop && angularError <= Box2D.Settings.b2_angularSlop;
};
 
 Box2D.WeldJoint.prototype.GetAnchorA = function(){
    return this.m_bodyA.GetWorldPoint(this.m_localAnchorA);
};
 
 Box2D.WeldJoint.prototype.GetAnchorB = function(){
    return this.m_bodyB.GetWorldPoint(this.m_localAnchorB);
};
 
 Box2D.WeldJoint.prototype.GetReactionForce = function(inv_dt){
    return new Box2D.Vec2(inv_dt * this.m_impulse.x, inv_dt * this.m_impulse.y);
};
 
 Box2D.WeldJoint.prototype.GetReactionTorque = function(inv_dt){
    return inv_dt * this.m_impulse.z;
};
 Box2D.WeldJoint.prototype.m_localAnchorA = new Box2D.Vec2();
 Box2D.WeldJoint.prototype.m_localAnchorB = new Box2D.Vec2();
 Box2D.WeldJoint.prototype.m_referenceAngle = undefined;
 Box2D.WeldJoint.prototype.m_impulse = new Box2D.Vec3();
 Box2D.WeldJoint.prototype.m_mass = new Box2D.Mat33();
 
 Box2D.Math = function(){
    this.__varz();
    this.__constructor.apply(this, arguments);
};
 
 Box2D.Math.prototype.__constructor = function(){
};
 Box2D.Math.prototype.__varz = function(){
};
 Box2D.Math.IsValid = function(x){
    return isFinite(x);
};
 
 Box2D.Math.Dot = function(a, b){
    return a.x * b.x + a.y * b.y;
};
 
 Box2D.Math.CrossVV = function(a, b){
    return a.x * b.y - a.y * b.x;
};
 
 Box2D.Math.CrossVF = function(a, s){
    var v = new Box2D.Vec2(s * a.y, - s * a.x);
    return v;
};
 
 Box2D.Math.CrossFV = function(s, a){
    var v = new Box2D.Vec2( - s * a.y, s * a.x);
    return v;
};
 
 Box2D.Math.MulMV = function(A, v){
    var u = new Box2D.Vec2(A.col1.x * v.x + A.col2.x * v.y, A.col1.y * v.x + A.col2.y * v.y);
    return u;
};
 
 Box2D.Math.MulTMV = function(A, v){
    var u = new Box2D.Vec2(Box2D.Math.Dot(v, A.col1), Box2D.Math.Dot(v, A.col2));
    return u;
};
 
 Box2D.Math.MulX = function(T, v){
    var a = Box2D.Math.MulMV(T.R, v);
    a.x += T.position.x;
    a.y += T.position.y;
    return a;
};
 
 Box2D.Math.MulXT = function(T, v){
    var a = Box2D.Math.SubtractVV(v, T.position);
    var tX = a.x * T.R.col1.x + a.y * T.R.col1.y;
    a.y = a.x * T.R.col2.x + a.y * T.R.col2.y;
    a.x = tX;
    return a;
};
 
 Box2D.Math.AddVV = function(a, b){
    var v = new Box2D.Vec2(a.x + b.x, a.y + b.y);
    return v;
};
 
 Box2D.Math.SubtractVV = function(a, b){
    var v = new Box2D.Vec2(a.x - b.x, a.y - b.y);
    return v;
};
 
 Box2D.Math.Distance = function(a, b){
    var cX = a.x - b.x;
    var cY = a.y - b.y;
    return Math.sqrt(cX * cX + cY * cY);
};
 
 Box2D.Math.DistanceSquared = function(a, b){
    var cX = a.x - b.x;
    var cY = a.y - b.y;
    return cX * cX + cY * cY;
};
 
 Box2D.Math.MulFV = function(s, a){
    var v = new Box2D.Vec2(s * a.x, s * a.y);
    return v;
};
 
 Box2D.Math.AddMM = function(A, B){
    var C = Box2D.Mat22.FromVV(Box2D.Math.AddVV(A.col1, B.col1), Box2D.Math.AddVV(A.col2, B.col2));
    return C;
};
 
 Box2D.Math.MulMM = function(A, B){
    var C = Box2D.Mat22.FromVV(Box2D.Math.MulMV(A, B.col1), Box2D.Math.MulMV(A, B.col2));
    return C;
};
 
 Box2D.Math.MulTMM = function(A, B){
    var c1 = new Box2D.Vec2(Box2D.Math.Dot(A.col1, B.col1), Box2D.Math.Dot(A.col2, B.col1));
    var c2 = new Box2D.Vec2(Box2D.Math.Dot(A.col1, B.col2), Box2D.Math.Dot(A.col2, B.col2));
    var C = Box2D.Mat22.FromVV(c1, c2);
    return C;
};
 
 Box2D.Math.Abs = function(a){
    return a > 0 ? a: - a;
};
 
 Box2D.Math.AbsV = function(a){
    var b = new Box2D.Vec2(Box2D.Math.Abs(a.x), Box2D.Math.Abs(a.y));
    return b;
};
 
 Box2D.Math.AbsM = function(A){
    var B = Box2D.Mat22.FromVV(Box2D.Math.AbsV(A.col1), Box2D.Math.AbsV(A.col2));
    return B;
};
 
 Box2D.Math.Min = function(a, b){
    return a < b ? a: b;
};
 
 Box2D.Math.MinV = function(a, b){
    var c = new Box2D.Vec2(Box2D.Math.Min(a.x, b.x), Box2D.Math.Min(a.y, b.y));
    return c;
};
 
 Box2D.Math.Max = function(a, b){
    return a > b ? a: b;
};
 
 Box2D.Math.MaxV = function(a, b){
    var c = new Box2D.Vec2(Box2D.Math.Max(a.x, b.x), Box2D.Math.Max(a.y, b.y));
    return c;
};
 
 Box2D.Math.Clamp = function(a, low, high){
    return a < low ? low: a > high ? high: a;
};
 
 Box2D.Math.ClampV = function(a, low, high){
    return Box2D.Math.MaxV(low, Box2D.Math.MinV(a, high));
};
 
 Box2D.Math.Swap = function(a, b){
    var tmp = a[0];
    a[0] = b[0];
    b[0] = tmp;
};
 
 Box2D.Math.Random = function(){
    return Math.random() * 2 - 1;
};
 
 Box2D.Math.RandomRange = function(lo, hi){
    var r = Math.random();
    r = (hi - lo) * r + lo;
    return r;
};
 
 Box2D.Math.NextPowerOfTwo = function(x){
    x |= x >> 1 & 2147483647;
    x |= x >> 2 & 1073741823;
    x |= x >> 4 & 268435455;
    x |= x >> 8 & 16777215;
    x |= x >> 16 & 65535;
    return x + 1;
};
 
 Box2D.Math.IsPowerOfTwo = function(x){
    var result = x > 0 && (x & x - 1) === 0;
    return result;
};
 Box2D.Math.b2Vec2_zero = new Box2D.Vec2(0, 0);
 Box2D.Math.b2Mat22_identity = Box2D.Mat22.FromVV(new Box2D.Vec2(1, 0), new Box2D.Vec2(0, 1));
 Box2D.Math.b2Transform_identity = new Box2D.Transform(Box2D.Math.b2Vec2_zero, Box2D.Math.b2Mat22_identity);
 
 Box2D.PulleyJoint = function(){
    Box2D.Joint.prototype.__varz.call(this);
    this.__varz();
    this.__constructor.apply(this, arguments);
};
 extend(Box2D.PulleyJoint.prototype, Box2D.Joint.prototype);
 Box2D.PulleyJoint.prototype._super = Box2D.Joint.prototype;
 
 Box2D.PulleyJoint.prototype.__constructor = function(def){
    this._super.__constructor.apply(this,[def]);
    var tMat;
    var tX;
    var tY;
    this.m_ground = this.m_bodyA.m_world.m_groundBody;
    this.m_groundAnchor1.x = def.groundAnchorA.x - this.m_ground.m_xf.position.x;
    this.m_groundAnchor1.y = def.groundAnchorA.y - this.m_ground.m_xf.position.y;
    this.m_groundAnchor2.x = def.groundAnchorB.x - this.m_ground.m_xf.position.x;
    this.m_groundAnchor2.y = def.groundAnchorB.y - this.m_ground.m_xf.position.y;
    this.m_localAnchor1.SetV(def.localAnchorA);
    this.m_localAnchor2.SetV(def.localAnchorB);
    this.m_ratio = def.ratio;
    this.m_constant = def.lengthA + this.m_ratio * def.lengthB;
    this.m_maxLength1 = Box2D.Math.Min(def.maxLengthA, this.m_constant - this.m_ratio * Box2D.PulleyJoint.b2_minPulleyLength);
    this.m_maxLength2 = Box2D.Math.Min(def.maxLengthB, (this.m_constant - Box2D.PulleyJoint.b2_minPulleyLength) / this.m_ratio);
    this.m_impulse = 0;
    this.m_limitImpulse1 = 0;
    this.m_limitImpulse2 = 0;
};
 
 Box2D.PulleyJoint.prototype.__varz = function(){
    this.m_groundAnchor1 = new Box2D.Vec2();
    this.m_groundAnchor2 = new Box2D.Vec2();
    this.m_localAnchor1 = new Box2D.Vec2();
    this.m_localAnchor2 = new Box2D.Vec2();
    this.m_u1 = new Box2D.Vec2();
    this.m_u2 = new Box2D.Vec2();
};
 Box2D.PulleyJoint.b2_minPulleyLength = 2;
 
 Box2D.PulleyJoint.prototype.InitVelocityConstraints = function(step){
    var bA = this.m_bodyA;
    var bB = this.m_bodyB;
    var tMat;
    tMat = bA.m_xf.R;
    var r1X = this.m_localAnchor1.x - bA.m_sweep.localCenter.x;
    var r1Y = this.m_localAnchor1.y - bA.m_sweep.localCenter.y;
    var tX = tMat.col1.x * r1X + tMat.col2.x * r1Y;
    r1Y = tMat.col1.y * r1X + tMat.col2.y * r1Y;
    r1X = tX;
    tMat = bB.m_xf.R;
    var r2X = this.m_localAnchor2.x - bB.m_sweep.localCenter.x;
    var r2Y = this.m_localAnchor2.y - bB.m_sweep.localCenter.y;
    tX = tMat.col1.x * r2X + tMat.col2.x * r2Y;
    r2Y = tMat.col1.y * r2X + tMat.col2.y * r2Y;
    r2X = tX;
    var p1X = bA.m_sweep.c.x + r1X;
    var p1Y = bA.m_sweep.c.y + r1Y;
    var p2X = bB.m_sweep.c.x + r2X;
    var p2Y = bB.m_sweep.c.y + r2Y;
    var s1X = this.m_ground.m_xf.position.x + this.m_groundAnchor1.x;
    var s1Y = this.m_ground.m_xf.position.y + this.m_groundAnchor1.y;
    var s2X = this.m_ground.m_xf.position.x + this.m_groundAnchor2.x;
    var s2Y = this.m_ground.m_xf.position.y + this.m_groundAnchor2.y;
    this.m_u1.Set(p1X - s1X, p1Y - s1Y);
    this.m_u2.Set(p2X - s2X, p2Y - s2Y);
    var length1 = this.m_u1.Length();
    var length2 = this.m_u2.Length();
    if (length1 > Box2D.Settings.b2_linearSlop){
        this.m_u1.Multiply(1 / length1);
    }
    else {
        this.m_u1.SetZero();
    }
    if (length2 > Box2D.Settings.b2_linearSlop){
        this.m_u2.Multiply(1 / length2);
    }
    else {
        this.m_u2.SetZero();
    }
    var C = this.m_constant - length1 - this.m_ratio * length2;
    if (C > 0){
        this.m_state = Box2D.Joint.e_inactiveLimit;
        this.m_impulse = 0;
    }
    else {
        this.m_state = Box2D.Joint.e_atUpperLimit;
    }
    if (length1 < this.m_maxLength1){
        this.m_limitState1 = Box2D.Joint.e_inactiveLimit;
        this.m_limitImpulse1 = 0;
    }
    else {
        this.m_limitState1 = Box2D.Joint.e_atUpperLimit;
    }
    if (length2 < this.m_maxLength2){
        this.m_limitState2 = Box2D.Joint.e_inactiveLimit;
        this.m_limitImpulse2 = 0;
    }
    else {
        this.m_limitState2 = Box2D.Joint.e_atUpperLimit;
    }
    var cr1u1 = r1X * this.m_u1.y - r1Y * this.m_u1.x;
    var cr2u2 = r2X * this.m_u2.y - r2Y * this.m_u2.x;
    this.m_limitMass1 = bA.m_invMass + bA.m_invI * cr1u1 * cr1u1;
    this.m_limitMass2 = bB.m_invMass + bB.m_invI * cr2u2 * cr2u2;
    this.m_pulleyMass = this.m_limitMass1 + this.m_ratio * this.m_ratio * this.m_limitMass2;
    this.m_limitMass1 = 1 / this.m_limitMass1;
    this.m_limitMass2 = 1 / this.m_limitMass2;
    this.m_pulleyMass = 1 / this.m_pulleyMass;
    if (step.warmStarting){
        this.m_impulse *= step.dtRatio;
        this.m_limitImpulse1 *= step.dtRatio;
        this.m_limitImpulse2 *= step.dtRatio;
        var P1X = ( - this.m_impulse - this.m_limitImpulse1) * this.m_u1.x;
        var P1Y = ( - this.m_impulse - this.m_limitImpulse1) * this.m_u1.y;
        var P2X = ( - this.m_ratio * this.m_impulse - this.m_limitImpulse2) * this.m_u2.x;
        var P2Y = ( - this.m_ratio * this.m_impulse - this.m_limitImpulse2) * this.m_u2.y;
        bA.m_linearVelocity.x += bA.m_invMass * P1X;
        bA.m_linearVelocity.y += bA.m_invMass * P1Y;
        bA.m_angularVelocity += bA.m_invI * (r1X * P1Y - r1Y * P1X);
        bB.m_linearVelocity.x += bB.m_invMass * P2X;
        bB.m_linearVelocity.y += bB.m_invMass * P2Y;
        bB.m_angularVelocity += bB.m_invI * (r2X * P2Y - r2Y * P2X);
    }
    else {
        this.m_impulse = 0;
        this.m_limitImpulse1 = 0;
        this.m_limitImpulse2 = 0;
    }
};
 
 Box2D.PulleyJoint.prototype.SolveVelocityConstraints = function(step){
    var bA = this.m_bodyA;
    var bB = this.m_bodyB;
    var tMat;
    tMat = bA.m_xf.R;
    var r1X = this.m_localAnchor1.x - bA.m_sweep.localCenter.x;
    var r1Y = this.m_localAnchor1.y - bA.m_sweep.localCenter.y;
    var tX = tMat.col1.x * r1X + tMat.col2.x * r1Y;
    r1Y = tMat.col1.y * r1X + tMat.col2.y * r1Y;
    r1X = tX;
    tMat = bB.m_xf.R;
    var r2X = this.m_localAnchor2.x - bB.m_sweep.localCenter.x;
    var r2Y = this.m_localAnchor2.y - bB.m_sweep.localCenter.y;
    tX = tMat.col1.x * r2X + tMat.col2.x * r2Y;
    r2Y = tMat.col1.y * r2X + tMat.col2.y * r2Y;
    r2X = tX;
    var v1X;
    var v1Y;
    var v2X;
    var v2Y;
    var P1X;
    var P1Y;
    var P2X;
    var P2Y;
    var Cdot;
    var impulse;
    var oldImpulse;
    if (this.m_state == Box2D.Joint.e_atUpperLimit){
        v1X = bA.m_linearVelocity.x + - bA.m_angularVelocity * r1Y;
        v1Y = bA.m_linearVelocity.y + bA.m_angularVelocity * r1X;
        v2X = bB.m_linearVelocity.x + - bB.m_angularVelocity * r2Y;
        v2Y = bB.m_linearVelocity.y + bB.m_angularVelocity * r2X;
        Cdot = - (this.m_u1.x * v1X + this.m_u1.y * v1Y) - this.m_ratio * (this.m_u2.x * v2X + this.m_u2.y * v2Y);
        impulse = this.m_pulleyMass * - Cdot;
        oldImpulse = this.m_impulse;
        this.m_impulse = Box2D.Math.Max(0, this.m_impulse + impulse);
        impulse = this.m_impulse - oldImpulse;
        P1X = - impulse * this.m_u1.x;
        P1Y = - impulse * this.m_u1.y;
        P2X = - this.m_ratio * impulse * this.m_u2.x;
        P2Y = - this.m_ratio * impulse * this.m_u2.y;
        bA.m_linearVelocity.x += bA.m_invMass * P1X;
        bA.m_linearVelocity.y += bA.m_invMass * P1Y;
        bA.m_angularVelocity += bA.m_invI * (r1X * P1Y - r1Y * P1X);
        bB.m_linearVelocity.x += bB.m_invMass * P2X;
        bB.m_linearVelocity.y += bB.m_invMass * P2Y;
        bB.m_angularVelocity += bB.m_invI * (r2X * P2Y - r2Y * P2X);
    }
    if (this.m_limitState1 == Box2D.Joint.e_atUpperLimit)        {
        v1X = bA.m_linearVelocity.x + - bA.m_angularVelocity * r1Y;
        v1Y = bA.m_linearVelocity.y + bA.m_angularVelocity * r1X;
        Cdot = - (this.m_u1.x * v1X + this.m_u1.y * v1Y);
        impulse = - this.m_limitMass1 * Cdot;
        oldImpulse = this.m_limitImpulse1;
        this.m_limitImpulse1 = Box2D.Math.Max(0, this.m_limitImpulse1 + impulse);
        impulse = this.m_limitImpulse1 - oldImpulse;
        P1X = - impulse * this.m_u1.x;
        P1Y = - impulse * this.m_u1.y;
        bA.m_linearVelocity.x += bA.m_invMass * P1X;
        bA.m_linearVelocity.y += bA.m_invMass * P1Y;
        bA.m_angularVelocity += bA.m_invI * (r1X * P1Y - r1Y * P1X);
    }
    if (this.m_limitState2 == Box2D.Joint.e_atUpperLimit){
        v2X = bB.m_linearVelocity.x + - bB.m_angularVelocity * r2Y;
        v2Y = bB.m_linearVelocity.y + bB.m_angularVelocity * r2X;
        Cdot = - (this.m_u2.x * v2X + this.m_u2.y * v2Y);
        impulse = - this.m_limitMass2 * Cdot;
        oldImpulse = this.m_limitImpulse2;
        this.m_limitImpulse2 = Box2D.Math.Max(0, this.m_limitImpulse2 + impulse);
        impulse = this.m_limitImpulse2 - oldImpulse;
        P2X = - impulse * this.m_u2.x;
        P2Y = - impulse * this.m_u2.y;
        bB.m_linearVelocity.x += bB.m_invMass * P2X;
        bB.m_linearVelocity.y += bB.m_invMass * P2Y;
        bB.m_angularVelocity += bB.m_invI * (r2X * P2Y - r2Y * P2X);
    }
};
 
 Box2D.PulleyJoint.prototype.SolvePositionConstraints = function(baumgarte){
    var bA = this.m_bodyA;
    var bB = this.m_bodyB;
    var tMat;
    var s1X = this.m_ground.m_xf.position.x + this.m_groundAnchor1.x;
    var s1Y = this.m_ground.m_xf.position.y + this.m_groundAnchor1.y;
    var s2X = this.m_ground.m_xf.position.x + this.m_groundAnchor2.x;
    var s2Y = this.m_ground.m_xf.position.y + this.m_groundAnchor2.y;
    var r1X;
    var r1Y;
    var r2X;
    var r2Y;
    var p1X;
    var p1Y;
    var p2X;
    var p2Y;
    var length1;
    var length2;
    var C;
    var impulse;
    var oldImpulse;
    var oldLimitPositionImpulse;
    var tX;
    var linearError = 0;
    if (this.m_state == Box2D.Joint.e_atUpperLimit){
        tMat = bA.m_xf.R;
        r1X = this.m_localAnchor1.x - bA.m_sweep.localCenter.x;
        r1Y = this.m_localAnchor1.y - bA.m_sweep.localCenter.y;
        tX = tMat.col1.x * r1X + tMat.col2.x * r1Y;
        r1Y = tMat.col1.y * r1X + tMat.col2.y * r1Y;
        r1X = tX;
        tMat = bB.m_xf.R;
        r2X = this.m_localAnchor2.x - bB.m_sweep.localCenter.x;
        r2Y = this.m_localAnchor2.y - bB.m_sweep.localCenter.y;
        tX = tMat.col1.x * r2X + tMat.col2.x * r2Y;
        r2Y = tMat.col1.y * r2X + tMat.col2.y * r2Y;
        r2X = tX;
        p1X = bA.m_sweep.c.x + r1X;
        p1Y = bA.m_sweep.c.y + r1Y;
        p2X = bB.m_sweep.c.x + r2X;
        p2Y = bB.m_sweep.c.y + r2Y;
        this.m_u1.Set(p1X - s1X, p1Y - s1Y);
        this.m_u2.Set(p2X - s2X, p2Y - s2Y);
        length1 = this.m_u1.Length();
        length2 = this.m_u2.Length();
        if (length1 > Box2D.Settings.b2_linearSlop){
            this.m_u1.Multiply(1 / length1);
        }
        else {
            this.m_u1.SetZero();
        }
        if (length2 > Box2D.Settings.b2_linearSlop){
            this.m_u2.Multiply(1 / length2);
        }
        else {
            this.m_u2.SetZero();
        }
        C = this.m_constant - length1 - this.m_ratio * length2;
        linearError = Box2D.Math.Max(linearError, - C);
        C = Box2D.Math.Clamp(C + Box2D.Settings.b2_linearSlop, - Box2D.Settings.b2_maxLinearCorrection, 0);
        impulse = - this.m_pulleyMass * C;
        p1X = - impulse * this.m_u1.x;
        p1Y = - impulse * this.m_u1.y;
        p2X = - this.m_ratio * impulse * this.m_u2.x;
        p2Y = - this.m_ratio * impulse * this.m_u2.y;
        bA.m_sweep.c.x += bA.m_invMass * p1X;
        bA.m_sweep.c.y += bA.m_invMass * p1Y;
        bA.m_sweep.a += bA.m_invI * (r1X * p1Y - r1Y * p1X);
        bB.m_sweep.c.x += bB.m_invMass * p2X;
        bB.m_sweep.c.y += bB.m_invMass * p2Y;
        bB.m_sweep.a += bB.m_invI * (r2X * p2Y - r2Y * p2X);
        bA.SynchronizeTransform();
        bB.SynchronizeTransform();
    }
    if (this.m_limitState1 == Box2D.Joint.e_atUpperLimit){
        tMat = bA.m_xf.R;
        r1X = this.m_localAnchor1.x - bA.m_sweep.localCenter.x;
        r1Y = this.m_localAnchor1.y - bA.m_sweep.localCenter.y;
        tX = tMat.col1.x * r1X + tMat.col2.x * r1Y;
        r1Y = tMat.col1.y * r1X + tMat.col2.y * r1Y;
        r1X = tX;
        p1X = bA.m_sweep.c.x + r1X;
        p1Y = bA.m_sweep.c.y + r1Y;
        this.m_u1.Set(p1X - s1X, p1Y - s1Y);
        length1 = this.m_u1.Length();
        if (length1 > Box2D.Settings.b2_linearSlop){
            this.m_u1.x *= 1 / length1;
            this.m_u1.y *= 1 / length1;
        }
        else {
            this.m_u1.SetZero();
        }
        C = this.m_maxLength1 - length1;
        linearError = Box2D.Math.Max(linearError, - C);
        C = Box2D.Math.Clamp(C + Box2D.Settings.b2_linearSlop, - Box2D.Settings.b2_maxLinearCorrection, 0);
        impulse = - this.m_limitMass1 * C;
        p1X = - impulse * this.m_u1.x;
        p1Y = - impulse * this.m_u1.y;
        bA.m_sweep.c.x += bA.m_invMass * p1X;
        bA.m_sweep.c.y += bA.m_invMass * p1Y;
        bA.m_sweep.a += bA.m_invI * (r1X * p1Y - r1Y * p1X);
        bA.SynchronizeTransform();
    }
    if (this.m_limitState2 == Box2D.Joint.e_atUpperLimit){
        tMat = bB.m_xf.R;
        r2X = this.m_localAnchor2.x - bB.m_sweep.localCenter.x;
        r2Y = this.m_localAnchor2.y - bB.m_sweep.localCenter.y;
        tX = tMat.col1.x * r2X + tMat.col2.x * r2Y;
        r2Y = tMat.col1.y * r2X + tMat.col2.y * r2Y;
        r2X = tX;
        p2X = bB.m_sweep.c.x + r2X;
        p2Y = bB.m_sweep.c.y + r2Y;
        this.m_u2.Set(p2X - s2X, p2Y - s2Y);
        length2 = this.m_u2.Length();
        if (length2 > Box2D.Settings.b2_linearSlop){
            this.m_u2.x *= 1 / length2;
            this.m_u2.y *= 1 / length2;
        }
        else {
            this.m_u2.SetZero();
        }
        C = this.m_maxLength2 - length2;
        linearError = Box2D.Math.Max(linearError, - C);
        C = Box2D.Math.Clamp(C + Box2D.Settings.b2_linearSlop, - Box2D.Settings.b2_maxLinearCorrection, 0);
        impulse = - this.m_limitMass2 * C;
        p2X = - impulse * this.m_u2.x;
        p2Y = - impulse * this.m_u2.y;
        bB.m_sweep.c.x += bB.m_invMass * p2X;
        bB.m_sweep.c.y += bB.m_invMass * p2Y;
        bB.m_sweep.a += bB.m_invI * (r2X * p2Y - r2Y * p2X);
        bB.SynchronizeTransform();
    }
    return linearError < Box2D.Settings.b2_linearSlop;
};
 
 Box2D.PulleyJoint.prototype.GetAnchorA = function(){
    return this.m_bodyA.GetWorldPoint(this.m_localAnchor1);
};
 
 Box2D.PulleyJoint.prototype.GetAnchorB = function(){
    return this.m_bodyB.GetWorldPoint(this.m_localAnchor2);
};
 
 Box2D.PulleyJoint.prototype.GetReactionForce = function(inv_dt){
    return new Box2D.Vec2(inv_dt * this.m_impulse * this.m_u2.x, inv_dt * this.m_impulse * this.m_u2.y);
};
 
 Box2D.PulleyJoint.prototype.GetReactionTorque = function(inv_dt){
    return 0;
};
 
 Box2D.PulleyJoint.prototype.GetGroundAnchorA = function(){
    var a = this.m_ground.m_xf.position.Copy();
    a.Add(this.m_groundAnchor1);
    return a;
};
 
 Box2D.PulleyJoint.prototype.GetGroundAnchorB = function(){
    var a = this.m_ground.m_xf.position.Copy();
    a.Add(this.m_groundAnchor2);
    return a;
};
 
 Box2D.PulleyJoint.prototype.GetLength1 = function(){
    var p = this.m_bodyA.GetWorldPoint(this.m_localAnchor1);
    var sX = this.m_ground.m_xf.position.x + this.m_groundAnchor1.x;
    var sY = this.m_ground.m_xf.position.y + this.m_groundAnchor1.y;
    var dX = p.x - sX;
    var dY = p.y - sY;
    return Math.sqrt(dX * dX + dY * dY);
};
 
 Box2D.PulleyJoint.prototype.GetLength2 = function(){
    var p = this.m_bodyB.GetWorldPoint(this.m_localAnchor2);
    var sX = this.m_ground.m_xf.position.x + this.m_groundAnchor2.x;
    var sY = this.m_ground.m_xf.position.y + this.m_groundAnchor2.y;
    var dX = p.x - sX;
    var dY = p.y - sY;
    return Math.sqrt(dX * dX + dY * dY);
};
 
 Box2D.PulleyJoint.prototype.GetRatio = function(){
    return this.m_ratio;
};
 Box2D.PulleyJoint.prototype.m_ground = undefined;
 Box2D.PulleyJoint.prototype.m_groundAnchor1 = new Box2D.Vec2();
 Box2D.PulleyJoint.prototype.m_groundAnchor2 = new Box2D.Vec2();
 Box2D.PulleyJoint.prototype.m_localAnchor1 = new Box2D.Vec2();
 Box2D.PulleyJoint.prototype.m_localAnchor2 = new Box2D.Vec2();
 Box2D.PulleyJoint.prototype.m_u1 = new Box2D.Vec2();
 Box2D.PulleyJoint.prototype.m_u2 = new Box2D.Vec2();
 Box2D.PulleyJoint.prototype.m_constant = undefined;
 Box2D.PulleyJoint.prototype.m_ratio = undefined;
 Box2D.PulleyJoint.prototype.m_maxLength1 = undefined;
 Box2D.PulleyJoint.prototype.m_maxLength2 = undefined;
 Box2D.PulleyJoint.prototype.m_pulleyMass = undefined;
 Box2D.PulleyJoint.prototype.m_limitMass1 = undefined;
 Box2D.PulleyJoint.prototype.m_limitMass2 = undefined;
 Box2D.PulleyJoint.prototype.m_impulse = undefined;
 Box2D.PulleyJoint.prototype.m_limitImpulse1 = undefined;
 Box2D.PulleyJoint.prototype.m_limitImpulse2 = undefined;
 Box2D.PulleyJoint.prototype.m_state = 0;
 Box2D.PulleyJoint.prototype.m_limitState1 = 0;
 Box2D.PulleyJoint.prototype.m_limitState2 = 0;
 
 Box2D.PrismaticJoint = function(){
    Box2D.Joint.prototype.__varz.call(this);
    this.__varz();
    this.__constructor.apply(this, arguments);
};
 extend(Box2D.PrismaticJoint.prototype, Box2D.Joint.prototype);
 Box2D.PrismaticJoint.prototype._super = Box2D.Joint.prototype;
 
 Box2D.PrismaticJoint.prototype.__constructor = function(def){
    this._super.__constructor.apply(this,[def]);
    var tMat;
    var tX;
    var tY;
    this.m_localAnchor1.SetV(def.localAnchorA);
    this.m_localAnchor2.SetV(def.localAnchorB);
    this.m_localXAxis1.SetV(def.localAxisA);
    this.m_localYAxis1.x = - this.m_localXAxis1.y;
    this.m_localYAxis1.y = this.m_localXAxis1.x;
    this.m_refAngle = def.referenceAngle;
    this.m_impulse.SetZero();
    this.m_motorMass = 0;
    this.m_motorImpulse = 0;
    this.m_lowerTranslation = def.lowerTranslation;
    this.m_upperTranslation = def.upperTranslation;
    this.m_maxMotorForce = def.maxMotorForce;
    this.m_motorSpeed = def.motorSpeed;
    this.m_enableLimit = def.enableLimit;
    this.m_enableMotor = def.enableMotor;
    this.m_limitState = Box2D.Joint.e_inactiveLimit;
    this.m_axis.SetZero();
    this.m_perp.SetZero();
};
 
 Box2D.PrismaticJoint.prototype.__varz = function(){
    this.m_localAnchor1 = new Box2D.Vec2();
    this.m_localAnchor2 = new Box2D.Vec2();
    this.m_localXAxis1 = new Box2D.Vec2();
    this.m_localYAxis1 = new Box2D.Vec2();
    this.m_axis = new Box2D.Vec2();
    this.m_perp = new Box2D.Vec2();
    this.m_K = new Box2D.Mat33();
    this.m_impulse = new Box2D.Vec3();
};
 
 Box2D.PrismaticJoint.prototype.InitVelocityConstraints = function(step){
    var bA = this.m_bodyA;
    var bB = this.m_bodyB;
    var tMat;
    var tX;
    this.m_localCenterA.SetV(bA.GetLocalCenter());
    this.m_localCenterB.SetV(bB.GetLocalCenter());
    var xf1 = bA.GetTransform();
    var xf2 = bB.GetTransform();
    tMat = bA.m_xf.R;
    var r1X = this.m_localAnchor1.x - this.m_localCenterA.x;
    var r1Y = this.m_localAnchor1.y - this.m_localCenterA.y;
    tX = tMat.col1.x * r1X + tMat.col2.x * r1Y;
    r1Y = tMat.col1.y * r1X + tMat.col2.y * r1Y;
    r1X = tX;
    tMat = bB.m_xf.R;
    var r2X = this.m_localAnchor2.x - this.m_localCenterB.x;
    var r2Y = this.m_localAnchor2.y - this.m_localCenterB.y;
    tX = tMat.col1.x * r2X + tMat.col2.x * r2Y;
    r2Y = tMat.col1.y * r2X + tMat.col2.y * r2Y;
    r2X = tX;
    var dX = bB.m_sweep.c.x + r2X - bA.m_sweep.c.x - r1X;
    var dY = bB.m_sweep.c.y + r2Y - bA.m_sweep.c.y - r1Y;
    this.m_invMassA = bA.m_invMass;
    this.m_invMassB = bB.m_invMass;
    this.m_invIA = bA.m_invI;
    this.m_invIB = bB.m_invI;
    this.m_axis.SetV(Box2D.Math.MulMV(xf1.R, this.m_localXAxis1));
    this.m_a1 = (dX + r1X) * this.m_axis.y - (dY + r1Y) * this.m_axis.x;
    this.m_a2 = r2X * this.m_axis.y - r2Y * this.m_axis.x;
    this.m_motorMass = this.m_invMassA + this.m_invMassB + this.m_invIA * this.m_a1 * this.m_a1 + this.m_invIB * this.m_a2 * this.m_a2;
    if (this.m_motorMass > Number.MIN_VALUE){
        this.m_motorMass = 1 / this.m_motorMass;
    }
    this.m_perp.SetV(Box2D.Math.MulMV(xf1.R, this.m_localYAxis1));
    this.m_s1 = (dX + r1X) * this.m_perp.y - (dY + r1Y) * this.m_perp.x;
    this.m_s2 = r2X * this.m_perp.y - r2Y * this.m_perp.x;
    var m1 = this.m_invMassA;
    var m2 = this.m_invMassB;
    var i1 = this.m_invIA;
    var i2 = this.m_invIB;
    this.m_K.col1.x = m1 + m2 + i1 * this.m_s1 * this.m_s1 + i2 * this.m_s2 * this.m_s2;
    this.m_K.col1.y = i1 * this.m_s1 + i2 * this.m_s2;
    this.m_K.col1.z = i1 * this.m_s1 * this.m_a1 + i2 * this.m_s2 * this.m_a2;
    this.m_K.col2.x = this.m_K.col1.y;
    this.m_K.col2.y = i1 + i2;
    this.m_K.col2.z = i1 * this.m_a1 + i2 * this.m_a2;
    this.m_K.col3.x = this.m_K.col1.z;
    this.m_K.col3.y = this.m_K.col2.z;
    this.m_K.col3.z = m1 + m2 + i1 * this.m_a1 * this.m_a1 + i2 * this.m_a2 * this.m_a2;
    if (this.m_enableLimit){
        var jointTransition = this.m_axis.x * dX + this.m_axis.y * dY;
        if (Box2D.Math.Abs(this.m_upperTranslation - this.m_lowerTranslation) < 2 * Box2D.Settings.b2_linearSlop){
            this.m_limitState = Box2D.Joint.e_equalLimits;
        }
        else {
            if (jointTransition <= this.m_lowerTranslation){
                if (this.m_limitState != Box2D.Joint.e_atLowerLimit){
                    this.m_limitState = Box2D.Joint.e_atLowerLimit;
                    this.m_impulse.z = 0;
                }
            }
            else {
                if (jointTransition >= this.m_upperTranslation){
                    if (this.m_limitState != Box2D.Joint.e_atUpperLimit){
                        this.m_limitState = Box2D.Joint.e_atUpperLimit;
                        this.m_impulse.z = 0;
                    }
                }
                else {
                    this.m_limitState = Box2D.Joint.e_inactiveLimit;
                    this.m_impulse.z = 0;
                }
            }
        }
    }
    else {
        this.m_limitState = Box2D.Joint.e_inactiveLimit;
    }
    if (this.m_enableMotor === false){
        this.m_motorImpulse = 0;
    }
    if (step.warmStarting){
        this.m_impulse.x *= step.dtRatio;
        this.m_impulse.y *= step.dtRatio;
        this.m_motorImpulse *= step.dtRatio;
        var PX = this.m_impulse.x * this.m_perp.x + (this.m_motorImpulse + this.m_impulse.z) * this.m_axis.x;
        var PY = this.m_impulse.x * this.m_perp.y + (this.m_motorImpulse + this.m_impulse.z) * this.m_axis.y;
        var L1 = this.m_impulse.x * this.m_s1 + this.m_impulse.y + (this.m_motorImpulse + this.m_impulse.z) * this.m_a1;
        var L2 = this.m_impulse.x * this.m_s2 + this.m_impulse.y + (this.m_motorImpulse + this.m_impulse.z) * this.m_a2;
        bA.m_linearVelocity.x -= this.m_invMassA * PX;
        bA.m_linearVelocity.y -= this.m_invMassA * PY;
        bA.m_angularVelocity -= this.m_invIA * L1;
        bB.m_linearVelocity.x += this.m_invMassB * PX;
        bB.m_linearVelocity.y += this.m_invMassB * PY;
        bB.m_angularVelocity += this.m_invIB * L2;
    }
    else {
        this.m_impulse.SetZero();
        this.m_motorImpulse = 0;
    }
};
 
 Box2D.PrismaticJoint.prototype.SolveVelocityConstraints = function(step){
    var bA = this.m_bodyA;
    var bB = this.m_bodyB;
    var v1 = bA.m_linearVelocity;
    var w1 = bA.m_angularVelocity;
    var v2 = bB.m_linearVelocity;
    var w2 = bB.m_angularVelocity;
    var PX;
    var PY;
    var L1;
    var L2;
    if (this.m_enableMotor && this.m_limitState != Box2D.Joint.e_equalLimits){
        var Cdot = this.m_axis.x * (v2.x - v1.x) + this.m_axis.y * (v2.y - v1.y) + this.m_a2 * w2 - this.m_a1 * w1;
        var impulse = this.m_motorMass * (this.m_motorSpeed - Cdot);
        var oldImpulse = this.m_motorImpulse;
        var maxImpulse = step.dt * this.m_maxMotorForce;
        this.m_motorImpulse = Box2D.Math.Clamp(this.m_motorImpulse + impulse, - maxImpulse, maxImpulse);
        impulse = this.m_motorImpulse - oldImpulse;
        PX = impulse * this.m_axis.x;
        PY = impulse * this.m_axis.y;
        L1 = impulse * this.m_a1;
        L2 = impulse * this.m_a2;
        v1.x -= this.m_invMassA * PX;
        v1.y -= this.m_invMassA * PY;
        w1 -= this.m_invIA * L1;
        v2.x += this.m_invMassB * PX;
        v2.y += this.m_invMassB * PY;
        w2 += this.m_invIB * L2;
    }
    var Cdot1X = this.m_perp.x * (v2.x - v1.x) + this.m_perp.y * (v2.y - v1.y) + this.m_s2 * w2 - this.m_s1 * w1;
    var Cdot1Y = w2 - w1;
    if (this.m_enableLimit && this.m_limitState != Box2D.Joint.e_inactiveLimit){
        var Cdot2 = this.m_axis.x * (v2.x - v1.x) + this.m_axis.y * (v2.y - v1.y) + this.m_a2 * w2 - this.m_a1 * w1;
        var f1 = this.m_impulse.Copy();
        var df = this.m_K.Solve33(new Box2D.Vec3(), - Cdot1X, - Cdot1Y, - Cdot2);
        this.m_impulse.Add(df);
        if (this.m_limitState == Box2D.Joint.e_atLowerLimit){
            this.m_impulse.z = Box2D.Math.Max(this.m_impulse.z, 0);
        }
        else {
            if (this.m_limitState == Box2D.Joint.e_atUpperLimit){
                this.m_impulse.z = Box2D.Math.Min(this.m_impulse.z, 0);
            }
        }
        var bX = - Cdot1X - (this.m_impulse.z - f1.z) * this.m_K.col3.x;
        var bY = - Cdot1Y - (this.m_impulse.z - f1.z) * this.m_K.col3.y;
        var f2r = this.m_K.Solve22(new Box2D.Vec2(), bX, bY);
        f2r.x += f1.x;
        f2r.y += f1.y;
        this.m_impulse.x = f2r.x;
        this.m_impulse.y = f2r.y;
        df.x = this.m_impulse.x - f1.x;
        df.y = this.m_impulse.y - f1.y;
        df.z = this.m_impulse.z - f1.z;
        PX = df.x * this.m_perp.x + df.z * this.m_axis.x;
        PY = df.x * this.m_perp.y + df.z * this.m_axis.y;
        L1 = df.x * this.m_s1 + df.y + df.z * this.m_a1;
        L2 = df.x * this.m_s2 + df.y + df.z * this.m_a2;
        v1.x -= this.m_invMassA * PX;
        v1.y -= this.m_invMassA * PY;
        w1 -= this.m_invIA * L1;
        v2.x += this.m_invMassB * PX;
        v2.y += this.m_invMassB * PY;
        w2 += this.m_invIB * L2;
    }
    else {
        var df2 = this.m_K.Solve22(new Box2D.Vec2(), - Cdot1X, - Cdot1Y);
        this.m_impulse.x += df2.x;
        this.m_impulse.y += df2.y;
        PX = df2.x * this.m_perp.x;
        PY = df2.x * this.m_perp.y;
        L1 = df2.x * this.m_s1 + df2.y;
        L2 = df2.x * this.m_s2 + df2.y;
        v1.x -= this.m_invMassA * PX;
        v1.y -= this.m_invMassA * PY;
        w1 -= this.m_invIA * L1;
        v2.x += this.m_invMassB * PX;
        v2.y += this.m_invMassB * PY;
        w2 += this.m_invIB * L2;
    }
    bA.m_linearVelocity.SetV(v1);
    bA.m_angularVelocity = w1;
    bB.m_linearVelocity.SetV(v2);
    bB.m_angularVelocity = w2;
};
 
 Box2D.PrismaticJoint.prototype.SolvePositionConstraints = function(baumgarte){
    var limitC;
    var oldLimitImpulse;
    var bA = this.m_bodyA;
    var bB = this.m_bodyB;
    var c1 = bA.m_sweep.c;
    var a1 = bA.m_sweep.a;
    var c2 = bB.m_sweep.c;
    var a2 = bB.m_sweep.a;
    var tMat;
    var tX;
    var m1;
    var m2;
    var i1;
    var i2;
    var linearError = 0;
    var angularError = 0;
    var active = false;
    var C2 = 0;
    var R1 = Box2D.Mat22.FromAngle(a1);
    var R2 = Box2D.Mat22.FromAngle(a2);
    tMat = R1;
    var r1X = this.m_localAnchor1.x - this.m_localCenterA.x;
    var r1Y = this.m_localAnchor1.y - this.m_localCenterA.y;
    tX = tMat.col1.x * r1X + tMat.col2.x * r1Y;
    r1Y = tMat.col1.y * r1X + tMat.col2.y * r1Y;
    r1X = tX;
    tMat = R2;
    var r2X = this.m_localAnchor2.x - this.m_localCenterB.x;
    var r2Y = this.m_localAnchor2.y - this.m_localCenterB.y;
    tX = tMat.col1.x * r2X + tMat.col2.x * r2Y;
    r2Y = tMat.col1.y * r2X + tMat.col2.y * r2Y;
    r2X = tX;
    var dX = c2.x + r2X - c1.x - r1X;
    var dY = c2.y + r2Y - c1.y - r1Y;
    if (this.m_enableLimit){
        this.m_axis = Box2D.Math.MulMV(R1, this.m_localXAxis1);
        this.m_a1 = (dX + r1X) * this.m_axis.y - (dY + r1Y) * this.m_axis.x;
        this.m_a2 = r2X * this.m_axis.y - r2Y * this.m_axis.x;
        var translation = this.m_axis.x * dX + this.m_axis.y * dY;
        if (Box2D.Math.Abs(this.m_upperTranslation - this.m_lowerTranslation) < 2 * Box2D.Settings.b2_linearSlop){
            C2 = Box2D.Math.Clamp(translation, - Box2D.Settings.b2_maxLinearCorrection, Box2D.Settings.b2_maxLinearCorrection);
            linearError = Box2D.Math.Abs(translation);
            active = true;
        }
        else {
            if (translation <= this.m_lowerTranslation){
                C2 = Box2D.Math.Clamp(translation - this.m_lowerTranslation + Box2D.Settings.b2_linearSlop, - Box2D.Settings.b2_maxLinearCorrection, 
                   0);
                linearError = this.m_lowerTranslation - translation;
                active = true;
            }
            else {
                if (translation >= this.m_upperTranslation){
                    C2 = Box2D.Math.Clamp(translation - this.m_upperTranslation + Box2D.Settings.b2_linearSlop, 0, 
                       Box2D.Settings.b2_maxLinearCorrection);
                    linearError = translation - this.m_upperTranslation;
                    active = true;
                }
            }
        }
    }
    this.m_perp = Box2D.Math.MulMV(R1, this.m_localYAxis1);
    this.m_s1 = (dX + r1X) * this.m_perp.y - (dY + r1Y) * this.m_perp.x;
    this.m_s2 = r2X * this.m_perp.y - r2Y * this.m_perp.x;
    var impulse = new Box2D.Vec3();
    var C1X = this.m_perp.x * dX + this.m_perp.y * dY;
    var C1Y = a2 - a1 - this.m_refAngle;
    linearError = Box2D.Math.Max(linearError, Box2D.Math.Abs(C1X));
    angularError = Box2D.Math.Abs(C1Y);
    if (active){
        m1 = this.m_invMassA;
        m2 = this.m_invMassB;
        i1 = this.m_invIA;
        i2 = this.m_invIB;
        this.m_K.col1.x = m1 + m2 + i1 * this.m_s1 * this.m_s1 + i2 * this.m_s2 * this.m_s2;
        this.m_K.col1.y = i1 * this.m_s1 + i2 * this.m_s2;
        this.m_K.col1.z = i1 * this.m_s1 * this.m_a1 + i2 * this.m_s2 * this.m_a2;
        this.m_K.col2.x = this.m_K.col1.y;
        this.m_K.col2.y = i1 + i2;
        this.m_K.col2.z = i1 * this.m_a1 + i2 * this.m_a2;
        this.m_K.col3.x = this.m_K.col1.z;
        this.m_K.col3.y = this.m_K.col2.z;
        this.m_K.col3.z = m1 + m2 + i1 * this.m_a1 * this.m_a1 + i2 * this.m_a2 * this.m_a2;
        this.m_K.Solve33(impulse, - C1X, - C1Y, - C2);
    }
    else {
        m1 = this.m_invMassA;
        m2 = this.m_invMassB;
        i1 = this.m_invIA;
        i2 = this.m_invIB;
        var k11 = m1 + m2 + i1 * this.m_s1 * this.m_s1 + i2 * this.m_s2 * this.m_s2;
        var k12 = i1 * this.m_s1 + i2 * this.m_s2;
        var k22 = i1 + i2;
        this.m_K.col1.Set(k11, k12, 0);
        this.m_K.col2.Set(k12, k22, 0);
        var impulse1 = this.m_K.Solve22(new Box2D.Vec2(), - C1X, - C1Y);
        impulse.x = impulse1.x;
        impulse.y = impulse1.y;
        impulse.z = 0;
    }
    var PX = impulse.x * this.m_perp.x + impulse.z * this.m_axis.x;
    var PY = impulse.x * this.m_perp.y + impulse.z * this.m_axis.y;
    var L1 = impulse.x * this.m_s1 + impulse.y + impulse.z * this.m_a1;
    var L2 = impulse.x * this.m_s2 + impulse.y + impulse.z * this.m_a2;
    c1.x -= this.m_invMassA * PX;
    c1.y -= this.m_invMassA * PY;
    a1 -= this.m_invIA * L1;
    c2.x += this.m_invMassB * PX;
    c2.y += this.m_invMassB * PY;
    a2 += this.m_invIB * L2;
    bA.m_sweep.a = a1;
    bB.m_sweep.a = a2;
    bA.SynchronizeTransform();
    bB.SynchronizeTransform();
    return linearError <= Box2D.Settings.b2_linearSlop && angularError <= Box2D.Settings.b2_angularSlop;
};
 
 Box2D.PrismaticJoint.prototype.GetAnchorA = function(){
    return this.m_bodyA.GetWorldPoint(this.m_localAnchor1);
};
 
 Box2D.PrismaticJoint.prototype.GetAnchorB = function(){
    return this.m_bodyB.GetWorldPoint(this.m_localAnchor2);
};
 
 Box2D.PrismaticJoint.prototype.GetReactionForce = function(inv_dt){
    return new Box2D.Vec2(inv_dt * (this.m_impulse.x * this.m_perp.x + (this.m_motorImpulse + this.m_impulse.z) * this.m_axis.x), 
       inv_dt * (this.m_impulse.x * this.m_perp.y + (this.m_motorImpulse + this.m_impulse.z) * this.m_axis.y));
};
 
 Box2D.PrismaticJoint.prototype.GetReactionTorque = function(inv_dt){
    return inv_dt * this.m_impulse.y;
};
 
 Box2D.PrismaticJoint.prototype.GetJointTranslation = function(){
    var bA = this.m_bodyA;
    var bB = this.m_bodyB;
    var tMat;
    var p1 = bA.GetWorldPoint(this.m_localAnchor1);
    var p2 = bB.GetWorldPoint(this.m_localAnchor2);
    var dX = p2.x - p1.x;
    var dY = p2.y - p1.y;
    var axis = bA.GetWorldVector(this.m_localXAxis1);
    var translation = axis.x * dX + axis.y * dY;
    return translation;
};
 
 Box2D.PrismaticJoint.prototype.GetJointSpeed = function(){
    var bA = this.m_bodyA;
    var bB = this.m_bodyB;
    var tMat;
    tMat = bA.m_xf.R;
    var r1X = this.m_localAnchor1.x - bA.m_sweep.localCenter.x;
    var r1Y = this.m_localAnchor1.y - bA.m_sweep.localCenter.y;
    var tX = tMat.col1.x * r1X + tMat.col2.x * r1Y;
    r1Y = tMat.col1.y * r1X + tMat.col2.y * r1Y;
    r1X = tX;
    tMat = bB.m_xf.R;
    var r2X = this.m_localAnchor2.x - bB.m_sweep.localCenter.x;
    var r2Y = this.m_localAnchor2.y - bB.m_sweep.localCenter.y;
    tX = tMat.col1.x * r2X + tMat.col2.x * r2Y;
    r2Y = tMat.col1.y * r2X + tMat.col2.y * r2Y;
    r2X = tX;
    var p1X = bA.m_sweep.c.x + r1X;
    var p1Y = bA.m_sweep.c.y + r1Y;
    var p2X = bB.m_sweep.c.x + r2X;
    var p2Y = bB.m_sweep.c.y + r2Y;
    var dX = p2X - p1X;
    var dY = p2Y - p1Y;
    var axis = bA.GetWorldVector(this.m_localXAxis1);
    var v1 = bA.m_linearVelocity;
    var v2 = bB.m_linearVelocity;
    var w1 = bA.m_angularVelocity;
    var w2 = bB.m_angularVelocity;
    var speed = dX * - w1 * axis.y + dY * w1 * axis.x + (axis.x * (v2.x - w2 * r2Y - v1.x + w1 * r1Y) + axis.y * (v2.y + w2 * r2X - v1.y - w1 * r1X));
    return speed;
};
 
 Box2D.PrismaticJoint.prototype.IsLimitEnabled = function(){
    return this.m_enableLimit;
};
 
 Box2D.PrismaticJoint.prototype.EnableLimit = function(flag){
    this.m_bodyA.SetAwake(true);
    this.m_bodyB.SetAwake(true);
    this.m_enableLimit = flag;
};
 
 Box2D.PrismaticJoint.prototype.GetLowerLimit = function(){
    return this.m_lowerTranslation;
};
 
 Box2D.PrismaticJoint.prototype.GetUpperLimit = function(){
    return this.m_upperTranslation;
};
 
 Box2D.PrismaticJoint.prototype.SetLimits = function(lower, upper){
    this.m_bodyA.SetAwake(true);
    this.m_bodyB.SetAwake(true);
    this.m_lowerTranslation = lower;
    this.m_upperTranslation = upper;
};
 
 Box2D.PrismaticJoint.prototype.IsMotorEnabled = function(){
    return this.m_enableMotor;
};
 
 Box2D.PrismaticJoint.prototype.EnableMotor = function(flag){
    this.m_bodyA.SetAwake(true);
    this.m_bodyB.SetAwake(true);
    this.m_enableMotor = flag;
};
 
 Box2D.PrismaticJoint.prototype.SetMotorSpeed = function(speed){
    this.m_bodyA.SetAwake(true);
    this.m_bodyB.SetAwake(true);
    this.m_motorSpeed = speed;
};
 
 Box2D.PrismaticJoint.prototype.GetMotorSpeed = function(){
    return this.m_motorSpeed;
};
 
 Box2D.PrismaticJoint.prototype.SetMaxMotorForce = function(force){
    this.m_bodyA.SetAwake(true);
    this.m_bodyB.SetAwake(true);
    this.m_maxMotorForce = force;
};
 
 Box2D.PrismaticJoint.prototype.GetMotorForce = function(){
    return this.m_motorImpulse;
};
 Box2D.PrismaticJoint.prototype.m_localAnchor1 = new Box2D.Vec2();
 Box2D.PrismaticJoint.prototype.m_localAnchor2 = new Box2D.Vec2();
 Box2D.PrismaticJoint.prototype.m_localXAxis1 = new Box2D.Vec2();
 Box2D.PrismaticJoint.prototype.m_localYAxis1 = new Box2D.Vec2();
 Box2D.PrismaticJoint.prototype.m_refAngle = undefined;
 Box2D.PrismaticJoint.prototype.m_axis = new Box2D.Vec2();
 Box2D.PrismaticJoint.prototype.m_perp = new Box2D.Vec2();
 Box2D.PrismaticJoint.prototype.m_s1 = undefined;
 Box2D.PrismaticJoint.prototype.m_s2 = undefined;
 Box2D.PrismaticJoint.prototype.m_a1 = undefined;
 Box2D.PrismaticJoint.prototype.m_a2 = undefined;
 Box2D.PrismaticJoint.prototype.m_K = new Box2D.Mat33();
 Box2D.PrismaticJoint.prototype.m_impulse = new Box2D.Vec3();
 Box2D.PrismaticJoint.prototype.m_motorMass = undefined;
 Box2D.PrismaticJoint.prototype.m_motorImpulse = undefined;
 Box2D.PrismaticJoint.prototype.m_lowerTranslation = undefined;
 Box2D.PrismaticJoint.prototype.m_upperTranslation = undefined;
 Box2D.PrismaticJoint.prototype.m_maxMotorForce = undefined;
 Box2D.PrismaticJoint.prototype.m_motorSpeed = undefined;
 Box2D.PrismaticJoint.prototype.m_enableLimit = undefined;
 Box2D.PrismaticJoint.prototype.m_enableMotor = undefined;
 Box2D.PrismaticJoint.prototype.m_limitState = 0;
 
 Box2D.RevoluteJoint = function(){
    Box2D.Joint.prototype.__varz.call(this);
    this.__varz();
    this.__constructor.apply(this, arguments);
};
 extend(Box2D.RevoluteJoint.prototype, Box2D.Joint.prototype);
 Box2D.RevoluteJoint.prototype._super = Box2D.Joint.prototype;
 
 Box2D.RevoluteJoint.prototype.__constructor = function(def){
    this._super.__constructor.apply(this,[def]);
    this.m_localAnchor1.SetV(def.localAnchorA);
    this.m_localAnchor2.SetV(def.localAnchorB);
    this.m_referenceAngle = def.referenceAngle;
    this.m_impulse.SetZero();
    this.m_motorImpulse = 0;
    this.m_lowerAngle = def.lowerAngle;
    this.m_upperAngle = def.upperAngle;
    this.m_maxMotorTorque = def.maxMotorTorque;
    this.m_motorSpeed = def.motorSpeed;
    this.m_enableLimit = def.enableLimit;
    this.m_enableMotor = def.enableMotor;
    this.m_limitState = Box2D.Joint.e_inactiveLimit;
};
 
 Box2D.RevoluteJoint.prototype.__varz = function(){
    this.K = new Box2D.Mat22();
    this.K1 = new Box2D.Mat22();
    this.K2 = new Box2D.Mat22();
    this.K3 = new Box2D.Mat22();
    this.impulse3 = new Box2D.Vec3();
    this.impulse2 = new Box2D.Vec2();
    this.reduced = new Box2D.Vec2();
    this.m_localAnchor1 = new Box2D.Vec2();
    this.m_localAnchor2 = new Box2D.Vec2();
    this.m_impulse = new Box2D.Vec3();
    this.m_mass = new Box2D.Mat33();
};
 Box2D.RevoluteJoint.tImpulse = new Box2D.Vec2();
 
 Box2D.RevoluteJoint.prototype.InitVelocityConstraints = function(step){
    var bA = this.m_bodyA;
    var bB = this.m_bodyB;
    var tMat;
    var tX;
    if (this.m_enableMotor || this.m_enableLimit){
    }
    tMat = bA.m_xf.R;
    var r1X = this.m_localAnchor1.x - bA.m_sweep.localCenter.x;
    var r1Y = this.m_localAnchor1.y - bA.m_sweep.localCenter.y;
    tX = tMat.col1.x * r1X + tMat.col2.x * r1Y;
    r1Y = tMat.col1.y * r1X + tMat.col2.y * r1Y;
    r1X = tX;
    tMat = bB.m_xf.R;
    var r2X = this.m_localAnchor2.x - bB.m_sweep.localCenter.x;
    var r2Y = this.m_localAnchor2.y - bB.m_sweep.localCenter.y;
    tX = tMat.col1.x * r2X + tMat.col2.x * r2Y;
    r2Y = tMat.col1.y * r2X + tMat.col2.y * r2Y;
    r2X = tX;
    var m1 = bA.m_invMass;
    var m2 = bB.m_invMass;
    var i1 = bA.m_invI;
    var i2 = bB.m_invI;
    this.m_mass.col1.x = m1 + m2 + r1Y * r1Y * i1 + r2Y * r2Y * i2;
    this.m_mass.col2.x = - r1Y * r1X * i1 - r2Y * r2X * i2;
    this.m_mass.col3.x = - r1Y * i1 - r2Y * i2;
    this.m_mass.col1.y = this.m_mass.col2.x;
    this.m_mass.col2.y = m1 + m2 + r1X * r1X * i1 + r2X * r2X * i2;
    this.m_mass.col3.y = r1X * i1 + r2X * i2;
    this.m_mass.col1.z = this.m_mass.col3.x;
    this.m_mass.col2.z = this.m_mass.col3.y;
    this.m_mass.col3.z = i1 + i2;
    this.m_motorMass = 1 / (i1 + i2);
    if (this.m_enableMotor === false){
        this.m_motorImpulse = 0;
    }
    if (this.m_enableLimit){
        var jointAngle = bB.m_sweep.a - bA.m_sweep.a - this.m_referenceAngle;
        if (Box2D.Math.Abs(this.m_upperAngle - this.m_lowerAngle) < 2 * Box2D.Settings.b2_angularSlop){
            this.m_limitState = Box2D.Joint.e_equalLimits;
        }
        else {
            if (jointAngle <= this.m_lowerAngle){
                if (this.m_limitState != Box2D.Joint.e_atLowerLimit){
                    this.m_impulse.z = 0;
                }
                this.m_limitState = Box2D.Joint.e_atLowerLimit;
            }
            else {
                if (jointAngle >= this.m_upperAngle){
                    if (this.m_limitState != Box2D.Joint.e_atUpperLimit){
                        this.m_impulse.z = 0;
                    }
                    this.m_limitState = Box2D.Joint.e_atUpperLimit;
                }
                else {
                    this.m_limitState = Box2D.Joint.e_inactiveLimit;
                    this.m_impulse.z = 0;
                }
            }
        }
    }
    else {
        this.m_limitState = Box2D.Joint.e_inactiveLimit;
    }
    if (step.warmStarting){
        this.m_impulse.x *= step.dtRatio;
        this.m_impulse.y *= step.dtRatio;
        this.m_motorImpulse *= step.dtRatio;
        var PX = this.m_impulse.x;
        var PY = this.m_impulse.y;
        bA.m_linearVelocity.x -= m1 * PX;
        bA.m_linearVelocity.y -= m1 * PY;
        bA.m_angularVelocity -= i1 * (r1X * PY - r1Y * PX + this.m_motorImpulse + this.m_impulse.z);
        bB.m_linearVelocity.x += m2 * PX;
        bB.m_linearVelocity.y += m2 * PY;
        bB.m_angularVelocity += i2 * (r2X * PY - r2Y * PX + this.m_motorImpulse + this.m_impulse.z);
    }
    else {
        this.m_impulse.SetZero();
        this.m_motorImpulse = 0;
    }
};
 
 Box2D.RevoluteJoint.prototype.SolveVelocityConstraints = function(step){
    var bA = this.m_bodyA;
    var bB = this.m_bodyB;
    var tMat;
    var tX;
    var newImpulse;
    var r1X;
    var r1Y;
    var r2X;
    var r2Y;
    var v1 = bA.m_linearVelocity;
    var w1 = bA.m_angularVelocity;
    var v2 = bB.m_linearVelocity;
    var w2 = bB.m_angularVelocity;
    var m1 = bA.m_invMass;
    var m2 = bB.m_invMass;
    var i1 = bA.m_invI;
    var i2 = bB.m_invI;
    if (this.m_enableMotor && this.m_limitState != Box2D.Joint.e_equalLimits){
        var Cdot = w2 - w1 - this.m_motorSpeed;
        var impulse = this.m_motorMass * - Cdot;
        var oldImpulse = this.m_motorImpulse;
        var maxImpulse = step.dt * this.m_maxMotorTorque;
        this.m_motorImpulse = Box2D.Math.Clamp(this.m_motorImpulse + impulse, - maxImpulse, maxImpulse);
        impulse = this.m_motorImpulse - oldImpulse;
        w1 -= i1 * impulse;
        w2 += i2 * impulse;
    }
    if (this.m_enableLimit && this.m_limitState != Box2D.Joint.e_inactiveLimit){
        tMat = bA.m_xf.R;
        r1X = this.m_localAnchor1.x - bA.m_sweep.localCenter.x;
        r1Y = this.m_localAnchor1.y - bA.m_sweep.localCenter.y;
        tX = tMat.col1.x * r1X + tMat.col2.x * r1Y;
        r1Y = tMat.col1.y * r1X + tMat.col2.y * r1Y;
        r1X = tX;
        tMat = bB.m_xf.R;
        r2X = this.m_localAnchor2.x - bB.m_sweep.localCenter.x;
        r2Y = this.m_localAnchor2.y - bB.m_sweep.localCenter.y;
        tX = tMat.col1.x * r2X + tMat.col2.x * r2Y;
        r2Y = tMat.col1.y * r2X + tMat.col2.y * r2Y;
        r2X = tX;
        var Cdot1X = v2.x - w2 * r2Y - v1.x + w1 * r1Y;
        var Cdot1Y = v2.y + w2 * r2X - v1.y - w1 * r1X;
        var Cdot2 = w2 - w1;
        this.m_mass.Solve33(this.impulse3, - Cdot1X, - Cdot1Y, - Cdot2);
        if (this.m_limitState == Box2D.Joint.e_equalLimits){
            this.m_impulse.Add(this.impulse3);
        }
        else {
            if (this.m_limitState == Box2D.Joint.e_atLowerLimit){
                newImpulse = this.m_impulse.z + this.impulse3.z;
                if (newImpulse < 0){
                    this.m_mass.Solve22(this.reduced, - Cdot1X, - Cdot1Y);
                    this.impulse3.x = this.reduced.x;
                    this.impulse3.y = this.reduced.y;
                    this.impulse3.z = - this.m_impulse.z;
                    this.m_impulse.x += this.reduced.x;
                    this.m_impulse.y += this.reduced.y;
                    this.m_impulse.z = 0;
                }
            }
            else {
                if (this.m_limitState == Box2D.Joint.e_atUpperLimit){
                    newImpulse = this.m_impulse.z + this.impulse3.z;
                    if (newImpulse > 0){
                        this.m_mass.Solve22(this.reduced, - Cdot1X, - Cdot1Y);
                        this.impulse3.x = this.reduced.x;
                        this.impulse3.y = this.reduced.y;
                        this.impulse3.z = - this.m_impulse.z;
                        this.m_impulse.x += this.reduced.x;
                        this.m_impulse.y += this.reduced.y;
                        this.m_impulse.z = 0;
                    }
                }
            }
        }
        v1.x -= m1 * this.impulse3.x;
        v1.y -= m1 * this.impulse3.y;
        w1 -= i1 * (r1X * this.impulse3.y - r1Y * this.impulse3.x + this.impulse3.z);
        v2.x += m2 * this.impulse3.x;
        v2.y += m2 * this.impulse3.y;
        w2 += i2 * (r2X * this.impulse3.y - r2Y * this.impulse3.x + this.impulse3.z);
    }
    else {
        tMat = bA.m_xf.R;
        r1X = this.m_localAnchor1.x - bA.m_sweep.localCenter.x;
        r1Y = this.m_localAnchor1.y - bA.m_sweep.localCenter.y;
        tX = tMat.col1.x * r1X + tMat.col2.x * r1Y;
        r1Y = tMat.col1.y * r1X + tMat.col2.y * r1Y;
        r1X = tX;
        tMat = bB.m_xf.R;
        r2X = this.m_localAnchor2.x - bB.m_sweep.localCenter.x;
        r2Y = this.m_localAnchor2.y - bB.m_sweep.localCenter.y;
        tX = tMat.col1.x * r2X + tMat.col2.x * r2Y;
        r2Y = tMat.col1.y * r2X + tMat.col2.y * r2Y;
        r2X = tX;
        var CdotX = v2.x - w2 * r2Y - v1.x + w1 * r1Y;
        var CdotY = v2.y + w2 * r2X - v1.y - w1 * r1X;
        this.m_mass.Solve22(this.impulse2, - CdotX, - CdotY);
        this.m_impulse.x += this.impulse2.x;
        this.m_impulse.y += this.impulse2.y;
        v1.x -= m1 * this.impulse2.x;
        v1.y -= m1 * this.impulse2.y;
        w1 -= i1 * (r1X * this.impulse2.y - r1Y * this.impulse2.x);
        v2.x += m2 * this.impulse2.x;
        v2.y += m2 * this.impulse2.y;
        w2 += i2 * (r2X * this.impulse2.y - r2Y * this.impulse2.x);
    }
    bA.m_linearVelocity.SetV(v1);
    bA.m_angularVelocity = w1;
    bB.m_linearVelocity.SetV(v2);
    bB.m_angularVelocity = w2;
};
 
 Box2D.RevoluteJoint.prototype.SolvePositionConstraints = function(baumgarte){
    var oldLimitImpulse;
    var C;
    var tMat;
    var bA = this.m_bodyA;
    var bB = this.m_bodyB;
    var angularError = 0;
    var positionError = 0;
    var tX;
    var impulseX;
    var impulseY;
    if (this.m_enableLimit && this.m_limitState != Box2D.Joint.e_inactiveLimit){
        var angle = bB.m_sweep.a - bA.m_sweep.a - this.m_referenceAngle;
        var limitImpulse = 0;
        if (this.m_limitState == Box2D.Joint.e_equalLimits){
            C = Box2D.Math.Clamp(angle - this.m_lowerAngle, - Box2D.Settings.b2_maxAngularCorrection, Box2D.Settings.b2_maxAngularCorrection);
            limitImpulse = - this.m_motorMass * C;
            angularError = Box2D.Math.Abs(C);
        }
        else {
            if (this.m_limitState == Box2D.Joint.e_atLowerLimit){
                C = angle - this.m_lowerAngle;
                angularError = - C;
                C = Box2D.Math.Clamp(C + Box2D.Settings.b2_angularSlop, - Box2D.Settings.b2_maxAngularCorrection, 0);
                limitImpulse = - this.m_motorMass * C;
            }
            else {
                if (this.m_limitState == Box2D.Joint.e_atUpperLimit){
                    C = angle - this.m_upperAngle;
                    angularError = C;
                    C = Box2D.Math.Clamp(C - Box2D.Settings.b2_angularSlop, 0, Box2D.Settings.b2_maxAngularCorrection);
                    limitImpulse = - this.m_motorMass * C;
                }
            }
        }
        bA.m_sweep.a -= bA.m_invI * limitImpulse;
        bB.m_sweep.a += bB.m_invI * limitImpulse;
        bA.SynchronizeTransform();
        bB.SynchronizeTransform();
    }
    tMat = bA.m_xf.R;
    var r1X = this.m_localAnchor1.x - bA.m_sweep.localCenter.x;
    var r1Y = this.m_localAnchor1.y - bA.m_sweep.localCenter.y;
    tX = tMat.col1.x * r1X + tMat.col2.x * r1Y;
    r1Y = tMat.col1.y * r1X + tMat.col2.y * r1Y;
    r1X = tX;
    tMat = bB.m_xf.R;
    var r2X = this.m_localAnchor2.x - bB.m_sweep.localCenter.x;
    var r2Y = this.m_localAnchor2.y - bB.m_sweep.localCenter.y;
    tX = tMat.col1.x * r2X + tMat.col2.x * r2Y;
    r2Y = tMat.col1.y * r2X + tMat.col2.y * r2Y;
    r2X = tX;
    var CX = bB.m_sweep.c.x + r2X - bA.m_sweep.c.x - r1X;
    var CY = bB.m_sweep.c.y + r2Y - bA.m_sweep.c.y - r1Y;
    var CLengthSquared = CX * CX + CY * CY;
    var CLength = Math.sqrt(CLengthSquared);
    positionError = CLength;
    var invMass1 = bA.m_invMass;
    var invMass2 = bB.m_invMass;
    var invI1 = bA.m_invI;
    var invI2 = bB.m_invI;
    var k_allowedStretch = 10 * Box2D.Settings.b2_linearSlop;
    if (CLengthSquared > k_allowedStretch * k_allowedStretch){
        var uX = CX / CLength;
        var uY = CY / CLength;
        var k = invMass1 + invMass2;
        var m = 1 / k;
        impulseX = m * - CX;
        impulseY = m * - CY;
        var k_beta = 0.5;
        bA.m_sweep.c.x -= k_beta * invMass1 * impulseX;
        bA.m_sweep.c.y -= k_beta * invMass1 * impulseY;
        bB.m_sweep.c.x += k_beta * invMass2 * impulseX;
        bB.m_sweep.c.y += k_beta * invMass2 * impulseY;
        CX = bB.m_sweep.c.x + r2X - bA.m_sweep.c.x - r1X;
        CY = bB.m_sweep.c.y + r2Y - bA.m_sweep.c.y - r1Y;
    }
    this.K1.col1.x = invMass1 + invMass2;
    this.K1.col2.x = 0;
    this.K1.col1.y = 0;
    this.K1.col2.y = invMass1 + invMass2;
    this.K2.col1.x = invI1 * r1Y * r1Y;
    this.K2.col2.x = - invI1 * r1X * r1Y;
    this.K2.col1.y = - invI1 * r1X * r1Y;
    this.K2.col2.y = invI1 * r1X * r1X;
    this.K3.col1.x = invI2 * r2Y * r2Y;
    this.K3.col2.x = - invI2 * r2X * r2Y;
    this.K3.col1.y = - invI2 * r2X * r2Y;
    this.K3.col2.y = invI2 * r2X * r2X;
    this.K.SetM(this.K1);
    this.K.AddM(this.K2);
    this.K.AddM(this.K3);
    this.K.Solve(Box2D.RevoluteJoint.tImpulse, - CX, - CY);
    impulseX = Box2D.RevoluteJoint.tImpulse.x;
    impulseY = Box2D.RevoluteJoint.tImpulse.y;
    bA.m_sweep.c.x -= bA.m_invMass * impulseX;
    bA.m_sweep.c.y -= bA.m_invMass * impulseY;
    bA.m_sweep.a -= bA.m_invI * (r1X * impulseY - r1Y * impulseX);
    bB.m_sweep.c.x += bB.m_invMass * impulseX;
    bB.m_sweep.c.y += bB.m_invMass * impulseY;
    bB.m_sweep.a += bB.m_invI * (r2X * impulseY - r2Y * impulseX);
    bA.SynchronizeTransform();
    bB.SynchronizeTransform();
    return positionError <= Box2D.Settings.b2_linearSlop && angularError <= Box2D.Settings.b2_angularSlop;
};
 
 Box2D.RevoluteJoint.prototype.GetAnchorA = function(){
    return this.m_bodyA.GetWorldPoint(this.m_localAnchor1);
};
 
 Box2D.RevoluteJoint.prototype.GetAnchorB = function(){
    return this.m_bodyB.GetWorldPoint(this.m_localAnchor2);
};
 
 Box2D.RevoluteJoint.prototype.GetReactionForce = function(inv_dt){
    return new Box2D.Vec2(inv_dt * this.m_impulse.x, inv_dt * this.m_impulse.y);
};

Box2D.RevoluteJoint.prototype.GetReactionTorque = function(inv_dt){
    return inv_dt * this.m_impulse.z;
};
 
 Box2D.RevoluteJoint.prototype.GetJointAngle = function(){
    return this.m_bodyB.m_sweep.a - this.m_bodyA.m_sweep.a - this.m_referenceAngle;
};
 
 Box2D.RevoluteJoint.prototype.GetJointSpeed = function(){
    return this.m_bodyB.m_angularVelocity - this.m_bodyA.m_angularVelocity;
};
 
 Box2D.RevoluteJoint.prototype.IsLimitEnabled = function(){
    return this.m_enableLimit;
};
 
 Box2D.RevoluteJoint.prototype.EnableLimit = function(flag){
    this.m_enableLimit = flag;
};
 
 Box2D.RevoluteJoint.prototype.GetLowerLimit = function(){
    return this.m_lowerAngle;
};
 
 Box2D.RevoluteJoint.prototype.GetUpperLimit = function(){
    return this.m_upperAngle;
};
 
 Box2D.RevoluteJoint.prototype.SetLimits = function(lower, upper){
    this.m_lowerAngle = lower;
    this.m_upperAngle = upper;
};
 
 Box2D.RevoluteJoint.prototype.IsMotorEnabled = function(){
    this.m_bodyA.SetAwake(true);
    this.m_bodyB.SetAwake(true);
    return this.m_enableMotor;
};
 
 Box2D.RevoluteJoint.prototype.EnableMotor = function(flag){
    this.m_enableMotor = flag;
};
 
 Box2D.RevoluteJoint.prototype.SetMotorSpeed = function(speed){
    this.m_bodyA.SetAwake(true);
    this.m_bodyB.SetAwake(true);
    this.m_motorSpeed = speed;
};
 
 Box2D.RevoluteJoint.prototype.GetMotorSpeed = function(){
    return this.m_motorSpeed;
};
 
 Box2D.RevoluteJoint.prototype.SetMaxMotorTorque = function(torque){
    this.m_maxMotorTorque = torque;
};
 
 Box2D.RevoluteJoint.prototype.GetMotorTorque = function(){
    return this.m_maxMotorTorque;
};
 Box2D.RevoluteJoint.prototype.K = new Box2D.Mat22();
 Box2D.RevoluteJoint.prototype.K1 = new Box2D.Mat22();
 Box2D.RevoluteJoint.prototype.K2 = new Box2D.Mat22();
 Box2D.RevoluteJoint.prototype.K3 = new Box2D.Mat22();
 Box2D.RevoluteJoint.prototype.impulse3 = new Box2D.Vec3();
 Box2D.RevoluteJoint.prototype.impulse2 = new Box2D.Vec2();
 Box2D.RevoluteJoint.prototype.reduced = new Box2D.Vec2();
 Box2D.RevoluteJoint.prototype.m_localAnchor1 = new Box2D.Vec2();
 Box2D.RevoluteJoint.prototype.m_localAnchor2 = new Box2D.Vec2();
 Box2D.RevoluteJoint.prototype.m_impulse = new Box2D.Vec3();
 Box2D.RevoluteJoint.prototype.m_motorImpulse = undefined;
 Box2D.RevoluteJoint.prototype.m_mass = new Box2D.Mat33();
 Box2D.RevoluteJoint.prototype.m_motorMass = undefined;
 Box2D.RevoluteJoint.prototype.m_enableMotor = undefined;
 Box2D.RevoluteJoint.prototype.m_maxMotorTorque = undefined;
 Box2D.RevoluteJoint.prototype.m_motorSpeed = undefined;
 Box2D.RevoluteJoint.prototype.m_enableLimit = undefined;
 Box2D.RevoluteJoint.prototype.m_referenceAngle = undefined;
 Box2D.RevoluteJoint.prototype.m_lowerAngle = undefined;
 Box2D.RevoluteJoint.prototype.m_upperAngle = undefined;
 Box2D.RevoluteJoint.prototype.m_limitState = 0;
 
 Box2D.JointDef = function(){
    this.__varz();
    this.__constructor.apply(this, arguments);
};
 
 Box2D.JointDef.prototype.__constructor = function(){
    this.type = Box2D.Joint.e_unknownJoint;
    this.userData = undefined;
    this.bodyA = undefined;
    this.bodyB = undefined;
    this.collideConnected = false;
};
 
 Box2D.JointDef.prototype.__varz = function(){
};
Box2D.JointDef.prototype.type = 0;
 Box2D.JointDef.prototype.userData = undefined;
 Box2D.JointDef.prototype.bodyA = undefined;
 Box2D.JointDef.prototype.bodyB = undefined;
 Box2D.JointDef.prototype.collideConnected = undefined;
 
 Box2D.LineJointDef = function(){
    Box2D.JointDef.prototype.__varz.call(this);
    this.__varz();
    this.__constructor.apply(this, arguments);
};
 extend(Box2D.LineJointDef.prototype, Box2D.JointDef.prototype);
 Box2D.LineJointDef.prototype._super = Box2D.JointDef.prototype;
 
 Box2D.LineJointDef.prototype.__constructor = function(){
    this._super.__constructor.apply(this, arguments);
    this.type = Box2D.Joint.e_lineJoint;
    this.localAxisA.Set(1, 0);
    this.enableLimit = false;
    this.lowerTranslation = 0;
    this.upperTranslation = 0;
    this.enableMotor = false;
    this.maxMotorForce = 0;
    this.motorSpeed = 0;
};
 
 Box2D.LineJointDef.prototype.__varz = function(){
    this.localAnchorA = new Box2D.Vec2();
    this.localAnchorB = new Box2D.Vec2();
    this.localAxisA = new Box2D.Vec2();
};
 
 Box2D.LineJointDef.prototype.Initialize = function(bA, bB, anchor, axis){
    this.bodyA = bA;
    this.bodyB = bB;
    this.localAnchorA = this.bodyA.GetLocalPoint(anchor);
    this.localAnchorB = this.bodyB.GetLocalPoint(anchor);
    this.localAxisA = this.bodyA.GetLocalVector(axis);
};
 Box2D.LineJointDef.prototype.localAnchorA = new Box2D.Vec2();
 Box2D.LineJointDef.prototype.localAnchorB = new Box2D.Vec2();
 Box2D.LineJointDef.prototype.localAxisA = new Box2D.Vec2();
 Box2D.LineJointDef.prototype.enableLimit = undefined;
 Box2D.LineJointDef.prototype.lowerTranslation = undefined;
 Box2D.LineJointDef.prototype.upperTranslation = undefined;
 Box2D.LineJointDef.prototype.enableMotor = undefined;
 Box2D.LineJointDef.prototype.maxMotorForce = undefined;
 Box2D.LineJointDef.prototype.motorSpeed = undefined;
 
 Box2D.DistanceJoint = function(){
    Box2D.Joint.prototype.__varz.call(this);
    this.__varz();
    this.__constructor.apply(this, arguments);
};
 extend(Box2D.DistanceJoint.prototype, Box2D.Joint.prototype);
 Box2D.DistanceJoint.prototype._super = Box2D.Joint.prototype;
 
 Box2D.DistanceJoint.prototype.__constructor = function(def){
    this._super.__constructor.apply(this,[def]);
    var tMat;
    var tX;
    var tY;
    this.m_localAnchor1.SetV(def.localAnchorA);
    this.m_localAnchor2.SetV(def.localAnchorB);
    this.m_length = def.length;
    this.m_frequencyHz = def.frequencyHz;
    this.m_dampingRatio = def.dampingRatio;
    this.m_impulse = 0;
    this.m_gamma = 0;
    this.m_bias = 0;
};
 
 Box2D.DistanceJoint.prototype.__varz = function(){
    this.m_localAnchor1 = new Box2D.Vec2();
    this.m_localAnchor2 = new Box2D.Vec2();
    this.m_u = new Box2D.Vec2();
};
 
 Box2D.DistanceJoint.prototype.InitVelocityConstraints = function(step){
    var tMat;
    var tX;
    var bA = this.m_bodyA;
    var bB = this.m_bodyB;
    tMat = bA.m_xf.R;
    var r1X = this.m_localAnchor1.x - bA.m_sweep.localCenter.x;
    var r1Y = this.m_localAnchor1.y - bA.m_sweep.localCenter.y;
    tX = tMat.col1.x * r1X + tMat.col2.x * r1Y;
    r1Y = tMat.col1.y * r1X + tMat.col2.y * r1Y;
    r1X = tX;
    tMat = bB.m_xf.R;
    var r2X = this.m_localAnchor2.x - bB.m_sweep.localCenter.x;
    var r2Y = this.m_localAnchor2.y - bB.m_sweep.localCenter.y;
    tX = tMat.col1.x * r2X + tMat.col2.x * r2Y;
    r2Y = tMat.col1.y * r2X + tMat.col2.y * r2Y;
    r2X = tX;
    this.m_u.x = bB.m_sweep.c.x + r2X - bA.m_sweep.c.x - r1X;
    this.m_u.y = bB.m_sweep.c.y + r2Y - bA.m_sweep.c.y - r1Y;
    var length = Math.sqrt(this.m_u.x * this.m_u.x + this.m_u.y * this.m_u.y);
    if (length > Box2D.Settings.b2_linearSlop){
        this.m_u.Multiply(1 / length);
    }
    else {
        this.m_u.SetZero();
    }
    var cr1u = r1X * this.m_u.y - r1Y * this.m_u.x;
    var cr2u = r2X * this.m_u.y - r2Y * this.m_u.x;
    var invMass = bA.m_invMass + bA.m_invI * cr1u * cr1u + bB.m_invMass + bB.m_invI * cr2u * cr2u;
    this.m_mass = invMass !== 0 ? 1 / invMass: 0;
    if (this.m_frequencyHz > 0){
        var C = length - this.m_length;
        var omega = 2 * Math.PI * this.m_frequencyHz;
        var d = 2 * this.m_mass * this.m_dampingRatio * omega;
        var k = this.m_mass * omega * omega;
        this.m_gamma = step.dt * (d + step.dt * k);
        this.m_gamma = this.m_gamma !== 0 ? 1 / this.m_gamma: 0;
        this.m_bias = C * step.dt * k * this.m_gamma;
        this.m_mass = invMass + this.m_gamma;
        this.m_mass = this.m_mass !== 0 ? 1 / this.m_mass: 0;
    }
    if (step.warmStarting)        {
        this.m_impulse *= step.dtRatio;
        var PX = this.m_impulse * this.m_u.x;
        var PY = this.m_impulse * this.m_u.y;
        bA.m_linearVelocity.x -= bA.m_invMass * PX;
        bA.m_linearVelocity.y -= bA.m_invMass * PY;
        bA.m_angularVelocity -= bA.m_invI * (r1X * PY - r1Y * PX);
        bB.m_linearVelocity.x += bB.m_invMass * PX;
        bB.m_linearVelocity.y += bB.m_invMass * PY;
        bB.m_angularVelocity += bB.m_invI * (r2X * PY - r2Y * PX);
    }
    else {
        this.m_impulse = 0;
    }
};
 
 Box2D.DistanceJoint.prototype.SolveVelocityConstraints = function(step){
    var tMat;
    var bA = this.m_bodyA;
    var bB = this.m_bodyB;
    tMat = bA.m_xf.R;
    var r1X = this.m_localAnchor1.x - bA.m_sweep.localCenter.x;
    var r1Y = this.m_localAnchor1.y - bA.m_sweep.localCenter.y;
    var tX = tMat.col1.x * r1X + tMat.col2.x * r1Y;
    r1Y = tMat.col1.y * r1X + tMat.col2.y * r1Y;
    r1X = tX;
    tMat = bB.m_xf.R;
    var r2X = this.m_localAnchor2.x - bB.m_sweep.localCenter.x;
    var r2Y = this.m_localAnchor2.y - bB.m_sweep.localCenter.y;
    tX = tMat.col1.x * r2X + tMat.col2.x * r2Y;
    r2Y = tMat.col1.y * r2X + tMat.col2.y * r2Y;
    r2X = tX;
    var v1X = bA.m_linearVelocity.x + - bA.m_angularVelocity * r1Y;
    var v1Y = bA.m_linearVelocity.y + bA.m_angularVelocity * r1X;
    var v2X = bB.m_linearVelocity.x + - bB.m_angularVelocity * r2Y;
    var v2Y = bB.m_linearVelocity.y + bB.m_angularVelocity * r2X;
    var Cdot = this.m_u.x * (v2X - v1X) + this.m_u.y * (v2Y - v1Y);
    var impulse = - this.m_mass * (Cdot + this.m_bias + this.m_gamma * this.m_impulse);
    this.m_impulse += impulse;
    var PX = impulse * this.m_u.x;
    var PY = impulse * this.m_u.y;
    bA.m_linearVelocity.x -= bA.m_invMass * PX;
    bA.m_linearVelocity.y -= bA.m_invMass * PY;
    bA.m_angularVelocity -= bA.m_invI * (r1X * PY - r1Y * PX);
    bB.m_linearVelocity.x += bB.m_invMass * PX;
    bB.m_linearVelocity.y += bB.m_invMass * PY;
    bB.m_angularVelocity += bB.m_invI * (r2X * PY - r2Y * PX);
};
 
 Box2D.DistanceJoint.prototype.SolvePositionConstraints = function(baumgarte){
    var tMat;
    if (this.m_frequencyHz > 0){
        return true;
    }
    var bA = this.m_bodyA;
    var bB = this.m_bodyB;
    tMat = bA.m_xf.R;
    var r1X = this.m_localAnchor1.x - bA.m_sweep.localCenter.x;
    var r1Y = this.m_localAnchor1.y - bA.m_sweep.localCenter.y;
    var tX = tMat.col1.x * r1X + tMat.col2.x * r1Y;
    r1Y = tMat.col1.y * r1X + tMat.col2.y * r1Y;
    r1X = tX;
    tMat = bB.m_xf.R;
    var r2X = this.m_localAnchor2.x - bB.m_sweep.localCenter.x;
    var r2Y = this.m_localAnchor2.y - bB.m_sweep.localCenter.y;
    tX = tMat.col1.x * r2X + tMat.col2.x * r2Y;
    r2Y = tMat.col1.y * r2X + tMat.col2.y * r2Y;
    r2X = tX;
    var dX = bB.m_sweep.c.x + r2X - bA.m_sweep.c.x - r1X;
    var dY = bB.m_sweep.c.y + r2Y - bA.m_sweep.c.y - r1Y;
    var length = Math.sqrt(dX * dX + dY * dY);
    dX /= length;
    dY /= length;
    var C = length - this.m_length;
    C = Box2D.Math.Clamp(C, - Box2D.Settings.b2_maxLinearCorrection, Box2D.Settings.b2_maxLinearCorrection);
    var impulse = - this.m_mass * C;
    this.m_u.Set(dX, dY);
    var PX = impulse * this.m_u.x;
    var PY = impulse * this.m_u.y;
    bA.m_sweep.c.x -= bA.m_invMass * PX;
    bA.m_sweep.c.y -= bA.m_invMass * PY;
    bA.m_sweep.a -= bA.m_invI * (r1X * PY - r1Y * PX);
    bB.m_sweep.c.x += bB.m_invMass * PX;
    bB.m_sweep.c.y += bB.m_invMass * PY;
    bB.m_sweep.a += bB.m_invI * (r2X * PY - r2Y * PX);
    bA.SynchronizeTransform();
    bB.SynchronizeTransform();
    return Box2D.Math.Abs(C) < Box2D.Settings.b2_linearSlop;
};
 
 Box2D.DistanceJoint.prototype.GetAnchorA = function(){
    return this.m_bodyA.GetWorldPoint(this.m_localAnchor1);
};
 
 Box2D.DistanceJoint.prototype.GetAnchorB = function(){
    return this.m_bodyB.GetWorldPoint(this.m_localAnchor2);
};
 
 Box2D.DistanceJoint.prototype.GetReactionForce = function(inv_dt){
    return new Box2D.Vec2(inv_dt * this.m_impulse * this.m_u.x, inv_dt * this.m_impulse * this.m_u.y);
};
 
 Box2D.DistanceJoint.prototype.GetReactionTorque = function(inv_dt){
    return 0;
};
 
 Box2D.DistanceJoint.prototype.GetLength = function(){
    return this.m_length;
};
 
 Box2D.DistanceJoint.prototype.SetLength = function(length){
    this.m_length = length;
};
 
 Box2D.DistanceJoint.prototype.GetFrequency = function(){
    return this.m_frequencyHz;
};
 
 Box2D.DistanceJoint.prototype.SetFrequency = function(hz){
    this.m_frequencyHz = hz;
};
 
 Box2D.DistanceJoint.prototype.GetDampingRatio = function(){
    return this.m_dampingRatio;
};
 
 Box2D.DistanceJoint.prototype.SetDampingRatio = function(ratio){
    this.m_dampingRatio = ratio;
};
 Box2D.DistanceJoint.prototype.m_localAnchor1 = new Box2D.Vec2();
 Box2D.DistanceJoint.prototype.m_localAnchor2 = new Box2D.Vec2();
 Box2D.DistanceJoint.prototype.m_u = new Box2D.Vec2();
 Box2D.DistanceJoint.prototype.m_frequencyHz = undefined;
 Box2D.DistanceJoint.prototype.m_dampingRatio = undefined;
 Box2D.DistanceJoint.prototype.m_gamma = undefined;
 Box2D.DistanceJoint.prototype.m_bias = undefined;
 Box2D.DistanceJoint.prototype.m_impulse = undefined;
 Box2D.DistanceJoint.prototype.m_mass = undefined;
 Box2D.DistanceJoint.prototype.m_length = undefined;
 
 Box2D.PulleyJointDef = function(){
    Box2D.JointDef.prototype.__varz.call(this);
    this.__varz();
    this.__constructor.apply(this, arguments);
};
 extend(Box2D.PulleyJointDef.prototype, Box2D.JointDef.prototype);
 Box2D.PulleyJointDef.prototype._super = Box2D.JointDef.prototype;
 
 Box2D.PulleyJointDef.prototype.__constructor = function(){
    this._super.__constructor.apply(this, arguments);
    this.type = Box2D.Joint.e_pulleyJoint;
    this.groundAnchorA.Set( - 1, 1);
    this.groundAnchorB.Set(1, 1);
    this.localAnchorA.Set( - 1, 0);
    this.localAnchorB.Set(1, 0);
    this.lengthA = 0;
    this.maxLengthA = 0;
    this.lengthB = 0;
    this.maxLengthB = 0;
    this.ratio = 1;
    this.collideConnected = true;
};
 
 Box2D.PulleyJointDef.prototype.__varz = function(){
    this.groundAnchorA = new Box2D.Vec2();
    this.groundAnchorB = new Box2D.Vec2();
    this.localAnchorA = new Box2D.Vec2();
    this.localAnchorB = new Box2D.Vec2();
};
 
 Box2D.PulleyJointDef.prototype.Initialize = function(bA, bB, gaA, gaB, anchorA, anchorB, r){
    this.bodyA = bA;
    this.bodyB = bB;
    this.groundAnchorA.SetV(gaA);
    this.groundAnchorB.SetV(gaB);
    this.localAnchorA = this.bodyA.GetLocalPoint(anchorA);
    this.localAnchorB = this.bodyB.GetLocalPoint(anchorB);
    var d1X = anchorA.x - gaA.x;
    var d1Y = anchorA.y - gaA.y;
    this.lengthA = Math.sqrt(d1X * d1X + d1Y * d1Y);
    var d2X = anchorB.x - gaB.x;
    var d2Y = anchorB.y - gaB.y;
    this.lengthB = Math.sqrt(d2X * d2X + d2Y * d2Y);
    this.ratio = r;
    var C = this.lengthA + this.ratio * this.lengthB;
    this.maxLengthA = C - this.ratio * Box2D.PulleyJoint.b2_minPulleyLength;
    this.maxLengthB = (C - Box2D.PulleyJoint.b2_minPulleyLength) / this.ratio;
};
 Box2D.PulleyJointDef.prototype.groundAnchorA = new Box2D.Vec2();
 Box2D.PulleyJointDef.prototype.groundAnchorB = new Box2D.Vec2();
 Box2D.PulleyJointDef.prototype.localAnchorA = new Box2D.Vec2();
 Box2D.PulleyJointDef.prototype.localAnchorB = new Box2D.Vec2();
 Box2D.PulleyJointDef.prototype.lengthA = undefined;
 Box2D.PulleyJointDef.prototype.maxLengthA = undefined;
 Box2D.PulleyJointDef.prototype.lengthB = undefined;
 Box2D.PulleyJointDef.prototype.maxLengthB = undefined;
 Box2D.PulleyJointDef.prototype.ratio = undefined;
 
 Box2D.DistanceJointDef = function(){
    Box2D.JointDef.prototype.__varz.call(this);
    this.__varz();
    this.__constructor.apply(this, arguments);
};
 extend(Box2D.DistanceJointDef.prototype, Box2D.JointDef.prototype);
 Box2D.DistanceJointDef.prototype._super = Box2D.JointDef.prototype;
 
 Box2D.DistanceJointDef.prototype.__constructor = function(){
    this._super.__constructor.apply(this, arguments);
    this.type = Box2D.Joint.e_distanceJoint;
    this.length = 1;
    this.frequencyHz = 0;
    this.dampingRatio = 0;
};
 
 Box2D.DistanceJointDef.prototype.__varz = function(){
    this.localAnchorA = new Box2D.Vec2();
    this.localAnchorB = new Box2D.Vec2();
};
 
 Box2D.DistanceJointDef.prototype.Initialize = function(bA, bB, anchorA, anchorB){
    this.bodyA = bA;
    this.bodyB = bB;
    this.localAnchorA.SetV(this.bodyA.GetLocalPoint(anchorA));
    this.localAnchorB.SetV(this.bodyB.GetLocalPoint(anchorB));
    var dX = anchorB.x - anchorA.x;
    var dY = anchorB.y - anchorA.y;
    this.length = Math.sqrt(dX * dX + dY * dY);
    this.frequencyHz = 0;
    this.dampingRatio = 0;
};
 Box2D.DistanceJointDef.prototype.localAnchorA = new Box2D.Vec2();
 Box2D.DistanceJointDef.prototype.localAnchorB = new Box2D.Vec2();
 Box2D.DistanceJointDef.prototype.length = undefined;
 Box2D.DistanceJointDef.prototype.frequencyHz = undefined;
 Box2D.DistanceJointDef.prototype.dampingRatio = undefined;
 
 Box2D.FrictionJointDef = function(){
    Box2D.JointDef.prototype.__varz.call(this);
    this.__varz();
    this.__constructor.apply(this, arguments);
};
 extend(Box2D.FrictionJointDef.prototype, Box2D.JointDef.prototype);
 Box2D.FrictionJointDef.prototype._super = Box2D.JointDef.prototype;
 
 Box2D.FrictionJointDef.prototype.__constructor = function(){
    this._super.__constructor.apply(this, arguments);
    this.type = Box2D.Joint.e_frictionJoint;
    this.maxForce = 0;
    this.maxTorque = 0;
};
 
 Box2D.FrictionJointDef.prototype.__varz = function(){
    this.localAnchorA = new Box2D.Vec2();
    this.localAnchorB = new Box2D.Vec2();
};
 
 Box2D.FrictionJointDef.prototype.Initialize = function(bA, bB, anchor){
    this.bodyA = bA;
    this.bodyB = bB;
    this.localAnchorA.SetV(this.bodyA.GetLocalPoint(anchor));
    this.localAnchorB.SetV(this.bodyB.GetLocalPoint(anchor));
};
 Box2D.FrictionJointDef.prototype.localAnchorA = new Box2D.Vec2();
 Box2D.FrictionJointDef.prototype.localAnchorB = new Box2D.Vec2();
 Box2D.FrictionJointDef.prototype.maxForce = undefined;
 Box2D.FrictionJointDef.prototype.maxTorque = undefined;
 
 Box2D.WeldJointDef = function(){
    Box2D.JointDef.prototype.__varz.call(this);
    this.__varz();
    this.__constructor.apply(this, arguments);
};
 extend(Box2D.WeldJointDef.prototype, Box2D.JointDef.prototype);
 Box2D.WeldJointDef.prototype._super = Box2D.JointDef.prototype;
 
 Box2D.WeldJointDef.prototype.__constructor = function(){
    this._super.__constructor.apply(this, arguments);
    this.type = Box2D.Joint.e_weldJoint;
    this.referenceAngle = 0;
};
 
 Box2D.WeldJointDef.prototype.__varz = function(){
    this.localAnchorA = new Box2D.Vec2();
    this.localAnchorB = new Box2D.Vec2();
};
 
 Box2D.WeldJointDef.prototype.Initialize = function(bA, bB, anchor){
    this.bodyA = bA;
    this.bodyB = bB;
    this.localAnchorA.SetV(this.bodyA.GetLocalPoint(anchor));
    this.localAnchorB.SetV(this.bodyB.GetLocalPoint(anchor));
    this.referenceAngle = this.bodyB.GetAngle() - this.bodyA.GetAngle();
};
 Box2D.WeldJointDef.prototype.localAnchorA = new Box2D.Vec2();
 Box2D.WeldJointDef.prototype.localAnchorB = new Box2D.Vec2();
 Box2D.WeldJointDef.prototype.referenceAngle = undefined;
 
 Box2D.GearJointDef = function(){
    Box2D.JointDef.prototype.__varz.call(this);
    this.__varz();
    this.__constructor.apply(this, arguments);
};
 extend(Box2D.GearJointDef.prototype, Box2D.JointDef.prototype);
 Box2D.GearJointDef.prototype._super = Box2D.JointDef.prototype;
 
 Box2D.GearJointDef.prototype.__constructor = function(){
    this._super.__constructor.apply(this, arguments);
    this.type = Box2D.Joint.e_gearJoint;
    this.joint1 = undefined;
    this.joint2 = undefined;
    this.ratio = 1;
};
 
 Box2D.GearJointDef.prototype.__varz = function(){
};
Box2D.GearJointDef.prototype.joint1 = undefined;
 Box2D.GearJointDef.prototype.joint2 = undefined;
 Box2D.GearJointDef.prototype.ratio = undefined;
 
 Box2D.Color = function(){
    this.__varz();
    this.__constructor.apply(this, arguments);
};
 
 Box2D.Color.prototype.__constructor = function(rr, gg, bb){
    this._r = parseInt(255 * Box2D.Math.Clamp(rr, 0, 1), 10);
    this._g = parseInt(255 * Box2D.Math.Clamp(gg, 0, 1), 10);
    this._b = parseInt(255 * Box2D.Math.Clamp(bb, 0, 1), 10);
};
 
 Box2D.Color.prototype.__varz = function(){
};
 Box2D.Color.prototype.Set = function(rr, gg, bb){
    this._r = parseInt(255 * Box2D.Math.Clamp(rr, 0, 1), 10);
    this._g = parseInt(255 * Box2D.Math.Clamp(gg, 0, 1), 10);
    this._b = parseInt(255 * Box2D.Math.Clamp(bb, 0, 1), 10);
};
 Box2D.Color.prototype.__defineGetter__("r", function(){
    return this._r;
});
 Box2D.Color.prototype.__defineSetter__("r", function(rr){
    this._r = parseInt(255 * Box2D.Math.Clamp(rr, 0, 1), 10);
});
 Box2D.Color.prototype.__defineGetter__("g", function(){
    return this._g;
});
 Box2D.Color.prototype.__defineSetter__("g", function(gg){
    this._g = parseInt(255 * Box2D.Math.Clamp(gg, 0, 1), 10);
});
 Box2D.Color.prototype.__defineGetter__("b", function(){
    return this._b;
});
 Box2D.Color.prototype.__defineSetter__("b", function(bb){
    this._b = parseInt(255 * Box2D.Math.Clamp(bb, 0, 1), 10);
});
 Box2D.Color.prototype.__defineGetter__("color", function(){
    return this._r << 16 | this._g << 8 | this._b;
});
 Box2D.Color.prototype._r = 0;
 Box2D.Color.prototype._g = 0;
 Box2D.Color.prototype._b = 0;
 
 Box2D.FrictionJoint = function(){
    Box2D.Joint.prototype.__varz.call(this);
    this.__varz();
    this.__constructor.apply(this, arguments);
};
 extend(Box2D.FrictionJoint.prototype, Box2D.Joint.prototype);
 Box2D.FrictionJoint.prototype._super = Box2D.Joint.prototype;
 
 Box2D.FrictionJoint.prototype.__constructor = function(def){
    this._super.__constructor.apply(this,[def]);
    this.m_localAnchorA.SetV(def.localAnchorA);
    this.m_localAnchorB.SetV(def.localAnchorB);
    this.m_linearMass.SetZero();
    this.m_angularMass = 0;
    this.m_linearImpulse.SetZero();
    this.m_angularImpulse = 0;
    this.m_maxForce = def.maxForce;
    this.m_maxTorque = def.maxTorque;
};
 
 Box2D.FrictionJoint.prototype.__varz = function(){
    this.m_localAnchorA = new Box2D.Vec2();
    this.m_localAnchorB = new Box2D.Vec2();
    this.m_linearImpulse = new Box2D.Vec2();
    this.m_linearMass = new Box2D.Mat22();
};
 
 Box2D.FrictionJoint.prototype.InitVelocityConstraints = function(step){
    var tMat;
    var tX;
    var bA = this.m_bodyA;
    var bB = this.m_bodyB;
    tMat = bA.m_xf.R;
    var rAX = this.m_localAnchorA.x - bA.m_sweep.localCenter.x;
    var rAY = this.m_localAnchorA.y - bA.m_sweep.localCenter.y;
    tX = tMat.col1.x * rAX + tMat.col2.x * rAY;
    rAY = tMat.col1.y * rAX + tMat.col2.y * rAY;
    rAX = tX;
    tMat = bB.m_xf.R;
    var rBX = this.m_localAnchorB.x - bB.m_sweep.localCenter.x;
    var rBY = this.m_localAnchorB.y - bB.m_sweep.localCenter.y;
    tX = tMat.col1.x * rBX + tMat.col2.x * rBY;
    rBY = tMat.col1.y * rBX + tMat.col2.y * rBY;
    rBX = tX;
    var mA = bA.m_invMass;
    var mB = bB.m_invMass;
    var iA = bA.m_invI;
    var iB = bB.m_invI;
    var K = new Box2D.Mat22();
    K.col1.x = mA + mB;
    K.col2.x = 0;
    K.col1.y = 0;
    K.col2.y = mA + mB;
    K.col1.x += iA * rAY * rAY;
    K.col2.x += - iA * rAX * rAY;
    K.col1.y += - iA * rAX * rAY;
    K.col2.y += iA * rAX * rAX;
    K.col1.x += iB * rBY * rBY;
    K.col2.x += - iB * rBX * rBY;
    K.col1.y += - iB * rBX * rBY;
    K.col2.y += iB * rBX * rBX;
    K.GetInverse(this.m_linearMass);
    this.m_angularMass = iA + iB;
    if (this.m_angularMass > 0){
        this.m_angularMass = 1 / this.m_angularMass;
    }
    if (step.warmStarting){
        this.m_linearImpulse.x *= step.dtRatio;
        this.m_linearImpulse.y *= step.dtRatio;
        this.m_angularImpulse *= step.dtRatio;
        var P = this.m_linearImpulse;
        bA.m_linearVelocity.x -= mA * P.x;
        bA.m_linearVelocity.y -= mA * P.y;
        bA.m_angularVelocity -= iA * (rAX * P.y - rAY * P.x + this.m_angularImpulse);
        bB.m_linearVelocity.x += mB * P.x;
        bB.m_linearVelocity.y += mB * P.y;
        bB.m_angularVelocity += iB * (rBX * P.y - rBY * P.x + this.m_angularImpulse);
    }
    else {
        this.m_linearImpulse.SetZero();
        this.m_angularImpulse = 0;
    }
};
 
 Box2D.FrictionJoint.prototype.SolveVelocityConstraints = function(step){
    var tMat;
    var tX;
    var bA = this.m_bodyA;
    var bB = this.m_bodyB;
    var vA = bA.m_linearVelocity;
    var wA = bA.m_angularVelocity;
    var vB = bB.m_linearVelocity;
    var wB = bB.m_angularVelocity;
    var mA = bA.m_invMass;
    var mB = bB.m_invMass;
    var iA = bA.m_invI;
    var iB = bB.m_invI;
    tMat = bA.m_xf.R;
    var rAX = this.m_localAnchorA.x - bA.m_sweep.localCenter.x;
    var rAY = this.m_localAnchorA.y - bA.m_sweep.localCenter.y;
    tX = tMat.col1.x * rAX + tMat.col2.x * rAY;
    rAY = tMat.col1.y * rAX + tMat.col2.y * rAY;
    rAX = tX;
    tMat = bB.m_xf.R;
    var rBX = this.m_localAnchorB.x - bB.m_sweep.localCenter.x;
    var rBY = this.m_localAnchorB.y - bB.m_sweep.localCenter.y;
    tX = tMat.col1.x * rBX + tMat.col2.x * rBY;
    rBY = tMat.col1.y * rBX + tMat.col2.y * rBY;
    rBX = tX;
    var maxImpulse;
    var Cdot = wB - wA;
    var impulse = - this.m_angularMass * Cdot;
    var oldImpulse = this.m_angularImpulse;
    maxImpulse = step.dt * this.m_maxTorque;
    this.m_angularImpulse = Box2D.Math.Clamp(this.m_angularImpulse + impulse, - maxImpulse, maxImpulse);
    impulse = this.m_angularImpulse - oldImpulse;
    wA -= iA * impulse;
    wB += iB * impulse;
    var CdotX = vB.x - wB * rBY - vA.x + wA * rAY;
    var CdotY = vB.y + wB * rBX - vA.y - wA * rAX;
    var impulseV = Box2D.Math.MulMV(this.m_linearMass, new Box2D.Vec2( - CdotX, - CdotY));
    var oldImpulseV = this.m_linearImpulse.Copy();
    this.m_linearImpulse.Add(impulseV);
    maxImpulse = step.dt * this.m_maxForce;
    if (this.m_linearImpulse.LengthSquared() > maxImpulse * maxImpulse){
        this.m_linearImpulse.Normalize();
        this.m_linearImpulse.Multiply(maxImpulse);
    }
    impulseV = Box2D.Math.SubtractVV(this.m_linearImpulse, oldImpulseV);
    vA.x -= mA * impulseV.x;
    vA.y -= mA * impulseV.y;
    wA -= iA * (rAX * impulseV.y - rAY * impulseV.x);
    vB.x += mB * impulseV.x;
    vB.y += mB * impulseV.y;
    wB += iB * (rBX * impulseV.y - rBY * impulseV.x);
    bA.m_angularVelocity = wA;
    bB.m_angularVelocity = wB;
};
 
 Box2D.FrictionJoint.prototype.SolvePositionConstraints = function(baumgarte){
    return true;
};
 
 Box2D.FrictionJoint.prototype.GetAnchorA = function(){
    return this.m_bodyA.GetWorldPoint(this.m_localAnchorA);
};
 
 Box2D.FrictionJoint.prototype.GetAnchorB = function(){
    return this.m_bodyB.GetWorldPoint(this.m_localAnchorB);
};
 
 Box2D.FrictionJoint.prototype.GetReactionForce = function(inv_dt){
    return new Box2D.Vec2(inv_dt * this.m_linearImpulse.x, inv_dt * this.m_linearImpulse.y);
};
 
 Box2D.FrictionJoint.prototype.GetReactionTorque = function(inv_dt){
    return inv_dt * this.m_angularImpulse;
};
 
 Box2D.FrictionJoint.prototype.SetMaxForce = function(force){
    this.m_maxForce = force;
};
 
 Box2D.FrictionJoint.prototype.GetMaxForce = function(){
    return this.m_maxForce;
};
 
 Box2D.FrictionJoint.prototype.SetMaxTorque = function(torque){
    this.m_maxTorque = torque;
};
 
 Box2D.FrictionJoint.prototype.GetMaxTorque = function(){
    return this.m_maxTorque;
};
 Box2D.FrictionJoint.prototype.m_localAnchorA = new Box2D.Vec2();
 Box2D.FrictionJoint.prototype.m_localAnchorB = new Box2D.Vec2();
 Box2D.FrictionJoint.prototype.m_linearImpulse = new Box2D.Vec2();
 Box2D.FrictionJoint.prototype.m_angularImpulse = undefined;
 Box2D.FrictionJoint.prototype.m_maxForce = undefined;
 Box2D.FrictionJoint.prototype.m_maxTorque = undefined;
 Box2D.FrictionJoint.prototype.m_linearMass = new Box2D.Mat22();
 Box2D.FrictionJoint.prototype.m_angularMass = undefined;
 
 Box2D.Distance = function(){
    this.__varz();
    this.__constructor.apply(this, arguments);
};
 
 Box2D.Distance.prototype.__constructor = function(){
};
 Box2D.Distance.prototype.__varz = function(){
};
 Box2D.Distance.Distance = function(output, cache, input){
    ++ Box2D.Distance.b2_gjkCalls;
    var proxyA = input.proxyA;
    var proxyB = input.proxyB;
    var transformA = input.transformA;
    var transformB = input.transformB;
    var simplex = Box2D.Distance.s_simplex;
    simplex.ReadCache(cache, proxyA, transformA, proxyB, transformB);
    var vertices = simplex.m_vertices;
    var k_maxIters = 20;
    var saveA = Box2D.Distance.s_saveA;
    var saveB = Box2D.Distance.s_saveB;
    var saveCount = 0;
    var closestPoint = simplex.GetClosestPoint();
    var distanceSqr1 = closestPoint.LengthSquared();
    var distanceSqr2 = distanceSqr1;
    var i = 0;
    var p;
    var iter = 0;
    while (iter < k_maxIters){
        saveCount = simplex.m_count;
        for (i = 0;i < saveCount;i++){
            saveA[i] = vertices[i].indexA;
            saveB[i] = vertices[i].indexB;
        }
        switch (simplex.m_count){
            case 1: 
                break;
            case 2: 
                simplex.Solve2();
                break;
            case 3: 
                simplex.Solve3();
                break;
            default: 
                Box2D.Settings.b2Assert(false);
        }
        if (simplex.m_count == 3){
            break;
        }
        p = simplex.GetClosestPoint();
        distanceSqr2 = p.LengthSquared();
        if (distanceSqr2 > distanceSqr1){
        }
        distanceSqr1 = distanceSqr2;
        var d = simplex.GetSearchDirection();
        if (d.LengthSquared() < Number.MIN_VALUE * Number.MIN_VALUE){
            break;
        }
        var vertex = vertices[simplex.m_count];
        vertex.indexA = proxyA.GetSupport(Box2D.Math.MulTMV(transformA.R, d.GetNegative()));
        vertex.wA = Box2D.Math.MulX(transformA, proxyA.GetVertex(vertex.indexA));
        vertex.indexB = proxyB.GetSupport(Box2D.Math.MulTMV(transformB.R, d));
        vertex.wB = Box2D.Math.MulX(transformB, proxyB.GetVertex(vertex.indexB));
        vertex.w = Box2D.Math.SubtractVV(vertex.wB, vertex.wA);
        ++iter;
        ++ Box2D.Distance.b2_gjkIters;
        var duplicate = false;
        for (i = 0;i < saveCount;i++){
            if (vertex.indexA == saveA[i] && vertex.indexB == saveB[i]){
                duplicate = true;
                break;
            }
        }
        if (duplicate){
            break;
        }
        ++ simplex.m_count;
    }
    Box2D.Distance.b2_gjkMaxIters = Box2D.Math.Max(Box2D.Distance.b2_gjkMaxIters, iter);
    simplex.GetWitnessPoints(output.pointA, output.pointB);
    output.distance = Box2D.Math.SubtractVV(output.pointA, output.pointB).Length();
    output.iterations = iter;
    simplex.WriteCache(cache);
    if (input.useRadii){
        var rA = proxyA.m_radius;
        var rB = proxyB.m_radius;
        if (output.distance > rA + rB && output.distance > Number.MIN_VALUE){
            output.distance -= rA + rB;
            var normal = Box2D.Math.SubtractVV(output.pointB, output.pointA);
            normal.Normalize();
            output.pointA.x += rA * normal.x;
            output.pointA.y += rA * normal.y;
            output.pointB.x -= rB * normal.x;
            output.pointB.y -= rB * normal.y;
        }
        else {
            p = new Box2D.Vec2();
            p.x = 0.5 * (output.pointA.x + output.pointB.x);
            p.y = 0.5 * (output.pointA.y + output.pointB.y);
            output.pointA.x = output.pointB.x = p.x;
            output.pointA.y = output.pointB.y = p.y;
            output.distance = 0;
        }
    }
};
 Box2D.Distance.b2_gjkCalls = 0;
 Box2D.Distance.b2_gjkIters = 0;
 Box2D.Distance.b2_gjkMaxIters = 0;
 Box2D.Distance.s_simplex = new Box2D.Simplex();
 Box2D.Distance.s_saveA =[];
 Box2D.Distance.s_saveB =[];
 
 Box2D.MouseJoint = function(){
    Box2D.Joint.prototype.__varz.call(this);
    this.__varz();
    this.__constructor.apply(this, arguments);
};
 extend(Box2D.MouseJoint.prototype, Box2D.Joint.prototype);
 Box2D.MouseJoint.prototype._super = Box2D.Joint.prototype;
 
 Box2D.MouseJoint.prototype.__constructor = function(def){
    this._super.__constructor.apply(this,[def]);
    this.m_target.SetV(def.target);
    var tX = this.m_target.x - this.m_bodyB.m_xf.position.x;
    var tY = this.m_target.y - this.m_bodyB.m_xf.position.y;
    var tMat = this.m_bodyB.m_xf.R;
    this.m_localAnchor.x = tX * tMat.col1.x + tY * tMat.col1.y;
    this.m_localAnchor.y = tX * tMat.col2.x + tY * tMat.col2.y;
    this.m_maxForce = def.maxForce;
    this.m_impulse.SetZero();
    this.m_frequencyHz = def.frequencyHz;
    this.m_dampingRatio = def.dampingRatio;
    this.m_beta = 0;
    this.m_gamma = 0;
};
 
 Box2D.MouseJoint.prototype.__varz = function()    {
    this.K = new Box2D.Mat22();
    this.K1 = new Box2D.Mat22();
    this.K2 = new Box2D.Mat22();
    this.m_localAnchor = new Box2D.Vec2();
    this.m_target = new Box2D.Vec2();
    this.m_impulse = new Box2D.Vec2();
    this.m_mass = new Box2D.Mat22();
    this.m_C = new Box2D.Vec2();
};
 
 Box2D.MouseJoint.prototype.InitVelocityConstraints = function(step){
    var b = this.m_bodyB;
    var mass = b.GetMass();
    var omega = 2 * Math.PI * this.m_frequencyHz;
    var d = 2 * mass * this.m_dampingRatio * omega;
    var k = mass * omega * omega;
    this.m_gamma = step.dt * (d + step.dt * k);
    this.m_gamma = this.m_gamma !== 0 ? 1 / this.m_gamma: 0;
    this.m_beta = step.dt * k * this.m_gamma;
    var tMat;
    tMat = b.m_xf.R;
    var rX = this.m_localAnchor.x - b.m_sweep.localCenter.x;
    var rY = this.m_localAnchor.y - b.m_sweep.localCenter.y;
    var tX = tMat.col1.x * rX + tMat.col2.x * rY;
    rY = tMat.col1.y * rX + tMat.col2.y * rY;
    rX = tX;
    var invMass = b.m_invMass;
    var invI = b.m_invI;
    this.K1.col1.x = invMass;
    this.K1.col2.x = 0;
    this.K1.col1.y = 0;
    this.K1.col2.y = invMass;
    this.K2.col1.x = invI * rY * rY;
    this.K2.col2.x = - invI * rX * rY;
    this.K2.col1.y = - invI * rX * rY;
    this.K2.col2.y = invI * rX * rX;
    this.K.SetM(this.K1);
    this.K.AddM(this.K2);
    this.K.col1.x += this.m_gamma;
    this.K.col2.y += this.m_gamma;
    this.K.GetInverse(this.m_mass);
    this.m_C.x = b.m_sweep.c.x + rX - this.m_target.x;
    this.m_C.y = b.m_sweep.c.y + rY - this.m_target.y;
    b.m_angularVelocity *= 0.98;
    this.m_impulse.x *= step.dtRatio;
    this.m_impulse.y *= step.dtRatio;
    b.m_linearVelocity.x += invMass * this.m_impulse.x;
    b.m_linearVelocity.y += invMass * this.m_impulse.y;
    b.m_angularVelocity += invI * (rX * this.m_impulse.y - rY * this.m_impulse.x);
};
 
 Box2D.MouseJoint.prototype.SolveVelocityConstraints = function(step){
    var b = this.m_bodyB;
    var tMat;
    var tX;
    var tY;
    tMat = b.m_xf.R;
    var rX = this.m_localAnchor.x - b.m_sweep.localCenter.x;
    var rY = this.m_localAnchor.y - b.m_sweep.localCenter.y;
    tX = tMat.col1.x * rX + tMat.col2.x * rY;
    rY = tMat.col1.y * rX + tMat.col2.y * rY;
    rX = tX;
    var CdotX = b.m_linearVelocity.x + - b.m_angularVelocity * rY;
    var CdotY = b.m_linearVelocity.y + b.m_angularVelocity * rX;
    tMat = this.m_mass;
    tX = CdotX + this.m_beta * this.m_C.x + this.m_gamma * this.m_impulse.x;
    tY = CdotY + this.m_beta * this.m_C.y + this.m_gamma * this.m_impulse.y;
    var impulseX = - (tMat.col1.x * tX + tMat.col2.x * tY);
    var impulseY = - (tMat.col1.y * tX + tMat.col2.y * tY);
    var oldImpulseX = this.m_impulse.x;
    var oldImpulseY = this.m_impulse.y;
    this.m_impulse.x += impulseX;
    this.m_impulse.y += impulseY;
    var maxImpulse = step.dt * this.m_maxForce;
    if (this.m_impulse.LengthSquared() > maxImpulse * maxImpulse){
        this.m_impulse.Multiply(maxImpulse / this.m_impulse.Length());
    }
    impulseX = this.m_impulse.x - oldImpulseX;
    impulseY = this.m_impulse.y - oldImpulseY;
    b.m_linearVelocity.x += b.m_invMass * impulseX;
    b.m_linearVelocity.y += b.m_invMass * impulseY;
    b.m_angularVelocity += b.m_invI * (rX * impulseY - rY * impulseX);
};
 
 Box2D.MouseJoint.prototype.SolvePositionConstraints = function(baumgarte){
    return true;
};
 
 Box2D.MouseJoint.prototype.GetAnchorA = function(){
    return this.m_target;
};
 
 Box2D.MouseJoint.prototype.GetAnchorB = function(){
    return this.m_bodyB.GetWorldPoint(this.m_localAnchor);
};
 
 Box2D.MouseJoint.prototype.GetReactionForce = function(inv_dt){
    return new Box2D.Vec2(inv_dt * this.m_impulse.x, inv_dt * this.m_impulse.y);
};
 
 Box2D.MouseJoint.prototype.GetReactionTorque = function(inv_dt){
    return 0;
};
 
 Box2D.MouseJoint.prototype.GetTarget = function(){
    return this.m_target;
};
 
 Box2D.MouseJoint.prototype.SetTarget = function(target){
    if (this.m_bodyB.IsAwake() === false){
        this.m_bodyB.SetAwake(true);
    }
    this.m_target = target;
};
 
 Box2D.MouseJoint.prototype.GetMaxForce = function(){
    return this.m_maxForce;
};
 
 Box2D.MouseJoint.prototype.SetMaxForce = function(maxForce){
    this.m_maxForce = maxForce;
};
 
 Box2D.MouseJoint.prototype.GetFrequency = function(){
    return this.m_frequencyHz;
};
 
 Box2D.MouseJoint.prototype.SetFrequency = function(hz){
    this.m_frequencyHz = hz;
};
 
 Box2D.MouseJoint.prototype.GetDampingRatio = function(){
    return this.m_dampingRatio;
};
 
 Box2D.MouseJoint.prototype.SetDampingRatio = function(ratio){
    this.m_dampingRatio = ratio;
};
 Box2D.MouseJoint.prototype.K = new Box2D.Mat22();
 Box2D.MouseJoint.prototype.K1 = new Box2D.Mat22();
 Box2D.MouseJoint.prototype.K2 = new Box2D.Mat22();
 Box2D.MouseJoint.prototype.m_localAnchor = new Box2D.Vec2();
 Box2D.MouseJoint.prototype.m_target = new Box2D.Vec2();
 Box2D.MouseJoint.prototype.m_impulse = new Box2D.Vec2();
 Box2D.MouseJoint.prototype.m_mass = new Box2D.Mat22();
 Box2D.MouseJoint.prototype.m_C = new Box2D.Vec2();
 Box2D.MouseJoint.prototype.m_maxForce = undefined;
 Box2D.MouseJoint.prototype.m_frequencyHz = undefined;
 Box2D.MouseJoint.prototype.m_dampingRatio = undefined;
 Box2D.MouseJoint.prototype.m_beta = undefined;
 Box2D.MouseJoint.prototype.m_gamma = undefined;
 
 Box2D.PrismaticJointDef = function(){
    Box2D.JointDef.prototype.__varz.call(this);
    this.__varz();
    this.__constructor.apply(this, arguments);
};
 extend(Box2D.PrismaticJointDef.prototype, Box2D.JointDef.prototype);
 Box2D.PrismaticJointDef.prototype._super = Box2D.JointDef.prototype;
 
 Box2D.PrismaticJointDef.prototype.__constructor = function(){
    this._super.__constructor.apply(this, arguments);
    this.type = Box2D.Joint.e_prismaticJoint;
    this.localAxisA.Set(1, 0);
    this.referenceAngle = 0;
    this.enableLimit = false;
    this.lowerTranslation = 0;
    this.upperTranslation = 0;
    this.enableMotor = false;
    this.maxMotorForce = 0;
    this.motorSpeed = 0;
};
 
 Box2D.PrismaticJointDef.prototype.__varz = function(){
    this.localAnchorA = new Box2D.Vec2();
    this.localAnchorB = new Box2D.Vec2();
    this.localAxisA = new Box2D.Vec2();
};
 
 Box2D.PrismaticJointDef.prototype.Initialize = function(bA, bB, anchor, axis){
    this.bodyA = bA;
    this.bodyB = bB;
    this.localAnchorA = this.bodyA.GetLocalPoint(anchor);
    this.localAnchorB = this.bodyB.GetLocalPoint(anchor);
    this.localAxisA = this.bodyA.GetLocalVector(axis);
    this.referenceAngle = this.bodyB.GetAngle() - this.bodyA.GetAngle();
};
 Box2D.PrismaticJointDef.prototype.localAnchorA = new Box2D.Vec2();
 Box2D.PrismaticJointDef.prototype.localAnchorB = new Box2D.Vec2();
 Box2D.PrismaticJointDef.prototype.localAxisA = new Box2D.Vec2();
 Box2D.PrismaticJointDef.prototype.referenceAngle = undefined;
 Box2D.PrismaticJointDef.prototype.enableLimit = undefined;
 Box2D.PrismaticJointDef.prototype.lowerTranslation = undefined;
 Box2D.PrismaticJointDef.prototype.upperTranslation = undefined;
 Box2D.PrismaticJointDef.prototype.enableMotor = undefined;
 Box2D.PrismaticJointDef.prototype.maxMotorForce = undefined;
 Box2D.PrismaticJointDef.prototype.motorSpeed = undefined;
 
 Box2D.TimeOfImpact = function(){
    this.__varz();
    this.__constructor.apply(this, arguments);
};
 
 Box2D.TimeOfImpact.prototype.__constructor = function(){
};
 Box2D.TimeOfImpact.prototype.__varz = function(){
};
 Box2D.TimeOfImpact.TimeOfImpact = function(input){
    ++ Box2D.TimeOfImpact.b2_toiCalls;
    var proxyA = input.proxyA;
    var proxyB = input.proxyB;
    var sweepA = input.sweepA;
    var sweepB = input.sweepB;
    Box2D.Settings.b2Assert(sweepA.t0 == sweepB.t0);
    Box2D.Settings.b2Assert(1 - sweepA.t0 > Number.MIN_VALUE);
    var radius = proxyA.m_radius + proxyB.m_radius;
    var tolerance = input.tolerance;
    var alpha = 0;
    var k_maxIterations = 1E3;
    var iter = 0;
    var target = 0;
    Box2D.TimeOfImpact.s_cache.count = 0;
    Box2D.TimeOfImpact.s_distanceInput.useRadii = false;
    for (;;){
        sweepA.GetTransform(Box2D.TimeOfImpact.s_xfA, alpha);
        sweepB.GetTransform(Box2D.TimeOfImpact.s_xfB, alpha);
        Box2D.TimeOfImpact.s_distanceInput.proxyA = proxyA;
        Box2D.TimeOfImpact.s_distanceInput.proxyB = proxyB;
        Box2D.TimeOfImpact.s_distanceInput.transformA = Box2D.TimeOfImpact.s_xfA;
        Box2D.TimeOfImpact.s_distanceInput.transformB = Box2D.TimeOfImpact.s_xfB;
        Box2D.Distance.Distance(Box2D.TimeOfImpact.s_distanceOutput, Box2D.TimeOfImpact.s_cache, Box2D.TimeOfImpact.s_distanceInput);
        if (Box2D.TimeOfImpact.s_distanceOutput.distance <= 0){
            alpha = 1;
            break;
        }
        Box2D.TimeOfImpact.s_fcn.Initialize(Box2D.TimeOfImpact.s_cache, proxyA, Box2D.TimeOfImpact.s_xfA, proxyB, Box2D.TimeOfImpact.s_xfB);
        var separation = Box2D.TimeOfImpact.s_fcn.Evaluate(Box2D.TimeOfImpact.s_xfA, Box2D.TimeOfImpact.s_xfB);
        if (separation <= 0){
            alpha = 1;
            break;
        }
        if (iter === 0){
            if (separation > radius){
                target = Box2D.Math.Max(radius - tolerance, 0.75 * radius);
            }
            else {
                target = Box2D.Math.Max(separation - tolerance, 0.02 * radius);
            }
        }
        if (separation - target < 0.5 * tolerance){
            if (iter === 0){
                alpha = 1;
                break;
            }
            break;
        }
        var newAlpha = alpha;
        var x1 = alpha;
        var x2 = 1;
        var f1 = separation;
        sweepA.GetTransform(Box2D.TimeOfImpact.s_xfA, x2);
        sweepB.GetTransform(Box2D.TimeOfImpact.s_xfB, x2);
        var f2 = Box2D.TimeOfImpact.s_fcn.Evaluate(Box2D.TimeOfImpact.s_xfA, Box2D.TimeOfImpact.s_xfB);
        if (f2 >= target){
            alpha = 1;
            break;
        }
        var rootIterCount = 0;
        for (;;){
            var x;
            if (rootIterCount & 1){
                x = x1 + (target - f1) * (x2 - x1) / (f2 - f1);
            }
            else {
                x = 0.5 * (x1 + x2);
            }
            sweepA.GetTransform(Box2D.TimeOfImpact.s_xfA, x);
            sweepB.GetTransform(Box2D.TimeOfImpact.s_xfB, x);
            var f = Box2D.TimeOfImpact.s_fcn.Evaluate(Box2D.TimeOfImpact.s_xfA, Box2D.TimeOfImpact.s_xfB);
            if (Box2D.Math.Abs(f - target) < 0.025 * tolerance){
                newAlpha = x;
                break;
            }
            if (f > target){
                x1 = x;
                f1 = f;
            }
            else {
                x2 = x;
                f2 = f;
            }
            ++ rootIterCount;
            ++ Box2D.TimeOfImpact.b2_toiRootIters;
            if (rootIterCount == 50){
                break;
            }
        }
        Box2D.TimeOfImpact.b2_toiMaxRootIters = Box2D.Math.Max(Box2D.TimeOfImpact.b2_toiMaxRootIters, 
           rootIterCount);
        if (newAlpha < (1 + 100 * Number.MIN_VALUE) * alpha){
            break;
        }
        alpha = newAlpha;
        iter++;
        ++ Box2D.TimeOfImpact.b2_toiIters;
        if (iter == k_maxIterations){
            break;
        }
    }
    Box2D.TimeOfImpact.b2_toiMaxIters = Box2D.Math.Max(Box2D.TimeOfImpact.b2_toiMaxIters, iter);
    return alpha;
};
 Box2D.TimeOfImpact.b2_toiCalls = 0;
 Box2D.TimeOfImpact.b2_toiIters = 0;
 Box2D.TimeOfImpact.b2_toiMaxIters = 0;
 Box2D.TimeOfImpact.b2_toiRootIters = 0;
 Box2D.TimeOfImpact.b2_toiMaxRootIters = 0;
 Box2D.TimeOfImpact.s_cache = new Box2D.SimplexCache();
 Box2D.TimeOfImpact.s_distanceInput = new Box2D.DistanceInput();
 Box2D.TimeOfImpact.s_xfA = new Box2D.Transform();
 Box2D.TimeOfImpact.s_xfB = new Box2D.Transform();
 Box2D.TimeOfImpact.s_fcn = new Box2D.SeparationFunction();
 Box2D.TimeOfImpact.s_distanceOutput = new Box2D.DistanceOutput();
 
 Box2D.GearJoint = function(){
    Box2D.Joint.prototype.__varz.call(this);
    this.__varz();
    this.__constructor.apply(this, arguments);
};
 extend(Box2D.GearJoint.prototype, Box2D.Joint.prototype);
 Box2D.GearJoint.prototype._super = Box2D.Joint.prototype;
 
 Box2D.GearJoint.prototype.__constructor = function(def){
    this._super.__constructor.apply(this,[def]);
    var type1 = def.joint1.m_type;
    var type2 = def.joint2.m_type;
    this.m_revolute1 = undefined;
    this.m_prismatic1 = undefined;
    this.m_revolute2 = undefined;
    this.m_prismatic2 = undefined;
    var coordinate1;
    var coordinate2;
    this.m_ground1 = def.joint1.GetBodyA();
    this.m_bodyA = def.joint1.GetBodyB();
    if (type1 == Box2D.Joint.e_revoluteJoint){
        this.m_revolute1 = def.joint1;
        this.m_groundAnchor1.SetV(this.m_revolute1.m_localAnchor1);
        this.m_localAnchor1.SetV(this.m_revolute1.m_localAnchor2);
        coordinate1 = this.m_revolute1.GetJointAngle();
    }
    else {
        this.m_prismatic1 = def.joint1;
        this.m_groundAnchor1.SetV(this.m_prismatic1.m_localAnchor1);
        this.m_localAnchor1.SetV(this.m_prismatic1.m_localAnchor2);
        coordinate1 = this.m_prismatic1.GetJointTranslation();
    }
    this.m_ground2 = def.joint2.GetBodyA();
    this.m_bodyB = def.joint2.GetBodyB();
    if (type2 == Box2D.Joint.e_revoluteJoint){
        this.m_revolute2 = def.joint2;
        this.m_groundAnchor2.SetV(this.m_revolute2.m_localAnchor1);
        this.m_localAnchor2.SetV(this.m_revolute2.m_localAnchor2);
        coordinate2 = this.m_revolute2.GetJointAngle();
    }
    else {
        this.m_prismatic2 = def.joint2;
        this.m_groundAnchor2.SetV(this.m_prismatic2.m_localAnchor1);
        this.m_localAnchor2.SetV(this.m_prismatic2.m_localAnchor2);
        coordinate2 = this.m_prismatic2.GetJointTranslation();
    }
    this.m_ratio = def.ratio;
    this.m_constant = coordinate1 + this.m_ratio * coordinate2;
    this.m_impulse = 0;
};
 
 Box2D.GearJoint.prototype.__varz = function(){
    this.m_groundAnchor1 = new Box2D.Vec2();
    this.m_groundAnchor2 = new Box2D.Vec2();
    this.m_localAnchor1 = new Box2D.Vec2();
    this.m_localAnchor2 = new Box2D.Vec2();
    this.m_J = new Box2D.Jacobian();
};
 
 Box2D.GearJoint.prototype.InitVelocityConstraints = function(step){
    var g1 = this.m_ground1;
    var g2 = this.m_ground2;
    var bA = this.m_bodyA;
    var bB = this.m_bodyB;
    var ugX;
    var ugY;
    var rX;
    var rY;
    var tMat;
    var tVec;
    var crug;
    var tX;
    var K = 0;
    this.m_J.SetZero();
    if (this.m_revolute1){
        this.m_J.angularA = - 1;
        K += bA.m_invI;
    }
    else {
        tMat = g1.m_xf.R;
        tVec = this.m_prismatic1.m_localXAxis1;
        ugX = tMat.col1.x * tVec.x + tMat.col2.x * tVec.y;
        ugY = tMat.col1.y * tVec.x + tMat.col2.y * tVec.y;
        tMat = bA.m_xf.R;
        rX = this.m_localAnchor1.x - bA.m_sweep.localCenter.x;
        rY = this.m_localAnchor1.y - bA.m_sweep.localCenter.y;
        tX = tMat.col1.x * rX + tMat.col2.x * rY;
        rY = tMat.col1.y * rX + tMat.col2.y * rY;
        rX = tX;
        crug = rX * ugY - rY * ugX;
        this.m_J.linearA.Set( - ugX, - ugY);
        this.m_J.angularA = - crug;
        K += bA.m_invMass + bA.m_invI * crug * crug;
    }
    if (this.m_revolute2){
        this.m_J.angularB = - this.m_ratio;
        K += this.m_ratio * this.m_ratio * bB.m_invI;
    }
    else {
        tMat = g2.m_xf.R;
        tVec = this.m_prismatic2.m_localXAxis1;
        ugX = tMat.col1.x * tVec.x + tMat.col2.x * tVec.y;
        ugY = tMat.col1.y * tVec.x + tMat.col2.y * tVec.y;
        tMat = bB.m_xf.R;
        rX = this.m_localAnchor2.x - bB.m_sweep.localCenter.x;
        rY = this.m_localAnchor2.y - bB.m_sweep.localCenter.y;
        tX = tMat.col1.x * rX + tMat.col2.x * rY;
        rY = tMat.col1.y * rX + tMat.col2.y * rY;
        rX = tX;
        crug = rX * ugY - rY * ugX;
        this.m_J.linearB.Set( - this.m_ratio * ugX, - this.m_ratio * ugY);
        this.m_J.angularB = - this.m_ratio * crug;
        K += this.m_ratio * this.m_ratio * (bB.m_invMass + bB.m_invI * crug * crug);
    }
    this.m_mass = K > 0 ? 1 / K: 0;
    if (step.warmStarting){
        bA.m_linearVelocity.x += bA.m_invMass * this.m_impulse * this.m_J.linearA.x;
        bA.m_linearVelocity.y += bA.m_invMass * this.m_impulse * this.m_J.linearA.y;
        bA.m_angularVelocity += bA.m_invI * this.m_impulse * this.m_J.angularA;
        bB.m_linearVelocity.x += bB.m_invMass * this.m_impulse * this.m_J.linearB.x;
        bB.m_linearVelocity.y += bB.m_invMass * this.m_impulse * this.m_J.linearB.y;
        bB.m_angularVelocity += bB.m_invI * this.m_impulse * this.m_J.angularB;
    }
    else {
        this.m_impulse = 0;
    }
};
 
 Box2D.GearJoint.prototype.SolveVelocityConstraints = function(step){
    var bA = this.m_bodyA;
    var bB = this.m_bodyB;
    var Cdot = this.m_J.Compute(bA.m_linearVelocity, bA.m_angularVelocity, bB.m_linearVelocity, bB.m_angularVelocity);
    var impulse = - this.m_mass * Cdot;
    this.m_impulse += impulse;
    bA.m_linearVelocity.x += bA.m_invMass * impulse * this.m_J.linearA.x;
    bA.m_linearVelocity.y += bA.m_invMass * impulse * this.m_J.linearA.y;
    bA.m_angularVelocity += bA.m_invI * impulse * this.m_J.angularA;
    bB.m_linearVelocity.x += bB.m_invMass * impulse * this.m_J.linearB.x;
    bB.m_linearVelocity.y += bB.m_invMass * impulse * this.m_J.linearB.y;
    bB.m_angularVelocity += bB.m_invI * impulse * this.m_J.angularB;
};
 
 Box2D.GearJoint.prototype.SolvePositionConstraints = function(baumgarte){
    var linearError = 0;
    var bA = this.m_bodyA;
    var bB = this.m_bodyB;
    var coordinate1;
    var coordinate2;
    if (this.m_revolute1){
        coordinate1 = this.m_revolute1.GetJointAngle();
    }
    else {
        coordinate1 = this.m_prismatic1.GetJointTranslation();
    }
    if (this.m_revolute2){
        coordinate2 = this.m_revolute2.GetJointAngle();
    }
    else {
        coordinate2 = this.m_prismatic2.GetJointTranslation();
    }
    var C = this.m_constant - (coordinate1 + this.m_ratio * coordinate2);
    var impulse = - this.m_mass * C;
    bA.m_sweep.c.x += bA.m_invMass * impulse * this.m_J.linearA.x;
    bA.m_sweep.c.y += bA.m_invMass * impulse * this.m_J.linearA.y;
    bA.m_sweep.a += bA.m_invI * impulse * this.m_J.angularA;
    bB.m_sweep.c.x += bB.m_invMass * impulse * this.m_J.linearB.x;
    bB.m_sweep.c.y += bB.m_invMass * impulse * this.m_J.linearB.y;
    bB.m_sweep.a += bB.m_invI * impulse * this.m_J.angularB;
    bA.SynchronizeTransform();
    bB.SynchronizeTransform();
    return linearError < Box2D.Settings.b2_linearSlop;
};
 
 Box2D.GearJoint.prototype.GetAnchorA = function(){
    return this.m_bodyA.GetWorldPoint(this.m_localAnchor1);
};
 
 Box2D.GearJoint.prototype.GetAnchorB = function(){
    return this.m_bodyB.GetWorldPoint(this.m_localAnchor2);
};
 
 Box2D.GearJoint.prototype.GetReactionForce = function(inv_dt){
    return new Box2D.Vec2(inv_dt * this.m_impulse * this.m_J.linearB.x, inv_dt * this.m_impulse * this.m_J.linearB.y);
};
 
 Box2D.GearJoint.prototype.GetReactionTorque = function(inv_dt){
    var tMat = this.m_bodyB.m_xf.R;
    var rX = this.m_localAnchor1.x - this.m_bodyB.m_sweep.localCenter.x;
    var rY = this.m_localAnchor1.y - this.m_bodyB.m_sweep.localCenter.y;
    var tX = tMat.col1.x * rX + tMat.col2.x * rY;
    rY = tMat.col1.y * rX + tMat.col2.y * rY;
    rX = tX;
    var PX = this.m_impulse * this.m_J.linearB.x;
    var PY = this.m_impulse * this.m_J.linearB.y;
    return inv_dt * (this.m_impulse * this.m_J.angularB - rX * PY + rY * PX);
};
 
 Box2D.GearJoint.prototype.GetRatio = function(){
    return this.m_ratio;
};
 
 Box2D.GearJoint.prototype.SetRatio = function(ratio){
    this.m_ratio = ratio;
};
 Box2D.GearJoint.prototype.m_ground1 = undefined;
 Box2D.GearJoint.prototype.m_ground2 = undefined;
 Box2D.GearJoint.prototype.m_revolute1 = undefined;
 Box2D.GearJoint.prototype.m_prismatic1 = undefined;
 Box2D.GearJoint.prototype.m_revolute2 = undefined;
 Box2D.GearJoint.prototype.m_prismatic2 = undefined;
 Box2D.GearJoint.prototype.m_groundAnchor1 = new Box2D.Vec2();
 Box2D.GearJoint.prototype.m_groundAnchor2 = new Box2D.Vec2();
 Box2D.GearJoint.prototype.m_localAnchor1 = new Box2D.Vec2();
 Box2D.GearJoint.prototype.m_localAnchor2 = new Box2D.Vec2();
 Box2D.GearJoint.prototype.m_J = new Box2D.Jacobian();
 Box2D.GearJoint.prototype.m_constant = undefined;
 Box2D.GearJoint.prototype.m_ratio = undefined;
 Box2D.GearJoint.prototype.m_mass = undefined;
 Box2D.GearJoint.prototype.m_impulse = undefined;
 
 Box2D.TOIInput = function(){
    this.__varz();
    this.__constructor.apply(this, arguments);
};
 
 Box2D.TOIInput.prototype.__constructor = function(){
};
 Box2D.TOIInput.prototype.__varz = function(){
    this.proxyA = new Box2D.DistanceProxy();
    this.proxyB = new Box2D.DistanceProxy();
    this.sweepA = new Box2D.Sweep();
    this.sweepB = new Box2D.Sweep();
};
 Box2D.TOIInput.prototype.proxyA = new Box2D.DistanceProxy();
 Box2D.TOIInput.prototype.proxyB = new Box2D.DistanceProxy();
 Box2D.TOIInput.prototype.sweepA = new Box2D.Sweep();
 Box2D.TOIInput.prototype.sweepB = new Box2D.Sweep();
 Box2D.TOIInput.prototype.tolerance = undefined;
 
 Box2D.RevoluteJointDef = function(){
    Box2D.JointDef.prototype.__varz.call(this);
    this.__varz();
    this.__constructor.apply(this, arguments);
};
 extend(Box2D.RevoluteJointDef.prototype, Box2D.JointDef.prototype);
 Box2D.RevoluteJointDef.prototype._super = Box2D.JointDef.prototype;
 
 Box2D.RevoluteJointDef.prototype.__constructor = function(){
    this._super.__constructor.apply(this, arguments);
    this.type = Box2D.Joint.e_revoluteJoint;
    this.localAnchorA.Set(0, 0);
    this.localAnchorB.Set(0, 0);
    this.referenceAngle = 0;
    this.lowerAngle = 0;
    this.upperAngle = 0;
    this.maxMotorTorque = 0;
    this.motorSpeed = 0;
    this.enableLimit = false;
    this.enableMotor = false;
};
 
 Box2D.RevoluteJointDef.prototype.__varz = function(){
    this.localAnchorA = new Box2D.Vec2();
    this.localAnchorB = new Box2D.Vec2();
};
 
 Box2D.RevoluteJointDef.prototype.Initialize = function(bA, bB, anchor){
    this.bodyA = bA;
    this.bodyB = bB;
    this.localAnchorA = this.bodyA.GetLocalPoint(anchor);
    this.localAnchorB = this.bodyB.GetLocalPoint(anchor);
    this.referenceAngle = this.bodyB.GetAngle() - this.bodyA.GetAngle();
};
 Box2D.RevoluteJointDef.prototype.localAnchorA = new Box2D.Vec2();
 Box2D.RevoluteJointDef.prototype.localAnchorB = new Box2D.Vec2();
 Box2D.RevoluteJointDef.prototype.referenceAngle = undefined;
 Box2D.RevoluteJointDef.prototype.enableLimit = undefined;
 Box2D.RevoluteJointDef.prototype.lowerAngle = undefined;
 Box2D.RevoluteJointDef.prototype.upperAngle = undefined;
 Box2D.RevoluteJointDef.prototype.enableMotor = undefined;
 Box2D.RevoluteJointDef.prototype.motorSpeed = undefined;
 Box2D.RevoluteJointDef.prototype.maxMotorTorque = undefined;
 
 Box2D.MouseJointDef = function(){
    Box2D.JointDef.prototype.__varz.call(this);
    this.__varz();
    this.__constructor.apply(this, arguments);
};
 extend(Box2D.MouseJointDef.prototype, Box2D.JointDef.prototype);
 Box2D.MouseJointDef.prototype._super = Box2D.JointDef.prototype;
 
 Box2D.MouseJointDef.prototype.__constructor = function(){
    this._super.__constructor.apply(this, arguments);
    this.type = Box2D.Joint.e_mouseJoint;
    this.maxForce = 0;
    this.frequencyHz = 5;
    this.dampingRatio = 0.7;
};
 
 Box2D.MouseJointDef.prototype.__varz = function(){
    this.target = new Box2D.Vec2();
};
 Box2D.MouseJointDef.prototype.target = new Box2D.Vec2();
 Box2D.MouseJointDef.prototype.maxForce = undefined;
 Box2D.MouseJointDef.prototype.frequencyHz = undefined;
 Box2D.MouseJointDef.prototype.dampingRatio = undefined;
 
 Box2D.Contact = function(){
    this.__varz();
    this.__constructor.apply(this, arguments);
};
 
 Box2D.Contact.prototype.__constructor = function(){
};
 Box2D.Contact.prototype.__varz = function(){
    this.m_nodeA = new Box2D.ContactEdge();
    this.m_nodeB = new Box2D.ContactEdge();
    this.m_manifold = new Box2D.Manifold();
    this.m_oldManifold = new Box2D.Manifold();
};
 Box2D.Contact.s_input = new Box2D.TOIInput();
 Box2D.Contact.e_sensorFlag = 1;
 Box2D.Contact.e_continuousFlag = 2;
 Box2D.Contact.e_islandFlag = 4;
 Box2D.Contact.e_toiFlag = 8;
 Box2D.Contact.e_touchingFlag = 16;
 Box2D.Contact.e_enabledFlag = 32;
 Box2D.Contact.e_filterFlag = 64;
 
 Box2D.Contact.prototype.Reset = function(fixtureA, fixtureB){
    this.m_flags = Box2D.Contact.e_enabledFlag;
    if ( ! fixtureA || ! fixtureB){
        this.m_fixtureA = undefined;
        this.m_fixtureB = undefined;
        return;
    }
    if (fixtureA.IsSensor() || fixtureB.IsSensor()){
        this.m_flags |= Box2D.Contact.e_sensorFlag;
    }
    var bodyA = fixtureA.GetBody();
    var bodyB = fixtureB.GetBody();
    if (bodyA.GetType() != Box2D.Body.b2_dynamicBody || bodyA.IsBullet() || bodyB.GetType() != Box2D.Body.b2_dynamicBody || bodyB.IsBullet()){
        this.m_flags |= Box2D.Contact.e_continuousFlag;
    }
    this.m_fixtureA = fixtureA;
    this.m_fixtureB = fixtureB;
    this.m_manifold.m_pointCount = 0;
    this.m_prev = undefined;
    this.m_next = undefined;
    this.m_nodeA.contact = undefined;
    this.m_nodeA.prev = undefined;
    this.m_nodeA.next = undefined;
    this.m_nodeA.other = undefined;
    this.m_nodeB.contact = undefined;
    this.m_nodeB.prev = undefined;
    this.m_nodeB.next = undefined;
    this.m_nodeB.other = undefined;
};
 
 Box2D.Contact.prototype.Update = function(listener){
    var tManifold = this.m_oldManifold;
    this.m_oldManifold = this.m_manifold;
    this.m_manifold = tManifold; 
    this.m_flags |= Box2D.Contact.e_enabledFlag;
    var touching = false;
    var wasTouching = (this.m_flags & Box2D.Contact.e_touchingFlag) == Box2D.Contact.e_touchingFlag;
    var bodyA = this.m_fixtureA.m_body;
    var bodyB = this.m_fixtureB.m_body;
    var aabbOverlap = this.m_fixtureA.m_aabb.TestOverlap(this.m_fixtureB.m_aabb);
    if (this.m_flags & Box2D.Contact.e_sensorFlag){
        if (aabbOverlap){
            var shapeA = this.m_fixtureA.GetShape();
            var shapeB = this.m_fixtureB.GetShape();
            var xfA = bodyA.GetTransform();
            var xfB = bodyB.GetTransform();
            touching = Box2D.Shape.TestOverlap(shapeA, xfA, shapeB, xfB);
        }
        this.m_manifold.m_pointCount = 0;
    }
    else {
        if (bodyA.GetType() != Box2D.Body.b2_dynamicBody || bodyA.IsBullet() || bodyB.GetType() != Box2D.Body.b2_dynamicBody || 
           bodyB.IsBullet()){
            this.m_flags |= Box2D.Contact.e_continuousFlag;
        }
        else {
            this.m_flags &= ~ Box2D.Contact.e_continuousFlag;
        }
        if (aabbOverlap){
            this.Evaluate();
            touching = this.m_manifold.m_pointCount > 0;
            for (var i = 0;i < this.m_manifold.m_pointCount; ++i){
                var mp2 = this.m_manifold.m_points[i];
                mp2.m_normalImpulse = 0;
                mp2.m_tangentImpulse = 0;
                var id2 = mp2.m_id;
                for (var j = 0;j < this.m_oldManifold.m_pointCount; ++ j){
                    var mp1 = this.m_oldManifold.m_points[j];
                    if (mp1.m_id.key == id2.key){
                        mp2.m_normalImpulse = mp1.m_normalImpulse;
                        mp2.m_tangentImpulse = mp1.m_tangentImpulse;
                        break;
                    }
                }
            }
        }
        else {
            this.m_manifold.m_pointCount = 0;
        }
        if (touching != wasTouching){
            bodyA.SetAwake(true);
            bodyB.SetAwake(true);
        }
    }
    if (touching){
        this.m_flags |= Box2D.Contact.e_touchingFlag;
    }
    else {
        this.m_flags &= ~ Box2D.Contact.e_touchingFlag;
    }
    if (wasTouching === false && touching === true){
        listener.BeginContact(this);
    }
    if (wasTouching === true && touching === false){
        listener.EndContact(this);
    }
    if ((this.m_flags & Box2D.Contact.e_sensorFlag) === 0){
        listener.PreSolve(this, this.m_oldManifold);
    }
};
 
 Box2D.Contact.prototype.Evaluate = function(){
};
 Box2D.Contact.prototype.ComputeTOI = function(sweepA, sweepB){
    Box2D.Contact.s_input.proxyA.Set(this.m_fixtureA.GetShape());
    Box2D.Contact.s_input.proxyB.Set(this.m_fixtureB.GetShape());
    Box2D.Contact.s_input.sweepA = sweepA;
    Box2D.Contact.s_input.sweepB = sweepB;
    Box2D.Contact.s_input.tolerance = Box2D.Settings.b2_linearSlop;
    return Box2D.TimeOfImpact.TimeOfImpact(Box2D.Contact.s_input);
};
 
 Box2D.Contact.prototype.GetManifold = function(){
    return this.m_manifold;
};
 
 Box2D.Contact.prototype.GetWorldManifold = function(worldManifold){
    var bodyA = this.m_fixtureA.GetBody();
    var bodyB = this.m_fixtureB.GetBody();
    var shapeA = this.m_fixtureA.GetShape();
    var shapeB = this.m_fixtureB.GetShape();
    worldManifold.Initialize(this.m_manifold, bodyA.GetTransform(), shapeA.m_radius, bodyB.GetTransform(), shapeB.m_radius);
};
 
 Box2D.Contact.prototype.IsTouching = function(){
    return (this.m_flags & Box2D.Contact.e_touchingFlag) == Box2D.Contact.e_touchingFlag;
};
 
 Box2D.Contact.prototype.IsContinuous = function(){
    return (this.m_flags & Box2D.Contact.e_continuousFlag) == Box2D.Contact.e_continuousFlag;
};
 
 Box2D.Contact.prototype.SetSensor = function(sensor){
    if (sensor){
        this.m_flags |= Box2D.Contact.e_sensorFlag;
    }
    else {
        this.m_flags &= ~ Box2D.Contact.e_sensorFlag;
    }
};
 
 Box2D.Contact.prototype.IsSensor = function(){
    return (this.m_flags & Box2D.Contact.e_sensorFlag) == Box2D.Contact.e_sensorFlag;
};
 
 Box2D.Contact.prototype.SetEnabled = function(flag){
    if (flag){
        this.m_flags |= Box2D.Contact.e_enabledFlag;
    }
    else {
        this.m_flags &= ~ Box2D.Contact.e_enabledFlag;
    }
};
 
 Box2D.Contact.prototype.IsEnabled = function(){
    return (this.m_flags & Box2D.Contact.e_enabledFlag) == Box2D.Contact.e_enabledFlag;
};
 
 Box2D.Contact.prototype.GetNext = function(){
    return this.m_next;
};
 
 Box2D.Contact.prototype.GetFixtureA = function(){
    return this.m_fixtureA;
};
 
 Box2D.Contact.prototype.GetFixtureB = function(){
    return this.m_fixtureB;
};
 
 Box2D.Contact.prototype.FlagForFiltering = function(){
    this.m_flags |= Box2D.Contact.e_filterFlag;
};
 Box2D.Contact.prototype.m_flags = 0;
 Box2D.Contact.prototype.m_prev = undefined;
 Box2D.Contact.prototype.m_next = undefined;
 Box2D.Contact.prototype.m_nodeA = new Box2D.ContactEdge();
 Box2D.Contact.prototype.m_nodeB = new Box2D.ContactEdge();
 Box2D.Contact.prototype.m_fixtureA = undefined;
 Box2D.Contact.prototype.m_fixtureB = undefined;
 Box2D.Contact.prototype.m_manifold = new Box2D.Manifold();
 Box2D.Contact.prototype.m_oldManifold = new Box2D.Manifold();
 Box2D.Contact.prototype.m_toi = undefined;
 
 Box2D.ContactConstraint = function(){
    this.__varz();
    this.__constructor.apply(this, arguments);
};
 
 Box2D.ContactConstraint.prototype.__constructor = function(){
    this.points =[];
    for (var i = 0;i < Box2D.Settings.b2_maxManifoldPoints;i++){
        this.points[i] = new Box2D.ContactConstraintPoint();
    }
};
 
 Box2D.ContactConstraint.prototype.__varz = function(){
    this.localPlaneNormal = new Box2D.Vec2();
    this.localPoint = new Box2D.Vec2();
    this.normal = new Box2D.Vec2();
    this.normalMass = new Box2D.Mat22();
    this.K = new Box2D.Mat22();
};
 Box2D.ContactConstraint.prototype.points = undefined;
 Box2D.ContactConstraint.prototype.localPlaneNormal = new Box2D.Vec2();
 Box2D.ContactConstraint.prototype.localPoint = new Box2D.Vec2();
 Box2D.ContactConstraint.prototype.normal = new Box2D.Vec2();
 Box2D.ContactConstraint.prototype.normalMass = new Box2D.Mat22();
 Box2D.ContactConstraint.prototype.K = new Box2D.Mat22();
 Box2D.ContactConstraint.prototype.bodyA = undefined;
 Box2D.ContactConstraint.prototype.bodyB = undefined;
 Box2D.ContactConstraint.prototype.type = 0;
 Box2D.ContactConstraint.prototype.radius = undefined;
 Box2D.ContactConstraint.prototype.friction = undefined;
 Box2D.ContactConstraint.prototype.restitution = undefined;
 Box2D.ContactConstraint.prototype.pointCount = 0;
 Box2D.ContactConstraint.prototype.manifold = undefined;
 
 Box2D.ContactResult = function(){
    this.__varz();
    this.__constructor.apply(this, arguments);
};
 
 Box2D.ContactResult.prototype.__constructor = function(){
};
 Box2D.ContactResult.prototype.__varz = function(){
    this.position = new Box2D.Vec2();
    this.normal = new Box2D.Vec2();
    this.id = new Box2D.ContactID();
};
 Box2D.ContactResult.prototype.shape1 = undefined;
 Box2D.ContactResult.prototype.shape2 = undefined;
 Box2D.ContactResult.prototype.position = new Box2D.Vec2();
 Box2D.ContactResult.prototype.normal = new Box2D.Vec2();
 Box2D.ContactResult.prototype.normalImpulse = undefined;
 Box2D.ContactResult.prototype.tangentImpulse = undefined;
 Box2D.ContactResult.prototype.id = new Box2D.ContactID();
 
 Box2D.PolygonContact = function(){
    Box2D.Contact.prototype.__varz.call(this);
    this.__varz();
    this.__constructor.apply(this, arguments);
};
 extend(Box2D.PolygonContact.prototype, Box2D.Contact.prototype);
 Box2D.PolygonContact.prototype._super = Box2D.Contact.prototype;
 
 Box2D.PolygonContact.prototype.__constructor = function(){
    this._super.__constructor.apply(this, arguments);
};
 
 Box2D.PolygonContact.prototype.__varz = function(){
};
 Box2D.PolygonContact.Create = function(allocator){
    return new Box2D.PolygonContact();
};
 
 Box2D.PolygonContact.Destroy = function(contact, allocator){
};
 Box2D.PolygonContact.prototype.Evaluate = function(){
    var bA = this.m_fixtureA.GetBody();
    var bB = this.m_fixtureB.GetBody();
    Box2D.Collision.CollidePolygons(this.m_manifold, this.m_fixtureA.GetShape(), bA.m_xf, this.m_fixtureB.GetShape(), 
       bB.m_xf);
};
 
 Box2D.PolygonContact.prototype.Reset = function(fixtureA, fixtureB){
    this._super.Reset.apply(this,[fixtureA, fixtureB]);
};
 
 var ClipVertex = function(){
    this.__varz();
    this.__constructor.apply(this, arguments);
};
 
 ClipVertex.prototype.__constructor = function(){
};
 ClipVertex.prototype.__varz = function(){
    this.v = new Box2D.Vec2();
    this.id = new Box2D.ContactID();
};
 
 ClipVertex.prototype.Set = function(other){
    this.v.SetV(other.v);
    this.id.Set(other.id);
};
 ClipVertex.prototype.v = new Box2D.Vec2();
 ClipVertex.prototype.id = new Box2D.ContactID();
 
 Box2D.ContactFilter = function(){
    this.__varz();
    this.__constructor.apply(this, arguments);
};
 
 Box2D.ContactFilter.prototype.__constructor = function(){
};
 Box2D.ContactFilter.prototype.__varz = function(){
};
Box2D.ContactFilter.b2_defaultFilter = new Box2D.ContactFilter();
 
 Box2D.ContactFilter.prototype.ShouldCollide = function(fixtureA, fixtureB){
    var filter1 = fixtureA.GetFilterData();
    var filter2 = fixtureB.GetFilterData();
    if (filter1.groupIndex == filter2.groupIndex && filter1.groupIndex !== 0){
        return filter1.groupIndex > 0;
    }
    var collide = (filter1.maskBits & filter2.categoryBits) !== 0 && (filter1.categoryBits & filter2.maskBits) !== 0;
    return collide;
};
 
 Box2D.ContactFilter.prototype.RayCollide = function(userData, fixture){
    if ( ! userData){
        return true;
    }
    return this.ShouldCollide(userData, fixture);
};
 
 Box2D.NullContact = function(){
    Box2D.Contact.prototype.__varz.call(this);
    this.__varz();
    this.__constructor.apply(this, arguments);
};
 extend(Box2D.NullContact.prototype, Box2D.Contact.prototype);
 Box2D.NullContact.prototype._super = Box2D.Contact.prototype;
 
 Box2D.NullContact.prototype.__constructor = function(){
    this._super.__constructor.apply(this, arguments);
};
 
 Box2D.NullContact.prototype.__varz = function(){
};
 Box2D.NullContact.prototype.Evaluate = function(){
};
 Box2D.ContactListener = function(){
    this.__varz();
    this.__constructor.apply(this, arguments);
};
 
 Box2D.ContactListener.prototype.__constructor = function(){
};
 Box2D.ContactListener.prototype.__varz = function(){
};
Box2D.ContactListener.b2_defaultListener = new Box2D.ContactListener();
 
 Box2D.ContactListener.prototype.BeginContact = function(contact){
};
 Box2D.ContactListener.prototype.EndContact = function(contact){
};
 Box2D.ContactListener.prototype.PreSolve = function(contact, oldManifold){
};
 Box2D.ContactListener.prototype.PostSolve = function(contact, impulse){
};
 Box2D.Island = function(){
    this.__varz();
    this.__constructor.apply(this, arguments);
};
 
 Box2D.Island.prototype.__constructor = function(){
    this.m_bodies =[];
    this.m_contacts =[];
    this.m_joints =[];
};
 
 Box2D.Island.prototype.__varz = function(){
};
Box2D.Island.s_impulse = new Box2D.ContactImpulse();
 
 Box2D.Island.prototype.Initialize = function(bodyCapacity, contactCapacity, jointCapacity, allocator, listener, 
   contactSolver){
    var i = 0;
    this.m_bodyCapacity = bodyCapacity;
    this.m_contactCapacity = contactCapacity;
    this.m_jointCapacity = jointCapacity;
    this.m_bodyCount = 0;
    this.m_contactCount = 0;
    this.m_jointCount = 0;
    this.m_allocator = allocator;
    this.m_listener = listener;
    this.m_contactSolver = contactSolver;
    for (i = this.m_bodies.length;i < bodyCapacity;i++){
        this.m_bodies[i] = undefined;
    }
    for (i = this.m_contacts.length;i < contactCapacity;i++){
        this.m_contacts[i] = undefined;
    }
    for (i = this.m_joints.length;i < jointCapacity;i++){
        this.m_joints[i] = undefined;
    }
};
 
 Box2D.Island.prototype.Clear = function(){
    this.m_bodyCount = 0;
    this.m_contactCount = 0;
    this.m_jointCount = 0;
};

Box2D.Island.prototype.Solve = function(step, gravity, allowSleep){
    var i = 0;
    var j = 0;
    var b;
    var joint;
    for (i = 0;i < this.m_bodyCount; ++i){
        b = this.m_bodies[i];
        if (b.GetType() != Box2D.Body.b2_dynamicBody){
            continue;
        }
        b.m_linearVelocity.x += step.dt * (gravity.x + b.m_invMass * b.m_force.x);
        b.m_linearVelocity.y += step.dt * (gravity.y + b.m_invMass * b.m_force.y);
        b.m_angularVelocity += step.dt * b.m_invI * b.m_torque;
        b.m_linearVelocity.Multiply(Box2D.Math.Clamp(1 - step.dt * b.m_linearDamping, 0, 1));
        b.m_angularVelocity *= Box2D.Math.Clamp(1 - step.dt * b.m_angularDamping, 0, 1);
    }
    this.m_contactSolver.Initialize(step, this.m_contacts, this.m_contactCount, this.m_allocator);
    var contactSolver = this.m_contactSolver;
    contactSolver.InitVelocityConstraints(step);
    for (i = 0;i < this.m_jointCount; ++i){
        joint = this.m_joints[i];
        joint.InitVelocityConstraints(step);
    }
    for (i = 0;i < step.velocityIterations; ++i){
        for (j = 0;j < this.m_jointCount; ++ j){
            joint = this.m_joints[j];
            joint.SolveVelocityConstraints(step);
        }
        contactSolver.SolveVelocityConstraints();
    }
    for (i = 0;i < this.m_jointCount; ++i){
        joint = this.m_joints[i];
        joint.FinalizeVelocityConstraints();
    }
    contactSolver.FinalizeVelocityConstraints();
    for (i = 0;i < this.m_bodyCount; ++i){
        b = this.m_bodies[i];
        if (b.GetType() == Box2D.Body.b2_staticBody){
            continue;
        }
        var translationX = step.dt * b.m_linearVelocity.x;
        var translationY = step.dt * b.m_linearVelocity.y;
        if (translationX * translationX + translationY * translationY > Box2D.Settings.b2_maxTranslationSquared){
            b.m_linearVelocity.Normalize();
            b.m_linearVelocity.x *= Box2D.Settings.b2_maxTranslation * step.inv_dt;
            b.m_linearVelocity.y *= Box2D.Settings.b2_maxTranslation * step.inv_dt;
        }
        var rotation = step.dt * b.m_angularVelocity;
        if (rotation * rotation > Box2D.Settings.b2_maxRotationSquared){
            if (b.m_angularVelocity < 0){
                b.m_angularVelocity = - Box2D.Settings.b2_maxRotation * step.inv_dt;
            }
            else {
                b.m_angularVelocity = Box2D.Settings.b2_maxRotation * step.inv_dt;
            }
        }
        b.m_sweep.c0.SetV(b.m_sweep.c);
        b.m_sweep.a0 = b.m_sweep.a;
        b.m_sweep.c.x += step.dt * b.m_linearVelocity.x;
        b.m_sweep.c.y += step.dt * b.m_linearVelocity.y;
        b.m_sweep.a += step.dt * b.m_angularVelocity;
        b.SynchronizeTransform();
    }
    for (i = 0;i < step.positionIterations; ++i){
        var contactsOkay = contactSolver.SolvePositionConstraints(Box2D.Settings.b2_contactBaumgarte);
        var jointsOkay = true;
        for (j = 0;j < this.m_jointCount; ++ j){
            joint = this.m_joints[j];
            var jointOkay = joint.SolvePositionConstraints(Box2D.Settings.b2_contactBaumgarte);
            jointsOkay = jointsOkay && jointOkay;
        }
        if (contactsOkay && jointsOkay){
            break;
        }
    }
    this.Report(contactSolver.m_constraints);
    if (allowSleep){
        var minSleepTime = Number.MAX_VALUE;
        var linTolSqr = Box2D.Settings.b2_linearSleepTolerance * Box2D.Settings.b2_linearSleepTolerance;
        var angTolSqr = Box2D.Settings.b2_angularSleepTolerance * Box2D.Settings.b2_angularSleepTolerance;
        for (i = 0;i < this.m_bodyCount; ++i){
            b = this.m_bodies[i];
            if (b.GetType() == Box2D.Body.b2_staticBody){
                continue;
            }
            if ((b.m_flags & Box2D.Body.e_allowSleepFlag) === 0){
                b.m_sleepTime = 0;
                minSleepTime = 0;
            }
            if ((b.m_flags & Box2D.Body.e_allowSleepFlag) === 0 || b.m_angularVelocity * b.m_angularVelocity > 
               angTolSqr || Box2D.Math.Dot(b.m_linearVelocity, b.m_linearVelocity) > linTolSqr){
                b.m_sleepTime = 0;
                minSleepTime = 0;
            }
            else {
                b.m_sleepTime += step.dt;
                minSleepTime = Box2D.Math.Min(minSleepTime, b.m_sleepTime);
            }
        }
        if (minSleepTime >= Box2D.Settings.b2_timeToSleep){
            for (i = 0;i < this.m_bodyCount; ++i){
                b = this.m_bodies[i];
                b.SetAwake(false);
            }
        }
    }
};
 
 Box2D.Island.prototype.SolveTOI = function(subStep){
    var i = 0;
    var j = 0;
    this.m_contactSolver.Initialize(subStep, this.m_contacts, this.m_contactCount, this.m_allocator);
    var contactSolver = this.m_contactSolver;
    for (i = 0;i < this.m_jointCount; ++i){
        this.m_joints[i].InitVelocityConstraints(subStep);
    }
    for (i = 0;i < subStep.velocityIterations; ++i){
        contactSolver.SolveVelocityConstraints();
        for (j = 0;j < this.m_jointCount; ++ j){
            this.m_joints[j].SolveVelocityConstraints(subStep);
        }
    }
    for (i = 0;i < this.m_bodyCount; ++i){
        var b = this.m_bodies[i];
        if (b.GetType() == Box2D.Body.b2_staticBody){
            continue;
        }
        var translationX = subStep.dt * b.m_linearVelocity.x;
        var translationY = subStep.dt * b.m_linearVelocity.y;
        if (translationX * translationX + translationY * translationY > Box2D.Settings.b2_maxTranslationSquared){
            b.m_linearVelocity.Normalize();
            b.m_linearVelocity.x *= Box2D.Settings.b2_maxTranslation * subStep.inv_dt;
            b.m_linearVelocity.y *= Box2D.Settings.b2_maxTranslation * subStep.inv_dt;
        }
        var rotation = subStep.dt * b.m_angularVelocity;
        if (rotation * rotation > Box2D.Settings.b2_maxRotationSquared){
            if (b.m_angularVelocity < 0){
                b.m_angularVelocity = - Box2D.Settings.b2_maxRotation * subStep.inv_dt;
            }
            else {
                b.m_angularVelocity = Box2D.Settings.b2_maxRotation * subStep.inv_dt;
            }
        }
        b.m_sweep.c0.SetV(b.m_sweep.c);
        b.m_sweep.a0 = b.m_sweep.a;
        b.m_sweep.c.x += subStep.dt * b.m_linearVelocity.x;
        b.m_sweep.c.y += subStep.dt * b.m_linearVelocity.y;
        b.m_sweep.a += subStep.dt * b.m_angularVelocity;
        b.SynchronizeTransform();
    }
    var k_toiBaumgarte = 0.75;
    for (i = 0;i < subStep.positionIterations; ++i){
        var contactsOkay = contactSolver.SolvePositionConstraints(k_toiBaumgarte);
        var jointsOkay = true;
        for (j = 0;j < this.m_jointCount; ++ j){
            var jointOkay = this.m_joints[j].SolvePositionConstraints(Box2D.Settings.b2_contactBaumgarte);
            jointsOkay = jointsOkay && jointOkay;
        }
        if (contactsOkay && jointsOkay){
            break;
        }
    }
    this.Report(contactSolver.m_constraints);
};
 
 Box2D.Island.prototype.Report = function(constraints){
    if (typeof this.m_listener === "undefined"){
        return;
    }
    for (var i = 0;i < this.m_contactCount; ++i){
        var c = this.m_contacts[i];
        var cc = constraints[i];
        for (var j = 0;j < cc.pointCount; ++ j){
            Box2D.Island.s_impulse.normalImpulses[j] = cc.points[j].normalImpulse;
            Box2D.Island.s_impulse.tangentImpulses[j] = cc.points[j].tangentImpulse;
        }
        this.m_listener.PostSolve(c, Box2D.Island.s_impulse);
    }
};
 
 Box2D.Island.prototype.AddBody = function(body){
    body.m_islandIndex = this.m_bodyCount;
    this.m_bodies[this.m_bodyCount++] = body;
};
 
 Box2D.Island.prototype.AddContact = function(contact){
    this.m_contacts[this.m_contactCount++] = contact;
};
 
 Box2D.Island.prototype.AddJoint = function(joint){
    this.m_joints[this.m_jointCount++] = joint;
};
 Box2D.Island.prototype.m_allocator = undefined;
 Box2D.Island.prototype.m_listener = undefined;
 Box2D.Island.prototype.m_contactSolver = undefined;
 Box2D.Island.prototype.m_bodies = undefined;
 Box2D.Island.prototype.m_contacts = undefined;
 Box2D.Island.prototype.m_joints = undefined;
 Box2D.Island.prototype.m_bodyCount = 0;
 Box2D.Island.prototype.m_jointCount = 0;
 Box2D.Island.prototype.m_contactCount = 0;
 Box2D.Island.prototype.m_bodyCapacity = 0;
 Box2D.Island.prototype.m_contactCapacity = 0;
 Box2D.Island.prototype.m_jointCapacity = 0;
 
 Box2D.PolyAndEdgeContact = function(){
    Box2D.Contact.prototype.__varz.call(this);
    this.__varz();
    this.__constructor.apply(this, arguments);
};
 extend(Box2D.PolyAndEdgeContact.prototype, Box2D.Contact.prototype);
 Box2D.PolyAndEdgeContact.prototype._super = Box2D.Contact.prototype;
 
 Box2D.PolyAndEdgeContact.prototype.__constructor = function(){
    this._super.__constructor.apply(this, arguments);
};
 
 Box2D.PolyAndEdgeContact.prototype.__varz = function(){
};
 Box2D.PolyAndEdgeContact.Create = function(allocator){
    return new Box2D.PolyAndEdgeContact();
};
 
 Box2D.PolyAndEdgeContact.Destroy = function(contact, allocator){
};
 Box2D.PolyAndEdgeContact.prototype.Evaluate = function(){
    var bA = this.m_fixtureA.GetBody();
    var bB = this.m_fixtureB.GetBody();
    this.b2CollidePolyAndEdge(this.m_manifold, this.m_fixtureA.GetShape(), bA.m_xf, this.m_fixtureB.GetShape(), bB.m_xf);
};
 
 Box2D.PolyAndEdgeContact.prototype.b2CollidePolyAndEdge = function(manifold, polygon, xf1, edge, xf2){
};
 Box2D.PolyAndEdgeContact.prototype.Reset = function(fixtureA, fixtureB){
    this._super.Reset.apply(this,[fixtureA, fixtureB]);
    Box2D.Settings.b2Assert(fixtureA.GetType() == Box2D.Shape.e_polygonShape);
    Box2D.Settings.b2Assert(fixtureB.GetType() == Box2D.Shape.e_edgeShape);
};
 
 Box2D.Collision = function(){
    this.__varz();
    this.__constructor.apply(this, arguments);
};
 
 Box2D.Collision.prototype.__constructor = function(){
};
 Box2D.Collision.prototype.__varz = function(){
};
 Box2D.Collision.MakeClipPointVector = function(){
    var r =[];
    r[0] = new ClipVertex();
    r[1] = new ClipVertex();
    return r;
};
 
 Box2D.Collision.ClipSegmentToLine = function(vOut, vIn, normal, offset){
    var cv;
    var numOut = 0;
    cv = vIn[0];
    var vIn0 = cv.v;
    cv = vIn[1];
    var vIn1 = cv.v;
    var distance0 = normal.x * vIn0.x + normal.y * vIn0.y - offset;
    var distance1 = normal.x * vIn1.x + normal.y * vIn1.y - offset;
    if (distance0 <= 0){
        vOut[numOut++].Set(vIn[0]);
    }
    if (distance1 <= 0){
        vOut[numOut++].Set(vIn[1]);
    }
    if (distance0 * distance1 < 0){
        var interp = distance0 / (distance0 - distance1);
        cv = vOut[numOut];
        var tVec = cv.v;
        tVec.x = vIn0.x + interp * (vIn1.x - vIn0.x);
        tVec.y = vIn0.y + interp * (vIn1.y - vIn0.y);
        cv = vOut[numOut];
        var cv2;
        if (distance0 > 0){
            cv2 = vIn[0];
            cv.id = cv2.id;
        }
        else {
            cv2 = vIn[1];
            cv.id = cv2.id;
        }
        ++ numOut;
    }
    return numOut;
};
 
 Box2D.Collision.EdgeSeparation = function(poly1, xf1, edge1, poly2, xf2){
    var count1 = poly1.m_vertexCount;
    var vertices1 = poly1.m_vertices;
    var normals1 = poly1.m_normals;
    var count2 = poly2.m_vertexCount;
    var vertices2 = poly2.m_vertices;
    var tMat;
    var tVec;
    tMat = xf1.R;
    tVec = normals1[edge1];
    var normal1WorldX = tMat.col1.x * tVec.x + tMat.col2.x * tVec.y;
    var normal1WorldY = tMat.col1.y * tVec.x + tMat.col2.y * tVec.y;
    tMat = xf2.R;
    var normal1X = tMat.col1.x * normal1WorldX + tMat.col1.y * normal1WorldY;
    var normal1Y = tMat.col2.x * normal1WorldX + tMat.col2.y * normal1WorldY;
    var index = 0;
    var minDot = Number.MAX_VALUE;
    for (var i = 0;i < count2; ++i){
        tVec = vertices2[i];
        var dot = tVec.x * normal1X + tVec.y * normal1Y;
        if (dot < minDot){
            minDot = dot;
            index = i;
        }
    }
    tVec = vertices1[edge1];
    tMat = xf1.R;
    var v1X = xf1.position.x + (tMat.col1.x * tVec.x + tMat.col2.x * tVec.y);
    var v1Y = xf1.position.y + (tMat.col1.y * tVec.x + tMat.col2.y * tVec.y);
    tVec = vertices2[index];
    tMat = xf2.R;
    var v2X = xf2.position.x + (tMat.col1.x * tVec.x + tMat.col2.x * tVec.y);
    var v2Y = xf2.position.y + (tMat.col1.y * tVec.x + tMat.col2.y * tVec.y);
    v2X -= v1X;
    v2Y -= v1Y;
    var separation = v2X * normal1WorldX + v2Y * normal1WorldY;
    return separation;
};
 
 Box2D.Collision.FindMaxSeparation = function(edgeIndex, poly1, xf1, poly2, xf2){
    var count1 = poly1.m_vertexCount;
    var normals1 = poly1.m_normals;
    var tVec;
    var tMat;
    tMat = xf2.R;
    tVec = poly2.m_centroid;
    var dX = xf2.position.x + (tMat.col1.x * tVec.x + tMat.col2.x * tVec.y);
    var dY = xf2.position.y + (tMat.col1.y * tVec.x + tMat.col2.y * tVec.y);
    tMat = xf1.R;
    tVec = poly1.m_centroid;
    dX -= xf1.position.x + (tMat.col1.x * tVec.x + tMat.col2.x * tVec.y);
    dY -= xf1.position.y + (tMat.col1.y * tVec.x + tMat.col2.y * tVec.y);
    var dLocal1X = dX * xf1.R.col1.x + dY * xf1.R.col1.y;
    var dLocal1Y = dX * xf1.R.col2.x + dY * xf1.R.col2.y;
    var edge = 0;
    var maxDot = - Number.MAX_VALUE;
    for (var i = 0;i < count1; ++i){
        tVec = normals1[i];
        var dot = tVec.x * dLocal1X + tVec.y * dLocal1Y;
        if (dot > maxDot){
            maxDot = dot;
            edge = i;
        }
    }
    var s = Box2D.Collision.EdgeSeparation(poly1, xf1, edge, poly2, xf2);
    var prevEdge = edge - 1 >= 0 ? edge - 1: count1 - 1;
    var sPrev = Box2D.Collision.EdgeSeparation(poly1, xf1, prevEdge, poly2, xf2);
    var nextEdge = edge + 1 < count1 ? edge + 1: 0;
    var sNext = Box2D.Collision.EdgeSeparation(poly1, xf1, nextEdge, poly2, xf2);
    var bestEdge = 0;
    var bestSeparation;
    var increment = 0;
    if (sPrev > s && sPrev > sNext){
        increment = - 1;
        bestEdge = prevEdge;
        bestSeparation = sPrev;
    }
    else {
        if (sNext > s){
            increment = 1;
            bestEdge = nextEdge;
            bestSeparation = sNext;
        }
        else {
            edgeIndex[0] = edge;
            return s;
        }
    }
    while (true){
        if (increment == - 1){
            edge = bestEdge - 1 >= 0 ? bestEdge - 1: count1 - 1;
        }
        else {
            edge = bestEdge + 1 < count1 ? bestEdge + 1: 0;
        }
        s = Box2D.Collision.EdgeSeparation(poly1, xf1, edge, poly2, xf2);
        if (s > bestSeparation){
            bestEdge = edge;
            bestSeparation = s;
        }
        else {
            break;
        }
    }
    edgeIndex[0] = bestEdge;
    return bestSeparation;
};
 
 Box2D.Collision.FindIncidentEdge = function(c, poly1, xf1, edge1, poly2, xf2){
    var count1 = poly1.m_vertexCount;
    var normals1 = poly1.m_normals;
    var count2 = poly2.m_vertexCount;
    var vertices2 = poly2.m_vertices;
    var normals2 = poly2.m_normals;
    var tMat;
    var tVec;
    tMat = xf1.R;
    tVec = normals1[edge1];
    var normal1X = tMat.col1.x * tVec.x + tMat.col2.x * tVec.y;
    var normal1Y = tMat.col1.y * tVec.x + tMat.col2.y * tVec.y;
    tMat = xf2.R;
    var tX = tMat.col1.x * normal1X + tMat.col1.y * normal1Y;
    normal1Y = tMat.col2.x * normal1X + tMat.col2.y * normal1Y;
    normal1X = tX;
    var index = 0;
    var minDot = Number.MAX_VALUE;
    for (var i = 0;i < count2; ++i){
        tVec = normals2[i];
        var dot = normal1X * tVec.x + normal1Y * tVec.y;
        if (dot < minDot){
            minDot = dot;
            index = i;
        }
    }
    var tClip;
    var i1 = index;
    var i2 = i1 + 1 < count2 ? i1 + 1: 0;
    tClip = c[0];
    tVec = vertices2[i1];
    tMat = xf2.R;
    tClip.v.x = xf2.position.x + (tMat.col1.x * tVec.x + tMat.col2.x * tVec.y);
    tClip.v.y = xf2.position.y + (tMat.col1.y * tVec.x + tMat.col2.y * tVec.y);
    tClip.id.features.referenceEdge = edge1;
    tClip.id.features.incidentEdge = i1;
    tClip.id.features.incidentVertex = 0;
    tClip = c[1];
    tVec = vertices2[i2];
    tMat = xf2.R;
    tClip.v.x = xf2.position.x + (tMat.col1.x * tVec.x + tMat.col2.x * tVec.y);
    tClip.v.y = xf2.position.y + (tMat.col1.y * tVec.x + tMat.col2.y * tVec.y);
    tClip.id.features.referenceEdge = edge1;
    tClip.id.features.incidentEdge = i2;
    tClip.id.features.incidentVertex = 1;
};
 
 Box2D.Collision.CollidePolygons = function(manifold, polyA, xfA, polyB, xfB){
    var cv;
    manifold.m_pointCount = 0;
    var totalRadius = polyA.m_radius + polyB.m_radius;
    var edgeA = 0;
    Box2D.Collision.s_edgeAO[0] = edgeA;
    var separationA = Box2D.Collision.FindMaxSeparation(Box2D.Collision.s_edgeAO, polyA, xfA, polyB, xfB);
    edgeA = Box2D.Collision.s_edgeAO[0];
    if (separationA > totalRadius){
        return;
    }
    var edgeB = 0;
    Box2D.Collision.s_edgeBO[0] = edgeB;
    var separationB = Box2D.Collision.FindMaxSeparation(Box2D.Collision.s_edgeBO, polyB, xfB, polyA, xfA);
    edgeB = Box2D.Collision.s_edgeBO[0];
    if (separationB > totalRadius){
        return;
    }
    var poly1;
    var poly2;
    var xf1;
    var xf2;
    var edge1 = 0;
    var flip = 0;
    var k_relativeTol = 0.98;
    var k_absoluteTol = 0.0010;
    var tMat;
    if (separationB > k_relativeTol * separationA + k_absoluteTol){
        poly1 = polyB;
        poly2 = polyA;
        xf1 = xfB;
        xf2 = xfA;
        edge1 = edgeB;
        manifold.m_type = Box2D.Manifold.e_faceB;
        flip = 1;
    }
    else {
        poly1 = polyA;
        poly2 = polyB;
        xf1 = xfA;
        xf2 = xfB;
        edge1 = edgeA;
        manifold.m_type = Box2D.Manifold.e_faceA;
        flip = 0;
    }
    var incidentEdge = Box2D.Collision.s_incidentEdge;
    Box2D.Collision.FindIncidentEdge(incidentEdge, poly1, xf1, edge1, poly2, xf2);
    var count1 = poly1.m_vertexCount;
    var vertices1 = poly1.m_vertices;
    var local_v11 = vertices1[edge1];
    var local_v12;
    if (edge1 + 1 < count1)        {
        local_v12 = vertices1[parseInt(edge1 + 1, 10)];
    }
    else {
        local_v12 = vertices1[0];
    }
    var localTangent = Box2D.Collision.s_localTangent;
    localTangent.Set(local_v12.x - local_v11.x, local_v12.y - local_v11.y);
    localTangent.Normalize();
    var localNormal = Box2D.Collision.s_localNormal;
    localNormal.x = localTangent.y;
    localNormal.y = - localTangent.x;
    var planePoint = Box2D.Collision.s_planePoint;
    planePoint.Set(0.5 * (local_v11.x + local_v12.x), 0.5 * (local_v11.y + local_v12.y));
    var tangent = Box2D.Collision.s_tangent;
    tMat = xf1.R;
    tangent.x = tMat.col1.x * localTangent.x + tMat.col2.x * localTangent.y;
    tangent.y = tMat.col1.y * localTangent.x + tMat.col2.y * localTangent.y;
    var tangent2 = Box2D.Collision.s_tangent2;
    tangent2.x = - tangent.x;
    tangent2.y = - tangent.y;
    var normal = Box2D.Collision.s_normal;
    normal.x = tangent.y;
    normal.y = - tangent.x;
    var v11 = Box2D.Collision.s_v11;
    var v12 = Box2D.Collision.s_v12;
    v11.x = xf1.position.x + (tMat.col1.x * local_v11.x + tMat.col2.x * local_v11.y);
    v11.y = xf1.position.y + (tMat.col1.y * local_v11.x + tMat.col2.y * local_v11.y);
    v12.x = xf1.position.x + (tMat.col1.x * local_v12.x + tMat.col2.x * local_v12.y);
    v12.y = xf1.position.y + (tMat.col1.y * local_v12.x + tMat.col2.y * local_v12.y);
    var frontOffset = normal.x * v11.x + normal.y * v11.y;
    var sideOffset1 = - tangent.x * v11.x - tangent.y * v11.y + totalRadius;
    var sideOffset2 = tangent.x * v12.x + tangent.y * v12.y + totalRadius;
    var clipPoints1 = Box2D.Collision.s_clipPoints1;
    var clipPoints2 = Box2D.Collision.s_clipPoints2;
    var np = 0;
    np = Box2D.Collision.ClipSegmentToLine(clipPoints1, incidentEdge, tangent2, sideOffset1);
    if (np < 2){
        return;
    }
    np = Box2D.Collision.ClipSegmentToLine(clipPoints2, clipPoints1, tangent, sideOffset2);
    if (np < 2){
        return;
    }
    manifold.m_localPlaneNormal.SetV(localNormal);
    manifold.m_localPoint.SetV(planePoint);
    var pointCount = 0;
    for (var i = 0;i < Box2D.Settings.b2_maxManifoldPoints; ++i){
        cv = clipPoints2[i];
        var separation = normal.x * cv.v.x + normal.y * cv.v.y - frontOffset;
        if (separation <= totalRadius){
            var cp = manifold.m_points[pointCount];
            tMat = xf2.R;
            var tX = cv.v.x - xf2.position.x;
            var tY = cv.v.y - xf2.position.y;
            cp.m_localPoint.x = tX * tMat.col1.x + tY * tMat.col1.y;
            cp.m_localPoint.y = tX * tMat.col2.x + tY * tMat.col2.y;
            cp.m_id.Set(cv.id);
            cp.m_id.features.flip = flip;
            ++ pointCount;
        }
    }
    manifold.m_pointCount = pointCount;
};
 
 Box2D.Collision.CollideCircles = function(manifold, circle1, xf1, circle2, xf2){
    manifold.m_pointCount = 0;
    var tMat;
    var tVec;
    tMat = xf1.R;
    tVec = circle1.m_p;
    var p1X = xf1.position.x + (tMat.col1.x * tVec.x + tMat.col2.x * tVec.y);
    var p1Y = xf1.position.y + (tMat.col1.y * tVec.x + tMat.col2.y * tVec.y);
    tMat = xf2.R;
    tVec = circle2.m_p;
    var p2X = xf2.position.x + (tMat.col1.x * tVec.x + tMat.col2.x * tVec.y);
    var p2Y = xf2.position.y + (tMat.col1.y * tVec.x + tMat.col2.y * tVec.y);
    var dX = p2X - p1X;
    var dY = p2Y - p1Y;
    var distSqr = dX * dX + dY * dY;
    var radius = circle1.m_radius + circle2.m_radius;
    if (distSqr > radius * radius)        {
        return;
    }
    manifold.m_type = Box2D.Manifold.e_circles;
    manifold.m_localPoint.SetV(circle1.m_p);
    manifold.m_localPlaneNormal.SetZero();
    manifold.m_pointCount = 1;
    manifold.m_points[0].m_localPoint.SetV(circle2.m_p);
    manifold.m_points[0].m_id.key = 0;
};
 
 Box2D.Collision.CollidePolygonAndCircle = function(manifold, polygon, xf1, circle, xf2){
    manifold.m_pointCount = 0;
    var tPoint;
    var dX;
    var dY;
    var positionX;
    var positionY;
    var tVec;
    var tMat;
    tMat = xf2.R;
    tVec = circle.m_p;
    var cX = xf2.position.x + (tMat.col1.x * tVec.x + tMat.col2.x * tVec.y);
    var cY = xf2.position.y + (tMat.col1.y * tVec.x + tMat.col2.y * tVec.y);
    dX = cX - xf1.position.x;
    dY = cY - xf1.position.y;
    tMat = xf1.R;
    var cLocalX = dX * tMat.col1.x + dY * tMat.col1.y;
    var cLocalY = dX * tMat.col2.x + dY * tMat.col2.y;
    var dist;
    var normalIndex = 0;
    var separation = - Number.MAX_VALUE;
    var radius = polygon.m_radius + circle.m_radius;
    var vertexCount = polygon.m_vertexCount;
    var vertices = polygon.m_vertices;
    var normals = polygon.m_normals;
    for (var i = 0;i < vertexCount; ++i){
        tVec = vertices[i];
        dX = cLocalX - tVec.x;
        dY = cLocalY - tVec.y;
        tVec = normals[i];
        var s = tVec.x * dX + tVec.y * dY;
        if (s > radius){
            return;
        }
        if (s > separation){
            separation = s;
            normalIndex = i;
        }
    }
    var vertIndex1 = normalIndex;
    var vertIndex2 = vertIndex1 + 1 < vertexCount ? vertIndex1 + 1: 0;
    var v1 = vertices[vertIndex1];
    var v2 = vertices[vertIndex2];
    if (separation < Number.MIN_VALUE){
        manifold.m_pointCount = 1;
        manifold.m_type = Box2D.Manifold.e_faceA;
        manifold.m_localPlaneNormal.SetV(normals[normalIndex]);
        manifold.m_localPoint.x = 0.5 * (v1.x + v2.x);
        manifold.m_localPoint.y = 0.5 * (v1.y + v2.y);
        manifold.m_points[0].m_localPoint.SetV(circle.m_p);
        manifold.m_points[0].m_id.key = 0;
        return;
    }
    var u1 = (cLocalX - v1.x) * (v2.x - v1.x) + (cLocalY - v1.y) * (v2.y - v1.y);
    var u2 = (cLocalX - v2.x) * (v1.x - v2.x) + (cLocalY - v2.y) * (v1.y - v2.y);
    if (u1 <= 0){
        if ((cLocalX - v1.x) * (cLocalX - v1.x) + (cLocalY - v1.y) * (cLocalY - v1.y) > radius * radius){
            return;
        }
        manifold.m_pointCount = 1;
        manifold.m_type = Box2D.Manifold.e_faceA;
        manifold.m_localPlaneNormal.x = cLocalX - v1.x;
        manifold.m_localPlaneNormal.y = cLocalY - v1.y;
        manifold.m_localPlaneNormal.Normalize();
        manifold.m_localPoint.SetV(v1);
        manifold.m_points[0].m_localPoint.SetV(circle.m_p);
        manifold.m_points[0].m_id.key = 0;
    }
    else {
        if (u2 <= 0){
            if ((cLocalX - v2.x) * (cLocalX - v2.x) + (cLocalY - v2.y) * (cLocalY - v2.y) > radius * radius){
                return;
            }
            manifold.m_pointCount = 1;
            manifold.m_type = Box2D.Manifold.e_faceA;
            manifold.m_localPlaneNormal.x = cLocalX - v2.x;
            manifold.m_localPlaneNormal.y = cLocalY - v2.y;
            manifold.m_localPlaneNormal.Normalize();
            manifold.m_localPoint.SetV(v2);
            manifold.m_points[0].m_localPoint.SetV(circle.m_p);
            manifold.m_points[0].m_id.key = 0;
        }
        else {
            var faceCenterX = 0.5 * (v1.x + v2.x);
            var faceCenterY = 0.5 * (v1.y + v2.y);
            separation = (cLocalX - faceCenterX) * normals[vertIndex1].x + (cLocalY - faceCenterY) * normals[vertIndex1].y;
            if (separation > radius){
                return;
            }
            manifold.m_pointCount = 1;
            manifold.m_type = Box2D.Manifold.e_faceA;
            manifold.m_localPlaneNormal.x = normals[vertIndex1].x;
            manifold.m_localPlaneNormal.y = normals[vertIndex1].y;
            manifold.m_localPlaneNormal.Normalize();
            manifold.m_localPoint.Set(faceCenterX, faceCenterY);
            manifold.m_points[0].m_localPoint.SetV(circle.m_p);
            manifold.m_points[0].m_id.key = 0;
        }
    }
};
 
 Box2D.Collision.TestOverlap = function(a, b){
    var t1 = b.lowerBound;
    var t2 = a.upperBound;
    var d1X = t1.x - t2.x;
    var d1Y = t1.y - t2.y;
    t1 = a.lowerBound;
    t2 = b.upperBound;
    var d2X = t1.x - t2.x;
    var d2Y = t1.y - t2.y;
    if (d1X > 0 || d1Y > 0){
        return false;
    }
    if (d2X > 0 || d2Y > 0){
        return false;
    }
    return true;
};
 Box2D.Collision.b2_nullFeature = 255;
 Box2D.Collision.s_incidentEdge = Box2D.Collision.MakeClipPointVector();
 Box2D.Collision.s_clipPoints1 = Box2D.Collision.MakeClipPointVector();
 Box2D.Collision.s_clipPoints2 = Box2D.Collision.MakeClipPointVector();
 Box2D.Collision.s_edgeAO =[];
 Box2D.Collision.s_edgeBO =[];
 Box2D.Collision.s_localTangent = new Box2D.Vec2();
 Box2D.Collision.s_localNormal = new Box2D.Vec2();
 Box2D.Collision.s_planePoint = new Box2D.Vec2();
 Box2D.Collision.s_normal = new Box2D.Vec2();
 Box2D.Collision.s_tangent = new Box2D.Vec2();
 Box2D.Collision.s_tangent2 = new Box2D.Vec2();
 Box2D.Collision.s_v11 = new Box2D.Vec2();
 Box2D.Collision.s_v12 = new Box2D.Vec2();
 Box2D.Collision.b2CollidePolyTempVec = new Box2D.Vec2();
 
 Box2D.PolyAndCircleContact = function(){
    Box2D.Contact.prototype.__varz.call(this);
    this.__varz();
    this.__constructor.apply(this, arguments);
};
 extend(Box2D.PolyAndCircleContact.prototype, Box2D.Contact.prototype);
 Box2D.PolyAndCircleContact.prototype._super = Box2D.Contact.prototype;
 
 Box2D.PolyAndCircleContact.prototype.__constructor = function(){
    this._super.__constructor.apply(this, arguments);
};
 
 Box2D.PolyAndCircleContact.prototype.__varz = function(){
};
 Box2D.PolyAndCircleContact.Create = function(allocator){
    return new Box2D.PolyAndCircleContact();
};
 
 Box2D.PolyAndCircleContact.Destroy = function(contact, allocator){
};
 Box2D.PolyAndCircleContact.prototype.Evaluate = function(){
    var bA = this.m_fixtureA.m_body;
    var bB = this.m_fixtureB.m_body;
    Box2D.Collision.CollidePolygonAndCircle(this.m_manifold, this.m_fixtureA.GetShape(), bA.m_xf, this.m_fixtureB.GetShape(), bB.m_xf);
};
 
 Box2D.PolyAndCircleContact.prototype.Reset = function(fixtureA, fixtureB){
    this._super.Reset.apply(this,[fixtureA, fixtureB]);
    Box2D.Settings.b2Assert(fixtureA.GetType() == Box2D.Shape.e_polygonShape);
    Box2D.Settings.b2Assert(fixtureB.GetType() == Box2D.Shape.e_circleShape);
};
 
 Box2D.ContactPoint = function(){
    this.__varz();
    this.__constructor.apply(this, arguments);
};
 
 Box2D.ContactPoint.prototype.__constructor = function(){
};
 Box2D.ContactPoint.prototype.__varz = function(){
    this.position = new Box2D.Vec2();
    this.velocity = new Box2D.Vec2();
    this.normal = new Box2D.Vec2();
    this.id = new Box2D.ContactID();
};
 Box2D.ContactPoint.prototype.shape1 = undefined;
 Box2D.ContactPoint.prototype.shape2 = undefined;
 Box2D.ContactPoint.prototype.position = new Box2D.Vec2();
 Box2D.ContactPoint.prototype.velocity = new Box2D.Vec2();
 Box2D.ContactPoint.prototype.normal = new Box2D.Vec2();
 Box2D.ContactPoint.prototype.separation = undefined;
 Box2D.ContactPoint.prototype.friction = undefined;
 Box2D.ContactPoint.prototype.restitution = undefined;
 Box2D.ContactPoint.prototype.id = new Box2D.ContactID();
 
 Box2D.CircleContact = function(){
    Box2D.Contact.prototype.__varz.call(this);
    this.__varz();
    this.__constructor.apply(this, arguments);
};
 extend(Box2D.CircleContact.prototype, Box2D.Contact.prototype);
 Box2D.CircleContact.prototype._super = Box2D.Contact.prototype;
 
 Box2D.CircleContact.prototype.__constructor = function(){
    this._super.__constructor.apply(this, arguments);
};
 
 Box2D.CircleContact.prototype.__varz = function(){
};
 Box2D.CircleContact.Create = function(allocator){
    return new Box2D.CircleContact();
};
 
 Box2D.CircleContact.Destroy = function(contact, allocator){
};
 Box2D.CircleContact.prototype.Evaluate = function(){
    var bA = this.m_fixtureA.GetBody();
    var bB = this.m_fixtureB.GetBody();
    Box2D.Collision.CollideCircles(this.m_manifold, this.m_fixtureA.GetShape(), bA.m_xf, this.m_fixtureB.GetShape(), bB.m_xf);
};
 
 Box2D.CircleContact.prototype.Reset = function(fixtureA, fixtureB){
    this._super.Reset.apply(this,[fixtureA, fixtureB]);
};
 
 Box2D.EdgeAndCircleContact = function(){
    Box2D.Contact.prototype.__varz.call(this);
    this.__varz();
    this.__constructor.apply(this, arguments);
};
 extend(Box2D.EdgeAndCircleContact.prototype, Box2D.Contact.prototype);
 Box2D.EdgeAndCircleContact.prototype._super = Box2D.Contact.prototype;
 
 Box2D.EdgeAndCircleContact.prototype.__constructor = function(){
    this._super.__constructor.apply(this, arguments);
};
 
 Box2D.EdgeAndCircleContact.prototype.__varz = function(){
};
 Box2D.EdgeAndCircleContact.Create = function(allocator){
    return new Box2D.EdgeAndCircleContact();
};
 
 Box2D.EdgeAndCircleContact.Destroy = function(contact, allocator){
};
 Box2D.EdgeAndCircleContact.prototype.Evaluate = function(){
    var bA = this.m_fixtureA.GetBody();
    var bB = this.m_fixtureB.GetBody();
    this.b2CollideEdgeAndCircle(this.m_manifold, this.m_fixtureA.GetShape(), bA.m_xf, this.m_fixtureB.GetShape(), 
       bB.m_xf);
};
 
 Box2D.EdgeAndCircleContact.prototype.b2CollideEdgeAndCircle = function(manifold, edge, xf1, circle, xf2){
};
 Box2D.EdgeAndCircleContact.prototype.Reset = function(fixtureA, fixtureB){
    this._super.Reset.apply(this,[fixtureA, fixtureB]);
};
 
 Box2D.ContactManager = function(){
    this.__varz();
    this.__constructor.apply(this, arguments);
};
 
 Box2D.ContactManager.prototype.__constructor = function(){
    this.m_world = undefined;
    this.m_contactCount = 0;
    this.m_contactFilter = Box2D.ContactFilter.b2_defaultFilter;
    this.m_contactListener = Box2D.ContactListener.b2_defaultListener;
    this.m_contactFactory = new Box2D.ContactFactory(this.m_allocator);
    this.m_broadPhase = new Box2D.DynamicTreeBroadPhase();
};
 
 Box2D.ContactManager.prototype.__varz = function(){
};
Box2D.ContactManager.s_evalCP = new Box2D.ContactPoint();
 
 Box2D.ContactManager.prototype.AddPair = function(proxyUserDataA, proxyUserDataB){
    var fixtureA = proxyUserDataA;
    var fixtureB = proxyUserDataB;
    var bodyA = fixtureA.GetBody();
    var bodyB = fixtureB.GetBody();
    if (bodyA == bodyB){
        return;
    }
    var edge = bodyB.GetContactList();
    while (edge){
        if (edge.other == bodyA){
            var fA = edge.contact.GetFixtureA();
            var fB = edge.contact.GetFixtureB();
            if (fA == fixtureA && fB == fixtureB){
                return;
            }
            if (fA == fixtureB && fB == fixtureA){
                return;
            }
        }
        edge = edge.next;
    }
    if (bodyB.ShouldCollide(bodyA) === false){
        return;
    }
    if (this.m_contactFilter.ShouldCollide(fixtureA, fixtureB) === false){
        return;
    }
    var c = this.m_contactFactory.Create(fixtureA, fixtureB);
    fixtureA = c.GetFixtureA();
    fixtureB = c.GetFixtureB();
    bodyA = fixtureA.m_body;
    bodyB = fixtureB.m_body;
    c.m_prev = undefined;
    c.m_next = this.m_world.m_contactList;
    if (typeof this.m_world.m_contactList !== "undefined"){
        this.m_world.m_contactList.m_prev = c;
    }
    this.m_world.m_contactList = c;
    c.m_nodeA.contact = c;
    c.m_nodeA.other = bodyB;
    c.m_nodeA.prev = undefined;
    c.m_nodeA.next = bodyA.m_contactList;
    if (typeof bodyA.m_contactList !== "undefined"){
        bodyA.m_contactList.prev = c.m_nodeA;
    }
    bodyA.m_contactList = c.m_nodeA;
    c.m_nodeB.contact = c;
    c.m_nodeB.other = bodyA;
    c.m_nodeB.prev = undefined;
    c.m_nodeB.next = bodyB.m_contactList;
    if (typeof bodyB.m_contactList !== "undefined"){
        bodyB.m_contactList.prev = c.m_nodeB;
    }
    bodyB.m_contactList = c.m_nodeB;
    ++ this.m_world.m_contactCount;
    return;
};
 
 Box2D.ContactManager.prototype.FindNewContacts = function(){
    var that = this;
    this.m_broadPhase.UpdatePairs(function(a, b){
        return that.AddPair(a, b);
    });
};
 
 Box2D.ContactManager.prototype.Destroy = function(c){
    var fixtureA = c.GetFixtureA();
    var fixtureB = c.GetFixtureB();
    var bodyA = fixtureA.GetBody();
    var bodyB = fixtureB.GetBody();
    if (c.IsTouching()){
        this.m_contactListener.EndContact(c);
    }
    if (c.m_prev){
        c.m_prev.m_next = c.m_next;
    }
    if (c.m_next){
        c.m_next.m_prev = c.m_prev;
    }
    if (c == this.m_world.m_contactList){
        this.m_world.m_contactList = c.m_next;
    }
    if (c.m_nodeA.prev){
        c.m_nodeA.prev.next = c.m_nodeA.next;
    }
    if (c.m_nodeA.next){
        c.m_nodeA.next.prev = c.m_nodeA.prev;
    }
    if (c.m_nodeA == bodyA.m_contactList){
        bodyA.m_contactList = c.m_nodeA.next;
    }
    if (c.m_nodeB.prev){
        c.m_nodeB.prev.next = c.m_nodeB.next;
    }
    if (c.m_nodeB.next){
        c.m_nodeB.next.prev = c.m_nodeB.prev;
    }
    if (c.m_nodeB == bodyB.m_contactList){
        bodyB.m_contactList = c.m_nodeB.next;
    }
    this.m_contactFactory.Destroy(c);
    -- this.m_contactCount;
};
 
 Box2D.ContactManager.prototype.Collide = function(){
    var c = this.m_world.m_contactList;
	var cNuke;
    while (c){
        var fixtureA = c.GetFixtureA();
        var fixtureB = c.GetFixtureB();
        var bodyA = fixtureA.GetBody();
        var bodyB = fixtureB.GetBody();
		var activeA = bodyA.IsAwake() && bodyA.m_type != Box2D.Body.b2_staticBody;
		var activeB = bodyB.IsAwake() && bodyB.m_type != Box2D.Body.b2_staticBody;
        if ( activeA === false && activeB === false ){
            c = c.GetNext();
            continue;
        }
        if (c.m_flags & Box2D.Contact.e_filterFlag){
            if (bodyB.ShouldCollide(bodyA) === false){
				cNuke = c;
                c = cNuke.GetNext();
                this.Destroy(cNuke);
                continue;
            }
            if (this.m_contactFilter.ShouldCollide(fixtureA, fixtureB) === false){
                cNuke = c;
                c = cNuke.GetNext();
                this.Destroy(cNuke);
                continue;
            }
            c.m_flags &= ~ Box2D.Contact.e_filterFlag;
        }
        var proxyA = fixtureA.m_proxy;
        var proxyB = fixtureB.m_proxy;
        var overlap = this.m_broadPhase.TestOverlap(proxyA, proxyB);
        if (overlap === false){
            cNuke = c;
            c = cNuke.GetNext();
            this.Destroy(cNuke);
            continue;
        }
        c.Update(this.m_contactListener);
        c = c.GetNext();
    }
};
 Box2D.ContactManager.prototype.m_world = undefined;
 Box2D.ContactManager.prototype.m_broadPhase = undefined;
 Box2D.ContactManager.prototype.m_contactList = undefined;
 Box2D.ContactManager.prototype.m_contactCount = 0;
 Box2D.ContactManager.prototype.m_contactFilter = undefined;
 Box2D.ContactManager.prototype.m_contactListener = undefined;
 Box2D.ContactManager.prototype.m_contactFactory = undefined;
 Box2D.ContactManager.prototype.m_allocator = undefined;
 
 Box2D.World = function(){
    this.__varz();
    this.__constructor.apply(this, arguments);
};
 
 Box2D.World.prototype.__constructor = function(gravity, doSleep){
    this.m_destructionListener = undefined;
    this.m_debugDraw = undefined;
    this.m_bodyList = undefined;
    this.m_contactList = undefined;
    this.m_jointList = undefined;
    this.m_controllerList = undefined;
    this.m_bodyCount = 0;
    this.m_contactCount = 0;
    this.m_jointCount = 0;
    this.m_controllerCount = 0;
    Box2D.World.m_warmStarting = true;
    Box2D.World.m_continuousPhysics = true;
    this.m_allowSleep = doSleep;
    this.m_gravity = gravity;
    this.m_inv_dt0 = 0;
    this.m_contactManager.m_world = this;
    var bd = new Box2D.BodyDef();
    this.m_groundBody = this.CreateBody(bd);
};
 
 Box2D.World.prototype.__varz = function(){
    this.s_stack =[];
    this.m_contactManager = new Box2D.ContactManager();
    this.m_contactSolver = new Box2D.ContactSolver();
    this.m_island = new Box2D.Island();
};
 Box2D.World.s_timestep2 = new Box2D.TimeStep();
 Box2D.World.s_backupA = new Box2D.Sweep();
 Box2D.World.s_backupB = new Box2D.Sweep();
 Box2D.World.s_timestep = new Box2D.TimeStep();
 Box2D.World.s_queue =[];
 Box2D.World.e_newFixture = 1;
 Box2D.World.e_locked = 2;
 Box2D.World.s_xf = new Box2D.Transform();
 Box2D.World.s_jointColor = new Box2D.Color(0.5, 0.8, 0.8);
 Box2D.World.m_warmStarting = undefined;
 Box2D.World.m_continuousPhysics = undefined;
 
 Box2D.World.prototype.Solve = function(step){
    var b;
    var i;
    for (var controller = this.m_controllerList;controller;controller = controller.m_next){
        controller.Step(step);
    }
    var island = this.m_island;
    island.Initialize(this.m_bodyCount, this.m_contactCount, this.m_jointCount, undefined, this.m_contactManager.m_contactListener, 
       this.m_contactSolver);
    for (b = this.m_bodyList;b;b = b.m_next){
        b.m_flags &= ~ Box2D.Body.e_islandFlag;
    }
    for (var c = this.m_contactList;c;c = c.m_next){
        c.m_flags &= ~ Box2D.Contact.e_islandFlag;
    }
    for (var j = this.m_jointList;j;j = j.m_next){
        j.m_islandFlag = false;
    }
    var stackSize = this.m_bodyCount;
    var stack = this.s_stack;
    for (var seed = this.m_bodyList;seed;seed = seed.m_next){
        if (seed.m_flags & Box2D.Body.e_islandFlag){
            continue;
        }
        if (seed.IsAwake() === false || seed.IsActive() === false){
            continue;
        }
        if (seed.GetType() == Box2D.Body.b2_staticBody){
            continue;
        }
        island.Clear();
        var stackCount = 0;
        stack[stackCount++] = seed;
        seed.m_flags |= Box2D.Body.e_islandFlag;
        while (stackCount > 0){
            b = stack[ -- stackCount];
            island.AddBody(b);
            if (b.IsAwake() === false){
                b.SetAwake(true);
            }
            if (b.GetType() == Box2D.Body.b2_staticBody){
                continue;
            }
            var other;
            for (var ce = b.m_contactList;ce;ce = ce.next){
                if (ce.contact.m_flags & Box2D.Contact.e_islandFlag){
                    continue;
                }
                if (ce.contact.IsSensor() === true || ce.contact.IsEnabled() === false || ce.contact.IsTouching() === 
                   false){
                    continue;
                }
                island.AddContact(ce.contact);
                ce.contact.m_flags |= Box2D.Contact.e_islandFlag;
                other = ce.other;
                if (other.m_flags & Box2D.Body.e_islandFlag){
                    continue;
                }
                stack[stackCount++] = other;
                other.m_flags |= Box2D.Body.e_islandFlag;
            }
            for (var jn = b.m_jointList;jn;jn = jn.next){
                if (jn.joint.m_islandFlag === true){
                    continue;
                }
                other = jn.other;
                if (other.IsActive() === false){
                    continue;
                }
                island.AddJoint(jn.joint);
                jn.joint.m_islandFlag = true;
                if (other.m_flags & Box2D.Body.e_islandFlag){
                    continue;
                }
                stack[stackCount++] = other;
                other.m_flags |= Box2D.Body.e_islandFlag;
            }
        }
        island.Solve(step, this.m_gravity, this.m_allowSleep);
        for (i = 0;i < island.m_bodyCount; ++i){
            b = island.m_bodies[i];
            if (b.GetType() == Box2D.Body.b2_staticBody){
                b.m_flags &= ~ Box2D.Body.e_islandFlag;
            }
        }
    }
    for (i = 0;i < stack.length; ++i){
        if ( ! stack[i]){
            break;
        }
        stack[i] = undefined;
    }
    for (b = this.m_bodyList;b;b = b.m_next){
        if (b.IsAwake() === false || b.IsActive() === false){
            continue;
        }
        if (b.GetType() == Box2D.Body.b2_staticBody){
            continue;
        }
        b.SynchronizeFixtures();
    }
    this.m_contactManager.FindNewContacts();
};
 
 Box2D.World.prototype.SolveTOI = function(step){
    var b;
    var fA;
    var fB;
    var bA;
    var bB;
    var cEdge;
    var j;
    var island = this.m_island;
    island.Initialize(this.m_bodyCount, Box2D.Settings.b2_maxTOIContactsPerIsland, Box2D.Settings.b2_maxTOIJointsPerIsland, undefined, this.m_contactManager.m_contactListener, 
       this.m_contactSolver);
    var queue = Box2D.World.s_queue;
    for (b = this.m_bodyList;b;b = b.m_next){
        b.m_flags &= ~ Box2D.Body.e_islandFlag;
        b.m_sweep.t0 = 0;
    }
    var c;
    for (c = this.m_contactList;c;c = c.m_next){
        c.m_flags &= ~ (Box2D.Contact.e_toiFlag | Box2D.Contact.e_islandFlag);
    }
    for (j = this.m_jointList;j;j = j.m_next){
        j.m_islandFlag = false;
    }
    for (;;){
        var minContact = undefined;
        var minTOI = 1;
        for (c = this.m_contactList;c;c = c.m_next){
            if (c.IsSensor() === true || c.IsEnabled() === false || c.IsContinuous() === false){
                continue;
            }
            var toi = 1;
            if (c.m_flags & Box2D.Contact.e_toiFlag){
                toi = c.m_toi;
            }
            else {
                fA = c.m_fixtureA;
                fB = c.m_fixtureB;
				
				if ( fA.IsSensor()  || fB.IsSensor() ) {
					continue;
				}
				
                bA = fA.m_body;
                bB = fB.m_body;
				
				var activeA = bA.IsAwake() && bA.m_type !== Box2D.Body.b2_staticBody;
				var activeB = bB.IsAwake() && bB.m_type !== Box2D.Body.b2_staticBody;
				
                if ( activeA === false && activeB === false ){
                    continue;
                }
                var t0 = bA.m_sweep.t0;
                if (bA.m_sweep.t0 < bB.m_sweep.t0){
                    t0 = bB.m_sweep.t0;
                    bA.m_sweep.Advance(t0);
                }
                else {
                    if (bB.m_sweep.t0 < bA.m_sweep.t0){
                        t0 = bA.m_sweep.t0;
                        bB.m_sweep.Advance(t0);
                    }
                }
                toi = c.ComputeTOI(bA.m_sweep, bB.m_sweep);
                Box2D.Settings.b2Assert(0 <= toi && toi <= 1);
                if (toi > 0 && toi < 1){
                    toi = (1 - toi) * t0 + toi;
                    if (toi > 1){
                        toi = 1;
                    }
                }
                c.m_toi = toi;
                c.m_flags |= Box2D.Contact.e_toiFlag;
            }
            if (Number.MIN_VALUE < toi && toi < minTOI){
                minContact = c;
                minTOI = toi;
            }
        }
        if (typeof minContact === "undefined" || 1 - 100 * Number.MIN_VALUE < minTOI){
            break;
        }
        fA = minContact.m_fixtureA;
        fB = minContact.m_fixtureB;
        bA = fA.m_body;
        bB = fB.m_body;
        Box2D.World.s_backupA.Set(bA.m_sweep);
        Box2D.World.s_backupB.Set(bB.m_sweep);
        bA.Advance(minTOI);
        bB.Advance(minTOI);
        minContact.Update(this.m_contactManager.m_contactListener);
        minContact.m_flags &= ~ Box2D.Contact.e_toiFlag;
        if (minContact.IsSensor() === true || minContact.IsEnabled() === false){
            bA.m_sweep.Set(Box2D.World.s_backupA);
            bB.m_sweep.Set(Box2D.World.s_backupB);
            bA.SynchronizeTransform();
            bB.SynchronizeTransform();
            continue;
        }
        if (minContact.IsTouching() === false){
            continue;
        }
        var seed = bA;
        if (seed.GetType() != Box2D.Body.b2_dynamicBody){
            seed = bB;
        }
        island.Clear();
        var queueStart = 0;
        var queueSize = 0;
        queue[queueStart + queueSize++] = seed;
        seed.m_flags |= Box2D.Body.e_islandFlag;
		var other;
        while (queueSize > 0){
            b = queue[queueStart++];
            -- queueSize;
            island.AddBody(b);
            if (b.IsAwake() === false){
                b.SetAwake(true);
            }
            if (b.GetType() != Box2D.Body.b2_dynamicBody){
                continue;
            }
            for (cEdge = b.m_contactList;cEdge;cEdge = cEdge.next){
                if (island.m_contactCount == island.m_contactCapacity){
                    break;
                }
                if (cEdge.contact.m_flags & Box2D.Contact.e_islandFlag){
                    continue;
                }
                if (cEdge.contact.IsSensor() === true || cEdge.contact.IsEnabled() === false || cEdge.contact.IsTouching() === 
                   false){
                    continue;
                }
                island.AddContact(cEdge.contact);
                cEdge.contact.m_flags |= Box2D.Contact.e_islandFlag;
                other = cEdge.other;
                if (other.m_flags & Box2D.Body.e_islandFlag){
                    continue;
                }
                if (other.GetType() != Box2D.Body.b2_staticBody){
                    other.Advance(minTOI);
                    other.SetAwake(true);
                }
                queue[queueStart + queueSize] = other;
                ++ queueSize;
                other.m_flags |= Box2D.Body.e_islandFlag;
            }
            for (var jEdge = b.m_jointList;jEdge;jEdge = jEdge.next){
                if (island.m_jointCount == island.m_jointCapacity){
                    continue;
                }
                if (jEdge.joint.m_islandFlag === true){
                    continue;
                }
                other = jEdge.other;
                if (other.IsActive() === false){
                    continue;
                }
                island.AddJoint(jEdge.joint);
                jEdge.joint.m_islandFlag = true;
                if (other.m_flags & Box2D.Body.e_islandFlag){
                    continue;
                }
                if (other.GetType() != Box2D.Body.b2_staticBody){
                    other.Advance(minTOI);
                    other.SetAwake(true);
                }
                queue[queueStart + queueSize] = other;
                ++ queueSize;
                other.m_flags |= Box2D.Body.e_islandFlag;
            }
        }
        var subStep = Box2D.World.s_timestep;
        subStep.warmStarting = false;
        subStep.dt = (1 - minTOI) * step.dt;
        subStep.inv_dt = 1 / subStep.dt;
        subStep.dtRatio = 0;
        subStep.velocityIterations = step.velocityIterations;
        subStep.positionIterations = step.positionIterations;
        island.SolveTOI(subStep);
        var i = 0;
        for (i = 0;i < island.m_bodyCount; ++i){
            b = island.m_bodies[i];
            b.m_flags &= ~ Box2D.Body.e_islandFlag;
            if (b.IsAwake() === false){
                continue;
            }
            if (b.GetType() != Box2D.Body.b2_dynamicBody){
                continue;
            }
            b.SynchronizeFixtures();
            for (cEdge = b.m_contactList;cEdge;cEdge = cEdge.next){
                cEdge.contact.m_flags &= ~ Box2D.Contact.e_toiFlag;
            }
        }
        for (i = 0;i < island.m_contactCount; ++i){
            c = island.m_contacts[i];
            c.m_flags &= ~ (Box2D.Contact.e_toiFlag | Box2D.Contact.e_islandFlag);
        }
        for (i = 0;i < island.m_jointCount; ++i){
            j = island.m_joints[i];
            j.m_islandFlag = false;
        }
        this.m_contactManager.FindNewContacts();
    }
};

Box2D.World.prototype.DrawJoint = function(joint){
    var b1 = joint.GetBodyA();
    var b2 = joint.GetBodyB();
    var xf1 = b1.m_xf;
    var xf2 = b2.m_xf;
    var x1 = xf1.position;
    var x2 = xf2.position;
    var p1 = joint.GetAnchorA();
    var p2 = joint.GetAnchorB();
    var color = Box2D.World.s_jointColor;
    switch (joint.m_type){
        case Box2D.Joint.e_distanceJoint: 
            this.m_debugDraw.DrawSegment(p1, p2, color);
            break;
        case Box2D.Joint.e_pulleyJoint: 
            var pulley = joint;
            var s1 = pulley.GetGroundAnchorA();
            var s2 = pulley.GetGroundAnchorB();
            this.m_debugDraw.DrawSegment(s1, p1, color);
            this.m_debugDraw.DrawSegment(s2, p2, color);
            this.m_debugDraw.DrawSegment(s1, s2, color);
            break;
        case Box2D.Joint.e_mouseJoint: 
            this.m_debugDraw.DrawSegment(p1, p2, color);
            break;
        default: 
            if (b1 != this.m_groundBody){
                this.m_debugDraw.DrawSegment(x1, p1, color);
            }
            this.m_debugDraw.DrawSegment(p1, p2, color);
            if (b2 != this.m_groundBody){
                this.m_debugDraw.DrawSegment(x2, p2, color);
            }
    }
};
 
 Box2D.World.prototype.DrawShape = function(shape, xf, color){
    switch (shape.m_type){
        case Box2D.Shape.e_circleShape: 
            var circle = shape;
            var center = Box2D.Math.MulX(xf, circle.m_p);
            var radius = circle.m_radius;
            var axis = xf.R.col1;
            this.m_debugDraw.DrawSolidCircle(center, radius, axis, color);
            break;
        case Box2D.Shape.e_polygonShape: 
            var i = 0;
            var poly = shape;
            var vertexCount = poly.GetVertexCount();
            var localVertices = poly.GetVertices();
            var vertices =[];
            for (i = 0;i < vertexCount; ++i){
                vertices[i] = Box2D.Math.MulX(xf, localVertices[i]);
            }
            this.m_debugDraw.DrawSolidPolygon(vertices, vertexCount, color);
            break;
        case Box2D.Shape.e_edgeShape: 
            var edge = shape;
            this.m_debugDraw.DrawSegment(Box2D.Math.MulX(xf, edge.GetVertex1()), Box2D.Math.MulX(xf, edge.GetVertex2()), color);
            break;
    }
};
 
 Box2D.World.prototype.SetDestructionListener = function(listener){
    this.m_destructionListener = listener;
};
 
 Box2D.World.prototype.SetContactFilter = function(filter){
    this.m_contactManager.m_contactFilter = filter;
};
 
 Box2D.World.prototype.SetContactListener = function(listener){
    this.m_contactManager.m_contactListener = listener;
};
 
 Box2D.World.prototype.SetDebugDraw = function(debugDraw){
    this.m_debugDraw = debugDraw;
};
 
 Box2D.World.prototype.SetBroadPhase = function(broadPhase){
    var oldBroadPhase = this.m_contactManager.m_broadPhase;
    this.m_contactManager.m_broadPhase = broadPhase;
    for (var b = this.m_bodyList;b;b = b.m_next){
        for (var f = b.m_fixtureList;f;f = f.m_next){
            f.m_proxy = broadPhase.CreateProxy(oldBroadPhase.GetFatAABB(f.m_proxy), f);
        }
    }
};
 
 Box2D.World.prototype.Validate = function(){
    this.m_contactManager.m_broadPhase.Validate();
};
 
 Box2D.World.prototype.GetProxyCount = function(){
    return this.m_contactManager.m_broadPhase.GetProxyCount();
};
 
 Box2D.World.prototype.CreateBody = function(def){
    if (this.IsLocked() === true){
        return undefined;
    }
    var b = new Box2D.Body(def, this);
    b.m_prev = undefined;
    b.m_next = this.m_bodyList;
    if (this.m_bodyList){
        this.m_bodyList.m_prev = b;
    }
    this.m_bodyList = b;
    ++ this.m_bodyCount;
    return b;
};
 
 Box2D.World.prototype.DestroyBody = function(b){
    if (this.IsLocked() === true){
        return;
    }
    var jn = b.m_jointList;
    while (jn){
        var jn0 = jn;
        jn = jn.next;
        if (this.m_destructionListener){
            this.m_destructionListener.SayGoodbyeJoint(jn0.joint);
        }
        this.DestroyJoint(jn0.joint);
    }
    var coe = b.m_controllerList;
    while (coe){
        var coe0 = coe;
        coe = coe.nextController;
        coe0.controller.RemoveBody(b);
    }
    var ce = b.m_contactList;
    while (ce){
        var ce0 = ce;
        ce = ce.next;
        this.m_contactManager.Destroy(ce0.contact);
    }
    b.m_contactList = undefined;
    var f = b.m_fixtureList;
    while (f){
        var f0 = f;
        f = f.m_next;
        if (this.m_destructionListener){
            this.m_destructionListener.SayGoodbyeFixture(f0);
        }
        f0.DestroyProxy(this.m_contactManager.m_broadPhase);
        f0.Destroy();
    }
    b.m_fixtureList = undefined;
    b.m_fixtureCount = 0;
    if (b.m_prev){
        b.m_prev.m_next = b.m_next;
    }
    if (b.m_next){
        b.m_next.m_prev = b.m_prev;
    }
    if (b == this.m_bodyList){
        this.m_bodyList = b.m_next;
    }
    -- this.m_bodyCount;
};
 
 Box2D.World.prototype.CreateJoint = function(def){
    var j = Box2D.Joint.Create(def, undefined);
    j.m_prev = undefined;
    j.m_next = this.m_jointList;
    if (this.m_jointList){
        this.m_jointList.m_prev = j;
    }
    this.m_jointList = j;
    ++ this.m_jointCount;
    j.m_edgeA.joint = j;
    j.m_edgeA.other = j.m_bodyB;
    j.m_edgeA.prev = undefined;
    j.m_edgeA.next = j.m_bodyA.m_jointList;
    if (j.m_bodyA.m_jointList){
        j.m_bodyA.m_jointList.prev = j.m_edgeA;
    }
    j.m_bodyA.m_jointList = j.m_edgeA;
    j.m_edgeB.joint = j;
    j.m_edgeB.other = j.m_bodyA;
    j.m_edgeB.prev = undefined;
    j.m_edgeB.next = j.m_bodyB.m_jointList;
    if (j.m_bodyB.m_jointList){
        j.m_bodyB.m_jointList.prev = j.m_edgeB;
    }
    j.m_bodyB.m_jointList = j.m_edgeB;
    var bodyA = def.bodyA;
    var bodyB = def.bodyB;
    if (def.collideConnected === false){
        var edge = bodyB.GetContactList();
        while (edge){
            if (edge.other == bodyA){
                edge.contact.FlagForFiltering();
            }
            edge = edge.next;
        }
    }
    return j;
};
 
 Box2D.World.prototype.DestroyJoint = function(j){
    var collideConnected = j.m_collideConnected;
    if (j.m_prev){
        j.m_prev.m_next = j.m_next;
    }
    if (j.m_next){
        j.m_next.m_prev = j.m_prev;
    }
    if (j == this.m_jointList){
        this.m_jointList = j.m_next;
    }
    var bodyA = j.m_bodyA;
    var bodyB = j.m_bodyB;
    bodyA.SetAwake(true);
    bodyB.SetAwake(true);
    if (j.m_edgeA.prev){
        j.m_edgeA.prev.next = j.m_edgeA.next;
    }
    if (j.m_edgeA.next){
        j.m_edgeA.next.prev = j.m_edgeA.prev;
    }
    if (j.m_edgeA == bodyA.m_jointList){
        bodyA.m_jointList = j.m_edgeA.next;
    }
    j.m_edgeA.prev = undefined;
    j.m_edgeA.next = undefined;
    if (j.m_edgeB.prev){
        j.m_edgeB.prev.next = j.m_edgeB.next;
    }
    if (j.m_edgeB.next){
        j.m_edgeB.next.prev = j.m_edgeB.prev;
    }
    if (j.m_edgeB == bodyB.m_jointList){
        bodyB.m_jointList = j.m_edgeB.next;
    }
    j.m_edgeB.prev = undefined;
    j.m_edgeB.next = undefined;
    Box2D.Joint.Destroy(j, undefined);
    -- this.m_jointCount;
    if (collideConnected === false){
        var edge = bodyB.GetContactList();
        while (edge){
            if (edge.other == bodyA){
                edge.contact.FlagForFiltering();
            }
            edge = edge.next;
        }
    }
};
 
 Box2D.World.prototype.AddController = function(c){
    c.m_next = this.m_controllerList;
    c.m_prev = undefined;
    this.m_controllerList = c;
    c.m_world = this;
    this.m_controllerCount++;
    return c;
};
 
 Box2D.World.prototype.RemoveController = function(c)    {
    if (c.m_prev){
        c.m_prev.m_next = c.m_next;
    }
    if (c.m_next){
        c.m_next.m_prev = c.m_prev;
    }
    if (this.m_controllerList == c){
        this.m_controllerList = c.m_next;
    }
    this.m_controllerCount--;
};
 
 Box2D.World.prototype.CreateController = function(controller){
    if (controller.m_world != this){
        throw new Error("Controller can only be a member of one world");
    }
    controller.m_next = this.m_controllerList;
    controller.m_prev = undefined;
    if (this.m_controllerList){
        this.m_controllerList.m_prev = controller;
    }
    this.m_controllerList = controller;
    ++ this.m_controllerCount;
    controller.m_world = this;
    return controller;
};
 
 Box2D.World.prototype.DestroyController = function(controller)    {
    controller.Clear();
    if (controller.m_next){
        controller.m_next.m_prev = controller.m_prev;
    }
    if (controller.m_prev){
        controller.m_prev.m_next = controller.m_next;
    }
    if (controller == this.m_controllerList){
        this.m_controllerList = controller.m_next;
    }
    -- this.m_controllerCount;
};
 
 Box2D.World.prototype.SetWarmStarting = function(flag){
    Box2D.World.m_warmStarting = flag;
};
 
 Box2D.World.prototype.SetContinuousPhysics = function(flag){
    Box2D.World.m_continuousPhysics = flag;
};
 
 Box2D.World.prototype.GetBodyCount = function(){
    return this.m_bodyCount;
};
 
 Box2D.World.prototype.GetJointCount = function(){
    return this.m_jointCount;
};
 
 Box2D.World.prototype.GetContactCount = function(){
    return this.m_contactCount;
};
 
 Box2D.World.prototype.SetGravity = function(gravity){
    this.m_gravity = gravity;
};
 
 Box2D.World.prototype.GetGravity = function(){
    return this.m_gravity;
};
 
 Box2D.World.prototype.GetGroundBody = function(){
    return this.m_groundBody;
};
 
 Box2D.World.prototype.Step = function(dt, velocityIterations, positionIterations){
    if (this.m_flags & Box2D.World.e_newFixture){
        this.m_contactManager.FindNewContacts();
        this.m_flags &= ~ Box2D.World.e_newFixture;
    }
    this.m_flags |= Box2D.World.e_locked;
    var step = Box2D.World.s_timestep2;
    step.dt = dt;
    step.velocityIterations = velocityIterations;
    step.positionIterations = positionIterations;
    if (dt > 0){
        step.inv_dt = 1 / dt;
    }
    else {
        step.inv_dt = 0;
    }
    step.dtRatio = this.m_inv_dt0 * dt;
    step.warmStarting = Box2D.World.m_warmStarting;
    this.m_contactManager.Collide();
    if (step.dt > 0){
        this.Solve(step);
    }
    if (Box2D.World.m_continuousPhysics && step.dt > 0){
        this.SolveTOI(step);
    }
    if (step.dt > 0){
        this.m_inv_dt0 = step.inv_dt;
    }
    this.m_flags &= ~ Box2D.World.e_locked;
};
 
 Box2D.World.prototype.ClearForces = function(){
    for (var body = this.m_bodyList;body;body = body.m_next){
        body.m_force.SetZero();
        body.m_torque = 0;
    }
};
 
 Box2D.World.prototype.DrawDebugData = function( clear ){
    if (typeof this.m_debugDraw === "undefined"){
        return;
    }
    if ( clear !== false ) {
		this.m_debugDraw.Clear();
	}
    var flags = this.m_debugDraw.GetFlags();
    var i = 0;
    var b;
    var f;
    var s;
    var j;
    var bp;
    var invQ = new Box2D.Vec2();
    var x1 = new Box2D.Vec2();
    var x2 = new Box2D.Vec2();
    var xf;
    var b1 = new Box2D.AABB();
    var b2 = new Box2D.AABB();
    var vs =[new Box2D.Vec2(), new Box2D.Vec2(), new Box2D.Vec2(), new Box2D.Vec2()];
    var color = new Box2D.Color(0, 0, 0);
    if (flags & Box2D.DebugDraw.e_shapeBit){
        for (b = this.m_bodyList;b;b = b.m_next){
            xf = b.m_xf;
            for (f = b.GetFixtureList();f;f = f.m_next){
                s = f.GetShape();
                if (b.IsActive() === false){
                    color.Set(0.5, 0.5, 0.3);
                    this.DrawShape(s, xf, color);
                }
                else {
                    if (b.GetType() == Box2D.Body.b2_staticBody){
                        color.Set(0.5, 0.9, 0.5);
                        this.DrawShape(s, xf, color);
                    }
                    else {
                        if (b.GetType() == Box2D.Body.b2_kinematicBody){
                            color.Set(0.5, 0.5, 0.9);
                            this.DrawShape(s, xf, color);
                        }
                        else {
                            if (b.IsAwake() === false){
                                color.Set(0.6, 0.6, 0.6);
                                this.DrawShape(s, xf, color);
                            }
                            else {
                                color.Set(0.9, 0.7, 0.7);
                                this.DrawShape(s, xf, color);
                            }
                        }
                    }
                }
            }
        }
    }
    if (flags & Box2D.DebugDraw.e_jointBit){
        for (j = this.m_jointList;j;j = j.m_next){
            this.DrawJoint(j);
        }
    }
    if (flags & Box2D.DebugDraw.e_controllerBit){
        for (var c = this.m_controllerList;c;c = c.m_next){
            c.Draw(this.m_debugDraw);
        }
    }
    if (flags & Box2D.DebugDraw.e_pairBit){
        color.Set(0.3, 0.9, 0.9);
        for (var contact = this.m_contactManager.m_contactList;contact;contact = contact.GetNext()){
            var fixtureA = contact.GetFixtureA();
            var fixtureB = contact.GetFixtureB();
            var cA = fixtureA.GetAABB().GetCenter();
            var cB = fixtureB.GetAABB().GetCenter();
            this.m_debugDraw.DrawSegment(cA, cB, color);
        }
    }
    if (flags & Box2D.DebugDraw.e_aabbBit){
        bp = this.m_contactManager.m_broadPhase;
        vs =[new Box2D.Vec2(), new Box2D.Vec2(), new Box2D.Vec2(), new Box2D.Vec2()];
        for (b = this.m_bodyList;b;b = b.GetNext()){
            if (b.IsActive() === false){
                continue;
            }
            for (f = b.GetFixtureList();f;f = f.GetNext()){
                var aabb = bp.GetFatAABB(f.m_proxy);
                vs[0].Set(aabb.lowerBound.x, aabb.lowerBound.y);
                vs[1].Set(aabb.upperBound.x, aabb.lowerBound.y);
                vs[2].Set(aabb.upperBound.x, aabb.upperBound.y);
                vs[3].Set(aabb.lowerBound.x, aabb.upperBound.y);
                this.m_debugDraw.DrawPolygon(vs, 4, color);
            }
        }
    }
    if (flags & Box2D.DebugDraw.e_centerOfMassBit){
        for (b = this.m_bodyList;b;b = b.m_next){
            xf = Box2D.World.s_xf;
            xf.R = b.m_xf.R;
            xf.position = b.GetWorldCenter();
            this.m_debugDraw.DrawTransform(xf);
        }
    }
};

Box2D.World.prototype.QueryAABB = function(callback, aabb){
    var broadPhase = this.m_contactManager.m_broadPhase;
    
    function WorldQueryWrapper(proxy){
        return callback(broadPhase.GetUserData(proxy));
    }
    broadPhase.Query(WorldQueryWrapper, aabb);
};
 
 Box2D.World.prototype.QueryShape = function(callback, shape, transform){
    if (typeof transform === "undefined"){
        transform = new Box2D.Transform();
        transform.SetIdentity();
    }
    var broadPhase = this.m_contactManager.m_broadPhase;
    
    function WorldQueryWrapper(proxy){
        var fixture = broadPhase.GetUserData(proxy);
        if (Box2D.Shape.TestOverlap(shape, transform, fixture.GetShape(), fixture.GetBody().GetTransform())){
            return callback(fixture);
        }
        return true;
    }
    var aabb = new Box2D.AABB();
    shape.ComputeAABB(aabb, transform);
    broadPhase.Query(WorldQueryWrapper, aabb);
};
 
 Box2D.World.prototype.QueryPoint = function(callback, p){
    var broadPhase = this.m_contactManager.m_broadPhase;
    
    function WorldQueryWrapper(proxy){
        var fixture = broadPhase.GetUserData(proxy);
        if (fixture.TestPoint(p)){
            return callback(fixture);
        }
        return true;
    }
    var aabb = new Box2D.AABB();
    aabb.lowerBound.Set(p.x - Box2D.Settings.b2_linearSlop, p.y - Box2D.Settings.b2_linearSlop);
    aabb.upperBound.Set(p.x + Box2D.Settings.b2_linearSlop, p.y + Box2D.Settings.b2_linearSlop);
    broadPhase.Query(WorldQueryWrapper, aabb);
};
 
 Box2D.World.prototype.RayCast = function(callback, point1, point2){
    var broadPhase = this.m_contactManager.m_broadPhase;
    var output = new Box2D.RayCastOutput();
    
    function RayCastWrapper(input, proxy){
        var userData = broadPhase.GetUserData(proxy);
        var fixture = userData;
        var hit = fixture.RayCast(output, input);
        if (hit){
            var fraction = output.fraction;
            var point = new Box2D.Vec2((1 - fraction) * point1.x + fraction * point2.x, (1 - fraction) * point1.y + 
               fraction * point2.y);
            return callback(fixture, point, output.normal, fraction);
        }
        return input.maxFraction;
    }
    var input = new Box2D.RayCastInput(point1, point2);
    broadPhase.RayCast(RayCastWrapper, input);
};
 
 Box2D.World.prototype.RayCastOne = function(point1, point2){
    var result;
    
    function RayCastOneWrapper(fixture, point, normal, fraction){
        result = fixture;
        return fraction;
    }
    this.RayCast(RayCastOneWrapper, point1, point2);
    return result;
};
 
 Box2D.World.prototype.RayCastAll = function(point1, point2){
    var result =[];
    
    function RayCastAllWrapper(fixture, point, normal, fraction){
        result[result.length] = fixture;
        return 1;
    }
    this.RayCast(RayCastAllWrapper, point1, point2);
    return result;
};
 
 Box2D.World.prototype.GetBodyList = function(){
    return this.m_bodyList;
};
 
 Box2D.World.prototype.GetJointList = function(){
    return this.m_jointList;
};

Box2D.World.prototype.GetContactList = function(){
    return this.m_contactList;
};

Box2D.World.prototype.IsLocked = function(){
    return (this.m_flags & Box2D.World.e_locked) > 0;
};

Box2D.World.prototype.s_stack =[];
 Box2D.World.prototype.m_flags = 0;
 Box2D.World.prototype.m_contactManager = new Box2D.ContactManager();
 Box2D.World.prototype.m_contactSolver = new Box2D.ContactSolver();
 Box2D.World.prototype.m_island = new Box2D.Island();
 Box2D.World.prototype.m_bodyList = undefined;
 Box2D.World.prototype.m_jointList = undefined;
 Box2D.World.prototype.m_contactList = undefined;
 Box2D.World.prototype.m_bodyCount = 0;
 Box2D.World.prototype.m_contactCount = 0;
 Box2D.World.prototype.m_jointCount = 0;
 Box2D.World.prototype.m_controllerList = undefined;
 Box2D.World.prototype.m_controllerCount = 0;
 Box2D.World.prototype.m_gravity = undefined;
 Box2D.World.prototype.m_allowSleep = undefined;
 Box2D.World.prototype.m_groundBody = undefined;
 Box2D.World.prototype.m_destructionListener = undefined;
 Box2D.World.prototype.m_debugDraw = undefined;
 Box2D.World.prototype.m_inv_dt0 = undefined;
 
} );