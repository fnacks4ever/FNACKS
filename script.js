const products = [
    {name: "Lipton", price: 2.50, flavors: ["Lemon", "Peach"]},
    {name: "Kinder Bueno", price: 3.00, flavors: ["Milk", "Dark"]},
    {name: "Gums", price: 1.80, flavors: ["Mint", "Fruity"]},
    {name: "Cheetos", price: 2.50, flavors: []},
    {name: "Cola", price: 2.00, flavors: []},
    {name: "Roulette Jelly", price: 1.00, flavors: ["Strawberry", "Apple", "Grape"]}
];

let cart = [];
let discountCode = "DISCOUNT10"; // Example discount code
let discountPercentage = 10; // 10% discount

window.onload = function() {
    displayProducts();
};

function displayProducts(filteredProducts = products) {
    const productList = document.getElementById('product-list');
    productList.innerHTML = ''; // Clear existing products

    filteredProducts.forEach((product, index) => {
        let productDiv = document.createElement('div');
        productDiv.classList.add('product');
        
        let flavorOptions = '';
        if (product.flavors.length > 0) {
            flavorOptions = `<select id="flavor-${index}">` + 
                product.flavors.map(flavor => `<option value="${flavor}">${flavor}</option>`).join('') +
                `</select>`;
        }
        
        productDiv.innerHTML = `
            <h3>${product.name}</h3>
            <p>Price: ${product.price} AZN</p>
            ${flavorOptions}
            <button class="button" onclick="addToCart(${index})">Add to Cart</button>
        `;
        productList.appendChild(productDiv);
    });
}

function addToCart(index) {
    const product = products[index];
    let selectedFlavor = "";
    if (product.flavors.length > 0) {
        selectedFlavor = document.getElementById(`flavor-${index}`).value;
    }
    
    cart.push({name: product.name, price: product.price, flavor: selectedFlavor});
    displayCart();
}

function displayCart() {
    const cartItems = document.getElementById('cart-items');
    const totalPrice = document.getElementById('total-price');
    cartItems.innerHTML = '';
    let total = 0;

    cart.forEach((product, index) => {
        let itemText = `${product.name} - ${product.price} AZN`;
        if (product.flavor) itemText += ` (${product.flavor})`;
        cartItems.innerHTML += `
            <div class="cart-item">
                <p>${itemText}</p>
                <button class="button" onclick="removeFromCart(${index})">Remove</button>
            </div>
        `;
        total += product.price;
    });

    totalPrice.innerText = applyDiscount(total).toFixed(2);
}

function removeFromCart(index) {
    cart.splice(index, 1); // Remove item from array
    displayCart(); // Re-render cart items
}

function clearCart() {
    cart = [];
    displayCart();
}

function proceedToCheckout() {
    document.getElementById('checkout-section').style.display = 'block';
    document.getElementById('qr-section').style.display = 'block';
}

function confirmOrder() {
    const fileInput = document.getElementById('upload-confirmation');
    if (fileInput.files.length === 0) {
        alert("Please upload the payment confirmation!");
    } else {
        alert("Thank you for buying from FNACKS, please approach 8J class and say 'I came to FNACKS'. Show order confirmation and our worker will scan it.");
    }
}

function generateQRCode() {
    const name = document.getElementById('name').value;
    const surname = document.getElementById('surname').value;
    const date = document.getElementById('date').value;
    const classInfo = document.getElementById('class').value;
    const fileInput = document.getElementById('upload-confirmation');
    const paymentMethod = document.querySelector('input[name="payment"]:checked');
    
    if (!name || !surname || !date || !classInfo || fileInput.files.length === 0 || !paymentMethod) {
        alert("Please fill all fields, select payment method, and upload the confirmation file!");
        return;
    }
    
    let total = cart.reduce((sum, product) => sum + product.price, 0).toFixed(2);
    const fileName = fileInput.files[0].name;
    let cartDetails = cart.map(product => `${product.name} (${product.flavor || 'No Flavor'}) - ${product.price} AZN`).join('\n');
    const qrData = `Name: ${name}\nSurname: ${surname}\nDate: ${date}\nClass: ${classInfo}\nTotal: ${total} AZN\nPayment: ${paymentMethod.value}\nFile: ${fileName}\nProducts:\n${cartDetails}`;

    const qr = new QRious({
        element: document.getElementById('qrcode'),
        value: qrData,
        size: 200
    });
}

// File to Base64 conversion
function fileToBase64(file, callback) {
    const reader = new FileReader();
    reader.onload = function(event) {
        callback(event.target.result.split(',')[1]); // Remove the data URL part, get only the base64 string
    };
    reader.readAsDataURL(file); // Convert file to base64
}

function sendOrderEmail() {
    const fileInput = document.getElementById('upload-confirmation');
    const file = fileInput.files[0];

    if (file) {
        fileToBase64(file, function(base64File) {
            const name = document.getElementById('name').value;
            const surname = document.getElementById('surname').value;
            const total = cart.reduce((sum, product) => sum + product.price, 0).toFixed(2);
            const paymentMethod = document.querySelector('input[name="payment"]:checked').value;

            // Define the template parameters for the email
            const templateParams = {
                name: name,
                surname: surname,
                total: total,
                paymentMethod: paymentMethod,
                base64File: base64File, // Attach the base64-encoded file
            };

            // Send the email using EmailJS
            emailjs.send("service_ku9qx74", "template_018qwtj", templateParams) // Send email using your Service ID and Template ID
                .then(function(response) {
                    alert("Order placed successfully! An email has been sent.");
                }, function(error) {
                    alert("Failed to send order: " + error.text); // Error handling
                });
        });
    } else {
        alert("Please upload the payment confirmation file!");
    }
}

// Initialize EmailJS with your public key
emailjs.init("Rfg-LSt5c6uV0GSye");

document.getElementById("contact-form").addEventListener("submit", function(event) {
    event.preventDefault(); // Prevent form from submitting the usual way

    // Collecting the form data
    var name = document.getElementById("name").value;
    var email = document.getElementById("email").value;
    var message = document.getElementById("message").value;

    // Define the template parameters for the email
    var templateParams = {
        name: name,
        email: email,
        message: message
    };

    // Send the email using EmailJS
    emailjs.send("service_ku9qx74", "template_018qwtj", templateParams) // Send email using your Service ID and Template ID
        .then(function(response) {
            alert("Message sent successfully!");
            document.getElementById("contact-form").reset(); // Reset form after submission
        }, function(error) {
            alert("Failed to send message: " + error.text); // Error handling
        });
});

// Removed duplicate function definition

function searchProducts() {
    const searchInput = document.getElementById('search-bar').value.toLowerCase();
    const filteredProducts = products.filter(product => product.name.toLowerCase().includes(searchInput));
    displayProducts(filteredProducts);
}

document.getElementById('product-list').addEventListener('click', function(event) {
    if (event.target.classList.contains('remove-product')) {
        const index = event.target.dataset.index;
        removeProduct(index);
    }
});

function removeProduct(index) {
    products.splice(index, 1); // Remove product from array
    displayProducts(); // Re-render product list
}
function removeSpecificProduct(productName) {
    cart = cart.filter(product => product.name !== productName);
    displayCart();
}

