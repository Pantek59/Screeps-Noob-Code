module.exports = {
    // a function to run the logic for this role
    run: function(creep) {
        // Find exit to target room
        var targetControllers = _.filter(Game.flags,{ memory: { function: 'attackController', spawn: creep.memory.spawn}});
        var targetController;
        var busyCreeps;
        //TODO Switch bigClaimer to creep.findMyFlag()
        if (creep.memory.attackControllerFlag != undefined) {
            //Check whether claiming this flag is this OK
            busyCreeps = _.filter(Game.creeps,{ memory: { remoteControllerFlag: creep.memory.attackControllerFlag, spawn: creep.memory.spawn}});
        }

        if (creep.memory.attackControllerFlag == undefined || (creep.memory.attackControllerFlag != undefined && busyCreeps.length != 1)) {
            //Flag taken, choose other flag
            for (var rem in targetControllers) {
                //Look for unoccupied targetController
                var flagName = targetControllers[rem].name;

                creep.memory.attackControllerFlag = targetControllers[rem].name;
                busyCreeps = _.filter(Game.creeps,{ memory: { attackControllerFlag: flagName, spawn: creep.memory.spawn}});

                if (busyCreeps.length <= targetControllers[rem].memory.volume) {
                    //No other claimer working on this flag
                    targetController = targetControllers[rem];
                    creep.memory.attackControllerFlag = targetController.name;
                    break;
                }
            }
        }
        else {
            //Load previous flag
            targetControllers = _.filter(Game.flags,{name: creep.memory.attackControllerFlag});
            targetController = targetControllers[0];
        }

        if (targetController != undefined && creep.room.name != targetController.pos.roomName) {
            //still in wrong room, go out
            if (!creep.memory.path) {
                creep.memory.path = creep.pos.findPathTo(targetController);
            }
            if (creep.moveByPath(creep.memory.path) == ERR_NOT_FOUND) {
                creep.memory.path = creep.pos.findPathTo(targetController);
                creep.moveByPath(creep.memory.path)
            }
        }
        else if (targetController != undefined) {
            //new room reached, start reserving / claiming
            var returncode;
            // try to claim the controller
            if (creep.room.controller.owner == undefined) {
                if (targetController.memory.claim == 1) {
                    returncode = creep.claimController(creep.room.controller);
                }
                else {
                    returncode = creep.reserveController(creep.room.controller);
                }
            }
            else {
                returncode = creep.attackController(creep.room.controller);
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
                        targetController.pos.createConstructionSite(STRUCTURE_SPAWN);
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
    }
};