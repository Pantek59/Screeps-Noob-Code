Creep.prototype.roleTransporter = function () {
    //Find flag
    var flagName = this.findMyFlag("transporter");
    var destinationFlag = _.filter(Game.flags,{ name: flagName})[0];
    if (destinationFlag != null) {
        if (_.sum(this.carry) == 0) {
            this.memory.empty = true;
        }
        if (_.sum(this.carry) == this.carryCapacity) {
            this.memory.empty = false;
        }

        var resource = destinationFlag.memory.resource;
        if (this.memory.empty == true) {
            // Transporter empty
            if (this.memory.targetContainer != undefined) {
                delete this.memory.targetContainer;
            }

            if (this.goToHomeRoom() == true) {
                //Transporter at home
                var originContainer = this.findResource(resource, STRUCTURE_STORAGE, STRUCTURE_CONTAINER, STRUCTURE_LINK);
                if (originContainer != null && this.withdraw(originContainer, resource) == ERR_NOT_IN_RANGE) {
                    this.moveTo(originContainer, {reusePath: moveReusePath()});
                }
            }
        }
        else {
            if (this.room.name == destinationFlag.pos.roomName) {
                //Creep in destination room
                var targetContainer;
                if (this.memory.targetContainer == undefined || Game.time % 8 == 0) {
                    if (this.room.controller.owner != undefined && this.room.controller.owner.username == playerUsername) {
                        targetContainer = this.findResource(RESOURCE_SPACE, STRUCTURE_CONTAINER, STRUCTURE_STORAGE);
                    }
                    else {
                        targetContainer = this.pos.findClosestByPath(FIND_STRUCTURES, {filter: (s) => s.structureType == STRUCTURE_CONTAINER && _.sum(s.store) < s.storeCapacity});
                    }

                    this.memory.targetContainer = targetContainer.id;
                }
                else {
                    targetContainer = Game.getObjectById(this.memory.targetContainer);
                }

                if (targetContainer != null && this.transfer(targetContainer, resource) == ERR_NOT_IN_RANGE) {
                    this.moveTo(targetContainer, {reusePath: moveReusePath()});
                }
            }
            else {
                this.moveTo(destinationFlag, {reusePath: moveReusePath()})
            }
        }
    }
};