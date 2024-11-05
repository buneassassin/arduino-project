#include <ArduinoJson.h>  // Asegúrate de instalar la librería ArduinoJson

/*** Global variables ***/
const int numColores = 3; // Rojo, Amarillo, Verde
int pinSemaforo[10][numColores]; // Soporta hasta 10 semáforos
int numSemaforos = 0; // Inicializa el número de semáforos
bool recorridoActivo = false; // Controla si el recorrido está activo
int semaforoActual = 0; // Indica el semáforo actualmente encendido

void setup() {
    Serial.begin(9600);
    for (int i = 0; i < 10; i++) { // Inicializa pines para hasta 10 semáforos
        for (int j = 0; j < numColores; j++) {
            pinMode(pinSemaforo[i][j], OUTPUT);
            digitalWrite(pinSemaforo[i][j], LOW); // Asegura que estén apagados al inicio
        }
    }
}

void loop() {
    if (Serial.available() > 0) {
        String input = Serial.readStringUntil('\n'); // Lee la línea hasta un salto de línea
        procesarEntrada(input);
    }

    // Si el modo recorrido está activo, realiza el recorrido de semáforos
    if (recorridoActivo) {
        controlSemaforo(semaforoActual);
        semaforoActual = (semaforoActual + 1) % numSemaforos; // Avanza al siguiente semáforo
    }
}

void procesarEntrada(String input) {
    if (input.startsWith("CONFIG: ")) {
        Serial.println("Recibido CONFIG");
        String config = input.substring(8); // Elimina "CONFIG: "
        configurarSemaforosDesdeJson(config);

    } else if (input == "ON") {
        // Activa el modo recorrido
        recorridoActivo = true;

    } else if (input == "OFF") {
        // Desactiva el modo recorrido y apaga los LEDs
        recorridoActivo = false;
        apagarSemaforos();

    } else {
        // Interpretar comandos de encendido manual
        if (isdigit(input.charAt(0))) {
            int semaforoId = input.charAt(0) - '0';
            char color = input.charAt(1);  // Color es el segundo carácter
            encenderLed(semaforoId, color);
        }
    }
}

void configurarSemaforosDesdeJson(String json) {
    StaticJsonDocument<512> doc; // Ajusta el tamaño si es necesario
    DeserializationError error = deserializeJson(doc, json);

    if (error) {
        Serial.print("Error de JSON: ");
        Serial.println(error.c_str());
        return;
    }

    JsonArray semaforos = doc.as<JsonArray>();
    numSemaforos = 0;

    for (JsonObject semaforo : semaforos) {
        if (numSemaforos < 10) {
            JsonArray pines = semaforo["Pins"];
            for (int i = 0; i < numColores; i++) {
                pinSemaforo[numSemaforos][i] = pines[i];
            }
            numSemaforos++;
        }
    }

    // Imprime la configuración para verificar
    for (int i = 0; i < numSemaforos; i++) {
        Serial.print("Sem");
        Serial.print(i);
        Serial.print(" Pines: R=");
        Serial.print(pinSemaforo[i][0]);
        Serial.print(", A=");
        Serial.print(pinSemaforo[i][1]);
        Serial.print(", V=");
        Serial.println(pinSemaforo[i][2]);

    }
}

void encenderLed(int semaforo, char color) {
    apagarSemaforos(); // Apaga todos los LEDs antes de encender uno nuevo
    int colorIndex = (color == 'R') ? 0 : (color == 'A') ? 1 : 2;
    digitalWrite(pinSemaforo[semaforo][colorIndex], HIGH);
    Serial.print("OFF:");
    Serial.print(semaforo);
    Serial.print(" color ");
    Serial.println(color);
}

void apagarSemaforos() {
    Serial.println("ON ALL...");
    for (int i = 0; i < numSemaforos; i++) {
        for (int j = 0; j < numColores; j++) {
            digitalWrite(pinSemaforo[i][j], LOW);
        }
    }
}

void controlSemaforo(int i) {
    if (!recorridoActivo) return; // Verificar si el recorrido sigue activo

    digitalWrite(pinSemaforo[i][2], HIGH); // Verde
    delay(4000);
    digitalWrite(pinSemaforo[i][2], LOW);

    if (!recorridoActivo) return; // Verificar si el recorrido sigue activo
    parpadeoVerdeAntesDeAmarillo(i);

    digitalWrite(pinSemaforo[i][1], HIGH); // Amarillo
    delay(2000);
    digitalWrite(pinSemaforo[i][1], LOW);

    if (!recorridoActivo) return; // Verificar si el recorrido sigue activo
    digitalWrite(pinSemaforo[i][0], HIGH); // Rojo
    delay(6000);
    digitalWrite(pinSemaforo[i][0], LOW);
}

void parpadeoVerdeAntesDeAmarillo(int i) {
    for (int j = 0; j < 3; j++) {
        if (!recorridoActivo) break;
        digitalWrite(pinSemaforo[i][2], HIGH);
        delay(250);
        digitalWrite(pinSemaforo[i][2], LOW);
        delay(250);
    }
}
