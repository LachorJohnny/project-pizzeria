import { templates, select, classNames, settings } from '../settings.js';
import { utils } from '../utils.js';
import AmountWidget from './AmountWidget.js';
import { app } from '../index.js';

export default class Product {
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
    this.dom.formInputs = this.dom.form.querySelectorAll(select.all.formInputs);
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
    this.amountWidget.setValue(settings.amountWidget.defaultValue);

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
