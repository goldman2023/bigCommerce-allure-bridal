import PageManager from '../page-manager'

export default class ThankYou extends PageManager {

  constructor(context) {
    super(context);
  }

   onReady = () => {
      const retailerName = new URLSearchParams(window.location.search).get('name');
      console.log(retailerName)
      document.getElementById('retailerName').innerText = this.decodeString(retailerName);
   }

   decodeString(data) {
    return decodeURIComponent(data);
  }
}