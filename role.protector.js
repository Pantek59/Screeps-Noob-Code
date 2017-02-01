Creep.prototype.roleProtector = function() {
    var nameFlag = this.findMyFlag("protector");
    var protectorFlag = Game.flags[nameFlag];
    if (this.room.memory.hostiles.length > 0) {
        // Attack code
        var hostiles = _.filter(this.room.find(FIND_HOSTILE_CREEPS), function (c) { return isHostile(c)});
        var target = this.pos.findClosestByPath(hostiles);

        if (this.rangedAttack(target) == ERR_NOT_IN_RANGE) {
            this.moveTo(target, {reusePath: moveReusePath()});
        }
        else if (this.attack(target) == ERR_NOT_IN_RANGE) {
            this.moveTo(target, {reusePath: moveReusePath()});
        }
    }
    else if (protectorFlag != undefined && protectorFlag.memory.volume > 0) {
        //Move to flag if not there
        let range = this.pos.getRangeTo(protectorFlag);
        if (range > 5) {
            this.moveTo(protectorFlag, {ignoreCreeps: false, reusePath: moveReusePath()});
        }
    }
    else {
        //No flag for protector anymore
        if (this.goToHomeRoom() == true) {
            let range = this.pos.getRangeTo(this.room.controller);
            if (range > 1) {
                this.moveTo(this.room.controller, {reusePath: moveReusePath(), ignoreCreeps: true});
            }
            else {
                this.memory.sleep = 10;
            }
        }
    }
};