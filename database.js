
const SUPABASE_URL =
    "https://cynqgwztutoqyuowbtax.supabase.co";

const SUPABASE_KEY =
    "sb_publishable_29TVYTCslXZYx5NCIfqrIg_GQyYSwvU";

async function saveToDatabase(data) {
    const controller = new AbortController();

    const timeout = setTimeout(function() {
        controller.abort();
    }, 15000);

    try {
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
                }),
                signal: controller.signal
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

    } catch (error) {
        if (error.name === "AbortError") {
            throw new Error(
                "Превышено время ожидания Supabase"
            );
        }

        throw error;

    } finally {
        clearTimeout(timeout);
    }
}
