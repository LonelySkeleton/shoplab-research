
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
} else if (!experiment || !preferences) {
    window.location.replace("preferences.html");
} else {
    startCatalog();
}

function startCatalog() {
    const SERVICE_FEE = 700;

    const formatPrice = function(value) {
        return new Intl.NumberFormat("ru-RU", {
            style: "currency",
            currency: "RUB",
            maximumFractionDigits: 0
        }).format(value);
    };

    const products = [
        {
            id: "A",
            name: "Nova Sound A",
            basePrice: 4990,
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
            basePrice: 5990,
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
            basePrice: 6990,
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
        },
        {
            id: "D",
            name: "Nova Sound D",
            basePrice: 5490,
            battery: "25 часов",
            weight: "190 г",
            noise: "Нет",
            warranty: "24 месяца",
            bluetooth: "5.1",
            charging: "USB-C",
            microphone: "Есть",
            foldable: "Есть",
            range: "10 м",
            colors: "4",
            water: "Нет",
            controls: "Кнопки"
        },
        {
            id: "E",
            name: "Nova Sound E",
            basePrice: 6490,
            battery: "45 часов",
            weight: "280 г",
            noise: "Есть",
            warranty: "12 месяцев",
            bluetooth: "5.3",
            charging: "USB-C",
            microphone: "Есть",
            foldable: "Нет",
            range: "15 м",
            colors: "2",
            water: "IPX4",
            controls: "Кнопки"
        },
        {
            id: "F",
            name: "Nova Sound F",
            basePrice: 7490,
            battery: "35 часов",
            weight: "210 г",
            noise: "Есть",
            warranty: "36 месяцев",
            bluetooth: "5.3",
            charging: "USB-C",
            microphone: "Есть",
            foldable: "Есть",
            range: "15 м",
            colors: "4",
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
                ? "В корзине ✓"
                : "В корзину";

            button.disabled = alreadyAdded;


            button.addEventListener("click", function() {
                chooseProduct(product);
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


    function updateCartCount() {
        const cartItems = JSON.parse(
            sessionStorage.getItem("shoplab_cart") || "[]"
        );

        document.getElementById("cart-count").textContent =
            cartItems.length;
    }

    
    renderProducts();
    updateCartCount();

    logEvent("catalog_opened", {
        group: experiment.group,
        cognitiveLoad: experiment.cognitiveLoad,
        darkPattern: experiment.darkPattern,
        studyVersion: "shoplab-2.2-multi-cart"
    });
}
