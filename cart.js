
const experiment = JSON.parse(
    sessionStorage.getItem("shoplab_experiment") || "null"
);

const preferences = JSON.parse(
    sessionStorage.getItem("shoplab_preferences") || "null"
);

const consent = JSON.parse(
    sessionStorage.getItem("shoplab_consent") || "null"
);



function formatPrice(value) {
    return new Intl.NumberFormat("ru-RU", {
        style: "currency",
        currency: "RUB",
        maximumFractionDigits: 0
    }).format(value);
}

if (!consent || consent.accepted !== true) {
    window.location.replace("index.html");
} else if (!experiment || !preferences || !preferences.pricing) {
    window.location.replace("index.html");
} else {
    startCart();
}

function startCart() {
    const pricing = getPricing(preferences);
    const SERVICE_FEE = pricing.serviceFee;
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

    cartItems = cartItems.map(item => ({...item, basePrice: pricing.products[item.productId].basePrice}));
    let selectedId = null;
    const isHiddenCosts = experiment.darkPattern === "hidden_costs";
    let priceDetailsOpened = false;

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


            // В карточке отображается итоговая цена, без арифметической строки.
            // Момент раскрытия обязательного сбора не меняется: он виден в корзине.
            const price = document.createElement("div");
            price.className = "cart-item-price";

            const priceAmount = document.createElement("strong");
            priceAmount.className = "cart-item-price-amount";
            priceAmount.textContent = formatPrice(
                Number(item.basePrice) + SERVICE_FEE
            );

            // На карточке только итоговая стоимость. Состав доступен ниже.
            price.append(priceAmount);

            radio.addEventListener("change", function() {
                selectedId = item.productId;
                priceDetailsOpened = false;

                logEvent("cart_product_compared", {
                    productId: selectedId
                });

                renderCart();
            });

            const specs = document.createElement("ul");
            specs.className = "cart-specs";
            const product = SHOPLAB_PRODUCTS.find(p => p.id === item.productId);
            for (const [name, key] of getVisibleAttributes(experiment.cognitiveLoad)) {
                const li = document.createElement("li");
                li.textContent = name + ": " + product[key];
                specs.appendChild(li);
            }
            row.append(radio, photo, label, price, specs);
            productContainer.appendChild(row);
        });

        if (selectedId) {
            const selected = cartItems.find(
                item => item.productId === selectedId
            );

            if (selected) {
                const total =
                    Number(selected.basePrice) + SERVICE_FEE;

                function addPriceRow(container, label, value, isTotal = false) {
                    const row = document.createElement("div");
                    row.className = "cart-price-row" +
                        (isTotal ? " cart-price-row-total" : "");
                    const name = document.createElement("span");
                    name.textContent = label;
                    const amount = document.createElement("strong");
                    amount.textContent = formatPrice(value);
                    row.append(name, amount);
                    container.appendChild(row);
                }

                function addBreakdown(container) {
                    addPriceRow(container, "Стоимость товара", Number(selected.basePrice));
                    addPriceRow(container, "Обязательный сервисный сбор", SERVICE_FEE);
                }

                if (isHiddenCosts) {
                    // Полная итоговая цена видна до подтверждения.
                    // Детализация скрыта только визуально, но доступна по кнопке.
                    addPriceRow(priceContainer, "Итого за выбранный товар", total, true);

                    const toggle = document.createElement("button");
                    toggle.type = "button";
                    toggle.className = "price-breakdown-toggle";
                    toggle.textContent = priceDetailsOpened
                        ? "Скрыть состав стоимости" : "Состав стоимости";
                    toggle.setAttribute("aria-expanded", String(priceDetailsOpened));
                    toggle.setAttribute("aria-controls", "price-breakdown-content");
                    priceContainer.appendChild(toggle);

                    const breakdown = document.createElement("div");
                    breakdown.id = "price-breakdown-content";
                    breakdown.className = "price-breakdown-content";
                    breakdown.hidden = !priceDetailsOpened;
                    addBreakdown(breakdown);
                    priceContainer.appendChild(breakdown);

                    toggle.addEventListener("click", function() {
                        priceDetailsOpened = !priceDetailsOpened;
                        breakdown.hidden = !priceDetailsOpened;
                        toggle.setAttribute("aria-expanded", String(priceDetailsOpened));
                        toggle.textContent = priceDetailsOpened
                            ? "Скрыть состав стоимости" : "Состав стоимости";
                        logEvent(priceDetailsOpened ? "price_details_opened" : "price_details_closed", {
                            productId: selectedId,
                            darkPattern: experiment.darkPattern
                        });
                    });
                } else {
                    const heading = document.createElement("h3");
                    heading.className = "cart-price-heading";
                    heading.textContent = "Детали стоимости";
                    priceContainer.appendChild(heading);
                    addBreakdown(priceContainer);
                    addPriceRow(priceContainer, "Итого", total, true);
                }
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
            studyVersion: SHOPLAB_VERSION,
            pricingMode: pricing.pricingMode,
            priceMultiplier: pricing.multiplier,
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
