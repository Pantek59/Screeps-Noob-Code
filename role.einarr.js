var roleAttacker = require('role.attacker');

module.exports = {
    // a function to run the logic for this role
    run: function(creep) {
        var healParts = _.filter(creep.body,{ type: HEAL}).length;
        if (creep.hits > (creep.hitsMax - (healParts * 12))) {
            // Creep full strength
            roleAttacker.run(creep);
        }
        else {
            // Creep damaged
            creep.heal(creep);
        }
    }
};