//require ("globals");
module.exports = {
    run: function(creep) {
        var roleEnergyTransporter = require('role.energyTransporter');
        var nuker = Game.getObjectById(creep.room.memory.roomArrayNukers[0]);

        if (creep.room.memory.terminalTransfer != undefined) {
            //ongoing terminal transfer
            if (_.sum(creep.carry) > 0) {
                //Creep full
                if (creep.pos.getRangeTo(creep.room.terminal) > 1) {
                    creep.moveTo(creep.room.terminal, {reusePath: moveReusePath()});
                }
                else {
                    // Dump everything into terminal
                    for (var res in creep.carry) {
                        creep.transfer(creep.room.terminal, res);
                    }
                }
            }
            else {
                //Creep empty
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
                    if ((transferResource != RESOURCE_ENERGY && creep.room.terminal.store[RESOURCE_ENERGY] < energyCost + packageVolume)
                        || transferResource == RESOURCE_ENERGY && creep.room.terminal.store[RESOURCE_ENERGY] - transferAmount < energyCost) {
                        //Get energy
                        if (energyCost > creep.carryCapacity) {
                            energyCost = creep.carryCapacity;
                        }
                        if(creep.withdraw(creep.room.storage, RESOURCE_ENERGY, energyCost) == ERR_NOT_IN_RANGE) {
                            creep.moveTo(creep.room.storage, {reusePath: moveReusePath()});
                        }
                    }
                    else if (creep.room.terminal.store[transferResource] < packageVolume) {
                        // Get transfer resource
                        if(creep.withdraw(creep.room.storage, transferResource, packageVolume) == ERR_NOT_IN_RANGE) {
                            creep.moveTo(creep.room.storage, {reusePath: moveReusePath()});
                        }
                    }
                }
                else {
                    // Get transfer resource
                    if(creep.withdraw(creep.room.storage, transferResource, packageVolume) == ERR_NOT_IN_RANGE) {
                        creep.moveTo(creep.room.storage, {reusePath: moveReusePath()});
                    }
                }
            }
        }
        else if (creep.checkTerminalLimits(RESOURCE_GHODIUM).amount == 0 && creep.room.memory.terminalTransfer == undefined && nuker != undefined
            && nuker.ghodium < nuker.ghodiumCapacity && (creep.room.storage.store[RESOURCE_GHODIUM] != undefined || creep.carry[RESOURCE_GHODIUM] != undefined)) {
            //Nuker in need of Ghodium and storage has enough of it
            if (creep.storeAllBut(RESOURCE_GHODIUM) == true) {
                if (_.sum(creep.carry) < creep.carryCapacity && creep.room.storage.store[RESOURCE_GHODIUM] > 0) {
                    if (creep.withdraw(creep.room.storage, RESOURCE_GHODIUM) == ERR_NOT_IN_RANGE) {
                        creep.moveTo(creep.room.storage, {reusePath: moveReusePath()});
                    }
                }
                else {
                    if (creep.transfer(nuker, RESOURCE_GHODIUM) == ERR_NOT_IN_RANGE) {
                        creep.moveTo(nuker, {reusePath: moveReusePath()});
                    }
                }
            }
        }
        else {
            //Nothing special going on check for terminal levels
            var terminalDelta;
             if (creep.room.memory.terminalDelta == undefined || Game.time % 10 == 0 || creep.room.memory.terminalDelta != 0) {
                 terminalDelta = 0;
                 for (var res in creep.room.terminal.store) {
                     delta = creep.checkTerminalLimits(res);
                     terminalDelta += Math.abs(delta.amount);
                 }

                 for (var res in creep.room.storage.store) {
                     delta = creep.checkTerminalLimits(res);
                     terminalDelta += Math.abs(delta.amount);
                 }
             }
             else {
                 terminalDelta = creep.room.memory.terminalDelta;
             }


            if (terminalDelta == 0) {
                //Everything perfect!
                if (creep.storeAllBut(RESOURCE_ENERGY) == true) {
                    roleEnergyTransporter.run(creep);
                }
            }
            else {
                if (_.sum(creep.carry) > 0) {
                    //Creep full
                    var terminalResources = [];
                    for (var res in creep.carry) {
                        delta = creep.checkTerminalLimits(res);
                        if (delta.amount < 0 && creep.carry[res] > 0) {
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
                    if (terminalResources.length == 0) {
                        // Material for storage left in creep
                        creep.storeAllBut();
                    }
                }
                else {
                    // Creep empty
                    //Check storage for useful resources
                    terminalDelta = 0;
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
                            terminalDelta++;
                            break;
                        }
                    }

                    if (terminalDelta == 0) {
                        //Check for surplus material in terminal
                        var breaker = false;
                        for (var res in creep.room.storage.store) {
                            delta = creep.checkTerminalLimits(res);
                            if (delta.amount < 0) {
                                //Terminal needs material from storage
                                var load = Math.abs(delta.amount);
                                if (load > creep.carryCapacity) {
                                    load = creep.carryCapacity;
                                }

                                if (creep.withdraw(creep.room.storage, res, load) == ERR_NOT_IN_RANGE) {
                                    creep.moveTo(creep.room.storage, {reusePath: moveReusePath()});
                                }
                                breaker = true;
                                break;
                            }
                        }


                        if (breaker == false && _.sum(creep.carry) == 0) {
                            //Look for minerals in containers
                            let container;
                            if (creep.memory.myMineralContainer == undefined) {
                                container = creep.pos.findClosestByPath(FIND_STRUCTURES, {filter: (s) => s.structureType == STRUCTURE_CONTAINER && s.store[RESOURCE_ENERGY] < _.sum(s.store)});
                                if (container != null) {
                                    creep.memory.myMineralContainer = container.id;
                                }
                            }
                            else {
                                container = Game.getObjectById(creep.memory.myMineralContainer);
                                if (_.sum(container.store) == container.store[RESOURCE_ENERGY]) {
                                    delete creep.memory.myMineralContainer;
                                    container = null;
                                }
                            }

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
                                    creep.moveTo(container, {reusePath: moveReusePath()});
                                }
                            }
                        }
                    }
                }
            }
        }
    }
};