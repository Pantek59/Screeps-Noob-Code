module.exports = {
    init (friendlyCreeps, enemyCreeps) {
        this.friendlyCreeps = friendlyCreeps;
        this.enemyCreeps = enemyCreeps;
    },

    attackTarget (creep, target) {
        if (creep.getActiveBodyparts(RANGED_ATTACK) > 0) {
            creep.rangedAttack(target);
        }
        if (creep.attack(target) == ERR_NOT_IN_RANGE) {
            creep.moveTo(target,{reusePath: moveReusePath(true)});
        }
    },

    attackInRange (creep, range) {
        // Find enemy creeps in range and attack them. Return false when there is nobody to attack.
        let enemies = creep.pos.findInRange(this.enemyCreeps, range);
        if (enemies.length > 0) {
            // Allied creeps in range found
            let target = creep.pos.findClosestByPath(enemies);
            if (target != null) {
                // Damaged creeps near healer found --> move closer
                if (creep.attack(target) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(target, {reusePath: moveReusePath(true)});
                }
                return true;
            }
            else {
                //No enemy creeps found
                return false;
            }
        }
        else {
            //No enemy creeps found
            return false;
        }
    },

    healInRange (creep, range) {
        // Find wounded creeps in range and heal them. Return false when there is nobody to heal.
        let patients = creep.pos.findInRange(this.friendlyCreeps, range);
        if (patients.length > 0) {
            // Allied creeps in range found
            let patient = creep.pos.findClosestByPath(patients, {filter: (s) => s.hits < s.hitsMax});
            if (patient != null) {
                // Damaged creeps near healer found --> move closer
                if (creep.heal(patient) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(patient, {reusePath: moveReusePath(true)});
                }
                return true;
            }
            else {
                //No damaged creeps found
                return false;
            }
        }
        else {
            //No damaged creeps found
            return false;
        }
    },

    getNearestRole (creep, role) {
        //Find nearest creep with the designated role; return null if none present
        let roleCreeps = _.filter(flagCreeps,{ memory: { role: role}});
        if (roleCreeps.length == 0) {
            return null;
        }
        return creep.pos.findClosestByPath(roleCreeps);
    },

    goTo (creep, destination) {
        switch(creep.memory.role)
        {
            //Move to destination and attack creeps within a radius while moving there
            case "attacker":
            case "einarr":
            case "archer":
                //Einarr self-help
                if (creep.memory.role === "einarr" && creep.hits < creep.hitsMax) {
                    creep.heal(creep);
                }

                if (creep.hits < creep.hitsMax / 2) {
                    // Creep lost half of its health and needs help --> goto nearest healer
                    let myHealer = this.getNearestRole("healer");
                    if (myHealer != null) {
                        creep.moveTo(myHealer, {reusePath: moveReusePath(true)});
                    }
                }
                else {
                    // Creep fit to fight
                    if (this.attackInRange(creep, 3, this.enemyCreeps) == false) {
                        //No enemy creep around
                        creep.moveTo(destination, {reusePath: moveReusePath(true)});
                    }

                }
                break;

            case "healer":
                // Healer self-help
                if (creep.hits < creep.hitsMax / 2) {
                    creep.heal(creep);
                }

                if (this.healInRange(creep, 5, this.friendlyCreeps) == false) {
                    //Nobody to heal around
                    creep.moveTo(destination, {reusePath: moveReusePath(true)});
                }
                break;
        }
    },

    destroy (creep, target) {
        switch (creep.memory.role) {
            case "attacker":
            case "einarr":
            case "archer":
                if (creep.memory.role === "einarr" && creep.hits < creep.hitsMax) {
                    creep.heal(creep);
                }
                if (creep.pos.getRangeTo(target) > 5) {
                    //Creep too far away to defend target --> Move to target
                    this.goTo(creep, target);
                }
                else {
                    //target reached
                    if (this.attackInRange(creep, 3) == false) {
                        //No hostile creeps around or not path to them found -> attack structure
                        targets = target.pos.lookFor(LOOK_STRUCTURES);
                        if (targets.length > 0) {
                            // Structure found
                            for (let t in targets) {
                                if (targets[t].structureType != STRUCTURE_CONTROLLER && targets[t].structureType != STRUCTURE_ROAD) {
                                    target = targets[t];
                                }
                                break;
                            }

                            if (target != undefined) {
                                if (creep.attack(target) == ERR_NOT_IN_RANGE) {
                                    creep.moveTo(target, {reusePath: moveReusePath(true)});
                                }
                            }
                        }
                        else {
                            //No structure to attack found
                            return false;
                        }
                    }
                }
                break;

            case "healer":
                if (creep.hits < creep.hitsMax) {
                    creep.heal(creep);
                }

                if (this.healInRange(creep, 4) == false) {
                    //No damaged creeps around
                    if (creep.pos.getRangeTo(target) > 3) {
                        creep.moveTo(target, {reusePath: moveReusePath()});
                    }
                }
                break;
        }
    },

    getFormationPositions (formation, anchorPoint, direction, numberofCreeps) {
        let formationPositions = [];
        let blockedPositions = [];
        let anchorRoom = Game.rooms[anchorPoint.roomName];

        if (anchorRoom != undefined) {
            switch (formation) {
                case "reverseArrow":
                    switch (direction) {
                        case LEFT:
                            for (let i = 0; i - blockedPositions.length < numberofCreeps; i++) {
                                if (i == 0) {
                                    // initial position
                                    formationPositions[0] = anchorPoint;
                                }
                                else {
                                    // build formation
                                    let newx, newy;
                                    let deltax = formationPositions[i - 1].x - anchorPoint.x;
                                    let deltay = formationPositions[i - 1].y - anchorPoint.y;

                                    if (deltay == 0) {
                                        newy = anchorPoint.y + deltax + 1;
                                        newx = anchorPoint.x;
                                    }
                                    else if (deltay > 0) {
                                        newy = anchorPoint.y - deltay;
                                        newx = anchorPoint.x + deltax;
                                    }
                                    else if (deltay < 0) {
                                        newy = anchorPoint.y + Math.abs(deltay) - 1;
                                        newx = anchorPoint.x + deltax + 1;
                                    }
                                    formationPositions[i] = anchorRoom.getPositionAt(newx, newy);

                                    // Check for blocked positions
                                    let posChar = formationPositions[i].look();
                                    for (let p in posChar) {
                                        if ((posChar[p].type == "structure" && posChar[p].structure != "road") || (posChar[p].type == "terrain" && posChar[p].terrain == "wall")) {
                                            blockedPositions.push(i);
                                        }
                                    }
                                }
                            }
                            break;

                        case RIGHT:
                            for (let i = 0; i - blockedPositions.length < numberofCreeps; i++) {
                                if (i == 0) {
                                    // initial position
                                    formationPositions[0] = anchorPoint;
                                }
                                else {
                                    // build formation
                                    let newx, newy;
                                    let deltax = (formationPositions[i - 1].x - anchorPoint.x) * -1;
                                    let deltay = formationPositions[i - 1].y - anchorPoint.y;

                                    if (deltay == 0) {
                                        newy = anchorPoint.y + deltax + 1;
                                        newx = anchorPoint.x;
                                    }
                                    else if (deltay > 0) {
                                        newy = anchorPoint.y - deltay;
                                        newx = anchorPoint.x + deltax;
                                    }
                                    else if (deltay < 0) {
                                        newy = anchorPoint.y + Math.abs(deltay) - 1;
                                        newx = anchorPoint.x + deltax - 1;
                                    }
                                    formationPositions[i] = anchorRoom.getPositionAt(newx, newy);

                                    // Check for blocked positions
                                    let posChar = formationPositions[i].look();
                                    for (let p in posChar) {
                                        if ((posChar[p].type == "structure" && posChar[p].structure != "road") || (posChar[p].type == "terrain" && posChar[p].terrain == "wall")) {
                                            blockedPositions.push(i);
                                        }
                                    }
                                }
                            }
                            break;

                        case TOP:
                            for (let i = 0; i - blockedPositions.length < numberofCreeps; i++) {
                                if (i == 0) {
                                    // initial position
                                    formationPositions[0] = anchorPoint;
                                }
                                else {
                                    // build formation
                                    let newx, newy;
                                    let deltax = formationPositions[i - 1].x - anchorPoint.x;
                                    let deltay = formationPositions[i - 1].y - anchorPoint.y;

                                    if (deltax == 0) {
                                        newx = anchorPoint.x - deltay + 1;
                                        newy = anchorPoint.y;
                                    }
                                    else if (deltax > 0) {
                                        newx = anchorPoint.x - deltax;
                                        newy = anchorPoint.y + deltay;
                                    }
                                    else if (deltax < 0) {
                                        newx = anchorPoint.x + Math.abs(deltax) - 1;
                                        newy = anchorPoint.y - deltay - 1;
                                    }
                                    formationPositions[i] = anchorRoom.getPositionAt(newx, newy);

                                    // Check for blocked positions
                                    let posChar = formationPositions[i].look();
                                    for (let p in posChar) {
                                        if ((posChar[p].type == "structure" && posChar[p].structure != "road") || (posChar[p].type == "terrain" && posChar[p].terrain == "wall")) {
                                            blockedPositions.push(i);
                                        }
                                    }
                                }
                            }
                            break;

                        case BOTTOM:
                            for (let i = 0; i - blockedPositions.length < numberofCreeps; i++) {
                                if (i == 0) {
                                    // initial position
                                    formationPositions[0] = anchorPoint;
                                }
                                else {
                                    // build formation
                                    let tempPos, newx, newy;
                                    let deltax = formationPositions[i - 1].x - anchorPoint.x;
                                    let deltay = formationPositions[i - 1].y - anchorPoint.y;

                                    if (deltax == 0) {
                                        newx = anchorPoint.x - deltay + 1;
                                        newy = anchorPoint.y;
                                    }
                                    else if (deltax > 0) {
                                        newx = anchorPoint.x - deltax;
                                        newy = anchorPoint.y - deltay;
                                    }
                                    else if (deltax < 0) {
                                        newx = anchorPoint.x + Math.abs(deltax) - 1;
                                        newy = anchorPoint.y - deltay - 1;
                                    }
                                    formationPositions[i] = anchorRoom.getPositionAt(newx, newy);

                                    // Check for blocked positions
                                    let posChar = formationPositions[i].look();
                                    for (let p in posChar) {
                                        if ((posChar[p].type == "structure" && posChar[p].structure != "road") || (posChar[p].type == "terrain" && posChar[p].terrain == "wall")) {
                                            blockedPositions.push(i);
                                        }
                                    }
                                }
                            }
                            break;
                    }
                    break;
            }
        }
        else {
            // No vision to anchorpoint
            return false;
        }

        //remove blocked positions
        let returnPositions = [];

        for (let f in formationPositions) {
            if (blockedPositions.indexOf(parseInt(f)) == -1) {
                returnPositions.push(formationPositions[f]);
            }
        }

        return returnPositions;
    },

    moveToFormation (ArrayofCreeps, formationPositions) {
        // creeps = Array of creeps to be moved
        // formationPositions = output of this.getFormationPositions

        let creeps = _.sortBy(ArrayofCreeps, ['id']);
        let anchorRoom = Game.rooms[formationPositions[0].roomName];
        let positionCounter = 0;
        let activeCreeps = [];
        // Split creeps per room
        for (let c in creeps) {
            switch (creeps[c].room.name) {
                case anchorRoom.name:
                    if (creeps[c].pos.isEqualTo(formationPositions[positionCounter]) == false) {
                        // Creep not where it should be
                        this.goTo(creeps[c], formationPositions[positionCounter]);

                        // Mark formation with RoomVisual
                        switch (creeps[c].memory.role)
                        {
                            case "attacker":
                            case "archer":
                            case "einarr":
                                Game.rooms[formationPositions[positionCounter].roomName].visual.circle(formationPositions[positionCounter], {fill: 'transparent', radius: 0.35, stroke: 'red'});
                                break;

                            case "healer":
                                Game.rooms[formationPositions[positionCounter].roomName].visual.circle(formationPositions[positionCounter], {fill: 'transparent', radius: 0.35, stroke: 'green'});
                                break;
                        }
                    }
                    positionCounter++;
                    break;
                default:
                    this.goTo(creeps[c], formationPositions[0]);
                    break;
            }
        }
    }
};