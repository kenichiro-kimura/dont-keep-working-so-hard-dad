/*
 * based on https://github.com/yuuu/m5stack-soracom-arc
 */
#include <Ultrasonic.h>
#include <PubSubClient.h>
#include <M5Stack.h>
#include <HTTPClient.h>
#include <EEPROM.h>
#include <WiFi.h>
#include <WiFiManager.h>
#include <WireGuard-ESP32.h>

#define SENSOR_NAME "dwshd-sensor1"
#define SENSOR_UPDATE_INTERVAL 60

Ultrasonic sonar(22);
WiFiClient net;
PubSubClient client = PubSubClient(net);
char buffer[1024];
unsigned long lastMillis = 0;
char message[256];
char subscribe_channel[256];
char publish_channel[256];
long distance = 0;
time_t now;
long distanceCount = 0;
long distanceSum = 0;

class IPAddressParameter : public WiFiManagerParameter {
public:
  IPAddressParameter(const char *id, const char *placeholder, IPAddress address)
    : WiFiManagerParameter("") {
    init(id, placeholder, address.toString().c_str(), 16, "", WFM_LABEL_BEFORE);
  }

  bool getValue(IPAddress &ip) {
    return ip.fromString(WiFiManagerParameter::getValue());
  }
};

class IntParameter : public WiFiManagerParameter {
public:
  IntParameter(const char *id, const char *placeholder, long value, const uint8_t length = 10)
    : WiFiManagerParameter("") {
    init(id, placeholder, String(value).c_str(), length, "", WFM_LABEL_BEFORE);
  }

  long getValue() {
    return String(WiFiManagerParameter::getValue()).toInt();
  }
};

typedef struct Backup {
  char privateKey[64];
  char publicKey[64];
  char endpointAddress[32];
  uint32_t localIp;
  uint16_t endpointPort;
} Backup;

typedef struct Params {
  IPAddress* ip;
  IPAddressParameter* localIp;
  WiFiManagerParameter* privateKey;
  WiFiManagerParameter* publicKey;
  WiFiManagerParameter* endpointAddress;
  IntParameter* endpointPort;
} Params;

static WireGuard wg;

void showMessage(String msg)
{
  M5.Lcd.setTextSize(2);
  M5.Lcd.setCursor(0, 0, 2);
  M5.Lcd.fillScreen(BLACK);
  M5.Lcd.println(msg);
}

void configModeCallback (WiFiManager *myWiFiManager) {
  Serial.println("Entered config mode");
  Serial.println(WiFi.softAPIP());
  Serial.println(myWiFiManager->getConfigPortalSSID());
  showMessage("Please connect to this AP\nto config WiFi\nSSID: " + myWiFiManager->getConfigPortalSSID());
}

void backupParams(Params* params)
{
  Backup backup;
  memset(&backup, 0, sizeof(backup));

  strncpy(backup.privateKey, params->privateKey->getValue(), 64);
  strncpy(backup.publicKey, params->publicKey->getValue(), 64);
  strncpy(backup.endpointAddress, params->endpointAddress->getValue(), 32);
  backup.privateKey[63]='\0';
  backup.publicKey[63]='\0';
  backup.endpointAddress[31]='\0';
  backup.endpointPort = params->endpointPort->getValue();
  if (params->localIp->getValue(*params->ip)) {
    backup.localIp = *params->ip;
    Serial.print("Local IP: ");
    Serial.println(*params->ip); 
  } else {
    Serial.println("Incorrect IP");
  }
  EEPROM.put(0, backup);
  if (EEPROM.commit()) {
      Serial.println("Settings saved");
  } else {
      Serial.println("EEPROM error");
  }
}

void restoreParams(Params* params)
{
  Backup backup;
  memset(&backup, 0, sizeof(backup));

  EEPROM.begin( 512 );
  EEPROM.get(0, backup);
  Serial.println("Settings loaded");

  backup.privateKey[63]='\0';
  backup.publicKey[63]='\0';
  backup.endpointAddress[31]='\0';

  params->ip = new IPAddress(backup.localIp);
  params->localIp = new IPAddressParameter("local_ip", "interface address", *params->ip);
  params->privateKey = new WiFiManagerParameter("private_key", "interface private key", backup.privateKey, 64);
  params->publicKey = new WiFiManagerParameter("public_key", "peer public key", backup.publicKey, 64);
  params->endpointAddress = new WiFiManagerParameter("endpoint_address", "peer endpoint address", backup.endpointAddress, 32);
  params->endpointPort = new IntParameter("endpoint_port", "peer endpoint port", backup.endpointPort, 6);
}

