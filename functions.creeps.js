module.exports = function() {
    //Memory.wayFinder.roomname.targetFlagName.pos
    //Memory.wayFinder.roomname.targetFlagName.start
    //Memory.wayFinder.roomname.targetFlagName.way
    //Memory.wayFinder.roomname.realmExists.exitFlagName.pos

    Creep.prototype.MoveToRemoteFlag = function(targetFlagName) {
        if (Game.flags[targetFlagName] != undefined && Game.flags[targetFlagName].pos != undefined) {
            if (Memory.wayFinder == undefined) {
                // Initialize wayFinder
                Memory.wayFinder = {};
            }
            let init = false;
            
            if (Memory.wayFinder[this.room.name] == undefined) {
                // Initialize room
                console.log("Initialize room " + this.room.name);
                init = true;
                Memory.wayFinder[this.room.name] = {};
                Memory.wayFinder[this.room.name].realmExits = {};
                let exitFlags = this.room.find(FIND_FLAGS, {filter: (s) => (s.memory.function == "realmExit")});
                for (let f in exitFlags) {
                    Memory.wayFinder[this.room.name].realmExits[exitFlags[f].name] = exitFlags[f].pos;
                }
            }
            if (Memory.wayFinder[this.room.name][targetFlagName] == undefined) {
                //Initialize target Flag
                console.log("Initialize target flag " + targetFlagName);
                init = true;
                Memory.wayFinder[this.room.name][targetFlagName] = {};
                Memory.wayFinder[this.room.name][targetFlagName].pos = Game.flags[targetFlagName].pos;
            }
            else if (Game.flags[targetFlagName].pos.x != Memory.wayFinder[this.room.name][targetFlagName].pos.x || Game.flags[targetFlagName].pos.y != Memory.wayFinder[this.room.name][targetFlagName].pos.y) {
                //Target flag moved -> re-initialize target flag
                console.log("Initialize target flag " + targetFlagName);
                init = true;
                Memory.wayFinder[this.room.name][targetFlagName] = {};
                Memory.wayFinder[this.room.name][targetFlagName].pos = Game.flags[targetFlagName].pos;
            }
            if (init == true) {
                console.log("New path calculation");
                //Path to flag unknown -> find correct realmExit for target flag
                var exitFlags = this.room.find(FIND_FLAGS, {filter: (s) => (s.memory.function == "realmExit")});
                if (exitFlags.length > 0) {
                    //TODO Find correct realmExit flag
                    //var realmExitFlag = Game.flags[targetFlagName].pos.findClosestByPath(exitFlags);
                    var realmExitFlag = Game.flags["W18S44_Exit_East"];
                    if (realmExitFlag != null) {
                        Memory.wayFinder[this.room.name][targetFlagName].start = realmExitFlag.name;
                        Memory.wayFinder[this.room.name][targetFlagName].way = realmExitFlag.pos.findPathTo(Game.flags[targetFlagName], {ignoreCreeps: true});
                    }
                }
            }
            // Creep still in homeroom
            if (this.memory.journeyPath == undefined && Memory.wayFinder[this.memory.homeroom][targetFlagName].start != undefined) {
                //Creep on its way to startFlag
                let startFlag = Game.flags[Memory.wayFinder[this.memory.homeroom][targetFlagName].start];
                if (this.pos.isEqualTo(startFlag.pos) == true) {
                    this.memory.journeyPath = Memory.wayFinder[this.memory.homeroom][targetFlagName].way;
                }
                else if (this.goToHomeRoom() == true) {
                    this.moveTo(startFlag, {reusePath: moveReusePath()});
                }
                else {
                    this.moveTo(Game.rooms[this.creep.homeroom].controller, {reusePath: moveReusePath()});
                }
            }
            if (this.memory.journeyPath != undefined) {
                //Journey has begun
                this.moveByPath(this.memory.journeyPath);
            }
        }
    };
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
                        var freeContainer = this.findResource(RESOURCE_SPACE, STRUCTURE_CONTAINER, STRUCTURE_STORAGE);
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
    }
};