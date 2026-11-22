
const experiment = JSON.parse(
    sessionStorage.getItem("shoplab_experiment") || "null"
);

const preferences = JSON.parse(
    sessionStorage.getItem("shoplab_preferences") || "null"
);

const consent = JSON.parse(
    sessionStorage.getItem("shoplab_consent") || "null"
);

if (!consent || consent.accepted !== true) {
    window.location.replace("index.html");
} else if (!experiment || !preferences || !preferences.pricing) {
    window.location.replace("index.html");
} else {
    startCatalog();
}

function startCatalog() {
    const pricing = getPricing(preferences);
    const SERVICE_FEE = pricing.serviceFee;

    const formatPrice = function(value) {
        return new Intl.NumberFormat("ru-RU", {
            style: "currency",
            currency: "RUB",
            maximumFractionDigits: 0
        }).format(value);
    };

    const products = SHOPLAB_PRODUCTS.map(product => ({...product, ...pricing.products[product.id]}));
    const visibleAttributes = getVisibleAttributes(experiment.cognitiveLoad);

    const sortSelect = document.getElementById("catalog-sort");
    let sortMode = "default";

    // Sort using the exact price visible in this experimental condition.
    function displayedPrice(product) {
        return experiment.darkPattern === "hidden_costs"
            ? product.basePrice
            : product.basePrice + SERVICE_FEE;
    }

    function sortedProducts() {
        const ordered = [...products];
        if (sortMode === "price_asc") {
            ordered.sort((a, b) => displayedPrice(a) - displayedPrice(b));
        } else if (sortMode === "price_desc") {
            ordered.sort((a, b) => displayedPrice(b) - displayedPrice(a));
        }
        return ordered;
    }

    if (sortSelect) {
        sortSelect.addEventListener("change", function() {
            const nextMode = sortSelect.value;
            if (!["default", "price_asc", "price_desc"].includes(nextMode)) return;
            if (nextMode === sortMode) return;
            sortMode = nextMode;
            logEvent("catalog_sorted", {
                sortMode,
                visiblePriceType: experiment.darkPattern === "hidden_costs"
                    ? "base_price" : "final_price",
                orderedProductIds: sortedProducts().map(product => product.id)
            });
            renderProducts();
        });
    }

    const container =
        document.getElementById("products");


    function renderProducts() {
        container.innerHTML = "";

        sortedProducts().forEach(function(product) {
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

            const photo = document.createElement("img");
            photo.src = "images/" + product.id + ".webp";
            photo.alt = "Наушники " + product.name;
            photo.loading = "lazy";
            photo.decoding = "async";

            photo.onerror = function() {
                image.textContent = "🎧";
            };

            image.appendChild(photo);
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

            // Дополнительная информация: количество отзывов зависит от нагрузки.
            const reviews = getProductReviews(product.id, experiment.cognitiveLoad);
            const reviewsBlock = document.createElement("div");
            reviewsBlock.className = "product-reviews";

            const reviewsButton = document.createElement("button");
            reviewsButton.type = "button";
            reviewsButton.className = "reviews-toggle";
            reviewsButton.textContent = "Отзывы (" + reviews.length + ")";
            reviewsButton.setAttribute("aria-expanded", "false");

            const reviewsList = document.createElement("div");
            reviewsList.className = "reviews-list";
            reviewsList.hidden = true;
            reviewsList.id = "reviews-" + product.id;
            reviewsButton.setAttribute("aria-controls", reviewsList.id);

            reviews.forEach(function(review) {
                const entry = document.createElement("article");
                entry.className = "review-entry";

                const author = document.createElement("div");
                author.className = "review-author";
                author.textContent = review.nickname;

                const message = document.createElement("p");
                message.className = "review-text";
                message.textContent = review.text;

                entry.appendChild(author);
                entry.appendChild(message);
                reviewsList.appendChild(entry);
            });

            reviewsButton.addEventListener("click", function() {
                const opening = reviewsList.hidden;
                reviewsList.hidden = !opening;
                reviewsButton.setAttribute("aria-expanded", String(opening));
                reviewsButton.textContent = opening
                    ? "Скрыть отзывы (" + reviews.length + ")"
                    : "Отзывы (" + reviews.length + ")";
                logEvent(opening ? "reviews_opened" : "reviews_closed", {
                    productId: product.id,
                    reviewCount: reviews.length,
                    cognitiveLoad: experiment.cognitiveLoad
                });
            });

            reviewsBlock.appendChild(reviewsButton);
            reviewsBlock.appendChild(reviewsList);
            card.appendChild(reviewsBlock);

            const price = document.createElement("div");
            price.className = "price";

            const shownPrice =
                experiment.darkPattern === "hidden_costs"
                    ? product.basePrice
                    : product.basePrice + SERVICE_FEE;

            price.textContent = formatPrice(shownPrice);
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
            
            const cartItems = JSON.parse(
                sessionStorage.getItem("shoplab_cart") || "[]"
            );

            const alreadyAdded = cartItems.some(
                item => item.productId === product.id
            );

            button.textContent = alreadyAdded
                ? "Убрать из выбранных"
                : "В корзину";

            if (alreadyAdded) {
                button.classList.add("remove-from-selection");
                button.setAttribute("aria-label", "Убрать " + product.name + " из выбранных");
            }

            button.addEventListener("click", function() {
                if (alreadyAdded) {
                    removeFromSelected(product.id);
                } else {
                    chooseProduct(product);
                }
            });

            card.appendChild(button);
            container.appendChild(card);
        });
    }

    
    function chooseProduct(product) {
        const cartItems = JSON.parse(
            sessionStorage.getItem("shoplab_cart") || "[]"
        );

        const alreadyAdded = cartItems.some(
            item => item.productId === product.id
        );

        if (alreadyAdded) {
            return;
        }

        cartItems.push({
            productId: product.id,
            name: product.name,
            basePrice: product.basePrice,
            addedAt: new Date().toISOString()
        });

        sessionStorage.setItem(
            "shoplab_cart",
            JSON.stringify(cartItems)
        );

        logEvent("product_selected", {
            productId: product.id,
            basePrice: product.basePrice
        });

        logEvent("cart_item_added", {
            productId: product.id,
            cartSize: cartItems.length
        });

        updateCartCount();
        renderProducts();
    }


    function removeFromSelected(productId) {
        const cartItems = JSON.parse(
            sessionStorage.getItem("shoplab_cart") || "[]"
        );

        const updatedItems = cartItems.filter(
            item => item.productId !== productId
        );

        if (updatedItems.length === cartItems.length) {
            return;
        }

        sessionStorage.setItem(
            "shoplab_cart",
            JSON.stringify(updatedItems)
        );

        logEvent("cart_item_removed", {
            productId: productId,
            cartSize: updatedItems.length,
            source: "catalog"
        });

        updateCartCount();
        renderProducts();
    }

    function updateCartCount() {
        const cartItems = JSON.parse(
            sessionStorage.getItem("shoplab_cart") || "[]"
        );

        document.getElementById("cart-count").textContent =
            cartItems.length;
        document.getElementById("cart-panel-count").textContent = cartItems.length;
        document.getElementById("cart-panel").classList.toggle("hidden", cartItems.length === 0);
        document.body.classList.toggle("has-cart-panel", cartItems.length > 0);
    }

    
    renderProducts();
    updateCartCount();

    logEvent("catalog_opened", {
        group: experiment.group,
        cognitiveLoad: experiment.cognitiveLoad,
        darkPattern: experiment.darkPattern,
        studyVersion: SHOPLAB_VERSION
    });
}
