"use strict";

// Particle constructor
function Particle(x, y, z, mass) {
  this.position = new THREE.Vector3(); // position
  this.previous = new THREE.Vector3(); // previous
  this.original = new THREE.Vector3(); // original
  initParameterizedPosition(x, y, this.position);
  initParameterizedPosition(x, y, this.previous);
  initParameterizedPosition(x, y, this.original);

  this.netForce = new THREE.Vector3(); // net force acting on particle
  this.mass = mass; // mass of the particle
  this.correction = new THREE.Vector3(); // offset to apply to enforce constraints
}

// Snap a particle back to its original position
Particle.prototype.lockToOriginal = function() {
  this.position.copy(this.original);
  this.previous.copy(this.original);
};

// Snap a particle back to its previous position
Particle.prototype.lock = function() {
  this.position.copy(this.previous);
  this.previous.copy(this.previous);
};

// Add the given force to a particle's total netForce.
// Params:
// * force: THREE.Vector3 - the force to add
Particle.prototype.addForce = function(force) {
  // ----------- STUDENT CODE BEGIN ------------
  // ----------- Our reference solution uses 1 lines of code.
  this.netForce.add(force);
  // ----------- STUDENT CODE END ------------
};

// Perform Verlet integration on this particle with the provided
// timestep deltaT.
// Params:
// * deltaT: Number - the length of time dt over which to integrate
Particle.prototype.integrate = function(deltaT) {
  const DAMPING = SceneParams.DAMPING;

  // ----------- STUDENT CODE BEGIN ------------
  // You need to:
  // (1) Save the old (i.e. current) position into this.previous.
  // (2) Compute the new position of this particle using Verlet integration,
  //     and store it into this.position.
  // (3) Reset the net force acting on the particle (i.e. make it (0, 0, 0) again).
  // ----------- Our reference solution uses 13 lines of code.
  let prev = this.previous.clone();
  this.previous = this.position.clone();

  let D = 1 - DAMPING;

  let vel = this.position.clone().sub(prev.clone()).multiplyScalar(D);
  let acc = this.netForce.divideScalar(this.mass);
  let a = acc.clone().multiplyScalar(deltaT*deltaT);
  this.position = this.position.clone().add(vel.clone()).add(a.clone());
  this.netForce = new THREE.Vector3(0,0,0);

  // ----------- STUDENT CODE END ------------
};

// Handle collisions between this Particle and the provided floor.
// Note: the fields of floor are documented for completeness, but you
//       *WILL NOT* need to use all of them.
// Params:
// * floor: An object representing the floor of the scene, with properties:
//    - mesh: THREE.Mesh - the physical representation in the scene
//    - geometry: THREE.PlaneBufferGeometry - the abstract geometric representation
//    - material: THREE.MeshPhongMaterial - material information for lighting
Particle.prototype.handleFloorCollision = function(floor) {
  let floorMesh = floor.mesh;
  let floorPosition = floorMesh.position;
  const EPS = 5;
  // ----------- STUDENT CODE BEGIN ------------
  // Handle collision of this particle with the floor.
  // ----------- Our reference solution uses 4 lines of code.
  if(this.position.y - floorPosition.y < EPS) this.position.y = floorPosition.y + EPS;
  
  // ----------- STUDENT CODE END ------------
};

// Handle collisions between this Particle and the provided sphere.
// Note: the fields of sphere are documented for completeness, but you
//       *WILL NOT* need to use all of them.
// Params:
// * sphere: An object representing a sphere in the scene, with properties:
//    - mesh: THREE.Mesh - the physical representation in the scene
//    - geometry: THREE.SphereGeometry - the abstract geometric representation
//    - material: THREE.MeshPhongMaterial - material information for lighting
//    - radius: number - the radius of the sphere
//    - position: THREE.Vector3 - the sphere's position in this frame
//    - prevPosition: THREE.Vector3 - the sphere's position in the previous frame
Particle.prototype.handleSphereCollision = function(sphere) {
  if (sphere.mesh.visible) {
    const friction = SceneParams.friction;
    let spherePosition = sphere.position.clone();
    let prevSpherePosition = sphere.prevPosition.clone();
    let EPS = 5; // empirically determined
    // ----------- STUDENT CODE BEGIN ------------
    // Handle collision of this particle with the sphere.
    // As with the floor, use EPS to prevent clipping.
    let posFriction = new THREE.Vector3();
    let posNoFriction = new THREE.Vector3();
    // ----------- Our reference solution uses 28 lines of code.
    let vpoint = this.position.clone().sub(spherePosition);
    let rad = sphere.radius;
    //console.log(rad)
    //console.log(vpoint.length())
    if (vpoint.length() - rad  >= EPS) return this.position;

   
    posNoFriction = spherePosition.clone().add(vpoint.clone().normalize().multiplyScalar(rad+EPS));
    //this.position = posNoFriction
    let velocity = spherePosition.clone().sub(prevSpherePosition);
    posFriction = this.previous.clone().add(velocity);

    if (vpoint.length() - rad  < EPS) this.position = posNoFriction;
    else this.position = posFriction.clone().multiplyScalar(friction).add(posNoFriction.clone().multiplyScalar(1-friction));


    // ----------- STUDENT CODE END ------------
  }
};

