/*** Global variables ***/
const int numColores = 3; // Rojo, Amarillo, Verde
int pinSemaforo[2][numColores] = {
    {13, 12, 11}, // Pines del primer semáforo
    {10, 9, 8}    // Pines del segundo semáforo
};
int numSemaforos = 2; // Número de semáforos
bool recorridoActivo = false; // Controla si el recorrido está activo
int semaforoActual = 0; // Indica el semáforo actualmente encendido

const int N = 2;  // Número de sensores ultrasónicos
int sensores[N][2] = {
    {7, 6},  // TRIG_PIN y ECHO_PIN para el primer sensor
    {5, 4}   // TRIG_PIN y ECHO_PIN para el segundo sensor
};

int duracion[N];
int distancia[N];

void setup() {
    Serial.begin(9600);
    configurarSemaforos();
    configurarSensores();
}

void loop() {
    if (Serial.available() > 0) {
        String input = Serial.readStringUntil('\n'); // Lee entrada
        procesarEntrada(input);
    }
    if (recorridoActivo) {
        controlarSemaforos();
    }
}

void configurarSemaforos() {
    for (int i = 0; i < numSemaforos; i++) {
        for (int j = 0; j < numColores; j++) {
            pinMode(pinSemaforo[i][j], OUTPUT);
            digitalWrite(pinSemaforo[i][j], LOW); // Apaga al inicio
        }
    }
}

void configurarSensores() {
    for (int i = 0; i < N; i++) {
        pinMode(sensores[i][0], OUTPUT);  // TRIG_PIN
        pinMode(sensores[i][1], INPUT);   // ECHO_PIN
    }
}

void controlarSemaforos() {
    controlSemaforo(semaforoActual);
    semaforoActual = (semaforoActual + 1) % numSemaforos; // Cambia al siguiente
}

void procesarEntrada(String input) {
    if (input == "ON") {
        recorridoActivo = true;
    } else if (input == "OFF") {
        recorridoActivo = false;
        apagarSemaforos();
    }
}

void controlSemaforo(int i) {
    if (!recorridoActivo) return;
    cambiarEstadoSemaforo(i, 2, HIGH, 4000); // Verde

    if (!recorridoActivo) return;
    parpadeoVerdeAntesDeAmarillo(i);

    cambiarEstadoSemaforo(i, 1, HIGH, 2000); // Amarillo

    if (!recorridoActivo) return;
    cambiarEstadoSemaforo(i, 0, HIGH, 6000); // Rojo
}

void parpadeoVerdeAntesDeAmarillo(int i) {
    for (int j = 0; j < 3 && recorridoActivo; j++) {
        cambiarEstadoSemaforo(i, 2, HIGH, 250);
        cambiarEstadoSemaforo(i, 2, LOW, 250);
    }
}

void cambiarEstadoSemaforo(int semaforo, int color, int estado, int tiempo) {
    digitalWrite(pinSemaforo[semaforo][color], estado);
    imprimirEstado(semaforo, color, estado);
    delay(tiempo);
}

void imprimirEstado(int semaforo, int color, int estado) {
    String colorCode = color == 0 ? "LER" : color == 1 ? "LEA" : "LEV";
    Serial.println(colorCode + ":" + String(semaforo) + ":" + String(estado));
}

void apagarSemaforos() {
    for (int i = 0; i < numSemaforos; i++) {
        for (int j = 0; j < numColores; j++) {
            digitalWrite(pinSemaforo[i][j], LOW);
        }
    }
}
