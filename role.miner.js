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
    run: function(creep) {
        
        let sites = creep.room.find(FIND_STRUCTURES, {
            filter: (structure) => {
                return (structure.structureType == STRUCTURE_CONTAINER && structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0);
            }
        })

        if (sites.length > 0) {
            if (creep.pos.getRangeTo(sites[0]) == 0) {
                let source = creep.pos.findClosestByPath(FIND_SOURCES);
                creep.harvest(source);
            } else {
                creep.moveTo(sites[0], {visualizePathStyle: {stroke: '#ffffff'}});
            }
        }
	}
};

module.exports = roleMiner;
