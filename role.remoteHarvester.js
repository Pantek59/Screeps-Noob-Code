require ("globals");

var roleCollector = require('role.collector');
var roleBuilder = require('role.builder');

module.exports = {
    // state working = Returning energy to structure
    run: function(creep) {
        // check for picked up minerals
        if (creep.getRidOfMinerals() == false) { // if creep is bringing energy to a structure but has no energy left
            if (_.sum(creep.carry) == 0) {
                // switch state to harvesting
                if (creep.memory.working == true) {
                    delete creep.memory.path;
                    delete creep.memory._move;
                }
                creep.memory.working = false;
            }
            // if creep is harvesting energy but is full
            else if (_.sum(creep.carry) == creep.carryCapacity) {
                if (creep.memory.working == false) {
                    delete creep.memory.path;
                    delete creep.memory._move;
                }
                creep.memory.working = true;
            }

            // if creep is supposed to transfer energy to a structure
            if (creep.memory.working == true) {
                //Find construction sites
                var constructionSites = creep.room.find(FIND_MY_CONSTRUCTION_SITES);

                if (constructionSites.length > 0 && creep.room.name != creep.memory.homeroom) {
                    // Construction sites found, build them!
                    roleBuilder.run(creep);
                }
                else {
                    var road = creep.pos.lookFor(LOOK_STRUCTURES);

                    if (creep.room.controller != undefined && (creep.room.controller.owner == undefined || creep.room.controller.owner.username != Game.getObjectById(creep.memory.spawn).room.controller.owner.username ) && road[0] != undefined && road[0].hits < road[0].hitsMax && road[0].structureType == STRUCTURE_ROAD && creep.room.name != creep.memory.homeroom) {
                        // Found road to repair
                        creep.repair(road[0]);
                    }
                    else {
                        // Find exit to spawn room
                        var spawn = Game.getObjectById(creep.memory.spawn);
                        if (creep.room.name != creep.memory.homeroom) {
                            //still in new room, go out
                            if (!creep.memory.path) {
                                creep.memory.path = creep.pos.findPathTo(spawn, {
                                    heuristicWeight: 1000,
                                    ignoreCreeps: false
                                });
                            }
                            if (creep.moveByPath(creep.memory.path) == ERR_NOT_FOUND) {
                                creep.memory.path = creep.pos.findPathTo(spawn, {
                                    heuristicWeight: 1000,
                                    ignoreCreeps: false
                                });
                                creep.moveByPath(creep.memory.path);
                            }
                        }
                        else {
                            // back in spawn room

                            delete creep.memory.path;
                            // find closest spawn, extension, tower or container which is not full
                            var structure = creep.findResource(RESOURCE_SPACE, STRUCTURE_SPAWN, STRUCTURE_TOWER, STRUCTURE_LINK, STRUCTURE_CONTAINER, STRUCTURE_STORAGE, STRUCTURE_EXTENSION);

                            // if we found one
                            if (structure != null) {
                                // try to transfer energy, if it is not in range
                                if (creep.transfer(structure, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                                    // move towards it
                                    creep.moveTo(structure, {reusePath: DELAYPATHFINDING, ignoreCreeps: false});
                                }
                            }
                            else {
                                creep.say("No Structure!");
                                //roleUpgrader.run(creep);
                            }
                        }
                    }
                }
            }
            // if creep is supposed to harvest energy from source
            else if (creep.memory.statusHarvesting == false || creep.memory.statusHarvesting == undefined) {
                //Find remote source
                var remoteSource = Game.flags[creep.findMyFlag("remoteSource")];
                if (remoteSource != -1 && remoteSource != undefined) {

                    // Find exit to target room
                    if (remoteSource.room == undefined || creep.room.name != remoteSource.room.name) {
                        //still in old room, go out
                        if (!creep.memory.path) {
                            creep.memory.path = creep.pos.findPathTo(remoteSource, {ignoreCreeps: false});
                        }
                        if (creep.moveByPath(creep.memory.path) != OK) {
                            creep.memory.path = creep.pos.findPathTo(remoteSource, {ignoreCreeps: false});
                            creep.moveByPath(creep.memory.path)
                        }
                    }
                    else {
                        //new room reached, start harvesting
                        if (creep.room.memory.hostiles == 0) {
                            //No enemy creeps
                            if (roleCollector.run(creep) != OK) {
                                creep.moveTo(remoteSource, {reusePath: DELAYPATHFINDING});
                            }
                        }
                        else {
                            //Hostiles creeps in new room
                            var homespawn = Game.getObjectById(creep.memory.spawn);
                            if (creep.room.name != creep.memory.homeroom) {
                                creep.moveTo(homespawn), {reusePath: DELAYPATHFINDING};
                            }
                            creep.memory.fleeing = true;
                        }
                    }
                }
            }
            else {
                // Creep is harvesting, try to keep harvesting
                if (creep.harvest(Game.getObjectById(creep.memory.statusHarvesting)) != OK) {
                    console.log(creep.harvest(Game.getObjectById(creep.memory.statusHarvesting)));
                    delete creep.memory.statusHarvesting;
                }
            }
        }
    }
};