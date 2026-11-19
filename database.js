
const SUPABASE_URL =
    "https://cynqgwztutoqyuowbtax.supabase.co";

const SUPABASE_KEY =
    "sb_publishable_29TVYTCslXZYx5NCIfqrIg_GQyYSwvU";

async function saveToDatabase(data) {
    const response = await fetch(
        SUPABASE_URL + "/rest/v1/shoplab_results",
        {
            method: "POST",
            headers: {
                "apikey": SUPABASE_KEY,
                "Content-Type": "application/json",
                "Prefer": "return=minimal"
            },
            body: JSON.stringify({
                participant_id:
                    data.experiment.participantId,
                group_code:
                    data.experiment.group,
                payload: data
            })
        }
    );

    if (!response.ok) {
        const message = await response.text();

        throw new Error(
            "Ошибка Supabase " +
            response.status + ": " + message
        );
    }

    return true;
}
