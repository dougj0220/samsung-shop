function webpay(itemSummary, total){

	if (!window.PaymentRequest) {
		// PaymentRequest API is not available. Forwarding to
		// legacy form based experience.
		location.href = '/samsung-shop/checkout.html';
		return;
	}

		// Supported payment methods
	var supportedInstruments = [{
		supportedMethods: ['amex', 'discover','mastercard','visa']
	},
	{
		supportedMethods: ['https://android.com/pay'], // <--change?
		data: {
			//product ID obtained from Samsung onboarding portal
			'productId': '02510116604241796260',
			'allowedCardNetworks': ['AMEX', 'mastercard', 'visa'],
			'paymentProtocol': 'PROTOCOL_3DS',
			'merchantName': 'Shop Samsung (demo)',
			'isReccurring': false,
			'orderNumber': 1000,
			'billingAddressRequired': 'zipOnly'
		}
	}];

	var details = {
		displayItems: [],
		shippingOptions: [
	    {
	      id: 'standard',
	      label: 'Standard shipping',
	      amount: {currency: 'USD', value: '10.00'},
	      selected: true
	    },
	    {
	      id: 'express',
	      label: 'Express shipping',
	      amount: {currency: 'USD', value: '25.00'}
	    }
		]
	};

	//populate display items with items from cart/buy now
	itemSummary.forEach( function(element){
		details['displayItems'].push({
			label: element['label'],
	  	amount: { currency: 'USD', value : (element['value']).replace('$', '') },
		});
	});
	//shipping 
	details['displayItems'].push(
	{
		label: 'Loyal customer discount',
		amount: { currency: 'USD', value : '-10.00' }, // -US$10.00
		pending: true // The price is not determined yet
	});
	//total
	details['total'] = {
  	label: 'Total',
  	amount: { currency: 'USD', value : total.replace('$', '')},
	};

	var options = {
	  requestPayerEmail: true,
		requestPayerName: true,
	  requestShipping: true,
		shippingType: 'shipping' // "shipping"(default), "delivery" or "pickup"
	};

	var payment = new PaymentRequest(
		supportedInstruments, // required payment method data
		details,              // required information about transaction
		options               // optional parameter for things like shipping, etc.
	);

	// Make PaymentRequest show to display payment sheet 
	payment.show().then(function(paymentResponse) {
		
	  // Process response
	  var paymentData = {
		  // payment method string
		  method: paymentResponse.methodName,
		  // payment details as you requested
		  details: paymentResponse.details.toJSON(),
		  // shipping address information
		  address: paymentResponse.shippingAddress.toJSON()
	  };

	  // Call complete to hide payment sheet
	  paymentResponse.complete('success');

	  console.log(JSON.stringify(paymentData));

	  location.href = '/samsung-shop/order-confirm.html';

	}).catch(function(err) {
	  console.error('Uh oh, something bad happened', err.message);
	});
}