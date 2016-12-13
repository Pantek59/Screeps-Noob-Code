Creep.prototype.roleHarvester = function() {
    if (this.goToHomeRoom() == true) {
        if (this.carry.energy == 0) {
            // if creep is bringing energy to a structure but has no energy left
            if (this.memory.working == true) {
                delete this.memory.targetBuffer;
            }
            this.memory.working = false;
        }
        else if (this.carry.energy == this.carryCapacity) {
            // if creep is harvesting energy but is full
            if (this.memory.working == false) {
                delete this.memory.targetBuffer;
            }
            this.memory.working = true;
        }

        // if creep is supposed to transfer energy to a structure
        if (this.memory.working == true) {
            // find closest spawn, extension or tower which is not full
            var structure;

            if (this.room.memory.hostiles.length > 0 && this.room.find(FIND_MY_CREEPS, {filter: (s) => (s.memory.role == "protector")}).length == 0) {
                //no tower refill;
                structure = this.findResource(RESOURCE_SPACE, STRUCTURE_SPAWN, STRUCTURE_EXTENSION);
            }
            else {
                //towers included in energy distribution
                structure = this.findResource(RESOURCE_SPACE, STRUCTURE_SPAWN, STRUCTURE_EXTENSION, STRUCTURE_TOWER);
            }
            var nuker;
            var powerSpawn;
            if (this.room.memory.roomArray.nukers != undefined) {
                nuker = Game.getObjectById(this.room.memory.roomArray.nukers[0]);
            }
            else {
                nuker = null;
            }
            if (this.room.memory.roomArray.powerSpawns != undefined) {
                powerSpawn = Game.getObjectById(this.room.memory.roomArray.powerSpawns[0]);
            }
            else {
                powerSpawn = null;
            }

            if (structure != undefined && structure != null) {
                // if we found one -> try to transfer energy, if it is not in range
                if (this.transfer(structure, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    // move towards it
                    this.moveTo(structure, {reusePath: moveReusePath()});
                }
            }
            else if (nuker != null && nuker.energy < nuker.energyCapacity && this.room.storage.store[RESOURCE_ENERGY] > 50000) {
                //Bring energy to nuker
                if (this.transfer(nuker, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    // move towards it
                    this.moveTo(nuker, {reusePath: moveReusePath()});
                }
            }
            else if (powerSpawn != null && powerSpawn.energy < powerSpawn.energyCapacity && this.room.storage.store[RESOURCE_ENERGY] > 50000) {
                //Bring energy to power spawn
                if (this.transfer(powerSpawn, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    // move towards it
                    this.moveTo(powerSpawn, {reusePath: moveReusePath()});
                }
            }
            else {
                let labBreaker = false;
                if (this.room.memory.boostLabs != undefined) {
                    //Check boost labs for energy
                    for (let b in this.room.memory.boostLabs) {
                        let lab = Game.getObjectById(this.room.memory.boostLabs[b]);
                        if (lab.energyCapacity > lab.energy) {
                            //lab needs energy
                            if (this.transfer(lab, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                                // move towards it
                                this.moveTo(lab, {reusePath: moveReusePath()});
                            }
                            labBreaker = true;
                            break;
                        }
                    }
                }

                if (labBreaker == false) {
                    //Nothing needs energy -> store it
                    var container = this.findResource(RESOURCE_SPACE, STRUCTURE_STORAGE);
                    if (container == null || container == undefined) {
                        container = this.findResource(RESOURCE_SPACE, STRUCTURE_CONTAINER);
                    }

                    if (this.transfer(container, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                        this.moveTo(container, {reusePath: moveReusePath()});
                    }
                }
            }
        }
        // if creep is supposed to harvest energy from source
        else {
            this.roleCollector();
        }
    }
};