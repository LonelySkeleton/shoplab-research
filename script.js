
const experiment = JSON.parse(
    sessionStorage.getItem("shoplab_experiment")
);

const preferences = JSON.parse(
    sessionStorage.getItem("shoplab_preferences")
);

const consent = JSON.parse(
    sessionStorage.getItem("shoplab_consent") || "null"
);

if (!consent || consent.accepted !== true) {
    window.location.replace("index.html");
} else if (!experiment || !preferences) {
    window.location.replace("preferences.html");
} else {
    startCatalog();
}

function startCatalog() {
    const SERVICE_FEE = 10;

    const products = [
        {
            id: "A",
            name: "Nova Sound A",
            basePrice: 59,
            battery: "20 часов",
            weight: "220 г",
            noise: "Нет",
            warranty: "12 месяцев",
            bluetooth: "5.0",
            charging: "USB-C",
            microphone: "Есть",
            foldable: "Нет",
            range: "10 м",
            colors: "2",
            water: "Нет",
            controls: "Кнопки"
        },
        {
            id: "B",
            name: "Nova Sound B",
            basePrice: 69,
            battery: "30 часов",
            weight: "240 г",
            noise: "Есть",
            warranty: "12 месяцев",
            bluetooth: "5.2",
            charging: "USB-C",
            microphone: "Есть",
            foldable: "Есть",
            range: "10 м",
            colors: "3",
            water: "Нет",
            controls: "Кнопки"
        },
        {
            id: "C",
            name: "Nova Sound C",
            basePrice: 79,
            battery: "40 часов",
            weight: "260 г",
            noise: "Есть",
            warranty: "24 месяца",
            bluetooth: "5.3",
            charging: "USB-C",
            microphone: "Есть",
            foldable: "Есть",
            range: "15 м",
            colors: "3",
            water: "IPX4",
            controls: "Сенсор"
        }
    ];

    const attributes = [
        ["Автономность", "battery"],
        ["Вес", "weight"],
        ["Шумоподавление", "noise"],
        ["Гарантия", "warranty"],
        ["Bluetooth", "bluetooth"],
        ["Зарядка", "charging"],
        ["Микрофон", "microphone"],
        ["Складная конструкция", "foldable"],
        ["Радиус действия", "range"],
        ["Количество цветов", "colors"],
        ["Защита от воды", "water"],
        ["Управление", "controls"]
    ];

    const attributeCounts = {
        low: 4,
        medium: 8,
        high: 12
    };

    const attributeCount =
        attributeCounts[experiment.cognitiveLoad];

    const visibleAttributes =
        attributes.slice(0, attributeCount);

    const container =
        document.getElementById("products");

    const selection =
        document.getElementById("selection");

    const selectedText =
        document.getElementById("selected-product");

    const priceDetails =
        document.getElementById("price-details");

    const confirmButton =
        document.getElementById("confirm-button");

    const resetButton =
        document.getElementById("reset-button");

    const confirmationMessage =
        document.getElementById("confirmation-message");

    let selectedProduct = null;

    function renderProducts() {
        container.innerHTML = "";

        products.forEach(function(product) {
            const card = document.createElement("article");
            card.className = "product-card";

            const highlighted =
                experiment.darkPattern ===
                    "visual_misdirection" &&
                product.id === "C";

            if (highlighted) {
                card.classList.add("highlighted");

                const label = document.createElement("div");
                label.className = "promo-label";
                label.textContent = "Рекомендуем!";
                card.appendChild(label);
            }

            const image = document.createElement("div");
            image.className = "product-image";
            image.textContent = "🎧";
            card.appendChild(image);

            const title = document.createElement("h3");
            title.textContent = product.name;
            card.appendChild(title);

            const description = document.createElement("p");
            description.textContent =
                "Беспроводные наушники";
            card.appendChild(description);

            const list = document.createElement("ul");

            visibleAttributes.forEach(function(attribute) {
                const item = document.createElement("li");

                item.textContent =
                    attribute[0] + ": " +
                    product[attribute[1]];

                list.appendChild(item);
            });

            card.appendChild(list);

            const price = document.createElement("div");
            price.className = "price";

            const shownPrice =
                experiment.darkPattern === "hidden_costs"
                    ? product.basePrice
                    : product.basePrice + SERVICE_FEE;

            price.textContent = shownPrice + " €";
            card.appendChild(price);

            if (experiment.darkPattern !== "hidden_costs") {
                const note = document.createElement("div");
                note.className = "price-note";
                note.textContent =
                    "Итоговая стоимость, включая сбор";
                card.appendChild(note);
            }

            const button = document.createElement("button");
            button.type = "button";
            button.textContent = "Выбрать";

            button.addEventListener("click", function() {
                chooseProduct(product);
            });

            card.appendChild(button);
            container.appendChild(card);
        });
    }

    function chooseProduct(product) {
        selectedProduct = product;

        logEvent("product_selected", {
            productId: product.id,
            basePrice: product.basePrice
        });

        document.getElementById(
            "cart-count"
        ).textContent = "1";

        selectedText.textContent = product.name;

        const total = product.basePrice + SERVICE_FEE;

        priceDetails.className = "price-details";
        priceDetails.replaceChildren();

        const base = document.createElement("div");
        base.textContent =
            "Стоимость товара: " +
            product.basePrice + " €";

        const fee = document.createElement("div");
        fee.textContent =
            "Обязательный сервисный сбор: " +
            SERVICE_FEE + " €";

        const totalElement = document.createElement("div");
        totalElement.className = "price-total";
        totalElement.textContent =
            "Итого: " + total + " €";

        priceDetails.append(base, fee, totalElement);

        selection.classList.remove("hidden");

        confirmButton.disabled = false;
        confirmButton.classList.remove("hidden");
        confirmationMessage.classList.add("hidden");

        selection.scrollIntoView({
            behavior: "smooth"
        });

        console.log("Предварительный выбор:", product.id);
    }

    resetButton.addEventListener("click", function() {
        logEvent("selection_reset", {
            previousProductId: selectedProduct?.id || null
        });
        selectedProduct = null;

        document.getElementById(
            "cart-count"
        ).textContent = "0";

        selection.classList.add("hidden");

        console.log("Выбор сброшен");
    });

    confirmButton.addEventListener("click", function() {
        if (!selectedProduct) {
            return;
        }

        const total =
            selectedProduct.basePrice + SERVICE_FEE;

        const result = {
            participantId: experiment.participantId,
            group: experiment.group,
            cognitiveLoad: experiment.cognitiveLoad,
            darkPattern: experiment.darkPattern,
            selectedProduct: selectedProduct.id,
            basePrice: selectedProduct.basePrice,
            serviceFee: SERVICE_FEE,
            finalPrice: total,
            statedBudget: preferences.budget,
            exceedsBudget: total > preferences.budget,
            confirmedAt: new Date().toISOString()
        };

        sessionStorage.setItem(
            "shoplab_result",
            JSON.stringify(result)
        );

        logEvent("choice_confirmed", {
            productId: selectedProduct.id,
            finalPrice: total,
            exceedsBudget: result.exceedsBudget
        });

        confirmButton.disabled = true;
        confirmButton.classList.add("hidden");

        confirmationMessage.textContent =
             "Ваш выбор зафиксирован. " +
            "Теперь ответьте на несколько вопросов.";

        const surveyButton = document.createElement("button");
        surveyButton.type = "button";
        surveyButton.textContent = "Перейти к вопросам";
        surveyButton.style.marginTop = "15px";

        surveyButton.addEventListener("click", function() {
            window.location.href = "survey.html";
        });

        confirmationMessage.replaceChildren(
          document.createTextNode(
          "Ваш выбор зафиксирован. Теперь ответьте на вопросы."
            ),
            surveyButton
        );

        confirmationMessage.classList.remove("hidden");

        console.log("Результат эксперимента:", result);
    });

    renderProducts();
    logEvent("catalog_opened", {
    group: experiment.group,
    cognitiveLoad: experiment.cognitiveLoad,
    darkPattern: experiment.darkPattern
});
}
