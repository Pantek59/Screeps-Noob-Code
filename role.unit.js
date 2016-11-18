var strategies = require('strategies');

module.exports = {
    // a function to run the logic for this role
    run: function(creep) {
        var group = creep.findMyFlag("unitGroup");
        var groupFlag = _.filter(Game.flags,{ name: group})[0];

        if (creep.memory.strategy == true && groupFlag != undefined && groupFlag.memory.strategy != undefined && creep.room.name == groupFlag.pos.roomName) {
            strategies.run(creep, groupFlag);
        }
        else if (groupFlag != undefined) {
            if (creep.room.name == groupFlag.pos.roomName) {
                //Arrived in target room, execute strategy
                creep.memory.strategy = true;
                strategies.run(creep, groupFlag);
            }
            else {
                // Creep still on route, attack within 4 range
                creep.memory.strategy = false;
                if (creep.room.memory.hostiles.length > 0) {
                    //Enemy creeps around
                    let nearTargets = creep.pos.findInRange(FIND_HOSTILE_CREEPS, 4, function (c) { return isHostile(c)});
                    if (nearTargets.length > 0) {
                        let target = creep.pos.findClosestByPath(nearTargets);
                        if (creep.attack(target) == ERR_NOT_IN_RANGE) {
                            creep.moveTo(target);
                        }
                    }
                }
                else {
                    creep.gotoFlag(groupFlag);
                }
            }
        }
        else {
            //No flag for creep anymore -> go home
            delete creep.memory.currentFlag;
            delete creep.memory.strategy;
            if (creep.goToHomeRoom() == true) {
                var range = creep.pos.getRangeTo(creep.room.controller);
                if (range > 1) {
                    creep.moveTo(creep.room.controller, {reusePath: moveReusePath()});
                }
            }
        }
    }
};