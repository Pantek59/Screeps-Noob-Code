require ("globals");
var roleEnergyTransporter = require('role.energyTransporter');

module.exports = {
    run: function(creep) {
        var delta;

        if (_.sum(creep.carry) > 0) {
            creep.memory.creepFull = true;
        }
        else if (_.sum(creep.carry) == 0) {
            creep.memory.creepFull = false;
        }

        if (creep.memory.creepFull == true) {
            // Creep full
            if (creep.room.memory.terminalTransfer == undefined) {
                // No terminal transfer running
                var terminalResources = [];
                for (var res in creep.carry) {
                    delta = creep.checkTerminalLimits(res);
                    if (delta.amount < 0) {
                        //Terminal needs material
                        var load = Math.abs(delta.amount);
                        if (load > creep.carry[res]) {
                            load = creep.carry[res];
                        }
                        if (creep.transfer(creep.room.terminal, res, load) == ERR_NOT_IN_RANGE) {
                            creep.moveTo(creep.room.terminal);
                        }
                        terminalResources.push(res);
                        break;
                    }
                }
                //TODO Role change and returning material to storage is mixed up somehow (???)
                if (terminalResources.length == 0) {
                    // Material for storage left in creep
                    var changeRole = true;
                    for (var res in creep.room.storage.store) {
                        delta = creep.checkTerminalLimits(res);
                        if (delta != 0) {
                            changeRole = false;
                            break;
                        }
                    }
                    if (changeRole == true) {
                        roleEnergyTransporter.run(creep);
                    }
                }
            }
            else {
                // Creep full with active terminal transfer
                var transferResource;
                var info = creep.room.memory.terminalTransfer; // Format: ROOM:AMOUNT:RESOURCE:COMMENT W21S38:100:Z:TestTransfer
                info = info.split(":");
                transferResource = info[2];
                if (creep.pos.getRangeTo(creep.room.terminal) > 1) {
                    creep.moveTo(creep.room.terminal);
                }
                else {
                    // Dump everything into terminal
                    for (var res in creep.carry) {
                        creep.transfer(creep.room.terminal, res);
                    }
                }
            }
        }
        else {
            //Creep empty
            if (creep.room.memory.terminalTransfer == undefined) {
                // No terminal transfer running
                var terminalDelta = 0;
                for (var res in RESOURCES_ALL) {
                    delta = creep.checkTerminalLimits(RESOURCES_ALL[res]);
                    if (delta.amount < 0) {
                        //Terminal needs material from storage
                        var load = Math.abs(delta.amount);
                        if (load > creep.carryCapacity) {
                            load = creep.carryCapacity;
                        }

                        if (creep.withdraw(creep.room.storage, RESOURCES_ALL[res], load) == ERR_NOT_IN_RANGE) {
                            creep.moveTo(creep.room.storage);
                        }
                        terminalDelta++;
                        break;
                    }
                }

                if (terminalDelta == 0) {
                    //Check for surplus material in terminal
                    var breaker = false;
                    for (var res in creep.room.terminal.store) {
                        var delta = creep.checkTerminalLimits(res);
                        if (delta.amount > 0) {
                            //Terminal has surplus material
                            var load = Math.abs(delta.amount);
                            if (load > creep.carryCapacity) {
                                load = creep.carryCapacity;
                            }
                            if (creep.withdraw(creep.room.terminal, res, load) == ERR_NOT_IN_RANGE) {
                                creep.moveTo(creep.room.terminal);
                            }
                            breaker = true;
                            break;
                        }
                    }

                    if (breaker == false && _.sum(creep.carry) == 0) {
                        //Look for minerals in containers
                        var container = creep.pos.findClosestByPath(FIND_STRUCTURES, {filter: (s) => s.structureType == STRUCTURE_CONTAINER && s.store[RESOURCE_ENERGY] < _.sum(s.store)});
                        var containerResource = undefined;

                        if (container != undefined && container != null && creep.room.storage != undefined) {
                            //minerals waiting in containers
                            //analyzing storage of container
                            var store = container.store;
                            for (var s in store) {
                                if (s != RESOURCE_ENERGY) {
                                    // mineral found in container
                                    containerResource = s;
                                }
                            }
                            if (containerResource != undefined && creep.withdraw(container, containerResource) == ERR_NOT_IN_RANGE) {
                                creep.moveTo(container);
                            }
                        }
                        else {
                            // No material around to gather
                            if (creep.getRidOfMinerals() == false) {
                                delete creep.memory.targetBuffer;
                                delete creep.memory.resourceBuffer;
                                roleEnergyTransporter.run(creep);
                            }
                        }
                    }
                }
            }
            else {
                // Creep empty with ongoing terminal transfer
                var transferAmount;
                var targetRoom;
                var transferResource;
                var energyCost;
                var packageVolume;
                var info = creep.room.memory.terminalTransfer; // Format: ROOM:AMOUNT:RESOURCE:COMMENT W21S38:100:Z:TestTransfer
                info = info.split(":");
                targetRoom = info[0];
                transferAmount = parseInt(info[1]);
                transferResource = info[2];
                if (transferAmount > creep.carryCapacity) {
                    packageVolume = creep.carryCapacity;
                }
                else {
                    packageVolume = transferAmount;
                }
                if (info[3] == "MarketOrder") {
                    var order = Game.market.getOrderById(targetRoom);
                    energyCost = Game.market.calcTransactionCost(packageVolume, creep.room.name, order.roomName);
                }
                else {
                    energyCost = Game.market.calcTransactionCost(packageVolume, creep.room.name, targetRoom);
                }
                
                // Check resource status
                if (creep.room.terminal.store[transferResource] >= packageVolume) {
                    //Check for energy level
                    if ((transferResource != RESOURCE_ENERGY && creep.room.terminal.store[RESOURCE_ENERGY] < energyCost)
                        || transferResource == RESOURCE_ENERGY && creep.room.terminal.store[RESOURCE_ENERGY] - transferAmount < energyCost) {
                        //Get energy
                        if (energyCost > creep.carryCapacity) {
                            energyCost = creep.carryCapacity;
                        }
                        if(creep.withdraw(creep.room.storage, RESOURCE_ENERGY, energyCost) == ERR_NOT_IN_RANGE) {
                            creep.moveTo(creep.room.storage);
                        }
                    }
                }
                else {
                    // Get transfer resource
                    if(creep.withdraw(creep.room.storage, transferResource, packageVolume) == ERR_NOT_IN_RANGE) {
                        creep.moveTo(creep.room.storage);
                    }
                }
            }
        }
    }
};