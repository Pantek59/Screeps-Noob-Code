module.exports = {
    run: function(creep) {
        var roleCollector = require('role.collector');
        if (creep.goToHomeRoom() == true) {
            // if creep is bringing energy to the controller but has no energy left
            if (creep.memory.working == true && creep.carry.energy == 0) {
                // switch state
                creep.memory.working = false;
            }
            // if creep is harvesting energy but is full
            else if (creep.memory.working == false && creep.carry.energy == creep.carryCapacity) {
                // switch state
                creep.memory.working = true;
            }

            // if creep is supposed to transfer energy to the controller
            if (creep.memory.working == true) {
                if (creep.room.memory.hostiles.length > 0) {
                    // Hostiles present in room
                    creep.towerEmergencyFill();
                }
                else if (creep.upgradeController(creep.room.controller) == ERR_NOT_IN_RANGE) {
                    // try to upgrade the controller, if not in range, move towards the controller
                    let path = creep.pos.findPathTo(creep.room.controller, {ignoreCreeps: false});
                    if (path.length == 0) {
                        path = creep.pos.findPathTo(creep.room.controller, {ignoreCreeps: true});
                    }
                    creep.moveByPath(path);
                }

                if (Game.time % 11 == 0) {
                    if (creep.pos.getRangeTo(creep.room.controller) > 1) {
                        creep.moveTo(creep.room.controller, {reusePath: moveReusePath(), ignoreCreeps: true});
                    }
                }
            }
            // if creep is supposed to harvest energy from source
            else {
                roleCollector.run(creep);
            }
        }
    }
};