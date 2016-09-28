require ("globals");

var roleCollector = require('role.collector');

module.exports = {
    // state working = Returning energy to structure
    run: function(creep) {
        if (creep.getRidOfMinerals() == false) {
            // if creep is bringing energy to a structure but has no energy left
            if (creep.carry.energy == 0) {
                if (creep.memory.working == true) {
                    delete creep.memory.targetBuffer;
                }
                // switch state to harvesting
                creep.memory.working = false;
            }
            // if creep is harvesting energy but is full
            else if (_.sum(creep.carry) == creep.carryCapacity) {
                if (creep.memory.working == false) {
                    delete creep.memory.targetBuffer;
                }
                // switch state
                creep.memory.working = true;
            }

            // if creep is supposed to transfer energy to a structure
            if (creep.memory.working == true) {
                // find closest spawn, extension or tower which is not full
                var structure = creep.findResource(RESOURCE_SPACE, STRUCTURE_SPAWN, STRUCTURE_EXTENSION, STRUCTURE_TOWER);
                // if we found one
                var nuker;
                if (creep.room.memory.roomArrayNukers != undefined) {
                    nuker = Game.getObjectById(creep.room.memory.roomArrayNukers[0]);
                }
                else {
                    nuker = undefined;
                }

                if (structure != undefined && structure != null) {
                    // try to transfer energy, if it is not in range

                    if (creep.transfer(structure, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                        // move towards it
                        creep.moveTo(structure, {reusePath: delayPathfinding});
                    }
                }
                else if (nuker != undefined && nuker.energy < nuker.energyCapacity && creep.room.storage.store[RESOURCE_ENERGY] > 50000) {
                    //Bring energy to nuker
                    if (creep.transfer(nuker, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                        // move towards it
                        creep.moveTo(nuker, {reusePath: 3});
                    }
                }
                else {
                    // spawn, extensions and towers full with energy
                    var container = creep.findResource(RESOURCE_SPACE, STRUCTURE_STORAGE);
                    if (container == null || container == undefined) {
                        container = creep.findResource(RESOURCE_SPACE, STRUCTURE_CONTAINER);
                    }

                    if (creep.transfer(container, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                        // move towards it
                        creep.moveTo(container, {reusePath: delayPathfinding});
                    }
                }
            }
            // if creep is supposed to harvest energy from source
            else {
                roleCollector.run(creep);
            }
        }
    }
};