from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from dataclasses import dataclass
from pydantic import BaseModel
import mqtt_manager
app = FastAPI()

# Enable CORS for frontend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Change this to your frontend URL in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Serve images from the static folder
app.mount("/static", StaticFiles(directory="static"), name="static")



@dataclass
class Layer:
    id_: int
    name: str
    light_state: bool

layers: list[Layer] = [Layer(i, f'layer_{5 - i}', True) for i in range(5)]  # Current state of the layers.

# API endpoint to provide items with local image paths
@app.get("/get-state")
def get_state():
    return [
        {"id_": l.id_, "name": l.name, "light_state": l.light_state} for l in layers
    ]




class HarvestMeta(BaseModel):
    duration: int

@app.post('/harvest-layer/{id_}')
def harvest_layer(id_: int, harvest_meta: HarvestMeta):
    mqtt_manager.harvest_layer(layer_id=id_, duration_seconds=harvest_meta.duration)
    return [f'Successfully harvested layer {id_}.']


@app.post('/blink-control-led')
def blink_control_led():
    mqtt_manager.blink_led()
    return []

@app.post('/switch-light/{id_}')
def switch_light(id_: int):
    new_light_state = not layers[id_].light_state
    layers[id_].light_state = new_light_state

    if new_light_state:
        mqtt_manager.light_on(id_)
    else:
        mqtt_manager.light_off(id_)

    return {"id_" : id_, "new_light_state": new_light_state}











# Data model for receiving button messages
class MessageRequest(BaseModel):
    message: str

# Handle button clicks
@app.post("/send-message/{button_id}")
def send_message(button_id: int, request: MessageRequest):
    return {"response": f"Received '{request.message}' from Button {button_id}"}

    
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

