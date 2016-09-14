module.exports = function() {
    const RESOURCE_SPACE = "space";

    // find unoccupied flag and return flag name
    Creep.prototype.towerEmergencyFill = function() {
        var tower = this.pos.findClosestByPath(FIND_MY_STRUCTURES, {filter: (s) => s.structureType == STRUCTURE_TOWER && s.energy < s.energyCapacity});
        if (tower != null) {
            if (this.transfer(tower, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                this.moveTo(tower, {reusePath: 5});
            }
        }
    },

    Creep.prototype.getRidOfMinerals = function() {
        // check for picked up minerals and transport them to the next container or storage, return true if found
        var specialResources = false;
        for (var resourceType in this.carry) {
            switch (resourceType) {
                case RESOURCE_ENERGY:
                    break;

                default:
                    // find closest container with space to get rid of minerals

                    if (this.room.name != this.memory.homeroom) {
                        this.moveTo(Game.getObjectById(this.memory.spawn));
                    }
                    else {
                        var freeContainer = this.findResource(RESOURCE_SPACE, STRUCTURE_CONTAINER, STRUCTURE_STORAGE);
                        if (this.transfer(freeContainer, resourceType) == ERR_NOT_IN_RANGE) {
                            this.moveTo(freeContainer, {reusePath: 3});
                        }
                    }
                    specialResources = true;
                    break;
            }
        }
        return specialResources;
    }
};