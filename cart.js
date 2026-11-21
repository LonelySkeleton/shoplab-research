
const experiment = JSON.parse(
    sessionStorage.getItem("shoplab_experiment") || "null"
);

const preferences = JSON.parse(
    sessionStorage.getItem("shoplab_preferences") || "null"
);

const consent = JSON.parse(
    sessionStorage.getItem("shoplab_consent") || "null"
);

const SERVICE_FEE = 700;

function formatPrice(value) {
    return new Intl.NumberFormat("ru-RU", {
        style: "currency",
        currency: "RUB",
        maximumFractionDigits: 0
    }).format(value);
}

if (!consent || consent.accepted !== true) {
    window.location.replace("index.html");
} else if (!experiment || !preferences) {
    window.location.replace("preferences.html");
} else {
    startCart();
}

function startCart() {
    const productContainer =
        document.getElementById("cart-product");

    const priceContainer =
        document.getElementById("cart-price-details");

    const confirmButton =
        document.getElementById("confirm-cart");

    const changeButton =
        document.getElementById("change-product");

    const removeButton =
        document.getElementById("remove-product");

    let cartItems = JSON.parse(
        sessionStorage.getItem("shoplab_cart") || "[]"
    );

    let selectedId = null;

    function saveCart() {
        sessionStorage.setItem(
            "shoplab_cart",
            JSON.stringify(cartItems)
        );
    }

    function renderCart() {
        productContainer.replaceChildren();
        priceContainer.replaceChildren();

        confirmButton.disabled = true;

        if (cartItems.length === 0) {
            const message = document.createElement("p");
            message.textContent =
                "Корзина пуста. Вернитесь в каталог.";

            productContainer.appendChild(message);
            removeButton.disabled = true;
            return;
        }

        removeButton.disabled = false;

        cartItems.forEach(function(item) {
            const row = document.createElement("div");
            row.className = "cart-item";

            const radio = document.createElement("input");
            radio.type = "radio";
            radio.name = "selected-product";
            radio.value = item.productId;
            radio.checked = selectedId === item.productId;
            
            radio.id = "cart-choice-" + item.productId;

            const label = document.createElement("label");
            label.textContent = item.name;
            label.htmlFor = radio.id;


            const photo = document.createElement("img");

            photo.src = "images/" + item.productId + ".webp";
            photo.alt = "Наушники " + item.name;
            photo.className = "cart-product-image";
            photo.loading = "lazy";

            photo.onerror = function() {
                photo.style.display = "none";
            };


            const price = document.createElement("p");
            price.textContent =
                "Цена товара: " +
                formatPrice(item.basePrice) +
                " + сбор " +
                formatPrice(SERVICE_FEE) +
                " = " +
                formatPrice(
                    Number(item.basePrice) + SERVICE_FEE
                );

            radio.addEventListener("change", function() {
                selectedId = item.productId;

                logEvent("cart_product_compared", {
                    productId: selectedId
                });

                renderCart();
            });

            row.append(radio, photo, label, price);
            productContainer.appendChild(row);
        });

        if (selectedId) {
            const selected = cartItems.find(
                item => item.productId === selectedId
            );

            if (selected) {
                const total =
                    Number(selected.basePrice) + SERVICE_FEE;

                const totalElement =
                    document.createElement("div");

                totalElement.className = "price-total";
                totalElement.textContent =
                    "Итого за выбранный товар: " +
                    formatPrice(total);

                priceContainer.appendChild(totalElement);
                confirmButton.disabled = false;
            }
        }
    }

    changeButton.addEventListener("click", function() {
        logEvent("returned_to_catalog", {
            cartSize: cartItems.length
        });

        window.location.href = "catalog.html";
    });

    removeButton.addEventListener("click", function() {
        if (!selectedId) {
            alert("Сначала выберите товар для удаления.");
            return;
        }

        cartItems = cartItems.filter(
            item => item.productId !== selectedId
        );

        logEvent("cart_item_removed", {
            productId: selectedId,
            cartSize: cartItems.length
        });

        logEvent("selection_reset", {
            previousProductId: selectedId
        });

        selectedId = null;
        saveCart();
        renderCart();
    });

    confirmButton.addEventListener("click", function() {
        const selected = cartItems.find(
            item => item.productId === selectedId
        );

        if (!selected) {
            return;
        }

        const total =
            Number(selected.basePrice) + SERVICE_FEE;

        const budget = Number(preferences.budget);

        const result = {
            participantId: experiment.participantId,
            group: experiment.group,
            cognitiveLoad: experiment.cognitiveLoad,
            darkPattern: experiment.darkPattern,
            selectedProduct: selected.productId,
            basePrice: Number(selected.basePrice),
            serviceFee: SERVICE_FEE,
            finalPrice: total,
            currency: "RUB",
            studyVersion: "shoplab-2.2-multi-cart",
            statedBudget: budget,
            exceedsBudget: total > budget,
            cartProductIds: cartItems.map(
                item => item.productId
            ),
            confirmedAt: new Date().toISOString()
        };

        sessionStorage.setItem(
            "shoplab_result",
            JSON.stringify(result)
        );

        logEvent("choice_confirmed", {
            productId: selected.productId,
            finalPrice: total,
            exceedsBudget: result.exceedsBudget,
            cartSize: cartItems.length
        });

        confirmButton.disabled = true;
        window.location.href = "survey.html";
    });

    logEvent("cart_opened", {
        cartSize: cartItems.length,
        productIds: cartItems.map(item => item.productId)
    });

    renderCart();
}
