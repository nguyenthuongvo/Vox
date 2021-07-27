var r = g = b = 255;
var br = 255;
var rgbSeg = "RGB";
var icModel = "";
var presetValue = 1; //  1 to 120 | 121 is static color
var speed = 255; // 0 -> 255
var isSendData = false;
var slider;
var serviveUuid = 65504;
var characteristicUuid = 65505;
const terminal = new SP110EController(serviveUuid,characteristicUuid,'\n','\n');


terminal.receive = function(data) {
  isSendData = false;
  const enabledStatus = data.getUint8(0);
  const LEDCount = data.getUint8(7);
  presetValue = data.getUint8(1);

  this._log("Enabled: " + enabledStatus);
  this._log("Preset: " + presetValue);

  icModel = IC_MODEL[intToHex(data.getUint8(4))];
  this._log("IC MODEL: " + icModel);

  rgbSeg = RGB_SEG[intToHex(data.getUint8(5))];
  this._log("Chanel: " + rgbSeg);

  br = data.getUint8(3);
  let colorArray = [];
  r = data.getUint8(8);
  g = data.getUint8(9);
  b = data.getUint8(10);

  this._log("Bright: " + br);
  this._log("R: " + r);
  this._log("G: " + g);
  this._log("B: " + b);
  this._log("W: " + data.getUint8(11));
  
  $('.battery_level').text(LEDCount); // LED COUNT
  setPowerUI(enabledStatus); // Enabled

  //Check HOT MODE
  if (r == 255 && g == 0 && b == 0) {
    $('#hotmode').trigger('click');
    $('#hotmode').focus();
  }

  //Check COLD MODE
  if (r == 0 && g == 255 && b == 255) {
    $('#coldmode').trigger('click');
    $('#coldmode').focus();
  }

  //Check HOME MODE
  if (r == 242 && g == 116 && b == 5) {
    $('#homemode').trigger('click');
    $('#homemode').focus();
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
    value: 200,
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


  $('#preset-value').on('change', async function () {
    presetValue = $(this).val();  
    if (isSendData) {
      await terminal.setPreset(presetValue);
    }
  });

  $('#preset-previous').on('click', function() {
    if (presetValue > 1 && presetValue < 121) {
      presetValue = parseInt(presetValue) - 1;
    } else {
      presetValue = 120;
    }
    $('#preset-value').val(presetValue);
    $('#preset-value').trigger('change');
  });

  $('#preset-next').on('click', function() {
    if (presetValue > 0 && presetValue < 120) {
      presetValue = parseInt(presetValue) + 1;
    } else {
      presetValue = 1;
    }
    $('#preset-value').val(presetValue);
    $('#preset-value').trigger('change');
  });

  $('.speed-button').on('click', async function() {
    var speedId = $(this).val();
    speed = parseInt((parseInt(speedId) * 255) / 100);
    console.log(speed);
    if (isSendData) {
      await terminal.sendSpeed(speed);
    }
  });

  $('.mode-btn').on('click', function() {
    $('.color-setting').toggleClass('hidden');
    $('.home-setting').toggleClass('hidden');
  })

  loadColorPicker();

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
    $('#device-name').css('display', '');
    $('#connect , #disconnect').removeAttr("disabled");
  } else {
    $('#device-name').css('display', 'none');
    $('#connect , #disconnect').attr('disabled',true);
  }

  $('.spinner').css('display', display);
}

function loadColorPicker() {
  var canvas_size = 220;
  var img = new Image();
  img.src = '../img/color-wheel.png';
  img.onload = function() {
    var canvas = document.getElementById("color-canvas");
    var context = canvas.getContext('2d');
    
    canvas.width = canvas_size * devicePixelRatio;
    canvas.height = canvas_size * devicePixelRatio;
    canvas.style.width = canvas_size + "px";
    canvas.style.height = canvas_size + "px";
    canvas.addEventListener('click', function(evt) {
      // Refresh canvas in case user zooms and devicePixelRatio changes.
      canvas.width = canvas_size * devicePixelRatio;
      canvas.height = canvas_size * devicePixelRatio;
      context.drawImage(img, 0, 0, canvas.width, canvas.height);
  
      var rect = canvas.getBoundingClientRect();
      var x = Math.round((evt.clientX - rect.left) * devicePixelRatio);
      var y = Math.round((evt.clientY - rect.top) * devicePixelRatio);
      var data = context.getImageData(0, 0, canvas.width, canvas.height).data;
  
      r = data[((canvas.width * y) + x) * 4];
      g = data[((canvas.width * y) + x) * 4 + 1];
      b = data[((canvas.width * y) + x) * 4 + 2];
      
      // Check user pick outside of image

      if (r == 0 && g == 0 && b == 0) {

      } else {
        changeColor();
  
        context.beginPath();
        context.arc(x, y + 2, 10 * devicePixelRatio, 0, 2 * Math.PI, false);
        context.shadowColor = '#333';
        context.shadowBlur = 4 * devicePixelRatio;
        context.fillStyle = 'white';
        context.fill();
      }

    });
  
    context.drawImage(img, 0, 0, canvas.width, canvas.height);
  }
}

function changeColor() {
  $('#slider .ui-slider-range-min').css('background-color', `rgba(${r}, ${g}, ${b}, 1)`);
  if (isSendData) {
    terminal.setSolidColor(r,g,b);
  }
}

function intToHex(value) {
  let hexValue = value.toString(16);
  return (hexValue.length == 1 ? "0x0" + hexValue : "0x" + hexValue);
}