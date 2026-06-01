import StreetMap from "../../components/explorer/StreetMap.js";
import {useState} from "react";

const Explorer = () => {
    const [selectedUnit, setSelectedUnit] = useState(null)

    return (
        <div>
            <h1>Explorador</h1>
            <div className="flex flex-row justify-between gap-6 flex-wrap">
                <StreetMap selected={selectedUnit} onSelect={setSelectedUnit}/>
                <div className="basis-32 flex-grow p-2 border border-border min-w-fit shadow-md rounded-lg text-muted-foreground" hidden={!selectedUnit}>
                    <h2 className="whitespace-nowrap text-foreground">
                        Detalles de la unidad
                    </h2>
                    <p>✅Unidad: {selectedUnit?.unitIdentifier || selectedUnit?.id}</p>

                    <p>
                        ✅Pisos {selectedUnit?.floor ?? "N/A"}
                    </p>

                    <p>
                        ✅Cuartos {selectedUnit?.numOfRooms || "N/A"}
                    </p>

                </div>

            </div>

        </div>
    )
}

export default Explorer;