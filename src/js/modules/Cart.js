import { select, classNames, templates, settings } from '../settings.js';
import { utils } from '../utils.js';
import CartProduct from './CartProduct.js';

export default class Cart {
  constructor(element) {
    this.products = [];

    this.getElements(element);
    this.initActions();
    this.update();
  }

  getElements(element) {
    this.dom = {};

    this.dom.wrapper = element;
    this.dom.toggleTrigger = this.dom.wrapper.querySelector(
      select.cart.toggleTrigger
    );
    this.dom.productList = this.dom.wrapper.querySelector(
      select.cart.productList
    );
    this.dom.deliveryFee = this.dom.wrapper.querySelector(
      select.cart.deliveryFee
    );
    this.dom.subtotalPrice = this.dom.wrapper.querySelector(
      select.cart.subtotalPrice
    );
    this.dom.totalPrice = this.dom.wrapper.querySelectorAll(
      select.cart.totalPrice
    );
    this.dom.totalNumber = this.dom.wrapper.querySelector(
      select.cart.totalNumber
    );
    this.dom.form = this.dom.wrapper.querySelector(select.cart.form);
    this.dom.phone = this.dom.form.querySelector(select.cart.phone);
    this.dom.address = this.dom.form.querySelector(select.cart.address);
  }

  initActions() {
    this.dom.toggleTrigger.addEventListener('click', () => {
      this.dom.wrapper.classList.toggle(classNames.cart.wrapperActive);
    });

    this.dom.productList.addEventListener('updated', this.update.bind(this));

    this.dom.productList.addEventListener('remove', event => {
      this.remove(event.detail.cartProduct);
    });

    this.dom.form.addEventListener('submit', event => {
      event.preventDefault();

      this.sendOrder();
    });
  }

  add(menuProduct) {
    const generatedHTML = templates.cartProduct(menuProduct);
    this.element = utils.createDOMFromHTML(generatedHTML);

    this.dom.productList.appendChild(this.element);

    this.products.push(new CartProduct(menuProduct, this.element));

    this.update();
  }

  update() {
    const deliveryFee = settings.cart.defaultDeliveryFee;

    this.totalNumber = 0;
    this.subtotalPrice = 0;

    for (const product of this.products) {
      this.totalNumber += product.amount;
      this.subtotalPrice += product.price;
    }

    this.totalPrice = this.totalNumber
      ? this.subtotalPrice + deliveryFee
      : this.subtotalPrice;

    this.dom.totalNumber.textContent = this.totalNumber;
    this.dom.subtotalPrice.textContent = this.subtotalPrice;
    this.dom.deliveryFee.textContent = deliveryFee;
    this.dom.totalPrice.forEach(totalPriceRef => {
      totalPriceRef.textContent = this.totalPrice;
    });
  }

  remove(cartProduct) {
    const index = this.products.indexOf(cartProduct);
    this.products.splice(index, 1);

    cartProduct.element.remove();

    this.update();
  }

  sendOrder() {
    const url = settings.db.url + '/' + settings.db.orders;

    const payload = {};

    payload.address = this.dom.address.value;
    payload.phone = this.dom.phone.value;
    payload.totalPrice = this.totalPrice;
    payload.subtotalPrice = this.subtotalPrice;
    payload.totalNumber = this.totalNumber;
    payload.deliveryFee = settings.cart.defaultDeliveryFee;
    payload.products = [];

    for (const prod of this.products) {
      payload.products.push(prod.getData());
    }

    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    };

    fetch(url, options);
  }
}
