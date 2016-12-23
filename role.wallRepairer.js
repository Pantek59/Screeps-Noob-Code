Creep.prototype.roleWallRepairer = function() {
    // check for home room
    if (this.room.name != this.memory.homeroom) {
        //return to home room
        var hometarget = Game.getObjectById(this.memory.spawn);
        this.moveTo(hometarget, {reusePath: moveReusePath()});
    }
    else {
        // if creep is trying to repair something but has no energy left
        if (this.carry.energy == 0) {
            // switch state
            this.memory.working = false;
            delete this.memory.statusRepairing;
        }
        // if creep is full of energy but not working
        else if (this.carry.energy == this.carryCapacity) {
            // switch state
            this.memory.working = true;
        }

        // if creep is supposed to repair something
        if (this.memory.working == true) {
            if (this.memory.statusRepairing == undefined) {
                var rampartsBeingSetUp = this.room.find(FIND_MY_STRUCTURES, {filter: (s) => s.structureType == STRUCTURE_RAMPART && s.hits < 70000});
                var constructionSite = this.pos.findClosestByPath(FIND_CONSTRUCTION_SITES, { filter: (s) => s.structureType == STRUCTURE_WALL || s.structureType == STRUCTURE_RAMPART});
                if (constructionSite != null && rampartsBeingSetUp.length == 0) {
                    // Construction sites found
                    var position = constructionSite.pos;
                    var buildResult = this.build(constructionSite)
                    if (buildResult == ERR_NOT_IN_RANGE) {
                        // move towards the constructionSite
                        this.moveTo(constructionSite, {reusePath: moveReusePath()});
                    }
                    else if (buildResult == OK) {
                        var builtObject = position.lookFor(LOOK_STRUCTURES);
                        this.memory.statusRepairing = builtObject.id;
                    }
                }
                else {
                    var target = undefined;
                    var ramparts = this.room.find(FIND_STRUCTURES, {filter: (s) => s.structureType == STRUCTURE_RAMPART});
                    ramparts = _.sortBy(ramparts,"hits");

                    var walls = this.room.find(FIND_STRUCTURES, {filter: (s) => s.structureType == STRUCTURE_WALL});
                    walls = _.sortBy(walls,"hits");

                    if (walls.length > 0 && ((ramparts[0] != undefined && walls[0].hits < ramparts[0].hits) || (ramparts.length == 0))) {
                        target = walls[0];
                    }
                    else if (ramparts.length > 0) {
                        target = ramparts[0];
                    }

                    // if we find a wall that has to be repaired
                    if (target != undefined) {
                        var result = this.repair(target);
                        if (result == ERR_NOT_IN_RANGE) {
                            // move towards it
                            this.moveTo(target, {reusePath: moveReusePath()});
                            this.memory.statusRepairing = target.id;
                        }
                        else if (result == OK) {
                            this.memory.statusRepairing = target.id;
                        }
                        else {
                            delete this.memory.statusRepairing;
                        }
                    }
                    // if we can't fine one
                    else {
                        // look for construction sites
                        this.roleBuilder();
                    }
                }
            }
            else {
                let status = this.repair(Game.getObjectById(this.memory.statusRepairing));
                if (status == ERR_NOT_IN_RANGE) {
                    if (this.moveTo(Game.getObjectById(this.memory.statusRepairing), {reusePath: moveReusePath()}) != OK) {
                        delete this.memory.statusRepairing;
                    }
                }
                else if (status != OK) {
                    delete this.memory.statusRepairing;
                }
                else if (Game.getObjectById(this.memory.statusRepairing).structureType == STRUCTURE_RAMPART && Game.time % 25 == 0) {
                    delete this.memory.statusRepairing;
                }
            }
        }
        // if creep is supposed to harvest energy from source
        else {
            this.roleCollector();
        }
    }
};