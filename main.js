const AUTO_SPAWN = true;
const ROLE_SHORTAGE = 'builder';
const TYPES = {
    'harvester': {
        quantity: 0,
        body: [WORK, CARRY, MOVE]
    },
    'miner': {
        quantity: 1,
        body: [WORK, WORK, WORK, WORK, WORK, WORK, MOVE, MOVE]
    },
    'transferer': {
        quantity: 3,
        body: [CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE]
    },
    'builder': {
        quantity: 2,
        body: [WORK, WORK, WORK, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE, MOVE]
    },
    'upgrader': {
        quantity: 3,
        body: [WORK, WORK, WORK, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE]
    }
};

let roleHarvester = require('role.harvester');
let roleUpgrader = require('role.upgrader');
let roleBuilder = require('role.builder');
let roleTransferer = require('role.transferer');
let roleMiner = require('role.miner');
let roleRecycling = require('role.recycling'); // not included in TYPES


/** @param {string} type **/
function spawnCreepWithErrorCode(type) {
    let newName = type.charAt(0).toUpperCase() + type.slice(1) + Game.time;
            
    switch (Game.spawns['Spawn1'].spawnCreep(TYPES[type].body, newName, {memory: {role: type}})) {
        case 0:
            console.log('Spawning new creep of ' + type + ' named ' + newName);
            break;
        case -1:
            console.log('Failed to spawn ' + type + ' named ' + newName + ': ' + 'ERR_NOT_OWNER (-1)');
            break;
        case -3:
            console.log('Failed to spawn ' + type + ' named ' + newName + ': ' + 'ERR_NAME_EXISTS (-3)');
            break;
        case -4:
            console.log('Failed to spawn ' + type + ' named ' + newName + ': ' + 'ERR_BUSY (-4)');
            break;
        case -6:
            console.log('Failed to spawn ' + type + ' named ' + newName + ': ' + 'ERR_NOT_ENOUGH_ENERGY (-6)');
            break;
        case -10:
            console.log('Failed to spawn ' + type + ' named ' + newName + ': ' + 'ERR_INVALID_ARGS (-10)');
            break;
        case -14:
            console.log('Failed to spawn ' + type + ' named ' + newName + ': ' + 'ERR_RCL_NOT_ENOUGH (-14)');
            break;
    };
}


module.exports.loop = function () {
    
    // clear creep memory who no longer exists
    for (let name in Memory.creeps) {
        if(!Game.creeps[name]) {
            delete Memory.creeps[name];
            console.log('Clearing non-existing creep memory:', name);
        }
    }
    
    // replenish or recycle creeps by type
    let typeCount = '';
    
    let continueSpawning = true;
    for (let type in TYPES) {
        let existings = _.filter(Game.creeps, (creep) => creep.memory.role == type);
        typeCount += `${type}: ${existings.length}/${TYPES[type].quantity}, `;
        
        if (existings.length < TYPES[type].quantity && continueSpawning && AUTO_SPAWN) {
            spawnCreepWithErrorCode(type);
            continueSpawning = false;
        } else if (existings.length > TYPES[type].quantity && type !== 'harvester') { // recycle outnumbered creeps excluding harvester
            
            // get shortest lifetime creeps
            let toRecycleCount = existings.length - TYPES[type].quantity;
            let toRecycles = [...existings];
            while (toRecycles.length > toRecycleCount) {
                let longestLife = toRecycles[0];
                for (let toRecycle in toRecycles) {
                    if (toRecycle.ticksToLive > longestLife.ticksToLive) {
                        longestLife = toRecycle;
                    }
                }
                toRecycles.splice(toRecycles.indexOf(longestLife), 1);
            }

            // set shortest lifetime creeps role to 'recycling'
            for (let toRecycle in toRecycles) {
                Game.creeps[toRecycle].memory.role = 'recycling';
            }
        }
    }
    console.log(typeCount);

    if (true) {
        // recycle
        let target = _.filter(Game.creeps,
            (creep) => {return (creep.memory.role == 'recycling') && (creep.pos.getRangeTo(Game.spawns['Spawn1']) === 1)})[0];
        Game.spawns['Spawn1'].recycleCreep(target);
    }

    // spawn harvester if in energy shortage
    if (true) {
        let miners = _.filter(Game.creeps, (creep) => creep.memory.role == 'miner');
        let transferers = _.filter(Game.creeps, (creep) => creep.memory.role == 'transferer');
        let harvesters = _.filter(Game.creeps, (creep) => creep.memory.role == 'harvester');

        if ((miners.length < 1 || transferers.length < 2) && harvesters.length < 3) {
            spawnCreepWithErrorCode('harvester');
            console.log('Spawning harvester to save energy!');
        } else {
            let harvesters = _.filter(Game.creeps, (creep) => creep.memory.role == 'harvester');
            for (let harvester in harvesters) {
                // harvester.memory.role = 'recycling';
                //FIX: change role to recycling
            }
        }
    }

    // towers take action
    let towers = Game.rooms.W14N42.find(FIND_STRUCTURES, {
        filter: (structure) => {
            return structure.structureType == STRUCTURE_TOWER;
        }
    });

    for (let tower of towers) {
        let target;

        // attack
        target = tower.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
        if (target) {
            tower.attack(target);
        }

        // heal
        target = tower.pos.findClosestByRange(FIND_MY_CREEPS, {
            filter: (myCreep) => {
                return myCreep.hits < myCreep.hitsMax;
            }
        });
        if (target) {
            tower.heal(target);
        }

        // repair
        target = tower.pos.findClosestByRange(FIND_STRUCTURES, { // tower.pos.findClosestByRange
            filter: (structure) => {
                return structure.hits < 30000 && structure.structureType == STRUCTURE_RAMPART;
            }
        });
        // console.log(target);
        if (target) {
            tower.repair(target);
        }
    }

    // creeps take action
    for(let name in Game.creeps) {
        let creep = Game.creeps[name];
        if (creep.memory.role == 'harvester') {
            roleHarvester.run(creep, ROLE_SHORTAGE);
        } else if (creep.memory.role == 'upgrader') {
            roleUpgrader.run(creep);
        } else if (creep.memory.role == 'builder') {
            roleBuilder.run(creep);
        } else if (creep.memory.role == 'miner')  {
            roleMiner.run(creep);
        } else if (creep.memory.role == 'transferer') {
            roleTransferer.run(creep);
        } else if (creep.memory.role == 'recycling') {
            roleRecycling.run(creep);
        } else {
            roleHarvester.run(creep, ROLE_SHORTAGE); // default role harvester
        }
    }
};
