
module.exports = {
    // a function to run the logic for this role
    run: function(creep, allies) {
        var nameFlag = creep.findMyFlag("protector");
        var protectorFlag = _.filter(Game.flags,{ name: nameFlag})[0];

        if (creep.room.memory.hostiles > 0) {

            // Attack code
            var hostiles = creep.room.find(FIND_HOSTILE_CREEPS);
            var maxHealBodyParts = 0;
            var HealBodyParts;
            var healingInvader = undefined;

            for (var h in hostiles) {
                HealBodyParts = 0;
                for (var part in hostiles[h].body) {
                    if(hostiles[h].body[part].type == "heal") {
                        //Healing body part found
                        HealBodyParts++;
                    }
                }

                if (HealBodyParts > maxHealBodyParts) {
                    maxHealBodyParts = HealBodyParts;
                    healingInvader = hostiles[h].id;
                }
            }

            if (healingInvader != undefined) {
                hostiles[0] = Game.getObjectById(healingInvader);
            }
            var username = hostiles[0].owner.username;
            if (allies.indexOf(username) == -1) {
                if (creep.attack(hostiles[0]) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(hostiles[0]);
                }
            }
        }
        else if (protectorFlag != undefined) {

            //Move to flag if not there
            var range = creep.pos.getRangeTo(protectorFlag);
            if (range > 5) {
                creep.moveTo(protectorFlag, {ignoreCreeps: false, reusePath: DELAYPATHFINDING});
            }
        }
        else {
            //No flag for protector anymore
            if (creep.goToHomeRoom() == true) {
                var spawn = Game.getObjectById(creep.memory.spawn);
                var range = creep.pos.getRangeTo(creep.room.controller);
                if (range > 1) {
                    creep.moveTo(creep.room.controller, {reusePath: DELAYPATHFINDING});
                }
            }
        }
    }
};