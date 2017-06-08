var relativePateOfExtension = "../extension_sample";


var fs = require('fs');
var webdriver = require('selenium-webdriver'),
		By = webdriver.By,
		until = webdriver.until;
var driver;	
var inputsThatShouldPass = [];
var inputsThatShouldBlock = [];	


var testInputs = fs.readFileSync('scripts.txt').toString().split("\n");
determineExpectedBehavior();

function initWebDriver(loadExtension){
	var chromeCapabilities = webdriver.Capabilities.chrome();
	var chromeOptions = {
	    'args': ["--disable-xss-auditor"]
	};
	if(loadExtension){
		chromeOptions['args'].push("load-extension="+relativePateOfExtension);
	}

	chromeCapabilities.set('chromeOptions', chromeOptions);
	driver = new webdriver.Builder().withCapabilities(chromeCapabilities).build();

	
}

//This checks each script without the xss-auditor and without the extension to see what desired behavior should be
function determineExpectedBehavior(){
		initWebDriver(false);
		checkBehavior(testInputs.length-1)

}

function testAgainstExpectedBehavior(){
		driver.quit();
		initWebDriver(true);
		testPassingInputs(inputsThatShouldPass.length-1)

}

function finished(){
	driver.quit();
	console.log("");
	console.log("Tests Finished.")
}

function testPassingInputs(countDown){
	var input = inputsThatShouldPass[countDown]
	driver.get('http://www.cc.gatech.edu/~rgiri8/xss_test.html');
	driver.findElement(By.id('get_')).sendKeys(input);
	driver.findElement(By.id('getsub')).click();
	driver.getTitle().then(function(title){
		console.log("")
		console.log("")
		if(title == "Test your XSS extension here!"){
			console.log("TEST PASSED");
			console.log("input: ", input);
			console.log("Reason: Input successfully was NOT blocked.")
		}
		else{
			console.log("**** TEST FAILED ****")
			console.log("input: ", input);
			console.log("Reason: Input was blocked by extension, but should not have.")
		}

		if(countDown > 0){testPassingInputs(countDown-1);}else{testBlockingInputs(inputsThatShouldBlock.length-1)}
	})

}

function testBlockingInputs(countDown){
	var input = inputsThatShouldBlock[countDown]
	driver.get('http://www.cc.gatech.edu/~rgiri8/xss_test.html');
	driver.findElement(By.id('get_')).sendKeys(input);
	driver.findElement(By.id('getsub')).click();
	driver.getTitle().then(function(title){
		console.log("")
		console.log("")
		if(title != "Test your XSS extension here!"){
			console.log("TEST PASSED");
			console.log("input: ", input);
			console.log("Reason: Input was successfully blocked.")
		}
		else{
			console.log("**** TEST FAILED ****")
			console.log("input: ", input);
			console.log("Reason: Input should have been blocked by extension.")
		}

		if(countDown > 0){testBlockingInputs(countDown-1);}else{finished()}
	})

}

function checkBehavior(countDown){
	var script = testInputs[countDown];
	driver.get('http://www.cc.gatech.edu/~rgiri8/xss_test.html');
	driver.findElement(By.id('get_')).sendKeys(script);
	driver.findElement(By.id('getsub')).click();



	driver.findElement(By.css('h2')).then(function(webElement) {

        //console.log('should block this', script);
        inputsThatShouldBlock.push(script);
        if(countDown > 0){checkBehavior(countDown-1);}else{testAgainstExpectedBehavior()}
    }, function(err) {
    	
    	//element wasnt found, check for h3


    	driver.findElement(By.css('h3')).then(function(webElement) {
        //console.log('should pass this', script);
        inputsThatShouldPass.push(script);
        if(countDown > 0){checkBehavior(countDown-1);}else{testAgainstExpectedBehavior()}
		    }, function(err) {
		    	
		    	//element wasnt found, check for h3
		        

		        
		    });
        

        
    });



}