void setupWifi(Params* params)
{
  WiFiManager wifiManager;
  bool isWifiConfigSucceeded = false;
  bool doManualConfig = false;

  wifiManager.addParameter(params->privateKey);
  wifiManager.addParameter(params->localIp);
  wifiManager.addParameter(params->publicKey);
  wifiManager.addParameter(params->endpointAddress);
  wifiManager.addParameter(params->endpointPort);
  wifiManager.setAPCallback(configModeCallback);
 
  showMessage("Push A(Left) button to enter Wifi config.");
  for(int i=0 ; i<200 ; i++) {
    M5.update();
    if (M5.BtnA.wasReleased() || M5.BtnA.pressedFor(1000, 200)) {
      doManualConfig = true;
      break;
    }
    delay(10);
  }

  if (doManualConfig) {
    Serial.println("wifiManager.startConfigPortal()");
    if (wifiManager.startConfigPortal()) {
      isWifiConfigSucceeded = true;
      Serial.println("startConfigPortal() connect success!");
    }
    else {
      Serial.println("startConfigPortal() connect failed!");
    }
  } else {
    showMessage("Wi-Fi connecting...");

    Serial.println("wifiManager.autoConnect()");
    if (wifiManager.autoConnect()) {
      isWifiConfigSucceeded = true;
      Serial.println("autoConnect() connect success!");
    }
    else {
      Serial.println("autoConnect() connect failed!");
    }
  }
  if (!isWifiConfigSucceeded)
  {
    showMessage("Wi-Fi failed.");
    for(;;);    
  }
  showMessage("Wi-Fi connected.");
}

void setupArc(Params* params)
{
  showMessage("Adjusting system time...");
  configTime(9 * 60 * 60, 0, "ntp.jst.mfeed.ad.jp", "ntp.nict.jp", "time.google.com");
  Serial.println(params->privateKey->getValue());
  Serial.println(params->endpointAddress->getValue());
  Serial.println(params->publicKey->getValue());
  Serial.println(params->endpointPort->getValue());
  IPAddress local_ip(10,217,133,173);

  wg.begin(
    *params->ip,
    params->privateKey->getValue(),
    params->endpointAddress->getValue(),
    params->publicKey->getValue(),
    (uint16_t)params->endpointPort->getValue()
  );
  showMessage("WireGuard started.");
}

void messageReceived(char* topic, byte* payload, unsigned int length){
  int i;
  Serial.print("incoming: ");
  strcpy(buffer,"Next Break Time:\n");
  char j = strlen(buffer);
  for (i = 0; i < length; i++) {
    Serial.print((char)payload[i]);
    buffer[j+i] = (char)payload[i];
  }
  buffer[j+i] = '\0';
  Serial.println("");
  showMessage(buffer);
}

void connectMqtt() {
  while(!client.connect(SENSOR_NAME)){
    delay(200);
  }
  client.subscribe(subscribe_channel);
}

void setupMqtt() {
  client.setServer("beam.soracom.io",1883);
  client.setCallback(messageReceived);
  connectMqtt();
}

void setup()
{
  sprintf(subscribe_channel,"devices/%s/messages/devicebound/#",SENSOR_NAME);
  sprintf(publish_channel,"devices/%s/messages/events/$.ct=application%2Fjson%3Bcharset%3Dutf-8",SENSOR_NAME);

  Params params;
  memset(&params, 0, sizeof(params));

  M5.begin();
  Serial.println("M5Stack started.");
  
  restoreParams(&params);
  setupWifi(&params);

  setupArc(&params);
  Serial.println("setupArc done");
  setupMqtt();
  Serial.println("setup Mqtt done");

  backupParams(&params);
  delay(5000);
  showMessage("waiting message from server..");
  Serial.println("go start");
}

void loop()
{
  client.loop();
  if (!client.connected()){
    connectMqtt();
  }
  
  // publish a message roughly every minutes.

  if (millis() - lastMillis > 1000) {
    lastMillis = millis();
    distance = sonar.MeasureInCentimeters();
    distanceSum += distance;
    distanceCount++;
    if (distanceCount >= SENSOR_UPDATE_INTERVAL){
      // avarage for a minute
      distance = distanceSum / SENSOR_UPDATE_INTERVAL;
      distanceCount = 0;
      time(&now);
      sprintf(message,"{\"distance\": %d,\"unixTime\": %d}",distance,now);
      client.publish(publish_channel, message);
      Serial.print("send ");
      Serial.println(message);
      distanceSum = 0;
    } else {
      Serial.print("distance: ");
      Serial.println(distance);
    }
  }
}
