
/*
 * ShopLab — анализ соответствия предпочтениям.
 *
 * Этот показатель является исследовательским
 * индексом, а не объективной оценкой
 * правильности выбора.
 */

const SHOPLAB_ANALYSIS_PRODUCTS = [
    {
        id: "A",
        battery: 20,
        weight: 220,
        noise: false,
        warranty: 12,
        basePrice: 4990
    },
    {
        id: "B",
        battery: 30,
        weight: 240,
        noise: true,
        warranty: 12,
        basePrice: 5990
    },
    {
        id: "C",
        battery: 40,
        weight: 260,
        noise: true,
        warranty: 24,
        basePrice: 6990
    },
    {
        id: "D",
        battery: 25,
        weight: 190,
        noise: false,
        warranty: 24,
        basePrice: 5490
    },
    {
        id: "E",
        battery: 45,
        weight: 280,
        noise: true,
        warranty: 12,
        basePrice: 6490
    },
    {
        id: "F",
        battery: 35,
        weight: 210,
        noise: true,
        warranty: 36,
        basePrice: 7490
    }
];

function calculateChoiceAlignment(
    preferences,
    selectedProductId
) {
    const serviceFee = 700;
    const budget = Number(preferences.budget);

    // Нормализация относительно диапазонов
    // характеристик шести моделей.

    function normalize(value, min, max) {
        return (value - min) / (max - min);
    }

    const weights = {
        battery: Number(preferences.battery),
        noise: Number(preferences.noise),
        weight: Number(preferences.weight),
        warranty: Number(preferences.warranty)
    };

    const totalWeight =
        weights.battery +
        weights.noise +
        weights.weight +
        weights.warranty;

    const scores = SHOPLAB_ANALYSIS_PRODUCTS.map(
        function(product) {
            const batteryScore = normalize(
                product.battery, 20, 45
            );

            const noiseScore =
                product.noise ? 1 : 0;

            // Чем меньше вес, тем выше балл.
            const weightScore =
                1 - normalize(product.weight, 190, 280);

            const warrantyScore = normalize(
                product.warranty, 12, 36
            );

            const weightedScore =
                (
                    batteryScore * weights.battery +
                    noiseScore * weights.noise +
                    weightScore * weights.weight +
                    warrantyScore * weights.warranty
                ) / totalWeight;

            const finalPrice =
                product.basePrice + serviceFee;

            return {
                productId: product.id,
                preferenceScore:
                    Number(weightedScore.toFixed(4)),
                finalPrice,
                withinBudget: finalPrice <= budget
            };
        }
    );

    const selected = scores.find(
        item => item.productId === selectedProductId
    );

    const affordable = scores.filter(
        item => item.withinBudget
    );

    const bestAffordable = [...affordable].sort(
        (a, b) =>
            b.preferenceScore - a.preferenceScore
    )[0] || null;

    const bestOverall = [...scores].sort(
        (a, b) =>
            b.preferenceScore - a.preferenceScore
    )[0];

    const budgetExcess =
        selected === undefined
            ? null
            : Math.max(0, selected.finalPrice - budget);

    const scoreGapToBestOverall =
        selected === undefined
            ? null
            : Number(
                (
                    bestOverall.preferenceScore -
                    selected.preferenceScore
                ).toFixed(4)
            );


    return {
        method: "weighted-normalized-v1",
        budgetExcess,

        scoreGapToBestOverall,
        preferenceWeights: weights,
        productScores: scores,

        selectedPreferenceScore:
            selected?.preferenceScore ?? null,

        bestOverallProduct:
            bestOverall.productId,

        bestAffordableProduct:
            bestAffordable?.productId ?? null,

        selectedWithinBudget:
            selected?.withinBudget ?? null,

        selectedIsBestAffordable:
            bestAffordable === null || !selected
                ? null
                : selected.productId ===
                  bestAffordable.productId,

        preferenceScoreGapToBestAffordable:
            bestAffordable === null || !selected
                ? null
                : Number(
                    (
                        bestAffordable.preferenceScore -
                        selected.preferenceScore
                    ).toFixed(4)
                )
               

    };
}
