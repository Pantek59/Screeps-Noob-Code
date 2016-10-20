require ("globals");

var roleHarvester = require('role.harvester');

module.exports = {
    run: function(creep) {
        var demolishFlag = _.filter(Game.flags,{ memory: { function: 'demolish', spawn: creep.memory.spawn}});
        // if creep is bringing energy to a structure but has no energy left
        if (creep.room.memory.hostiles > 0) {
            var homespawn = Game.getObjectById(creep.memory.spawn);
            if (creep.room.name != creep.memory.homeroom) {
                creep.moveTo(homespawn), {reusePath: moveReusePath()};
            }
            else if (creep.pos.getRangeTo(homespawn) > 5) {
                creep.moveTo(homespawn), {reusePath: moveReusePath()};
            }
            return;
        }

        if (creep.carry.energy == 0) {
            // switch state to demolishing
            creep.memory.working = false;
        }
        else if (creep.carry.energy == creep.carryCapacity) {
            // if creep is demolishing but is full
            demolishFlag = _.filter(Game.flags,{ memory: { function: 'demolish', spawn: creep.memory.spawn}});
            if (demolishFlag.length > 0) {
                demolishFlag = demolishFlag[0];
                if (demolishFlag.memory.dropEnergy == true) {
                    creep.drop(RESOURCE_ENERGY);
                    creep.memory.dropEnergy = true;
                }
                else {
                    creep.memory.working = true;
                    delete creep.memory.path;
                }
            }
        }

        // if creep is supposed to transfer energy to a structure
        if (creep.memory.working == true) {
            // Find exit to spawn room
            var spawn = Game.getObjectById(creep.memory.spawn);
            if (creep.room.name != creep.memory.homeroom) {
                //still in new room, go out
                if(!creep.memory.path) {
                    creep.memory.path = creep.pos.findPathTo(spawn);
                }
                if(creep.moveByPath(creep.memory.path) == ERR_NOT_FOUND) {
                    creep.memory.path = creep.pos.findPathTo(spawn);
                    creep.moveByPath(creep.memory.path);
                }
            } //TODO: Check demolishFlag.pos
            else if (demolishFlag.pos != undefined) {
                // back in spawn room
                let structure;
                if (demolishFlag.pos.roomName == creep.memory.homeroom) {
                    //Demolisher flag is in creep's home room -> energy will only be stored in containers and in the storage
                    structure = creep.pos.findClosestByPath(FIND_STRUCTURES, {filter: (s) => (s.structureType == STRUCTURE_CONTAINER || s.structureType == STRUCTURE_STORAGE) && s.storeCapacity > _.sum(s.store) && s.pos.isEqualTo(demolishFlag.pos) == false});
                }
                else {
                    structure = creep.findResource(RESOURCE_SPACE, STRUCTURE_CONTAINER, STRUCTURE_LINK, STRUCTURE_TOWER, STRUCTURE_STORAGE, STRUCTURE_SPAWN);
                }

                if (structure != null) {
                    // try to transfer energy, if it is not in range
                    if (creep.transfer(structure, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                        // move towards it
                        creep.moveTo(structure, {reusePath: moveReusePath()});
                    }
                }
            }
        }
        // if creep is supposed to demolish
        else {
            //TODO Several demolishers per spawn; use creep.findMyFlag()
            //Find something to demolish

            var demolishFlag = _.filter(Game.flags,{ memory: { function: 'demolish', spawn: creep.memory.spawn}});
            if (demolishFlag.length > 0) {
                // Find exit to target room
                demolishFlag = demolishFlag[0];

                if (creep.room.name != demolishFlag.pos.roomName) {
                    //still in old room, go out
                    if (creep.moveTo(demolishFlag) == ERR_NO_PATH) {
                        delete creep.memory._move;
                        delete creep.memory.path;
                    }
                    creep.memory.oldRoom = true;
                }

                if (creep.room.name == demolishFlag.pos.roomName) {

                    if (creep.room.memory.hostiles == 0) {
                        if (creep.memory.statusDemolishing == undefined) {
                            //new room reached, start demolishing
                            if (creep.memory.oldRoom == true) {
                                delete creep.memory.targetBuffer;
                                delete creep.memory.oldRoom;
                                delete creep.memory._move;
                                delete creep.memory.path;
                            }
                            var targetlist;

                            if (demolishFlag.memory.target == "object") {
                                //demolish flag position structures
                                targetlist = demolishFlag.pos.lookFor(LOOK_STRUCTURES);
                                // Go through target list
                                for (var i in targetlist) {
                                    if (targetlist[i].structureType != undefined) {
                                        if ((targetlist[i].store != undefined && targetlist[i].store[RESOURCE_ENERGY] > 0) || (targetlist[i].energy != undefined && targetlist[i].energy > 0)) {
                                            //empty structure of energy first
                                            if (creep.withdraw(targetlist[i], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                                                creep.moveTo(targetlist[i], {reusePath: moveReusePath()});
                                            }
                                        }
                                        else if (creep.dismantle(targetlist[i]) == ERR_NOT_IN_RANGE) {
                                            creep.moveTo(targetlist[i], {reusePath: moveReusePath()});
                                        }
                                        break;
                                    }
                                }
                                if (targetlist.length == 0) {
                                    Game.notify("Demolition flag in room " + demolishFlag.pos.roomName + " is placed in empty square!")
                                }
                            }
                            else if (demolishFlag.memory.target == "room") {
                                //demolish all structures in room
                                // find structures with energy
                                var target = creep.findResource(RESOURCE_ENERGY, STRUCTURE_SPAWN, STRUCTURE_EXTENSION, STRUCTURE_TERMINAL, STRUCTURE_STORAGE, STRUCTURE_TOWER, STRUCTURE_LINK, STRUCTURE_LAB);
                                if (target == null) {
                                    target = creep.pos.findClosestByPath(FIND_STRUCTURES, {filter: (s) => s.structureType != STRUCTURE_ROAD && s.structureType != STRUCTURE_WALL && s.structureType != STRUCTURE_CONTAINER && s.structureType != STRUCTURE_CONTROLLER});
                                }
                                if (target == null) {
                                    target = creep.pos.findClosestByPath(FIND_STRUCTURES, {filter: (s) => s.structureType != STRUCTURE_ROAD && s.structureType != STRUCTURE_CONTAINER && s.structureType != STRUCTURE_CONTROLLER});
                                }
                                if (target != null) {
                                    if ((target.store != undefined && target.store[RESOURCE_ENERGY] > 0) || target.energy != undefined && target.energy > 20) {
                                        //empty structure of energy first
                                        if (creep.withdraw(target, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                                            creep.moveTo(target, {reusePath: moveReusePath()});
                                        }
                                        else if (creep.withdraw(target, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                                            creep.moveTo(target, {reusePath: moveReusePath()});
                                        }
                                    }
                                    else {
                                        var result = creep.dismantle(target);
                                        if (result == ERR_NOT_IN_RANGE) {
                                            creep.moveTo(target, {reusePath: moveReusePath()});
                                        }
                                        else if (result == OK) {
                                            creep.memory.statusDemolishing = target.id;
                                        }
                                    }
                                }
                            }
                        }
                        else {
                            if (creep.dismantle(Game.getObjectById(creep.memory.statusDemolishing)) != OK) {
                                delete creep.memory.statusDemolishing;
                                delete creep.memory.path;
                                delete creep.memory._move;
                                delete creep.memory.targetBuffer;
                            }
                        }
                    }
                    else {
                        //Hostiles creeps in new room
                        var homespawn = Game.getObjectById(creep.memory.spawn);
                        if (creep.room.name != creep.memory.homeroom) {
                            creep.moveTo(homespawn), {reusePath: moveReusePath()};
                            creep.memory.fleeing = true;
                        }
                        else if (creep.pos.getRangeTo(homespawn) > 5) {
                            creep.moveTo(homespawn), {reusePath: moveReusePath()};
                        }
                    }
                }
            }
            else {
                roleHarvester.run(creep);
            }
        }
    }
};