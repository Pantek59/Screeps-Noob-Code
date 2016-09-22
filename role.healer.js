
module.exports = {
    // a function to run the logic for this role
    run: function(creep, allies) {
        var group = creep.findMyFlag("unitGroup");
        var groupFlag = _.filter(Game.flags,{ name: group})[0];

        var woundedCreep = creep.pos.findClosestByRange(FIND_MY_CREEPS, {filter: (s) => (s.hits < s.hitsMax)});
        if (woundedCreep != null) {
            if (creep.pos.getRangeTo(woundedCreep) > 1) {
                creep.moveTo(woundedCreep);
            }
            creep.heal(woundedCreep);
        }
        else if (groupFlag != undefined) {

            //Move to flag if not there
            var range = creep.pos.getRangeTo(groupFlag);
            if (range > 5) {
                creep.moveTo(groupFlag, {reusePath: 3});
            }
        }
        else {
            //No flag for healers anymore
            if (creep.goToHomeRoom() == true) {
                var spawn = Game.getObjectById(creep.memory.spawn);
                var range = creep.pos.getRangeTo(spawn);
                if (range > 10) {
                    creep.moveTo(spawn, {reusePath: 3});
                }
            }
        }
    }
};