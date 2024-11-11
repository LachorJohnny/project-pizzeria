import { select, settings, classNames } from './settings.js';
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

  initNav: function () {
    const nav = document.querySelectorAll(select.nav.links);
    const pages = document.querySelector(select.containerOf.pages);

    nav.forEach(link => {
      link.addEventListener('click', e => {
        const href = link.getAttribute('href').substring(1);

        const activePage = pages.querySelector('.' + classNames.nav.active);
        activePage.classList.remove(classNames.nav.active);

        const pageToActivate = pages.querySelector(`[id^="${href}"]`);
        pageToActivate.classList.add(classNames.nav.active);
      });
    });
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
    thisApp.initNav();
  },
};

app.init();