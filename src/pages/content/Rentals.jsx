import {useSelector} from "react-redux";
import {useNavigate} from "react-router-dom";
import {Button} from "../../components/ui/button.tsx";
import {Plus, PlusIcon} from "lucide-react";
import RentalTable from "../../components/rentals/RentalTable.tsx";
import {selectAllTenants, selectTenantByLeaseId, selectUnitsByPropertyId} from "../../services/slices/objectSlice.js";


const Rentals = (props) => {
    const {propertySelection} = props;

    const navigate = useNavigate();

    const tenants = useSelector((state) => selectAllTenants(state));

    const units = useSelector((state) => selectUnitsByPropertyId(state, propertySelection)).map(unit => {
        const tenant = tenants.find(tenant => tenant.id === unit.tenantId)
        return {
            ...unit,
            tenant: tenant
        }
    })

    
    return (
        <>
            <h1>
                Unidades en Alquiler
            </h1>


            <p className="text-md mb-3 text-gray-500">
                Estas son tus propiedades en alquiler, aquí se muestran las unidades de cada propiedad. Puedes filtrar las unidades por propiedad usando el menú desplegable arriba.
            </p>

                <RentalTable units={units} />
        </>

    )
}

export default Rentals;