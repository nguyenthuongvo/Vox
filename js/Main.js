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
      $('.hotmode, .coldmode, .homemode').attr('disabled',true);


      // send('power0');
    } else {
      slider.slider( "value", 79 );
      slider.slider( "enable" );
      $('.hotmode, .coldmode, .homemode').attr('disabled',false);

      // send('power79');
    }
  });

  $('#hotmode').on('click', function() {
    $('#slider .ui-slider-range-min').removeClass('power home hot cold');
    currentColors.toggleClass('hot');
  });

  
  $('#coldmode').on('click', function() {
    $('#slider .ui-slider-range-min').removeClass('power home hot cold');
    currentColors.toggleClass('cold');
  });

  $('#homemode').on('click', function() {
    $('#slider .ui-slider-range-min').removeClass('power home hot cold');
    currentColors.toggleClass('home');
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