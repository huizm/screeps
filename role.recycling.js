/*
 * Module code goes here. Use 'module.exports' to export things:
 * module.exports.thing = 'a thing';
 *
 * You can import it from another modules like this:
 * var mod = require('role.miner');
 * mod.thing == 'a thing'; // true
 */

let roleRecycling = {

    /** @param {Creep} creep */
    run: function(creep) {
        let spawn = creep.room.find(FIND_STRUCTURE, {
            filter: (structure) => {
                return structure.structureType == STRUCTURE_SPAWN;
            }
        })[0];

        if (creep.pos.getRangeTo(spawn) > 0) {
            creep.moveTo(spawn, {visualizePathStyle: {stroke: '#ff0000'}});
        }
    }
}