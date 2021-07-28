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

terminal._beginReconnect = function() {
  spinner('block');
}

terminal._endReconnect = function() {
  spinner('none');
}

terminal.receive = function(data) {
  isSendData = false;
  spinner('block');

  const enabledStatus = data.getUint8(0);
  const LEDCount = data.getUint8(7);
  presetValue = data.getUint8(1);

  this._log("Enabled: " + enabledStatus);
  this._log("Preset: " + presetValue);

  const icModelCode = intToHex(data.getUint8(4));
  icModel = IC_MODEL[icModelCode];

  this._log("IC MODEL: " + icModel);
  $('.ic-model').val(icModelCode);

  const regSegCode = intToHex(data.getUint8(5));
  rgbSeg = RGB_SEG[regSegCode];

  this._log("Chanel: " + rgbSeg);
  $('.rgb-seg').val(regSegCode);

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
  spinner('none');
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

  $('.colorpicker').wheelColorPicker();
  $('.colorpicker').on('change', function() {
    const hexColor = $(this).val();
    terminal._log(hexColor);
    if (isSendData) {
      terminal.setCommand(hexColor + "1E");
    }
  })
  
  $('#connect').on('click', function() {
    isSendData = false;
    terminal.connect().then(value => {
      $('#device-name').text(terminal.getDeviceName() + " is connected");
      $('.device-name-input').val(terminal.getDeviceName());
      $('#connect').css('display','none');
      $('#disconnect').css('display','block');
      terminal.getDeviceInfo().then(rs => {
        terminal._log(rs);
      }).catch(error => {
        terminal._log(error);
      })

    }).catch(error => {
      terminal._log(error);
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
    terminal._log(speed);
    if (isSendData) {
      await terminal.sendSpeed(speed);
    }
  });

  $('.mode-btn').on('click', function() {
    $('.preset-screen').toggleClass('hidden');
    $('.setting-screen').toggleClass('hidden');
  })

  $('.device-name-input').on('change', function() {
    let value = $(this).val();
    if (isSendData) {
      terminal.setDeviceName(value).then(() => {
        $('#device-name').text(value + " is connected");
      })
    }
  })

  loadIcModel();

  loadRGBSeg();

  loadPreset();

  loadBrightness();

  loadSpeed();

});


async function setPowerUI(isOn = false) {
  terminal._log('isSendData: ' + isSendData);
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

function intToHex(value) {
  let hexValue = value.toString(16);
  return (hexValue.length == 1 ? "0x0" + hexValue : "0x" + hexValue);
}

function loadPreset() {
  const mapBtn = MY_PRESET;
  let drawHtml = "";

  for (var index = 0; index < mapBtn.length; index ++) {
    let line = mapBtn[index]; 

    $.each(line, function(key, value){

      let btnPreset = `<button type="button" data-preset="${key}" class="preset-button">${value}</button>`;
      drawHtml += btnPreset;
    })

  }

  $('.my-preset').html(drawHtml);


  $('.preset-button').unbind('click');
  $('.preset-button').on('click', presetBtnClickEvent);

}

function presetBtnClickEvent(event) {
  let presetCommand = $(this).data('preset');
  terminal._log(presetCommand);
  if (isSendData){
    terminal.setCommand(presetCommand);
  }
}

function loadBrightness() {
  const mapBtn = MY_BRIGHTNESS;
  let drawHtml = "";

  for (var index = 0; index < mapBtn.length; index ++) {
    let line = mapBtn[index]; 
    $.each(line, function(key, value){
      let btnPreset = `<button class="small-button brightness-btn" value="${key}">${value}</button>`;
      drawHtml += btnPreset;
    })

  }

  $('.brightness').html(drawHtml);

  $('.brightness-btn').unbind('click');
  $('.brightness-btn').on('click', brightnessBtnClickEvent);

}

function brightnessBtnClickEvent(event) {
  let value = $(this).val();
  if (isSendData){
    terminal.setCommand(value);
  }
}

function loadSpeed() {
  const mapBtn = MY_SPEED;
  let drawHtml = "";

  for (var index = 0; index < mapBtn.length; index ++) {
    let line = mapBtn[index]; 
    $.each(line, function(key, value){
      let btnPreset = `<button class="small-button speed-btn" value="${key}">${value}</button>`;
      drawHtml += btnPreset;
    })

  }

  $('.speed').html(drawHtml);

  $('.speed-btn').unbind('click');
  $('.speed-btn').on('click', speedBtnClickEvent);

}

function speedBtnClickEvent(event) {
  let value = $(this).val();
  terminal._log(value);
  if (isSendData){
    terminal.setCommand(value);
  }
}

function loadIcModel() {
  let drawHtml = "";
  $.each(IC_MODEL, function(key, value){
      terminal._log(key);
      terminal._log(value);

    let btnPreset = `<option value="${key}">${value}</option>`;
    drawHtml += btnPreset;
  });

  $('.ic-model').html(drawHtml);

  $('.ic-model').unbind('change');
  $('.ic-model').on('change', icModelChangeEvent);
}

function icModelChangeEvent() {
  let value = $(this).val();
  if (isSendData){
    terminal.setCommand(value + "1C");
  }
}

function loadRGBSeg() {
  let drawHtml = "";
  $.each(RGB_SEG, function(key, value){
      terminal._log(key);
      terminal._log(value);

    let btnPreset = `<option value="${key}">${value}</option>`;
    drawHtml += btnPreset;
  });

  $('.rgb-seg').html(drawHtml);

  $('.rgb-seg').unbind('change');
  $('.rgb-seg').on('change', rgbSegChangeEvent);
}

function rgbSegChangeEvent() {
  let value = $(this).val();
  if (isSendData){
    terminal.setCommand(value + "3C");
  }
}

