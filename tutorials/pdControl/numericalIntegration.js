/**
 * Created by bsaund on 6/16/15.
 */


/**
 * 4th order Runge Kutta step
 * @param {Array} s0 current state vector
 * @param {Number} dt timestep
 * @param {Function} kinematics kinematics function
 * @return {Array} next state vector
 */
function RungeKutta4Step (s0, dt, kinematics) {

    var k0 = kinematics(s0);
    var k1 = kinematics(vectorAdd(s0, vectorScale(dt/2, k0)));
    var k2 = kinematics(vectorAdd(s0, vectorScale(dt/2, k1)));
    var k3 = kinematics(vectorAdd(s0, vectorScale(dt, k2)));

    //s0 + dt/6*(k0 + 2*k1 + 2*k2 + k3)
    return vectorAdd(s0, vectorScale(dt/6,
        vectorAdd(k0,
            vectorScale(2, k1),
            vectorScale(2, k2),
            k3)));
}

/**
 * Adds any number of vectors together
 */
function vectorAdd() {
    var vectors = Array.prototype.slice.call(arguments);

    if(vectors.length == 1) {
        return vectors[0];
    }
    if(vectors[0].length != vectors[1].length){
        throw "Cannot add vectors of different lengths"
    }

    vectors[1] = vectors[1].map(function(value, index) {
        return value + vectors[0][index]
    });

    return vectorAdd.apply(this, vectors.slice(1));
}

function vectorScale(a, v1) {
    return v1.map(function(value){return value * a});
}
