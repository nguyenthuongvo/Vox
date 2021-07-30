# Vox - Web Bluetooth - Remote SP110E LED controller 
# Demo link: https://nguyenthuongvo.github.io/Vox
- Work well on Chrome (Linux), Bluefly (iOS)
- It works on Chrome (Windows, Android), but I didn't  test it
- On Linux/Windows, you have to turn **Experimental Web Platform features** and **Use the new permissions backend for Web Bluetooth** in `chrome://flags`

# Feature
- [x] Scan devices  
- [x] Get device (SP110E) info  
- [x] Set IC Model  
- [x] Set RGB Chanel  
- [x] Set Led num (1 -1024)  
- [x] Change preset (1-120)  
- [x] Change static color  
- [x] Change speed
- [x] Change brightness  
- [x] Change device name (max 10 chars)

# Technical document
### 1. Command
#### All command send to SP110E has 4 bytes, 3 bytes is data and last byte is command.  
4 bytes must be HEX code `NO SPACE BETWEEN` byte.  
(Video) How to test command: https://www.youtube.com/watch?v=IN22t3pKAs0 

| Command  | Command  | Data  |  Return/Response |
| :------------ |:---------------:|--------:|  -----:|
| CHECK DEVICE      | D7 F3 A1 D5 |  3 BYTES  | 13 BYTES |
| GET DEVICE INFO     | 00 00 00 10  |      |  12 BYTES  |
|  SET IC MODEL  |   03 00 00 1C  |  1 BYTES  |     |
|  SET RGB SEQUENCE  |   04 00 00 3C  |  1 BYTES  |   |
|  SET LED NUM  |   01 6A 00 2D  |  2 BYTES  |     |
|  SET DEVICE NAME  |  08 00 00 BB {DATA} |  1-8 BYTES  |  SP110E RESET    |
|  TURN ON  |  00 00 00 AA  |    |   |
|  TURN OFF  |  00 00 00 AB  |    |   |
|  SET STATIC COLOR |  00 FF FF 1E  |  3 BYTES  |    |
|  SET BRIGHT | FF 00 00 2A  |   1 BYTES  |   |
|  SET WHITE | FF 00 00 69  |  1 BYTES  |   |
|  SET PRESET | 3F 00 00 2C  |  1 BYTES   |   |
|  SET SPEED | C6 00 00 03  |  1 BYTES  |   |
|  SET AUTO MODE | 00 00 00 06  |     |    ||


### 2. Notices
#### [CHECK DEVICE] command response (Hex Format)

Return: 13 bytes data

|  Index  |  Data  |
| :------------ |:---------:|
|   0   |  Checksum  |
|  1   |  Status  |
|  2   |  Preset  |
|  3   |  Speed  |
|  4   |  Brightness  |
|  5   |  IC model  |
|  6   |  Channel |
|  7   |  Pixel count MSB |
|  8   |  Pixel count LSB |
|  9   |  Red |
|  10   |  Green |
|  11   |  Blue |
|  12   |  White |

#### [GET INFO] command response (Hex Format)

Return: 12 bytes data

|  Index  |  Data  |
| :------------ |:---------:|
|  0   |  Status  |
|  1   |  Preset  |
|  2   |  Speed  |
|  3   |  Brightness  |
|  4   |  IC model  |
|  5   |  Channel |
|  6   |  Pixel count MSB |
|  7   |  Pixel count LSB |
|  8   |  Red |
|  9   |  Green |
|  10   |  Blue |
|  11   |  White |

#### LED NUM: Have to concain **[7]** + **[8]**  to get expect number.
How to process value right way:  
**[7][8] Index**: 0100 -> parse int from hex value ->  parseInt(0100, 16) -> 256 led num  


### 3. Example
Javascript (Web Bluetooth)  
Turn on 

```javascript
	let hex = "000000AA"; 
    let typedArray = new Uint8Array(hex.match(/[\da-f]{2}/gi).map(function (h) {
      return parseInt(h, 16)
    }))
    return characteristic.writeValue(typedArray.buffer);
```

### 4. Using ESP32 fake SP110E check command
Something I need debug command (like led num) so I had to fake SP100E firmware to capture command.

The difficult is CHECKSUM, Have to pass checksum for receiving led num command or static color command.

Example:
Source code location: ***PlatformIO/ESP32BLE***  
When ESP32 receive data:
```sh
D7 F3 A1 D5
```

ESP32 need to send

```sh
byte dataArrays[] = { 0xFF, 0x01, 0x79 , 0x7D, 0x8A, 0x03 , 0x02, 0x00, 0x09 , 0xFF, 0x00, 0x00 , 0x00 };
dataArrays[0] = (byte) (rec[2] | ((rec[0] << 1) & 254 & 105) | rec[1]); // Checksum device
```

### 5. Troubleshoot request device function error on Bluefly browser
Bluefly bowser raises **requestDevice** error if include **optionalServices** so we need  to remove it.


## Reference  
https://gist.github.com/mbullington/37957501a07ad065b67d4e8d39bfe012
