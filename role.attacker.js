var strategies = require('strategies');

module.exports = {
    // a function to run the logic for this role
    run: function(creep) {
        var group = creep.findMyFlag("unitGroup");
        var groupFlag = _.filter(Game.flags,{ name: group})[0];

        if (groupFlag != undefined) {
            if (creep.room.name == groupFlag.pos.roomName) {
                //Arrived in target room, execute strategy
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
                    creep.moveTo(groupFlag, {reusePath: 5});
                }
            }
        }
        else if (groupFlag != undefined && groupFlag != null) {
            //Move to flag if not in target room yet
            var range = creep.pos.getRangeTo(groupFlag);
            if (range > 5) {
                creep.moveTo(groupFlag, {reusePath: 3});
            }
        }
        else {
            //No flag for protector anymore -> go home
            if (creep.goToHomeRoom() == true) {
                let spawn = Game.getObjectById(creep.memory.spawn);
                var range = creep.pos.getRangeTo(spawn);
                if (range > 3) {
                    creep.moveTo(spawn, {reusePath: 3});
                }
            }
        }
    }
};