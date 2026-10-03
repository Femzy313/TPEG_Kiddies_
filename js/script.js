/* =========================================================
   TPEG KIDDIES — PRODUCTION ORDER SYSTEM
========================================================= */

"use strict";


/* =========================================================
   CONFIGURATION
========================================================= */

const CONFIG = {

    emailJS: {

        serviceID: "service_f876y0m",

        templateID: "template_1kqytul",

        publicKey: "BpmEAlP0p5CfXByOA"

    },

    packages: {

        "1": {
            name: "1 Kit",
            quantity: 1,
            price: 29500
        },

        "2": {
            name: "2 Kits",
            quantity: 2,
            price: 55000
        },

        "3": {
            name: "3 Kits",
            quantity: 3,
            price: 82000
        }

    }

};


/* =========================================================
   DOM ELEMENTS
========================================================= */

const orderForm =
    document.getElementById("orderForm");

const selectedPackage =
    document.getElementById("selectedPackage");

const selectedQuantity =
    document.getElementById("selectedQuantity");

const orderTotal =
    document.getElementById("orderTotal");

const selectedPackageText =
    document.getElementById("selectedPackageText");

const formOrderTotal =
    document.getElementById("formOrderTotal");

const customerName =
    document.getElementById("customerName");

const customerPhone =
    document.getElementById("customerPhone");

const deliveryAddress =
    document.getElementById("deliveryAddress");

const submitButton =
    document.getElementById("submitOrderButton");

const successMessage =
    document.getElementById("successMessage");

const errorMessage =
    document.getElementById("errorMessage");

const currentYear =
    document.getElementById("currentYear");


/* =========================================================
   STATE
========================================================= */

let orderFormStarted = false;

let isSubmitting = false;


/* =========================================================
   CURRENCY
========================================================= */

function formatCurrency(amount) {

    return `₦${Number(amount).toLocaleString("en-NG")}`;

}


/* =========================================================
   CLARITY TRACKING
========================================================= */

/*
    Only send non-personal information to Clarity.

    Do NOT send:
    - customer name
    - phone number
    - address
    - email
    - order details containing personal information
*/

function trackClarityEvent(eventName) {

    if (
        typeof window.clarity !== "function"
    ) {
        return;
    }

    try {

        window.clarity(
            "event",
            eventName
        );

    } catch (error) {

        console.warn(
            "Clarity event error:",
            error
        );

    }

}


function setClarityTag(
    tagName,
    value
) {

    if (
        typeof window.clarity !== "function"
    ) {
        return;
    }

    try {

        window.clarity(
            "set",
            tagName,
            String(value)
        );

    } catch (error) {

        console.warn(
            "Clarity tag error:",
            error
        );

    }

}


/* =========================================================
   STICKY PRICE
========================================================= */

function updateStickyPrice(price) {

    const stickyPrice =
        document.querySelector(
            ".sticky-price"
        );

    if (!stickyPrice) {
        return;
    }

    stickyPrice.textContent =
        formatCurrency(price);

}


/* =========================================================
   ORDER SUMMARY
========================================================= */

function updateOrderSummary(
    packageID
) {

    const packageData =
        CONFIG.packages[
            String(packageID)
        ];

    if (!packageData) {
        return;
    }


    if (selectedPackage) {

        selectedPackage.value =
            packageData.name;

    }


    if (selectedQuantity) {

        selectedQuantity.value =
            packageData.quantity;

    }


    if (orderTotal) {

        orderTotal.value =
            packageData.price;

    }


    if (selectedPackageText) {

        selectedPackageText.textContent =
            `Talking Flash Cards + 10-inch LCD Writing Tablet — ${packageData.name}`;

    }


    if (formOrderTotal) {

        formOrderTotal.textContent =
            formatCurrency(
                packageData.price
            );

    }


    updateStickyPrice(
        packageData.price
    );

}


/* =========================================================
   SELECT PACKAGE
========================================================= */

