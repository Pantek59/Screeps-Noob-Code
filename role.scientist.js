require ("globals");

module.exports = {
    // prepares ingredients and performs the reaction

    run: function(creep) { // Lab order format (room.memory.labOrder): [VOLUME]:[INGREDIENT1]:[INGREDIENT2]:[RESULT] e.g. 100:Z:O:ZO
        var creepPickingUp;
        var order = creep.room.memory.labOrder.split(":");
        var orderAmount = order[0];

        if (creep.room.memory.labOrderArray == undefined) {
            // Find and load labs in creep memory
            var labsArray = new Array();

            for (var l in creep.room.memory.roomArrayLabs) {
                var lab = Game.getObjectById(creep.room.memory.roomArrayLabs[l]);
                var neighboringLabs = lab.pos.findInRange(FIND_MY_STRUCTURES, 1, {filter: (s) => (s.structureType == STRUCTURE_LAB)});
                if (neighboringLabs.length > 1) {
                    var outputLab = new Array();
                    var inputLab1 = new Array();
                    var inputLab2 = new Array();

                    outputLab["id"] = lab.id;
                    outputLab["mineralType"] = order[3];

                    inputLab1["id"] = neighboringLabs[0].id;
                    inputLab1["mineralType"] = order[1];

                    inputLab2["id"] = neighboringLabs[1].id;
                    inputLab2["mineralType"] = order[2];

                    labsArray["outputLab"] = outputLab;
                    labsArray["inputLab1"] = inputLab1;
                    labsArray["inputLab2"] = inputLab2;

                    creep.room.memory.labOrderArray = labsArray;
                    break;
                }
            }
        }

        if (creep.room.memory.labOrder != undefined && creep.room.memory.labOrderArray != undefined){
            // Lab order exists and lab array has been loaded successfully
            var inputLab1 = Game.getObjectById(creep.room.memory.labOrderArray.inputLab1.id);
            var inputLab2 = Game.getObjectById(creep.room.memory.labOrderArray.inputLab2.id);
            var outputLab = Game.getObjectById(creep.room.memory.labOrderArray.outputLab.id);

            if (_.sum(creep.carry) == 0) {
                creepPickingUp = true;
            }
            else if (_.sum(creep.carry) == creep.carryCapacity) {
                creepPickingUp = false;
            }

            if (creepPickingUp == true) {
                // Scientist picking up material
                if (inputLab1.mineralType != creep.room.memory.labOrderArray.inputLab1.mineralType) {
                    // Input lab 1 has to be emptied
                    if (creep.withdraw(inputLab1,inputLab1.mineralType) == ERR_NOT_IN_RANGE) {
                        creep.moveTo(inputLab1, {reusePath: 3});
                    }
                }
                else if (inputLab2.mineralType != creep.room.memory.labOrderArray.inputLab2.mineralType) {
                    // Input lab 2 has to be emptied
                    if (creep.withdraw(inputLab2,inputLab1.mineralType) == ERR_NOT_IN_RANGE) {
                        creep.moveTo(inputLab2, {reusePath: 3});
                    }
                }
                else if (outputLab.mineralType != creep.room.memory.labOrderArray.outputLab.mineralType) {
                    // Output lab has to be emptied
                    if (creep.withdraw(outputLab,inputLab1.mineralType) == ERR_NOT_IN_RANGE) {
                        creep.moveTo(outputLab, {reusePath: 3});
                    }
                }
                else {
                    //Scientist ready for filling from storage
                    if (inputLab1.mineralAmount + creep.carry[creep.room.memory.labOrderArray.inputLab1.mineralType] < orderAmount) {
                        if (creep.withdraw(creep.room.storage,inputLab1.mineralType) == ERR_NOT_IN_RANGE) {
                            creep.moveTo(creep.room.storage, {reusePath: 3});
                        }
                    }
                    else if (inputLab2.mineralAmount + creep.carry[creep.room.memory.labOrderArray.inputLab2.mineralType] < orderAmount) {
                        if (creep.withdraw(creep.room.storage,inputLab2.mineralType) == ERR_NOT_IN_RANGE) {
                            creep.moveTo(creep.room.storage, {reusePath: 3});
                        }
                    }
                    else {
                        creepPickingUp = false;
                    }
                }
            }

            if (creepPickingUp == false) {
                // Scientist delivering material
                for (var resourceType in creep.carry) {
                    if (resourceType == creep.room.memory.labOrderArray.inputLab1.mineralType) {
                        //Found ingredient of input lab 1
                        if (creep.transfer(inputLab1,creep.room.memory.labOrderArray.inputLab1.mineralType) == ERR_NOT_IN_RANGE) {
                            creep.moveTo(inputLab1, {reusePath: 2});
                        }
                    }
                    else if (resourceType == order[2]) {
                        //Found ingredient of input lab 2
                        if (creep.transfer(inputLab2,creep.room.memory.labOrderArray.inputLab2.mineralType) == ERR_NOT_IN_RANGE) {
                            creep.moveTo(inputLab2, {reusePath: 2});
                        }
                    }
                    else {
                        //Get rid of it
                        if (creep.room.name != creep.memory.homeroom) {
                            creep.moveTo(creep.memory.spawn);
                        }
                        else if (creep.transfer(creep.room.storage, resourceType) == ERR_NOT_IN_RANGE) {
                            creep.moveTo(creep.room.storage, {reusePath: delayPathfinding});
                        }
                    }
                }
            }
        }
    }
};