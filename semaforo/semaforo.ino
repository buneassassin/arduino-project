/*** Global variables ***/
const int numColores = 3; // Rojo, Amarillo, Verde
int pinSemaforo[2][numColores] = {
    {13, 12, 11}, // Pines del primer semáforo
    {10, 9, 8}    // Pines del segundo semáforo
};
int numSemaforos = 2; // Número de semáforos
int semaforoActual = 0; // Variable para alternar entre semáforos

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
      ControlSensores();

    controlarSemaforos();
    }

void ControlSensores() {
    for(int i = 0; i < N; i++) {
        MedirDistancia(i);
        ImprimirDistancia(i);
        delay(100);
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
    semaforoActual = (semaforoActual + 1) % numSemaforos; // Alterna entre semáforos
}

// Función para controlar el semáforo
void controlSemaforo(int i) {
    // Verde encendido
    cambiarEstadoSemaforo(i, 2, HIGH, 4000); // Verde ON
    parpadeoVerdeAntesDeAmarillo(i);  // Parpadeo antes de cambiar a amarillo
    cambiarEstadoSemaforo(i, 2, LOW, 0);  // Verde OFF

    // Amarillo encendido
    cambiarEstadoSemaforo(i, 1, HIGH, 2000); // Amarillo ON
    cambiarEstadoSemaforo(i, 1, LOW, 0); // Amarillo OFF

    // Rojo encendido
    cambiarEstadoSemaforo(i, 0, HIGH, 6000); // Rojo ON
    cambiarEstadoSemaforo(i, 0, LOW, 0); // Rojo OFF
}
void parpadeoVerdeAntesDeAmarillo(int i) {
    for (int j = 0; j < 3 ; j++) {
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


void MedirDistancia(int sensor) {
    digitalWrite(sensores[sensor][0], LOW);
    delay(2);
    digitalWrite(sensores[sensor][0], HIGH);
    delay(1);
    digitalWrite(sensores[sensor][0], LOW);

    duracion[sensor] = pulseIn(sensores[sensor][1], HIGH);
    distancia[sensor] = duracion[sensor] / 58.2;
}

void ImprimirDistancia(int sensor) {
    Serial.print("SON:");
    Serial.print(sensor);
    Serial.print(":");
    Serial.println(distancia[sensor]);
}
