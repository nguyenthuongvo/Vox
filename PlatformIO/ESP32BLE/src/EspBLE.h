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

// Optional Services
#define BatteryService BLEUUID((uint16_t)0x180F) 
BLECharacteristic BatteryLevelCharacteristic(BLEUUID((uint16_t)0x2A19), BLECharacteristic::PROPERTY_READ  | BLECharacteristic::PROPERTY_WRITE  | BLECharacteristic::PROPERTY_NOTIFY);
BLEDescriptor BatteryLevelDescriptor(BLEUUID((uint16_t)0x2901));


// CandleService
#define CandleService BLEUUID((uint16_t)0xFF02) 
BLECharacteristic DeviceNameCharacteristic(BLEUUID((uint16_t)0xFFFF), BLECharacteristic::PROPERTY_READ  | BLECharacteristic::PROPERTY_WRITE  | BLECharacteristic::PROPERTY_NOTIFY);
BLEDescriptor DeviceNameDescriptor(BLEUUID((uint16_t)0x2901));

BLECharacteristic ColorCharacteristic(BLEUUID((uint16_t)0xFFFC), BLECharacteristic::PROPERTY_READ  | BLECharacteristic::PROPERTY_WRITE  | BLECharacteristic::PROPERTY_NOTIFY);
BLEDescriptor ColorDescriptor(BLEUUID((uint16_t)0x2901));

BLECharacteristic EffectCharacteristic(BLEUUID((uint16_t)0xFFFB), BLECharacteristic::PROPERTY_READ  | BLECharacteristic::PROPERTY_WRITE  | BLECharacteristic::PROPERTY_NOTIFY);
BLEDescriptor EffectDescriptor(BLEUUID((uint16_t)0x2901));

// End services


class MyServerCallbacks : public BLEServerCallbacks {
    void onConnect(BLEServer* pServer) {
      Serial.println("Device is connected");
    };

    void onDisconnect(BLEServer* pServer) {
      Serial.println("Device is disconnected");
      pServer ->getAdvertising() -> start();
    }
};

class DeviceNameCharacteristicCallbacks: public BLECharacteristicCallbacks {
    void onWrite(BLECharacteristic *characteristic) {
      std::string value = characteristic->getValue();

      if (value.length() > 0) {
        Serial.print("Device Name: ");

        for (int i = 0; i < value.length(); i++) {
          Serial.print(value[i]);
          if (i < value.length() - 1) Serial.print(",");
        }

        Serial.println("");
      }
    }
};

class ColorCharacteristicCallbacks: public BLECharacteristicCallbacks {
    void onWrite(BLECharacteristic *characteristic) {
      std::string value = characteristic->getValue();

      if (value.length() > 0) {
        Serial.print("Color: ");

        for (int i = 0; i < value.length(); i++) {
          Serial.print((uint8_t)value[i]);
          if (i < value.length() - 1) Serial.print(",");
        }

        Serial.println("");
      }
    }
};

class EffecctCharacteristicCallbacks: public BLECharacteristicCallbacks {
    void onWrite(BLECharacteristic *characteristic) {
      std::string value = characteristic->getValue();

      if (value.length() > 0) {
        Serial.print("Effect: ");

        for (int i = 0; i < value.length(); i++) {
          Serial.print((uint8_t)value[i]);
          if (i < value.length() - 1) Serial.print(",");
        }

        Serial.println("");
      }
    }
};


void SetupBluetooth() {
  BLEDevice::init("JS LED Strip");
  
  // Create the BLE Server
  // Optional Services: Battery Services

  pServer = BLEDevice::createServer();
  pServer->setCallbacks(new MyServerCallbacks());

  // Create the BLE Service
  BLEService *pBatteryService = pServer->createService(BatteryService);
  
  pBatteryService->addCharacteristic(&BatteryLevelCharacteristic);
  BatteryLevelDescriptor.setValue("Percentage 0 - 100");
  BatteryLevelCharacteristic.addDescriptor(&BatteryLevelDescriptor);
  BatteryLevelCharacteristic.addDescriptor(new BLE2902());

  pServer->getAdvertising()->addServiceUUID(BatteryService);
  pBatteryService->start();

  // End the BLE Service



  // Create the BLE Service
  // Main Services: JS LED Strip Services

  BLEService *pCandleService = pServer->createService(CandleService);
  // Create BLE Characteristics

  // DeviceName
  pCandleService ->addCharacteristic(&DeviceNameCharacteristic);
  DeviceNameDescriptor.setValue("Change device name");
  DeviceNameCharacteristic.addDescriptor(&DeviceNameDescriptor);
  DeviceNameCharacteristic.addDescriptor(new BLE2902());
  DeviceNameCharacteristic.setCallbacks(new DeviceNameCharacteristicCallbacks());
  pServer->getAdvertising()->addServiceUUID(CandleService);

  // Color
  pCandleService ->addCharacteristic(&ColorCharacteristic);
  ColorDescriptor.setValue("Set color bulb");
  ColorCharacteristic.addDescriptor(&ColorDescriptor);
  ColorCharacteristic.addDescriptor(new BLE2902());
  ColorCharacteristic.setCallbacks(new ColorCharacteristicCallbacks());
  pServer->getAdvertising()->addServiceUUID(CandleService);

  // Effect
  pCandleService ->addCharacteristic(&EffectCharacteristic);
  EffectDescriptor.setValue("Set effect bulb");
  EffectCharacteristic.addDescriptor(&EffectDescriptor);
  EffectCharacteristic.addDescriptor(new BLE2902());
  EffectCharacteristic.setCallbacks(new EffecctCharacteristicCallbacks());
  pServer->getAdvertising()->addServiceUUID(CandleService);

  //
  pCandleService->start();

  // Start advertising
  pServer->getAdvertising()->start();
  
}