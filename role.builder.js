/*
 * Module code goes here. Use 'module.exports' to export things:
 * module.exports.thing = 'a thing';
 *
 * You can import it from another modules like this:
 * var mod = require('role.builder');
 * mod.thing == 'a thing'; // true
 */

function replenishEnergy(creep) {
    let container = creep.pos.findClosestByPath(FIND_STRUCTURES, {
        filter: (structure) => {
            return (structure.structureType == STRUCTURE_CONTAINER)
                && (structure.store[RESOURCE_ENERGY] > 25);
        }
    });
	
	if (container) {
		if (creep.withdraw(container, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
            creep.moveTo(container, {visualizePathStyle: {stroke: '#ffffff'}});
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


function pickupDroppedEnercy(creep) {
    let droppedEnergy = creep.pos.findClosestByPath(FIND_DROPPED_RESOURCES, RESOURCE_ENERGY);

    if (droppedEnergy && creep.store.getFreeCapacity() > 0 && creep.pos.getRangeTo(droppedEnergy) <= 10) {
        if (creep.pickup(droppedEnergy) == ERR_NOT_IN_RANGE) {
            creep.moveTo(droppedEnergy);
        }
    }
}


let roleBuilder = {

    /** @param {Creep} creep **/
    run: function(creep) {

		pickupDroppedEnercy(creep);

	    if (creep.memory.building && creep.store[RESOURCE_ENERGY] == 0) {
            creep.memory.building = false;
            creep.say('Harvest!');
	    }
	    if (!creep.memory.building && creep.store.getFreeCapacity() == 0) {
	        creep.memory.building = true;
	        creep.say('Build!');
	    }

	    if (creep.memory.building) {
	        let needsRepair = creep.room.find(FIND_STRUCTURES, {
				filter: (structure) => {
					return (true /* disable rapairing set to false */ &&
						(structure.structureType != STRUCTURE_WALL && structure.structureType != STRUCTURE_RAMPART) &&
						structure.hits < (structure.hitsMax)); // TODO: detect most damaged structure and fix
				}
			});
			let targets = (needsRepair.length > 0) ? needsRepair : creep.room.find(FIND_CONSTRUCTION_SITES);
			// repair prior to build

            if (targets.length) {
				let repairCode = creep.repair(targets[0]);
                if (repairCode != ERR_INVALID_TARGET && repairCode == ERR_NOT_IN_RANGE) {
                    creep.moveTo(targets[0], {visualizePathStyle: {stroke: '#ffffff'}});
                } else {
					if (creep.build(targets[0]) == ERR_NOT_IN_RANGE) {
						creep.moveTo(targets[0], {visualizePathStyle: {stroke: '#ffffff'}});
					}
				}
            }
	    }
	    else {
	        replenishEnergy(creep);
	    }
	}
};

module.exports = roleBuilder;