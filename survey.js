
const surveyForm = document.getElementById("survey-form");

const existingResult = JSON.parse(
    sessionStorage.getItem("shoplab_result") || "null"
);

const consent = JSON.parse(
    sessionStorage.getItem("shoplab_consent") || "null"
);

if (!consent || consent.accepted !== true) {
    window.location.replace("index.html");
} else if (!existingResult) {
    window.location.replace("catalog.html");
}

let completedData = JSON.parse(
    sessionStorage.getItem("shoplab_complete") || "null"
);


if (
    completedData &&
    sessionStorage.getItem(
        "shoplab_upload_status"
    ) === "saved"
) {
    surveyForm.classList.add("hidden");

    document.getElementById("finish")
        .classList.remove("hidden");

    document.getElementById("survey-intro")
        .classList.add("hidden");

    const statusMessage =
        document.getElementById(
            "save-status-message"
        );

    if (statusMessage) {
        statusMessage.textContent =
            "Результаты уже были успешно сохранены.";
    }
}


function downloadResults(data) {
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob(
        [json],
        { type: "application/json;charset=utf-8" }
    );

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "shoplab_" +
        data.experiment.participantId
            .replace(/[^a-zA-Z0-9-]/g, "") +
        ".json";

    document.body.appendChild(link);
    link.click();
    link.remove();

    setTimeout(() => URL.revokeObjectURL(url), 1000);
}

surveyForm.addEventListener("submit", async function(event) {
    event.preventDefault();

    const submitButton = surveyForm.querySelector(
        'button[type="submit"]'
    );

    submitButton.disabled = true;
    submitButton.textContent = "Сохранение...";
    if (completedData) {
        await submitCompletedResults();
        return;
}
    const survey = {
        difficulty: Number(
            document.getElementById("difficulty").value
        ),
        confidence: Number(
            document.getElementById("confidence").value
        ),
        noticed: document.getElementById("noticed").value,
        noticedDescription: document.getElementById(
            "noticed-description"
        ).value.trim(),
        recalledFinalPrice:
            document.getElementById("price-awareness").value === ""
                ? null
                : Number(
                    document.getElementById(
                        "price-awareness"
                    ).value
                ),
        perceivedPressure: Number(
            document.getElementById("pressure").value
        )
    };

    const alreadyCompleted = getEvents().some(
        event => event.eventType === "survey_completed"
    );

    if (!alreadyCompleted) {
        logEvent("survey_completed");
    }   

    const experiment = JSON.parse(
        sessionStorage.getItem("shoplab_experiment")
    );

    const preferences = JSON.parse(
        sessionStorage.getItem("shoplab_preferences")
    );

    const choice = JSON.parse(
        sessionStorage.getItem("shoplab_result")
    );

    const events = getEvents();

    const catalogOpened = events.find(
        e => e.eventType === "catalog_opened"
    );

    const choiceConfirmed = events.find(
        e => e.eventType === "choice_confirmed"
    );

    const selections = events.filter(
        e => e.eventType === "product_selected"
    );

    const resets = events.filter(
        e => e.eventType === "selection_reset"
    );


    const cartAdditions = events.filter(
        e => e.eventType === "cart_item_added"
    );

    const cartRemovals = events.filter(
        e => e.eventType === "cart_item_removed"
    );

    const cartVisits = events.filter(
        e => e.eventType === "cart_opened"
    );

    const returnsToCatalog = events.filter(
        e => e.eventType === "returned_to_catalog"
    );

    const cartComparisons = events.filter(
        e => e.eventType === "cart_product_compared"
    );

    const firstCartOpened = cartVisits[0] || null;

    const cartToConfirmationMs =
        firstCartOpened && choiceConfirmed
            ? new Date(choiceConfirmed.timestamp).getTime() -
            new Date(firstCartOpened.timestamp).getTime()
            : null;

    const uniqueProductsAdded = [
        ...new Set(
            cartAdditions.map(
                e => e.details.productId
            )
        )
    ];

    const firstComparedProduct =
        cartComparisons[0]?.details.productId || null;


    const decisionTimeMs =
        catalogOpened && choiceConfirmed
            ? new Date(choiceConfirmed.timestamp).getTime() -
              new Date(catalogOpened.timestamp).getTime()
            : null;
    
    const choiceAlignment = calculateChoiceAlignment(
        preferences,
        choice.selectedProduct
    );


    completedData = {
        consent,
        experiment,
        preferences,
        choice,
        survey,        
        choiceAlignment,
        behavioralMeasures: {
            decisionTimeMs,

            firstSelectedProduct:
                selections[0]?.details.productId || null,

            numberOfSelections: selections.length,

            numberOfResets: resets.length,

            numberOfCartAdditions: cartAdditions.length,

            numberOfCartRemovals: cartRemovals.length,

            numberOfCartVisits: cartVisits.length,

            numberOfReturnsToCatalog:
                returnsToCatalog.length,

            numberOfCartComparisons:
                cartComparisons.length,

            numberOfUniqueProductsAdded:
                uniqueProductsAdded.length,

            uniqueProductsAdded,

            firstComparedProduct,

            cartToConfirmationMs,

            changedInitialCartSelection:
                firstComparedProduct === null
                    ? null
                    : firstComparedProduct !==
                    choice.selectedProduct,
            
            changedFirstAddedProduct:
                selections.length === 0
                    ? null
                    : selections[0].details.productId !==
                    choice.selectedProduct,

            recalledPriceCorrect:
                survey.recalledFinalPrice === null
                    ? null
                    : survey.recalledFinalPrice ===
                    choice.finalPrice
        },


        events,
        completedAt: new Date().toISOString()
    };

    sessionStorage.setItem(
        "shoplab_complete",
        JSON.stringify(completedData)
    );

    const finish = document.getElementById("finish");

    
    await submitCompletedResults();

});


async function submitCompletedResults() {
    const finish = document.getElementById("finish");

    const submitButton = surveyForm.querySelector(
        'button[type="submit"]'
    );

    submitButton.disabled = true;
    submitButton.textContent = "Сохранение...";

    try {
        await saveToDatabase(completedData);

        sessionStorage.setItem(
            "shoplab_upload_status",
            "saved"
        );

        surveyForm.classList.add("hidden");
        finish.classList.remove("hidden");

        document.getElementById("survey-intro")
            .classList.add("hidden");

        const statusMessage =
            document.getElementById(
                "save-status-message"
            );

        if (statusMessage) {
            statusMessage.textContent =
                "Результаты успешно отправлены " +
                "в исследовательскую базу данных.";
        }

    } catch (error) {
        console.error("Ошибка сохранения:", error);

        sessionStorage.setItem(
            "shoplab_upload_status",
            "failed"
        );

        alert(
            "Не удалось подтвердить сохранение " +
            "результатов. Будет скачана " +
            "резервная копия."
        );

        downloadResults(completedData);

        submitButton.disabled = false;
        submitButton.textContent =
            "Повторить отправку результатов";
    }
}


document.getElementById("download-again")
    .addEventListener("click", function() {
        const data = completedData || JSON.parse(
            sessionStorage.getItem("shoplab_complete") || "null"
        );

        if (data) {
            downloadResults(data);
        }
    });
