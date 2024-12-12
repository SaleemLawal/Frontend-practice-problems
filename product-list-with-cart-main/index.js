let data = [];

// DOM Selectors
const productList = document.querySelector("#product--list");

// Function to load data
const loadData = async () => {
  try {
    const response = await fetch("./data.json");
    data = await response.json();
  } catch (error) {
    console.error("Error loading JSON:", error);
  }
};

// Function to create and return an element with optional classes and attributes
const createElement = (tag, classes = [], attributes = {}) => {
  const element = document.createElement(tag);
  if (classes.length) element.classList.add(...classes);
  for (const [key, value] of Object.entries(attributes)) {
    if (key == "textContent") {
      element.textContent = value;
    } else {
      element.setAttribute(key, value);
    }
  }
  return element;
};

const createQuantityButton = (iconSrc, clickHandler) => {
  const button = createElement("button", ["increment--decrement"]);
  const icon = createElement("img", [], {
    src: iconSrc,
    style: "width: 100%;",
  });
  button.appendChild(icon);
  button.addEventListener("click", clickHandler);
  return button;
};

// Function to populate a product item
const populateProduct = (item, index) => {
  // Create image
  const image = createElement("img", ["product--item-img"], {
    src: window.matchMedia("(max-width: 350px)").matches ? item.image.mobile : item.image.desktop,
  });

  // Create Add to Cart button and its content
  const cartImage = createElement("img", ["product--item-img"], {
    src: "./assets/images/icon-add-to-cart.svg",
  });
  const addToCartText = createElement("p", [], { textContent: "Add to Cart" });
  const addToCartPlaceHolder = createElement("div", [
    "add--to--cart--ph",
    "flex--display",
  ]);

  addToCartPlaceHolder.append(cartImage, addToCartText);

  const button = createElement("div", ["add--to--cart"], { id: index + 1 });

  button.append(addToCartPlaceHolder);
  button.addEventListener("click", () => {
    const cartPlaceHolder = document.querySelector(
      ".cart--container .place--holder"
    );

    cartPlaceHolder.classList.add("hide");
    handleAddToCart(index + 1);
    updateTotalPrice();
  });

  const smallText = createElement("small", ["product--item-small"], {
    textContent: item.category,
  });
  const title = createElement("h3", ["product--item-title"], {
    textContent: item.name,
  });
  const price = createElement("p", ["product--item-price"], {
    textContent: `$${item.price}`,
  });

  // Create main product item container
  const productItem = createElement("div", ["product--item"], {
    id: `product--id--${index + 1}`,
  });
  productItem.append(image, button, smallText, title, price);

  // Add to product list
  productList.appendChild(productItem);
};

// Handle Add to Cart button click
const handleAddToCart = (index) => {
  const productItem = document.querySelector(`#product--id--${index}`);
  const button = productItem.querySelector(".add--to--cart");
  const img = productItem.querySelector(".product--item-img");

  button.classList.add("cart--item", "flex--display");
  img.classList.add("selected");
  document
    .querySelector(`#product--id--${index} .add--to--cart--ph`)
    .classList.add("hide");

  if (button.querySelector(".controller")) return;

  addToCart(index - 1, 1);

  const decrementButton = createQuantityButton(
    "./assets/images/icon-decrement-quantity.svg",
    () => updateCount(button, -1, index)
  );
  const incrementButton = createQuantityButton(
    "./assets/images/icon-increment-quantity.svg",
    () => updateCount(button, 1, index)
  );
  const count = createElement("p", ["cart--count"], { "data-count": 1 });
  count.textContent = 1;

  const enclosingDiv = createElement("div", ["flex--display", "controller"]);
  enclosingDiv.append(decrementButton, count, incrementButton);

  button.append(enclosingDiv);
};

const updateCount = (button, delta, index) => {
  const count = button.querySelector(".cart--count");
  let currentCount = parseInt(count.getAttribute("data-count"));
  currentCount = Math.max(1, currentCount + delta);
  count.textContent = currentCount;
  count.setAttribute("data-count", currentCount);

  // add to cart container
  addToCart(index - 1, delta);
};

const updateTotalCartCount = (delta) => {
  const totalCartCount = document.querySelector("#cart--total--count");
  totalCartCount.textContent = `${
    parseInt(totalCartCount.textContent) + delta
  }`;
};

const updateExistingItem = (existingItem, index, delta) => {
  const count = existingItem.querySelector(".item--count");
  let currentCount = parseInt(count.textContent);
  if (delta === 1) {
    count.textContent = `${currentCount + 1}x`;
    document.querySelector(
      `[name="${data[index]["name"]}"] .total--price`
    ).textContent = `$${((currentCount + 1) * data[index]["price"]).toFixed(
      2
    )}`;
  } else {
    let itemCount = parseInt(count.textContent.replace("x", ""));
    if (itemCount > 1) {
      count.textContent = `${currentCount - 1}x`;
      updateTotalCartCount(-1);
      document.querySelector(
        `[name="${data[index]["name"]}"] .total--price`
      ).textContent = `$${((currentCount - 1) * data[index]["price"]).toFixed(
        2
      )}`;
    }
  }
  updateTotalPrice();
};

