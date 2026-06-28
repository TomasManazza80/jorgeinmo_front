import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { Save, Plus, Trash2, GripVertical, Image as ImageIcon, Star } from "lucide-react";
import { Button } from "../../components/ui/button.tsx";
import { toast } from "sonner";
import ImageUploader from "../../components/ui/ImageUploader.jsx";

export default function HeroSettings() {
  const token = useSelector((state) => state.authSlice.accessToken);
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  
  const [formData, setFormData] = useState({
    heroRatingText: "",
    heroRatingStars: 4,
    heroOverlayOpacity: 50,
    heroSlides: []
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:10000";
      const res = await fetch(`${apiUrl}/api/settings/hero`, {
        cache: "no-store",
        headers: {
          "Cache-Control": "no-cache"
        }
      });
      const json = await res.json();
      if (json.success && json.data) {
        setFormData({
          heroRatingText: json.data.heroRatingText || "",
          heroRatingStars: json.data.heroRatingStars || 4,
          heroOverlayOpacity: json.data.heroOverlayOpacity !== undefined ? json.data.heroOverlayOpacity : 50,
          heroSlides: json.data.heroSlides || []
        });
      }
    } catch (e) {
      console.error("Failed to fetch hero settings:", e);
    }
  };

  const handleGlobalChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSlideChange = (index, field, value) => {
    const newSlides = [...formData.heroSlides];
    newSlides[index] = { ...newSlides[index], [field]: value };
    setFormData({ ...formData, heroSlides: newSlides });
  };

  const addSlide = () => {
    setFormData({
      ...formData,
      heroSlides: [
        ...formData.heroSlides,
        {
          id: Date.now().toString(),
          title: "",
          subtitle: "",
          highlight: "",
          imageUrl: ""
        }
      ]
    });
  };

  const removeSlide = (index) => {
    const newSlides = [...formData.heroSlides];
    newSlides.splice(index, 1);
    setFormData({ ...formData, heroSlides: newSlides });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccessMsg("");
    
    try {
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:10000";
      const res = await fetch(`${apiUrl}/api/settings/hero`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });
      
      const json = await res.json();
      if (json.success) {
        setSuccessMsg("¡Configuración guardada exitosamente!");
        toast.success("Configuración guardada exitosamente");
        setTimeout(() => setSuccessMsg(""), 3000);
      } else {
        toast.error("Error al guardar la configuración.");
      }
    } catch (e) {
      console.error("Error saving settings:", e);
      toast.error("Error de conexión al guardar.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto pb-24">
      <div className="mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Gestión de Portada (Carrusel)</h1>
          <p className="text-gray-500 mt-2">Personaliza las imágenes y textos del carrusel de inicio.</p>
        </div>
        <Button 
          onClick={addSlide}
          className="bg-black hover:bg-gray-800 text-white dark:bg-white dark:text-black dark:hover:bg-gray-200"
        >
          <Plus size={18} className="mr-2" />
          Añadir Diapositiva
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        
        {/* Global Settings (Rating) */}
        <div className="bg-white dark:bg-[#1a1a1a] p-6 rounded-xl shadow-sm border border-gray-100 dark:border-zinc-800">
          <h2 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-200">Configuración Global (Badge de Valoración)</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Texto de Valoración (Ej: Altamente Recomendado - 3.9 / 28 Opiniones)
              </label>
              <input
                type="text"
                name="heroRatingText"
                value={formData.heroRatingText}
                onChange={handleGlobalChange}
                className="w-full px-4 py-2 border rounded-md dark:bg-zinc-900 dark:border-zinc-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#C7A15E]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Cantidad de Estrellas Doradas (1 a 5)
              </label>
              <input
                type="number"
                min="1"
                max="5"
                step="0.1"
                name="heroRatingStars"
                value={formData.heroRatingStars}
                onChange={handleGlobalChange}
                className="w-full px-4 py-2 border rounded-md dark:bg-zinc-900 dark:border-zinc-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#C7A15E]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Intensidad del Oscurecido de Fondo: {formData.heroOverlayOpacity}%
              </label>
              <input
                type="range"
                min="0"
                max="100"
                name="heroOverlayOpacity"
                value={formData.heroOverlayOpacity}
                onChange={handleGlobalChange}
                className="w-full accent-[#C7A15E]"
              />
              <p className="text-xs text-gray-500 mt-1">Ajusta qué tan oscuro se verá el fondo detrás del texto para mejorar la legibilidad.</p>
            </div>
          </div>
        </div>

        {/* Live Preview Section */}
        <div className="bg-white dark:bg-[#1a1a1a] p-6 rounded-xl shadow-sm border border-gray-100 dark:border-zinc-800">
          <h2 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-200">Vista Previa en Tiempo Real</h2>
          
          <div className="relative w-full aspect-video md:aspect-[21/9] rounded-xl overflow-hidden bg-gray-900 border border-gray-200 dark:border-zinc-700">
            {formData.heroSlides.length > 0 ? (
              <>
                <img 
                  src={formData.heroSlides[0].imageUrl || "/images/hero-property.jpg"} 
                  alt="Preview Hero" 
                  className="absolute inset-0 w-full h-full object-cover object-center"
                />
                {/* Overlay */}
                <div 
                  className="absolute inset-0 bg-black" 
                  style={{ opacity: formData.heroOverlayOpacity / 100 }} 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
                
                {/* Content */}
                <div className="relative z-10 w-full h-full flex flex-col items-center justify-center text-center px-4 md:px-12">
                  
                  {/* Rating Badge Preview */}
                  <div className="inline-flex items-center gap-2 bg-black/40 backdrop-blur-md border border-white/10 shadow-xl px-3 py-1.5 md:px-4 md:py-2 rounded-full mb-4 md:mb-8">
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          size={12}
                          className={i < formData.heroRatingStars ? "fill-[#C7A15E] text-[#C7A15E]" : "fill-[#C7A15E]/30 text-[#C7A15E]/30"}
                        />
                      ))}
                    </div>
                    <span className="text-xs md:text-sm text-white/90 font-medium">
                      {formData.heroRatingText?.split(' - ')[0] || "Altamente Recomendado"}
                    </span>
                    {formData.heroRatingText?.includes(' - ') && (
                      <span className="text-xs md:text-sm text-white/60 hidden sm:inline">• {formData.heroRatingText.split(' - ')[1]}</span>
                    )}
                  </div>

                  {/* Texts Preview */}
                  <h1 className="font-serif text-2xl md:text-4xl lg:text-5xl font-medium text-white leading-tight mb-2 md:mb-4">
                    {formData.heroSlides[0].title || "Título de la Portada"}
                  </h1>
                  <p className="text-sm md:text-lg text-white/80 max-w-2xl mx-auto leading-relaxed">
                    {formData.heroSlides[0].subtitle || "Subtítulo principal aquí."}{" "}
                    <span className="text-[#C7A15E]">{formData.heroSlides[0].highlight || "Texto resaltado."}</span>
                  </p>
                </div>
              </>
            ) : (
              <div className="w-full h-full flex items-center justify-center flex-col text-gray-500">
                <ImageIcon className="h-10 w-10 mb-2 opacity-50" />
                <p>Agrega al menos una diapositiva para ver la vista previa.</p>
              </div>
            )}
          </div>
          <p className="text-xs text-gray-400 mt-3 italic text-center">
            * La vista previa muestra la primera diapositiva. En la página web real, las diapositivas rotarán automáticamente.
          </p>
        </div>

        {/* Slides */}
        <div className="space-y-6">
          {formData.heroSlides.map((slide, index) => (
            <div key={slide.id || index} className="bg-white dark:bg-[#1a1a1a] p-6 rounded-xl shadow-sm border border-gray-200 dark:border-zinc-800 relative group transition-all hover:shadow-md">
              <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button 
                  type="button" 
                  variant="destructive" 
                  size="sm"
                  onClick={() => removeSlide(index)}
                  className="bg-red-500 hover:bg-red-600 text-white"
                >
                  <Trash2 size={16} />
                </Button>
              </div>
              
              <div className="flex items-center gap-2 mb-6">
                <GripVertical className="text-gray-400" size={20} />
                <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200">
                  Diapositiva {index + 1}
                </h3>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Image Section */}
                <div className="lg:col-span-4 flex flex-col gap-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Imagen de Fondo
                  </label>
                  
                  {slide.imageUrl ? (
                    <div className="relative rounded-lg overflow-hidden border border-gray-200 dark:border-zinc-700 aspect-video group/img">
                      <img 
                        src={slide.imageUrl} 
                        alt="Preview" 
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center">
                        <Button 
                          type="button"
                          variant="destructive"
                          onClick={() => handleSlideChange(index, "imageUrl", "")}
                        >
                          Eliminar Foto
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-gray-50 dark:bg-zinc-900 rounded-lg p-4 border border-dashed border-gray-300 dark:border-zinc-700 h-full flex flex-col items-center justify-center min-h-[200px]">
                      <ImageUploader 
                        multiple={false}
                        buttonText="Subir Foto"
                        onUploadSuccess={(payload) => handleSlideChange(index, "imageUrl", payload.url || payload)}
                      />
                      <p className="text-xs text-gray-400 mt-4 text-center">
                        Sube una imagen para el fondo de esta diapositiva.
                      </p>
                    </div>
                  )}
                </div>

                {/* Text Section */}
                <div className="lg:col-span-8 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Título Principal
                    </label>
                    <input
                      type="text"
                      value={slide.title}
                      onChange={(e) => handleSlideChange(index, "title", e.target.value)}
                      required
                      placeholder="Ej: Excelencia en el Mercado"
                      className="w-full px-4 py-2 border rounded-md dark:bg-zinc-900 dark:border-zinc-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#C7A15E]"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Subtítulo (Primera parte)
                    </label>
                    <input
                      type="text"
                      value={slide.subtitle}
                      onChange={(e) => handleSlideChange(index, "subtitle", e.target.value)}
                      placeholder="Ej: Asesoramiento personalizado..."
                      className="w-full px-4 py-2 border rounded-md dark:bg-zinc-900 dark:border-zinc-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#C7A15E]"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Texto Dorado Resaltado (Segunda parte)
                    </label>
                    <input
                      type="text"
                      value={slide.highlight}
                      onChange={(e) => handleSlideChange(index, "highlight", e.target.value)}
                      placeholder="Ej: Atendido por sus propios dueños."
                      className="w-full px-4 py-2 border rounded-md dark:bg-zinc-900 dark:border-zinc-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#C7A15E]"
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}

          {formData.heroSlides.length === 0 && (
            <div className="text-center py-12 bg-white dark:bg-[#1a1a1a] rounded-xl border border-dashed border-gray-300 dark:border-zinc-700">
              <ImageIcon className="mx-auto h-12 w-12 text-gray-400 mb-3" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">No hay diapositivas</h3>
              <p className="mt-1 text-gray-500">Agrega al menos una diapositiva para el carrusel de la portada.</p>
              <Button 
                type="button"
                onClick={addSlide}
                className="mt-6 bg-[#C7A15E] hover:bg-[#b8923f] text-black"
              >
                <Plus size={18} className="mr-2" />
                Añadir Primera Diapositiva
              </Button>
            </div>
          )}
        </div>

        {/* Floating Save Bar */}
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/80 dark:bg-[#1a1a1a]/80 backdrop-blur-md border-t border-gray-200 dark:border-zinc-800 flex justify-center z-50">
          <div className="flex items-center gap-4 w-full max-w-5xl px-6">
            <Button 
              type="submit" 
              disabled={loading}
              className="bg-[#C7A15E] hover:bg-[#b8923f] text-black font-semibold flex items-center px-8 py-6 text-lg w-full sm:w-auto shadow-xl"
            >
              <Save size={20} className="mr-2" />
              {loading ? "Guardando..." : "Guardar Todos Los Cambios"}
            </Button>
            
            {successMsg && (
              <span className="text-green-600 dark:text-green-400 font-medium animate-in fade-in slide-in-from-bottom-2">
                {successMsg}
              </span>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}
