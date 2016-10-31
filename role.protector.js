
module.exports = {
    // a function to run the logic for this role
    run: function(creep) {
        var nameFlag = creep.findMyFlag("protector");
        var protectorFlag = _.filter(Game.flags,{ name: nameFlag})[0];

        if (creep.room.memory.hostiles.length > 0) {
            // Attack code
            var hostiles = _.filter(creep.room.find(FIND_HOSTILE_CREEPS), function (c) { return isHostile(c)});
            var target = creep.pos.findClosestByPath(hostiles);

            if (creep.attack(target) == ERR_NOT_IN_RANGE) {
                creep.moveTo(target, {reusePath: moveReusePath()});
            }
        }
        else if (protectorFlag != undefined) {

            //Move to flag if not there
            var range = creep.pos.getRangeTo(protectorFlag);
            if (range > 5) {
                creep.moveTo(protectorFlag, {ignoreCreeps: false, reusePath: moveReusePath()});
            }
        }
        else {
            //No flag for protector anymore
            if (creep.goToHomeRoom() == true) {
                var spawn = Game.getObjectById(creep.memory.spawn);
                var range = creep.pos.getRangeTo(creep.room.controller);
                if (range > 1) {
                    creep.moveTo(creep.room.controller, {reusePath: moveReusePath()});
                }
            }
        }
    }
};