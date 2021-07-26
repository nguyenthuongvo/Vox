var r = g = b = 255;
var br = 255;
var isSendData = false;
var slider
var serviveUuid = 65504;
var characteristicUuid = 65505;
const terminal = new BluetoothTerminal(serviveUuid,characteristicUuid,'\n','\n');


terminal.receive = function(data) {
  isSendData = false;

  this._log("Enabled: " + data.getUint8(0));
  this._log("Preset: " + data.getUint8(1));
  this._log("Bright: " + data.getUint8(3));
  this._log("R: " + data.getUint8(8));
  this._log("G: " + data.getUint8(9));
  this._log("B: " + data.getUint8(10));
  this._log("W: " + data.getUint8(11));

  br = data.getUint8(3);
  r = data.getUint8(8);
  g = data.getUint8(9);
  b = data.getUint8(10);
  

  $('.battery_level').text(data.getUint8(7)); // LED COUNT
  setPowerUI(data.getUint8(0)); // Enabled


  //Check HOT MODE
  if (data.getUint8(8) == 255 && data.getUint8(9) == 0 && data.getUint8(10) == 0) {
    $('#hotmode').trigger('click');
  }

  //Check COLD MODE
  if (data.getUint8(8) == 0 && data.getUint8(9) == 255 && data.getUint8(10) == 255) {
    $('#coldmode').trigger('click');
  }

  //Check HOME MODE
  if (data.getUint8(8) == 242 && data.getUint8(9) == 116 && data.getUint8(10) == 5) {
    $('#homemode').trigger('click');
  }

  // Check Brightness
  slider.slider( "value", br );

  //Set isSendData for webbluetooth send value
  isSendData = true;

};


$(document).ready(function() {

  // Helpers.
  const defaultDeviceName = 'No device is connected';

  slider = $( "#slider" ).slider({
    animate: "fast",
    orientation: "vertical",
    range: "min",
    value: 0,
    min: 1,
    max: 255,
    disabled: true,
    change: async function( event, ui ) {
        const sliderValue = slider.slider('value');
        if (isSendData) {
          await terminal.setBrightness(sliderValue);
        }
    }
  });

  $('#connect').on('click', function() {
    spinner('block');
    isSendData = false;
    terminal.connect().then(value => {
      $('#device-name').text(terminal.getDeviceName() + " is connected");
      $('#connect').css('display','none');
      $('#disconnect').css('display','block');
      spinner('none');

      terminal.getDeviceInfo().then(rs => {
        console.log(rs);
      }).catch(error => {
        console.log(error);
      })

    }).catch(error => {
      console.log(error);
      spinner('none');
    });

  });

  $('#disconnect').on('click', async function() {
    spinner('block');
    await terminal.disconnect();
    isSendData = false;
    $('#device-name').text(defaultDeviceName);
    $('#connect').css('display','block');
    $('#disconnect').css('display','none');
    $('.battery_level').text('--');
    spinner('none');
  });

  $('#power').on('click', async function() {
    const isDisabled =  slider.hasClass('ui-state-disabled');
    if (isDisabled) {
      await setPowerUI(true);
    } else {
      await setPowerUI(false);
    }
  });

  $('#hotmode').on('click', async function() {
    $('#slider .ui-slider-range-min').removeClass('power home hot cold');
    $('#slider .ui-slider-range-min').toggleClass('hot');
    if (isSendData) {
      await terminal.setSolidColor(255,0,0);
    }
  });

  
  $('#coldmode').on('click', async function() {
    $('#slider .ui-slider-range-min').removeClass('power home hot cold');
    $('#slider .ui-slider-range-min').toggleClass('cold');
    if (isSendData) {
      await terminal.setSolidColor(0,255,255);
    }
  });

  $('#homemode').on('click', async function() {
    $('#slider .ui-slider-range-min').removeClass('power home hot cold');
    $('#slider .ui-slider-range-min').toggleClass('home');
    if (isSendData) {
      await terminal.setSolidColor(242,116,5);
    }
  });


});


async function setPowerUI(isOn = false) {
  console.log('isSendData: ' + isSendData);
  if (!isOn) {
    slider.slider( "disable" );
    $('#hotmode, #coldmode, #homemode').attr('disabled',true);
    if (isSendData) {
      r = 0, g = 0, b = 0;
      await terminal.setPowerOff();
    }
    
  } else {

    slider.slider( "enable" );
    $('#hotmode, #coldmode, #homemode').attr('disabled',false);
    if (isSendData) {
      r = 242, g = 116, b = 5;
      await terminal.setPowerOn();
    }

  }
}

function spinner(display = 'none') {
  if (display == 'none') {
    $('#device-name').css('display', 'block');
    $('#connect , #disconnect').removeAttr("disabled");
  } else {
    $('#device-name').css('display', 'none');
    $('#connect , #disconnect').attr('disabled',true);
  }

  $('.spinner').css('display', display);
}