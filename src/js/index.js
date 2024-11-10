import { select, settings, classNames, templates } from './settings.js';
import Product from './modules/Product.js';
import Cart from './modules/Cart.js';

export const app = {
  initMenu: function () {
    const thisApp = this;

    for (const productData in thisApp.data.products) {
      new Product(
        thisApp.data.products[productData].id,
        thisApp.data.products[productData]
      );
    }
  },

  initCart: function () {
    const cartElem = document.querySelector(select.containerOf.cart);
    this.cart = new Cart(cartElem);
  },

  initData: function () {
    const thisApp = this;

    thisApp.data = {};

    const url = settings.db.url + '/' + settings.db.products;

    fetch(url)
      .then(response => response.json())
      .then(data => {
        thisApp.data.products = data;

        thisApp.initMenu();
      })
      .catch(error => {
        console.error('CONNECTION ERROR ' + error);
      });
  },

  init: function () {
    const thisApp = this;

    thisApp.initData();
    thisApp.initCart();
  },
};

app.init();
