module.exports = function() {

    StructureSpawn.prototype.getBodyInfo =
    function (roleName, energy) {
        var bodyInfo = {};
        bodyInfo.role = roleName;

        var buildingPlans = {
            miniharvester: [
                {
                    //Level 1 (max 300)
                    minEnergy: 200,
                    body: [MOVE, WORK, CARRY]
                },
                {
                    //Level 2 (max 550)
                    minEnergy: 200,
                    body: [MOVE, WORK, CARRY]
                },
                {
                    //Level 3 (max 800)
                    minEnergy: 200,
                    body: [MOVE, WORK, CARRY]
                },
                {
                    //Level 4 (max 1300)
                    minEnergy: 200,
                    body: [MOVE, WORK, CARRY]
                },
                {
                    //Level 5 (max 1800)
                    minEnergy: 200,
                    body: [MOVE, WORK, CARRY]
                },
                {
                    //Level 6 (max 2300)
                    minEnergy: 200,
                    body: [MOVE, WORK, CARRY]
                },
                {
                    //Level 7 (max 5600)
                    minEnergy: 200,
                    body: [MOVE, WORK, CARRY]
                },
                {
                    //Level 8 (max 12900)
                    minEnergy: 200,
                    body: [MOVE, WORK, CARRY]
                }],

            remoteHarvester: [
                {
                    //Level 1 (max 300)
                    minEnergy: 200,
                    body: [MOVE, WORK, CARRY]
                },
                {
                    //Level 2 (max 550)
                    minEnergy: 400,
                    body: [MOVE, MOVE, WORK, WORK, CARRY, CARRY]
                },
                {
                    //Level 3 (max 800)
                    minEnergy: 750,
                    body: [MOVE, MOVE, MOVE, MOVE, WORK, WORK, WORK, CARRY, CARRY, CARRY, CARRY, CARRY]
                },
                {
                    //Level 4 (max 1300)
                    minEnergy: 1250,
                    body: [MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, WORK, WORK, WORK, WORK, WORK, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY]
                },
                {
                    //Level 5 (max 1800)
                    minEnergy: 1800,
                    body: [MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, WORK, WORK, WORK, WORK, WORK, WORK, WORK, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY]
                },
                {
                    //Level 6 (max 2300)
                    minEnergy: 2050,
                    body: [MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY]
                },
                {
                    //Level 7 (max 5600)
                    minEnergy: 2050,
                    body: [MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY]
                },
                {
                    //Level 8 (max 12900)
                    minEnergy: 2050,
                    body: [MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY]
                }],

            harvester: [
                {
                    //Level 1 (max 300)
                    minEnergy: 200,
                    body: [MOVE, WORK, CARRY]
                },
                {
                    //Level 2 (max 550)
                    minEnergy: 350,
                    body: [MOVE, MOVE, WORK, WORK, CARRY]
                },
                {
                    //Level 3 (max 800)
                    minEnergy: 700,
                    body: [MOVE, MOVE, MOVE, MOVE, WORK, WORK, WORK, CARRY, CARRY, CARRY, CARRY]
                },
                {
                    //Level 4 (max 1300)
                    minEnergy: 1250,
                    body: [MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, WORK, WORK, WORK, WORK, WORK, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY]
                },
                {
                    //Level 5 (max 1800)
                    minEnergy: 1550,
                    body: [MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, WORK, WORK, WORK, WORK, WORK, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY]
                },
                {
                    //Level 6 (max 2300)
                    minEnergy: 1550,
                    body: [MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, WORK, WORK, WORK, WORK, WORK, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY]
                },
                {
                    //Level 7 (max 5600)
                    minEnergy: 1550,
                    body: [MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, WORK, WORK, WORK, WORK, WORK, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY]
                },
                {
                    //Level 8 (max 12900)
                    minEnergy: 1550,
                    body: [MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, WORK, WORK, WORK, WORK, WORK, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY]
                }],

            energyTransporter: [
                {
                    //Level 1 (max 300)
                    minEnergy: 250,
                    body: [MOVE, MOVE, CARRY, CARRY, CARRY]
                },
                {
                    //Level 2 (max 550)
                    minEnergy: 450,
                    body: [MOVE, MOVE, MOVE, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY]
                },
                {
                    //Level 3 (max 800)
                    minEnergy: 750,
                    body: [MOVE, MOVE, MOVE, MOVE, MOVE, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY]
                },
                {
                    //Level 4 (max 1300)
                    minEnergy: 1300,
                    body: [MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY]
                },
                {
                    //Level 5 (max 1800)
                    minEnergy: 1300,
                    body: [MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY]
                },
                {
                    //Level 6 (max 2300)
                    minEnergy: 1300,
                    body: [MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY]
                },
                {
                    //Level 7 (max 5600)
                    minEnergy: 1300,
                    body: [MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY]
                },
                {
                    //Level 8 (max 12900)
                    minEnergy: 1300,
                    body: [MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY]
                }],

            stationaryHarvester: [
                {
                    //Level 1 (max 300)
                    minEnergy: 300,
                    body: [MOVE, WORK, WORK, CARRY]
                },
                {
                    //Level 2 (max 550)
                    minEnergy: 550,
                    body: [MOVE, WORK, WORK, WORK, WORK, CARRY, CARRY]
                },
                {
                    //Level 3 (max 800)
                    minEnergy: 800,
                    body: [MOVE, MOVE, WORK, WORK, WORK, WORK, WORK, CARRY, CARRY, CARRY, CARRY]
                },
                {
                    //Level 4 (max 1300)
                    minEnergy: 950,
                    body: [MOVE, MOVE, MOVE, WORK, WORK, WORK, WORK, WORK, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY]
                },
                {
                    //Level 5 (max 1800)
                    minEnergy: 950,
                    body: [MOVE, MOVE, MOVE, WORK, WORK, WORK, WORK, WORK, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY]
                },
                {
                    //Level 6 (max 2300)
                    minEnergy: 950,
                    body: [MOVE, MOVE, MOVE, WORK, WORK, WORK, WORK, WORK, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY]
                },
                {
                    //Level 7 (max 5600)
                    minEnergy: 950,
                    body: [MOVE, MOVE, MOVE, WORK, WORK, WORK, WORK, WORK, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY]
                },
                {
                    //Level 8 (max 12900)
                    minEnergy: 950,
                    body: [MOVE, MOVE, MOVE, WORK, WORK, WORK, WORK, WORK, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY]
                }],

            upgrader: [
                {
                    //Level 1 (max 300)
                    minEnergy: 300,
                    body: [MOVE, WORK, WORK, CARRY]
                },
                {
                    //Level 2 (max 550)
                    minEnergy: 550,
                    body: [MOVE, MOVE, MOVE, WORK, WORK, CARRY, CARRY, CARRY, CARRY]
                },
                {
                    //Level 3 (max 800)
                    minEnergy: 800,
                    body: [MOVE, MOVE, MOVE, MOVE, WORK, WORK, WORK, WORK, CARRY, CARRY, CARRY, CARRY]
                },
                {
                    //Level 4 (max 1300)
                    minEnergy: 1250,
                    body: [MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, WORK, WORK, WORK, WORK, WORK, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY]
                },
                {
                    //Level 5 (max 1800)
                    minEnergy: 1650,
                    body: [MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, WORK, WORK, WORK, WORK, WORK, WORK, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY]
                },
                {
                    //Level 6 (max 2300)
                    minEnergy: 1650,
                    body: [MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, WORK, WORK, WORK, WORK, WORK, WORK, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY]
                },
                {
                    //Level 7 (max 5600)
                    minEnergy: 1650,
                    body: [MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, WORK, WORK, WORK, WORK, WORK, WORK, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY]
                },
                {
                    //Level 8 (max 12900)
                    minEnergy: 3250,
                    body: [MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY]
                }],

            repairer: [
                {
                    //Level 1 (max 300)
                    minEnergy: 200,
                    body: [MOVE, WORK, CARRY]
                },
                {
                    //Level 2 (max 550)
                    minEnergy: 550,
                    body: [MOVE, MOVE, MOVE, WORK, WORK, CARRY, CARRY, CARRY, CARRY]
                },
                {
                    //Level 3 (max 800)
                    minEnergy: 800,
                    body: [MOVE, MOVE, MOVE, MOVE, WORK, WORK, WORK, WORK, CARRY, CARRY, CARRY, CARRY]
                },
                {
                    //Level 4 (max 1300)
                    minEnergy: 1300,
                    body: [MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, WORK, WORK, WORK, WORK, WORK, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY]
                },
                {
                    //Level 5 (max 1800)
                    minEnergy: 1700,
                    body: [MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, WORK, WORK, WORK, WORK, WORK, WORK, WORK, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY]
                },
                {
                    //Level 6 (max 2300)
                    minEnergy: 1900,
                    body: [MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY]
                },
                {
                    //Level 7 (max 5600)
                    minEnergy: 1900,
                    body: [MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY]
                },
                {
                    //Level 8 (max 12900)
                    minEnergy: 1900,
                    body: [MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY]
                }],

            builder: [
                {
                    //Level 1 (max 300)
                    minEnergy: 200,
                    body: [MOVE, WORK, CARRY]
                },
                {
                    //Level 2 (max 550)
                    minEnergy: 550,
                    body: [MOVE, MOVE, MOVE, WORK, WORK, CARRY, CARRY, CARRY, CARRY]
                },
                {
                    //Level 3 (max 800)
                    minEnergy: 800,
                    body: [MOVE, MOVE, MOVE, MOVE, WORK, WORK, WORK, WORK, CARRY, CARRY, CARRY, CARRY]
                },
                {
                    //Level 4 (max 1300)
                    minEnergy: 1300,
                    body: [MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, WORK, WORK, WORK, WORK, WORK, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY]
                },
                {
                    //Level 5 (max 1800)
                    minEnergy: 1700,
                    body: [MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, WORK, WORK, WORK, WORK, WORK, WORK, WORK, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY]
                },
                {
                    //Level 6 (max 2300)
                    minEnergy: 1900,
                    body: [MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY]
                },
                {
                    //Level 7 (max 5600)
                    minEnergy: 1900,
                    body: [MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY]
                },
                {
                    //Level 8 (max 12900)
                    minEnergy: 1900,
                    body: [MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY]
                }],

            wallRepairer: [
                {
                    //Level 1 (max 300)
                    minEnergy: 300,
                    body: [MOVE, MOVE, WORK, CARRY, CARRY]
                },
                {
                    //Level 2 (max 550)
                    minEnergy: 550,
                    body: [MOVE, MOVE, MOVE, WORK, WORK, CARRY, CARRY, CARRY, CARRY]
                },
                {
                    //Level 3 (max 800)
                    minEnergy: 800,
                    body: [MOVE, MOVE, MOVE, MOVE, WORK, WORK, WORK, WORK, CARRY, CARRY, CARRY, CARRY]
                },
                {
                    //Level 4 (max 1300)
                    minEnergy: 1300,
                    body: [MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, WORK, WORK, WORK, WORK, WORK, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY]
                },
                {
                    //Level 5 (max 1800)
                    minEnergy: 1700,
                    body: [MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, WORK, WORK, WORK, WORK, WORK, WORK, WORK, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY]
                },
                {
                    //Level 6 (max 2300)
                    minEnergy: 1900,
                    body: [MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY]
                },
                {
                    //Level 7 (max 5600)
                    minEnergy: 1900,
                    body: [MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY]
                },
                {
                    //Level 8 (max 12900)
                    minEnergy: 1900,
                    body: [MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY]
                }],

            claimer: [
                {
                    //Level 1 (max 300)
                    minEnergy: 650,
                    body: [CLAIM, MOVE]
                },
                {
                    //Level 2 (max 550)
                    minEnergy: 650,
                    body: [CLAIM, MOVE]
                },
                {
                    //Level 3 (max 800)
                    minEnergy: 650,
                    body: [CLAIM, MOVE]
                },
                {
                    //Level 4 (max 1300)
                    minEnergy: 1300,
                    body: [CLAIM, CLAIM, MOVE, MOVE]
                },
                {
                    //Level 5 (max 1800)
                    minEnergy: 1300,
                    body: [CLAIM, CLAIM, MOVE, MOVE]
                },
                {
                    //Level 6 (max 2300)
                    minEnergy: 1300,
                    body: [CLAIM, CLAIM, MOVE, MOVE]
                },
                {
                    //Level 7 (max 5600)
                    minEnergy: 1300,
                    body: [CLAIM, CLAIM, MOVE, MOVE]
                },
                {
                    //Level 8 (max 12900)
                    minEnergy: 1300,
                    body: [CLAIM, CLAIM, MOVE, MOVE]
                }],

            bigClaimer: [
                {
                    //Level 1 (max 300)
                    minEnergy: 3250,
                    body: [CLAIM, CLAIM, CLAIM, CLAIM, CLAIM, MOVE, MOVE, MOVE, MOVE, MOVE]
                },
                {
                    //Level 2 (max 550)
                    minEnergy: 3250,
                    body: [CLAIM, CLAIM, CLAIM, CLAIM, CLAIM, MOVE, MOVE, MOVE, MOVE, MOVE]
                },
                {
                    //Level 3 (max 800)
                    minEnergy: 3250,
                    body: [CLAIM, CLAIM, CLAIM, CLAIM, CLAIM, MOVE, MOVE, MOVE, MOVE, MOVE]
                },
                {
                    //Level 4 (max 1300)
                    minEnergy: 3250,
                    body: [CLAIM, CLAIM, CLAIM, CLAIM, CLAIM, MOVE, MOVE, MOVE, MOVE, MOVE]
                },
                {
                    //Level 5 (max 1800)
                    minEnergy: 3250,
                    body: [CLAIM, CLAIM, CLAIM, CLAIM, CLAIM, MOVE, MOVE, MOVE, MOVE, MOVE]
                },
                {
                    //Level 6 (max 2300)
                    minEnergy: 3250,
                    body: [CLAIM, CLAIM, CLAIM, CLAIM, CLAIM, MOVE, MOVE, MOVE, MOVE, MOVE]
                },
                {
                    //Level 7 (max 5600)
                    minEnergy: 3250,
                    body: [CLAIM, CLAIM, CLAIM, CLAIM, CLAIM, MOVE, MOVE, MOVE, MOVE, MOVE]
                },
                {
                    //Level 8 (max 12900)
                    minEnergy: 3250,
                    body: [CLAIM, CLAIM, CLAIM, CLAIM, CLAIM, MOVE, MOVE, MOVE, MOVE, MOVE]
                }],

            protector: [
                {
                    //Level 1 (max 300)
                    minEnergy: 260,
                    body: [MOVE, MOVE, ATTACK, ATTACK]
                },
                {
                    //Level 2 (max 550)
                    minEnergy: 520,
                    body: [MOVE, MOVE, MOVE, MOVE, ATTACK, ATTACK, ATTACK, ATTACK]
                },
                {
                    //Level 3 (max 800)
                    minEnergy: 780,
                    body: [MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK]
                },
                {
                    //Level 4 (max 1300)
                    minEnergy: 1300,
                    body: [MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK]
                },
                {
                    //Level 5 (max 1800)
                    minEnergy: 1690,
                    body: [MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK]
                },
                {
                    //Level 6 (max 2300)
                    minEnergy: 1950,
                    body: [MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK]
                },
                {
                    //Level 7 (max 5600)
                    minEnergy: 1950,
                    body: [MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK]
                },
                {
                    //Level 8 (max 12900)
                    minEnergy: 1950,
                    body: [MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK]
                }],

            miner: [
                {
                    //Level 1 (max 300)
                    minEnergy: 2200,
                    body: [MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY]
                },
                {
                    //Level 2 (max 550)
                    minEnergy: 2200,
                    body: [MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY]
                },
                {
                    //Level 3 (max 800)
                    minEnergy: 2200,
                    body: [MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY]
                },
                {
                    //Level 4 (max 1300)
                    minEnergy: 2200,
                    body: [MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY]
                },
                {
                    //Level 5 (max 1800)
                    minEnergy: 2200,
                    body: [MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY]
                },
                {
                    //Level 6 (max 2300)
                    minEnergy: 2200,
                    body: [MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY]
                },
                {
                    //Level 7 (max 5600)
                    minEnergy: 3300,
                    body: [MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY]
                },
                {
                    //Level 8 (max 12900)
                    minEnergy: 3300,
                    body: [MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY]
                }],

            distributor: [
                {
                    //Level 1 (max 300)
                    minEnergy: 300,
                    body: [MOVE, MOVE, CARRY, CARRY, CARRY, CARRY]
                },
                {
                    //Level 2 (max 550)
                    minEnergy: 450,
                    body: [MOVE, MOVE, MOVE, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY]
                },
                {
                    //Level 3 (max 800)
                    minEnergy: 750,
                    body: [MOVE, MOVE, MOVE, MOVE, MOVE, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY]
                },
                {
                    //Level 4 (max 1300)
                    minEnergy: 1200,
                    body: [MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY]
                },
                {
                    //Level 5 (max 1800)
                    minEnergy: 1200,
                    body: [MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY]
                },
                {
                    //Level 6 (max 2300)
                    minEnergy: 1200,
                    body: [MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY]
                },
                {
                    //Level 7 (max 5600)
                    minEnergy: 1500,
                    body: [MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY]
                },
                {
                    //Level 8 (max 12900)
                    minEnergy: 1500,
                    body: [MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY]
                }],

            scientist: [
                {
                    //Level 1 (max 300)
                    minEnergy: 300,
                    body: [MOVE, MOVE, CARRY, CARRY, CARRY, CARRY]
                },
                {
                    //Level 2 (max 550)
                    minEnergy: 450,
                    body: [MOVE, MOVE, MOVE, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY]
                },
                {
                    //Level 3 (max 800)
                    minEnergy: 750,
                    body: [MOVE, MOVE, MOVE, MOVE, MOVE, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY]
                },
                {
                    //Level 4 (max 1300)
                    minEnergy: 750,
                    body: [MOVE, MOVE, MOVE, MOVE, MOVE, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY]
                },
                {
                    //Level 5 (max 1800)
                    minEnergy: 750,
                    body: [MOVE, MOVE, MOVE, MOVE, MOVE, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY]
                },
                {
                    //Level 6 (max 2300)
                    minEnergy: 750,
                    body: [MOVE, MOVE, MOVE, MOVE, MOVE, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY]
                },
                {
                    //Level 7 (max 5600)
                    minEnergy: 750,
                    body: [MOVE, MOVE, MOVE, MOVE, MOVE, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY]
                },
                {
                    //Level 8 (max 12900)
                    minEnergy: 750,
                    body: [MOVE, MOVE, MOVE, MOVE, MOVE, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY]
                }],

            demolisher: [
                {
                    //Level 1 (max 300)
                    minEnergy: 250,
                    body: [MOVE, MOVE, WORK, CARRY]
                },
                {
                    //Level 2 (max 550)
                    minEnergy: 500,
                    body: [MOVE, MOVE, MOVE, MOVE, WORK, WORK, CARRY, CARRY]
                },
                {
                    //Level 3 (max 800)
                    minEnergy: 800,
                    body: [MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, WORK, WORK, CARRY, CARRY, CARRY, CARRY, CARRY]
                },
                {
                    //Level 4 (max 1300)
                    minEnergy: 1150,
                    body: [MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, WORK, WORK, WORK, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY]
                },
                {
                    //Level 5 (max 1800)
                    minEnergy: 1400,
                    body: [MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, WORK, WORK, WORK, WORK, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY]
                },
                {
                    //Level 6 (max 2300)
                    minEnergy: 1400,
                    body: [MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, WORK, WORK, WORK, WORK, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY]
                },
                {
                    //Level 7 (max 5600)
                    minEnergy: 1400,
                    body: [MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, WORK, WORK, WORK, WORK, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY]
                },
                {
                    //Level 8 (max 12900)
                    minEnergy: 1400,
                    body: [MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, WORK, WORK, WORK, WORK, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY]
                }],

            remoteStationaryHarvester: [
                {
                    //Level 1 (max 300)
                    minEnergy: 300,
                    body: [MOVE, WORK, WORK, CARRY]
                },
                {
                    //Level 2 (max 550)
                    minEnergy: 550,
                    body: [MOVE, MOVE, WORK, WORK, WORK, WORK, CARRY]
                },
                {
                    //Level 3 (max 800)
                    minEnergy: 700,
                    body: [MOVE, MOVE, MOVE, WORK, WORK, WORK, WORK, WORK, CARRY]
                },
                {
                    //Level 4 (max 1300)
                    minEnergy: 700,
                    body: [MOVE, MOVE, MOVE, WORK, WORK, WORK, WORK, WORK, CARRY]
                },
                {
                    //Level 5 (max 1800)
                    minEnergy: 700,
                    body: [MOVE, MOVE, MOVE, WORK, WORK, WORK, WORK, WORK, CARRY]
                },
                {
                    //Level 6 (max 2300)
                    minEnergy: 700,
                    body: [MOVE, MOVE, MOVE, WORK, WORK, WORK, WORK, WORK, CARRY]
                },
                {
                    //Level 7 (max 5600)
                    minEnergy: 700,
                    body: [MOVE, MOVE, MOVE, WORK, WORK, WORK, WORK, WORK, CARRY]
                },
                {
                    //Level 8 (max 12900)
                    minEnergy: 700,
                    body: [MOVE, MOVE, MOVE, WORK, WORK, WORK, WORK, WORK, CARRY]
                }],

            energyHauler: [
                {
                    //Level 1 (max 300)
                    minEnergy: 300,
                    body: [MOVE, MOVE, WORK, CARRY, CARRY]
                },
                {
                    //Level 2 (max 550)
                    minEnergy: 500,
                    body: [MOVE, MOVE, MOVE, WORK, CARRY, CARRY, CARRY, CARRY, CARRY]
                },
                {
                    //Level 3 (max 800)
                    minEnergy: 800,
                    body: [MOVE, MOVE, MOVE, MOVE, MOVE, WORK, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY]
                },
                {
                    //Level 4 (max 1300)
                    minEnergy: 1250,
                    body: [MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, WORK, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY]
                },
                {
                    //Level 5 (max 1800)
                    minEnergy: 1350,
                    body: [MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, WORK, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY]
                },
                {
                    //Level 6 (max 2300)
                    minEnergy: 1350,
                    body: [MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, WORK, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY]
                },
                {
                    //Level 7 (max 5600)
                    minEnergy: 1350,
                    body: [MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, WORK, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY]
                },
                {
                    //Level 8 (max 12900)
                    minEnergy: 1350,
                    body: [MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, WORK, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY]
                }],

            transporter: [
                {
                    //Level 1 (max 300)
                    minEnergy: 300,
                    body: [MOVE, MOVE, MOVE, CARRY, CARRY, CARRY]
                },
                {
                    //Level 2 (max 550)
                    minEnergy: 500,
                    body: [MOVE, MOVE, MOVE, MOVE, MOVE, CARRY, CARRY, CARRY, CARRY, CARRY]
                },
                {
                    //Level 3 (max 800)
                    minEnergy: 800,
                    body: [MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY]
                },
                {
                    //Level 4 (max 1300)
                    minEnergy: 1300,
                    body: [MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY]
                },
                {
                    //Level 5 (max 1800)
                    minEnergy: 1350,
                    body: [MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY]
                },
                {
                    //Level 6 (max 2300)
                    minEnergy: 2300,
                    body: [MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY]
                },
                {
                    //Level 7 (max 5600)
                    minEnergy: 2500,
                    body: [MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY]
                },
                {
                    //Level 8 (max 12900)
                    minEnergy: 2500,
                    body: [MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY]
                }],

            attacker: [
                {
                    //Level 1 (max 300)
                    minEnergy: 260,
                    body: [MOVE, MOVE, ATTACK, ATTACK]
                },
                {
                    //Level 2 (max 550)
                    minEnergy: 390,
                    body: [MOVE, MOVE, MOVE, ATTACK, ATTACK, ATTACK]
                },
                {
                    //Level 3 (max 800)
                    minEnergy: 800,
                    body: [MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK]
                },
                {
                    //Level 4 (max 1300)
                    minEnergy: 1300,
                    body: [MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK]
                },
                {
                    //Level 5 (max 1750)
                    minEnergy: 1350,
                    body: [TOUGH, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK]
                },
                {
                    //Level 6 (max 2300)
                    minEnergy: 2270,
                    body: [TOUGH, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK]
                },
                {
                    //Level 7 (max 5600)
                    minEnergy: 3040,
                    body: [TOUGH, TOUGH, TOUGH, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK]
                },
                {
                    //Level 8 (max 12900)
                    minEnergy: 3040,
                    body: [TOUGH, TOUGH, TOUGH, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK]
                }],

            healer: [
                {
                    //Level 1 (max 300)
                    minEnergy: 300,
                    body: [MOVE, HEAL]
                },
                {
                    //Level 2 (max 550)
                    minEnergy: 300,
                    body: [MOVE, HEAL]
                },
                {
                    //Level 3 (max 800)
                    minEnergy: 600,
                    body: [MOVE, MOVE, HEAL, HEAL]
                },
                {
                    //Level 4 (max 1300)
                    minEnergy: 1300,
                    body: [MOVE, MOVE, MOVE, MOVE, HEAL, HEAL, HEAL, HEAL]
                },
                {
                    //Level 5 (max 1750)
                    minEnergy: 1500,
                    body: [MOVE, MOVE, MOVE, MOVE, MOVE, HEAL, HEAL, HEAL, HEAL, HEAL]
                },
                {
                    //Level 6 (max 2100)
                    minEnergy: 2270,
                    body: [MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, HEAL, HEAL, HEAL, HEAL, HEAL, HEAL, HEAL]
                },
                {
                    //Level 7 (max 5600)
                    minEnergy: 5400,
                    body: [MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, HEAL, HEAL, HEAL, HEAL, HEAL, HEAL, HEAL, HEAL, HEAL, HEAL, HEAL, HEAL, HEAL, HEAL, HEAL, HEAL, HEAL, HEAL]
                },
                {
                    //Level 8 (max 12900)
                    minEnergy: 7500,
                    body: [MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, HEAL, HEAL, HEAL, HEAL, HEAL, HEAL, HEAL, HEAL, HEAL, HEAL, HEAL, HEAL, HEAL, HEAL, HEAL, HEAL, HEAL, HEAL, HEAL, HEAL, HEAL, HEAL, HEAL, HEAL, HEAL]
                }],

            einarr: [
                {
                    //Level 1 (max 300)
                    minEnergy: 260,
                    body: [MOVE, MOVE, ATTACK, ATTACK]
                },
                {
                    //Level 2 (max 550)
                    minEnergy: 490,
                    body: [TOUGH, MOVE, MOVE, MOVE, ATTACK, HEAL]
                },
                {
                    //Level 3 (max 800)
                    minEnergy: 790,
                    body: [TOUGH, MOVE, MOVE, MOVE, MOVE, ATTACK, HEAL, HEAL]
                },
                {
                    //Level 4 (max 1300)
                    minEnergy: 1290,
                    body: [MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, ATTACK, ATTACK, ATTACK, HEAL, HEAL, HEAL]
                },
                {
                    //Level 5 (max 1750)
                    minEnergy: 1500,
                    body: [MOVE, MOVE, MOVE, MOVE, MOVE, HEAL, HEAL, HEAL, HEAL, HEAL]
                },
                {
                    //Level 6 (max 2100)
                    minEnergy: 1910,
                    body: [TOUGH, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, HEAL, HEAL, HEAL, HEAL]
                },
                {
                    //Level 7 (max 5600)
                    minEnergy: 5220,
                    body: [TOUGH, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, HEAL, HEAL, HEAL, HEAL, HEAL, HEAL, HEAL, HEAL, HEAL, HEAL, HEAL, HEAL]
                },
                {
                    //Level 8 (max 12900)
                    minEnergy: 5220,
                    body: [TOUGH, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, HEAL, HEAL, HEAL, HEAL, HEAL, HEAL, HEAL, HEAL, HEAL, HEAL, HEAL, HEAL]
                }]
        };

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