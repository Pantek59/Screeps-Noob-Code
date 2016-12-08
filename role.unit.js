Creep.prototype.roleUnit = function() {
    var strategies = require('strategies');
    var group = this.findMyFlag("unitGroup");
    var groupFlag = _.filter(Game.flags,{ name: group})[0];

    if (this.memory.strategy == true && groupFlag != undefined && groupFlag.memory.strategy != undefined && this.room.name == groupFlag.pos.roomName) {
        strategies.run(this, groupFlag);
    }
    else if (groupFlag != undefined) {
        if (this.room.name == groupFlag.pos.roomName) {
            //Arrived in target room, execute strategy
            this.memory.strategy = true;
            strategies.run(this, groupFlag);
        }
        else {
            // Creep still on route, attack within 4 range
            this.memory.strategy = false;
            if (this.room.memory.hostiles.length > 0) {
                //Enemy creeps around
                let nearTargets = this.pos.findInRange(FIND_HOSTILE_CREEPS, 4, function (c) { return isHostile(c)});
                if (nearTargets.length > 0) {
                    let target = this.pos.findClosestByPath(nearTargets);
                    if (this.attack(target) == ERR_NOT_IN_RANGE) {
                        this.moveTo(target);
                    }
                }
            }
            else {
                this.gotoFlag(groupFlag);
            }
        }
    }
    else {
        //No flag for creep anymore -> go home
        delete this.memory.currentFlag;
        delete this.memory.strategy;
        if (this.goToHomeRoom() == true) {
            var range = this.pos.getRangeTo(this.room.controller);
            if (range > 1) {
                this.moveTo(this.room.controller, {reusePath: moveReusePath()});
            }
        }
    }
};