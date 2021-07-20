$(document).ready(function() {
  $( "#slider" ).slider({
    animate: "fast",
    orientation: "vertical",
    range: "min",
    value: 1,
    min: 1,
    max: 100,
    slide: function() {
        // update();
    },
    change: function( event, ui ) {
        console.log($('#slider').slider('value'));
    }
  });

  // UI elements.
  const deviceNameLabel = $('#device-name');
  const connectButton =  $('#connect');
  const disconnectButton =  $('#disconnect');
  const menuItem = $('.menu-item-btn');
  const hotBtn = $('#hotmode');
  const coldBtn  = $('#coldmode');
  const homeBtn = $('#homemode');
  const slider = $('#slider');

  // Helpers.
  const defaultDeviceName = 'Vox';

  const logToTerminal = (message, type = '') => {
    console.log(type + ' >> ' + message);
  };

  // Obtain configured instance.
  // can work this way as well

  //var serviveUuid = "6e400001-b5a3-f393-e0a9-e50e24dcca9e";
  //var characteristicUuid  = "6e400003-b5a3-f393-e0a9-e50e24dcca9e";

  var serviveUuid = 0xFFE0
  var characteristicUuid = 0xFFE1

  const terminal = new BluetoothTerminal();

  // Override `receive` method to log incoming data to the terminal.
  terminal.receive = function(data) {
    logToTerminal(data, 'in');
  };

  // Override default log method to output messages to the terminal and console.
  terminal._log = function(...messages) {
    // We can't use `super._log()` here.
    messages.forEach((message) => {
      logToTerminal(message);
      console.log(message); // eslint-disable-line no-console
    });
  };

  // Implement own send function to log outcoming data to the terminal.
  const send = (data) => {
  
    terminal.send(data).
        then(() => logToTerminal(data, 'out')).
        catch((error) => logToTerminal(error));
  };

  const setSliderColor = (color) => {
    const currentColors = $('#slider .ui-slider-range-min');
    currentColors.removeClass('power');
    currentColors.removeClass('home');
    currentColors.removeClass('hot');
    currentColors.removeClass('cold');

    currentColors.toggleClass(color);
    send('color' + color);
  }

  const setSliderOnOff = () => {
    const sliderValue =  slider.slider( "value" );
    console.log(sliderValue);
    if (sliderValue > 1) {
      slider.slider( "value", 0 );
      hotBtn.attr('disabled',true);
      coldBtn.attr('disabled',true);
      homeBtn.attr('disabled',true);

      send('power0');
    } else {
      slider.slider( "value", 79 );
      hotBtn.attr('disabled',false);
      coldBtn.attr('disabled',false);
      homeBtn.attr('disabled',false);

      send('power79');
    }
  }


  menuItem.on('click', function() {
    const btn_id = $(this).attr('id');
    logToTerminal(btn_id);

    switch (btn_id)  {
      case 'connect':
          terminal.connect().
          then(() => {
            deviceNameLabel.text(terminal.getDeviceName() ?
            terminal.getDeviceName() : defaultDeviceName);
          });
        break;
      case 'disconnect':
          terminal.disconnect();
          deviceNameLabel.text(defaultDeviceName);
        break;
      case 'power':
        setSliderOnOff()
        break;    
      case 'hotmode':
        setSliderColor('hot');
        break;
      case 'coldmode':
        setSliderColor('cold');
        break;
      case 'homemode':
        setSliderColor('home');
        break;
      default:
        break;
    }


  });


})
