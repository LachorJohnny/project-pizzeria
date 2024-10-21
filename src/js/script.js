/* global Handlebars, utils, dataSource */ // eslint-disable-line no-unused-vars

{
  'use strict'; // prettier-ignore

  const select = {
    templateOf: {
      menuProduct: '#template-menu-product',
      cartProduct: '#template-cart-product',
    },
    containerOf: {
      menu: '#product-list',
      cart: '#cart',
    },
    all: {
      menuProducts: '#product-list > .product',
      menuProductsActive: '#product-list > .product.active',
      formInputs: 'input, select',
    },
    menuProduct: {
      clickable: '.product__header',
      form: '.product__order',
      priceElem: '.product__total-price .price',
      imageWrapper: '.product__images',
      amountWidget: '.widget-amount',
      cartButton: '[href="#add-to-cart"]',
    },
    widgets: {
      amount: {
        input: 'input.amount',
        linkDecrease: 'a[href="#less"]',
        linkIncrease: 'a[href="#more"]',
      },
    },
    cart: {
      productList: '.cart__order-summary',
      toggleTrigger: '.cart__summary',
      totalNumber: `.cart__total-number`,
      totalPrice:
        '.cart__total-price strong, .cart__order-total.cart__order-price-sum strong',
      subtotalPrice: '.cart__order-subtotal .cart__order-price-sumstrong',
      deliveryFee: '.cart__order-delivery .cart__order-price-sum strong',
      form: '.cart__order',
      formSubmit: '.cart__order [type="submit"]',
      phone: '[name="phone"]',
      address: '[name="address"]',
    },
    cartProduct: {
      amountWidget: '.widget-amount',
      price: '.cart__product-price',
      edit: '[href="#edit"]',
      remove: '[href="#remove"]',
    },
  };

  const classNames = {
    menuProduct: {
      wrapperActive: 'active',
      imageVisible: 'active',
    },
    cart: {
      wrapperActive: 'active',
    },
  };

  const settings = {
    amountWidget: {
      defaultValue: 1,
      defaultMin: 1,
      defaultMax: 10,
    },
    cart: {
      defaultDeliveryFee: 20,
    },
  };

  const templates = {
    menuProduct: Handlebars.compile(
      document.querySelector(select.templateOf.menuProduct).innerHTML
    ),
    cartProduct: Handlebars.compile(
      document.querySelector(select.templateOf.cartProduct).innerHTML
    ),
  };

  class Product {
    constructor(id, data) {
      this.id = id;
      this.data = data;

      this.renderInMenu();
      this.getElements();
      this.initAccordion();
      this.initOrderForm();
      this.initAmountWidget();
      this.processForm();
    }

    renderInMenu() {
      const generatedHTML = templates.menuProduct(this.data);
      this.element = utils.createDOMFromHTML(generatedHTML);

      const menuContainer = document.querySelector(select.containerOf.menu);
      menuContainer.appendChild(this.element);
    }

    getElements() {
      this.dom = {};

      this.dom.accordionTrigger = this.element.querySelector(
        select.menuProduct.clickable
      );
      this.dom.form = this.element.querySelector(select.menuProduct.form);
      this.dom.formInputs = this.dom.form.querySelectorAll(
        select.all.formInputs
      );
      this.dom.cartButton = this.element.querySelector(
        select.menuProduct.cartButton
      );
      this.dom.priceElem = this.element.querySelector(
        select.menuProduct.priceElem
      );
      this.dom.imageWrapper = this.element.querySelector(
        select.menuProduct.imageWrapper
      );
      this.dom.amountWidgetElem = this.element.querySelector(
        select.menuProduct.amountWidget
      );
    }

    initAccordion() {
      this.dom.accordionTrigger.addEventListener('click', event => {
        event.preventDefault();

        const activeProduct = document.querySelector(
          select.all.menuProductsActive
        );
        if (activeProduct && activeProduct !== this.element) {
          activeProduct.classList.remove(classNames.menuProduct.wrapperActive);
        }

        this.element.classList.toggle(classNames.menuProduct.wrapperActive);
      });
    }

    initOrderForm() {
      this.dom.form.addEventListener('submit', event => {
        event.preventDefault();

        this.processForm();
      });

      for (const input of this.dom.formInputs) {
        input.addEventListener('change', () => {
          this.processForm();
        });
      }

      this.dom.cartButton.addEventListener('click', event => {
        event.preventDefault();

        this.processForm();
        this.addToCart();
      });
    }

    processForm() {
      const formData = utils.serializeFormToObject(this.dom.form);

      let price = this.data.price;

      if (this.data.params) {
        for (const paramId in this.data.params) {
          const param = this.data.params[paramId];

          for (const optionId in param.options) {
            const option = param.options[optionId];

            const img = this.dom.imageWrapper.querySelector(
              `img[class~="${paramId}-${optionId}"]`
            );

            if (formData[paramId] && formData[paramId].includes(optionId)) {
              if (!option.default) {
                price += option.price;
              }

              img && img.classList.add(classNames.menuProduct.imageVisible);
            } else {
              if (option.default) {
                price -= option.price;
              }

              img && img.classList.remove(classNames.menuProduct.imageVisible);
            }
          }
        }
      }

      this.priceSingle = price;

      price *= this.amountWidget.value;

      this.dom.priceElem.innerHTML = price;
    }

    initAmountWidget() {
      this.amountWidget = new AmountWidget(this.dom.amountWidgetElem);

      this.dom.amountWidgetElem.addEventListener('updated', () => {
        this.processForm();
      });
    }

    prepareCartProductParams() {
      const formData = utils.serializeFormToObject(this.dom.form);

      const params = {};

      if (this.data.params) {
        for (const paramId in this.data.params) {
          const param = this.data.params[paramId];

          params[paramId] = {
            label: param.label,
            options: {},
          };

          for (const optionId in param.options) {
            const option = param.options[optionId];

            if (formData[paramId] && formData[paramId].includes(optionId)) {
              params[paramId].options[optionId] = option.label;
            }
          }
        }
      }

      return params;
    }

    prepareCartProduct() {
      const productSummary = {};

      productSummary.id = this.id;
      productSummary.name = this.data.name;
      productSummary.amount = this.amountWidget.value;

      productSummary.priceSingle = this.priceSingle;
      productSummary.price = productSummary.priceSingle * productSummary.amount;

      productSummary.params = this.prepareCartProductParams();

      return productSummary;
    }

    addToCart() {
      const data = this.prepareCartProduct();
      app.cart.add(data);
    }
  }

  class AmountWidget {
    constructor(element) {
      this.element = element;

      this.getElements();
      this.initActions();
      this.setValue(settings.amountWidget.defaultValue);
    }

    getElements() {
      this.dom = {};

      this.dom.input = this.element.querySelector(select.widgets.amount.input);
      this.dom.linkDecrease = this.element.querySelector(
        select.widgets.amount.linkDecrease
      );
      this.dom.linkIncrease = this.element.querySelector(
        select.widgets.amount.linkIncrease
      );
    }

    initActions() {
      this.dom.input.addEventListener('change', () => {
        this.setValue(this.dom.input.value);
      });

      this.dom.linkDecrease.addEventListener('click', event => {
        event.preventDefault();

        this.setValue(--this.dom.input.value);
      });

      this.dom.linkIncrease.addEventListener('click', event => {
        event.preventDefault();

        this.setValue(++this.dom.input.value);
      });
    }

    announce() {
      const event = new Event('updated');
      this.element.dispatchEvent(event);
    }

    setValue(value) {
      const newValue = parseInt(value);

      if (newValue !== this.value && !isNaN(newValue)) {
        if (
          newValue <= settings.amountWidget.defaultMax &&
          newValue >= settings.amountWidget.defaultMin
        ) {
          this.value = newValue;
          this.announce();
        }
      }

      this.dom.input.value = this.value;
    }
  }

  class Cart {
    constructor(element) {
      this.products = [];

      this.getElements(element);
      this.initActions();
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
    }

    initActions() {
      this.dom.toggleTrigger.addEventListener('click', () => {
        this.dom.wrapper.classList.toggle(classNames.cart.wrapperActive);
      });
    }

    add(menuProduct) {
      const generatedHTML = templates.cartProduct(menuProduct);
      this.element = utils.createDOMFromHTML(generatedHTML);

      this.dom.productList.appendChild(this.element);

      this.products.push(menuProduct);
    }
  }

  const app = {
    initMenu: function () {
      const thisApp = this;

      for (const productData in thisApp.data.products) {
        new Product(productData, thisApp.data.products[productData]);
      }
    },

    initCart: function () {
      const cartElem = document.querySelector(select.containerOf.cart);
      this.cart = new Cart(cartElem);
    },

    initData: function () {
      const thisApp = this;

      thisApp.data = dataSource;
    },

    init: function () {
      const thisApp = this;
      console.log('*** App starting ***');
      console.log('thisApp:', thisApp);
      console.log('classNames:', classNames);
      console.log('settings:', settings);
      console.log('templates:', templates);

      thisApp.initData();
      thisApp.initMenu();
      thisApp.initCart();
    },
  };

  app.init();
}
