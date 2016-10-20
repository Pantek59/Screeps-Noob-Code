require ("globals");

module.exports = {
    // state working = Returning energy to structure

    run: function(creep) {
        if (creep.memory.statusHarvesting == undefined || creep.memory.statusHarvesting == false || creep.carry.energy == creep.carryCapacity) {
            if (creep.memory.currentFlag == undefined) {
                creep.memory.currentFlag = creep.findMyFlag("haulEnergy");
            }

            if (creep.memory.currentFlag == undefined) {
                console.log(creep.name + " has no sources to stationary harvest in room " + creep.room.name + ".");
            }
            else if (creep.room.memory.hostiles == 0) {
                var flag = Game.flags[creep.memory.currentFlag];
                if (flag != undefined) {
                    if (flag.pos.roomName != creep.room.name) {
                        // Creep not in assigned room
                        creep.moveTo(flag, {reusePath: moveReusePath()});
                    }
                    else if (creep.pos.isEqualTo(flag)) {
                        // Harvesting position reached

                        if (creep.carry.energy > 0) {
                            //Identify and save container
                            var buildContainers = creep.pos.findInRange(FIND_CONSTRUCTION_SITES, 0, {filter: (s) => s.structureType == STRUCTURE_CONTAINER});
                            var repairContainers = creep.pos.findInRange(FIND_STRUCTURES, 0, {filter: (s) => s.structureType == STRUCTURE_CONTAINER && s.hits < s.hitsMax});
                            if (buildContainers.length > 0) {
                                creep.build(buildContainers[0]);
                            }
                            else if (repairContainers.length > 0) {
                                creep.repair(repairContainers[0]);
                            }
                            else {
                                if (creep.memory.container == undefined) {
                                    var container;
                                    var containers = creep.pos.findInRange(FIND_STRUCTURES, 0, {filter: (s) => (s.structureType == STRUCTURE_CONTAINER && s.storeCapacity - _.sum(s.store) > 0) || (s.structureType == STRUCTURE_LINK && s.energyCapacity - s.energy) > 0});
                                    if (containers.length > 0) {
                                        creep.memory.container = containers[0].id;
                                        container = containers[0];
                                    }
                                }
                                else {
                                    container = Game.getObjectById(creep.memory.container);
                                }

                                if (creep.transfer(container, RESOURCE_ENERGY) != OK) {
                                    delete creep.memory.container;
                                    containers = creep.pos.findInRange(FIND_STRUCTURES, 0, {filter: (s) => (s.structureType == STRUCTURE_CONTAINER)});
                                    var constructionSites =  creep.pos.findInRange(FIND_CONSTRUCTION_SITES, 1, {filter: (s) => (s.structureType == STRUCTURE_CONTAINER)});
                                    if (containers.length == 0 && constructionSites.length == 0) {
                                        creep.pos.createConstructionSite(STRUCTURE_CONTAINER);
                                    }
                                }
                            }
                        }
                        else if (creep.carry.energy < creep.carryCapacity) {
                            //Time to refill
                            //Identify and save source
                            if (creep.memory.source == undefined) {
                                var source = creep.pos.findClosestByRange(FIND_SOURCES);
                                creep.memory.source = source.id;
                            }
                            else {
                                var source = Game.getObjectById(creep.memory.narrowSource);
                            }
                            if (source.energy == 0) {
                                creep.memory.sleep = source.ticksToRegeneration;
                            }
                            else {
                                if (creep.harvest(source) != OK) {
                                    creep.memory.statusHarvesting = false;
                                    delete creep.memory.narrowSource;
                                }
                                else {
                                    creep.memory.statusHarvesting = source.id;
                                }
                            }
                        }
                    }
                    else {
                        // Move to harvesting point
                        creep.moveTo(flag, {reusePath: moveReusePath()});
                    }
                }
                else {
                    console.log(creep.name + " in room " + creep.room.name + " has a problem.");
                }
            }
            else {
                // Hostiles present
                var homespawn = Game.getObjectById(creep.memory.spawn);
                creep.memory.fleeing = true;
                if (creep.room.name != creep.memory.homeroom) {
                    creep.moveTo(homespawn), {reusePath: moveReusePath()};
                }
                else if (creep.pos.getRangeTo(homespawn) > 5) {
                    creep.moveTo(homespawn), {reusePath: moveReusePath()};
                }
            }
        }
        else {
            // Creep is harvesting, try to keep harvesting
            var source = Game.getObjectById(creep.memory.statusHarvesting);
            if (creep.harvest(source) != OK || creep.carry.energy == creep.carryCapacity) {
                creep.memory.statusHarvesting = false;
            }
        }
    }
};