Creep.prototype.towerEmergencyFill = function () {
    var tower = this.pos.findClosestByPath(FIND_MY_STRUCTURES, {filter: (s) => s.structureType == STRUCTURE_TOWER && s.energy < s.energyCapacity});
    if (tower != null) {
        if (this.transfer(tower, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
            this.moveTo(tower, {reusePath: moveReusePath()});
        }
    }
};

Creep.prototype.goToHomeRoom = function() {
    // send creep back to room indicated in creep.memory.homeroom. Returns true if creep is in homeroom, false otherwise
    if (this.room.name != this.memory.homeroom) {
        let waypointFlag =  Game.rooms[this.memory.homeroom].find(FIND_FLAGS, {filter: (f) => f.memory.waypoints != undefined && this.memory.spawn == Game.rooms[f.pos.roomName].controller.id});
        //console.log(this.room.name + ", " + this.name + ": " + waypointFlag.length);
        if (waypointFlag.length > 0) {
            //Waypoint flag found!
            this.gotoFlag(waypointFlag[0]);
        }
        else {
            let controller = Game.rooms[this.memory.homeroom].controller;
            this.moveTo(controller, {reusePath: moveReusePath()});
        }
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
};

Creep.prototype.useFlowPathTo = function (targetPosition) {
    // Data structure: Memory.flowPath.room.target x/y.source x/y = direction
    // flowMarker Hash: Memory.flowPath.room.roomHash
    let PathFinderDefaults = {plainCost: 1, swampCost: 5, maxOps: 10000, costCallback: roomCallback, ignoreCreeps: true};

    let targetXY = targetPosition.roomName + "/" + targetPosition.x + "/" + targetPosition.y;
    let creepXY = this.pos.x + "/" + this.pos.y;

    // Prepare memory
    if (Memory.flowPath == undefined) {
        Memory.flowPath = {};
    }
    if (Memory.flowPath[this.room.name] == undefined) {
        Memory.flowPath[this.room.name] = {};
    }
    if (Memory.flowPath[this.room.name][targetXY] == undefined) {
        Memory.flowPath[this.room.name][targetXY] = {};
    }

    if (Memory.flowPath[this.room.name][targetXY][creepXY] == undefined) {
        // Get path
        let myPath = this.pos.findPathTo(targetPosition, PathFinderDefaults);
        console.log(this.room.name + ": New flow path calculated");
        if (myPath.length == 0) {
            return false;
        }

        // Save direction to flowPath memory
        for (let step in myPath) {
            let savePos;
            if (step == 0) {
                savePos = creepXY;
            }
            else {
                savePos = myPath[step - 1].x + "/" + myPath[step - 1].y;
            }
            Memory.flowPath[this.room.name][targetXY][savePos] = myPath[step].direction;
        }
    }

    if (Memory.flowPath[this.room.name][targetXY][creepXY] == undefined) {
        return false;
    }

    // Move in saved direction
    this.move(Memory.flowPath[this.room.name][targetXY][creepXY]);
};

