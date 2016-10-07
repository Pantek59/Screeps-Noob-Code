
module.exports = {
    // a function to run the logic for this role
    run: function(creep) {
        var group = creep.findMyFlag("unitGroup");
        var groupFlag = _.filter(Game.flags,{ name: group})[0];

        if (groupFlag != undefined && (groupFlag != null && creep.room.memory.hostiles > 0 || creep.room.name == groupFlag.pos.roomName)) {
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

                    var flagStructures = groupFlag.pos.lookFor(LOOK_CONSTRUCTION_SITES);
                    if (flagStructures.length > 0) {
                        for (var struct in flagStructures) {
                            if (flagStructures[struct].structureType != STRUCTURE_ROAD) {
                                target = flagStructures[struct];
                            }
                        }
                    }
                }

                if (target == null || target == undefined) {
                    // No structure to be attacked
                    target = creep.findNearestEnemyAttacker(8, groupFlag.pos);
                    if (target == null) {
                        target = creep.findNearestEnemyHealer(8, groupFlag.pos);
                    }
                    if (target == null) {
                        target = creep.pos.findClosestByPath(FIND_HOSTILE_CREEPS);
                    }
                }
            }
            else {
                // Creep still on route
                let nearTargets = creep.pos.findInRange(FIND_HOSTILE_CREEPS, 3);
                if (nearTargets.length > 0) {
                    target = creep.pos.findClosestByPath(FIND_HOSTILE_CREEPS);
                }
                else {
                    creep.moveTo(groupFlag, {reusePath: 5});
                }
            }


            if (target != undefined) { // Attack target
                if (creep.attack(target) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(target);
                }
            }
            else {
                //There is nothing to attack
                var range = creep.pos.getRangeTo(groupFlag);
                if (range > 5) {
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