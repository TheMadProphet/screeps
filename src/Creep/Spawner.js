const findCreepsByRole = role => {
    return _.filter(Game.creeps, creep => creep.memory.role === role);
};

const spawnCreeps = (spawn, creepType) => {
    const activeCreepCount = findCreepsByRole(creepType.role).length;
    if (activeCreepCount < creepType.amount) {
        const spawnStatus = spawn.customSpawn(creepType.body, {role: creepType.role});

        if (spawnStatus === ERR_NOT_ENOUGH_ENERGY) {
            return false;
        }
    }

    return true;
};

const autoSpawn = (spawn, spawnConfig) => {
    let hasEnoughEnergy = true;
    for (const i in spawnConfig) {
        const creepType = spawnConfig[i];
        hasEnoughEnergy &= spawnCreeps(spawn, creepType);
    }

    spawn.memory.hasEnoughEnergy = hasEnoughEnergy; // todo
};

StructureSpawn.prototype.customSpawn = function (body, memory) {
    const spawnPoint = Game.flags["SpawnPoint"];
    let directions = undefined;
    if (spawnPoint) directions = this.pos.findPathTo(Game.flags["SpawnPoint"].pos);

    return this.spawnCreep(body, `${memory.role}[${body.length}](${Game.time})`, {
        memory,
        directions
    });
};

const spawnConfigurations = {
    1: {
        default: [
            {role: "builder", body: [WORK, CARRY, MOVE], amount: 3},
            {role: "upgrader", body: [WORK, CARRY, MOVE], amount: 1}
        ]
    },
    2: {
        default: [
            {role: "builder", body: [WORK, CARRY, MOVE], amount: 3},
            {role: "upgrader", body: [WORK, CARRY, MOVE], amount: 2}
        ],
        max: [
            {role: "handyman", body: [WORK, WORK, WORK, CARRY, CARRY, MOVE, MOVE, MOVE], amount: 1},
            {role: "builder", body: [WORK, WORK, WORK, CARRY, MOVE, MOVE], amount: 3},
            {role: "upgrader", body: [WORK, WORK, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE], amount: 5}
        ]
    },
    3: {
        default: [
            {role: "handyman", body: [WORK, WORK, WORK, CARRY, CARRY, MOVE, MOVE, MOVE], amount: 1},
            {role: "builder", body: [WORK, WORK, WORK, CARRY, CARRY, CARRY, MOVE, MOVE], amount: 3},
            {role: "upgrader", body: [WORK, WORK, WORK, CARRY, CARRY, MOVE, MOVE], amount: 3} // todo a tad bit pricy
        ],
        max: [
            {role: "handyman", body: [WORK, WORK, WORK, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE], amount: 1},
            {
                role: "builder",
                body: [WORK, WORK, WORK, WORK, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE, MOVE],
                amount: 3
            },
            {
                role: "upgrader",
                body: [WORK, WORK, WORK, WORK, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE, MOVE],
                amount: 5
            }
        ]
    },
    4: {
        default: [
            {role: "handyman", body: [WORK, WORK, WORK, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE], amount: 1},
            {
                role: "builder",
                body: [WORK, WORK, WORK, WORK, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE, MOVE],
                amount: 3
            },
            {
                role: "upgrader",
                body: [WORK, WORK, WORK, WORK, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE, MOVE],
                amount: 5
            }
        ],
        max: [
            {role: "handyman", body: [WORK, WORK, WORK, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE], amount: 1},
            {
                role: "builder",
                body: [WORK, WORK, WORK, WORK, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE, MOVE],
                amount: 3
            },
            {
                role: "upgrader",
                body: [WORK, WORK, WORK, WORK, WORK, WORK, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE],
                amount: 5
            }
        ]
    }
};

const harvesterBodies = {
    1: {
        default: [WORK, CARRY, MOVE]
    },
    2: {
        default: [WORK, CARRY, MOVE],
        max: [WORK, WORK, WORK, CARRY, CARRY, MOVE, MOVE, MOVE]
    },
    3: {
        default: [WORK, WORK, WORK, CARRY, CARRY, MOVE, MOVE, MOVE],
        max: [WORK, WORK, WORK, WORK, WORK, WORK, CARRY, CARRY, MOVE, MOVE]
    },
    4: {
        default: [WORK, WORK, WORK, WORK, WORK, WORK, CARRY, CARRY, MOVE, MOVE],
        max: [WORK, WORK, WORK, WORK, WORK, WORK, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE]
    }
};

/** @param {StructureSpawn} spawn */
function spawnHarvesters(spawn) {
    const isRoomMaxed = !spawn.room.hasAvailableExtensions();
    const sources = spawn.room.memory.sources;

    _.forEach(sources, source => {
        source.assignedWorkers = [];
    });

    for (const name in Memory.creeps) {
        const creep = Game.creeps[name];
        if (creep.memory.role === "harvester") {
            const assignedSource = creep.memory.assignedSource;

            if (assignedSource && sources[assignedSource]) {
                sources[assignedSource].assignedWorkers.push(creep);
            }
        }
    }

    _.forEach(sources, (source, sourceId) => {
        const workerCount = source.assignedWorkers.length;
        const space = source.spaceAround;

        const hasSpaceAndNoWorker = space > 0 && workerCount === 0;
        const hasNotEnoughWorkers = space >= 2 && workerCount < 3;
        if (hasSpaceAndNoWorker || hasNotEnoughWorkers) {
            let body = harvesterBodies[spawn.room.controller.level].default;
            if (isRoomMaxed && harvesterBodies[spawn.room.controller.level].max)
                body = harvesterBodies[spawn.room.controller.level].max;

            const spawnStatus = spawn.customSpawn(body, {role: "harvester", assignedSource: sourceId});

            if (spawnStatus === ERR_NOT_ENOUGH_ENERGY) {
                spawn.memory.hasEnoughEnergy = false;
            }
        }
    });
}

const spawner = {
    /** @param {StructureSpawn} spawn **/
    automate: function (spawn) {
        for (const name in Memory.creeps) {
            if (!Game.creeps[name]) {
                delete Memory.creeps[name];
                console.log("Clearing non-existing creep memory:", name);
            }
        }

        if (!spawn.memory.hasEnoughEnergy) {
            spawn.room.visual.text(`🪫`, spawn.pos.x, spawn.pos.y - 1);
        }

        if (spawn.spawning) {
            spawn.room.visual.text(`🛠 ${spawn.spawning.name}`, spawn.pos.x + 1, spawn.pos.y, {align: "left"});
        } else {
            let config = spawnConfigurations[spawn.room.controller.level].default;
            if (!spawn.room.hasAvailableExtensions() && spawnConfigurations[spawn.room.controller.level].max) {
                config = spawnConfigurations[spawn.room.controller.level].max;
            }

            autoSpawn(spawn, config);

            spawnHarvesters(spawn);
        }
    }
};

module.exports = spawner;
