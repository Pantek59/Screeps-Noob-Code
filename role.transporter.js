module.exports = {
    // state working = Returning energy to structure
    run: function (creep) {
        //Find flag
        var flagName = creep.findMyFlag("transporter");
        var destinationFlag = _.filter(Game.flags,{ name: flagName})[0];
        if (destinationFlag != null) {
            if (_.sum(creep.carry) == 0) {
                creep.memory.empty = true;
            }
            if (_.sum(creep.carry) == creep.carryCapacity) {
                creep.memory.empty = false;
            }

            var resource = destinationFlag.memory.resource;
            if (creep.memory.empty == true) {
                // Transporter empty
                if (creep.memory.targetContainer != undefined) {
                    delete creep.memory.targetContainer;
                }

                if (creep.goToHomeRoom() == true) {
                    //Transporter at home
                    var originContainer = creep.findResource(resource, STRUCTURE_STORAGE, STRUCTURE_CONTAINER, STRUCTURE_LINK);
                    if (originContainer != null && creep.withdraw(originContainer, resource) == ERR_NOT_IN_RANGE) {
                        creep.moveTo(originContainer, {reusePath: DELAYPATHFINDING});
                    }
                }
            }
            else {
                if (creep.room.name == destinationFlag.pos.roomName) {
                    //Creep in destination room
                    var targetContainer;
                    if (creep.memory.targetContainer == undefined || Game.time % 8 == 0) {
                        if (creep.room.controller.owner != undefined && creep.room.controller.owner.username == playerUsername) {
                            targetContainer = creep.findResource(RESOURCE_SPACE, STRUCTURE_CONTAINER, STRUCTURE_STORAGE);
                        }
                        else {
                            targetContainer = creep.pos.findClosestByPath(FIND_STRUCTURES, {filter: (s) => s.structureType == STRUCTURE_CONTAINER && _.sum(s.store) < s.storeCapacity});
                        }

                        creep.memory.targetContainer = targetContainer.id;
                    }
                    else {
                        targetContainer = Game.getObjectById(creep.memory.targetContainer);
                    }

                    if (targetContainer != null && creep.transfer(targetContainer, resource) == ERR_NOT_IN_RANGE) {
                        creep.moveTo(targetContainer, {reusePath: DELAYPATHFINDING});
                    }
                }
                else {
                    creep.moveTo(destinationFlag, {reusePath: DELAYPATHFINDING})
                }
            }
        }
    }
};
