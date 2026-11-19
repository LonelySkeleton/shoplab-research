
const consent = JSON.parse(
    sessionStorage.getItem("shoplab_consent") || "null"
);

if (!consent || consent.accepted !== true) {
    window.location.replace("index.html");
}

const form = document.getElementById("preferences-form");

const startTime = performance.now();

form.addEventListener("submit", function(event) {
    event.preventDefault();

    const preferences = {
        budget: Number(
            document.getElementById("budget").value
        ),
        battery: Number(
            document.getElementById("battery").value
        ),
        noise: Number(
            document.getElementById("noise").value
        ),
        weight: Number(
            document.getElementById("weight").value
        ),
        warranty: Number(
            document.getElementById("warranty").value
        ),
        responseTimeMs: Math.round(
            performance.now() - startTime
        )
    };

    sessionStorage.setItem(
        "shoplab_preferences",
        JSON.stringify(preferences)
    );

    const experiment = initializeExperiment();

    console.log(
        "Экспериментальная группа:",
        experiment.group
    );

    window.location.href = "catalog.html";
});
