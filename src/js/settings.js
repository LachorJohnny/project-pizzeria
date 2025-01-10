export const select = {
  templateOf: {
    menuProduct: '#template-menu-product',
    cartProduct: '#template-cart-product',
    bookingWidget: '#template-booking-widget',
    homepage: '#template-homepage',
  },
  containerOf: {
    home: '.home-wrapper',
    menu: '#product-list',
    cart: '#cart',
    pages: '#pages',
    booking: '.booking-wrapper',
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
    datePicker: {
      wrapper: '.date-picker',
      input: `input[name="date"]`,
    },
    hourPicker: {
      wrapper: '.hour-picker',
      input: 'input[type="range"]',
      output: '.output',
    },
  },
  cart: {
    productList: '.cart__order-summary',
    toggleTrigger: '.cart__summary',
    totalNumber: `.cart__total-number`,
    totalPrice:
      '.cart__total-price strong, .cart__order-total .cart__order-price-sum strong',
    subtotalPrice: '.cart__order-subtotal .cart__order-price-sum strong',
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
  booking: {
    peopleAmount: '.people-amount',
    hoursAmount: '.hours-amount',
    floor: '.floor-plan',
    tables: '.floor-plan .table',
    checkbox: '.booking-options .checkbox input',
    address: '.order-confirmation input[name=address]',
    phone: '.order-confirmation input[name=phone]',
    submit: '.order-confirmation button',
  },
  nav: {
    links: '.main-nav a',
  },
  homepage: {
    mainCarousel: '.main-carousel',
  },
};

export const classNames = {
  menuProduct: {
    wrapperActive: 'active',
    imageVisible: 'active',
  },
  cart: {
    wrapperActive: 'active',
  },
  booking: {
    loading: 'loading',
    tableBooked: 'booked',
    selected: 'selected',
  },
  nav: {
    active: 'active',
  },
  pages: {
    active: 'active',
  },
};

export const settings = {
  amountWidget: {
    defaultValue: 1,
    defaultMin: 1,
    defaultMax: 10,
  },
  cart: {
    defaultDeliveryFee: 20,
  },
  hours: {
    open: 12,
    close: 24,
  },
  datePicker: {
    maxDaysInFuture: 14,
  },
  booking: {
    tableIdAttribute: 'data-table',
  },
  db: {
    url: '//localhost:3131',
    products: 'products',
    orders: 'orders',
    booking: 'bookings',
    event: 'events',
    notRepeatParam: 'repeat=false',
    repeatParam: 'repeat_ne=false',
  },
};

export const templates = {
  menuProduct: Handlebars.compile(
    document.querySelector(select.templateOf.menuProduct).innerHTML
  ),
  cartProduct: Handlebars.compile(
    document.querySelector(select.templateOf.cartProduct).innerHTML
  ),
  bookingWidget: Handlebars.compile(
    document.querySelector(select.templateOf.bookingWidget).innerHTML
  ),
  homepage: Handlebars.compile(
    document.querySelector(select.templateOf.homepage).innerHTML
  ),
};

export const homepageData = {
  carouselData: [
    {
      img: 'images/homepage/pizza-3.jpg',
      title: 'Lorem ipsum',
      text: 'Lorem, ipsum dolor sit amet consectetur adipisicing elit. Aliquam, ab. Quos, praesentium.',
      author: 'Jane Doe',
    },
    {
      img: 'images/homepage/pizza-3.jpg',
      title: 'Voluptate',
      text: 'Lorem, ipsum dolor sit amet consectetur adipisicing elit. Vero perspiciatis facere reiciendis alias maxime esse voluptatibus.',
      author: 'Eric Johnson',
    },
    {
      img: 'images/homepage/pizza-3.jpg',
      title: 'Vero perspiciatis',
      text: 'Lorem ipsum dolor, sit amet consectetur adipisicing elit. Voluptate facere quisquam minus dolore.',
      author: 'Lina Monroe',
    },
  ],
  galleryImageLinks: [
    'images/homepage/pizza-4.jpg',
    'images/homepage/pizza-5.jpg',
    'images/homepage/pizza-6.jpg',
    'images/homepage/pizza-7.jpg',
    'images/homepage/pizza-8.jpg',
    'images/homepage/pizza-9.jpg',
  ],
};
