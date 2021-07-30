/*Program to use GATT service on ESP32 to send Battery Level
 * ESP32 works as Play Bulb Candle
 * Program by: Vo.Nguyen
 * Dated on: 21-07-2021
 * Description: The 5nd day of COVID 19 Social Distancing
 */

#include <Arduino.h>
#include <BLEDevice.h>
#include <BLEUtils.h>
#include <BLEServer.h> //Library to use BLE as server
#include <BLE2902.h> 

BLEServer* pServer = NULL;


// SPService
#define SPService BLEUUID((uint16_t)0xFFE0) 

BLECharacteristic MainCharacteristic(BLEUUID((uint16_t)0xFFE1), BLECharacteristic::PROPERTY_READ  | BLECharacteristic::PROPERTY_WRITE  | BLECharacteristic::PROPERTY_NOTIFY);
BLEDescriptor MainDescriptor(BLEUUID((uint16_t)0x2901));

// End services

byte rec[4];
byte dataArrays[] = { 0xFF, 0x01, 0x79 , 0x7D, 0x8A, 0x03 , 0x02, 0x00, 0x09 , 0xFF, 0x00, 0x00 , 0x00 };

class MyServerCallbacks : public BLEServerCallbacks {
    void onConnect(BLEServer* pServer) {
      Serial.println("Device is connected");
    };

    void onDisconnect(BLEServer* pServer) {
      Serial.println("Device is disconnected");
      pServer ->getAdvertising() -> start();
    }
};


class MainCharacteristicCallbacks: public BLECharacteristicCallbacks {
    void onWrite(BLECharacteristic *characteristic) {
      std::string value = characteristic->getValue();

      if (value.length() > 0) {
        Serial.print("Command: ");

        for (int i = 0; i < value.length(); i++) {
          Serial.print((uint8_t)value[i]);
          rec[i] = (uint8_t)value[i];
          if (i < value.length() - 1) Serial.print("-");
        }

        Serial.println("");

      }

    dataArrays[0] = (byte) (rec[2] | ((rec[0] << 1) & 254 & 105) | rec[1]); // Checksum device

    MainCharacteristic.setValue(dataArrays, 13);
    MainCharacteristic.notify();
    Serial.println("Send byte array success");

    }
};

void SetupBluetooth() {
  BLEDevice::init("SP110EFake");
  
  // Create the BLE Server
  // Optional Services: Battery Services

  pServer = BLEDevice::createServer();
  pServer->setCallbacks(new MyServerCallbacks());


  // Create the BLE Service
  // Main Services: JS LED Strip Services

  BLEService *pSPService = pServer->createService(SPService);
  // Create BLE Characteristics

  // Color
  pSPService ->addCharacteristic(&MainCharacteristic);
  MainCharacteristic.addDescriptor(&MainDescriptor);
  MainCharacteristic.setCallbacks(new MainCharacteristicCallbacks());
  pServer->getAdvertising()->addServiceUUID(SPService);

  //
  pSPService->start();

  // Start advertising
  pServer->getAdvertising()->start();
  
}