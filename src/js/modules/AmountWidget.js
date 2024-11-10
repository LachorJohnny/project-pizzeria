import { select, settings } from "../settings.js";

export default class AmountWidget {
  constructor(element) {
    this.element = element;

    this.getElements();
    this.initActions();
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
    const event = new CustomEvent('updated', {
      bubbles: true,
    });

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
