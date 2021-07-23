var r = g = b = 255;
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
    spinner('block');
    playbulbCandle.connect().then(() => {
      return playbulbCandle.getBatteryLevel(handleChangedValue).then(() => {
        $('#device-name').text(playbulbCandle.getDeviceNameLocal() + " is connected");
        $('#connect').css('display','none');
        $('#disconnect').css('display','block');
        spinner('none');
      });
    })
    .catch(error => {
      spinner('none');
      console.error('Argh!', error);
    });
  });


  $('#disconnect').on('click', function() {
    spinner('block');
    playbulbCandle.disconnect().then(() => {
      $('#device-name').text(defaultDeviceName);
      $('#connect').css('display','block');
      $('#disconnect').css('display','none');
      $('.battery_level').text('--');
      spinner('none');
    }).catch(error => {
      spinner('none');
    })

  });

  $('#power').on('click', function() {
    const sliderValue =  slider.slider( "value" );
    console.log(sliderValue);
    if (sliderValue > 1) {
      slider.slider( "value", 0 );
      slider.slider( "disable" );
      $('#hotmode, #coldmode, #homemode').attr('disabled',true);


      r = 0, g = 0, b = 0;
      playbulbCandle.setColor(r,g,b);
    } else {
      slider.slider( "value", 79 );
      slider.slider( "enable" );
      $('#hotmode, #coldmode, #homemode').attr('disabled',false);
      r = 255, g = 255, b = 255;
      playbulbCandle.setColor(r,g,b);
    }
  });

  $('#hotmode').on('click', function() {
    $('#slider .ui-slider-range-min').removeClass('power home hot cold');
    $('#slider .ui-slider-range-min').toggleClass('hot');

    playbulbCandle.setCandleEffectColor(r,g,b);
  });

  
  $('#coldmode').on('click', function() {
    $('#slider .ui-slider-range-min').removeClass('power home hot cold');
    $('#slider .ui-slider-range-min').toggleClass('cold');

    playbulbCandle.setFlashingColor(r,g,b);
  });

  $('#homemode').on('click', function() {
    $('#slider .ui-slider-range-min').removeClass('power home hot cold');
    $('#slider .ui-slider-range-min').toggleClass('home');

    playbulbCandle.setRainbow();
  });


});

function handleDeviceName(deviceName) {
  logToTerminal(deviceName);
  $('#device-name').text(deviceName);
  $('#connect').css('display','none');
  $('#disconnect').css('display','block');
}

function handleChangedValue(event) {
  // console.log(batteryLevel);
  let value = event.target.value.getUint8(0);
  $('.battery_level').text(value);
}

function logToTerminal(message, type = '') {
  console.log(type + ' >> ' + message);
};

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