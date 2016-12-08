Creep.prototype.roleCollector = function() {
    // check for picked up minerals
    if (this.memory.statusHarvesting == undefined || this.memory.statusHarvesting == false) {
        var container;
        if (this.memory.role == "harvester" || this.memory.role == "energyTransporter" || this.memory.role == "distributor" || this.memory.role == "scientist") {
            // find closest container with energy
            if (this.room.energyCapacityAvailable > this.room.energyAvailable) {
                if (this.room.memory.terminalTransfer == undefined && this.checkTerminalLimits(RESOURCE_ENERGY).amount > 0) {
                    //spawn not full, terminal transfer ongoing -> find source, container or storage if available
                    if (this.memory.role == "harvester") {
                        container = this.findResource(RESOURCE_ENERGY, FIND_SOURCES, STRUCTURE_LINK, STRUCTURE_CONTAINER, STRUCTURE_STORAGE, STRUCTURE_TERMINAL);
                    }
                    if (this.memory.role == "energyTransporter" || this.memory.role == "distributor" || this.memory.role == "scientist") {
                        container = this.findResource(RESOURCE_ENERGY, STRUCTURE_LINK, STRUCTURE_CONTAINER, STRUCTURE_STORAGE, STRUCTURE_TERMINAL);
                    }
                }
                else {
                    //spawn not full, no terminal transfer ongoing -> find source, container, terminal or storage if available
                    if (this.memory.role == "harvester") {
                        container = this.findResource(RESOURCE_ENERGY, FIND_SOURCES, STRUCTURE_LINK, STRUCTURE_CONTAINER, STRUCTURE_STORAGE);
                    }
                    if (this.memory.role == "energyTransporter" || this.memory.role == "distributor" || this.memory.role == "scientist") {
                        container = this.findResource(RESOURCE_ENERGY, STRUCTURE_LINK, STRUCTURE_CONTAINER, STRUCTURE_STORAGE);
                    }
                }

            }
            else if (this.room.storage != undefined && this.room.storage.storeCapacity - _.sum(this.room.storage.store > 0)) {
                if (this.room.memory.terminalTransfer == undefined && this.checkTerminalLimits(RESOURCE_ENERGY).amount > 0) {
                    //spawn full and storage with space exists or towers need energy
                    if (this.memory.role == "harvester") {
                        container = this.findResource(RESOURCE_ENERGY, FIND_SOURCES, STRUCTURE_LINK, STRUCTURE_CONTAINER, STRUCTURE_TERMINAL);
                    }
                    if (this.memory.role == "energyTransporter" || this.memory.role == "distributor" || this.memory.role == "scientist") {
                        container = this.findResource(RESOURCE_ENERGY, STRUCTURE_LINK, STRUCTURE_CONTAINER, STRUCTURE_TERMINAL);
                    }
                }
                else {
                    //spawn full and storage with space exists or towers need energy
                    if (this.memory.role == "harvester") {
                        container = this.findResource(RESOURCE_ENERGY, FIND_SOURCES, STRUCTURE_LINK, STRUCTURE_CONTAINER);
                    }
                    if (this.memory.role == "energyTransporter" || this.memory.role == "distributor" || this.memory.role == "scientist") {
                        container = this.findResource(RESOURCE_ENERGY, STRUCTURE_LINK, STRUCTURE_CONTAINER);
                    }
                }
            }
            else {
                if (this.room.memory.terminalTransfer == undefined && this.checkTerminalLimits(RESOURCE_ENERGY).amount > 0) {
                    if (this.memory.role == "harvester") {
                        container = this.findResource(RESOURCE_ENERGY, FIND_SOURCES, STRUCTURE_LINK, STRUCTURE_TERMINAL);
                    }
                    if (this.memory.role == "energyTransporter" || this.memory.role == "distributor" || this.memory.role == "scientist") {
                        container = this.findResource(RESOURCE_ENERGY, STRUCTURE_LINK, STRUCTURE_TERMINAL);
                    }
                }
                else {
                    if (this.memory.role == "harvester") {
                        container = this.findResource(RESOURCE_ENERGY, FIND_SOURCES, STRUCTURE_LINK);
                    }
                    if (this.memory.role == "energyTransporter" || this.memory.role == "distributor" || this.memory.role == "scientist") {
                        container = this.findResource(RESOURCE_ENERGY, STRUCTURE_LINK);
                    }
                }
            }
            if (container == undefined) {
                //Nothing to do
                let mineralsContainers = this.room.find(FIND_STRUCTURES, {filter: (s) => s.structureType == STRUCTURE_CONTAINER && (_.sum(s.store) > s.store[RESOURCE_ENERGY] || (_.sum(s.store) > 0 && s.store[RESOURCE_ENERGY == 0]))});
                if (mineralsContainers.length == 0) {
                    this.memory.sleep = 5;
                    return (-1);
                }
                else {
                    //get minerals from container
                    if (this.memory.tidyFull == undefined && _.sum(this.carry) < this.carryCapacity) {
                        //creep not full
                        for (let e in mineralsContainers[0].store){
                            if (e != "energy" && this.withdraw(mineralsContainers[0],e) == ERR_NOT_IN_RANGE) {
                                this.moveTo(mineralsContainers[0],{reusePath: moveReusePath()});
                            }
                        }
                    }
                    else {
                        //creep full
                        this.memory.tidyFull = true;
                        this.storeAllBut();
                        if (_.sum(this.carry) == 0) {
                            delete this.memory.tidyFull;
                        }
                    }
                }
            }
            else if (container.ticksToRegeneration == undefined && (container.energy == undefined || container.energy < 3000)) {
                //container
                if (this.withdraw(container, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    this.moveTo(container, {reusePath: moveReusePath()});
                }
            }
            else {
                //Source
                if (this.harvest(container) == ERR_NOT_IN_RANGE) {
                    this.moveTo(container, {reusePath: moveReusePath()});
                }
            }
        }
        else {
            //no room harvester role
            // find closest source
            if (this.room.memory.terminalTransfer == undefined && this.checkTerminalLimits(RESOURCE_ENERGY).amount > 0) {
                container = this.findResource(RESOURCE_ENERGY, FIND_SOURCES, STRUCTURE_LINK, STRUCTURE_CONTAINER, STRUCTURE_STORAGE, STRUCTURE_TERMINAL);
            }
            else {
                container = this.findResource(RESOURCE_ENERGY, FIND_SOURCES, STRUCTURE_LINK, STRUCTURE_CONTAINER, STRUCTURE_STORAGE);
            }
            if (container != undefined) {
                var res = this.withdraw(container, RESOURCE_ENERGY);
                if (res != OK && res != ERR_NOT_IN_RANGE) {
                    res = this.harvest(container)
                }

                if (res == ERR_NOT_IN_RANGE) {
                    this.moveTo(container, {reusePath: moveReusePath()});
                }
            }
            else {
                return -1;
            }
        }
    }
    else {
        // Creep is harvesting, try to keep harvesting
        if (this.harvest(Game.getObjectById(this.memory.statusHarvesting)) != OK) {
            this.memory.statusHarvesting = false;
        }
    }
    return OK;
};