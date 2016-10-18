require ("globals");

var roleCollector = require('role.collector');

module.exports = {
    // state working = Returning energy to structure
	
    run: function(creep) {
        if (creep.goToHomeRoom() == true) {
            if (creep.carry.energy == 0) {
                // if creep is bringing energy to a structure but has no energy left
                if (creep.memory.working == true) {
                    delete creep.memory.targetBuffer;
                }
                creep.memory.working = false;
            }
            else if (creep.carry.energy == creep.carryCapacity) {
                // if creep is harvesting energy but is full
                if (creep.memory.working == false) {
                    delete creep.memory.targetBuffer;
                }
                creep.memory.working = true;
            }

            // if creep is supposed to transfer energy to a structure
            if (creep.memory.working == true) {
                // find closest spawn, extension or tower which is not full
                var numberOfHarvesters = creep.room.find(FIND_MY_CREEPS, {filter: (s) => (s.memory.role == "harvester")}).length;
                var numberOfTransporters = creep.room.find(FIND_MY_CREEPS, {filter: (s) => (s.memory.role == "energyTransporter")}).length;
                var structure;

                if (creep.room.memory.hostiles > 0 && creep.room.find(FIND_MY_CREEPS, {filter: (s) => (s.memory.role == "protector")}).length == 0) {
                    //no tower refill;
                    structure = creep.findResource(RESOURCE_SPACE, STRUCTURE_SPAWN, STRUCTURE_EXTENSION);
                }
                else {
                    //towers included in energy distribution
                    structure = creep.findResource(RESOURCE_SPACE, STRUCTURE_SPAWN, STRUCTURE_EXTENSION, STRUCTURE_TOWER);
                }
                var nuker;
                var powerSpawn;
                if (creep.room.memory.roomArrayNukers != undefined) {
                    nuker = Game.getObjectById(creep.room.memory.roomArrayNukers[0]);
                }
                else {
                    nuker = null;
                }
                if (creep.room.memory.roomArrayPowerSpawns != undefined) {
                    powerSpawn = Game.getObjectById(creep.room.memory.roomArrayPowerSpawns[0]);
                }
                else {
                    powerSpawn = null;
                }
                if (structure != undefined && structure != null) {
                    // if we found one -> try to transfer energy, if it is not in range
                    if (creep.transfer(structure, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                        // move towards it
                        creep.moveTo(structure, {reusePath: DELAYPATHFINDING});
                    }
                }
                else if (nuker != null && nuker.energy < nuker.energyCapacity && creep.room.storage.store[RESOURCE_ENERGY] > 50000) {
                    //Bring energy to nuker
                    if (creep.transfer(nuker, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                        // move towards it
                        creep.moveTo(nuker, {reusePath: DELAYPATHFINDING});
                    }
                }
                else if (powerSpawn != null && powerSpawn.energy < powerSpawn.energyCapacity && creep.room.storage.store[RESOURCE_ENERGY] > 50000) {
                    //Bring energy to power spawn
                    if (creep.transfer(powerSpawn, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                        // move towards it
                        creep.moveTo(powerSpawn, {reusePath: DELAYPATHFINDING});
                    }
                }
                else {
                    let labBreaker = false;
                    if (creep.room.memory.boostLabs != undefined) {
                        //Check boost labs for energy
                        for (let b in creep.room.memory.boostLabs) {
                            let lab = Game.getObjectById(creep.room.memory.boostLabs[b]);
                            if (lab.energyCapacity > lab.energy) {
                                //lab needs energy
                                if (creep.transfer(lab, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                                    // move towards it
                                    creep.moveTo(lab, {reusePath: DELAYPATHFINDING});
                                }
                                labBreaker = true;
                                break;
                            }
                        }
                    }

                    if (labBreaker == false) {
                        //Nothing needs energy -> store it
                        var container = creep.findResource(RESOURCE_SPACE, STRUCTURE_STORAGE);
                        if (container == null || container == undefined) {
                            container = creep.findResource(RESOURCE_SPACE, STRUCTURE_CONTAINER);
                        }

                        if (creep.transfer(container, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                            creep.moveTo(container, {reusePath: DELAYPATHFINDING});
                        }
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