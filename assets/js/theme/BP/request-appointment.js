import PageManager from '../page-manager'

export default class RequestAppointment extends PageManager {

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
          document.querySelector("#state").value = component.short_name;
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
    const url= this.context.requestAppointmentUrl;
    const googleApiToken = this.context.googleApiToken;
    document.querySelector("#state").style.display = "block";
    document.querySelector("#state").nextSibling.remove();

    const script = document.createElement('script');
    script.setAttribute('async', '');
    script.setAttribute('src', `https://maps.googleapis.com/maps/api/js?key=${googleApiToken}&callback=initAutocomplete&libraries=places`);
    document.head.appendChild(script);

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

    document.getElementById('retail-finder-form').addEventListener(
      'invalid',
      (function () {
        return function (e) {
          e.preventDefault()
        }
      })(),
      true,
    )

    const form = document.getElementById('retail-finder-form')
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      var retailFinderFormInputs = form.querySelectorAll('.form-input')
      if (retailFinderFormInputs) {
        for (let i = 0; i < retailFinderFormInputs.length; i++) {
          if (retailFinderFormInputs[i].classList.contains('required')) {
            var retailFinderFormError = retailFinderFormInputs[i].closest('.form-field').querySelector('.error-message');
            if (retailFinderFormInputs[i].value.length > 0) {
              if (retailFinderFormError) {
                retailFinderFormError.remove();
              }
            } else {
              var errorDiv = document.createElement('span');
              errorDiv.classList.add('error-message');
              errorDiv.innerText = 'This Field is required';
              if(retailFinderFormInputs[i].getAttribute('type') !== "hidden" && !retailFinderFormError){
                retailFinderFormInputs[i].parentNode.insertBefore(errorDiv,retailFinderFormInputs[i].nextSibling);
              }
            }
          }
        }
      }

      const firstName = form.elements.firstName.value;
      const lastName = form.elements.lastName.value;
      const email = form.elements.email.value;
      const phone = form.elements.phoneNumber.value;
      const emailAlerts = form.elements.emailAlerts.checked;
      const terms = form.elements.termsAndCond.checked;
      const address1 = form.elements.address1.value;
      const address2 = form.elements.address2.value;
      const city = form.elements.city.value;
      const state = form.elements.state.value;
      const zip = form.elements.zip.value;
      const eventDate = form.elements.eventDate.value;
      const noOfPeopleAttending = form.elements.noOfPeopleAttending.value;
      const preferredDates = form.elements.preferredDates.value;
      const retailerName = new URLSearchParams(window.location.search).get('retailerName');
      const retailerId = new URLSearchParams(window.location.search).get('retailerId');

      var unmaskedPhone = Inputmask.unmask(phone, { mask: '(999) 999-9999' })
      if (!firstName || !lastName || !email || !phone || unmaskedPhone.length < 10 || !address1 || !city || !state || !zip || !eventDate || !noOfPeopleAttending || !preferredDates) {
        alert('Please fill out all the required fields.');
        return;
        }

      if (!terms) {
        alert('You must agree to the terms and conditions to continue.')
        return
      }
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
        EventDate: eventDate,
        NumberPeopleinAppointment: parseInt(noOfPeopleAttending),
        EmailOptin: emailAlerts,
        RetailerName: retailerName,
        RetailerId: retailerId ? parseInt(retailerId) : 0,
        DirectBook: "true",
        AppointmentDates: preferredDates
      }
      fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })
        .then((response) => {
       
          document.getElementById('retail-finder-form').style.display =
            'none'
          document.getElementById('retailerName').innerText = retailerName;
          document.getElementById('thank-you').style.display = 'block'
      
          window.scrollTo(0, 0)
        })
        .catch((error) => {
          alert(error)
        })
    })
  };

};