function selectPackage(
    packageID,
    scrollToForm = false
) {

    packageID =
        String(packageID);

    const packageData =
        CONFIG.packages[packageID];


    if (!packageData) {

        console.error(
            "Invalid package ID:",
            packageID
        );

        return;

    }


    updateOrderSummary(
        packageID
    );


    const radio =
        document.querySelector(
            `input[name="package_selection"][value="${packageID}"]`
        );


    if (radio) {

        radio.checked = true;

    }


    document
        .querySelectorAll(".package-card")
        .forEach(card => {

            card.classList.toggle(
                "selected",
                String(
                    card.dataset.package
                ) === packageID
            );

        });


    /*
        Clarity analytics.

        These events contain no personal information.
    */

    trackClarityEvent(
        `package_${packageID}_selected`
    );

    setClarityTag(
        "selected_package",
        packageData.name
    );


    if (scrollToForm) {

        const orderSection =
            document.getElementById(
                "order"
            );

        if (orderSection) {

            orderSection.scrollIntoView({
                behavior: "smooth",
                block: "start"
            });

        }

    }

}


/* =========================================================
   PACKAGE BUTTONS
========================================================= */

/*
    Event delegation makes package buttons more robust,
    especially if package cards are later rendered dynamically.
*/

document.addEventListener(
    "click",
    event => {

        const button =
            event.target.closest(
                ".package-order-button"
            );

        if (!button) {
            return;
        }


        event.preventDefault();


        const packageID =
            button.dataset.package;


        if (!packageID) {

            console.error(
                "Package button is missing data-package."
            );

            return;

        }


        selectPackage(
            packageID,
            true
        );

    }
);


/* =========================================================
   PACKAGE RADIO BUTTONS
========================================================= */

document
    .querySelectorAll(
        'input[name="package_selection"]'
    )
    .forEach(radio => {

        radio.addEventListener(
            "change",
            () => {

                if (!radio.checked) {
                    return;
                }

                selectPackage(
                    radio.value,
                    false
                );

            }
        );

    });


/* =========================================================
   SCROLL TO ORDER
========================================================= */

document
    .querySelectorAll(
        "[data-scroll-order]"
    )
    .forEach(button => {

        button.addEventListener(
            "click",
            event => {

                event.preventDefault();


                const packagesSection =
                    document.getElementById(
                        "packages"
                    );


                if (
                    packagesSection &&
                    button.getAttribute("href") ===
                        "#packages"
                ) {

                    packagesSection.scrollIntoView({
                        behavior: "smooth",
                        block: "start"
                    });

                    return;

                }


                const orderSection =
                    document.getElementById(
                        "order"
                    );


                if (!orderSection) {
                    return;
                }


                orderSection.scrollIntoView({
                    behavior: "smooth",
                    block: "start"
                });

            }
        );

    });


/* =========================================================
   FORM START TRACKING
========================================================= */

if (orderForm) {

    const markFormStarted =
        () => {

            if (orderFormStarted) {
                return;
            }

            orderFormStarted = true;

            trackClarityEvent(
                "order_form_started"
            );

        };


    orderForm.addEventListener(
        "focusin",
        markFormStarted,
        {
            once: false
        }
    );

}


/* =========================================================
   PHONE VALIDATION
========================================================= */

function isValidPhone(phone) {

    const cleaned =
        phone
            .replace(/\s+/g, "")
            .replace(/-/g, "");


    return /^(?:\+234|0)(?:70|80|81|90|91)\d{8}$/
        .test(cleaned);

}


/* =========================================================
   MESSAGE HELPERS
========================================================= */

function showSuccess(message) {

    if (!successMessage) {
        return;
    }

    successMessage.textContent =
        message;

    successMessage.hidden =
        false;

}


function showError(message) {

    if (!errorMessage) {
        return;
    }

    errorMessage.textContent =
        message;

    errorMessage.hidden =
        false;

}


