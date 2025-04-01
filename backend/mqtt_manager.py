import logging
import time

import numpy as np
import paho.mqtt.client as mqtt

broker = '10.0.32.141'
port = 1883
QOS = 1
CLEAN_SESSION = True
logging.basicConfig(level=logging.INFO)  # error logging


def send_to_esp_topic(rack=1, layer=1):
    return f'rpi/rack{rack}/layer{layer}'


def receive_from_esp_topic(rack=1, layer=1):
    return f'esp/rack{rack}/layer{layer}'


# use DEBUG,INFO,WARNING
def on_subscribe(client, userdata, mid, granted_qos):  # create function for callback
    logging.info(f'SUBSCRIBED from: {str(mid)}')
    time.sleep(1)


def on_disconnect(client, userdata, rc=0):
    logging.info('DISCONNECTED. Code: ' + str(rc))


def on_connect(client, userdata, flags, rc):
    logging.info('CONNECTED flags' + str(flags) + 'result code ' + str(rc))


def on_message(client, userdata, message):
    msg = str(message.payload.decode('utf-8'))
    print('Recieved from ' + message.topic + ':', f'`{msg}`')


def on_publish(client, userdata, mid):
    logging.info('message published ' + str(mid))

def blink_led():
    msg = 'blink_led'
    client.publish(send_to_esp_topic(), msg)


client = mqtt.Client('ClientA', False)  # create client object
client.connect(broker, port)  # establish connection
time.sleep(1)
client.loop_start()
client.subscribe(receive_from_esp_topic())

# client.on_subscribe = on_subscribe   #assign function to callback
# client.on_disconnect = on_disconnect #assign function to callback
# client.on_connect = on_connect #assign function to callback
client.on_message = on_message

if __name__ == '__main__':
    # count = 1
    while True:  # runs forever break with CTRL+C
        print('publishing to `', send_to_esp_topic() + '`')
        # msg = 'Sprava od A: ' + str(count)
        # count += 1

        rnd = np.random.random()
        msg = 'blink_led' if rnd < 0.5 else 'open_valve'
        # msg = 'step'
        client.publish(send_to_esp_topic(), msg)

        time.sleep(np.random.randint(5, 8))

# client.disconnect()
# client.loop_stop()