// Handle collisions between this Particle and the provided axis-aligned box.
// Note: the fields of box are documented for completeness, but you
//       *WILL NOT* need to use all of them.
// Params:
// * box: An object representing an axis-aligned box in the scene, with properties:
//    - mesh: THREE.Mesh - the physical representation in the scene
//    - geometry: THREE.BoxGeometry - the abstract geometric representation
//    - material: THREE.MeshPhongMaterial - material information for lighting
//    - boundingBox: THREE.Box3 - the bounding box of the box in the scene
Particle.prototype.handleBoxCollision = function(box) {
  if (box.mesh.visible) {
    const friction = SceneParams.friction;
    let boundingBox = box.boundingBox.clone();
    const EPS = 10; // empirically determined
    // ----------- STUDENT CODE BEGIN ------------
    // Handle collision of this particle with the axis-aligned box.
    // As before, use EPS to prevent clipping
    let posFriction = new THREE.Vector3();
    let posNoFriction = new THREE.Vector3();

    // ----------- Our reference solution uses 66 lines of code.

    if (boundingBox.distanceToPoint(this.position) > EPS) return;

    var closestside = Infinity;
    if (Math.abs(boundingBox.min.x - this.position.x) < closestside){
      closestside = Math.abs(boundingBox.min.x - this.position.x);
      posNoFriction.x = boundingBox.min.x - EPS
      posNoFriction.y = this.position.y
      posNoFriction.z = this.position.z
    }    
    if (Math.abs(boundingBox.max.x - this.position.x) < closestside){
      closestside = Math.abs(boundingBox.max.x - this.position.x);
      posNoFriction.x = boundingBox.max.x + EPS
      posNoFriction.y = this.position.y
      posNoFriction.z = this.position.z
    }    
    if (Math.abs(boundingBox.min.y - this.position.y) < closestside){
      closestside = Math.abs(boundingBox.min.y - this.position.y);
      posNoFriction.x = this.position.x
      posNoFriction.y = boundingBox.min.y - EPS
      posNoFriction.z = this.position.z
    }    
    if (Math.abs(boundingBox.max.y - this.position.y) < closestside){
      closestside = Math.abs(boundingBox.max.y - this.position.y);
      posNoFriction.x = this.position.x
      posNoFriction.y = boundingBox.max.y + EPS
      posNoFriction.z = this.position.z
    }    
    if (Math.abs(boundingBox.min.z - this.position.z) < closestside){
      closestside = Math.abs(boundingBox.min.z - this.position.z);
      posNoFriction.x = this.position.x
      posNoFriction.y = this.position.y
      posNoFriction.z = boundingBox.min.z - EPS
    }    
    if (Math.abs(boundingBox.max.z - this.position.z) < closestside){
      closestside = Math.abs(boundingBox.max.z - this.position.z);
      posNoFriction.x = this.position.x
      posNoFriction.y = this.position.y
      posNoFriction.z = boundingBox.max.z + EPS
    }    
    
    //console.log(boundingBox.containsPoint(posNoFriction))
    
    if (boundingBox.distanceToPoint(this.previous) < EPS) this.position = posNoFriction;
    else this.position = this.previous.clone().multiplyScalar(friction).add(posNoFriction.clone().multiplyScalar(1-friction));
    //if (boundingBox.containsPoint(this.position)) console.log('why')
    // ----------- STUDENT CODE END ------------
  }
};

// ------------------------ Don't worry about this ---------------------------
// Apply the cached correction vector to this particle's position, and
// then zero out the correction vector.
// Particle.prototype.applyCorrection = function() {
//   this.position.add(this.correction);
//   this.correction.set(0,0,0);
// }
