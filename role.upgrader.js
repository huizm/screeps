/*
 * Module code goes here. Use 'module.exports' to export things:
 * module.exports.thing = 'a thing';
 *
 * You can import it from another modules like this:
 * var mod = require('role.upgrader');
 * mod.thing == 'a thing'; // true
 */

function replenishEnergy(creep) {
    let containers = creep.room.find(FIND_STRUCTURES, {
        filter: (structure) => {
            return (structure.structureType == STRUCTURE_CONTAINER)
                && (structure.store[RESOURCE_ENERGY] > 0);
        }
    });
	
	if (containers.length > 0) {
		if (creep.withdraw(containers[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
            creep.moveTo(containers[0], {visualizePathStyle: {stroke: '#ffffff'}});
        }
	} else {
		let sources = creep.room.find(FIND_SOURCES_ACTIVE);
		if (sources.length > 0) {
			if (creep.harvest(sources[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
				creep.moveTo(sources[0], {visualizePathStyle: {stroke: '#ffffff'}});
			}
		}
	}
};


let roleUpgrader = {
    
    /* @param {Creep} creep */
    run: function(creep) {
        
        // check and toggle harvesting flag
        if (creep.memory.upgrading && creep.store[RESOURCE_ENERGY] == 0) {
            creep.memory.upgrading = false;
            creep.say('Harvest!');
        } else if (!creep.memory.upgrading && creep.store.getFreeCapacity() == 0) {
            creep.memory.upgrading = true;
            creep.say('Upgrade!');
        }
        
        if (creep.memory.upgrading) {
            if (creep.upgradeController(creep.room.controller) == ERR_NOT_IN_RANGE) {
                creep.moveTo(creep.room.controller, {visualizePathStyle: {stroke: '#ffffff'}});
            }
        } else {
            // harvest
            replenishEnergy(creep);
        }
    }
};

module.exports = roleUpgrader;
