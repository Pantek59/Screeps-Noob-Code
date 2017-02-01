Creep.prototype.roleScientist = function() {
    if (this.ticksToLive < 50 && _.sum(this.carry) == 0) {
        //Scientist will die soon and possibly drop precious material
        let spawn = Game.getObjectById(this.memory.spawn);
        if (spawn.recycleCreep(this) == ERR_NOT_IN_RANGE) {
            this.moveTo(spawn, {reusePath: moveReusePath()});
        }
    }
    else {
        if (this.room.memory.labOrder != undefined && this.room.memory.innerLabs != undefined) {
            // Ongoing labOrder with defined innerLabs
            var labOrder = this.room.memory.labOrder.split(":");
            var amount = labOrder[0];
            var innerLabs = this.room.memory.innerLabs;
            var status = labOrder[3];
            if (innerLabs.length != 2) {
                return "Not enough inner labs found!";
            }
            switch (status) {
                case "prepare":
                    var labs = [];
                    var labsReady = 0;
                    labs.push(Game.getObjectById(innerLabs[0].labID));
                    labs.push(Game.getObjectById(innerLabs[1].labID));
                    for (var lb in labs) {
                        //Checking inner labs
                        var currentInnerLab = labs[lb];
                        if (currentInnerLab.mineralType != innerLabs[lb].resource || (currentInnerLab.mineralType == innerLabs[lb].resource && (currentInnerLab.mineralAmount < currentInnerLab.mineralCapacity && currentInnerLab.mineralAmount < amount))) {
                            //Lab has to be prepared
                            if (currentInnerLab.mineralType == undefined || currentInnerLab.mineralType == innerLabs[lb].resource) {
                                //Lab needs minerals
                                if (this.storeAllBut(innerLabs[lb].resource) == true) {
                                    if (_.sum(this.carry) == 0) {
                                        //Get minerals from storage
                                        var creepPackage = amount - currentInnerLab.mineralAmount;
                                        if (creepPackage > this.carryCapacity) {
                                            creepPackage = this.carryCapacity;
                                        }
                                        if (this.room.storage.store[innerLabs[lb].resource] < creepPackage) {
                                            //not enough resources in storage
                                            delete this.room.memory.labOrder;
                                        }
                                        else if (this.withdraw(this.room.storage, innerLabs[lb].resource, creepPackage) == ERR_NOT_IN_RANGE) {
                                            this.moveTo(this.room.storage, {reusePath: moveReusePath()});
                                        }
                                    }
                                    else {
                                        if (this.transfer(currentInnerLab, innerLabs[lb].resource) == ERR_NOT_IN_RANGE) {
                                            this.moveTo(currentInnerLab, {reusePath: moveReusePath()});
                                        }
                                    }
                                }
                            }
                            else {
                                //Lab has to be emptied -> get rid of stuff in creep
                                if (this.storeAllBut() == true) {
                                    //Get minerals from storage
                                    if (this.withdraw(currentInnerLab, currentInnerLab.mineralType) == ERR_NOT_IN_RANGE) {
                                        this.moveTo(currentInnerLab, {reusePath: moveReusePath()});
                                    }
                                }
                            }
                            break;
                        }
                        if (currentInnerLab.mineralType == innerLabs[lb].resource && (currentInnerLab.mineralAmount == currentInnerLab.mineralCapacity || currentInnerLab.mineralAmount >= amount)) {
                            labsReady++;
                        }
                    }
                    if (labsReady == 2) {
                        this.say("Waiting ...");
                        this.memory.sleep = 5;
                    }
                    break;
                case "done":
                    //Empty all labs to storage
                    var emptylabs = 0;
                    var lab;
                    for (var c in this.room.memory.roomArray.labs) {
                        lab = Game.getObjectById(this.room.memory.roomArray.labs[c]);
                        if ((this.room.memory.boostLabs == undefined || this.room.memory.boostLabs.indexOf(lab.id) == -1) && lab.mineralAmount > 0 && lab.id != innerLabs[0].labID && lab.id != innerLabs[1].labID) {
                            if (_.sum(this.carry) < this.carryCapacity) {
                                if (this.withdraw(lab, lab.mineralType) == ERR_NOT_IN_RANGE) {
                                    this.moveTo(lab, {reusePath: moveReusePath()});
                                }
                            }
                            else {
                                this.storeAllBut();
                            }
                        }
                        else if ((this.room.memory.boostLabs == undefined || this.room.memory.boostLabs.indexOf(lab.id) == -1) && lab.energy > 0) {
                            if (_.sum(this.carry) < this.carryCapacity) {
                                if (this.withdraw(lab, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                                    this.moveTo(lab, {reusePath: moveReusePath()});
                                }
                            }
                            else {
                                this.storeAllBut();
                            }
                        }
                        else {
                            emptylabs++;
                        }
                    }
                    if (emptylabs == this.room.memory.roomArray.labs.length && lab != undefined) {
                        if (amount <= lab.mineralCapacity) {
                            if (this.storeAllBut() == true) {
                                delete this.room.memory.labOrder;
                            }
                        }
                        else {
                            // Restart process to do more of the same
                            amount -= lab.mineralCapacity;
                            labOrder[0] = amount;
                            labOrder[3] = "prepare";
                            this.room.memory.labOrder = labOrder.join(":");
                        }
                    }
                    break;
                case "running":
                default:
                    let mineralsContainers = this.room.find(FIND_STRUCTURES, {filter: (s) => s.structureType == STRUCTURE_CONTAINER && (_.sum(s.store) > s.store[RESOURCE_ENERGY] || (_.sum(s.store) > 0 && s.store[RESOURCE_ENERGY == 0]))});
                    if (mineralsContainers.length == 0) {
                        delete this.memory.targetBuffer;
                        delete this.memory.resourceBuffer;
                        this.roleEnergyTransporter()
                    }
                    else {
                        //get minerals from container
                        if (this.memory.tidyFull == undefined && _.sum(this.carry) < this.carryCapacity) {
                            //creep not full
                            for (let e in mineralsContainers[0].store) {
                                if (e != "energy" && this.withdraw(mineralsContainers[0], e) == ERR_NOT_IN_RANGE) {
                                    this.moveTo(mineralsContainers[0], {reusePath: moveReusePath()});
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
                    break;
            }
        }
        else {
            //Empty all labs to storage
            var emptylabs = 0;
            var lab;
            for (var c in this.room.memory.roomArray.labs) {
                lab = Game.getObjectById(this.room.memory.roomArray.labs[c]);
                if (lab.mineralAmount > 0) {
                    if (this.storeAllBut() == true) {
                        if (this.withdraw(lab, lab.mineralType) == ERR_NOT_IN_RANGE) {
                            this.moveTo(lab, {reusePath: moveReusePath()});
                        }
                    }
                }
                else {
                    emptylabs++;
                }
            }
            if (emptylabs == this.room.memory.roomArray.labs.length) {
                delete this.memory.targetBuffer;
                delete this.memory.resourceBuffer;
                this.roleEnergyTransporter();
            }
        }
    }
};