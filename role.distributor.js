Creep.prototype.roleDistributor = function() {
    var nuker = Game.getObjectById(this.room.memory.roomArray.nukers[0]);

    if (this.room.memory.terminalTransfer != undefined) {
        //ongoing terminal transfer
        if (_.sum(this.carry) > 0) {
            //Creep full
            if (this.pos.getRangeTo(this.room.terminal) > 1) {
                this.moveTo(this.room.terminal, {reusePath: moveReusePath()});
            }
            else {
                // Dump everything into terminal
                for (var res in this.carry) {
                    this.transfer(this.room.terminal, res);
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
            var info = this.room.memory.terminalTransfer; // Format: ROOM:AMOUNT:RESOURCE:COMMENT W21S38:100:Z:TestTransfer
            info = info.split(":");
            targetRoom = info[0];
            transferAmount = parseInt(info[1]);
            transferResource = info[2];
            if (transferAmount > this.carryCapacity) {
                packageVolume = this.carryCapacity;
            }
            else {
                packageVolume = transferAmount;
            }
            if (info[3] == "MarketOrder") {
                var order = Game.market.getOrderById(targetRoom);
                if (order != null) {
                    energyCost = Game.market.calcTransactionCost(packageVolume, this.room.name, order.roomName);
                }
                else {
                    //Order invalid
                    delete this.room.memory.terminalTransfer;
                }
            }
            else {
                energyCost = Game.market.calcTransactionCost(packageVolume, this.room.name, targetRoom);
            }

            // Check resource status
            if (this.room.terminal.store[transferResource] >= packageVolume) {
                //Check for energy level
                if ((transferResource != RESOURCE_ENERGY && this.room.terminal.store[RESOURCE_ENERGY] < energyCost + packageVolume)
                    || transferResource == RESOURCE_ENERGY && this.room.terminal.store[RESOURCE_ENERGY] - transferAmount < energyCost) {
                    //Get energy
                    if (energyCost > this.carryCapacity) {
                        energyCost = this.carryCapacity;
                    }
                    if(this.withdraw(this.room.storage, RESOURCE_ENERGY, energyCost) == ERR_NOT_IN_RANGE) {
                        this.moveTo(this.room.storage, {reusePath: moveReusePath()});
                    }
                }
                else if (this.room.terminal.store[transferResource] < packageVolume) {
                    // Get transfer resource
                    if(this.withdraw(this.room.storage, transferResource, packageVolume) == ERR_NOT_IN_RANGE) {
                        this.moveTo(this.room.storage, {reusePath: moveReusePath()});
                    }
                }
            }
            else {
                // Get transfer resource
                if(this.withdraw(this.room.storage, transferResource, packageVolume) == ERR_NOT_IN_RANGE) {
                    this.moveTo(this.room.storage, {reusePath: moveReusePath()});
                }
            }
        }
    }
    else if (this.checkTerminalLimits(RESOURCE_GHODIUM).amount == 0 && this.room.memory.terminalTransfer == undefined && nuker != undefined
        && nuker.ghodium < nuker.ghodiumCapacity && (this.room.storage.store[RESOURCE_GHODIUM] != undefined || this.carry[RESOURCE_GHODIUM] != undefined)) {
        //No terminal transfer pending, nuker in need of Ghodium and storage has enough of it
        if (this.storeAllBut(RESOURCE_GHODIUM) == true) {
            if (_.sum(this.carry) < this.carryCapacity && this.room.storage.store[RESOURCE_GHODIUM] > 0) {
                if (this.withdraw(this.room.storage, RESOURCE_GHODIUM) == ERR_NOT_IN_RANGE) {
                    this.moveTo(this.room.storage, {reusePath: moveReusePath()});
                }
            }
            else {
                if (this.transfer(nuker, RESOURCE_GHODIUM) == ERR_NOT_IN_RANGE) {
                    this.moveTo(nuker, {reusePath: moveReusePath()});
                }
            }
        }
    }
    else {
        //Nothing special going on check for terminal levels
        var terminalDelta;
        if (this.room.memory.terminalDelta == undefined || Game.time % 10 == 0 || this.room.memory.terminalDelta != 0) {
            terminalDelta = 0;
            for (var res in this.room.terminal.store) {
                delta = this.checkTerminalLimits(res);
                terminalDelta += Math.abs(delta.amount);
            }

            for (var res in this.room.storage.store) {
                delta = this.checkTerminalLimits(res);
                terminalDelta += Math.abs(delta.amount);
            }
        }
        else {
            terminalDelta = this.room.memory.terminalDelta;
        }


        if (terminalDelta == 0) {
            //Everything perfect!
            if (this.storeAllBut(RESOURCE_ENERGY) == true) {
                this.roleEnergyTransporter();
            }
        }
        else {
            if (_.sum(this.carry) > 0) {
                //Creep full
                var terminalResources = [];
                for (var res in this.carry) {
                    delta = this.checkTerminalLimits(res);
                    if (delta.amount < 0 && this.carry[res] > 0) {
                        //Terminal needs material
                        var load = Math.abs(delta.amount);
                        if (load > this.carry[res]) {
                            load = this.carry[res];
                        }
                        if (this.transfer(this.room.terminal, res, load) == ERR_NOT_IN_RANGE) {
                            this.moveTo(this.room.terminal);
                        }
                        terminalResources.push(res);
                        break;
                    }
                }
                if (terminalResources.length == 0) {
                    // Material for storage left in creep
                    this.storeAllBut();
                }
            }
            else {
                // Creep empty
                //Check storage for useful resources
                terminalDelta = 0;
                for (var res in this.room.terminal.store) {
                    var delta = this.checkTerminalLimits(res);
                    if (delta.amount > 0) {
                        //Terminal has surplus material
                        var load = Math.abs(delta.amount);
                        if (load > this.carryCapacity) {
                            load = this.carryCapacity;
                        }
                        if (this.withdraw(this.room.terminal, res, load) == ERR_NOT_IN_RANGE) {
                            this.moveTo(this.room.terminal);
                        }
                        terminalDelta++;
                        break;
                    }
                }

                if (terminalDelta == 0) {
                    //Check for surplus material in terminal
                    var breaker = false;
                    for (var res in this.room.storage.store) {
                        delta = this.checkTerminalLimits(res);
                        if (delta.amount < 0) {
                            //Terminal needs material from storage
                            var load = Math.abs(delta.amount);
                            if (load > this.carryCapacity) {
                                load = this.carryCapacity;
                            }

                            if (this.withdraw(this.room.storage, res, load) == ERR_NOT_IN_RANGE) {
                                this.moveTo(this.room.storage, {reusePath: moveReusePath()});
                            }
                            breaker = true;
                            break;
                        }
                    }


                    if (breaker == false && _.sum(this.carry) == 0) {
                        //Look for minerals in containers
                        let container;
                        if (this.memory.myMineralContainer == undefined) {
                            container = this.pos.findClosestByPath(FIND_STRUCTURES, {filter: (s) => s.structureType == STRUCTURE_CONTAINER && s.store[RESOURCE_ENERGY] < _.sum(s.store)});
                            if (container != null) {
                                this.memory.myMineralContainer = container.id;
                            }
                        }
                        else {
                            container = Game.getObjectById(this.memory.myMineralContainer);
                            if (_.sum(container.store) == container.store[RESOURCE_ENERGY]) {
                                delete this.memory.myMineralContainer;
                                container = null;
                            }
                        }

                        var containerResource = undefined;

                        if (container != undefined && container != null && this.room.storage != undefined) {
                            //minerals waiting in containers
                            //analyzing storage of container
                            var store = container.store;
                            for (var s in store) {
                                if (s != RESOURCE_ENERGY) {
                                    // mineral found in container
                                    containerResource = s;
                                }
                            }
                            if (containerResource != undefined && this.withdraw(container, containerResource) == ERR_NOT_IN_RANGE) {
                                this.moveTo(container, {reusePath: moveReusePath()});
                            }
                        }
                    }
                }
            }
        }
    }
};