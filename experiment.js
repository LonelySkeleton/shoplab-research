
const experimentalConditions = [
    { group: "G1", load: "low", pattern: "neutral" },
    { group: "G2", load: "low", pattern: "hidden_costs" },
    { group: "G3", load: "low", pattern: "visual_misdirection" },

    { group: "G4", load: "medium", pattern: "neutral" },
    { group: "G5", load: "medium", pattern: "hidden_costs" },
    { group: "G6", load: "medium", pattern: "visual_misdirection" },

    { group: "G7", load: "high", pattern: "neutral" },
    { group: "G8", load: "high", pattern: "hidden_costs" },
    { group: "G9", load: "high", pattern: "visual_misdirection" }
];

function createParticipantId() {
    return crypto.randomUUID();
}

function assignExperimentalCondition() {
    const randomIndex = Math.floor(
        Math.random() * experimentalConditions.length
    );

    return experimentalConditions[randomIndex];
}

function initializeExperiment() {
    const existing = sessionStorage.getItem(
        "shoplab_experiment"
    );

    if (existing) {
        return JSON.parse(existing);
    }

    const condition = assignExperimentalCondition();

    const experiment = {
        participantId: createParticipantId(),
        group: condition.group,
        cognitiveLoad: condition.load,
        darkPattern: condition.pattern,
        startedAt: new Date().toISOString()
    };

    sessionStorage.setItem(
        "shoplab_experiment",
        JSON.stringify(experiment)
    );

    return experiment;
}
