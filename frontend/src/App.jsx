import React, { useEffect, useState } from "react";




// Handle button clicks
const handleButtonClick = (id) => {
  const message = `Hello from Button ${id}`;

  fetch(`http://10.0.32.141:8000/send-message/${id}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ message }),
  })
    .then((response) => response.json())
    .then((data) => {
      console.log(data);
    })
    .catch((error) => console.error("Error sending message:", error));
};




const App = () => {
  const [layers, setLayers] = useState([]); // Stores layer data
  const [responses, setResponses] = useState({}); // Stores responses for each button    // TODO

  useEffect(() => {
    fetch("http://10.0.32.141:8000/get-state")
      .then((response) => response.json())
      .then((data) => setLayers(data))
      .catch((error) => console.error("Error fetching layer data:", error));
  }, []);

  const handleHarvestClick = (id) => {
    const message = `Hello from Button ${id}`;

    fetch(`http://10.0.32.141:8000/harvest-layer/${id}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({duration: 5}),
    })
      .then((response) => response.json())
      .then((data) => console.log(data))  // Print the response for debugging.
      // .then((data) => {
      //   setResponses((prev) => ({ ...prev, [id]: data.response }));
      // })
      .catch((error) => console.error("Error sending message:", error));
  };


  // Handle checkbox state changes
  const handleCheckboxChange = (id) => {
    fetch(`http://10.0.32.141:8000/switch-light/${id}`, {
      method: "POST",
    })
      .then((response) => response.json())
      .then((data) => {
        // Update the layer with the confirmed backend state
        setLayers((prevLayers) => {
          const updatedLayers = prevLayers.map((layer) =>
            layer.id_ === id ? { ...layer, light_state: data.new_light_state } : layer
          );

          // Log the updated state after applying the update.
          const updatedLayer = updatedLayers.find((layer) => layer.id_ === id);
          console.log(`New state of light \`${updatedLayer.number}\`: ${updatedLayer.light_state}`);

          return updatedLayers;
        });
      })
      // .then(() => console.log("New state of light `" + layers[id].number + "` : " + data.new_light_state))
      .catch((error) => console.error("Error updating lights:", error));
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <div className="w-full max-w-sm">
        {layers.map((layer) => (
          <div
            key={layer.number}
            className="flex items-center justify-between bg-white p-4 mb-3 rounded-lg shadow"
          >
            <label>Layer {layer.number}:</label>



            <img src={"http://10.0.32.141:8000/static/tub.png"} alt={`Image ${layer.number}`} className="w-12 h-12 rounded-full" width="100"/>
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

            
            {responses[layer.number] && <span className="ml-4 text-gray-700">{responses[layer.number]}</span>}
          </div>
        ))}
      </div>
    </div>
  );
};

export default App;