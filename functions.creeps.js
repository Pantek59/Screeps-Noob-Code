module.exports = function() {
    // find unoccupied flag and return flag name
    Creep.prototype.towerEmergencyFill = function(flagFunction) {
        var tower = this.pos.findClosestByPath(FIND_MY_STRUCTURES, {filter: (s) => s.structureType == STRUCTURE_TOWER && s.energy < s.energyCapacity});
        if (tower != null) {
            if (this.transfer(tower, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                this.moveTo(tower, {reusePath: 5});
            }
        }
    }
};