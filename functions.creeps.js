module.exports = function() {
    Creep.prototype.towerEmergencyFill = function () {
        var tower = this.pos.findClosestByPath(FIND_MY_STRUCTURES, {filter: (s) => s.structureType == STRUCTURE_TOWER && s.energy < s.energyCapacity});
        if (tower != null) {
            if (this.transfer(tower, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                this.moveTo(tower, {reusePath: moveReusePath()});
            }
        }
    };

    Creep.prototype.getRidOfMinerals = function() {
        // check for picked up minerals and transport them to the next container or storage, return true if found
        // TODO Can this be replace by creep.dropAlltoStorageBut(RESOURCE_ENERGY)?
        var specialResources = false;
        for (var resourceType in this.carry) {
            switch (resourceType) {
                case RESOURCE_ENERGY:
                    break;

                default:
                    // find closest container with space to get rid of minerals
                    if (this.room.name != this.memory.homeroom) {
                        this.moveTo(Game.getObjectById(this.memory.spawn));
                    }
                    else {
                        let freeContainer;
                        if (this.room.storage == undefined) {
                            freeContainer = this.findResource(RESOURCE_SPACE, STRUCTURE_CONTAINER);
                        }
                        else {
                            freeContainer = this.room.storage;
                        }
                        if (this.transfer(freeContainer, resourceType) == ERR_NOT_IN_RANGE) {
                            this.moveTo(freeContainer, {reusePath: moveReusePath()});
                        }
                    }
                    specialResources = true;
                    break;
            }
        }
        return specialResources;
    };

    Creep.prototype.findNearestEnemyAttackerInRange = function(pos, range) {
        // returns object of A) nearest hostile if no argument is given or B) nearest hostile within range when a range is indicated
        var foreignCreeps;
        var attackerCreeps = [];
        foreignCreeps = pos.findInRange(FIND_HOSTILE_CREEPS, range);
        for (let d in foreignCreeps) {
            if (isHostile(foreignCreeps[d]) == true && foreignCreeps[d].getActiveBodyparts(ATTACK) > 0) {
                attackerCreeps.push(foreignCreeps[d]);
            }

        }

        let target = pos.findClosestByPath(attackerCreeps);
        if (target != null) {
            return target;
        }
        return null;
    };

    Creep.prototype.goToHomeRoom = function() {
        // send creep back to room indicated in creep.memory.homeroom. Returns true if creep is in homeroom, false otherwise
        if (this.room.name != this.memory.homeroom) {
            var controller = Game.rooms[this.memory.homeroom].controller;
            this.moveTo(controller, {reusePath: moveReusePath()});
            return false;
        }
        else {return true;}
    };

    Creep.prototype.checkTerminalLimits = function(resource) {
        return checkTerminalLimits(this.room, resource);
    };

    Creep.prototype.storeAllBut = function(resource) {
        // send creep to storage to empty itself into it, keeping one resource type. Use null to drop all resource types.
        // returns true if only carrying allowed resource
        if (arguments.length == 0 && _.sum(this.carry) == 0) {
            return true;
        }
        if (arguments.length == 1 && (_.sum(this.carry) == this.carry[resource] || _.sum(this.carry) == 0)) {
            return true;
        }

        if (_.sum(this.carry) > 0) {
            var targetContainer = this.findResource(RESOURCE_SPACE,STRUCTURE_STORAGE);
            if (targetContainer == null) {
                targetContainer = this.findResource(RESOURCE_SPACE,STRUCTURE_CONTAINER);
            }
            if (this.pos.getRangeTo(targetContainer) > 1) {
                this.moveTo(targetContainer, {reusePath: moveReusePath()});
            }
            else {
                for (var res in this.carry) {
                    if (arguments.length == 1 && resource == res) {
                        //keep this stuff
                    }
                    else {
                        this.transfer(targetContainer,res);
                    }
                }
            }
            return false;
        }
        else {return true;}
    };

    Creep.prototype.flee = function (hostilesArray, range) {
        let hostilesMarker = [];
        for (let h in hostilesArray) {
            hostilesMarker.push({ pos: hostilesArray[h].pos, range: range });
        }
        var flightPath = PathFinder.search(this.pos, hostilesMarker, {flee: true}).path;
        this.moveByPath(flightPath);
    };

    Creep.prototype.gotoFlag = function (flag) {
        if (flag.memory.waypoints == undefined) {
            // No waypoints set -> proceed directly to flag
            this.moveTo(flag, {reusePath: moveReusePath()});
        }
        else {
            // Target flag has waypoints set
            if (this.memory.waypointFlag != flag.name) {
                // New flag target -> reset counter;
                this.memory.waypointCounter = 0;
                this.memory.waypointFlag = flag.name;
            }

            if (flag.memory.waypoints.length == this.memory.waypointCounter) {
                // Last waypoint reached -> go to final destination
                if (this.pos.getRangeTo(flag) > 2) {
                    this.moveTo(flag, {reusePath: moveReusePath()});
                }
                else {
                    this.memory.sleep = 3;
                }
            }
            else {
                //Go to waypoint
                let waypointFlag = Game.flags[flag.memory.waypoints[this.memory.waypointCounter]];

                if (waypointFlag == null) {
                    //Waypoint flag does not exist
                    console.log("Flag " + flag.name + " in room " + flag.pos.roomName + " has an invalid way-point #" + this.memory.waypointCounter);
                    return false;
                }
                else {
                    //Waypoint is valid
                    if (this.room.name == waypointFlag.pos.roomName) {
                        // Creep is in waypoint room
                        if (this.pos.getRangeTo(waypointFlag) < 2) {
                            // Waypoint reached
                            this.memory.waypointCounter++;
                        }
                        else {
                            this.moveTo(waypointFlag, {reusePath: moveReusePath()});
                        }
                    }
                    else {
                        // Creep not in waypoint room
                        this.moveTo(waypointFlag, {reusePath: moveReusePath()});
                    }
                }
            }
        }
    }
};