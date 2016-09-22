
module.exports = {
    // a function to run the logic for this role
    run: function(creep) {
        var group = creep.findMyFlag("unitGroup");
        var groupFlag = _.filter(Game.flags,{ name: group})[0];

        if (groupFlag != undefined && groupFlag != null && creep.room.memory.hostiles > 0 || creep.room.name == groupFlag.pos.roomName) {
            // Attack when hostiles are present or when target room is reached
            // Look for structures designated by flag
            if (creep.room.name == groupFlag.pos.roomName) {
                //Check for target and creeps around it
                var target = creep.findNearestEnemyAttacker(3, groupFlag.pos);
                if (target == null) {
                    //No enemy creep near the target structure
                    var flagStructures = groupFlag.pos.lookFor(LOOK_STRUCTURES);
                    if (flagStructures.length > 0) {
                        for (var struct in flagStructures) {
                            if (flagStructures[struct].structureType != STRUCTURE_ROAD) {
                                target = flagStructures[struct];
                            }
                        }
                    }
                }
            }

            if (target == null || target == undefined) {
                // No structure to be attacked
                target = creep.findNearestEnemyAttacker();

                if (target == null) {
                    target = creep.findNearestEnemyHealer();
                }
            }

            if (target != undefined) { // Attack target
                if (creep.attack(target) == ERR_NOT_IN_RANGE) {
                    var nearTarget = creep.pos.findInRange(FIND_HOSTILE_CREEPS, 1);
                    if (nearTarget.length > 0) {
                        creep.attack(nearTarget[0]);
                        creep.moveTo(target);
                    }
                }
            }
            else {
                //There is nothing to attack
                var range = creep.pos.getRangeTo(groupFlag);
                if (range > 5) {
                    creep.moveTo(groupFlag);
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
                var range = creep.pos.getRangeTo(spawn);
                if (range > 3) {
                    creep.moveTo(spawn, {reusePath: 3});
                }
            }
        }
    }
};