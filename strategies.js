module.exports = {
    // a function to run the logic for this role
    run: function(creep, flag) {
        var strategy = flag.memory.strategy;

        switch (strategy) {
            case "remoteDrain":
                /*
                 Place flag near an exit to the room you want to drain.
                 - Healer will remain outside the room and heal all friendly creeps within range 10 of the flag
                 - Attacker will wait near flag, attack any hostile creep within 10 range of the flag and wait until full health, then enter room.
                 It makes one step into the room and waits until health is below 66%. Then it leaves the room and returns to flag.
                 - Einarr will wait near flag until full health, then enter room. It makes one step into the room, waits and tries to heal itself
                 in the case of damage. If health drops below 66% it leaves the room and returns to flag.
                 */
                switch (creep.memory.role) {
                    case "attacker":
                        break;

                    case "healer":
                        if (creep.hits < creep.hitsMax) {
                            //Self-heal
                            creep.heal(creep);
                        }
                        
                        //Look around for creeps
                        var hostileCreeps = creep.pos.findInRange(10, FIND_CREEPS, {filter: function (creep) {return isHostile(creep)}});
                        var friendlyCreeps = creep.pos.findInRange(10, FIND_CREEPS, {filter: function (creep) {return isHostile(creep) ? false : true}});

                        if (hostileCreeps.length > 0) {
                            //Hostiles near, flee!
                            creep.moveTo(hostileCreeps, {flee: true});
                        }
                        else if (friendlyCreeps.length > 0) {
                            //Look for nearest creep needing help
                            var patient = creep.pos.findClosestByPath(FIND_CREEPS, {filter: function (creep) {return creep.hits < creep.hitsMax}});
                            if (patient != null) {
                                if (creep.heal(patient) == ERR_NOT_IN_RANGE) {
                                    creep.moveTo(patient, {reusePath: 2});
                                }
                            }

                        }
                        else if (creep.pos.getRangeTo(flag) > 3) {
                            creep.moveTo(flag, {reusePath: 8});
                        }
                        break;

                    case "einarr":
                        break;
                }
                break;
            default:
                // Standard strategy (wait, heal and attack within 5 range)
                break;
        }
    }
};