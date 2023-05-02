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
      disableMobile: "true"
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

    const form = document.getElementById('retail-finder-form');
    const submitBtn = document.getElementById('appointment-submit');

    submitBtn.addEventListener('click', (event) => {
      event.preventDefault();

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
      const retailerName = new URLSearchParams(window.location.search).get('name');
      const retailerId = new URLSearchParams(window.location.search).get('id');
      var unmaskedPhone = Inputmask.unmask(phone, { mask: '(999) 999-9999' });
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      
      form.querySelectorAll('.error-message').forEach((element) =>  element.remove() );

      if (!firstName || !lastName || !email || !phone || unmaskedPhone.toString().length < 10 || !address1 || !city || !state || !zip || !eventDate || !noOfPeopleAttending || Number(noOfPeopleAttending) < 1 || !preferredDates || !emailPattern.test(email)) {
        alert('Please fill out all the required fields.');
        form.querySelectorAll('.form-input').forEach(element => {
          if (element.classList.contains('required')) {
            let formError = element.closest('.form-field').querySelector('.error-message');
            let errorDiv = document.createElement('span');
            errorDiv.classList.add('error-message');

            if (element.value.length > 0) {
              formError?.remove();
              if (element.getAttribute('name') === "email" && !emailPattern.test(email)){
                  errorDiv.innerText = 'Invalid email address';
                  element.parentNode.insertBefore(errorDiv,element.nextSibling);
                }
              if (element.getAttribute('name') === "phoneNumber" && unmaskedPhone.toString().length < 10){
                errorDiv.innerText = 'Invalid phone number';
                element.parentNode.insertBefore(errorDiv,element.nextSibling);
              }
              if (element.getAttribute('name') === "noOfPeopleAttending" && Number(noOfPeopleAttending) < 1){
                errorDiv.innerText = 'Invalid number';
                element.parentNode.insertBefore(errorDiv,element.nextSibling);
              }
            } else if(!formError) {
              errorDiv.innerText = 'This Field is required';
              element.parentNode.insertBefore(errorDiv,element.nextSibling);
            }
          }
        })
        return;
      }

      if (!terms) {
        alert('You must agree to the terms and conditions to continue.');
        let element =  document.getElementById('register_pass-news-terms');
        let errorDiv = document.createElement('span');
        errorDiv.classList.add('error-message');
        errorDiv.innerText = 'You must agree to the terms and conditions.';
        element.parentNode.insertBefore(errorDiv,element.nextSibling);
        return;
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
        RetailerName: this.encodeString(retailerName),
        id: retailerId ? parseInt(retailerId) : null,
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
          if(!response.ok){
            return response.json().then((data) => {
              throw new Error(data.error.message)
            })
          }
          window.location.href = "/thank-you-appointment/?name=" + this.encodeString(retailerName);
        })
        .catch((error) => {
          alert(error);
        })
    });

    $('.form-input,.form-select,.date-picker,.multiple-dates').on("change paste keyup", function(e) {

        const currentfield = e.target;
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const phone = form.elements.phoneNumber.value;
        var unmaskedPhone = Inputmask.unmask(phone, { mask: '(999) 999-9999' });
        const noOfPeopleAttending = form.elements.noOfPeopleAttending.value;
        if (currentfield.classList.contains('required')) {
          let formError = currentfield.closest('.form-field').querySelector('.error-message');
          if (currentfield.value.trim().length > 0) {
             formError?.remove();
            if (currentfield.getAttribute('name') === "email" && !emailPattern.test(currentfield.value)){
              $( "<span class='error-message'>Invalid email address</span>" ).insertAfter( currentfield);
              }
            if (currentfield.getAttribute('name') === "phoneNumber" && unmaskedPhone.toString().length < 10){
              $( "<span class='error-message'>Invalid phone number</span>" ).insertAfter( currentfield);
            }
            if (currentfield.getAttribute('name') === "noOfPeopleAttending" && Number(noOfPeopleAttending) < 1){
              $( "<span class='error-message'>Invalid number</span>" ).insertAfter( currentfield);
            }
          } else if(!formError) {
            $( "<span class='error-message'>This Field is required</span>" ).insertAfter( currentfield);
          }
        }
    });

    // $('.form-select,.date-picker,.multiple-dates').on("change paste keyup", function(e) {
    //   const currentfield = e.target;
    //   if (currentfield.classList.contains('required')) {
    //     let formError = currentfield.closest('.form-field').querySelector('.error-message');
    //     if (currentfield.value.trim().length > 0) {
    //        formError?.remove();
    //     } else if(!formError) {
    //       $( "<span class='error-message'>This Field is required</span>" ).insertAfter( currentfield);
    //     }
    //   }
    // });
  };

  encodeString(data) {
    return encodeURIComponent(data).replace(/%20/g, ' ');
  }
};