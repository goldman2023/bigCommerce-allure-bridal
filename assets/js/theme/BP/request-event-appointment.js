import PageManager from '../page-manager'

export default class RequestEventAppointment extends PageManager {

  constructor(context) {
    super(context);
    this.autocomplete = null;
    this.address1Field = null;
    this.address2Field = null;
    this.postalField = null;
  }
  initAutocomplete() {
    this.address1Field = document.querySelector('#address1')
    this.address2Field = document.querySelector('#address2')
    this.postalField = document.querySelector('#zip')
    this.autocomplete = new google.maps.places.Autocomplete(this.address1Field, {
      componentRestrictions: { country: ['us', 'ca'] },
      fields: ['address_components', 'geometry'],
      types: ['address'],
    })
    this.address1Field.focus()
    this.autocomplete.addListener('place_changed', this.fillInAddress.bind(this))
  }

  fillInAddress() {
    const place = this.autocomplete.getPlace()
    let address1 = ''
    let postcode = ''
    for (const component of place.address_components) {
      const componentType = component.types[0]

      switch (componentType) {
        case 'street_number': {
          address1 = `${component.long_name} ${address1}`
          break
        }

        case 'route': {
          address1 += component.short_name
          break
        }

        case 'postal_code': {
          postcode = `${component.long_name}${postcode}`
          break
        }

        case 'locality':
          document.querySelector('#city').value = component.long_name
          break
        case 'administrative_area_level_1': {
          document.querySelector('#state').value = component.short_name
          break
        }
        case 'country':
          break
      }
    }

    this.address1Field.value = address1
    this.postalField.value = postcode
    this.address2Field.focus()
  }

   onReady = () => {
    window.initAutocomplete = this.initAutocomplete.bind(this);
    flatpickr('.date-picker', {
      position: 'below',
      monthSelectorType: 'static',
      minDate: 'today',
    })
    flatpickr('.inline-picker', {
      inline: true,
      monthSelectorType: 'static',
      minDate: 'today',
    })
    flatpickr('.multiple-dates', {
      monthSelectorType: 'static',
      minDate: 'today',
      mode: 'multiple',
      position: 'below',
      onChange: function (selectedDates, dateStr, instance) {
        var selectedDatesStr = selectedDates.reduce(function (acc, ele) {
          var str = instance.formatDate(ele, 'd/m/Y')
          acc = acc == '' ? str : acc + ';' + str
          return acc
        }, '')
        instance.set('enable', [
          function (date) {
            if (selectedDates.length >= 3) {
              var currDateStr = instance.formatDate(date, 'd/m/Y')
              var x = selectedDatesStr.indexOf(currDateStr)
              return x != -1
            } else {
              return true
            }
          },
        ])
      },
    })
    Inputmask({ mask: '(999) 999-9999' }).mask(document.getElementById('phone'))

    document.getElementById('event-appointment-form').addEventListener(
      'invalid',
      (function () {
        return function (e) {
          e.preventDefault()
        }
      })(),
      true,
    )

    const form = document.getElementById('event-appointment-form')
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      var retailFinderFormInputs = form.querySelectorAll('.form-input')
      if (retailFinderFormInputs) {
        for (let i = 0; i < retailFinderFormInputs.length; i++) {
          if (retailFinderFormInputs[i].classList.contains('required')) {
            if (retailFinderFormInputs[i].value.length > 0) {
              var retailFinderFormError = retailFinderFormInputs[i]
                .closest('.form-field')
                .querySelector('.error-message')
              if (retailFinderFormError) {
                retailFinderFormError.remove();
              }
            } else {
              if (
                retailFinderFormInputs[i]
                  .closest('.form-field')
                  .querySelectorAll('.error-message').length > 0
              ) {
              } else {
                var errorDiv = document.createElement('span')
                errorDiv.classList.add('error-message')
                errorDiv.innerText = 'This Field is required'

                insertAfter(errorDiv, retailFinderFormInputs[i])

                function insertAfter(newNode, existingNode) {
                  existingNode.parentNode.insertBefore(
                    newNode,
                    existingNode.nextSibling,
                  )
                }
              }
            }
          }
        }
      }

      const firstName = form.elements.firstName.value
      const lastName = form.elements.lastName.value
      const email = form.elements.email.value
      const phone = form.elements.phoneNumber.value
      const emailAlerts = form.elements.emailAlerts.checked
      const terms = form.elements.termsAndCond.checked
      const address1 = form.elements.address1.value
      const address2 = form.elements.address2.value
      const city = form.elements.city.value
      const state = form.elements.state.value
      const zip = form.elements.zip.value
      const weddingDate = form.elements.weddingDate.value


      const noOfPeopleAttending = form.elements.noOfPeopleAttending.value
      const eventName = new URLSearchParams(window.location.search).get(
        'eventName',
      )
      const eventId = new URLSearchParams(window.location.search).get('eventId')
      var unmaskedPhone = Inputmask.unmask(phone, { mask: '(999) 999-9999' })
      if (
        !firstName ||
        !lastName ||
        !email ||
        !phone ||
        unmaskedPhone.length < 10 ||
        !address1 ||
        !city ||
        !state ||
        !zip ||
        !weddingDate ||
        !noOfPeopleAttending
      ) {
        alert('Please fill out all the required fields.')
        return
      }

      if (!terms) {
        alert('You must agree to the terms and conditions to continue.')
        return
      }
      const url= this.context.requestEventAppointmentUrl;

      console.log(url)
      const formData = {
        FirstName: firstName,
        LastName: lastName,
        Email: email,
        PhoneNumber: '+1' + unmaskedPhone,
        Address1: address1,
        Address2: address2,
        City: city,
        State: state,
        PostalCode: zip,
        weddingDate: weddingDate,
        NumberPeopleinAppointment: parseInt(noOfPeopleAttending),
        EmailOptin: emailAlerts,
        EventName: eventName,
        EventId: eventId ? parseInt(eventId) : 0,
        DirectBook: 'true',
      }
      fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })
        .then((response) => {
       
          document.getElementById('event-appointment-form').style.display =
            'none'
          document.getElementById('eventName').innerText = eventName
          document.getElementById('thank-you').style.display = 'block'
      
          window.scrollTo(0, 0)
        })
        .catch((error) => {
          alert(error)
        })
    })
  };

};