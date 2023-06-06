/*
 * Module code goes here. Use 'module.exports' to export things:
 * module.exports.thing = 'a thing';
 *
 * You can import it from another modules like this:
 * var mod = require('role.miner');
 * mod.thing == 'a thing'; // true
 */

// recommend body: 6 WORK, 1 CARRY, 3 MOVE (800e) for reserved room, 3 WORK, 1 CARRY, 2 MOVE (550e) for unreserved room
// remote miner
// local miner body: 4 WORK, 1 MOVE (450e)

let roleMiner = {

    /* @param {Creep} creep */
    run: function(creep, site) {
        if (creep.harvest(site) == ERR_NOT_IN_RANGE) {
            creep.moveTo(site, {visualizePathStyle: {stroke: '#ffaa00'}});
        }
	}
};

module.exports = roleMiner;
