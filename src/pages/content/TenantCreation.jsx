import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { useCreateTenantMutation } from "../../services/api/tenantApi";
import { useGetPropertiesQuery } from "../../services/api/propertyApi";
import DatePicker, { registerLocale } from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import es from "date-fns/locale/es";

registerLocale("es", es);

const TenantCreationForm = () => {
  const navigate = useNavigate();
  const [createTenant, { isLoading: isCreating }] = useCreateTenantMutation();
  const { data: propertiesData, isLoading: isLoadingProperties } = useGetPropertiesQuery();
  const [notification, setNotification] = useState(null);
  const [availableUnits, setAvailableUnits] = useState([]);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [selectedUnitId, setSelectedUnitId] = useState(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    trigger
  } = useForm({
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      unitId: "",
      lease: {
        unitId: "",
        startDate: "",
        endDate: "",
        rentalPrice: 0,
        paymentFrequency: "MONTHLY",
        status: "ACTIVE"
      }
    }
  });

  // Extraer y formatear unidades disponibles
  useEffect(() => {
    if (propertiesData?.data) {
      const formattedUnits = propertiesData.data.flatMap(property =>
        property.units.map(unit => ({
          id: unit.id,
          identifier: unit.unitIdentifier,
          displayText: `${unit.unitIdentifier} - ${property.title}`,
          rentalPrice: unit.rentalPrice
        }))
      );
      setAvailableUnits(formattedUnits);
    }
  }, [propertiesData]);

  const showNotification = (message, type) => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 5000);
  };

  const handleStartDateChange = (date) => {
    setStartDate(date);
    setValue("lease.startDate", date.toISOString());
    trigger("lease.startDate");
  };

  const handleEndDateChange = (date) => {
    setEndDate(date);
    setValue("lease.endDate", date.toISOString());
    trigger("lease.endDate");
  };

  const handleUnitChange = (e) => {
    const selectedUnitId = parseInt(e.target.value);
    const unit = availableUnits.find(u => u.id === selectedUnitId);

    if (unit) {
      setSelectedUnitId(unit.id);
      setValue("unitId", unit.id);
      setValue("lease.unitId", unit.id);
      setValue("lease.rentalPrice", unit.rentalPrice || 0);
    }
  };

  const onSubmit = async (data) => {
    try {
      // Validaciones
      if (!selectedUnitId) {
        throw new Error("Debe seleccionar una unidad válida");
      }

      if (!startDate || !endDate) {
        throw new Error("Debe seleccionar ambas fechas");
      }

      if (startDate >= endDate) {
        throw new Error("La fecha de inicio debe ser anterior a la fecha de finalización");
      }

      const requestBody = {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone,
        unitId: selectedUnitId,
        lease: {
          unitId: selectedUnitId,
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
          rentalPrice: Number(data.lease.rentalPrice),
          paymentFrequency: data.lease.paymentFrequency,
          status: data.lease.status
        }
      };

      console.log("Enviando body:", requestBody); // Para depuración

      const response = await createTenant({ bodyData: requestBody }).unwrap();

      showNotification("Inquilino creado exitosamente!", "success");
      setTimeout(() => navigate(`/tenants`), 1500);

    } catch (error) {
      console.error("Error creating tenant:", error);
      // Detecta error de email duplicado de Prisma
      if (
        error?.data?.error?.code === "P2002" ||
        (typeof error?.message === "string" && error.message.includes("Unique constraint failed") && error.message.includes("email"))
      ) {
        showNotification("El email ingresado ya existe. Por favor, utilice otro email.", "error");
      } else {
        showNotification(error.message || "Error al crear el inquilino", "error");
      }
    }
  };

  // Componente personalizado para el DatePicker mejorado
  const CustomDateInput = React.forwardRef(({ value, onClick, hasError }, ref) => (
    <button
      type="button"
      ref={ref}
      onClick={onClick}
      className={`w-full px-3 py-2 border rounded-md text-left ${
        hasError ? "border-red-500 bg-red-50" : "border-gray-300"
      } hover:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:border-blue-500`}
    >
      {value || "Seleccione una fecha"}
      <span className="float-right text-gray-400">▼</span>
    </button>
  ));

  // Header personalizado para el DatePicker
  const renderCustomHeader = ({
    date,
    changeYear,
    changeMonth,
    decreaseMonth,
    increaseMonth,
    prevMonthButtonDisabled,
    nextMonthButtonDisabled,
  }) => (
    <div className="flex justify-between items-center px-2 py-2 bg-gray-50 rounded-t-lg">
      <button
        onClick={decreaseMonth}
        disabled={prevMonthButtonDisabled}
        className="p-1 rounded hover:bg-gray-200 disabled:opacity-30"
      >
        {"<"}
      </button>
      
      <div className="flex space-x-2">
        <select
          value={date.getFullYear()}
          onChange={({ target: { value } }) => changeYear(value)}
          className="px-2 py-1 rounded border border-gray-300 bg-white text-sm"
        >
          {Array.from({ length: 20 }, (_, i) => new Date().getFullYear() - 10 + i).map(year => (
            <option key={year} value={year}>
              {year}
            </option>
          ))}
        </select>
        
        <select
          value={date.getMonth()}
          onChange={({ target: { value } }) => changeMonth(value)}
          className="px-2 py-1 rounded border border-gray-300 bg-white text-sm"
        >
          {Array.from({ length: 12 }, (_, i) => (
            <option key={i} value={i}>
              {new Date(0, i).toLocaleString('es-ES', { month: 'long' })}
            </option>
          ))}
        </select>
      </div>
      
      <button
        onClick={increaseMonth}
        disabled={nextMonthButtonDisabled}
        className="p-1 rounded hover:bg-gray-200 disabled:opacity-30"
      >
        {">"}
      </button>
    </div>
  );

  return (
    <div className="container mx-auto p-4 max-w-2xl">
      {/* Notificación */}
      {notification && (
        <div className={`fixed top-4 right-4 ${
          notification.type === 'success' ? 'bg-green-500' : 'bg-red-500'
        } text-white px-6 py-4 rounded-md shadow-lg no-print`}>
          {notification.message}
        </div>
      )}

      <h1 className="text-2xl font-bold mb-6">Crear Nuevo Inquilino</h1>

      {isLoadingProperties ? (
        <div className="text-center py-8">Cargando propiedades disponibles...</div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Información Personal */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Información Personal</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre *
                </label>
                <input
                  {...register("firstName", { required: "Este campo es obligatorio" })}
                  className={`w-full px-3 py-2 border rounded-md ${
                    errors.firstName ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="Juan"
                />
                {errors.firstName && (
                  <p className="mt-1 text-sm text-red-600">{errors.firstName.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Apellido *
                </label>
                <input
                  {...register("lastName", { required: "Este campo es obligatorio" })}
                  className={`w-full px-3 py-2 border rounded-md ${
                    errors.lastName ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="Pérez"
                />
                {errors.lastName && (
                  <p className="mt-1 text-sm text-red-600">{errors.lastName.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  {...register("email")}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="nuevo.email@email.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Teléfono
                </label>
                <input
                  {...register("phone")}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="123456789"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Unidad *
                </label>
                <select
                  {...register("unitId", {
                    required: "Debe seleccionar una unidad",
                    valueAsNumber: true
                  })}
                  onChange={handleUnitChange}
                  className={`w-full px-3 py-2 border rounded-md ${
                    errors.unitId ? "border-red-500" : "border-gray-300"
                  }`}
                >
                  <option value="">Seleccione una unidad</option>
                  {availableUnits.map(unit => (
                    <option key={unit.id} value={unit.id}>
                      {unit.displayText}
                    </option>
                  ))}
                </select>
                {errors.unitId && (
                  <p className="mt-1 text-sm text-red-600">{errors.unitId.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* Información del Contrato */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Información del Contrato</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fecha de Inicio *
                </label>
                <DatePicker
                  selected={startDate}
                  onChange={handleStartDateChange}
                  customInput={<CustomDateInput hasError={!!errors.lease?.startDate} />}
                  dateFormat="dd/MM/yyyy"
                  placeholderText="Seleccione fecha"
                  minDate={new Date()}
                  showYearDropdown
                  showMonthDropdown
                  dropdownMode="select"
                  yearDropdownItemNumber={15}
                  scrollableYearDropdown
                  renderCustomHeader={renderCustomHeader}
                  className="w-full"
                  locale="es"
                />
                {errors.lease?.startDate && (
                  <p className="mt-1 text-sm text-red-600">{errors.lease.startDate.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fecha de Finalización *
                </label>
                <DatePicker
                  selected={endDate}
                  onChange={handleEndDateChange}
                  customInput={<CustomDateInput hasError={!!errors.lease?.endDate} />}
                  dateFormat="dd/MM/yyyy"
                  placeholderText="Seleccione fecha"
                  minDate={startDate || new Date()}
                  showYearDropdown
                  showMonthDropdown
                  dropdownMode="select"
                  yearDropdownItemNumber={15}
                  scrollableYearDropdown
                  renderCustomHeader={renderCustomHeader}
                  className="w-full"
                  locale="es"
                />
                {errors.lease?.endDate && (
                  <p className="mt-1 text-sm text-red-600">{errors.lease.endDate.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Precio de Renta *
                </label>
                <input
                  type="number"
                  {...register("lease.rentalPrice", {
                    required: "Este campo es obligatorio",
                    valueAsNumber: true
                  })}
                  className={`w-full px-3 py-2 border rounded-md ${
                    errors.lease?.rentalPrice ? "border-red-500" : "border-gray-300"
                  }`}
                />
                {errors.lease?.rentalPrice && (
                  <p className="mt-1 text-sm text-red-600">{errors.lease.rentalPrice.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Frecuencia de Pago *
                </label>
                <select
                  {...register("lease.paymentFrequency", { required: true })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="MONTHLY">Mensual</option>
                  <option value="WEEKLY">Semanal</option>
                  <option value="QUARTERLY">Trimestral</option>
                  <option value="YEARLY">Anual</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Estado *
                </label>
                <select
                  {...register("lease.status", { required: true })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="ACTIVE">Activo</option>
                  <option value="EXPIRED">Expirado</option>
                  <option value="TERMINATED">Terminado</option>
                </select>
              </div>
            </div>
          </div>

          {/* Botones de Acción */}
          <div className="flex justify-end space-x-4 mt-6 no-print">
            <button
              type="button"
              onClick={() => navigate("/tenants")}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={isCreating || isLoadingProperties}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-300"
            >
              {isCreating ? "Creando..." : "Crear Inquilino"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default TenantCreationForm;