import { templates, select, settings, classNames } from '../settings.js';
import { utils } from '../utils.js';
import AmountWidget from './AmountWidget.js';
import DatePicker from './DatePicker.js';
import HourPicker from './HourPicker.js';

export default class Booking {
  constructor(bookingContainer) {
    this.render(bookingContainer);
    this.initWidgets();
    this.getData();
    this.initActions();
  }

  render(bookingContainer) {
    const bookingHTML = templates.bookingWidget();

    this.dom = {};
    this.dom.wrapper = bookingContainer;

    this.dom.wrapper.innerHTML = bookingHTML;

    this.dom.peopleAmount = this.dom.wrapper.querySelector(
      select.booking.peopleAmount
    );
    this.dom.hoursAmount = this.dom.wrapper.querySelector(
      select.booking.hoursAmount
    );
    this.dom.datePicker = this.dom.wrapper.querySelector(
      select.widgets.datePicker.wrapper
    );
    this.dom.hourPicker = this.dom.wrapper.querySelector(
      select.widgets.hourPicker.wrapper
    );
    this.dom.tables = this.dom.wrapper.querySelectorAll(select.booking.tables);
    this.dom.floor = this.dom.wrapper.querySelector(select.booking.floor);
    this.dom.checkboxes = this.dom.wrapper.querySelectorAll(
      select.booking.checkbox
    );
    this.dom.phone = this.dom.wrapper.querySelector(select.booking.phone);
    this.dom.adress = this.dom.wrapper.querySelector(select.booking.address);
    this.dom.submit = this.dom.wrapper.querySelector(select.booking.submit);
  }

  initWidgets() {
    this.widgets = {};
    this.widgets.peopleAmountWidget = new AmountWidget(this.dom.peopleAmount);
    this.widgets.hoursAmountWidget = new AmountWidget(this.dom.hoursAmount);
    this.widgets.datePickerWidget = new DatePicker(this.dom.datePicker);
    this.widgets.hourPickerWidget = new HourPicker(this.dom.hourPicker);

    this.dom.wrapper.addEventListener('updated', () => {
      this.updateDOM();
    });
    this.dom.floor.addEventListener('click', event => {
      this.initTables(event);
    });
  }

  getData() {
    const startDate = Date.parse(
      utils.dateToStr(this.widgets.datePickerWidget.minDate)
    );
    const endDate = Date.parse(
      utils.dateToStr(this.widgets.datePickerWidget.maxDate)
    );

    const urls = {
      booking: `${settings.db.url}/${settings.db.booking}`,
      eventsCurrent: `${settings.db.url}/${settings.db.event}?${settings.db.notRepeatParam}`,
      eventsRepeat: `${settings.db.url}/${settings.db.event}?${settings.db.repeatParam}`,
    };

    Promise.all([
      fetch(urls.booking),
      fetch(urls.eventsCurrent),
      fetch(urls.eventsRepeat),
    ])
      .then(allResponses => {
        const bookingResponse = allResponses[0];
        const eventsCurrentResponse = allResponses[1];
        const eventsRepeatResponse = allResponses[2];
        return Promise.all([
          bookingResponse.json(),
          eventsCurrentResponse.json(),
          eventsRepeatResponse.json(),
        ]);
      })
      .then(([bookings, eventsCurrent, eventsRepeat]) => {
        const filteredEventsCurrent = eventsCurrent.filter(event => {
          const eventDate = Date.parse(event.date);
          return eventDate >= startDate && eventDate <= endDate;
        });

        const filteredEventsRepeat = eventsRepeat.filter(event => {
          const eventDate = Date.parse(event.date);
          return eventDate >= startDate && eventDate <= endDate;
        });

        this.parseData(bookings, filteredEventsCurrent, filteredEventsRepeat);
      });
  }

