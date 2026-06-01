import PropertyTable from "../../components/properties/PropertyTable.tsx";
import DetailedPropertyTable from "../../components/properties/DetailedPropertyTable.js";
import { Button } from "../../components/ui/button.tsx";
import { useState } from "react";
import { selectPropertiesByPropertyId } from "../../services/slices/objectSlice.js";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Plus } from "lucide-react";

const Properties = (props) => {
    const { propertySelection } = props;

    const [view, setView] = useState("detailed") // ["detailed", "compact"]

    const navigate = useNavigate()

    const properties = useSelector(state => selectPropertiesByPropertyId(state, propertySelection));

    const ViewSelection = () => {
        return (
            <div className="flex flex-wrap items-center justify-between flex-row gap-4 mb-4">
                <div className="flex flex-row gap-1 bg-background w-fit p-[7px] rounded-xl">
                    <Button
                        data-active={view === "detailed"}
                        variant="tab"
                        onClick={() => setView("detailed")}
                    >
                        Detallado
                    </Button>
                    <Button
                        data-active={view === "compact"}
                        variant="tab"
                        onClick={() => setView("compact")}
                    >
                        Compacto
                    </Button>
                </div>
                {
                    /*
                                    <CreateProperty trigger={<Button variant="gradient" className="w-fit">Add Property</Button>}/>
                     */
                }

                <Button variant="gradient" className="w-fit"
                    onClick={() => navigate("/properties/create")}
                >
                    <Plus size={18} className="mr-1" />
                    Añadir Propiedad
                </Button>

            </div>
        )
    }

    return (
        <div>
            <h1>
                Propiedades
            </h1>
            <div className="text-md mb-2 text-gray-500">
                Estas son tus propiedades. Para más información como las unidades de cada propiedad, haz clic en la propiedad.
            </div>

            <ViewSelection />

            {view === "detailed" ? <DetailedPropertyTable properties={properties} /> : <PropertyTable properties={properties} />}

        </div>
    )
}

export default Properties;