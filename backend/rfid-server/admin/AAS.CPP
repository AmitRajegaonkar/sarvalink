void keypadTask(void *pvParameters) {
    const unsigned long debounceDelay = 50; // 50ms debounce time
    unsigned long lastDebounceTime = 0;
    char lastKey = '\0';
    
    while (true) {
        char key = keypad.getKey(); // Check if a key is pressed
        if (key) {
            // Debounce logic
            if ((millis() - lastDebounceTime) > debounceDelay) {
                lastDebounceTime = millis();
                
                if (key >= '0' && key <= '9' && enteredNumber.length() < 11) {
                    enteredNumber += key;
                    lcd.clear();
                    lcd.setCursor(0, 0);
                    lcd.print("Enter Number:");
                    lcd.setCursor(0, 1);
                    lcd.print(enteredNumber);  // Display number on LCD
                } else if (key == '*' && enteredNumber.length() > 0) {
                    enteredNumber.remove(enteredNumber.length() - 1);  // Backspace
                    lcd.clear();
                    lcd.setCursor(0, 0);
                    lcd.print("Enter Number:");
                    lcd.setCursor(0, 1);
                    lcd.print(enteredNumber);
                } else if (key == '#' && enteredNumber.length() == 11) {
                    if (enteredNumber == "00000000000") {
                        // Enter Admin Mode
                        lcd.clear();
                        lcd.setCursor(0, 0);
                        lcd.print("Admin Mode");
                        lcd.setCursor(0, 1);
                        lcd.print("Activated");

                        // Add your Admin-specific logic here, such as displaying options or setting parameters.
                        Serial.println("Admin Mode Activated");
                        buzz(500);  // Signal Admin Mode Activation
                        
                        // Reset enteredNumber
                        enteredNumber = "";
                        delay(1000);  // Delay before returning to normal mode
                        lcd.clear();
                        lcd.print("Enter Number:");
                    } else {
                        sendKeyToServer(enteredNumber);
                        unsigned long currentTime = millis();

                        // Check if the same number is entered within 10 seconds
                        if (enteredNumber == lastEnteredNumber && (currentTime - lastNumberTime <= 5000)) {
                            lcd.clear();
                            lcd.setCursor(0, 0);
                            lcd.print("Same Number");
                            lcd.setCursor(0, 1);
                            lcd.print(enteredNumber);
                            buzz(500);
                            Serial.println("Same Number: " + enteredNumber);
                        } else {
                            lcd.clear();
                            lcd.setCursor(0, 0);
                            lcd.print("Success");
                            buzz(200);
                            Serial.println("New Number: " + enteredNumber);
                            lastEnteredNumber = enteredNumber;  // Update lastEnteredNumber
                            lastNumberTime = currentTime;  // Update lastNumberTime
                        }

                        delay(200);  // Optional: Small delay to make sure the user sees the message
                        lcd.clear();
                        lcd.print("Enter Number:");
                        enteredNumber = "";  // Reset the entered number
                    }
                }
                lastKey = key;  // Store the last key press
            }
        }
        vTaskDelay(pdMS_TO_TICKS(10));  // Small delay to allow other tasks to run
    }
}
