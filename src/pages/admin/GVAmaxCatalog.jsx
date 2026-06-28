import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { getGvamaxInmuebles } from '../../services/api/gvamaxApi';

const GVAmaxCatalog = () => {
    const [inmuebles, setInmuebles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [selectedInmueble, setSelectedInmueble] = useState(null);
    const [uploading3d, setUploading3d] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const [externalUrl, setExternalUrl] = useState("");
    const accessToken = useSelector(state => state.authSlice?.accessToken);

    const handle3DUpload = async (propertyId) => {
        if (!selectedFile && !externalUrl) {
            alert("Selecciona un archivo o ingresa una URL primero");
            return;
        }
        
        if (selectedFile && !/\.(jpg|jpeg|png)$/i.test(selectedFile.name)) {
            alert("Solo se permiten archivos de imagen (.jpg, .png)");
            return;
        }

        setUploading3d(true);
        try {
            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:10000';
            const baseApiUrl = apiUrl.replace(/\/api$/, '');
            let finalUrl = externalUrl;

            // Si hay un archivo, subirlo primero a ImageKit a través de nuestro endpoint
            if (selectedFile) {
                const imageFormData = new FormData();
                imageFormData.append('image', selectedFile);

                const uploadRes = await fetch(`${baseApiUrl}/api/upload`, {
                    method: 'POST',
                    headers: {
                        ...(accessToken ? { 'Authorization': `Bearer ${accessToken}` } : {})
                    },
                    body: imageFormData
                });

                if (!uploadRes.ok) {
                    throw new Error('Error al subir la imagen 360');
                }

                const uploadData = await uploadRes.json();
                finalUrl = uploadData.url;
            }

            // A diferencia de antes, /properties/:id/upload-3d ahora espera JSON
            // Asume que las propiedades están en la raíz de la API (no bajo /api como /upload)

            const res = await fetch(`${baseApiUrl}/properties/${propertyId}/upload-3d`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(accessToken ? { 'Authorization': `Bearer ${accessToken}` } : {})
                },
                body: JSON.stringify({ external_url: finalUrl })
            });

            if (res.ok) {
                alert('Recorrido 3D guardado con éxito');
                setSelectedFile(null);
                setExternalUrl("");
            } else {
                const errData = await res.json();
                alert(`Error: ${errData.message || 'No se pudo guardar'}`);
            }
        } catch (error) {
            console.error("Error al guardar recorrido:", error);
            alert('Error al guardar el recorrido 3D');
        } finally {
            setUploading3d(false);
        }
    };

    useEffect(() => {
        const fetchInmuebles = async () => {
            setLoading(true);
            try {
                const data = await getGvamaxInmuebles(page);
                // GVAmax response structure: { content: { status, totalresults, limit, totalpages, currentpage }, propiedades: [...] }
                if (data && data.propiedades) {
                    setInmuebles(data.propiedades);
                    if (data.content && data.content.totalpages) {
                        setTotalPages(data.content.totalpages);
                    }
                } else {
                    setInmuebles([]);
                }
            } catch (err) {
                setError("No se pudieron cargar los inmuebles de GVAmax.");
            } finally {
                setLoading(false);
            }
        };

        fetchInmuebles();
    }, [page]);

    return (
        <div className="p-6 w-full bg-slate-50 min-h-screen">
            <div className="max-w-7xl mx-auto">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-bold text-slate-800">Catálogo GVAmax</h1>
                    <span className="text-sm bg-blue-100 text-blue-800 py-1 px-3 rounded-full font-medium">Integración Externa</span>
                </div>

                {error && (
                    <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6" role="alert">
                        <p>{error}</p>
                    </div>
                )}

                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {inmuebles.map((inmueble) => (
                                <div key={inmueble.id} 
                                     onClick={() => setSelectedInmueble(inmueble)}
                                     className="cursor-pointer bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow border border-slate-200 flex flex-col">
                                    <div className="h-48 overflow-hidden bg-slate-200 relative">
                                        {inmueble.imagenPortada ? (
                                            <img src={inmueble.imagenPortada} alt={inmueble.tituloComercial} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex justify-center items-center text-slate-400">Sin Imagen</div>
                                        )}
                                        <div className="absolute top-2 right-2 bg-slate-900/70 text-white text-xs font-semibold px-2 py-1 rounded">
                                            {inmueble.tipoOperacion}
                                        </div>
                                    </div>
                                    <div className="p-4 flex-1 flex flex-col">
                                        <h2 className="text-lg font-semibold text-slate-800 line-clamp-2 mb-2">{inmueble.tituloComercial || "Propiedad sin título"}</h2>
                                        
                                        <div className="text-xl font-bold text-blue-600 mb-3 mt-auto">
                                            {inmueble.moneda === 'D' ? 'U$S' : '$'} {inmueble.precio}
                                        </div>
                                        
                                        <div className="flex justify-between text-sm text-slate-500 border-t pt-3 mt-2">
                                            <span className="flex items-center gap-1">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>
                                                {inmueble.tipoInmueble}
                                            </span>
                                            {inmueble.dormitorios > 0 && (
                                                <span className="flex items-center gap-1">
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"></path></svg>
                                                    {inmueble.dormitorios} Dorm.
                                                </span>
                                            )}
                                        </div>
                                        
                                        <div className="mt-2 text-xs text-slate-400">
                                            {inmueble.ubicacion?.barrio}, {inmueble.ubicacion?.localidad}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Paginación */}
                        {totalPages > 1 && (
                            <div className="mt-8 flex justify-center gap-2">
                                <button 
                                    onClick={() => setPage(p => Math.max(1, p - 1))}
                                    disabled={page === 1}
                                    className="px-4 py-2 border rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 font-medium"
                                >
                                    Anterior
                                </button>
                                <span className="px-4 py-2 bg-blue-50 text-blue-800 rounded-md font-semibold">
                                    Página {page} de {totalPages}
                                </span>
                                <button 
                                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                    disabled={page === totalPages}
                                    className="px-4 py-2 border rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 font-medium"
                                >
                                    Siguiente
                                </button>
                            </div>
                        )}

                        {inmuebles.length === 0 && !loading && (
                            <div className="text-center py-12 text-slate-500 bg-white rounded-xl shadow-sm border border-slate-200">
                                <svg className="w-16 h-16 mx-auto mb-4 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
                                <p className="text-lg">No se encontraron inmuebles en GVAmax.</p>
                            </div>
                        )}
                    </>
                )}

                {/* Modal de Detalle */}
                {selectedInmueble && (
                    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 overflow-y-auto">
                        <div className="bg-white rounded-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col">
                            <div className="flex justify-between items-center p-4 border-b sticky top-0 bg-white z-10">
                                <h2 className="text-xl font-bold text-slate-800">{selectedInmueble.tituloComercial || "Detalle del Inmueble"}</h2>
                                <button onClick={() => { setSelectedInmueble(null); setSelectedFile(null); }} className="text-slate-500 hover:text-red-500 font-bold text-3xl leading-none">&times;</button>
                            </div>
                            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    {selectedInmueble.imagenPortada ? (
                                        <img src={selectedInmueble.imagenPortada} alt={selectedInmueble.tituloComercial} className="w-full rounded-lg object-cover shadow-sm mb-4" />
                                    ) : (
                                        <div className="w-full h-64 bg-slate-200 rounded-lg flex justify-center items-center text-slate-400 mb-4">Sin Imagen</div>
                                    )}
                                    <div className="flex flex-wrap gap-2 mb-4">
                                        {selectedInmueble.media?.images && Object.values(selectedInmueble.media.images).slice(0, 4).map((img, idx) => (
                                            <img key={idx} src={img} className="w-20 h-20 object-cover rounded shadow-sm border" alt="miniatura" />
                                        ))}
                                    </div>
                                </div>
                                <div className="flex flex-col gap-4">
                                    <div>
                                        <div className="text-3xl font-bold text-blue-600">
                                            {selectedInmueble.moneda === 'D' ? 'U$S' : '$'} {selectedInmueble.precio}
                                        </div>
                                        <div className="text-sm text-slate-500 uppercase tracking-wide mt-1 font-semibold">{selectedInmueble.tipoOperacion} - {selectedInmueble.tipoInmueble}</div>
                                    </div>
                                    
                                    <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                                        <h3 className="font-semibold text-slate-700 mb-2 border-b pb-1">Ubicación</h3>
                                        <p className="text-slate-600 text-sm">
                                            {selectedInmueble.ubicacion?.calle} {selectedInmueble.ubicacion?.numero}, {selectedInmueble.ubicacion?.barrio}, {selectedInmueble.ubicacion?.localidad}, {selectedInmueble.ubicacion?.provincia}
                                        </p>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 text-center flex flex-col justify-center">
                                            <span className="block text-xl font-bold text-slate-700">{selectedInmueble.dormitorios || 0}</span>
                                            <span className="text-xs text-slate-500 uppercase">Dormitorios</span>
                                        </div>
                                        <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 text-center flex flex-col justify-center">
                                            <span className="block text-xl font-bold text-slate-700">{selectedInmueble.banos || 0}</span>
                                            <span className="text-xs text-slate-500 uppercase">Baños</span>
                                        </div>
                                        <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 text-center flex flex-col justify-center">
                                            <span className="block text-xl font-bold text-slate-700">{selectedInmueble.superficies?.metrosCubiertos || 0} m²</span>
                                            <span className="text-xs text-slate-500 uppercase">Cubiertos</span>
                                        </div>
                                        <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 text-center flex flex-col justify-center">
                                            <span className="block text-xl font-bold text-slate-700">{selectedInmueble.superficies?.metrosTerreno || 0} m²</span>
                                            <span className="text-xs text-slate-500 uppercase">Terreno</span>
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="md:col-span-2 mt-2">
                                    <h3 className="font-bold text-lg text-slate-800 mb-2 border-b pb-2">Descripción</h3>
                                    <div className="text-slate-600 whitespace-pre-line text-sm leading-relaxed" dangerouslySetInnerHTML={{ __html: selectedInmueble.descripcion || "Sin descripción disponible." }} />
                                </div>
                                
                                <div className="md:col-span-2 mt-4 bg-slate-100 p-4 rounded-lg border border-slate-200">
                                    <h3 className="font-bold text-lg text-slate-800 mb-2">Recorrido 3D</h3>
                                    <div className="flex flex-col gap-3">
                                        <div className="flex flex-col sm:flex-row gap-2">
                                            <input 
                                                type="file" 
                                                accept="image/jpeg, image/png" 
                                                onChange={(e) => { setSelectedFile(e.target.files[0]); setExternalUrl(""); }} 
                                                disabled={uploading3d || externalUrl !== ""}
                                                className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                                            />
                                        </div>
                                        <div className="flex flex-col gap-2">
                                            <span className="text-sm font-semibold text-slate-600">O ingresar URL o código Iframe:</span>
                                            <textarea 
                                                placeholder='Ej: https://... o <iframe src="..."></iframe>'
                                                value={externalUrl}
                                                onChange={(e) => { setExternalUrl(e.target.value); setSelectedFile(null); }}
                                                disabled={uploading3d || selectedFile !== null}
                                                className="w-full px-3 py-2 text-sm border rounded-md disabled:opacity-50 min-h-[80px]"
                                            />
                                        </div>
                                        <div className="flex justify-end mt-2">
                                            <button 
                                                onClick={() => handle3DUpload(selectedInmueble.id)}
                                                disabled={uploading3d || (!selectedFile && !externalUrl)}
                                                className="whitespace-nowrap px-4 py-2 bg-green-600 text-white rounded-md font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                            >
                                                {uploading3d ? (
                                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                                ) : (
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path></svg>
                                                )}
                                                {uploading3d ? "Guardando..." : "Guardar 3D"}
                                            </button>
                                        </div>
                                    </div>
                                    <p className="text-xs text-slate-500 mt-2">Sube una imagen panorámica 360 (.jpg/.png) o pega una URL (Matterport, Kuula) para el recorrido virtual.</p>
                                </div>
                            </div>
                            <div className="p-4 border-t bg-slate-50 flex justify-end">
                                <button onClick={() => { setSelectedInmueble(null); setSelectedFile(null); setExternalUrl(""); }} className="px-6 py-2 bg-slate-800 text-white rounded-md hover:bg-slate-700 transition-colors font-medium">Cerrar</button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default GVAmaxCatalog;
