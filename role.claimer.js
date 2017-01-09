Creep.prototype.roleClaimer = function() {
    // Find exit to target room
    var remoteControllerFlag;
    if (this.memory.currentFlag == undefined) {
        remoteControllerFlag = Game.flags[this.findMyFlag("remoteController")];
    }
    else {
        remoteControllerFlag = Game.flags[this.memory.currentFlag];
    }
    if (remoteControllerFlag != undefined) {
        this.memory.currentFlag = remoteControllerFlag.name;
    }
    if (remoteControllerFlag != undefined && this.room.name != remoteControllerFlag.pos.roomName) {
        //still in wrong room, go out
        this.gotoFlag(remoteControllerFlag);
    }
    else if (remoteControllerFlag != undefined) {
        //new room reached, start reserving / claiming
        var returncode;

        if (this.room.memory.hostiles.length == 0) {
            // try to claim the controller
            if (this.room.controller.owner == undefined) {
                if (remoteControllerFlag.memory.claim == 1) {
                    returncode = this.claimController(this.room.controller);
                }
                else {
                    returncode = this.reserveController(this.room.controller);
                }
            }
            else {
                this.moveTo(this.room.controller, {reusePath: moveReusePath()});
            }

            if (returncode == ERR_NOT_IN_RANGE) {
                this.moveTo(this.room.controller, {reusePath: moveReusePath()});
            }

            if (this.room.controller.owner != undefined && this.room.controller.owner.username == playerUsername) {
                //Roomed successfully claimed, now build spawn and remove spawns and extensions from previous owner
                let spawns = this.room.find(FIND_MY_SPAWNS).length;
                if (spawns == 0) {

                    var spawnConstructionsites = this.room.find(FIND_MY_CONSTRUCTION_SITES, {filter: (s) => (s.structureType == STRUCTURE_SPAWN)}).length;
                    if (spawnConstructionsites == 0) {
                        remoteControllerFlag.pos.createConstructionSite(STRUCTURE_SPAWN);
                    }
                }

                let oldBuildings = this.room.find(FIND_STRUCTURES, {filter: (s) => s.structureType == STRUCTURE_SPAWN || s.structureType == STRUCTURE_EXTENSION});
                for (var b in oldBuildings) {
                    if (oldBuildings[b].isActive() == false) {
                        oldBuildings[b].destroy();
                    }
                }
            }
        }
        else {
            //Hostiles creeps in new room
            let homespawn = Game.getObjectById(this.memory.spawn);
            if (this.room.name != this.memory.homeroom) {
                this.moveTo(homespawn), {reusePath: moveReusePath()};
            }
            this.memory.fleeing = true;
        }
    }
};