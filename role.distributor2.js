require ("globals");
var roleEnergyTransporter = require('role.energyTransporter');
//TODO Distributor one tick pauses between role changes
//TODO Switch to Game.memory.resourceLimits

module.exports = {
    // state working = Transporting stuff somewhere
    run: function(creep) {
        if (_.sum(creep.carry) == creep.carryCapacity) {
            // Creep full
            if (creep.room.memory.terminalTransfer == undefined) {
                // No terminal transfer running
                var terminalDrop  = false;

                for (var res in creep.carry) {
                    var delta = creep.checkTerminalLimits(res);
                    if (delta != true && delta.amount < 0) {
                        //Terminal needs attention
                        var load = Math.abs(delta.amount);
                        if (load > creep.carry[res]) {
                            load = creep.carry[res];
                        }
                        if (creep.transfer(creep.room.storage, creep.carry[res], load) == ERR_NOT_IN_RANGE) {
                            creep.moveTo(creep.room.storage);
                        }
                    }
                }


            }
        }


        if (creep.room.storage != undefined && creep.room.terminal != undefined) {
            if (creep.room.memory.terminalTransfer == undefined) {
                // No ongoing terminal


                if (delta == true) {
                    // Terminal filled with the material it should be
                    if (creep.getRidOfMinerals() == false) {
                        roleEnergyTransporter.run(creep);
                    }
                }
                else {
                    // Terminal needs attention
                    if (delta.amount > 0) {
                        //Too much material in terminal

                        if (creep.pos.getRangeTo(creep.room.terminal) > 1) {
                            creep.moveTo(creep.room.terminal);
                        }
                        else {

                        }
                    }

                }
            }
            // Load terminal transfer info
            var terminal = creep.room.terminal;
            var transferAmount = 0;
            var targetRoom;
            var transferResource;
            var energyCost = 0;
            var packageVolume = 0;
            var info = creep.room.memory.terminalTransfer; // Format: ROOM:AMOUNT:RESOURCE:COMMENT W21S38:100:Z:TestTransfer
            if (info != undefined) {
                info = info.split(":");
                targetRoom = info[0];
                transferAmount = parseInt(info[1]);
                transferResource = info[2];
                energyCost = Game.market.calcTransactionCost(transferAmount, terminal.room.name, targetRoom);

                if (transferAmount > 500) {
                    packageVolume = 500;
                }
                else {
                    packageVolume = transferAmount;
                }
            }

            var mineralTerminal = terminal.store[transferResource];
            var mineralCreep = creep.carry[transferResource];

            if (mineralTerminal == undefined) {mineralTerminal = 0;}
            if (mineralCreep == undefined) {mineralCreep = 0;}

            if (creep.memory.subRole == undefined || creep.memory.subRole == null) {
                // Determine next subrole
                if ((info == undefined && _.sum(terminal.store) == 0) && creep.memory.role == "energyTransporter") {
                    // Converter energy transporter with nothing further to do
                    creep.memory.subRole = "play_transporter";
                }
                if (_.sum(creep.carry) == creep.carryCapacity) {
                    // Creep full, has to be emptied
                    creep.memory.subRole = "empty_creep";
                }
                else if (info == undefined && _.sum(terminal.store) > 0 ) {
                    // Terminal full, has to be emptied
                    creep.memory.subRole = "empty_terminal";
                }
                else if (info != undefined && transferResource != RESOURCE_ENERGY && (mineralTerminal + mineralCreep) <= packageVolume) {
                    // Terminals lacks minerals to execute transfer
                    creep.memory.subRole = "get_minerals";
                }
                else if (info != undefined && ((transferResource == RESOURCE_ENERGY && terminal.store[RESOURCE_ENERGY] + creep.carry.energy < (energyCost + transferAmount))
                                            || (transferResource != RESOURCE_ENERGY && terminal.store[RESOURCE_ENERGY] + creep.carry.energy < energyCost))) {
                    // Terminals lacks energy to execute transfer
                    creep.memory.subRole = "get_energy";
                }
                else if (info != undefined && _.sum(creep.carry) > 0) {
                    // Creep should be emptied before transporting material out of the terminal
                    creep.memory.subRole = "empty_creep";
                }
                else if (info == undefined && _.sum(terminal.store) > 0) {
                    // Material left in terminal and no transfer active
                    creep.memory.subRole = "empty_terminal";
                }
                else {
                    creep.memory.subRole = "play_transporter";
                }
            }

            switch (creep.memory.subRole) {
                case "empty_terminal":
                    if (_.sum(creep.carry) < creep.carryCapacity && (transferResource == undefined || (terminal.store[RESOURCE_ENERGY] > energyCost && mineralTerminal > transferAmount))) {
                        // Withdraw from terminal everything that is not needed for a planned transfer
                        for (var res in terminal.store) {
                            if ((res != RESOURCE_ENERGY || energyCost == 0) && (transferResource == undefined || res != transferResource)) {
                                //No energy nor transferResource if a transfer is planned
                                if (creep.withdraw(terminal, res) == ERR_NOT_IN_RANGE) {
                                    creep.moveTo(terminal, {reusePath: 3});
                                }
                            }
                        }
                    }

                    if (_.sum(terminal.store) == 0 || _.sum(creep.carry) == creep.carryCapacity) {
                        // Terminal has no more to give
                        delete creep.memory.subRole;
                        delete creep.memory.path;
                    }
                    break;

                case "empty_creep":
                    if (_.sum(creep.carry) > 0) {
                        //Creep should be emptied
                        if (transferResource == undefined || (transferResource != RESOURCE_ENERGY && terminal.store[RESOURCE_ENERGY] >= energyCost && mineralTerminal >= transferAmount) || (transferResource == RESOURCE_ENERGY && terminal.store[RESOURCE_ENERGY] >= energyCost + transferAmount)) {
                            // Terminal does not need anything
                            var targetContainer = creep.room.storage;

                            if (creep.carry.energy > 0) {
                                // Minerals to get rid of
                                var result = creep.transfer(targetContainer, RESOURCE_ENERGY);
                                if (result == ERR_NOT_IN_RANGE) {
                                    creep.moveTo(targetContainer, {reusePath: 3});
                                    break;
                                }
                                else if (result == OK) {
                                    break;
                                }
                            }
                            else if (_.sum(creep.carry) > 0) {
                                // Minerals to get rid of
                                for (var res in creep.carry) {
                                    //No energy nor transferResource if a transfer is planned
                                    var result = creep.transfer(targetContainer, res);
                                    if (result == ERR_NOT_IN_RANGE) {
                                        creep.moveTo(targetContainer, {reusePath: 3});
                                        break;
                                    }
                                    else if (result == OK) {
                                        break;
                                    }
                                }
                            }
                        }
                        else if (_.sum(terminal.store) < terminal.storeCapacity) {
                            // There is stuff to put in the terminal
                            var deltaEnergy = terminal.store[RESOURCE_ENERGY] - energyCost;
                            var deltaMineral = mineralTerminal - transferAmount;
                            if (deltaMineral == undefined) {
                                deltaMineral = 0;
                            }
                            if (transferResource == RESOURCE_ENERGY) {
                                deltaEnergy -= transferAmount;
                            }
                            if (transferResource != RESOURCE_ENERGY && deltaMineral < 0 && mineralCreep > 0) {
                                // Minerals for the terminal
                                var result;
                                if (deltaMineral + mineralCreep > 0) {
                                    //more minerals than needed
                                    result = creep.transfer(terminal, transferResource, Math.abs(deltaMineral));
                                }
                                else {
                                    //transfer all you have
                                    result = creep.transfer(terminal, transferResource);
                                }
                                if (result != OK) {
                                    creep.moveTo(terminal, {reusePath: 3})
                                }
                            }
                            else if (deltaEnergy < 0 && creep.carry.energy > 0) {
                                // Energy for the terminal
                                var result;
                                if (deltaEnergy + creep.carry.energy > 0) {
                                    //more energy than needed
                                    result = creep.transfer(terminal, RESOURCE_ENERGY, Math.abs(deltaEnergy));
                                }
                                else {
                                    //transfer all you have
                                    result = creep.transfer(terminal, RESOURCE_ENERGY);
                                }
                                if (result == ERR_NOT_IN_RANGE) {
                                    creep.moveTo(terminal, {reusePath: 3})
                                }
                            }
                            else {
                                // Just empty creep
                                var targetContainer = creep.room.storage;
                                if (creep.pos.getRangeTo(targetContainer) > 1) {
                                    creep.moveTo(targetContainer, {reusePath: 3});
                                }
                                else {
                                    for (var res in creep.carry) {
                                        //No energy nor transferResource if a transfer is planned
                                        if (creep.transfer(targetContainer, res) != OK) {
                                            creep.moveTo(targetContainer, {reusePath: 3});
                                        };
                                    }
                                }
                            }
                        }
                        else {
                            var targetContainer2 = creep.room.storage;

                            if (creep.pos.getRangeTo(targetContainer2) > 1) {
                                creep.moveTo(targetContainer2, {reusePath: 3});
                            }
                            else {
                                for (var res in creep.carry) {
                                    //No energy nor transferResource if a transfer is planned
                                    creep.transfer(targetContainer2, res);
                                }
                            }
                        }
                    }

                    if (_.sum(creep.carry) == 0) {
                        //Creep is empty
                        delete creep.memory.subRole;
                        delete creep.memory.path;
                        delete creep.memory.resourceBuffer;
                        delete creep.memory.targetBuffer;
                    }
                    break;

                case "get_minerals":
                    if (_.sum(creep.carry) < creep.carryCapacity && mineralTerminal + mineralCreep < transferAmount){
                        //Terminal lacking stuff and creep does not have enough
                        //var mineralContainer = creep.pos.findClosestByPath(FIND_MY_STRUCTURES, {filter: (s) => (s.structureType == STRUCTURE_STORAGE || s.structureType == STRUCTURE_CONTAINER) && s.store[transferResource] > 0})
                        var mineralContainer = creep.room.storage;
                        if (mineralContainer != null) {
                            // Mineral containers found
                            if (creep.withdraw(mineralContainer, transferResource) != OK) {
                                creep.moveTo(mineralContainer);
                            }
                        }
                        else {
                            console.log("Not enough minerals to process transfer!");
                        }
                    }

                    if (_.sum(creep.carry) == creep.carryCapacity || mineralTerminal + mineralCreep >= transferAmount) {
                        // No more minera3ls needed
                        delete creep.memory.subRole;
                        delete creep.memory.path;
                        delete creep.memory.targetBuffer;
                        delete creep.memory.resourceBuffer;
                    }
                    break;

                case "get_energy":
                    if (_.sum(creep.carry) < creep.carryCapacity && ((transferResource == RESOURCE_ENERGY && terminal.store[RESOURCE_ENERGY] + creep.carry.energy < energyCost + transferAmount) || (transferResource != RESOURCE_ENERGY && terminal.store[RESOURCE_ENERGY] + creep.carry.energy < energyCost))) {
                        //Terminal lackin3g stuff and creep does not have enough
                        var energyContainer;

                        if (creep.room.storage != undefined && creep.room.storage.store[RESOURCE_ENERGY] > 0) {
                            energyContainer = creep.room.storage;
                        }
                        else {
                            energyContainer = creep.findResource(RESOURCE_ENERGY, STRUCTURE_CONTAINER, STRUCTURE_STORAGE, STRUCTURE_LINK);
                        }

                        if (energyContainer != null) {
                            // Mineral containers found
                            if (creep.withdraw(energyContainer, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                                creep.moveTo(energyContainer);
                            }
                        }
                        else {
                            //console.log("Not enough energy to process transfer!");
                        }
                    }

                    if (_.sum(creep.carry) == creep.carryCapacity || (transferResource == RESOURCE_ENERGY && terminal.store[RESOURCE_ENERGY] + creep.carry.energy >= (energyCost + transferAmount)) || (transferResource != RESOURCE_ENERGY && terminal.store[RESOURCE_ENERGY] + creep.carry.energy >= energyCost)) {
                        // No more energy needed
                        delete creep.memory.subRole;
                        delete creep.memory.path;
                        delete creep.memory.resourceBuffer;
                        delete creep.memory.targetBuffer;
                    }
                    break;

                case "play_transporter":
                    var container = creep.pos.findClosestByPath(FIND_STRUCTURES, {filter: (s) => s.structureType == STRUCTURE_CONTAINER && s.store[RESOURCE_ENERGY] < _.sum(s.store)});
                    var containerResource;
                    var storage = creep.room.storage;

                    if (info != undefined || _.sum(terminal.store) > 0) {
                        delete creep.memory.subRole;
                    }
                    else if (container != undefined && storage != undefined) {
                        //minerals waiting in containers
                        //analyzing storage of container
                        for (var s in container.store) {
                            if (s != RESOURCE_ENERGY) {
                                // mineral found in container
                                containerResource = s;
                            }
                        }
                        if (creep.withdraw (container, containerResource) != OK) {
                            creep.moveTo(container);
                        }
                    }
                    else {
                        roleEnergyTransporter.run(creep);
                    }
                    break;
            }
        }
        else {
            roleEnergyTransporter.run(creep);
        }
    }
};