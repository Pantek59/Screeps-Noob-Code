Creep.prototype.roleDemolisher = function() {
    var flagName = this.findMyFlag("demolish");
    var demolishFlag = Game.flags[flagName];

    if (demolishFlag != undefined) {
        if (this.room.memory.hostiles.length > 0) {
            // Hostiles present
            var homespawn = Game.getObjectById(this.memory.spawn);
            if (this.room.name != this.memory.homeroom) {
                this.moveTo(homespawn), {reusePath: moveReusePath()};
            }
            else if (this.pos.getRangeTo(homespawn) > 5) {
                this.moveTo(homespawn), {reusePath: moveReusePath()};
            }
            this.memory.fleeing = true;
            return;
        }

        if (_.sum(this.carry) == 0) {
            // switch state to demolishing
            this.memory.working = false;
        }
        else if (_.sum(this.carry) == this.carryCapacity) {
            // if creep is demolishing but is full
            demolishFlag = Game.flags[flagName];
            if (demolishFlag.memory.dropEnergy == true) {
                this.drop(RESOURCE_ENERGY);
                this.memory.dropEnergy = true;
            }
            else {
                this.memory.working = true;
                delete this.memory.path;
            }
        }

        // if creep is supposed to transfer energy to a structure
        if (this.memory.working == true || demolishFlag == null) {
            // Find exit to spawn room
            let spawn = Game.getObjectById(this.memory.spawn);
            if (this.room.name != this.memory.homeroom) {
                //still in new room, go out
                if (!this.memory.path) {
                    this.memory.path = this.pos.findPathTo(spawn);
                }
                if (this.moveByPath(this.memory.path) == ERR_NOT_FOUND) {
                    this.memory.path = this.pos.findPathTo(spawn);
                    this.moveByPath(this.memory.path);
                }
            }
            else if (demolishFlag != undefined && demolishFlag.pos != undefined) {
                // back in spawn room
                let structure;
                if (demolishFlag.pos.roomName == this.memory.homeroom) {
                    //Demolisher flag is in creep's home room -> energy will only be stored in containers and in the storage
                    structure = this.pos.findClosestByPath(FIND_STRUCTURES, {filter: (s) => (s.structureType == STRUCTURE_CONTAINER || s.structureType == STRUCTURE_STORAGE) && s.storeCapacity > _.sum(s.store) && s.pos.isEqualTo(demolishFlag.pos) == false});
                }
                else {
                    structure = this.findResource(RESOURCE_SPACE, STRUCTURE_CONTAINER, STRUCTURE_LINK, STRUCTURE_TOWER, STRUCTURE_STORAGE, STRUCTURE_SPAWN);
                }
                if (structure != null) {
                    // try to transfer energy, if it is not in range

                    if (this.transfer(structure, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                        // move towards it
                        this.moveTo(structure, {reusePath: moveReusePath()});
                    }
                }
            }
            else {
                this.roleUpgrader();
            }
        }
        // if creep is supposed to demolish
        else {
            //TODO Several demolishers per spawn; use creep.findMyFlag()
            //Find something to demolish
            demolishFlag = Game.flags[flagName];
            // Find exit to target room
            if (this.room.name != demolishFlag.pos.roomName) {
                //still in old room, go out
                this.moveTo(demolishFlag, {reusePath: moveReusePath()});
                this.memory.oldRoom = true;
            }
            if (this.room.name == demolishFlag.pos.roomName) {
                if (this.room.memory.hostiles.length == 0) {
                    if (this.memory.statusDemolishing == undefined) {
                        //new room reached, start demolishing
                        if (this.memory.oldRoom == true) {
                            delete this.memory.targetBuffer;
                            delete this.memory.oldRoom;
                            delete this.memory._move;
                            delete this.memory.path;
                        }
                        var targetlist;
                        if (demolishFlag.memory.target == "object") {
                            //demolish flag position structures
                            targetlist = demolishFlag.pos.lookFor(LOOK_STRUCTURES);
                            // Go through target list
                            for (var i in targetlist) {
                                if (targetlist[i].structureType != undefined) {
                                    if ((targetlist[i].store != undefined && targetlist[i].store[RESOURCE_ENERGY] > 0) || (targetlist[i].energy != undefined && targetlist[i].energy > 0)) {
                                        //empty structure of energy first
                                        if (this.withdraw(targetlist[i], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                                            this.moveTo(targetlist[i], {reusePath: moveReusePath()});
                                        }
                                    }
                                    else if (this.dismantle(targetlist[i]) == ERR_NOT_IN_RANGE) {
                                        this.moveTo(targetlist[i], {reusePath: moveReusePath()});
                                    }
                                    break;
                                }
                            }
                            if (targetlist.length == 0) {
                                console.log("Demolition flag in room " + demolishFlag.pos.roomName + " is placed in empty square!")
                            }
                        }
                        else if (demolishFlag.memory.target == "room") {
                            //demolish all structures in room
                            // find structures with energy
                            let target = this.findResource(RESOURCE_ENERGY, STRUCTURE_SPAWN, STRUCTURE_EXTENSION, STRUCTURE_TERMINAL, STRUCTURE_STORAGE, STRUCTURE_TOWER, STRUCTURE_LINK, STRUCTURE_LAB);
                            if (target == null) {
                                target = this.pos.findClosestByPath(FIND_STRUCTURES, {filter: (s) => s.structureType != STRUCTURE_ROAD && s.structureType != STRUCTURE_WALL && s.structureType != STRUCTURE_CONTAINER && s.structureType != STRUCTURE_CONTROLLER});
                            }
                            if (target == null) {
                                target = this.pos.findClosestByPath(FIND_STRUCTURES, {filter: (s) => s.structureType != STRUCTURE_ROAD && s.structureType != STRUCTURE_CONTAINER && s.structureType != STRUCTURE_CONTROLLER});
                            }
                            if (target != null) {
                                if ((target.owner == undefined || target.owner.username == undefined) && ((target.store != undefined && target.store[RESOURCE_ENERGY] > 0) || (target.energy != undefined && target.energy > 20))) {
                                    //empty structure of energy first
                                    let returnCode = this.withdraw(target, RESOURCE_ENERGY);
                                    if (returnCode == ERR_NOT_IN_RANGE) {
                                        this.moveTo(target, {reusePath: moveReusePath()});
                                    }
                                    else if (returnCode == ERR_NOT_OWNER) {
                                        //Something blocks access to energy
                                        let ramps = target.pos.lookFor(LOOK_STRUCTURES, {filter: (s) => s.structureType == STRUCTURE_RAMPART});
                                        if (ramps.length > 0) {
                                            target = ramps[0];
                                            returnCode = this.dismantle(target);
                                            if (returnCode == ERR_NOT_IN_RANGE) {
                                                this.moveTo(target, {reusePath: moveReusePath()});
                                            }
                                            else if (returnCode == OK) {
                                                this.memory.statusDemolishing = target.id;
                                            }
                                        }
                                        else {
                                            let result = this.dismantle(target);
                                            if (result == ERR_NOT_IN_RANGE) {
                                                this.moveTo(target, {reusePath: moveReusePath()});
                                            }
                                            else if (result == OK) {
                                                this.memory.statusDemolishing = target.id;
                                            }
                                        }
                                    }
                                }
                                else {
                                    let result = this.dismantle(target);
                                    if (result == ERR_NOT_IN_RANGE) {
                                        this.moveTo(target, {reusePath: moveReusePath()});
                                    }
                                    else if (result == OK) {
                                        this.memory.statusDemolishing = target.id;
                                    }
                                }
                            }
                            else {
                                // destroy construction sites
                                let foreignConstructionSites = this.room.find(FIND_HOSTILE_CONSTRUCTION_SITES);
                                if (foreignConstructionSites.length > 0) {
                                    let bufferTarget = Game.getObjectById(this.memory.siteTarget);
                                    if (bufferTarget != null) {
                                        this.moveTo(bufferTarget, {reusePath: moveReusePath()});
                                    }
                                    else if (foreignConstructionSites.length > 0) {
                                        let siteTarget = this.pos.findClosestByPath(foreignConstructionSites);
                                        this.moveTo(siteTarget, {reusePath: moveReusePath()});
                                        this.memory.siteTarget = siteTarget.id;
                                    }
                                }
                                else {
                                    //no target, no construction site => remove flag
                                    demolishFlag.remove();
                                    this.memory.working = true;
                                }
                            }
                        }
                    }
                    else {
                        if (this.dismantle(Game.getObjectById(this.memory.statusDemolishing)) != OK) {
                            delete this.memory.statusDemolishing;
                            delete this.memory.path;
                            delete this.memory._move;
                            delete this.memory.targetBuffer;
                        }
                    }
                }
                else {
                    //Hostiles creeps in new room
                    this.memory.fleeing = true;
                    this.goToHomeRoom();
                }
            }
        }
    }
    else {
        if (this.room.name != this.memory.homeroom) {
            //still in new room, go out
            if (!this.memory.path) {
                this.memory.path = this.pos.findPathTo(spawn);
            }
            if (this.moveByPath(this.memory.path) == ERR_NOT_FOUND) {
                this.memory.path = this.pos.findPathTo(spawn);
                this.moveByPath(this.memory.path);
            }
        }
        else {
            // back in spawn room
            if (this.carry[RESOURCE_ENERGY] > 0) {
                let structure;
                if (demolishFlag.pos.roomName == this.memory.homeroom) {
                    //Demolisher flag is in creep's home room -> energy will only be stored in containers and in the storage
                    structure = this.pos.findClosestByPath(FIND_STRUCTURES, {filter: (s) => (s.structureType == STRUCTURE_CONTAINER || s.structureType == STRUCTURE_STORAGE) && s.storeCapacity > _.sum(s.store) && s.pos.isEqualTo(demolishFlag.pos) == false});
                }
                else {
                    structure = this.findResource(RESOURCE_SPACE, STRUCTURE_CONTAINER, STRUCTURE_LINK, STRUCTURE_TOWER, STRUCTURE_STORAGE, STRUCTURE_SPAWN);
                }
                if (structure != null) {
                    // try to transfer energy, if it is not in range

                    if (this.transfer(structure, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                        // move towards it
                        this.moveTo(structure, {reusePath: moveReusePath()});
                    }
                }
            }
            else {
                delete this.memory.currentFlag;
            }
        }
    }
};