//require ("globals");
module.exports = {
    run: function(creep) {
		// check for picked up minerals
        if (creep.memory.statusHarvesting == undefined || creep.memory.statusHarvesting == false) {
            var container;
            if (creep.memory.role == "harvester" || creep.memory.role == "energyTransporter" || creep.memory.role == "distributor" || creep.memory.role == "scientist") {
                // find closest container with energy
                if (creep.room.energyCapacityAvailable > creep.room.energyAvailable) {
                    if (creep.room.memory.terminalTransfer == undefined && creep.checkTerminalLimits(RESOURCE_ENERGY).amount > 0) {
                        //spawn not full, terminal transfer ongoing -> find source, container or storage if available
                        if (creep.memory.role == "harvester") {
                            container = creep.findResource(RESOURCE_ENERGY, FIND_SOURCES, STRUCTURE_LINK, STRUCTURE_CONTAINER, STRUCTURE_STORAGE, STRUCTURE_TERMINAL);
                        }
                        if (creep.memory.role == "energyTransporter" || creep.memory.role == "distributor" || creep.memory.role == "scientist") {
                            container = creep.findResource(RESOURCE_ENERGY, STRUCTURE_LINK, STRUCTURE_CONTAINER, STRUCTURE_STORAGE, STRUCTURE_TERMINAL);
                        }
                    }
                    else {
                        //spawn not full, no terminal transfer ongoing -> find source, container, terminal or storage if available
                        if (creep.memory.role == "harvester") {
                            container = creep.findResource(RESOURCE_ENERGY, FIND_SOURCES, STRUCTURE_LINK, STRUCTURE_CONTAINER, STRUCTURE_STORAGE);
                        }
                        if (creep.memory.role == "energyTransporter" || creep.memory.role == "distributor" || creep.memory.role == "scientist") {
                            container = creep.findResource(RESOURCE_ENERGY, STRUCTURE_LINK, STRUCTURE_CONTAINER, STRUCTURE_STORAGE);
                        }
                    }

                }
                else if (creep.room.storage != undefined && creep.room.storage.storeCapacity - _.sum(creep.room.storage.store > 0)) {
                    if (creep.room.memory.terminalTransfer == undefined && creep.checkTerminalLimits(RESOURCE_ENERGY).amount > 0) {
                        //spawn full and storage with space exists or towers need energy
                        if (creep.memory.role == "harvester") {
                            container = creep.findResource(RESOURCE_ENERGY, FIND_SOURCES, STRUCTURE_LINK, STRUCTURE_CONTAINER, STRUCTURE_TERMINAL);
                        }
                        if (creep.memory.role == "energyTransporter" || creep.memory.role == "distributor" || creep.memory.role == "scientist") {
                            container = creep.findResource(RESOURCE_ENERGY, STRUCTURE_LINK, STRUCTURE_CONTAINER, STRUCTURE_TERMINAL);
                        }
                    }
                    else {
                        //spawn full and storage with space exists or towers need energy
                        if (creep.memory.role == "harvester") {
                            container = creep.findResource(RESOURCE_ENERGY, FIND_SOURCES, STRUCTURE_LINK, STRUCTURE_CONTAINER);
                        }
                        if (creep.memory.role == "energyTransporter" || creep.memory.role == "distributor" || creep.memory.role == "scientist") {
                            container = creep.findResource(RESOURCE_ENERGY, STRUCTURE_LINK, STRUCTURE_CONTAINER);
                        }
                    }
                }
                else {
                    if (creep.room.memory.terminalTransfer == undefined && creep.checkTerminalLimits(RESOURCE_ENERGY).amount > 0) {
                        if (creep.memory.role == "harvester") {
                            container = creep.findResource(RESOURCE_ENERGY, FIND_SOURCES, STRUCTURE_LINK, STRUCTURE_TERMINAL);
                        }
                        if (creep.memory.role == "energyTransporter" || creep.memory.role == "distributor" || creep.memory.role == "scientist") {
                            container = creep.findResource(RESOURCE_ENERGY, STRUCTURE_LINK, STRUCTURE_TERMINAL);
                        }
                    }
                    else {
                        if (creep.memory.role == "harvester") {
                            container = creep.findResource(RESOURCE_ENERGY, FIND_SOURCES, STRUCTURE_LINK);
                        }
                        if (creep.memory.role == "energyTransporter" || creep.memory.role == "distributor" || creep.memory.role == "scientist") {
                            container = creep.findResource(RESOURCE_ENERGY, STRUCTURE_LINK);
                        }
                    }
                }
                if (container == undefined) {
                    //Nothing to do
                    let mineralsContainers = creep.room.find(FIND_STRUCTURES, {filter: (s) => s.structureType == STRUCTURE_CONTAINER && (_.sum(s.store) > s.store[RESOURCE_ENERGY] || (_.sum(s.store) > 0 && s.store[RESOURCE_ENERGY == 0]))});
                    if (mineralsContainers.length == 0) {
                        creep.memory.sleep = 5;
                        return (-1);
                    }
                    else {
                        //get minerals from container
                        if (creep.memory.tidyFull == undefined && _.sum(creep.carry) < creep.carryCapacity) {
                            //creep not full
                            for (let e in mineralsContainers[0].store){
                                if (e != "energy" && creep.withdraw(mineralsContainers[0],e) == ERR_NOT_IN_RANGE) {
                                    creep.moveTo(mineralsContainers[0],{reusePath: moveReusePath()});
                                }
                            }
                        }
                        else {
                            //creep full
                            creep.memory.tidyFull = true;
                            creep.storeAllBut();
                            if (_.sum(creep.carry) == 0) {
                                delete creep.memory.tidyFull;
                            }
                        }
                    }
                }
                else if (container.ticksToRegeneration == undefined && (container.energy == undefined || container.energy < 3000)) {
                    //container
                    if (creep.withdraw(container, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                        creep.moveTo(container, {reusePath: moveReusePath()});
                    }
                }
                else {
                    //Source
                    if (creep.harvest(container) == ERR_NOT_IN_RANGE) {
                        creep.moveTo(container, {reusePath: moveReusePath()});
                    }
                }
            }
            else {
                //no room harvester role
                // find closest source
                if (creep.room.memory.terminalTransfer == undefined && creep.checkTerminalLimits(RESOURCE_ENERGY).amount > 0) {
                    container = creep.findResource(RESOURCE_ENERGY, FIND_SOURCES, STRUCTURE_LINK, STRUCTURE_CONTAINER, STRUCTURE_STORAGE, STRUCTURE_TERMINAL);
                }
                else {
                    container = creep.findResource(RESOURCE_ENERGY, FIND_SOURCES, STRUCTURE_LINK, STRUCTURE_CONTAINER, STRUCTURE_STORAGE);
                }
                if (container != undefined) {
                    var res = creep.withdraw(container, RESOURCE_ENERGY);

                    if (res != OK && res != ERR_NOT_IN_RANGE) {
                        res = creep.harvest(container)
                    }

                    if (res == ERR_NOT_IN_RANGE) {
                        creep.moveTo(container, {reusePath: moveReusePath()});
                    }
                }
                else {
                    return -1;
                }
            }
        }
        else {
            // Creep is harvesting, try to keep harvesting
            if (creep.harvest(Game.getObjectById(creep.memory.statusHarvesting)) != OK) {
                creep.memory.statusHarvesting = false;
            }
        }
        return OK;
    }
};