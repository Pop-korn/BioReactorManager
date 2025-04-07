import React, {useEffect, useState} from "react";
import './App.css'

const App = () => {
    const [layers, setLayers] = useState([]); // Stores layer data

    const backend_uri = "http://192.168.0.102:8000";

    useEffect(() => {
        fetch(backend_uri + "/get-state")
            .then((response) => response.json())
            .then((data) => setLayers(data))
            .catch((error) => console.error("Error fetching layer data:", error));
    }, []);

    // Fetch the state from the server every couple of seconds.
    // TODO Implement a more efficient solution using WebSockets.
    useEffect(() => {
        const interval = setInterval(() => {
          fetch(backend_uri + '/get-state')  // Adjust the URL to your backend endpoint
            .then((response) => response.json())
            .then((data) => setLayers(data))
            .catch((error) => console.error("Error fetching layer data:", error));
        }, 1000); // 1000ms = 1 second
               // Clean up the interval on component unmount
        return () => clearInterval(interval);
    }, []);

    const handleHarvestClick = (id) => {
        fetch(backend_uri + `/harvest-layer/${id}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({duration: 5}),
        })
            .then((response) => response.json())
            .then(() => console.log('Harvesting '+ id +' : Done'))
            .catch((error) => console.error("Error sending message:", error));
    };

    const handleControlLEDClick = () => {
        fetch(backend_uri + "/blink-control-led", {
            method: "POST",
        })
            .catch((error) => console.error("Error sending message:", error));
    };


    // Handle checkbox state changes
    const handleCheckboxChange = (id) => {
        fetch(backend_uri + `/switch-light/${id}`, {
            method: "POST",
        })
            .then((response) => response.json())
            .then((data) => {
                // Update the layer with the confirmed backend state
                setLayers((prevLayers) => {
                    const updatedLayers = prevLayers.map((layer) =>
                        layer.id_ === id ? {...layer, light_state: data.new_light_state} : layer
                    );

                    // Log the updated state after applying the update.
                    const updatedLayer = updatedLayers.find((layer) => layer.id_ === id);
                    console.log(`New state of light \`${updatedLayer.name}\`: ${updatedLayer.light_state}`);

                    return updatedLayers;
                });
            })
            // .then(() => console.log("New state of light `" + layers[id].name + "` : " + data.new_light_state))
            .catch((error) => console.error("Error updating lights:", error));
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
            <h1>Nitroduck BioReactor</h1>
            <div className="w-full max-w-sm">
                {layers.map((layer) => (
                    <div
                        key={layer.id_}
                        className="flex items-center justify-between bg-white p-4 mb-3 rounded-lg shadow"
                    >
                        <label>
                            <span className="teal-text"> {layer.name} </span>
                            <span className="grey-text">(ID=<span className="teal-text"> {layer.id_} </span>) :</span>
                        </label>


                        <img src={backend_uri + "/static/tub.png"} alt={`Image ${layer.name}`}
                             className="w-12 h-12 rounded-full" width="50"/>
                        <button
                            onClick={() => handleHarvestClick(layer.id_)}
                            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                        >
                            {"Harvest"}
                        </button>

                        <label className="ml-4 flex items-center">
                            <input
                                type="checkbox"
                                checked={layer.light_state}
                                onChange={() => handleCheckboxChange(layer.id_)}
                                className="mr-2"
                            />
                            Lights
                        </label>
                    </div>
                ))}
            </div>
            <button onClick={() => handleControlLEDClick()}>
                Control LED
            </button>
        </div>
    );
};

export default App;