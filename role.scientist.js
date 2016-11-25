//require ("globals");
module.exports = {
    // prepares ingredients and performs the reaction
    run: function(creep) {
        var roleEnergyTransporter = require("role.energyTransporter");
        if (Game.cpu.bucket > CPU_THRESHOLD) {
            if (creep.ticksToLive < 50 && _.sum(creep.carry) == 0) {
                //Scientist will die soon and possibly drop precious material
                let spawn = Game.getObjectById(creep.memory.spawn);
                if (spawn.recycleCreep(creep) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(spawn, {reusePath: moveReusePath()});
                }
            }
            else {
                if (creep.room.memory.labOrder != undefined && creep.room.memory.innerLabs != undefined) {
                    // Ongoing labOrder with defined innerLabs
                    var labOrder = creep.room.memory.labOrder.split(":");
                    var amount = labOrder[0];
                    var innerLabs = creep.room.memory.innerLabs;
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
                                        if (creep.storeAllBut(innerLabs[lb].resource) == true) {
                                            if (_.sum(creep.carry) == 0) {
                                                //Get minerals from storage
                                                var creepPackage = amount - currentInnerLab.mineralAmount;
                                                if (creepPackage > creep.carryCapacity) {
                                                    creepPackage = creep.carryCapacity;
                                                }

                                                if (creep.withdraw(creep.room.storage, innerLabs[lb].resource, creepPackage) == ERR_NOT_IN_RANGE) {
                                                    creep.moveTo(creep.room.storage, {reusePath: moveReusePath()});
                                                }
                                            }
                                            else {
                                                if (creep.transfer(currentInnerLab, innerLabs[lb].resource) == ERR_NOT_IN_RANGE) {
                                                    creep.moveTo(currentInnerLab, {reusePath: moveReusePath()});
                                                }
                                            }
                                        }
                                    }
                                    else {
                                        //Lab has to be emptied -> get rid of stuff in creep
                                        if (creep.storeAllBut() == true) {
                                            //Get minerals from storage
                                            if (creep.withdraw(currentInnerLab, currentInnerLab.mineralType) == ERR_NOT_IN_RANGE) {
                                                creep.moveTo(currentInnerLab, {reusePath: moveReusePath()});
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
                                creep.say(
                                    "Waiting ...");
                            }
                            break;

                        case "done":
                            //Empty all labs to storage
                            var emptylabs = 0;
                            var lab;
                            for (var c in creep.room.memory.roomArrayLabs) {
                                lab = Game.getObjectById(creep.room.memory.roomArrayLabs[c]);
                                if ((creep.room.memory.boostLabs == undefined || creep.room.memory.boostLabs.indexOf(lab.id) == -1) && lab.mineralAmount > 0 && lab.id != innerLabs[0].labID && lab.id != innerLabs[1].labID) {
                                    {
                                        if (_.sum(creep.carry) < creep.carryCapacity) {
                                            if (creep.withdraw(lab, lab.mineralType) == ERR_NOT_IN_RANGE) {
                                                creep.moveTo(lab, {reusePath: moveReusePath()});
                                            }
                                        }
                                        else {
                                            creep.storeAllBut();
                                        }
                                    }
                                }
                                else if ((creep.room.memory.boostLabs == undefined || creep.room.memory.boostLabs.indexOf(lab.id) == -1) && lab.energy > 0)
                                {
                                    if (_.sum(creep.carry) < creep.carryCapacity) {
                                        if (creep.withdraw(lab, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                                            creep.moveTo(lab, {reusePath: moveReusePath()});
                                        }
                                    }
                                    else {
                                        creep.storeAllBut();
                                    }
                                }
                                else {
                                    emptylabs++;
                                }
                            }
                            if (emptylabs == creep.room.memory.roomArrayLabs.length && lab != undefined) {
                                if (amount <= lab.mineralCapacity) {
                                    if (creep.storeAllBut() == true) {
                                        delete creep.room.memory.labOrder;
                                    }
                                }
                                else {
                                    // Restart process to do more of the same
                                    amount -= lab.mineralCapacity;
                                    labOrder[0] = amount;
                                    labOrder[3] = "prepare";
                                    creep.room.memory.labOrder = labOrder.join(":");
                                }
                            }
                            break;

                        case "running":
                        default:
                            let mineralsContainers = creep.room.find(FIND_STRUCTURES, {filter: (s) => s.structureType == STRUCTURE_CONTAINER && (_.sum(s.store) > s.store[RESOURCE_ENERGY] || (_.sum(s.store) > 0 && s.store[RESOURCE_ENERGY == 0]))});
                            if (mineralsContainers.length == 0) {
                                delete creep.memory.targetBuffer;
                                delete creep.memory.resourceBuffer;
                                roleEnergyTransporter.run(creep);
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
                            break;
                    }
                }
                else {
                    //Empty all labs to storage
                    var emptylabs = 0;
                    var lab;
                    for (var c in creep.room.memory.roomArrayLabs) {
                        lab = Game.getObjectById(creep.room.memory.roomArrayLabs[c]);
                        if (lab.mineralAmount > 0) {
                            if (creep.storeAllBut() == true) {
                                if (creep.withdraw(lab, lab.mineralType) == ERR_NOT_IN_RANGE) {
                                    creep.moveTo(lab, {reusePath: moveReusePath()});
                                }
                            }
                        }
                        else {
                            emptylabs++;
                        }
                    }

                    if (emptylabs == creep.room.memory.roomArrayLabs.length) {
                        delete creep.memory.targetBuffer;
                        delete creep.memory.resourceBuffer;
                        roleEnergyTransporter.run(creep);
                    }
                }
            }
        }
    }
};