function clearMessages() {

    if (successMessage) {

        successMessage.hidden =
            true;

        successMessage.textContent =
            "";

    }


    if (errorMessage) {

        errorMessage.hidden =
            true;

        errorMessage.textContent =
            "";

    }

}


/* =========================================================
   LOADING STATE
========================================================= */

function setLoading(
    isLoading
) {

    if (!submitButton) {
        return;
    }


    if (isLoading) {

        submitButton.disabled =
            true;

        submitButton.dataset.originalText =
            submitButton.innerHTML;

        submitButton.innerHTML =
            `
                <span>
                    PROCESSING ORDER...
                </span>
            `;

    } else {

        submitButton.disabled =
            false;


        if (
            submitButton.dataset.originalText
        ) {

            submitButton.innerHTML =
                submitButton.dataset.originalText;

        }

    }

}


/* =========================================================
   META PURCHASE
========================================================= */

function trackMetaPurchase(price) {
    if (typeof window.fbq !== "function") return;

    const purchaseValue = Number(price);

    if (!Number.isFinite(purchaseValue) || purchaseValue <= 0) {
        console.warn("Invalid Meta Purchase value:", price);
        return;
    }

    try {
        window.fbq("track", "Purchase", {
            value: purchaseValue,
            currency: "NGN"
        });
    } catch (error) {
        console.warn("Meta Pixel error:", error);
    }
}


/* =========================================================
   TIKTOK PURCHASE
========================================================= */

function trackTikTokPurchase(price, packageData, phone) {
    if (
        typeof window.ttq === "undefined" ||
        typeof window.ttq.track !== "function"
    ) {
        return;
    }

    if (!packageData) {
        console.warn("TikTok Purchase: packageData is missing.");
        return;
    }

    const purchaseValue = Number(price);

    if (!Number.isFinite(purchaseValue) || purchaseValue <= 0) {
        console.warn("Invalid TikTok Purchase value:", price);
        return;
    }

    try {
        window.ttq.track("CompletePayment", {
            value: purchaseValue,
            currency: "NGN",
            content_id: `TPEG-KIDDIES-${packageData.quantity}-KIT`,
            content_type: "product",
            quantity: packageData.quantity,
            phone_number: phone
        });
    } catch (error) {
        console.warn("TikTok Pixel error:", error);
    }
}
/* =========================================================
   ORDER SUBMISSION
========================================================= */