  parseData(bookings, eventsCurrent, eventsRepeat) {
    this.booked = {};

    for (const booking of bookings) {
      this.makeBooked(
        booking.date,
        booking.hour,
        booking.duration,
        booking.table
      );
    }

    for (const event of eventsCurrent) {
      this.makeBooked(event.date, event.hour, event.duration, event.table);
    }

    const minDate = this.widgets.datePickerWidget.minDate;
    const maxDate = this.widgets.datePickerWidget.maxDate;

    for (const event of eventsRepeat) {
      if (event.repeat === 'daily') {
        for (
          let loopDate = minDate;
          loopDate <= maxDate;
          loopDate = utils.addDays(loopDate, 1)
        ) {
          this.makeBooked(
            utils.dateToStr(loopDate),
            event.hour,
            event.duration,
            event.table
          );
        }
      }
    }

    this.updateDOM();
  }

  makeBooked(date, hour, duration, table) {
    if (typeof this.booked[date] === 'undefined') {
      this.booked[date] = {};
    }

    const startHour = utils.hourToNumber(hour);

    for (
      let hourBlock = startHour;
      hourBlock < startHour + duration;
      hourBlock += 0.5
    ) {
      if (typeof this.booked[date][hourBlock] === 'undefined') {
        this.booked[date][hourBlock] = [];
      }

      this.booked[date][hourBlock].push(table);
    }
  }

  updateDOM() {
    this.date = this.widgets.datePickerWidget.value;
    this.hour = utils.hourToNumber(this.widgets.hourPickerWidget.value);

    let allAvailable = false;

    if (
      typeof this.booked[this.date] === 'undefined' ||
      typeof this.booked[this.date][this.hour] === 'undefined'
    ) {
      allAvailable = true;
    }

    for (const table of this.dom.tables) {
      let tableId = table.getAttribute(settings.booking.tableIdAttribute);
      if (!isNaN(tableId)) {
        tableId = parseInt(tableId);
      }

      if (
        !allAvailable &&
        this.booked[this.date][this.hour].includes(tableId)
      ) {
        table.classList.add(classNames.booking.tableBooked);
      } else {
        table.classList.remove(classNames.booking.tableBooked);
      }

      table.classList.remove(classNames.booking.selected);
    }

    this.selectTableId = null;
  }

  initTables(event) {
    if (event.target.classList.contains('table')) {
      if (!event.target.classList.contains(classNames.booking.tableBooked)) {
        for (const table of this.dom.tables) {
          if (
            table.classList.contains(classNames.booking.selected) &&
            table !== event.target
          ) {
            table.classList.remove(classNames.booking.selected);
          }
        }

        if (event.target.classList.contains(classNames.booking.selected)) {
          event.target.classList.remove(classNames.booking.selected);
          this.selectTableId = null;
        } else {
          event.target.classList.add(classNames.booking.selected);
          this.selectTableId = parseInt(
            event.target.getAttribute(settings.booking.tableIdAttribute)
          );
        }
      } else {
        alert('This table is already booked!');
      }
    }
  }

  sendBookinng() {
    const url = `${settings.db.url}/${settings.db.booking}`;
    const payload = {
      date: this.date,
      hour: this.widgets.hourPickerWidget.correctValue,
      table: this.selectTableId,
      duration: this.widgets.hoursAmountWidget.value,
      ppl: this.widgets.peopleAmountWidget.value,
      starters: [],
      phone: this.dom.phone.value,
      adress: this.dom.adress.value,
    };

    this.dom.checkboxes.forEach(checkbox => {
      if (checkbox.checked) {
        payload.starters.push(checkbox.value);
      }
    });

    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'aplication/json',
      },
      body: JSON.stringify(payload),
    };

    fetch(url, options)
      .then(response => response.json())
      .then(data => {
        this.makeBooked(data.date, data.hour, data.duration, data.table);
        this.updateDOM();
      });
  }

  initActions() {
    this.dom.submit.addEventListener('click', event => {
      event.preventDefault();
      this.sendBookinng();
    });
  }
}
