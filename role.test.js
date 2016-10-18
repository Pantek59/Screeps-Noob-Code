require('functions.creeps')();

module.exports = {
    // a function to run the logic for this role
    run: function(creep) {
        var targetFlag = Game.flags["Flag1"];
        if (creep.pos.isEqualTo(targetFlag.pos) == false) {
            creep.MoveToRemoteFlag(targetFlag.name);
        }
    }
};