if (orderForm) {

    orderForm.addEventListener(
        "submit",
        async event => {

            event.preventDefault();


            if (isSubmitting) {
                return;
            }


            clearMessages();


            const name =
                customerName?.value
                    .trim() || "";


            const phone =
                customerPhone?.value
                    .trim()
                    .replace(/\s+/g, "") || "";


            const address =
                deliveryAddress?.value
                    .trim() || "";


            const selectedRadio =
                document.querySelector(
                    'input[name="package_selection"]:checked'
                );


            const packageID =
                selectedRadio?.value ||
                selectedPackage?.value ||
                "1";


            const packageData =
                CONFIG.packages[
                    String(packageID)
                ];


            /* ---------------------------------------------
               VALIDATION
            --------------------------------------------- */

            if (!name) {

                showError(
                    "Please enter your full name."
                );

                customerName?.focus();

                return;

            }


            if (name.length < 2) {

                showError(
                    "Please enter a valid name."
                );

                customerName?.focus();

                return;

            }


            if (!phone) {

                showError(
                    "Please enter your phone number."
                );

                customerPhone?.focus();

                return;

            }


            if (!isValidPhone(phone)) {

                showError(
                    "Please enter a valid Nigerian phone number."
                );

                customerPhone?.focus();

                return;

            }


            if (!address) {

                showError(
                    "Please enter your delivery address."
                );

                deliveryAddress?.focus();

                return;

            }


            if (address.length < 10) {

                showError(
                    "Please provide a complete delivery address."
                );

                deliveryAddress?.focus();

                return;

            }


            if (!packageData) {

                showError(
                    "Please select a package."
                );

                return;

            }


            /* ---------------------------------------------
               EMAILJS CHECK
            --------------------------------------------- */

            if (
                typeof window.emailjs ===
                "undefined"
            ) {

                showError(
                    "The order service is not ready. Please refresh the page and try again."
                );

                console.error(
                    "EmailJS library was not loaded."
                );

                trackClarityEvent(
                    "order_failed"
                );

                return;

            }


            /* ---------------------------------------------
               START SUBMISSION
            --------------------------------------------- */

            isSubmitting =
                true;

            setLoading(true);


            try {

                const templateParams = {

                    customer_name:
                        name,

                    phone:
                        phone,

                    delivery_address:
                        address,

                    package:
                        packageData.name,

                    quantity:
                        packageData.quantity,

                    order_total:
                        formatCurrency(
                            packageData.price
                        ),

                    payment_method:
                        "Payment on Delivery",

                    order_date:
                        new Date()
                            .toLocaleString(
                                "en-NG"
                            )

                };


                /* -----------------------------------------
                   SEND ORDER
                ----------------------------------------- */

                const response =
                    await window.emailjs.send(
                        CONFIG.emailJS.serviceID,
                        CONFIG.emailJS.templateID,
                        templateParams
                    );


                console.log(
                    "EmailJS response:",
                    response
                );


                /* -----------------------------------------
                   CONVERSION TRACKING

                   IMPORTANT:
                   Only fire these after EmailJS succeeds.
                ----------------------------------------- */

                trackMetaPurchase(
    packageData.price
);

trackTikTokPurchase(
    packageData.price,
    packageData,
    phone
);

                trackClarityEvent(
                    "order_submitted"
                );


                setClarityTag(
                    "ordered_package",
                    packageData.name
                );


                setClarityTag(
                    "order_value",
                    packageData.price
                );


                /* -----------------------------------------
                   SUCCESS MESSAGE
                ----------------------------------------- */

                showSuccess(
                    `Order received successfully! We will contact you shortly to confirm your ${packageData.name} order and delivery details.`
                );


                /*
                    Reset the visible form.

                    The package is returned to the default
                    1-kit selection after successful submission.
                */

                orderForm.reset();


                selectPackage(
                    "1",
                    false
                );


                /*
                    Move the customer back towards the
                    confirmation area without forcing a
                    disruptive page reload.
                */

                successMessage?.scrollIntoView({
                    behavior: "smooth",
                    block: "center"
                });


            } catch (error) {

                console.error(
                    "Order submission error:",
                    error
                );


                trackClarityEvent(
                    "order_failed"
                );


                showError(
                    "We couldn't submit your order. Please check your internet connection and try again."
                );

            } finally {

                isSubmitting =
                    false;

                setLoading(false);

            }

        }
    );

}


/* =========================================================
   EMAILJS INITIALISATION
========================================================= */

if (
    typeof window.emailjs !==
    "undefined"
) {

    window.emailjs.init({

        publicKey:
            CONFIG.emailJS.publicKey

    });

} else {

    console.warn(
        "EmailJS is not available at initialisation time."
    );

}


/* =========================================================
   FAQ ACCORDION
========================================================= */

document
    .querySelectorAll(".faq-item")
    .forEach(item => {

        item.addEventListener(
            "toggle",
            () => {

                if (!item.open) {
                    return;
                }


                document
                    .querySelectorAll(".faq-item")
                    .forEach(other => {

                        if (
                            other !== item &&
                            other.open
                        ) {

                            other.open =
                                false;

                        }

                    });

            }
        );

    });


/* =========================================================
   FOOTER YEAR
========================================================= */

if (currentYear) {

    currentYear.textContent =
        new Date().getFullYear();

}


/* =========================================================
   INITIAL PACKAGE
========================================================= */

selectPackage(
    "1",
    false
);   