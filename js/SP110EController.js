/**
 * SP110E controller class
 */

 class SP110EController {
  /**
   * Create preconfigured Bluetooth Terminal instance.
   * @param {!(number|string)} [serviceUuid=0xFFE0] - Service UUID
   * @param {!(number|string)} [characteristicUuid=0xFFE1] - Characteristic UUID
   * @param {string} [receiveSeparator='\n'] - Receive separator
   * @param {string} [sendSeparator='\n'] - Send separator
   */
  constructor(serviceUuid = 65504, characteristicUuid = 65505) {
    this._isPrintLog = false;
    this._device = null; 
    this._characteristic = null;
    this._boundHandleDisconnection = this._handleDisconnection.bind(this);
    this._boundHandleCharacteristicValueChanged =
        this._handleCharacteristicValueChanged.bind(this);
    this.setServiceUuid(serviceUuid);
    this.setCharacteristicUuid(characteristicUuid);
  }

  printLog(flag) {
    this._isPrintLog = flag;
  }


  /**
   * Set number or string representing service UUID used.
   * @param {!(number|string)} uuid - Service UUID
   */
  setServiceUuid(uuid) {
    if (!Number.isInteger(uuid) &&
        !(typeof uuid === 'string' || uuid instanceof String)) {
      throw new Error('UUID type is neither a number nor a string');
    }

    if (!uuid) {
      throw new Error('UUID cannot be a null');
    }

    this._serviceUuid = uuid;
  }

  /**
   * Set number or string representing characteristic UUID used.
   * @param {!(number|string)} uuid - Characteristic UUID
   */
  setCharacteristicUuid(uuid) {
    if (!Number.isInteger(uuid) &&
        !(typeof uuid === 'string' || uuid instanceof String)) {
      throw new Error('UUID type is neither a number nor a string');
    }

    if (!uuid) {
      throw new Error('UUID cannot be a null');
    }

    this._characteristicUuid = uuid;
  }

  /**
   * Launch Bluetooth device chooser and connect to the selected device.
   * @return {Promise} Promise which will be fulfilled when notifications will
   *                   be started or rejected if something went wrong
   */
  connect() {
    return this._connectToDevice(this._device);
  }

  /**
   * Disconnect from device.
   * @param {Object} device
   * @private
   */
  _disconnectFromDevice(device) {
    if (!device) {
      return Promise(device);
    }

    this._log('Disconnecting from "' + device.name + '" bluetooth device...');

    device.removeEventListener('gattserverdisconnected',
        this._boundHandleDisconnection);

    if (!device.gatt.connected) {
      this._log('"' + device.name +'" bluetooth device is already disconnected');
      return Promise(device);
    }

    this._log('"' + device.name + '" bluetooth device disconnected');

    return device.gatt.disconnect();
  }

  /**
   * Disconnect from the connected device.
   */
  disconnect() {
    this._stopNotifications(this._characteristic).then(value => {
      this._disconnectFromDevice(this._device);
      if (this._characteristic) {
        this._characteristic.removeEventListener('characteristicvaluechanged',
            this._boundHandleCharacteristicValueChanged);
        this._characteristic = null;
      }
      this._device = null;
      return;
    })
  }

  /**
   * Data receiving handler which called whenever the new data comes from
   * the connected device, override it to handle incoming data.
   * @param {string} data - Data
   */
  receive(data) {
    // Handle incoming data.
     
  }

  /**
   * 
   * @returns Promise()
   */
  setPowerOff() {
    return this._writeToCharacteristic(this._characteristic, '000000ab');
  }

  /**
   * 
   * @returns Promise
   */
  setPowerOn() {
    return this._writeToCharacteristic(this._characteristic, '000000aa');
  }

  /**
   * 
   * @param {byte} r 
   * @param {byte} g 
   * @param {byte} b 
   * @returns 
   */
  setSolidColor(r, g, b)  {
    
    let red = r.toString(16);
    red = (red.length ==  1 ? "0" + red: red)  + "" ;

    let green = g.toString(16);
    green = (green.length ==  1 ? "0" + green: green)  + "" ;

    let blue = b.toString(16);
    blue = (blue.length ==  1 ? "0" + blue: blue)  + "" ;

    const solidColor = red + green + blue + "1E";
    return this._writeToCharacteristic(this._characteristic, solidColor);
  }

  /**
   * 
   * @param {bye} presetValue range 1-120
   * @returns 
   */
  setPreset(presetValue) {
    const hexValue = parseInt(presetValue).toString(16);
    const command = (hexValue.length ==  1 ? "0" + hexValue : hexValue) + "00002C";
    return this._writeToCharacteristic(this._characteristic, command);
  }

  /**
   * 
   * @param {string} code command has 4 bytes.
   * Example "000000aa" Turn on
   * @returns promise()
   */
  setCommand(code) {
    return this._writeToCharacteristic(this._characteristic, code);
  }
  
  /**
   * 
   * @param {byte} speedValue range 1 -255
   * @returns Promise()
   */
  sendSpeed(speedValue) {
    const hexValue = speedValue.toString(16);
    const command = (hexValue.length ==  1 ? "0" + hexValue : hexValue) + "000003";
    return this._writeToCharacteristic(this._characteristic, command);
  }
    /**
   * Set LED Strip Brightness
   * @param {Object} value range 0 -255
   */
  setBrightness(value) {
    const hexValue = value.toString(16);
    const command = (hexValue.length ==  1 ? "0" + hexValue : hexValue) + "00002A";
    return this._writeToCharacteristic(this._characteristic, command);
  }

  /**
   * 
   * @returns DataViewer include 12 bytes
   */
  getDeviceInfo() {
    return this._writeToCharacteristic(this._characteristic, '00000010');
  }

  /**
   * Get the connected device name.
   * @return {string} Device name or empty string if not connected
   */
  getDeviceName() {
    if (!this._device) {
      return '';
    }

    return this._device.name;
  }

  /**
   * 
   * @param {string} value max lenght is 8
   * @returns Promise()
   */
  setDeviceName(value)  {
    let hexValue = "080000BB" + this.convertToHex(value) ;
    this._log(hexValue);
    return this._writeToCharacteristic(this._characteristic, hexValue);
  }


  /**
   * 
   * @param {string} str
   * @returns Hex
   */
  convertToHex(str) {
    var hex = '';
    for(var i=0;i<str.length;i++) {
        hex += '' + (str.charCodeAt(i).toString(16).length == 1? "0" + str.charCodeAt(i).toString(16) : str.charCodeAt(i).toString(16));
    }
    return hex;
  }

  /**
   * Connect to device.
   * @param {Object} device
   * @return {Promise}
   * @private
   */
  _connectToDevice(device) {
    this._beginReconnect();
    return (device ? Promise.resolve(device) : this._requestBluetoothDevice()).
        then((device) => this._connectDeviceAndCacheCharacteristic(device)).
        then((characteristic) => {
          this._startNotifications(characteristic);
          this._endReconnect();
        }).
        catch((error) => {
          this._log(error);
          this._endReconnect();
          return Promise.reject(error);
        });
  }

  /**
   * 
   * @returns Browser name or 0 if not found
   */
  detectBrowser() { 
    if((navigator.userAgent.indexOf("Opera") || navigator.userAgent.indexOf('OPR')) != -1 ) {
        return 'Opera';
    } else if(navigator.userAgent.indexOf("Chrome") != -1 ) {
        return 'Chrome';
    } else if(navigator.userAgent.indexOf("Safari") != -1) {
        return 'Safari';
    } else if(navigator.userAgent.indexOf("Firefox") != -1 ){
        return 'Firefox';
    } else if((navigator.userAgent.indexOf("MSIE") != -1 ) || (!!document.documentMode == true )) {
        return 'IE';//crap
    } else {
        return 0;
    }
  } 

  /**
   * Request bluetooth device.
   * @return {Promise}
   * @private
   */
  _requestBluetoothDevice() {
    this._log('Requesting bluetooth device... with service: ' + this._serviceUuid);
    
    var optional = {optionalServices: [this._serviceUuid,this._characteristicUuid]};

    if (!this.detectBrowser()) {
      optional = {};
    }

    return navigator.bluetooth.requestDevice({
      filters: [
          { name: '' },
          { namePrefix: '0' },
          { namePrefix: '1' },
          { namePrefix: '2' },
          { namePrefix: '3' },
          { namePrefix: '4' },
          { namePrefix: '5' },
          { namePrefix: '6' },
          { namePrefix: '7' },
          { namePrefix: '8' },
          { namePrefix: '9' },
          { namePrefix: 'a' },
          { namePrefix: 'b' },
          { namePrefix: 'c' },
          { namePrefix: 'd' },
          { namePrefix: 'e' },
          { namePrefix: 'f' },
          { namePrefix: 'g' },
          { namePrefix: 'h' },
          { namePrefix: 'i' },
          { namePrefix: 'j' },
          { namePrefix: 'k' },
          { namePrefix: 'l' },
          { namePrefix: 'm' },
          { namePrefix: 'n' },
          { namePrefix: 'o' },
          { namePrefix: 'p' },
          { namePrefix: 'q' },
          { namePrefix: 'r' },
          { namePrefix: 's' },
          { namePrefix: 't' },
          { namePrefix: 'u' },
          { namePrefix: 'v' },
          { namePrefix: 'w' },
          { namePrefix: 'x' },
          { namePrefix: 'y' },
          { namePrefix: 'z' },
          { namePrefix: 'A' },
          { namePrefix: 'B' },
          { namePrefix: 'C' },
          { namePrefix: 'D' },
          { namePrefix: 'E' },
          { namePrefix: 'F' },
          { namePrefix: 'G' },
          { namePrefix: 'H' },
          { namePrefix: 'I' },
          { namePrefix: 'J' },
          { namePrefix: 'K' },
          { namePrefix: 'L' },
          { namePrefix: 'M' },
          { namePrefix: 'N' },
          { namePrefix: 'O' },
          { namePrefix: 'P' },
          { namePrefix: 'Q' },
          { namePrefix: 'R' },
          { namePrefix: 'S' },
          { namePrefix: 'T' },
          { namePrefix: 'U' },
          { namePrefix: 'V' },
          { namePrefix: 'W' },
          { namePrefix: 'X' },
          { namePrefix: 'Y' },
          { namePrefix: 'Z' }
        ],
        optional
    }).then((device) => {
          this._log('"' + device.name + '" bluetooth device selected');

          this._device = device; // Remember device.
          this._device.addEventListener('gattserverdisconnected',
              this._boundHandleDisconnection);

          return this._device;
        });
  }

  /**
   * Connect device and cache characteristic.
   * @param {Object} device
   * @return {Promise}
   * @private
   */
  _connectDeviceAndCacheCharacteristic(device) {
    // Check remembered characteristic.
    if (device.gatt.connected && this._characteristic) {
      return Promise.resolve(this._characteristic);
    }

    this._log('Connecting to GATT server...');

    return device.gatt.connect().
        then((server) => {
          this._log('GATT server connected\n', 'Getting service...' + this._serviceUuid);
          return server.getPrimaryService(this._serviceUuid);
        }).
        then((service) => {
          this._log('Service found\n', 'Getting characteristic: ' + this._characteristicUuid);
          return service.getCharacteristic(this._characteristicUuid);
        }).
        then((characteristic) => {
          this._log('Characteristic found');
          this._characteristic = characteristic; // Remember characteristic.
          return this._characteristic;
        });
  }

  /**
   * Start notifications.
   * @param {Object} characteristic
   * @return {Promise}
   * @private
   */
  _startNotifications(characteristic) {
    this._log('Starting notifications...');
    characteristic.addEventListener('characteristicvaluechanged',this._boundHandleCharacteristicValueChanged);
    return characteristic.startNotifications().
        then(() => {
          this._log('Notifications started');
          return characteristic;
        });
  }

  /**
   * Stop notifications.
   * @param {Object} characteristic
   * @return {Promise}
   * @private
   */
  _stopNotifications(characteristic) {
    this._log('Stopping notifications...');

    return characteristic.stopNotifications().
        then(() => {
          this._log('Notifications stopped');

          characteristic.removeEventListener('characteristicvaluechanged',
              this._boundHandleCharacteristicValueChanged);
        });
  }

  /**
   * Handle disconnection.
   * @param {Object} event
   * @private
   */
  _handleDisconnection(event) {
    this._beginReconnect();
    const device = event.target;

    this._log('"' + device.name +
        '" bluetooth device disconnected, trying to reconnect...');

    this._connectDeviceAndCacheCharacteristic(device).
        then((characteristic) => {
          this._startNotifications(characteristic);
          this._endReconnect();
        }).
        catch((error) => {
          this._log(error)
          this._endReconnect();
        });
  }

  _beginReconnect() {

  }

  _endReconnect() {

  }

  /**
   * Handle characteristic value changed.
   * @param {Object} event
   * @private
   */
  _handleCharacteristicValueChanged(event) {
    const data = event.target.value;
    this.receive(data); // Led count
  }

  /**
   * Write to characteristic.
   * @param {Object} characteristic
   * @param {string} data
   * @return {Promise}
   * @private
   */
  _writeToCharacteristic(characteristic, hex) {
    var typedArray = new Uint8Array(hex.match(/[\da-f]{2}/gi).map(function (h) {
      return parseInt(h, 16)
    }))
    return characteristic.writeValue(typedArray.buffer);
  }

  /**
   * Log.
   * @param {Array} messages
   * @private
   */
  _log(...messages) {
    if (this._isPrintLog) {
      console.log(...messages);
    }
  }

  /**
   * Split by length.
   * @param {string} string
   * @param {number} length
   * @return {Array}
   * @private
   */
  static _splitByLength(string, length) {
    return string.match(new RegExp('(.|[\r\n]){1,' + length + '}', 'g'));
  }
}

// Export class as a module to support requiring.
/* istanbul ignore next */
if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
  module.exports = SP110EController;
}
