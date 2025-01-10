/* global Flickity */
import { templates, homepageData, select } from '../settings.js';

export default class Home {
  constructor(element) {
    this.data = homepageData;

    this.render(element);
    this.initCarousel();
  }

  render(element) {
    this.dom = {};
    this.dom.wrapper = element;

    const generatedHTML = templates.homepage(this.data);
    this.dom.wrapper.innerHTML = generatedHTML;
  }

  initWidgets() {}

  initCarousel() {
    this.flkty = new Flickity(select.homepage.mainCarousel, {
      cellAlign: 'left',
      contain: true,
      autoPlay: 3000,
      wrapAround: true,
    });
  }
}
