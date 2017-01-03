Creep.prototype.roleEnergyTransporter = function() {
    if (this.storeAllBut(RESOURCE_ENERGY) == true) {
        // if creep is bringing energy to a structure but has no energy left
        if (this.carry.energy == 0) {
            if (this.memory.working == true) {
                delete this.memory.targetBuffer;
            }
            // switch state to harvesting
            this.memory.working = false;
        }
        // if creep is harvesting energy but is full
        else if (_.sum(this.carry) == this.carryCapacity) {
            if (this.memory.working == false) {
                delete this.memory.targetBuffer;
            }
            // switch state
            this.memory.working = true;
        }

        // if creep is supposed to transfer energy to a structure
        if (this.memory.working == true) {
            this.roleHarvester();
        }
        // if creep is supposed to harvest energy from source
        else {
            this.roleCollector();
        }
    }
};