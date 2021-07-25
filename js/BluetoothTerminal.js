/**
 * Bluetooth Terminal class.
 * Base on: https://github.com/loginov-rocks/Web-Bluetooth-Terminal/tree/dev
 */

 class BluetoothTerminal {
  /**
   * Create preconfigured Bluetooth Terminal instance.
   * @param {!(number|string)} [serviceUuid=0xFFE0] - Service UUID
   * @param {!(number|string)} [characteristicUuid=0xFFE1] - Characteristic UUID
   * @param {string} [receiveSeparator='\n'] - Receive separator
   * @param {string} [sendSeparator='\n'] - Send separator
   */
  constructor(serviceUuid = 0xFFE0, characteristicUuid = 0xFFE1,
      receiveSeparator = '\n', sendSeparator = '\n') {
    // Used private variables.
    this._receiveBuffer = ''; // Buffer containing not separated data.
    this._maxCharacteristicValueLength = 20; // Max characteristic value length.
    this._device = null; // Device object cache.
    this._characteristic = null; // Characteristic object cache.

    // Bound functions used to add and remove appropriate event handlers.
    this._boundHandleDisconnection = this._handleDisconnection.bind(this);
    this._boundHandleCharacteristicValueChanged =
        this._handleCharacteristicValueChanged.bind(this);
    // Configure with specified parameters.
    this.setServiceUuid(serviceUuid);
    this.setCharacteristicUuid(characteristicUuid);
    this.setReceiveSeparator(receiveSeparator);
    this.setSendSeparator(sendSeparator);
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
   * Set character representing separator for data coming from the connected
   * device, end of line for example.
   * @param {string} separator - Receive separator with length equal to one
   *                             character
   */
  setReceiveSeparator(separator) {
    if (!(typeof separator === 'string' || separator instanceof String)) {
      throw new Error('Separator type is not a string');
    }

    if (separator.length !== 1) {
      throw new Error('Separator length must be equal to one character');
    }

    this._receiveSeparator = separator;
  }

  /**
   * Set string representing separator for data coming to the connected
   * device, end of line for example.
   * @param {string} separator - Send separator
   */
  setSendSeparator(separator) {
    if (!(typeof separator === 'string' || separator instanceof String)) {
      throw new Error('Separator type is not a string');
    }

    if (separator.length !== 1) {
      throw new Error('Separator length must be equal to one character');
    }

    this._sendSeparator = separator;
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

  setPowerOff() {
    return this._writeToCharacteristic(this._characteristic, '000000ab');
  }

  setPowerOn() {
    return this._writeToCharacteristic(this._characteristic, '000000aa');
  }

  setSolidColor(r, g, b)  {
    const red = r.toString(16);
    const green = g.toString(16);
    const blue = b.toString(16);
    const solidColor = (red.length ==  1 ? "0" + red : red) + "" + 
    (green.length ==  1 ? "0" + green: green)  + ""  + 
    (blue.length ==  1 ? "0" + blue : blue) + "1E"; 
    return this._writeToCharacteristic(this._characteristic, solidColor);
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
   * Connect to device.
   * @param {Object} device
   * @return {Promise}
   * @private
   */
  _connectToDevice(device) {
    return (device ? Promise.resolve(device) : this._requestBluetoothDevice()).
        then((device) => this._connectDeviceAndCacheCharacteristic(device)).
        then((characteristic) => this._startNotifications(characteristic)).
        catch((error) => {
          this._log(error);
          return Promise.reject(error);
        });
  }

  /**
   * Disconnect from device.
   * @param {Object} device
   * @private
   */
  _disconnectFromDevice(device) {
    if (!device) {
      return;
    }

    this._log('Disconnecting from "' + device.name + '" bluetooth device...');

    device.removeEventListener('gattserverdisconnected',
        this._boundHandleDisconnection);

    if (!device.gatt.connected) {
      this._log('"' + device.name +
          '" bluetooth device is already disconnected');
      return;
    }

    device.gatt.disconnect();

    this._log('"' + device.name + '" bluetooth device disconnected');
  }

  /**
   * Request bluetooth device.
   * @return {Promise}
   * @private
   */
  _requestBluetoothDevice() {
    this._log('Requesting bluetooth device... with service1 ' + this._serviceUuid);
	
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
      optionalServices: [65504]
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
          this._log('GATT server connected', 'Getting service...');

          return server.getPrimaryService(this._serviceUuid);
        }).
        then((service) => {
          this._log('Service found', 'Getting characteristic...' + this._characteristicUuid);

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

    return characteristic.startNotifications().
        then(() => {
          this._log('Notifications started');

          characteristic.addEventListener('characteristicvaluechanged',
              this._boundHandleCharacteristicValueChanged);
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
    const device = event.target;

    this._log('"' + device.name +
        '" bluetooth device disconnected, trying to reconnect...');

    this._connectDeviceAndCacheCharacteristic(device).
        then((characteristic) => this._startNotifications(characteristic)).
        catch((error) => this._log(error));
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
    console.log(...messages); // eslint-disable-line no-console
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
  module.exports = BluetoothTerminal;
}
