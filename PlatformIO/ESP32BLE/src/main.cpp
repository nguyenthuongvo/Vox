
#include <Arduino.h>
#include <BLEDevice.h>
#include <BLEUtils.h>
#include <BLEServer.h>

#include <BLE2902.h>


// See the following for generating UUIDs:
// https://www.uuidgenerator.net/

 
#define BLE_NAME "ESP32" //must match filters name in bluetoothterminal.js- navigator.bluetooth.requestDevice
#define SERVICE_UUID        "6e400001-b5a3-f393-e0a9-e50e24dcca9e" //- must match optional services on navigator.bluetooth.requestDevice
#define CHARACTERISTIC_UUID "6e400003-b5a3-f393-e0a9-e50e24dcca9e"

//maintain compatability with HM-10
//BLEUUID  SERVICE_UUID((uint16_t)0xFFE0); // UART service UUID
//BLEUUID CHARACTERISTIC_UUID ((uint16_t)0xFFE1);

/*
 * navigator.bluetooth.requestDevice({
   
    filters: [{
        name: 'ESP32'
      }],
      optionalServices: ['6e400001-b5a3-f393-e0a9-e50e24dcca9e',
      '6e400002-b5a3-f393-e0a9-e50e24dcca9e',
      '6e400003-b5a3-f393-e0a9-e50e24dcca9e']
    }).
*/

class MyServerCallbacks: public BLEServerCallbacks {

  void onDisconnect(BLEServer* pServer) {
    Serial.println("Disconnect");
    delay(2000);
    pServer->getAdvertising()->start();
  }
  
};

class MyCallbacks: public BLECharacteristicCallbacks {
    void onWrite(BLECharacteristic *pCharacteristic) {
      std::string value = pCharacteristic->getValue();

      if (value.length() > 0) {
        Serial.println("*********");
        Serial.print("New value: ");
        for (int i = 0; i < value.length(); i++)
        {
          Serial.print(value[i]);
          
        }

        Serial.println();
        Serial.println("*********");

        pCharacteristic->setValue(value +"\n"); // must add seperator \n for it to register on BLE terminal
        pCharacteristic->notify();
      }
    }
};


void setup() {
  Serial.begin(115200);

  Serial.println("1- Download and install an BLE scanner app in your phone");
  Serial.println("2- Scan for BLE devices in the app");
  Serial.println("3- Connect to MyESP32");
  Serial.println("4- Go to CUSTOM CHARACTERISTIC in CUSTOM SERVICE and write something");
  Serial.println("5- See the magic =)");

  BLEDevice::init(BLE_NAME);
  BLEServer *pServer = BLEDevice::createServer();
  pServer -> setCallbacks(new MyServerCallbacks());
  
  BLEService *pService = pServer->createService(SERVICE_UUID);
  
  BLECharacteristic *pCharacteristic = pService->createCharacteristic(
                                         CHARACTERISTIC_UUID,
                                         BLECharacteristic::PROPERTY_READ |
                                         BLECharacteristic::PROPERTY_WRITE |
                                         BLECharacteristic::PROPERTY_NOTIFY
                                       );

  pCharacteristic->setCallbacks(new MyCallbacks());
  
  pCharacteristic->addDescriptor(new BLE2902());

  pService->start();

  BLEAdvertising *pAdvertising = pServer->getAdvertising();
  
  pAdvertising->start();
}

void loop() {
  // put your main code here, to run repeatedly:
  delay(2000);
}
