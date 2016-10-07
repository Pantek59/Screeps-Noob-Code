var roleAttacker = require('role.attacker');

module.exports = {
    // a function to run the logic for this role
    run: function(creep) {
        if (creep.hits >= creep.hitsMax) {
            // Creep full strength
            roleAttacker.run(creep);
        }
        else {
            // Creep damaged
            creep.heal(creep);
            roleAttacker.run(creep);
        }
    }
};