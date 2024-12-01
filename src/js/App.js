import { select, settings, classNames } from './settings.js';
import Product from './modules/Product.js';
import Cart from './modules/Cart.js';
import Booking from './modules/Booking.js';

export const app = {
  initPages: function () {
    this.pages = document.querySelector(select.containerOf.pages).children;
    this.navLinks = document.querySelectorAll(select.nav.links);

    const idFromHash = window.location.hash.replace('#', '');
    let pageMatchingHash = this.pages[0].id;

    for (const page of this.pages) {
      if (page.id === idFromHash) {
        pageMatchingHash = page.id;
      }
    }

    this.activePage(pageMatchingHash);

    for (const link of this.navLinks) {
      link.addEventListener('click', event => {
        event.preventDefault();

        const id = event.target.getAttribute('href').replace('#', '');

        this.activePage(id);
        window.location.hash = `#${id}`;
      });
    }
  },

  activePage: function (pageId) {
    for (const page of this.pages) {
      page.classList.toggle(classNames.nav.active, page.id === pageId);
    }

    for (const link of this.navLinks) {
      link.classList.toggle(
        classNames.nav.active,
        link.getAttribute('href') === `#${pageId}`
      );
    }
  },

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

  initBooking: function () {
    const bookingContainer = document.querySelector(select.containerOf.booking);
    const booking = new Booking(bookingContainer); //eslint-disable-line
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

    thisApp.initPages();
    thisApp.initData();
    thisApp.initCart();
    thisApp.initBooking();
  },
};

app.init();
