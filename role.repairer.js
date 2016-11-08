var roleBuilder = require('role.builder');
var roleCollector = require('role.collector');

module.exports = {
    // a function to run the logic for this role
    run: function(creep) {
        // check for home room
        if (creep.room.name != creep.memory.homeroom && creep.memory.role != "remoteHarvester") {
            //return to home room
            var hometarget = Game.getObjectById(creep.memory.spawn);
            creep.moveTo(hometarget, {reusePath: moveReusePath()});
        }
        else {
            // if creep is trying to repair something but has no energy left
            if (creep.carry.energy == 0) {
                // 4witch state
                creep.memory.working = false;
            }
            // if creep is harvesting energy but is full
            else if (creep.memory.working == false && creep.carry.energy == creep.carryCapacity) {
                // switch state
                creep.memory.working = true;
            }

            // if creep is supposed to repair something
            if (creep.memory.working == true) {
                if (creep.room.memory.hostiles.length > 0) {
                    // Hostiles present in room
                    creep.towerEmergencyFill();
                }
                else {

                    if (creep.room.controller.level == 8 && creep.room.controller.ticksToDowngrade < 10000) {
                        // Refresh level 8 controller
                        if (creep.upgradeController(creep.room.controller) == ERR_NOT_IN_RANGE) {
                            // try to upgrade the controller, if not in range, move towards the controller
                            creep.moveTo(creep.room.controller, {reusePath: moveReusePath()});
                        }
                    }
                    else if (creep.room.memory.roomArraySpawns.length > 0) {
                        let structure;
                        if (creep.memory.myStructure != undefined) {
                            structure = Game.getObjectById(creep.memory.myStructure);
                            if (structure != null && structure.hits < structure.hitsMax && structure.structureType != STRUCTURE_WALL && structure.structureType != STRUCTURE_RAMPART || (structure.structureType == STRUCTURE_RAMPART && structure.hits < 100000)) {
                                creep.memory.myStructure = structure.id;
                            }
                            else {
                                delete creep.memory.myStructure;
                            }
                        }

                        if (creep.memory.myStructure == undefined) {
                            structure = creep.pos.findClosestByPath(FIND_STRUCTURES, {filter: (s) => (s.hits < s.hitsMax && s.structureType != STRUCTURE_WALL && s.structureType != STRUCTURE_RAMPART) || (s.structureType == STRUCTURE_RAMPART && s.hits < 100000)});
                        }
                        if (structure != undefined) {
                            creep.memory.myStructure = structure.id;
                            var result = creep.repair(structure);
                            if (result == ERR_NOT_IN_RANGE) {
                                creep.moveTo(structure, {reusePath: moveReusePath()});
                            }
                        }
                        // if we can't fine one
                        else {
                            // look for construction sites
                            roleBuilder.run(creep);
                        }
                    }
                    else {
                        //room without spawn
                        var constructionSite = creep.pos.findClosestByPath(FIND_MY_CONSTRUCTION_SITES, {filter: (s) => s.structureType == STRUCTURE_ROAD});
                        if (constructionSite == null) {
                            constructionSite = creep.pos.findClosestByPath(FIND_MY_CONSTRUCTION_SITES, {filter: (s) => s.structureType == STRUCTURE_SPAWN});
                        }
                        if (creep.build(constructionSite) == ERR_NOT_IN_RANGE) {
                            // move towards it
                            creep.moveTo(constructionSite, {reusePath: moveReusePath()});
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