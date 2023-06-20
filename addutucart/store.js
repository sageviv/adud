//variables
const cartBtn = document.querySelector('.cart-btn');
const closeCartBtn = document.querySelector('.close-cart');
const clearCartBtn = document.querySelector('.clear-cart');
const cartDOM = document.querySelector('.cart');
const cartOverlay = document.querySelector('.cart-overlay');
const cartItems = document.querySelector('.cart-items');
const cartTotal = document.querySelector('.cart-total');
const cartContent = document.querySelector('.cart-content');
const productsDOM = document.querySelector('.products-center');

//cart
let cart = [];
//buttons
let buttonsDOM = [];

//get product
class Products {
  async getProducts() {
    try {
      let result = await fetch('products.json');
      let data = await result.json();

      let products = data.items;
      products = products.map((item) => {
        const { title, price } = item.fields;
        const { id } = item.sys;
        const { description } = item.pro;
        const { link } = item.web;
        const image = item.fields.image.fields.file.url;
        return { title, price, id, image, description, link };
      });
      return products;
    } catch (error) {
      console.log(error);
    }
  }
}

// for ui/displaying product
class UI {
  displayProducts(products) {
    let result = '';
    products.forEach((product) => {
      result += `
            <!-- single product -->
            <article class="product">
                <div class="img-container">
                    <img 
                    onclick="window.open('${product.link}');"
                    src=${product.image}
                    alt="product" 
                    class="product-img">
                    <button class="bag-btn" data-id=${product.id}>
                        <i class="fas fa-shopping-cart"></i>
                        add to cart
                    </button>
                </div>
                <h3>${product.description}</h3>
                <h3 style="font-size:1.3rem;">${product.title}</h3>
                <h4>₱${product.price}</h4>
            </article>
            <!-- end of single product -->
            `;
    });
    productsDOM.innerHTML = result;
  }
  getBagButtons() {
    const buttons = [...document.querySelectorAll('.bag-btn')];
    buttonsDOM = buttons;
    buttons.forEach((button) => {
      let id = button.dataset.id;
      let inCart = cart.find((item) => item.id === id);
      if (inCart) {
        button.innerText = 'In Cart';
        button.disabled = true;
      }
      button.addEventListener('click', (event) => {
        event.target.innerText = 'In Cart';
        event.target.disabled = true;

        //  gets product from products
        let cartItem = { ...Storage.getProduct(id), amount: 1 };

        //  also adds product to cart
        cart = [...cart, cartItem];

        //  then save cart in localstorage
        Storage.saveCart(cart);

        //  set cart values
        this.setCartValues(cart);

        //  display/add cart item
        this.addCartItem(cartItem);

        //  finally show cart
        this.showCart();
      });
    });
  }
  setCartValues(cart) {
    let tempTotal = 0;
    let itemsTotal = 0;
    cart.map((item) => {
      tempTotal += item.price * item.amount;
      itemsTotal += item.amount;
    });
    cartTotal.innerText = parseFloat(tempTotal.toFixed(2));
    cartItems.innerText = itemsTotal;
  }
  addCartItem(item) {
    const div = document.createElement('div');
    div.classList.add('cart-item');
    div.innerHTML = `
        <div class="center-cart-image">
        <img src=${item.image} alt="product" style="width:150px; height:150px;">
        </div>
        <h3 style="text-align:justify; text-justify: inter-word;">${item.description}</h3>
             <div style="display:block; margin:auto;">
                <h4 style="font-size:1.2rem; color: rgb(240,157,81);">${item.title}</h4>
                <h5> ₱${item.price}</h5>
                <span class="remove-item" data-id=${item.id}>remove</span>
            </div>
            <div style="font-size: 1.5rem;">
                <i class="fas fa-chevron-up" data-id=${item.id}></i>
                <p style="color: black;" class="item-amount">${item.amount}</p>
                <i class="fas fa-chevron-down" data-id=${item.id}></i>
            </div>       
        `;
    cartContent.appendChild(div);
  }
  showCart() {
    cartOverlay.classList.add('transparentBcg');
    cartDOM.classList.add('showCart');
  }
  setupAPP() {
    cart = Storage.getCart();
    this.setCartValues(cart);
    this.populateCart(cart);
    cartBtn.addEventListener('click', this.showCart);
    closeCartBtn.addEventListener('click', this.hideCart);
  }
  populateCart(cart) {
    cart.forEach((item) => this.addCartItem(item));
  }
  hideCart() {
    cartOverlay.classList.remove('transparentBcg');
    cartDOM.classList.remove('showCart');
  }
  cartLogic() {
    clearCartBtn.addEventListener('click', () => {
      this.clearCart();
    });
    cartContent.addEventListener('click', (event) => {
      if (event.target.classList.contains('remove-item')) {
        let removeItem = event.target;
        let id = removeItem.dataset.id;
        cartContent.removeChild(removeItem.parentElement.parentElement);
        this.removeItem(id);
      } else if (event.target.classList.contains('fa-chevron-up')) {
        let addAmount = event.target;
        let id = addAmount.dataset.id;
        let tempItem = cart.find((item) => item.id === id);
        tempItem.amount = tempItem.amount + 1;
        Storage.saveCart(cart);
        this.setCartValues(cart);
        addAmount.nextElementSibling.innerText = tempItem.amount;
      } else if (event.target.classList.contains('fa-chevron-down')) {
        let lowerAmount = event.target;
        let id = lowerAmount.dataset.id;
        let tempItem = cart.find((item) => item.id === id);
        tempItem.amount = tempItem.amount - 1;
        if (tempItem.amount > 0) {
          Storage.saveCart(cart);
          this.setCartValues(cart);
          lowerAmount.previousElementSibling.innerText = tempItem.amount;
        } else {
          cartContent.removeChild(lowerAmount.parentElement.parentElement);
          this.removeItem(id);
        }
      }
    });
  }
  clearCart() {
    let cartItems = cart.map((item) => item.id);
    cartItems.forEach((id) => this.removeItem(id));
    alert('Thank you for your purchase!');

    while (cartContent.children.length > 0) {
      cartContent.removeChild(cartContent.children[0]);
    }
    this.hideCart();
  }
  removeItem(id) {
    cart = cart.filter((item) => item.id !== id);
    this.setCartValues(cart);
    Storage.saveCart(cart);
    let button = this.getSingleButton(id);
    button.disabled = false;
    button.innerHTML = `<i class="fas fa-shopping-cart"></i>add to cart`;
  }
  getSingleButton(id) {
    return buttonsDOM.find((button) => button.dataset.id === id);
  }
}

//local storage
class Storage {
  static saveProducts(products) {
    localStorage.setItem('products', JSON.stringify(products));
  }
  static getProduct(id) {
    let products = JSON.parse(localStorage.getItem('products'));
    return products.find((product) => product.id === id);
  }
  static saveCart() {
    localStorage.setItem('cart', JSON.stringify(cart));
  }
  static getCart() {
    return localStorage.getItem('cart')
      ? JSON.parse(localStorage.getItem('cart'))
      : [];
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const ui = new UI();
  const products = new Products();
  // setup app
  ui.setupAPP();
  //get all products
  products
    .getProducts()
    .then((products) => {
      ui.displayProducts(products);
      Storage.saveProducts(products);
    })
    .then(() => {
      ui.getBagButtons();
      ui.cartLogic();
    });
});
