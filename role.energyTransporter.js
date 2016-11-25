//require ("globals");
module.exports = {
    // state working = Returning energy to structure
    run: function(creep) {
        var roleCollector = require('role.collector');
        var roleHarvester = require('role.harvester');

        if (creep.getRidOfMinerals() == false) {
            // if creep is bringing energy to a structure but has no energy left
            if (creep.carry.energy == 0) {
                if (creep.memory.working == true) {
                    delete creep.memory.targetBuffer;
                }
                // switch state to harvesting
                creep.memory.working = false;
            }
            // if creep is harvesting energy but is full
            else if (_.sum(creep.carry) == creep.carryCapacity) {
                if (creep.memory.working == false) {
                    delete creep.memory.targetBuffer;
                }
                // switch state
                creep.memory.working = true;
            }

            // if creep is supposed to transfer energy to a structure
            if (creep.memory.working == true) {
                creep.roleHarvester();
            }
            // if creep is supposed to harvest energy from source
            else {
                creep.roleCollector();
            }
        }
    }
};