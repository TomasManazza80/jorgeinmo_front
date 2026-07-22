import React, {useEffect, useState} from "react";
import {
    ArrowLeft,
    ArrowRight, BadgeCheck, Building2,
    BuildingIcon,
    Check, CheckCircle2,
    CrossIcon, DoorClosed,
    Home,
    Image,
    Info,
    ListIcon,
    MapPin, Plus,
    SquareIcon,
    SquareStack, XIcon
} from "lucide-react";
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {propertySchema} from "../../utils/formSchemas.js";
import {Form, FormControl, FormField, FormGroup, FormItem, FormLabel, FormMessage} from "../../components/ui/form.tsx";
import {Card, CardContent, CardHeader, CardTitle} from "../../components/ui/card.tsx";
import {Input} from "../../components/ui/input.tsx";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "../../components/ui/select.tsx";
import {getRealEstateIcon, ListingStatus} from "../../utils/magicNumbers.js";
import {RealEstateType} from "../../utils/magicNumbers.js";
import {Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious} from "../../components/ui/carousel.tsx";
import {Button} from "../../components/ui/button.tsx";
import {
    Dialog,
    DialogContent,
    DialogDescription, DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from "../../components/ui/dialog.tsx";
import UnitCreationTable from "../../components/properties/UnitCreationTable.js";
import {useCreatePropertyMutation, useUpdatePropertyMutation, useGetPropertyQuery} from "../../services/api/propertyApi.js";
import {useNavigate, useParams} from "react-router-dom";
import {Progress} from "../../components/ui/multi-step.js";
import {toast} from "sonner";
import ImageUploader from "../../components/ui/ImageUploader.jsx";


const PropertyCreation = () => {
    const { id } = useParams();
    const isEditMode = Boolean(id);

    const navigate = useNavigate();

    const [createProperty, {isLoading: isCreating}] = useCreatePropertyMutation();
    const [updateProperty, {isLoading: isUpdating}] = useUpdatePropertyMutation();
    const { data: propertyData, isLoading: isLoadingProperty } = useGetPropertyQuery(id, { skip: !isEditMode });


    const [tab, setTab] = useState(1)

    const [unitMultiplicity, setUnitMultiplicity] = useState("single")


    const unitMultiplicityOptions = [
        {
            title: "Unidad única",
            description: "Completa el formulario para crear la propiedad.",
            icon: <Home className="w-6 h-6" />,
            value: "single"
        }
    ]



    const propertyForm = useForm(({
        resolver: zodResolver(propertySchema),
        defaultValues: {
            title: "",
            description: "",
            lotSize: "",
            yearBuilt: "",
            realEstateType: "",
            marketPrice: "",
            street: "",
            city: "",
            state: "",
            zip: "",
            country: "",
            publishToPortals: false,
            gvamx: false,
            zonaprop: false,
            argenprop: false,
            images: [],
            units: [
                {
                    unitNumber: "",
                    floor: "",
                    unitSize: "",
                    numOfFloors: "",
                    numOfRooms: "",
                    numOfBedrooms: "",
                    numOfBathrooms: "",
                    garages: "",
                    status: "ACTIVE",
                    rentalPrice: "",
                    images: []
                }
            ]
        },
        mode: "onChange"
    }))

    useEffect(() => {
        if (isEditMode && propertyData?.data) {
            const data = propertyData.data;
            propertyForm.reset({
                title: data.title || "",
                description: data.description || "",
                lotSize: data.lotSize || "",
                yearBuilt: data.yearBuilt || "",
                realEstateType: data.realEstateType || "",
                marketPrice: data.marketPrice || "",
                street: data.street || "",
                city: data.city || "",
                state: data.state || "",
                zip: data.zip || "",
                country: data.country || "",
                publishToPortals: data.publishToPortals || false,
                gvamx: data.gvamx_enabled || false,
                zonaprop: data.zonaprop_enabled || false,
                argenprop: data.argenprop_enabled || false,
                images: data.images ? data.images.map(img => ({ url: img.imageUrl, fileId: img.fileId })) : [],
                units: data.units && data.units.length > 0 ? data.units.map(unit => ({
                    id: unit.id, // For update
                    unitNumber: unit.unitNumber || "",
                    floor: unit.floor || "",
                    unitSize: unit.unitSize || "",
                    numOfFloors: unit.numOfFloors || "",
                    numOfRooms: unit.numOfRooms || "",
                    numOfBedrooms: unit.numOfBedrooms || "",
                    numOfBathrooms: unit.numOfBathrooms || "",
                    garages: unit.garages || "",
                    status: unit.status || "ACTIVE",
                    rentalPrice: unit.rentalPrice || "",
                    images: unit.images ? unit.images.map(img => ({ url: img.imageUrl, fileId: img.fileId })) : []
                })) : [
                    {
                        unitNumber: "",
                        floor: "",
                        unitSize: "",
                        numOfFloors: "",
                        numOfRooms: "",
                        numOfBedrooms: "",
                        numOfBathrooms: "",
                        garages: "",
                        status: "ACTIVE",
                        rentalPrice: "",
                        images: []
                    }
                ]
            });
            if (data.units && data.units.length > 1) {
                setUnitMultiplicity("multiple");
            }
        }
    }, [isEditMode, propertyData, propertyForm]);

    const [tabStates, setTabStates] = useState([
        {
            title: "Información de la Propiedad",
            //description: "Provide basic information about the property",
            //icon: <Building2 className="w-6 h-6" />,
            status: "incomplete"
        },
        {
            title: "Información de las Unidades",
            //description: "Enter details about the units in the property",
            //icon: <BuildingIcon className="w-6 h-6" />,
            status: "incomplete"
        },
        {
            title: "Confirmación",
            //description: "Review and confirm details",
            //icon: <CheckCircle2 className="w-6 h-6" />,
            status: "incomplete"
        }
    ])

// useEffect removido para evitar que isValid bloquee el avance del primer tab


    const onSubmit = (data) => {
        const mappedUnits = data.units.map(unit => {
            // Keep images in units since backend handles them now
            return unit;
        })

        if (unitMultiplicity === "single"){
            mappedUnits.length = 1;
        }

        const body = {
            ...data,
            images: data.images,
            units: mappedUnits
        }
        delete body.publishToPortals;

        if (isEditMode) {
            updateProperty({ id, ...body }).then((res) => {
                if (res.error) {
                    console.log(res.error)
                    return;
                }
                navigate("/properties")
            })
        } else {
            createProperty(body).then((res) => {
                if (res.error){
                    console.log(res.error)
                    return;
                }
                navigate("/properties")
            })
        }
    }

    

    const StepTab = ({title, status, index}) => {
        const isDisabled = index !== 1 && tabStates[index - 2].status !== "complete"

        return (
            <div
                data-disabled={isDisabled}
                data-selected={tab === index}
                className="p-4 border-b-2 border-border select-none flex flex-col lg:flex-row gap-4 items-center justify-center lg:justify-start w-full hover:border-primary cursor-pointer data-[selected='true']:border-primary data-[disabled='true']:opacity-50 data-[disabled='true']:cursor-not-allowed data-[disabled='true']:hover:border-secondary"
                onClick={() => !isDisabled && setTab(index)}
            >
                <div
                    data-complete={status==="complete"}
                    data-selected={tab === index}
                    data-previous={tab > index}
                    className="p-2 md:p-4 flex w-8 h-8 md:w-14 md:h-14 items-center justify-center text-md md:text-xl border border-border text-gray-400 rounded-lg data-[previous='true']:bg-secondary data-[selected='true']:bg-primary data-[selected='true']:text-white">
                    {index}
                </div>

                <div
                    data-selected={tab === index}
                    className="text-foreground font-500 text-xs md:text-sm text-center data-[selected='true']:text-primary">
                    {title}
                </div>
            </div>
        )
    }


    return (
        <div className="flex flex-col gap-2 relative mb-16">
            <h1>
                {isEditMode ? "Editar Propiedad" : "Crear Propiedad"}
            </h1>

            <div className="flex flex-row justify-between overflow-auto mb-4">
                {tabStates.map((tab, index) => {
                    return (
                        <StepTab title={tab.title} status={tab.status} index={index + 1} key={index}/>
                    )
                })}
            </div>



<div
                data-selected={tab === 1}
                className=" data-[selected='false']:hidden">
                <Form {...propertyForm}>
                    <form onSubmit={propertyForm.handleSubmit(onSubmit)} className="flex flex-col flex-wrap gap-4">

                        <Card>
                            <CardHeader className="border-b-2 text-lg font-500 border-border p-4 flex flex-row items-center gap-2">
                                <ListIcon/>
                                Tipo de Unidad
                            </CardHeader>
                            <CardContent className="p-6 flex flex-col sm:flex-row gap-4">

                                {unitMultiplicityOptions.map((option, index) => {
                                    return (
                                        <div
                                            key={index}
                                            data-active={option.value === unitMultiplicity}
                                            className="rounded-lg flex-shrink relative border-border border-2 shadow-md p-4 flex bg-secondary/20 items-center justify-center cursor-pointer data-[active=true]:bg-gradient-to-br from-primary-accent to-background-light data-[active=true]:text-primary data-[active=true]:border-primary"
                                            onClick={() => setUnitMultiplicity(option.value)}
                                        >
                                            <div className="text-xl font-600 flex flex-col gap-3">
                                                <div className="p-2 bg-background-light border border-border rounded-lg w-fit shadow-sm">
                                                    {option.icon}
                                                </div>

                                                {option.title}
                                                <p
                                                    data-active={option.value === unitMultiplicity}
                                                    className="text-xs md:text-sm lg:text-md font-400 data-[active='true']:text-indigo-500"
                                                >
                                                    {option.description}
                                                </p>

                                                <div className="absolute -top-3 border-2 border-white -right-3 p-1 bg-indigo-500 rounded-full"
                                                     hidden={unitMultiplicity !== option.value}>
                                                    <Check className="text-white w-4 h-4"/>
                                                </div>
                                            </div>
                                        </div>
                                    )
                                })}


                            </CardContent>
                        </Card>


                        <Card>
                            <CardHeader className="border-b-2 text-lg font-500 border-border p-4 flex flex-row items-center gap-2">
                                <Info/>
                                Información de la Propiedad
                            </CardHeader>
                            <CardContent>

                                <FormGroup useFlex>
                                    <FormField
                                        control={propertyForm.control}
                                        name="title"
                                        render={({field}) => (
                                            <FormItem  >
                                                <FormLabel>Título *</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="Mansión con vista al lago" {...field} />
                                                </FormControl>
                                                <FormMessage/>
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={propertyForm.control}
                                        name="realEstateType"
                                        render={({field}) => (
                                            <FormItem>
                                                <FormLabel>Tipo de Propiedad *</FormLabel>
                                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                    <FormControl>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Seleccionar..." />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        {
                                                            Object.keys(RealEstateType).map((type, index) => {
                                                                return (
                                                                    <SelectItem key={index} value={type}>{RealEstateType[type]}</SelectItem>
                                                                )
                                                            })
                                                        }
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage/>
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={propertyForm.control}
                                        name="description"
                                        render={({field}) => (
                                            <FormItem>
                                                <FormLabel>Descripción *</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="Una hermosa mansión junto a un lago." {...field} />
                                                </FormControl>
                                                <FormMessage/>
                                            </FormItem>
                                        )}
                                    />
                                </FormGroup>


                                <FormGroup useFlex>
                                    <FormField
                                        control={propertyForm.control}
                                        name="lotSize"
                                        render={({field}) => (
                                            <FormItem >
                                                <FormLabel>Tamaño del Terreno (en m<sup>2</sup>)</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="200" type="number" {...field} />
                                                </FormControl>
                                                <FormMessage/>
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={propertyForm.control}
                                        name="marketPrice"
                                        render={({field}) => (
                                            <FormItem >
                                                <FormLabel>Precio de Mercado</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="200000" type="currency" {...field} />
                                                </FormControl>
                                                <FormMessage/>
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={propertyForm.control}
                                        name="yearBuilt"
                                        render={({field}) => (
                                            <FormItem >
                                                <FormLabel>Año de Construcción</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="2004" type="number" {...field} />
                                                </FormControl>
                                                <FormMessage/>
                                            </FormItem>
                                        )}
                                    />

                                </FormGroup>


                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="border-b-2 text-lg font-500 border-border p-4 flex flex-row items-center gap-2">
                                <MapPin/>
                                Ubicación
                            </CardHeader>
                            <CardContent>
                                <FormGroup useFlex>
                                    <FormField
                                        control={propertyForm.control}
                                        name="street"
                                        render={({field}) => (
                                            <FormItem >
                                                <FormLabel>Dirección</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="Calle Washington" {...field} />
                                                </FormControl>
                                                <FormMessage/>
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={propertyForm.control}
                                        name="zip"
                                        render={({field}) => (
                                            <FormItem >
                                                <FormLabel>Código Postal</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="49203" {...field} />
                                                </FormControl>
                                                <FormMessage/>
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={propertyForm.control}
                                        name="city"
                                        render={({field}) => (
                                            <FormItem >
                                                <FormLabel>Ciudad</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="Seattle" {...field} />
                                                </FormControl>
                                                <FormMessage/>
                                            </FormItem>
                                        )}
                                    />
</FormGroup>

                                <FormGroup useFlex>
                                    <FormField
                                        control={propertyForm.control}
                                        name="state"
                                        render={({field}) => (
                                            <FormItem >
                                                <FormLabel>Provincia/Estado</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="Washington" {...field} />
                                                </FormControl>
                                                <FormMessage/>
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={propertyForm.control}
                                        name="country"
                                        render={({field}) => (
                                            <FormItem >
                                                <FormLabel>País</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="USA" {...field} />
                                                </FormControl>
                                                <FormMessage/>
                                            </FormItem>
                                        )}
                                    />


                                </FormGroup>




                            </CardContent>
                        </Card>


                        <Card>
                            <CardHeader className="border-b-2 text-lg font-500 border-border p-4 flex flex-row items-center gap-2">
                                <SquareStack/>
                                Portales de Publicación Externos
                            </CardHeader>
                            <CardContent className="p-4">
                                <FormGroup useFlex>
                                    <FormField
                                        control={propertyForm.control}
                                        name="publishToPortals"
                                        render={({field}) => (
                                            <FormItem className="flex flex-row items-center space-x-2 space-y-0 mt-4">
                                                <FormControl>
                                                    <input 
                                                        type="checkbox" 
                                                        className="w-5 h-5 cursor-pointer accent-primary"
                                                        checked={field.value} 
                                                        onChange={(e) => {
                                                            field.onChange(e.target.checked);
                                                            propertyForm.setValue('gvamx', e.target.checked);
                                                            propertyForm.setValue('zonaprop', e.target.checked);
                                                            propertyForm.setValue('argenprop', e.target.checked);
                                                        }} 
                                                    />
                                                </FormControl>
                                                <div className="space-y-1 leading-none">
                                                    <FormLabel className="font-normal cursor-pointer text-md">
                                                        Subir propiedad a portales (GVAMX, ZONAPROP, ARGENPROP)
                                                    </FormLabel>
                                                    <p className="text-sm text-muted-foreground">
                                                        Si está activado, la propiedad se publicará en estos portales además de guardarse en el sistema.
                                                    </p>
                                                </div>
                                            </FormItem>
                                        )}
                                    />
                                </FormGroup>
                            </CardContent>
                        </Card>


                        <Card >
                            <CardHeader className="border-b-2 text-lg font-500 border-border p-4 flex flex-row items-center gap-2">
                                <Image/>
                                Imágenes de la Propiedad
                            </CardHeader>
                            <CardContent className="flex flex-col gap-4">
                                <FormItem >
                                    <FormLabel>URL de la Imagen</FormLabel>
                                    <div className="flex flex-row items-end gap-x-2 w-full">
                                        <div className="flex flex-col gap-2 w-full">
                                            <ImageUploader 
                                                multiple={true}
                                                buttonText="Subir Imágenes"
                                                onUploadSuccess={(payload) => {
                                                    propertyForm.setValue("images", [...propertyForm.getValues("images"), payload])
                                                }}
                                            />
                                        </div>
                                    </div>
                                </FormItem>



                                <Carousel className="w-full max-w-xs" hidden={!propertyForm.getValues("images").length}>
                                    <div className="flex flex-row justify-between">
                                        <CarouselPrevious className="relative translate-x-0 translate-y-0 top-0 left-0" />
                                        <CarouselNext className="relative translate-x-0 translate-y-0 top-0 left-0" />
                                    </div>
                                    <CarouselContent>
                                        {propertyForm.getValues("images").map((image, index) => (
                                            <CarouselItem key={index}>
                                                <div className="p-1">
                                                    <img src={image.url || image} alt={`Imagen de la Propiedad ${index}`} className="w-full h-64 object-cover rounded-lg"/>
                                                </div>

                                                <Button className="w-full" type="button" variant="outline" onClick={async () => {
                                                    const imgToRemove = propertyForm.getValues("images")[index];
                                                    if (imgToRemove?.fileId) {
                                                        try {
                                                            const token = localStorage.getItem("token") || sessionStorage.getItem("token");
                                                            await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:10000"}/api/upload/${imgToRemove.fileId}`, {
                                                                method: "DELETE",
                                                                headers: token ? { "Authorization": `Bearer ${token}` } : {}
                                                            });
                                                        } catch (err) {
                                                            console.error("Error eliminando imagen de ImageKit:", err);
                                                        }
                                                    }
                                                    propertyForm.setValue("images", propertyForm.getValues("images").filter((_, i) => i !== index))
                                                    propertyForm.trigger("images")
                                                }}
                                                >
                                                    <XIcon className="w-4 h-4 mr-2"/>
                                                    Eliminar
                                                </Button>
                                            </CarouselItem>
                                        ))}
                                    </CarouselContent>
                                </Carousel>
                            </CardContent>
                        </Card>
                    </form>
                </Form>

            </div>


            <div
                data-selected={tab === 2}
                className=" data-[selected='false']:hidden">


                <Form {...propertyForm}>
                    <form onSubmit={propertyForm.handleSubmit(onSubmit)} className="flex flex-col flex-wrap gap-4 overflow-auto">

                        {
                            unitMultiplicity === "single" ? (
                                <div className="flex flex-col gap-4">
                                    <Card>
                                        <CardHeader className="border-b-2 text-lg font-500 border-border p-4 flex flex-row items-center gap-2">
                                            <Info/>
                                            Información de la Unidad
                                        </CardHeader>
                                        <CardContent>
                                            <FormGroup useFlex>
                                                <FormField
                                                    control={propertyForm.control}
                                                    name="units[0].unitNumber"
                                                    render={({field}) => (
                                                        <FormItem >
                                                            <FormLabel>Número de Unidad</FormLabel>
                                                            <FormControl>
                                                                <Input placeholder="" {...field} />
                                                            </FormControl>
                                                            <FormMessage/>
                                                        </FormItem>
                                                    )}
                                                />

                                                <FormField
                                                    control={propertyForm.control}
                                                    name="units[0].floor"
                                                    render={({field}) => (
                                                        <FormItem >
                                                            <FormLabel>Piso</FormLabel>
                                                            <FormControl>
                                                                <Input placeholder="0" type="number" {...field} />
                                                            </FormControl>
                                                            <FormMessage/>
                                                        </FormItem>
                                                    )}
                                                />


                                                <FormField
                                                    control={propertyForm.control}
                                                    name="units[0].unitSize"
                                                    render={({field}) => (
                                                        <FormItem >
                                                            <FormLabel>Tamaño de la Unidad </FormLabel>
                                                            <FormControl>
                                                                <Input placeholder="100" type="number" {...field} />
                                                            </FormControl>
                                                            <FormMessage/>
                                                        </FormItem>
                                                    )}
                                                />

</FormGroup>

                                <FormGroup useFlex>
                                    <FormField
                                        control={propertyForm.control}
                                        name="units[0].rentalPrice"
                                        render={({field}) => (
                                            <FormItem >
                                                <FormLabel>Precio de Alquiler</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="2500" type="currency" {...field} />
                                                </FormControl>
                                                <FormMessage/>
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={propertyForm.control}
                                        name="units[0].status"
                                        render={({field}) => (
                                            <FormItem >
                                                <FormLabel>Estado</FormLabel>
                                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                    <FormControl>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Seleccionar..." />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        {
                                                            Object.keys(ListingStatus).map((type, index) => {
                                                                return (
                                                                    <SelectItem key={index} value={type}>{ListingStatus[type]}</SelectItem>
                                                                )
                                                            })
                                                        }
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage/>
                                            </FormItem>
                                        )}
                                    />
                                </FormGroup>

                            </CardContent>

                        </Card>

                        <Card>
                            <CardHeader className="border-b-2 text-lg font-500 border-border p-4 flex flex-row items-center gap-2">
                                <DoorClosed/>
                                Habitaciones y Garajes
                            </CardHeader>
                            <CardContent>
                                <FormGroup useFlex>
                                    <FormField
                                        control={propertyForm.control}
                                        name="units[0].numOfFloors"
                                        render={({field}) => (
                                            <FormItem >
                                                <FormLabel>Número de Pisos</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="1" type="number" {...field} />
                                                </FormControl>
                                                <FormMessage/>
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={propertyForm.control}
                                        name="units[0].numOfRooms"
                                        render={({field}) => (
                                            <FormItem >
                                                <FormLabel>Número de Ambientes</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="6" type="number" {...field} />
                                                </FormControl>
                                                <FormMessage/>
                                            </FormItem>
                                        )}
                                    />


                                </FormGroup>

                                <FormGroup useFlex>
                                    <FormField
                                        control={propertyForm.control}
                                        name="units[0].numOfBedrooms"
                                        render={({field}) => (
                                            <FormItem >
                                                <FormLabel>Número de Dormitorios</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="2" type="number" {...field} />
                                                </FormControl>
                                                <FormMessage/>
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={propertyForm.control}
                                        name="units[0].numOfBathrooms"
                                        render={({field}) => (
                                            <FormItem >
                                                <FormLabel>Número de Baños</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="2" type="number" {...field} />
                                                </FormControl>
                                                <FormMessage/>
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={propertyForm.control}
                                        name="units[0].garages"
                                        render={({field}) => (
                                            <FormItem >
                                                <FormLabel>Número de Garajes</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="2" type="number" {...field} />
                                                </FormControl>
                                                <FormMessage/>
                                            </FormItem>
                                        )}
                                    />
                                </FormGroup>

                            </CardContent>

                        </Card>

                        <Card >
                            <CardHeader className="border-b-2 text-lg font-500 border-border p-4 flex flex-row items-center gap-2">
                                <Image/>
                                Imágenes de la Unidad
                            </CardHeader>
                            <CardContent className="flex flex-col gap-4">
                                <FormItem >
                                    <FormLabel>URL de la Imagen</FormLabel>
                                    <div className="flex flex-row items-end gap-x-2 w-full">
                                        <div className="flex flex-col gap-2 w-full">
                                            <ImageUploader 
                                                multiple={true}
                                                buttonText="Subir Imágenes"
                                                onUploadSuccess={(payload) => {
                                                    propertyForm.setValue("units[0].images", [...propertyForm.getValues("units[0].images"), payload])
                                                }}
                                            />
                                        </div>
                                    </div>
                                </FormItem>



                                <Carousel className="w-full max-w-xs" hidden={!propertyForm.getValues("units[0].images")?.length}>
    <div className="flex flex-row justify-between">
        <CarouselPrevious className="relative translate-x-0 translate-y-0 top-0 left-0" />
        <CarouselNext className="relative translate-x-0 translate-y-0 top-0 left-0" />
    </div>
    <CarouselContent>
        {propertyForm.getValues("units[0].images").map((image, index) => (
            <CarouselItem key={index}>
                <div className="p-1">
                    <img src={image.url || image} alt={`Imagen de la Propiedad ${index}`} className="w-full h-64 object-cover rounded-lg"/>
                </div>

                <div className="flex gap-2">
                    <Button className="w-full" type="button" variant="outline" onClick={async () => {
                        const imgToRemove = propertyForm.getValues("units[0].images")[index];
                        if (imgToRemove?.fileId) {
                            try {
                                const token = localStorage.getItem("token") || sessionStorage.getItem("token");
                                await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:10000"}/api/upload/${imgToRemove.fileId}`, {
                                    method: "DELETE",
                                    headers: token ? { "Authorization": `Bearer ${token}` } : {}
                                });
                            } catch (err) {
                                console.error("Error eliminando imagen de ImageKit:", err);
                            }
                        }
                        propertyForm.setValue("units[0].images", propertyForm.getValues("units[0].images").filter((_, i) => i !== index))
                        propertyForm.trigger("units[0].images")
                    }}>
                        <XIcon className="w-4 h-4 mr-2"/>
                        Eliminar
                    </Button>
                    
                   
                </div>
            </CarouselItem>
        ))}
    </CarouselContent>
</Carousel>


                            </CardContent>
                        </Card>

                                </div>

                            ) : (
                                <UnitCreationTable units={propertyForm.getValues("units")} onChange={(units) => {
                                    propertyForm.setValue("units", units);
                                    propertyForm.trigger("units")
                                }}/>



                                )
                        }

                    </form>
                </Form>
            </div>

        <div
                data-selected={tab === 3}
                className=" data-[selected='false']:hidden">

                <Card>
                    <CardHeader className="border-b-2 text-lg font-500 border-border p-4 flex flex-row items-center gap-2">
                        <BadgeCheck/>
                        Confirmación
                    </CardHeader>
                    <CardContent className="p-6 flex flex-col gap-4">
                        Estás a punto de crear una propiedad con los siguientes detalles. Por favor, revisa y confirma.

                        <div className="grid grid-cols-2">
                            <div className="">
                                <p className="font-500 text-muted-foreground">
                                    Título
                                </p>
                                <p className="font-500 text-foreground text-lg">
                                    {propertyForm.getValues("title")}
                                </p>
                            </div>

                            <div className="">
                                <p className="font-500 text-muted-foreground">
                                    Tipo
                                </p>
                                <p className="flex flex-row items-center font-500 text-foreground text-lg">
                                    {getRealEstateIcon(propertyForm.getValues("realEstateType"))} {RealEstateType[propertyForm.getValues("realEstateType")]}
                                </p>
                            </div>
                        </div>


                        <div className="grid grid-cols-2">
                            <div className="">
                                <p className="font-500 text-muted-foreground">
                                    Descripción
                                </p>
                                <p className="font-500 text-foreground text-lg">
                                    {propertyForm.getValues("description")}
                                </p>
                            </div>


                            <div className="">
                                <p className="font-500 text-gray-400">
                                    Número de Unidades
                                </p>
                                <p className="font-500 text-foreground text-lg">
                                    {unitMultiplicity === "single" ? 1 : propertyForm.getValues("units").length}
                                </p>
                            </div>
                        </div>



                    </CardContent>
                </Card>


            </div>


            <div className="fixed bottom-0 left-0 z-20 w-full flex flex-row bg-background-light px-6 h-16 items-center border-y-2 border-border justify-between">
                <Button
                    variant="outline"
                    disabled={tab === 1}
                    onClick={() => {
                        if (tab > 1){
                            setTab(tab - 1)
                        }
                    }}
                    type="button"

                >
                    <ArrowLeft className="w-4 h-4 mr-1"/>
                    Atrás
                </Button>
                <Button
                    type={tab === 3 ? "submit" : "button"}
                    variant="outline"
                    isLoading={isCreating}
                    onClick={async () => {
                    if (tab === 1) {
                        const isStep1Valid = await propertyForm.trigger([
                            "title", "realEstateType", "description", "lotSize", "marketPrice", 
                            "yearBuilt", "street", "zip", "city", "state", "country", "images"
                        ]);
                        if (isStep1Valid) {
                            setTabStates(tabStates.map((t, idx) => idx === 0 ? {...t, status: "complete"} : t));
                            setTab(2);
                        }
                    } else if (tab === 2) {
                        const isStep2Valid = await propertyForm.trigger(["units"]);
                        if (isStep2Valid) {
                            setTabStates(tabStates.map((t, idx) => idx === 1 ? {...t, status: "complete"} : t));
                            setTab(3);
                        }
                    } else if (tab === 3) {
                        propertyForm.handleSubmit(onSubmit)();
                    }
                }}
                >
                    {tab === 3 ? "Crear" : "Siguiente"}
                    {tab === 3 ? <Plus className="w-4 h-4 ml-1"/> : <ArrowRight className="w-4 h-4 ml-1"/>}
                </Button>

            </div>

        </div>
    )
}

export default PropertyCreation