import {Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow} from "../../components/ui/table.tsx";
import {Button} from "../../components/ui/button.tsx";
import {useDeletePropertyMutation} from "../../services/api/propertyApi.js";
import {useNavigate, useParams} from "react-router-dom";


const PropertyDetail = (props) => {
    const {data} = props;

    const { id } = useParams();
    const navigate = useNavigate();

    const [deleteProperty, {isLoading: isDeleting}] = useDeletePropertyMutation();

    return (
        <div>
            <div className="flex flex-row justify-between">
                <h1>
                    {data?.data?.title}
                </h1>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={() => navigate(`/properties/edit/${id}`)}>
                        Editar Propiedad
                    </Button>
                    <Button variant="destructive" isLoading={isDeleting} onClick={() => deleteProperty(id).then(()=> navigate('/properties')) }>
                        Eliminar Propiedad
                    </Button>
                </div>
            </div>

            La tabla a continuación muestra los datos de la propiedad de la base de datos. <br/>

            <Table>
                <TableCaption >Datos de la Propiedad de la BD</TableCaption>
                <TableHeader>
                    <TableRow>
                        <TableHead key={0}>Título</TableHead>
                        <TableHead key={1}>Valor</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    <TableRow>
                        <TableCell key={0}>ID</TableCell>
                        <TableCell key={1}>{data?.data?.id}</TableCell>
                    </TableRow>

                    <TableRow>
                        <TableCell key={0}>Título</TableCell>
                        <TableCell key={1}>{data?.data?.title}</TableCell>
                    </TableRow>

                    <TableRow>
                        <TableCell key={0}>Descripción</TableCell>
                        <TableCell key={1}>{data?.data?.description}</TableCell>
                    </TableRow>

                    <TableRow>
                        <TableCell key={0}>Tipo de Inmueble</TableCell>
                        <TableCell key={1}>{data?.data?.realEstateType}</TableCell>
                    </TableRow>

                    <TableRow>
                        <TableCell key={0}>Precio de Mercado</TableCell>
                        <TableCell key={1}>{data?.data?.marketPrice || "-"}</TableCell>
                    </TableRow>

                    <TableRow>
                        <TableCell key={0}>Tamaño del Lote </TableCell>
                        <TableCell key={1}>{data?.data?.lotSize || "-"}</TableCell>
                    </TableRow>

                    <TableRow>
                        <TableCell key={0}>Año de Construcción</TableCell>
                        <TableCell key={1}>{data?.data?.yearBuilt || "-"}</TableCell>
                    </TableRow>

                    <TableRow>
                        <TableCell key={0}>Unidades</TableCell>
                        <TableCell key={1}>
                            {data?.data?.units?.map((unit, index) => (
                                <div key={index}>
                                    UNIDAD {unit.id}
                                </div>
                            ))}
                        </TableCell>
                    </TableRow>
                </TableBody>
            </Table>
        </div>

    )
}

export default PropertyDetail;