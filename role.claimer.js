module.exports = {
    // a function to run the logic for this role
    run: function(creep) {
        // Find exit to target room
        var remoteControllers = _.filter(Game.flags,{ memory: { function: 'remoteController', spawn: creep.memory.spawn}});

        var remoteController;
        var busyCreeps;
        //TODO Switch claimer to creep.findMyFlag() and somehow include 3000 ticksToEnd rule
        if (creep.memory.remoteControllerFlag != undefined) {
            //Check whether claiming this flag is this OK
            busyCreeps = _.filter(Game.creeps,{ memory: { remoteControllerFlag: creep.memory.remoteControllerFlag, spawn: creep.memory.spawn}});
        }

        if (creep.memory.remoteControllerFlag == undefined || (creep.memory.remoteControllerFlag != undefined && busyCreeps.length != 1)) {
            //Flag taken, choose other flag
            for (var rem in remoteControllers) {
                //Look for unoccupied remoteController
                var flagName = remoteControllers[rem].name;

                creep.memory.remoteControllerFlag = remoteControllers[rem].name;
                busyCreeps = _.filter(Game.creeps,{ memory: { remoteControllerFlag: flagName, spawn: creep.memory.spawn}});

                if (busyCreeps.length == 1 && (remoteControllers[rem].room == undefined || remoteControllers[rem].room.controller.reservation == undefined || remoteControllers[rem].room.controller.reservation.ticksToEnd < 3000)) {
                    //No other claimer working on this flag
                    remoteController = remoteControllers[rem];
                    creep.memory.remoteControllerFlag = remoteController.name;
                    break;
                }
            }
        }
        else {
            //Load previous flag
            remoteControllers = _.filter(Game.flags,{name: creep.memory.remoteControllerFlag});
            remoteController = remoteControllers[0];
        }

        if (remoteController != undefined && (remoteController.room == undefined || creep.room.name != remoteController.pos.roomName)) {
            //still in wrong room, go out
            if (!creep.memory.path) {
                creep.memory.path = creep.pos.findPathTo(remoteController);
            }
            if (creep.moveByPath(creep.memory.path) == ERR_NOT_FOUND) {
                creep.memory.path = creep.pos.findPathTo(remoteController);
                creep.moveByPath(creep.memory.path)
            }
        }
        else if (remoteController != undefined) {
            //new room reached, start reserving / claiming
            var returncode;

            if (creep.room.memory.hostiles == 0) {
                // try to claim the controller
                if (creep.room.controller.owner == undefined) {
                    if (remoteController.memory.claim == 1) {
                        returncode = creep.claimController(creep.room.controller);
                    }
                    else {
                        returncode = creep.reserveController(creep.room.controller);
                    }
                }
                else if (creep.room.controller.owner.username != playerUsername) {
                    returncode = creep.attackController(creep.room.controller);
                }
                else {
                    creep.moveTo(creep.room.controller, {reusePath: 5});
                }

                if (returncode == ERR_NOT_IN_RANGE) {
                    creep.moveTo(creep.room.controller, {reusePath: 5});
                }

                if (creep.room.controller.owner != undefined && creep.room.controller.owner.username == playerUsername) {
                    //Roomed successfully claimed, now build spawn and remove spawns and extensions from previous owner
                    var spawns = creep.room.find(FIND_MY_SPAWNS).length;
                    if (spawns == 0) {
                        var spawnConstructionsites = creep.room.find(FIND_CONSTRUCTION_SITES, {filter: (s) => (s.structureType == STRUCTURE_SPAWN)}).length;
                        if (spawnConstructionsites == 0) {
                            remoteController.pos.createConstructionSite(STRUCTURE_SPAWN);
                        }
                    }

                    var oldBuildings = creep.room.find(FIND_STRUCTURES, {filter: (s) => s.structureType == STRUCTURE_SPAWN || s.structureType == STRUCTURE_EXTENSION});
                    for (var b in oldBuildings) {
                        if (oldBuildings[b].isActive() == false) {
                            oldBuildings.destroy();
                        }
                    }
                }
            }
            else {
                //Hostiles creeps in new room
                var homespawn = Game.getObjectById(creep.memory.spawn);
                if (creep.room.name != creep.memory.homeroom) {
                    creep.moveTo(homespawn), {reusePath: 10};
                }
                else if (creep.pos.getRangeTo(homespawn) > 5) {
                    creep.moveTo(homespawn), {reusePath: 10};
                }
            }
        }
    }
};