import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { MapPin, Bath, BedDouble, Maximize, Check, ChevronLeft } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PropertyMap } from "./property-map";
import { Header } from "./header";
import { Footer } from "./footer";

export default function PropertyDetailPublic() {
  const { id } = useParams();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);


  useEffect(() => {
    const fetchProperty = async () => {
      try {
        const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:10000";
        const res = await fetch(`${apiUrl}/api/public/properties/${id}`);
        const json = await res.json();
        
        if (json.data) {
          const p = json.data;
          const hasRentalUnit = p.units?.some((u) => u.rentalPrice && u.rentalPrice > 0);
          const type = hasRentalUnit ? "Alquiler" : "Venta";
          
          let price = "Consultar";
          if (type === "Venta" && p.marketPrice) {
            price = `${p.currency || 'USD'} ${p.marketPrice.toLocaleString()}`;
          } else if (type === "Alquiler") {
            const rentalUnit = p.units?.find((u) => u.rentalPrice && u.rentalPrice > 0);
            if (rentalUnit) {
               price = `${rentalUnit.currency || 'USD'} ${rentalUnit.rentalPrice.toLocaleString()} / mes`;
            }
          }

          const beds = p.units?.reduce((acc, u) => acc + (u.numOfBedrooms || 0), 0) || 0;
          const baths = p.units?.reduce((acc, u) => acc + (u.numOfBathrooms || 0), 0) || 0;
          const sqft = p.units?.reduce((acc, u) => acc + (u.unitSize || 0), 0) || p.lotSize || 0;

          const typeMap = {
            SINGLE_FAMILY_HOME: "Casa",
            MULTI_FAMILY_HOME: "Casa Multifamiliar",
            CONDO: "Condominio",
            APARTMENT: "Departamento",
            TOWNHOUSE: "Townhouse",
            LUXURY: "Lujo",
            OFFICE: "Oficina",
            RETAIL: "Local Comercial",
            INDUSTRIAL: "Industrial",
            LAND: "Terreno",
            FARM: "Granja"
          };
          const propertyType = typeMap[p.realEstateType] || "Propiedad";

          setProperty({
            id: p.id,
            type,
            propertyType,
            title: p.title || "Propiedad sin título",
            price,
            address: [p.street, p.city].filter(Boolean).join(", ") || "Ubicación a consultar",
            description: p.description || "",
            beds,
            baths,
            sqft,
            images: p.images?.map((img) => img.imageUrl) || [],
            amenities: p.amenities?.map((a) => a.amenity.name) || [],
            latitude: p.latitude,
            longitude: p.longitude,
          });
        }
      } catch (e) {
        console.error("Error fetching property", e);
      } finally {
        setLoading(false);
      }
    };
    fetchProperty();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center text-[#C7A15E]">
          Cargando detalles...
        </div>
        <Footer />
      </div>
    );
  }

  if (!property) {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col">
        <Header />
        <div className="flex-1 flex flex-col items-center justify-center text-white gap-4">
          <h2 className="text-2xl">Propiedad no encontrada</h2>
          <Button asChild className="bg-[#C7A15E] hover:bg-[#b8923f] text-black">
            <Link to="/">Volver al catálogo</Link>
          </Button>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="theme-public min-h-screen bg-black text-zinc-300 font-sans pb-24 pt-28">
      <Header />
      {/* HEADER SECTION */}
      <div className="container mx-auto px-6 pt-12 pb-8 max-w-6xl">
        <Link to="/" className="inline-flex items-center text-zinc-400 hover:text-white transition-colors mb-8 text-sm">
          <ChevronLeft size={16} className="mr-1" />
          Volver al catálogo
        </Link>
        
        <div className="flex gap-2 mb-6">
          <Badge className="bg-[#C7A15E] text-black hover:bg-[#b8923f] border-none font-semibold px-3 py-1 text-xs rounded-sm">
            {property.type}
          </Badge>
          <Badge className="bg-zinc-800 text-zinc-300 hover:bg-zinc-700 border-none px-3 py-1 text-xs rounded-sm">
            {property.propertyType}
          </Badge>
        </div>

        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-8">
          <div>
            <h1 className="text-4xl md:text-5xl font-serif text-white mb-4">
              {property.title}
            </h1>
            <div className="flex items-center text-zinc-400">
              <MapPin size={18} className="mr-2 text-[#C7A15E]" />
              <p>{property.address}</p>
            </div>
          </div>
          <div className="text-3xl md:text-4xl text-[#C7A15E] font-medium whitespace-nowrap">
            {property.price}
          </div>
        </div>

        {/* HERO IMAGE */}
        <div className="w-full h-[400px] md:h-[500px] rounded-2xl overflow-hidden mb-12">
          <img 
            src={property.images[0] || "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80"} 
            alt={property.title}
            className="w-full h-full object-cover"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* LEFT CONTENT */}
          <div className="lg:col-span-2 space-y-12">
            
            {/* DESCRIPTION */}
            <section>
              <h2 className="text-2xl font-serif text-[#C7A15E] mb-6">Descripción de la Propiedad</h2>
              <div className="text-zinc-300 leading-relaxed space-y-4 whitespace-pre-wrap">
                {property.description}
              </div>
            </section>

            {/* FEATURES */}
            <section>
              <h2 className="text-2xl font-serif text-[#C7A15E] mb-6">Características Principales</h2>
              <div className="grid grid-cols-3 gap-4 p-8 bg-zinc-900/80 rounded-2xl border border-zinc-800/50">
                <div className="flex flex-col items-center text-center">
                  <BedDouble size={28} className="text-[#C7A15E] mb-3" />
                  <span className="text-2xl text-white font-medium mb-1">{property.beds}</span>
                  <span className="text-sm text-zinc-400">Dormitorios</span>
                </div>
                <div className="flex flex-col items-center text-center border-x border-zinc-800">
                  <Bath size={28} className="text-[#C7A15E] mb-3" />
                  <span className="text-2xl text-white font-medium mb-1">{property.baths}</span>
                  <span className="text-sm text-zinc-400">Baños</span>
                </div>
                <div className="flex flex-col items-center text-center">
                  <Maximize size={28} className="text-[#C7A15E] mb-3" />
                  <span className="text-2xl text-white font-medium mb-1">{property.sqft}</span>
                  <span className="text-sm text-zinc-400">Metros Cuadrados</span>
                </div>
              </div>
            </section>

            {/* AMENITIES */}
            {property.amenities.length > 0 && (
              <section>
                <h2 className="text-2xl font-serif text-[#C7A15E] mb-6">Comodidades y Servicios</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8">
                  {property.amenities.map((amenity, index) => (
                    <div key={index} className="flex items-center text-zinc-300">
                      <Check size={18} className="text-[#C7A15E] mr-3" />
                      <span>{amenity}</span>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* RIGHT SIDEBAR */}
          <div className="space-y-8">
            {/* CONTACT FORM */}
            <div className="bg-zinc-900/80 p-8 rounded-2xl border border-zinc-800/50">
              <h3 className="text-xl font-serif text-white mb-4">¿Estás interesado?</h3>
              <p className="text-sm text-zinc-400 mb-6">
                Dejanos tus datos y un asesor especializado se pondrá en contacto a la brevedad para brindarte más detalles o programar una visita guiada.
              </p>
              
              <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
                <div>
                  <input 
                    type="text" 
                    placeholder="Tu nombre completo" 
                    className="w-full bg-black border border-zinc-800 rounded-lg px-4 py-3 text-white placeholder:text-zinc-600 focus:outline-none focus:border-[#C7A15E] transition-colors"
                  />
                </div>
                <div>
                  <input 
                    type="email" 
                    placeholder="Correo electrónico" 
                    className="w-full bg-black border border-zinc-800 rounded-lg px-4 py-3 text-white placeholder:text-zinc-600 focus:outline-none focus:border-[#C7A15E] transition-colors"
                  />
                </div>
                <div>
                  <input 
                    type="tel" 
                    placeholder="Teléfono" 
                    className="w-full bg-black border border-zinc-800 rounded-lg px-4 py-3 text-white placeholder:text-zinc-600 focus:outline-none focus:border-[#C7A15E] transition-colors"
                  />
                </div>
                <div>
                  <textarea 
                    placeholder="Mensaje o consulta..." 
                    rows={4}
                    className="w-full bg-black border border-zinc-800 rounded-lg px-4 py-3 text-white placeholder:text-zinc-600 focus:outline-none focus:border-[#C7A15E] transition-colors resize-none"
                  ></textarea>
                </div>
                <Button className="w-full bg-[#C7A15E] hover:bg-[#b8923f] text-black font-semibold py-6 text-base rounded-lg mt-2">
                  Solicitar Información
                </Button>
              </form>
            </div>

            {/* MAP */}
            <div className="w-full h-64 rounded-2xl overflow-hidden border border-zinc-800/50 relative bg-zinc-900/50">
              <PropertyMap 
                latitude={property.latitude} 
                longitude={property.longitude} 
                address={property.address} 
              />
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
