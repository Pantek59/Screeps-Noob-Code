Creep.prototype.roleMiner = function() {
    if (this.room.name != this.memory.homeroom) {
        //return to home room
        var hometarget = Game.getObjectById(this.memory.spawn);
        this.moveTo(hometarget, {reusePath: moveReusePath()});
    }
    else {
        if (this.memory.statusHarvesting != undefined && this.memory.statusHarvesting != false) {
            // Creep is mining, try to keep mining
            if (this.harvest(Game.getObjectById(this.memory.statusHarvesting)) != OK || _.sum(this.carry) == this.carryCapacity) {
                this.memory.statusHarvesting = false;
            }
        }
        else if (this.room.memory.roomArray.minerals != undefined) {
            // if creep is bringing minerals to a structure but is empty now
            if (_.sum(this.carry) == 0) {
                // switch state to harvesting
                this.memory.working = false;
            }
            // if creep is harvesting minerals but is full
            else if (_.sum(this.carry) == this.carryCapacity || this.carry[RESOURCE_ENERGY] > 0) {
                // switch state
                this.memory.working = true;
            }
            var storage = this.room.storage;
            var resource;

            // if creep is supposed to transfer minerals to a structure
            if (this.memory.working == true) {
                if (this.carry[RESOURCE_ENERGY] > 0) {
                    //somehow picked up energy
                    if (this.room.storage == undefined) {
                        var container = this.findResource(RESOURCE_SPACE, STRUCTURE_CONTAINER, STRUCTURE_LINK)
                    }
                    else {
                        var container = this.room.storage;
                    }

                    if (this.transfer(container, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                        this.moveTo(container, {reusePath: moveReusePath()});
                    }
                }
                else {
                    for (var t in this.carry) {
                        if (t != "energy") {
                            resource = t;
                            break;
                        }
                    }
                    if (storage == null) {
                        //No storage found in room
                        var container = this.findResource(RESOURCE_SPACE, STRUCTURE_CONTAINER);
                        if (this.transfer(container, resource) == ERR_NOT_IN_RANGE) {
                            this.moveTo(container, {reusePath: moveReusePath()});
                        }
                    }
                    else {
                        //storage found
                        if (this.transfer(storage, resource) == ERR_NOT_IN_RANGE) {
                            this.moveTo(storage, {reusePath: moveReusePath()});
                        }
                    }
                }
            }
            else {
                //creep is supposed to harvest minerals from source or containers
                let container = this.pos.findClosestByPath(FIND_STRUCTURES, {filter: (s) => s.structureType == STRUCTURE_CONTAINER && s.store[RESOURCE_ENERGY] < _.sum(s.store)});
                var containerResource;

                if (container != undefined && storage != undefined) {
                    //minerals waiting in containers
                    //analyzing storage of container
                    var store = container.store;
                    for (var s in store) {
                        if (s != RESOURCE_ENERGY) {
                            // mineral found in container
                            containerResource = s;
                        }
                    }
                    if (this.withdraw(container, containerResource) != OK) {
                        this.moveTo(container);
                    }
                }
                else if (Game.getObjectById(this.room.memory.roomArray.minerals[0]).mineralAmount > 0) {
                    //minerals waiting at source
                    var mineral = this.pos.findClosestByPath(FIND_MINERALS, {filter: (s) => s.mineralAmount > 0});
                    var result = this.harvest(mineral);
                    if (mineral != null && result == ERR_NOT_IN_RANGE) {
                        this.moveTo(mineral);
                        this.memory.statusHarvesting = false;
                    }
                    else if (mineral != null && result == OK) {
                        this.memory.statusHarvesting = mineral.id;
                    }
                    else if (mineral != null && result == ERR_TIRED) {
                        this.memory.sleep = 3;
                    }
                    else {
                        this.memory.statusHarvesting = false;
                    }
                }
            }
        }
    }
};