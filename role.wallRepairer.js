var roleBuilder = require('role.builder');
var roleCollector = require('role.collector');

module.exports = {
    // a function to run the logic for this role
    run: function(creep) {
        // check for home room
        if (creep.room.name != creep.memory.homeroom) {
            //return to home room
            var hometarget = Game.getObjectById(creep.memory.spawn);
            creep.moveTo(hometarget, {reusePath: moveReusePath()});
        }
        else {
            // if creep is trying to repair something but has no energy left
            if (creep.carry.energy == 0) {
                // switch state
                creep.memory.working = false;
                delete creep.memory.statusRepairing;
            }
            // if creep is full of energy but not working
            else if (creep.carry.energy == creep.carryCapacity) {
                // switch state
                creep.memory.working = true;
            }

            // if creep is supposed to repair something
            if (creep.memory.working == true) {
                if (creep.memory.statusRepairing == undefined) {
                    var rampartsBeingSetUp = creep.room.find(FIND_MY_STRUCTURES, {filter: (s) => s.structureType == STRUCTURE_RAMPART && s.hits < 70000});
                    var constructionSite = creep.pos.findClosestByPath(FIND_CONSTRUCTION_SITES, { filter: (s) => s.structureType == STRUCTURE_WALL || s.structureType == STRUCTURE_RAMPART});
                    if (constructionSite != null && rampartsBeingSetUp.length == 0) {
                        // Construction sites found
                        var position = constructionSite.pos;
                        var buildResult = creep.build(constructionSite)
                        if (buildResult == ERR_NOT_IN_RANGE) {
                            // move towards the constructionSite
                            creep.moveTo(constructionSite, {reusePath: moveReusePath()});
                        }
                        else if (buildResult == OK) {
                            var builtObject = position.lookFor(LOOK_STRUCTURES);
                            creep.memory.statusRepairing = builtObject.id;
                        }
                    }
                    else {
                        var target = undefined;
                        var ramparts = creep.room.find(FIND_STRUCTURES, {filter: (s) => s.structureType == STRUCTURE_RAMPART});
                        ramparts = _.sortBy(ramparts,"hits");

                        var walls = creep.room.find(FIND_STRUCTURES, {filter: (s) => s.structureType == STRUCTURE_WALL});
                        walls = _.sortBy(walls,"hits");

                        if (walls.length > 0 && ((ramparts[0] != undefined && walls[0].hits < ramparts[0].hits) || (ramparts.length == 0))) {
                            target = walls[0];
                        }
                        else if (ramparts.length > 0) {
                            target = ramparts[0];
                        }

                        // if we find a wall that has to be repaired
                        if (target != undefined) {
                            var result = creep.repair(target);
                            if (result == ERR_NOT_IN_RANGE) {
                                // move towards it
                                creep.moveTo(target, {reusePath: moveReusePath()});
                                creep.memory.statusRepairing = target.id;
                            }
                            else if (result == OK) {
                                creep.memory.statusRepairing = target.id;
                            }
                            else {
                                delete creep.memory.statusRepairing;
                            }
                        }
                        // if we can't fine one
                        else {
                            // look for construction sites
                            roleBuilder.run(creep);
                        }
                    }
                }
                else {
                    if (creep.repair(Game.getObjectById(creep.memory.statusRepairing)) != OK) {
                        if (creep.moveTo(Game.getObjectById(creep.memory.statusRepairing), {reusePath: moveReusePath()}) != OK) {
                            delete creep.memory.statusRepairing;
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