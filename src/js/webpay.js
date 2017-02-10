var webpay = function (){
	//init
}

webpay.prototype.setup = function(itemSummary, total){
	var discount = -10.00;
	if (!window.PaymentRequest) {
		// PaymentRequest API is not available. Forwarding to
		// legacy form based experience.
		window.top.location.href = 'https://maheshkk.github.io/samsung-shop/checkout.html';
		return;
	}
	
	// Supported payment methods
	var supportedInstruments = [
	{
		supportedMethods: ['amex', 'discover','mastercard','visa']
	},		
 	{		
 		supportedMethods: ['https://samsung.com/pay'], 		
 		data: {		
 			//product ID obtained from Samsung onboarding portal		
 			'productId': 'a6bea2455a6749c6945ee7',		
 			'allowedCardNetworks': ['AMEX', 'mastercard', 'visa'],		
 			'orderNumber': "1233123",		
 			'merchantName': 'Shop Samsung (demo)',		
 			'debug': {		
 				'APIKey': '6874ad7c7c10403396811780aef9ecf3'		
 			}		
		}
 	}];

 	// details contain info about the transaction
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
		var val = element['value'];
		if( (typeof val) === 'string' ) val = val.replace('$', '');
		details['displayItems'].push({
			label: element['label'],
	  	amount: { currency: 'USD', value : val }
		});
	});

	//shipping 
	details['displayItems'].push(
	{
		label: 'Loyal customer discount',
		amount: { currency: 'USD', value : discount }, // -US$10.00
		pending: true 																 // The price is not determined yet
	});

	//total
	var finalCost = parseFloat(total.replace('$', '')) + discount;
	details['total'] = {
  		label: 'Total',
  		amount: { currency: 'USD', value : finalCost},
	};
	if(finalCost < 0.00){
		alert('Your cart is empty');
		return;
	}

	// collect additional information
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

	//detect when shipping address changes
 	payment.addEventListener('shippingaddresschange', function(e) {
		console.log("address change");
		e.updateWith(new Promise(function(resolve) {
			resolve(details);
		}));
	});
	 
 	//detect shipping option changes
 	payment.addEventListener('shippingoptionchange', function(e) {
 		console.log('shipping option changed');
	  e.updateWith( new Promise( function(details, shippingOption) {
	    var selectedShippingOption;
	    var otherShippingOption;
	    if (shippingOption === 'standard') {
	      selectedShippingOption = details['shippingOptions'][0];
	      otherShippingOption = detail['shippingOptions'][1];
	      details['total']['amount']['value'] -= 10.00;
	      console.log(details['total']['amount']['value'] );
	    } else {
	      selectedShippingOption = details['shippingOptions'][1];
	      otherShippingOption = details['shippingOptions'][0];
	      details['total']['amount']['value']  -= 25.00;
	      console.log(details['total']['amount']['value'] );
	    }
	    /*
	    if (details.displayItems.length === 2) {
	      details.displayItems.splice(1, 0, selectedShippingOption);
	    } else {
	      details.displayItems.splice(1, 1, selectedShippingOption);
	    }
	    */
	    selectedShippingOption.selected = true;
	    otherShippingOption.selected = false;
	    return Promise.resolve(details);
	  }));
	});


	// Make PaymentRequest show to display payment sheet 
	payment.show().then(function(paymentResponse) {	
	  // Process response
	  var paymentData = {
		  // payment method string
		  method: paymentResponse.methodName,
		  // payment details as you requested
		  details: JSON.stringify(paymentResponse.details),
		  // shipping address information
		  address: JSON.stringify(paymentResponse.shippingAddress)
	  };

	  console.log(paymentData);
	  processPayment(paymentResponse, finalCost).then(function(success) {
	  	if (success) {
				// Call complete to hide payment sheet
				paymentResponse.complete('success');
				window.top.location.href = 'https://maheshkk.github.io/samsung-shop/order-confirm.html'
	   	} else {
		   	// Call complete to hide payment sheet
				paymentResponse.complete('fail');
				console.log("Something went wrong with processing payment");
		  }
	  }).catch(err => {
	      console.error("Uh oh, something bad happened while processing payment", err.message);
	  });
	}).catch(err => {
	  console.error("Uh oh, something bad happened", err.message);
	});
}

