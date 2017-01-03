Creep.prototype.roleBigClaimer = function() {
    // Find exit to target room
    let targetController = Game.flags[this.findMyFlag("attackController")];
    if (targetController != undefined && this.room.name != targetController.pos.roomName) {
        //still in wrong room, go out
        this.moveTo(targetController, {reusePath: moveReusePath()});
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