Creep.prototype.roleBigClaimer = function() {
    // Find exit to target room
    var targetControllers = _.filter(Game.flags,{ memory: { function: 'attackController', spawn: this.memory.spawn}});
    var targetController;
    var busyCreeps;
    if (this.memory.attackControllerFlag != undefined) {
        //Check whether claiming this flag is this OK
        busyCreeps = _.filter(Game.creeps,{ memory: { remoteControllerFlag: this.memory.attackControllerFlag, spawn: this.memory.spawn}});
    }

    if (this.memory.attackControllerFlag == undefined || (this.memory.attackControllerFlag != undefined && busyCreeps.length != 1)) {
        //Flag taken, choose other flag
        for (var rem in targetControllers) {
            //Look for unoccupied targetController
            var flagName = targetControllers[rem].name;

            this.memory.attackControllerFlag = targetControllers[rem].name;
            busyCreeps = _.filter(Game.creeps,{ memory: { attackControllerFlag: flagName, spawn: this.memory.spawn}});

            if (busyCreeps.length <= targetControllers[rem].memory.volume) {
                //No other claimer working on this flag
                targetController = targetControllers[rem];
                this.memory.attackControllerFlag = targetController.name;
                break;
            }
        }
    }
    else {
        //Load previous flag
        targetControllers = _.filter(Game.flags,{name: this.memory.attackControllerFlag});
        targetController = targetControllers[0];
    }

    if (targetController != undefined && this.room.name != targetController.pos.roomName) {
        //still in wrong room, go out
        if (!this.memory.path) {
            this.memory.path = this.pos.findPathTo(targetController);
        }
        if (this.moveByPath(this.memory.path) == ERR_NOT_FOUND) {
            this.memory.path = this.pos.findPathTo(targetController);
            this.moveByPath(this.memory.path)
        }
    }
    else if (targetController != undefined) {
        //new room reached, start reserving / claiming
        var returncode;
        // try to claim the controller
        if (this.room.controller.owner == undefined) {
            if (targetController.memory.claim == 1) {
                returncode = this.claimController(this.room.controller);
            }
            else {
                returncode = this.reserveController(this.room.controller);
            }
        }
        else {
            returncode = this.attackController(this.room.controller);
        }
        if (returncode == ERR_NOT_IN_RANGE) {
            this.moveTo(this.room.controller, {reusePath: moveReusePath()});
        }
        if (this.room.controller.owner != undefined && this.room.controller.owner.username == playerUsername) {
            //Roomed successfully claimed, now build spawn and remove spawns and extensions from previous owner
            var spawns = creep.room.find(FIND_MY_SPAWNS).length;
            if (spawns == 0) {
                var spawnConstructionsites = creep.room.find(FIND_CONSTRUCTION_SITES, {filter: (s) => (s.structureType == STRUCTURE_SPAWN)}).length;
                if (spawnConstructionsites == 0) {
                    targetController.pos.createConstructionSite(STRUCTURE_SPAWN);
                }
            }
            var oldBuildings = this.room.find(FIND_STRUCTURES, {filter: (s) => s.structureType == STRUCTURE_SPAWN || s.structureType == STRUCTURE_EXTENSION});
            for (var b in oldBuildings) {
                if (oldBuildings[b].isActive() == false) {
                    oldBuildings.destroy();
                }
            }
        }
    }
};