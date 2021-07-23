/*Program to use GATT service on ESP32 to send Battery Level
 * ESP32 works as Play Bulb Candle
 * Program by: Vo.Nguyen
 * Dated on: 21-07-2021
 * Description: The 5nd day of COVID 19 Social Distancing
 */

#include <Arduino.h>
#include <EspBLE.h>

void setup() {
  Serial.begin(115200);
  SetupBluetooth();
}


uint8_t level = 57;
  
void loop() {

    if ((int)level > 100) 
        level = 1;

    Serial.println(level);
    BatteryLevelCharacteristic.setValue(&level, 1);
    BatteryLevelCharacteristic.notify();

    level++;
    delay(5000);

}