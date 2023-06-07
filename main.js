const AUTO_SPAWN = true;
const ROLE_SHORTAGE = 'builder';
const TYPES = {
    'harvester': {
        quantity: 1,
        body: [WORK, CARRY, MOVE]
    },
    'builder': {
        quantity: 1,
        body: [WORK, WORK, CARRY, CARRY, MOVE, MOVE]
    },
    'upgrader': {
        quantity: 1,
        body: [WORK, CARRY, CARRY, MOVE, MOVE]
    },
    'miner': {
        quantity: 1,
        body: [WORK, WORK, WORK, WORK, MOVE]
    },
    'transferer': {
        quantity: 0,
        body: [CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE]
    }
};

let roleHarvester = require('role.harvester');
let roleUpgrader = require('role.upgrader');
let roleBuilder = require('role.builder');
let roleTransferer = require('role.transferer');
let roleMiner = require('role.miner');

module.exports.loop = function () {
    
    // clear creep memory who no longer exists
    for (let name in Memory.creeps) {
        if(!Game.creeps[name]) {
            delete Memory.creeps[name];
            console.log('Clearing non-existing creep memory:', name);
        }
    }
    
    // replenish creeps by type
    let typeCount = '';
    
    let continueSpawning = true;
    for (let type in TYPES) {
        let existings = _.filter(Game.creeps, (creep) => creep.memory.role == type);
        typeCount += `${type}: ${existings.length}/${TYPES[type].quantity}, `;
        
        if (existings.length < TYPES[type].quantity && continueSpawning && AUTO_SPAWN) {
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
            }
            continueSpawning = false;
        }
    }
    console.log(typeCount);

    // TODO: recycle outnumbered creeps
    
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
        } else {
            roleHarvester.run(creep, ROLE_SHORTAGE); // default role harvester
        }
    }
};
