
const STORAGE_KEY = "shoplab_events";

function logEvent(eventType, details = {}) {
    const events = JSON.parse(
        sessionStorage.getItem(STORAGE_KEY) || "[]"
    );

    const experiment = JSON.parse(
        sessionStorage.getItem("shoplab_experiment") || "null"
    );

    events.push({
        participantId: experiment?.participantId || null,
        eventType: eventType,
        timestamp: new Date().toISOString(),
        elapsedMs: Math.round(performance.now()),
        details: details
    });

    sessionStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(events)
    );

    console.log("Событие:", eventType, details);
}

function getEvents() {
    return JSON.parse(
        sessionStorage.getItem(STORAGE_KEY) || "[]"
    );
}
