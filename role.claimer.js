module.exports = {
    // a function to run the logic for this role
    run: function(creep) {
        // Find exit to target room
        var remoteController = Game.flags[creep.findMyFlag("remoteController")];
        if (remoteController != undefined) {
            creep.memory.currentFlag = remoteController.name;
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
                else {
                    creep.moveTo(creep.room.controller, {reusePath: DELAYPATHFINDING});
                }

                if (returncode == ERR_NOT_IN_RANGE) {
                    creep.moveTo(creep.room.controller, {reusePath: DELAYPATHFINDING});
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
                    creep.moveTo(homespawn), {reusePath: DELAYPATHFINDING};
                }
                creep.memory.fleeing = true;
            }
        }
    }
};