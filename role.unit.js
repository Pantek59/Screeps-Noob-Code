var strategies = require('strategies');

module.exports = {
    // a function to run the logic for this role
    run: function(creep) {
        var group = creep.findMyFlag("unitGroup");
        var groupFlag = _.filter(Game.flags,{ name: group})[0];

        if (creep.memory.strategy == true && groupFlag != undefined && groupFlag.memory.strategy != undefined && groupFlag.memory.strategy == creep.memory.strategy) {
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
                let nearTargets = creep.pos.findInRange(FIND_HOSTILE_CREEPS, 4);
                if (nearTargets.length > 0) {
                    target = creep.pos.findClosestByPath(FIND_HOSTILE_CREEPS);
                    if (creep.attack(target) == ERR_NOT_IN_RANGE) {
                        creep.moveTo(target);
                    }
                }
                else {
                    creep.moveTo(groupFlag, {reusePath: DELAYPATHFINDING});
                }
            }
        }

        if (groupFlag != undefined && groupFlag != null) {
            //Move to flag if not in target room yet
            var range = creep.pos.getRangeTo(groupFlag);
            if (range > 5) {
                creep.moveTo(groupFlag, {reusePath: DELAYPATHFINDING});
            }
        }
        else {
            //No flag for creep anymore -> go home
            delete creep.memory.currentFlag;
            delete creep.memory.strategy;
            if (creep.goToHomeRoom() == true) {
                var range = creep.pos.getRangeTo(creep.room.controller);
                if (range > 1) {
                    creep.moveTo(creep.room.controller, {reusePath: 3});
                }
            }
        }
    }
};