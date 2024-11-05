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
}

void apagarSemaforos() {
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
    PrintVerde(i,1);
    digitalWrite(pinSemaforo[i][2], LOW);
    PrintVerde(i,0);

    if (!recorridoActivo) return; // Verificar si el recorrido sigue activo
    parpadeoVerdeAntesDeAmarillo(i);

    digitalWrite(pinSemaforo[i][1], HIGH); // Amarillo
    delay(2000);
    PrintAmarillo(i,1);
    digitalWrite(pinSemaforo[i][1], LOW);
    PrintAmarillo(i,0);

    if (!recorridoActivo) return; // Verificar si el recorrido sigue activo
    digitalWrite(pinSemaforo[i][0], HIGH); // Rojo
    delay(6000);
    PrintRojo(i,1);
    digitalWrite(pinSemaforo[i][0], LOW);
    PrintRojo(i,1);
}

void parpadeoVerdeAntesDeAmarillo(int i) {
    for (int j = 0; j < 3; j++) {
        if (!recorridoActivo) break;
        digitalWrite(pinSemaforo[i][2], HIGH);
        delay(250);
        PrintVerde(i,1);
        digitalWrite(pinSemaforo[i][2], LOW);
        delay(250);
        PrintVerde(i,0);
    }
}

 void PrintRojo(int semaforo, int valor){	
    Serial.println("LER:"+String(semaforo)+":"+String(valor));
  }

  void PrintVerde(int semaforo, int valor){
    Serial.println("LEV:"+String(semaforo)+":"+String(valor));
  }

  void PrintAmarillo(int semaforo, int valor){
    Serial.println("LEA:"+String(semaforo)+":"+String(valor));
  }
