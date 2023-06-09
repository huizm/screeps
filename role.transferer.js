/*
 * Module code goes here. Use 'module.exports' to export things:
 * module.exports.thing = 'a thing';
 *
 * You can import it from another modules like this:
 * var mod = require('role.harvester');
 * mod.thing == 'a thing'; // true
 */


// function transferToContainer(creep) {
//     let targets = creep.room.find(FIND_STRUCTURES, {
//         filter: (structure) => {
//             return (structure.structureType == STRUCTURE_CONTAINER)
//                 && (structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0);
//         }
//     });
//     if (targets.length > 0) {
//         if (creep.transfer(targets[1], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
//             creep.moveTo(targets[1], {visualizePathStyle: {stroke: '#ffaa00'}});
//         }
//     }
// }


function pickupDroppedEnercy(creep) {
    let droppedEnergy = creep.pos.findClosestByPath(FIND_DROPPED_RESOURCES, {
		filter: (resource) => {
			return resource.resourceType == RESOURCE_ENERGY &&
				creep.pos.getRangeTo(resource) <= 10;
		}
	});

    if (droppedEnergy && creep.store.getFreeCapacity() > 0) {
        if (creep.pickup(droppedEnergy) == ERR_NOT_IN_RANGE) {
            creep.moveTo(droppedEnergy);
        }
    }
}


const SOURCE_CONTAINERS = ['647fd10e660ec84e431f9656', '647fbfeae74af62cbc99bcb0', '647fc99237ef4e597ecfde0e'];

/**@param {*} container */
const isSourceContainer = function(container) {
    let flag = false;

    for (let source_container of SOURCE_CONTAINERS) {
        if (container.id === source_container) {
            flag = true;
            break;
        }
    }
    return flag;
};

let roleTransferer = {

    /** @param {Creep} creep **/
    run: function(creep) {

        pickupDroppedEnercy(creep);

        if (creep.memory.transferring && creep.store[RESOURCE_ENERGY] == 0) {
            creep.memory.transferring = false;
            creep.say('Harvest!');
        }
        if (!creep.memory.tranferring && creep.store.getFreeCapacity() == 0) {
            creep.memory.transferring = true;
            creep.say('Transfer!');
        }

	    if (creep.memory.transferring) {
            let target = creep.pos.findClosestByPath(FIND_STRUCTURES, {
                filter: (structure) => {
                    return (structure.structureType == STRUCTURE_EXTENSION
                        || structure.structureType == STRUCTURE_SPAWN
                        || structure.structureType == STRUCTURE_TOWER
                        || structure.structureType == STRUCTURE_STORAGE
                        || (structure.structureType == STRUCTURE_CONTAINER &&
                            !isSourceContainer(structure)))
                        && structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0;
                }
            });

            if (target) {
                if (creep.transfer(target, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(target, {visualizePathStyle: {stroke: '#ffaa00'}});
                }
            } else {
                // transferToContainer(creep);
            }
        } else {
            let source = creep.pos.findClosestByPath(FIND_STRUCTURES, {
                filter: (structure) => {
                    return (structure.structureType == STRUCTURE_CONTAINER) &&
                        (structure.store[RESOURCE_ENERGY] > 25) &&
                        isSourceContainer(structure);
                }
            });

            if (source) {
                if (creep.withdraw(source, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(source, {visualizePathStyle: {stroke: '#ffffff'}});
                }
            }
        }
	}
};

module.exports = roleTransferer;
