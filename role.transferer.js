/*
 * Module code goes here. Use 'module.exports' to export things:
 * module.exports.thing = 'a thing';
 *
 * You can import it from another modules like this:
 * var mod = require('role.harvester');
 * mod.thing == 'a thing'; // true
 */

function transferToOtherContainer(creep) {
    let targets = creep.room.find(FIND_STRUCTURES, {
        filter: (structure) => {
            return (structure.structureType == STRUCTURE_CONTAINER)
                && (structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0);
        }
    });
    if (targets.length > 0) {
        if (creep.transfer(targets[1], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
            creep.moveTo(targets[1], {visualizePathStyle: {stroke: '#ffaa00'}});
        }
    }
}


let roleTransferer = {

    /** @param {Creep} creep **/
    run: function(creep) {

        if (creep.memory.transferring && creep.store[RESOURCE_ENERGY] == 0) {
            creep.memory.transferring = false;
            creep.say('Harvest!');
        }
        if (!creep.memory.tranferring && creep.store.getFreeCapacity() == 0) {
            creep.memory.transferring = true;
            creep.say('Transfer!');
        }

	    if (creep.memory.transferring) {
            let targets = creep.room.find(FIND_STRUCTURES, {
                filter: (structure) => {
                    return (structure.structureType == STRUCTURE_EXTENSION
                        || structure.structureType == STRUCTURE_SPAWN
                        || structure.structureType == STRUCTURE_TOWER)
                        && structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0;
                }
            });

            if (targets.length > 0) {
                if (creep.transfer(targets[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(targets[0], {visualizePathStyle: {stroke: '#ffaa00'}});
                }
            } else {
                transferToOtherContainer(creep);
            }
        } else {
            let sources = creep.room.find(FIND_STRUCTURES, {
                filter: (structure) => {
                    return (structure.structureType == STRUCTURE_CONTAINER)
                        && (structure.store[RESOURCE_ENERGY] > 0);
                }
            });

            if (sources.length > 0) {
                if (creep.withdraw(sources[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(sources[0], {visualizePathStyle: {stroke: '#ffffff'}});
                }
            }
        }
	}
};

module.exports = roleTransferer;
// TODO: pick up energy on the ground
