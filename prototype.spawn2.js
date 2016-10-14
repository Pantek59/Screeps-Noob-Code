module.exports = function() {

    StructureSpawn.prototype.getBodyInfo =
    function (roleName, energy) {
        var bodyInfo = {};
        bodyInfo.role = roleName;

        let rcl = this.room.controller.level;
        if (buildingPlans[roleName][rcl - 1].minEnergy > energy) {
            if (buildingPlans[roleName][rcl - 2].minEnergy > energy) {
                return null;
            }
            else {
                return buildingPlans[roleName][rcl - 2].body;
            }
        }
        else {
            return buildingPlans[roleName][rcl - 1].body;
        }
    },

    StructureSpawn.prototype.createCustomCreep = function (energyCapacity, roleName, spawnID) {
        //Check for boost
        var boost = undefined;
        for (let l in this.room.memory.boostList) {
            if (this.room.memory.boostList[l].role == roleName) {
                //Creep should get boost entry
                let boostEntry = this.room.memory.boostList[l];
                boost = boostEntry.mineralType;
                if (boostEntry.volume >= 0) {
                    boostEntry.volume--;
                    if (boostEntry.volume == 0) {
                        delBoost(this.room.name, l);
                    }
                    else {
                        this.room.memory.boostList[l] = boostEntry;
                    }
                }
            }
        }

        let body = this.getBodyInfo(roleName, this.room.energyAvailable);
        if (body != null) {
            return this.createCreep(body, undefined, {
                role: roleName,
                working: false,
                spawn: spawnID,
                jobQueueTask: undefined,
                homeroom: this.room.name,
                boost: boost
            });
        }
    }
};