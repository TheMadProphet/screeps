function buildRoadAtPositions(room, positions) {
    _.forEach(positions, pos => {
        const terrain = room.lookForAt(LOOK_TERRAIN, pos.x, pos.y)[0];

        if (terrain !== "wall") {
            room.createConstructionSite(pos.x, pos.y, STRUCTURE_ROAD);
        }
    });
}

function getPositionsAround(position, length) {
    const result = [];
    let y = position.y - length;
    while (y <= position.y + length) {
        const deltaX = Math.abs(position.y - y) - length;
        if (deltaX === 0) {
            result.push({y, x: position.x});
        } else {
            result.push({y, x: position.x - deltaX}, {y, x: position.x + deltaX});
        }

        y++;
    }

    return result;
}

function positionIsNotOccupied(pos, room) {
    const lookObjects = room.lookAt(pos);
    for (const i in lookObjects) {
        const lookObject = lookObjects[i];
        if (lookObject.type === LOOK_STRUCTURES || lookObject.type === LOOK_CONSTRUCTION_SITES) {
            return false;
        }
    }

    return true;
}

function energySourceIsNotNear(pos, room) {
    const area = room.lookAtArea(pos.y - 1, pos.x - 1, pos.y + 1, pos.x + 1);
    for (const y in area) {
        for (const x in area[y]) {
            const objects = area[y][x];
            for (const i in objects) {
                const object = objects[i];

                if (object.type === LOOK_SOURCES) {
                    return false;
                }
            }
        }
    }

    return true;
}

function canBuildExtensionAt(pos, room) {
    return positionIsNotOccupied(pos, room) && energySourceIsNotNear(pos, room);
}

/**
 * @param {RoomPosition} start
 * @param {RoomPosition} end
 */
function extraCreepCountForDistance(start, end) {
    const distance = start.findPathTo(end).length;

    return Math.trunc(distance / 15);
}

function getSpaceAroundSource(source) {
    const room = source.room;
    const pos = source.pos;

    let space = 0;
    const area = room.lookAtArea(pos.y - 1, pos.x - 1, pos.y + 1, pos.x + 1);
    for (const y in area) {
        for (const x in area[y]) {
            const objects = area[y][x];
            for (const i in objects) {
                const object = objects[i];
                if (object.type === LOOK_TERRAIN && object.terrain !== "wall") {
                    space++;
                }
            }
        }
    }

    return space;
}

/** @param {Source} source */
function buildRoadAroundSource(source) {
    const room = source.room;
    const pos = source.pos;

    const area = room.lookAtArea(pos.y - 1, pos.x - 1, pos.y + 1, pos.x + 1);
    for (const y in area) {
        for (const x in area[y]) {
            const objects = area[y][x];
            for (const i in objects) {
                const object = objects[i];
                if (object.type === LOOK_TERRAIN && object.terrain !== "wall") {
                    room.createConstructionSite(room.getPositionAt(x, y), STRUCTURE_ROAD);
                }
            }
        }
    }
}

function buildRoadForSource(spawn, source) {
    console.log("building road for", source.id);
    buildRoadAroundSource(source);
    source.room.buildBiDirectionalRoad(spawn.pos, source.pos);
    console.log("built road for", source.id);
}

/**
 * @param {StructureSpawn} spawn
 * @param {Source} source
 */
function buildSourceInfrastructure(spawn, source) {
    const roomMemory = spawn.room.memory;
    if (!roomMemory.sources[source.id]) roomMemory.sources[source.id] = {};
    const sourceMemory = roomMemory.sources[source.id];

    if (!sourceMemory.hasRoad) {
        buildRoadForSource(spawn, source);
        roomMemory.sources[source.id].hasRoad = true;
    }

    if (!sourceMemory.maxWorkerCount) {
        const spaceAroundSource = getSpaceAroundSource(source);

        let maxWorkerCount = 1 + extraCreepCountForDistance(spawn.pos, source.pos);
        if (spaceAroundSource > 2) {
            maxWorkerCount += 2;
        }

        roomMemory.sources[source.id].maxWorkerCount = maxWorkerCount;
    }
}

function buildEnergyInfrastructure(room) {
    if (_.size(room.memory.sources) !== _.size(room.rawSources)) {
        if (!room.memory.sources) {
            room.memory.sources = {};
        }

        let source;
        if (_.size(room.memory.sources) === 0) {
            source = room.spawn.pos.findClosestByPath(FIND_SOURCES, {
                filter: source => getSpaceAroundSource(source) > 0
            });
        } else if (_.size(room.memory.sources) === 1) {
            source = room.spawn.pos.findClosestByPath(FIND_SOURCES, {
                filter: source => source.id !== _.findLastKey(room.memory.sources) && getSpaceAroundSource(source) > 0
            });
        } else {
            _.forEach(room.memory.sources, (it, sourceId) => {
                if (!it.hasRoad || !it.maxWorkerCount) {
                    source = Game.getObjectById(sourceId);
                }
            });
        }

        if (source) {
            buildSourceInfrastructure(room.spawn, source);
        }
    }
}

function buildControllerInfrastructure(room) {
    if (!room.memory.hasRoadToController && room.controller.level >= 2) {
        room.buildRoad(room.spawn.pos, room.controller.pos);
        room.memory.hasRoadToController = true;
    }
}

function buildSpawnInfrastructure(room) {
    if (!room.memory.hasRoadAroundSpawn && room.controller.level >= 2) {
        const positions = getPositionsAround(room.spawn.pos, 1);
        positions.push(...getPositionsAround(room.spawn.pos, 2));
        buildRoadAtPositions(room, positions);

        room.memory.hasRoadAroundSpawn = true;
    }
}

function buildExtensions(room) {
    if (!room.memory.ringsize) room.memory.ringsize = 3;

    const positions = getPositionsAround(room.spawn.pos, room.memory.ringsize);
    let constructionStarted = false;
    for (const i in positions) {
        const pos = room.getPositionAt(positions[i].x, positions[i].y);
        if (canBuildExtensionAt(pos, room)) {
            const constructionStatus = room.createConstructionSite(pos.x, pos.y, STRUCTURE_EXTENSION);

            if (constructionStatus === OK) {
                constructionStarted = true;
                break;
            }
        }
    }

    if (!constructionStarted) {
        buildRoadAtPositions(room, getPositionsAround(room.spawn.pos, room.memory.ringsize + 1));
        room.memory.ringsize += 2;
    }
}

const constructor = {
    /** @param {Room} room **/
    buildInfrastructure: function (room) {
        buildEnergyInfrastructure(room);
        buildControllerInfrastructure(room);
        buildSpawnInfrastructure(room);
    },
    /** @param {Room} room **/
    buildStructures: function (room) {
        if (!room.isConstructionSiteAvailable()) {
            if (room.availableExtension > 0) {
                buildExtensions(room);
            }
        }
    }
};

module.exports = constructor;
