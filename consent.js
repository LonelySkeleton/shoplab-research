
const consentForm = document.getElementById("consent-form");

const declineButton = document.getElementById(
    "decline-button"
);


function clearPreviousSession() {
    const keys = [
        "shoplab_consent",
        "shoplab_preferences",
        "shoplab_experiment",
        "shoplab_cart",
        "shoplab_events",
        "shoplab_result",
        "shoplab_complete",
        "shoplab_upload_status"
    ];

    keys.forEach(function(key) {
        sessionStorage.removeItem(key);
    });
}


consentForm.addEventListener("submit", function(event) {
    event.preventDefault();

    const checkbox = document.getElementById(
        "consent-checkbox"
    );

    if (!checkbox.checked) {
        return;
    }

    clearPreviousSession();

    const consent = {
        accepted: true,
        acceptedAt: new Date().toISOString(),
        consentVersion: "draft-v2"
    };

    sessionStorage.setItem(
        "shoplab_consent",
        JSON.stringify(consent)
    );

    window.location.href = "preferences.html";
});

declineButton.addEventListener("click", function() {
    clearPreviousSession();

    // Показываем только сообщение об отказе, скрывая всё приглашение.
    const questionnaire = document.querySelector(".questionnaire");
    const declineMessage = document.getElementById("decline-message");

    if (questionnaire && declineMessage) {
        Array.from(questionnaire.children).forEach(function(element) {
            if (element !== declineMessage) {
                element.classList.add("hidden");
            }
        });
        declineMessage.classList.remove("hidden");
    }
});
