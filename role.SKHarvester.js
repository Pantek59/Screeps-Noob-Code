//require ("globals");
module.exports = {
    // state working = Returning energy to structure

    run: function(creep) {
        if (creep.memory.statusHarvesting == undefined || creep.memory.statusHarvesting == false || creep.carry.energy == creep.carryCapacity || Game.time % 7 == 0) {
            if (creep.memory.currentFlag == undefined) {
                creep.memory.currentFlag = creep.findMyFlag("SKHarvest");
            }

            if (creep.memory.currentFlag == undefined) {
                console.log(creep.name + " has no sources to stationary harvest in room " + creep.room.name + ".");
            }
            else {
                var flag = Game.flags[creep.memory.currentFlag];

                if (flag != undefined) {
                    if (flag.pos.roomName != creep.room.name) {
                        // Creep not in assigned room
                        if (creep.storeAllBut() == true) {
                            creep.moveTo(flag, {reusePath: moveReusePath()});
                        }
                    }
                    else {
                        // Creep in SK Room
                        if (creep.memory.myLair == undefined) {
                            let myLair = flag.pos.findClosestByPath(FIND_STRUCTURES, {filter: (k) => k.structureType == STRUCTURE_KEEPER_LAIR});
                            if (myLair != null) {
                                creep.memory.myLair = myLair.id;
                            }
                        }
                        var myLair = Game.getObjectById(creep.memory.myLair);
                        let hostiles = [];
                        for (let h in creep.room.memory.hostiles) {
                            hostiles.push(Game.getObjectById(creep.room.memory.hostiles[h]));
                        }
                        var invaders = _.filter(hostiles, function (h) { return h.owner.username != "Source Keeper"});
                        if (invaders.length > 0) {
                            creep.flee(hostiles, 10);
                        }
                        else {
                            //Check for source keeper status
                            let sourceKeeper = flag.pos.findInRange(FIND_HOSTILE_CREEPS, 8, {filter: (c) => c.owner.username == "Source Keeper"});
                            if (sourceKeeper.length > 0) {
                                //Source is guarded by source keeper -> retreat
                                if (creep.pos.getRangeTo(sourceKeeper[0]) < 7) {
                                    creep.goToHomeRoom();
                                }
                                else {
                                    creep.memory.sleep = 10;
                                }
                            }
                            else {
                                //No Source Keeper around
                                if (myLair.ticksToSpawn < 15) {
                                    //Source Keeper spawning soon
                                    if (creep.pos.getRangeTo(myLair) < 7) {
                                        creep.goToHomeRoom();
                                    }
                                    else {
                                        creep.memory.sleep = 5;
                                    }
                                }
                                else {
                                    //Safe to work
                                    if (creep.pos.isEqualTo(flag) == false) {
                                        creep.moveTo(flag, {reusePath: moveReusePath()});
                                    }
                                    else {
                                        if (creep.carry.energy > 0 && sourceKeeper.length == 0) {
                                            //Identify and save container
                                            var buildContainers = creep.pos.findInRange(FIND_CONSTRUCTION_SITES, 3, {filter: (s) => s.structureType == STRUCTURE_CONTAINER || s.structureType == STRUCTURE_ROAD});
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
                                                    var constructionSites = creep.pos.findInRange(FIND_CONSTRUCTION_SITES, 1, {filter: (s) => (s.structureType == STRUCTURE_CONTAINER)});
                                                    if (containers.length == 0 && constructionSites.length == 0 && creep.pos.isEqualTo(flag) == true) {
                                                        creep.pos.createConstructionSite(STRUCTURE_CONTAINER);
                                                    }
                                                }
                                            }
                                        }
                                        else if (creep.carry.energy < creep.carryCapacity && sourceKeeper.length == 0) {
                                            //Time to refill
                                            //TODO Does not pickup energy on the ground
                                            let energy = creep.pos.lookFor(LOOK_ENERGY);
                                            if (energy.length > 0) {
                                                creep.pickup(energy[0]);
                                            }
                                            else {
                                                //Identify and save source
                                                if (creep.memory.source == undefined) {
                                                    var source = creep.pos.findClosestByRange(FIND_SOURCES);
                                                    creep.memory.source = source.id;
                                                }
                                                else {
                                                    var source = Game.getObjectById(creep.memory.narrowSource);
                                                }
                                                if (source == undefined) {
                                                    delete creep.memory.source;
                                                }
                                                else if (source.energy == 0) {
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
                                    }
                                }
                            }
                        }
                    }
                }
                else {
                    console.log(creep.name + " in room " + creep.room.name + " has a problem.");
                }
            }
        }
        else {
            // Creep is harvesting, try to keep harvesting
            // TODO Energy pickup
            let energy = creep.pos.lookFor(LOOK_ENERGY);
            if (energy.length > 0) {
                creep.pickup(energy[0]);
                creep.memory.statusHarvesting = false;
            }
            else {
                var source = Game.getObjectById(creep.memory.statusHarvesting);
                if (creep.harvest(source) != OK || creep.carry.energy == creep.carryCapacity) {
                    creep.memory.statusHarvesting = false;
                }
            }
        }
    }
};