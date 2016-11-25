//require("globals");
module.exports = {
    // state working = Returning energy to structure
    run: function(creep) {
        var roleCollector = require('role.collector');
        if (_.sum(creep.carry) == 0) {
            // switch state to collecting
            if (creep.memory.working == true) {
                delete creep.memory._move;
            }
            creep.memory.working = false;
        }
        else if (_.sum(creep.carry) == creep.carryCapacity || (creep.room.name == creep.memory.homeroom && _.sum(creep.carry) > 0)) {
            // creep is collecting energy but is full
            if (creep.memory.working == false) {
                delete creep.memory._move;
            }
            creep.memory.working = true;
        }
        if (creep.memory.working == true) {
            // creep is supposed to transfer energy to a structure
            // Find construction sites
            var constructionSites = creep.pos.findInRange(FIND_MY_CONSTRUCTION_SITES, 5);
            if (constructionSites.length > 0 && creep.room.name != creep.memory.homeroom) {
                // Construction sites found, build them!
                let site = creep.pos.findClosestByPath(constructionSites);
                if (creep.build(site) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(site, {reusePath: moveReusePath()});
                }
            }
            else {
                // Move to structure
                var road = creep.pos.lookFor(LOOK_STRUCTURES);
                if (creep.room.controller != undefined && (creep.room.controller.owner == undefined || creep.room.controller.owner.username != Game.getObjectById(creep.memory.spawn).room.controller.owner.username ) && road[0] != undefined && road[0].hits < road[0].hitsMax && road[0].structureType == STRUCTURE_ROAD && creep.room.name != creep.memory.homeroom) {
                    // Found road to repair
                    if (creep.getActiveBodyparts(WORK) > 0) {
                        creep.repair(road[0]);
                    }
                    else {
                        var spawn = Game.getObjectById(creep.memory.spawn);
                        creep.moveTo(spawn, {reusePath: moveReusePath()})
                    }
                }
                else {
                    if (creep.room.name != creep.memory.homeroom) {
                        // Find exit to spawn room
                        creep.moveTo(Game.getObjectById(creep.memory.spawn), {reusePath: moveReusePath()})
                    }
                    else {
                        // back in spawn room
                        var structure;
                        if (_.sum(creep.carry) == creep.carry[RESOURCE_ENERGY]) {
                            //Creep has only energy loaded
                            structure = creep.findResource(RESOURCE_SPACE, STRUCTURE_SPAWN, STRUCTURE_TOWER, STRUCTURE_LINK, STRUCTURE_CONTAINER, STRUCTURE_STORAGE, STRUCTURE_EXTENSION);
                        }
                        else {
                            //Creep has minerals loaded
                            structure = creep.room.storage;
                        }

                        // if we found one
                        if (structure != null) {
                            // try to transfer energy, if it is not in range
                            for (let c in creep.carry) {
                                if (creep.transfer(structure, c) == ERR_NOT_IN_RANGE) {
                                    // move towards it
                                    creep.moveTo(structure, {reusePath: moveReusePath(), ignoreCreeps: false});
                                }
                            }

                        }
                        else {
                            creep.say("No Structure!");
                        }
                    }
                }
            }
        }
        // if creep is supposed to harvest energy from source
        else {
            //Find remote source
            var remoteSource = Game.flags[creep.findMyFlag("haulEnergy")];
            if (remoteSource != undefined) {

                // Find exit to target room
                if (creep.room.name != remoteSource.pos.roomName) {
                    //still in old room, go out
                    creep.moveTo(remoteSource, {reusePath: moveReusePath()});
                }
                else {
                    //new room reached, start collecting
                    if (creep.room.memory.hostiles.length == 0) {
                        let flag = Game.flags[creep.memory.currentFlag];
                        //No enemy creeps
                        var container = flag.pos.lookFor(LOOK_STRUCTURES);
                        container = _.filter(container, {structureType: STRUCTURE_CONTAINER});
                        if (container.length > 0 && _.sum(container[0].store) > 0) {

                            for (let s in container[0].store) {
                                if (creep.withdraw(container[0], s) == ERR_NOT_IN_RANGE) {
                                    creep.moveTo(container[0], {reusePath: moveReusePath()});
                                }
                            }
                        }
                        else {
                            roleCollector.run(creep);
                        }
                    }
                    else {
                        //Hostiles creeps in new room
                        creep.memory.fleeing = true;
                        creep.goToHomeRoom();
                    }
                }
            }
        }
    }
};