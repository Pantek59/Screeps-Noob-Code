Creep.prototype.roleUpgrader = function() {
    if (this.goToHomeRoom() == true) {
        // if creep is bringing energy to the controller but has no energy left
        if (this.memory.working == true && this.carry.energy == 0) {
            // switch state
            this.memory.working = false;
        }
        else if (this.memory.working == false && this.carry.energy == this.carryCapacity) {
            // switch state
            // if creep is harvesting energy but is full
            this.memory.working = true;
        }

        // if creep is supposed to transfer energy to the controller
        if (this.memory.working == true) {
            if (this.room.memory.hostiles.length > 0) {
                // Hostiles present in room
                this.towerEmergencyFill();
            }
            else if (this.upgradeController(this.room.controller) == ERR_NOT_IN_RANGE) {
                // try to upgrade the controller, if not in range, move towards the controller
                let path = this.pos.findPathTo(this.room.controller, {ignoreCreeps: false});
                if (path.length == 0) {
                    path = this.pos.findPathTo(this.room.controller, {ignoreCreeps: true});
                }
                this.moveByPath(path);
            }

            if (Game.time % 11 == 0) {
                if (this.pos.getRangeTo(this.room.controller) > 1) {
                    this.moveTo(this.room.controller, {reusePath: moveReusePath(), ignoreCreeps: true});
                }
            }
        }
        // if creep is supposed to harvest energy from source
        else {
            this.roleCollector();
        }
    }
};