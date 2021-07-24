var r = g = b = 255;
var serviveUuid = 0xFFE0
var characteristicUuid = 0xFFE1
const terminal = new BluetoothTerminal(serviveUuid,characteristicUuid,'\n','\n');

terminal.receive = function(data) {
  $('.battery_level').text(data);
};


$(document).ready(function() {

  // Helpers.
  const defaultDeviceName = 'No device is connected';

  const slider = $( "#slider" ).slider({
    animate: "fast",
    orientation: "vertical",
    range: "min",
    value: 1,
    min: 1,
    max: 100,
    disabled: true,
    change: function( event, ui ) {
        console.log(slider.slider('value'));
    }
  });

  $('#connect').on('click', function() {
    terminal.connect().
    then(() => {
      $('#device-name').text(terminal.getDeviceName() + " is connected");
      $('#connect').css('display','none');
      $('#disconnect').css('display','block');
      spinner('none');
      terminal.getDeviceInfo();
    })
    .catch(error => {
      spinner('none');
      console.error('Argh!', error);
    });
  });


  $('#disconnect').on('click', function() {
    spinner('block');
    terminal.disconnect();
    $('#device-name').text(defaultDeviceName);
    $('#connect').css('display','block');
    $('#disconnect').css('display','none');
    $('.battery_level').text('--');
    spinner('none');
  });

  $('#power').on('click', function() {
    const sliderValue =  slider.slider( "value" );
    console.log(sliderValue);
    if (sliderValue > 1) {
      slider.slider( "value", 0 );
      slider.slider( "disable" );
      $('#hotmode, #coldmode, #homemode').attr('disabled',true);


      r = 0, g = 0, b = 0;
      terminal.setPowerOff();
    } else {
      slider.slider( "value", 79 );
      slider.slider( "enable" );
      $('#hotmode, #coldmode, #homemode').attr('disabled',false);
      r = 255, g = 255, b = 255;
      terminal.setPowerOn();
    }
  });

  $('#hotmode').on('click', function() {
    $('#slider .ui-slider-range-min').removeClass('power home hot cold');
    $('#slider .ui-slider-range-min').toggleClass('hot');
    terminal.setSolidColor(255,0,0);
  });

  
  $('#coldmode').on('click', function() {
    $('#slider .ui-slider-range-min').removeClass('power home hot cold');
    $('#slider .ui-slider-range-min').toggleClass('cold');
    terminal.setSolidColor(0,255,255);
  });

  $('#homemode').on('click', function() {
    $('#slider .ui-slider-range-min').removeClass('power home hot cold');
    $('#slider .ui-slider-range-min').toggleClass('home');
    terminal.setSolidColor(242,116,5);
  });


});


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