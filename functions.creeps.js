module.exports = function() {


    // find unoccupied flag and return flag name
    Creep.prototype.towerEmergencyFill = function() {
        var tower = this.pos.findClosestByPath(FIND_MY_STRUCTURES, {filter: (s) => s.structureType == STRUCTURE_TOWER && s.energy < s.energyCapacity});
        if (tower != null) {
            if (this.transfer(tower, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                this.moveTo(tower, {reusePath: 5});
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
                            this.moveTo(freeContainer, {reusePath: 3});
                        }
                    }
                    specialResources = true;
                    break;
            }
        }
        return specialResources;
    };

    Creep.prototype.findNearestEnemyAttacker = function(range, pos) {
        // returns object of A) nearest hostile if no argument is given or B) nearest hostile within range when a range is indicated
        var attackerCreeps = new Array();
        var foreignCreeps;
        if (arguments.length == 0) {
            foreignCreeps = this.room.find(FIND_HOSTILE_CREEPS);
            pos = this.pos;
        }
        else {
            foreignCreeps = pos.findInRange(FIND_HOSTILE_CREEPS,range);
        }
        for (var creep in foreignCreeps) {
            if (allies.indexOf(foreignCreeps[creep].owner.username) == -1) {
                // Foreign creep not on allies list
                for (var part in foreignCreeps[creep].body) {
                    if (foreignCreeps[creep].body[part].type == ATTACK && foreignCreeps[creep].body[part].hits > 0) {
                        // Creep with working attack part found
                        attackerCreeps.push(foreignCreeps[creep]);
                    }
                }
            }
        }

        if (attackerCreeps.length == 0) {
            return null;
        }
        else {
            return pos.findClosestByPath(attackerCreeps);
        }
    };

    Creep.prototype.findNearestEnemyHealer = function(range, pos) {
        // returns object of A) nearest healer if no argument is given or B) nearest healer within range when a range is indicated
        var healerCreeps = new Array();
        var foreignCreeps;
        if (arguments.length == 0) {
            foreignCreeps = this.room.find(FIND_HOSTILE_CREEPS);
            pos = this.pos;
        }
        else {
            foreignCreeps = pos.findInRange(FIND_HOSTILE_CREEPS,range);
        }
        for (var creep in foreignCreeps) {
            if (allies.indexOf(foreignCreeps[creep].owner.username) == -1) {
                // Foreign creep not on allies list
                for (var part in foreignCreeps[creep].body) {
                    if (foreignCreeps[creep].body[part].type == HEAL && foreignCreeps[creep].body[part].hits > 0) {
                        // Creep with working attack part found
                        healerCreeps.push(foreignCreeps[creep]);
                    }
                }
            }
        }

        if (healerCreeps.length == 0) {
            return null;
        }
        else {
            return pos.findClosestByPath(healerCreeps);
        }
    };

    Creep.prototype.goToHomeRoom = function() {
        // send creep back to room indicated in creep.memory.homeroom. Returns true if creep is in homeroom, false otherwise
        if (this.room.name != this.memory.homeroom) {
            var spawn = Game.getObjectById(this.memory.spawn);
            this.moveTo(spawn, {reusePath: 5});
            return false;
        }
        else {return true;}
    };

    Creep.prototype.checkTerminalLimits = function(resource) {
        return checkTerminalLimits(this.room, resource);
    };

    Creep.prototype.storeAllBut = function(resource) {
        // send creep to storage to empty itself into it, keeping one resource type. Use null to drop all resource types.
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
                this.moveTo(targetContainer, {reusePath: 3});
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
};