const handleRemoveButtonClick = (itemDiv, index) => {
  const cartPlaceHolder = document.querySelector(
    ".cart--container .place--holder"
  );
  const items = document.querySelectorAll(".item");
  if (items.length === 1) {
    cartPlaceHolder.classList.remove("hide");
    document.querySelector("#order--footer").classList.add("hide");
  }

  const totalCartCount = document.querySelector("#cart--total--count");
  let currentCount = parseInt(totalCartCount.textContent);
  const count = itemDiv.querySelector(".item--count");
  let itemCount = parseInt(count.textContent.replace("x", ""));
  currentCount -= itemCount;

  totalCartCount.textContent = currentCount;

  const elementCount = document.querySelector(
    `#product--id--${index + 1} .cart--count`
  );
  elementCount.setAttribute("data-count", 1);
  elementCount.textContent = 1;

  const productItem = document.querySelector(`#product--id--${index + 1}`);
  const img = productItem.querySelector(".product--item-img");
  img.classList.remove("selected");

  const addToCartButton = productItem.querySelector(".add--to--cart");
  addToCartButton.classList.remove("cart--item");

  addToCartButton.removeChild(addToCartButton.querySelector(".controller"));

  const addToCartPlaceholder =
    addToCartButton.querySelector(".add--to--cart--ph");
  addToCartPlaceholder.classList.remove("hide");

  document.querySelector(".cart").removeChild(itemDiv);
};

const createNewItem = (index) => {
  const name = data[index]["name"];
  const itemDiv = createElement("div", ["item"], { name, index });
  const innerDiv = createElement("div", []);
  const itemName = createElement("p", ["item--name"], { textContent: name });
  const itemDetail = createElement("div", ["item--detail--container"]);
  const itemCount = createElement("p", ["item--count"], {
    textContent: `${1}x`,
  });
  // itemCount.style.color = "rgb(199, 58, 15)";
  // itemCount.style.fontWeight = 600;
  const singlePrice = createElement(
    "small",
    ["product--item-small", "single--price"],
    { textContent: `$${data[index]["price"].toFixed(2)}` }
  );
  const totalPrice = createElement(
    "small",
    ["product--item-small", "total--price"],
    { textContent: `$${data[index]["price"].toFixed(2)}` }
  );
  const button = createElement("button", []);
  const removeButton = createElement("img", [], {
    src: "./assets/images/icon-remove-item.svg",
  });

  button.addEventListener("click", () =>
    handleRemoveButtonClick(itemDiv, index)
  );

  itemDetail.append(itemCount, singlePrice, totalPrice);
  innerDiv.append(itemName, itemDetail);
  button.append(removeButton);
  itemDiv.append(innerDiv, button);

  document.querySelector(".cart").append(itemDiv);
};

const addToCart = (index, delta) => {
  const name = data[index]["name"];
  const existingItem = document.querySelector(`[name="${name}"]`);

  document.querySelector("#order--footer").classList.remove("hide");

  if (delta === 1) updateTotalCartCount(1);

  if (existingItem) {
    updateExistingItem(existingItem, index, delta);
  } else {
    createNewItem(index);
  }
};

const updateTotalPrice = () => {
  const items = document.querySelectorAll(".item");
  let totalPrice = 0;
  items.forEach((item) => {
    const total = item.querySelector(".total--price").textContent;
    totalPrice += parseFloat(total.replace("$", ""));
  });

  document.querySelector(
    "#order--total--price"
  ).textContent = `$${totalPrice.toFixed(2)}`;
};

const handleConfirmOrder = () => {
  const confirmOrder = document.querySelector("#order--footer button");
  confirmOrder.addEventListener("click", () => {
    const modal = document.querySelector("#modal");
    modal.classList.remove("hide");
    const orderItemsContainer = document.querySelector("#order--items");

    // get all items
    const items = document.querySelectorAll(".item");
    let totalPrice = 0;

    items.forEach((item) => {
      // make a div

      const itemName = item.querySelector(".item--name").textContent;
      const itemCount = item.querySelector(".item--count").textContent;
      const singularPrice = item.querySelector(".single--price").textContent;
      const elementTotalPrice = item.querySelector(".total--price").textContent;
      const index = item.getAttribute("index");
      totalPrice += parseFloat(elementTotalPrice.replace("$", ""));

      const orderItem = createElement("div", ["order--item"]);
      orderItem.innerHTML = `
        <img src="${data[index]["image"]["thumbnail"]}" alt="${itemName}" />
        <div class="order--item--details">
            <div class="order--content">
              <h3>${itemName}</h3>
              <p class="item--count">${itemCount}</p>
              <small class="product--item-small">@${singularPrice}</small>
            </div>
            <h3 class="total--price">${elementTotalPrice}</h3>
        </div>
      `;
      orderItemsContainer.appendChild(orderItem);
    });
    orderItemsContainer.innerHTML += `
      <div class="flex--display" style="align-items: center; justify-content: space-between;">
        <p>Order Total</p>
        <h1>$${totalPrice.toFixed(2)}</h1>
      </div>
    `;
  });
};

const startNewOrder = () => {
  document.querySelector("#modal button").addEventListener("click", () => {
    document.querySelectorAll("[index]").forEach((item) => {
      handleRemoveButtonClick(item, parseInt(item.getAttribute("index")));
    });

    const orderItemsContainer = document.querySelector("#order--items");
    orderItemsContainer.innerHTML = "";
    document.querySelector("#modal").classList.add("hide");

    const items = document.querySelectorAll(".item");
    items.forEach((item) => {
      document.querySelector(".cart").removeChild(item);
    });

    document.querySelector("#order--footer").classList.add("hide");
    document.querySelector("#cart--total--count").textContent = 0;
    document.querySelector("#order--total--price").textContent = "$0.00";

    const cartPlaceHolder = document.querySelector(
      ".cart--container .place--holder"
    );
    cartPlaceHolder.classList.remove("hide");
  });
};

const main = async () => {
  await loadData();
  data.forEach((item, index) => populateProduct(item, index));
  handleConfirmOrder();
  startNewOrder();
};

main();
