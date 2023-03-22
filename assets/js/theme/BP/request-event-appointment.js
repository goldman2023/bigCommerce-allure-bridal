import PageManager from '../page-manager'

export default class RequestEventAppointment extends PageManager {

  constructor(context) {
    super(context);
    this.autocomplete = null;
    this.address1Field = null;
    this.address2Field = null;
    this.postalField = null;
    this.initAutocomplete = function(){
      this.address1Field = document.querySelector('#address1')
      this.address2Field = document.querySelector('#address2')
      this.postalField = document.querySelector('#zip')
      // Create the autocomplete object, restricting the search predictions to
      // addresses in the US and Canada.
      this.autocomplete = new google.maps.places.Autocomplete(this.address1Field, {
        componentRestrictions: { country: ['us', 'ca'] },
        fields: ['address_components', 'geometry'],
        types: ['address'],
      })
      this.address1Field.focus()
      this.autocomplete.addListener('place_changed', this.fillInAddress)
    }
    this.fillInAddress = function () {
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
  }

   onReady = () => {
    window.initAutocomplete = this.initAutocomplete;
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
    //Initialize Inputmask
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
      event.preventDefault() // prevent the form from being submitted

      // var retailFinderFormInputs = document.querySelectorAll("#event-appointment-form .form-input");
      var retailFinderFormInputs = form.querySelectorAll('.form-input')
      if (retailFinderFormInputs) {
        for (let i = 0; i < retailFinderFormInputs.length; i++) {
          if (retailFinderFormInputs[i].classList.contains('required')) {
            if (retailFinderFormInputs[i].value.length > 0) {
              var retailFinderFormError = retailFinderFormInputs[i]
                .closest('.form-field')
                .querySelector('.error-message')
              // for(let j=0; j<retailFinderFormError.length; j++){
              if (retailFinderFormError) {
                retailFinderFormError.remove()
              }
              // }
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

      // get the form values
      const firstName = form.elements.firstName.value
      const lastName = form.elements.lastName.value
      const email = form.elements.email.value

      const phone = form.elements.phoneNumber.value
      //const phoneType = form.elements.phoneType.value;
      // const smsAlerts = form.elements.smsAlerts.checked;
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
      // validate the form values
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
        // show an error message if any of the required fields are empty
        alert('Please fill out all the required fields.')
        return
      }

      if (!terms) {
        // show an error message if the "I Agree" checkbox is not checked
        alert('You must agree to the terms and conditions to continue.')
        return
      }

      // submit the form using fetch
      const url =
        'https://apim.workato.com/allure/allure-b2c-website/retailer/appointmentrequest' // get the form action url
      const method = 'POST' // get the form method (POST, GET, etc.)
      //Generate form data
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
        method: method,
        headers: {
          'Content-Type': 'application/json',
          'API-TOKEN':
            'c0bce025e1792e283cfbd229321ecc423ae60257cf462c8d262d7b10fd9e41f9',
        },
        body: JSON.stringify(formData),
      })
        .then((response) => {
          // do something with the response

          //hide form section and show thank you section
          document.getElementById('event-appointment-form').style.display =
            'none'
          document.getElementById('eventName').innerText = eventName
          document.getElementById('thank-you').style.display = 'block'
          //Go to top of page
          window.scrollTo(0, 0)
        })
        .catch((error) => {
          // handle any errors
          alert(error)
        })
    })
  };

};