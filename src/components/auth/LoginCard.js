import {useLoginMutation} from "../../services/api/authApi.js";
import {Form, FormControl, FormField, FormItem, FormLabel, FormMessage} from "../ui/form.tsx";
import {z} from "zod";
import {useForm} from "react-hook-form";
import {Input} from "../ui/input.tsx";
import {zodResolver} from "@hookform/resolvers/zod";
import {Button} from "../ui/button.tsx";
import {useNavigate} from "react-router-dom";
import PublicAuthLayout from "./PublicAuthLayout.jsx";

const LoginCard = () => {
    const navigate = useNavigate();
    const [login, {isLoading}] = useLoginMutation();

    const loginFormSchema = z.object({
        email: z.string().email({message: 'Por favor, introduce un correo electrónico válido'}),
        password: z.string().min(8, {message: 'La contraseña debe tener al menos 8 caracteres'}),
    })

    const form = useForm({
        resolver: zodResolver(loginFormSchema),
        defaultValues: {
            email: '',
            password: '',
        }
    })

    function onSubmit(zodValues) {
        login(zodValues).then((res) => {
            if (res.data) {
                navigate('/dashboard')
            } else if (res.error) {
                form.setError("password", { message: "Correo electrónico o contraseña incorrectos." });
            }
        })
    }

    return (
        <PublicAuthLayout>
            <div className="text-center mb-8">
                <h1 className="text-3xl font-serif text-white mb-2">Iniciar Sesión</h1>
                <p className="text-white/60 text-sm">Bienvenido de nuevo al panel de administración</p>
            </div>

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                    <FormField
                        control={form.control}
                        name="email"
                        render={({field}) => (
                            <FormItem>
                                <FormLabel className="text-white/90">Correo electrónico</FormLabel>
                                <FormControl>
                                    <Input 
                                        placeholder="tu@email.com" 
                                        className="bg-black/40 border-white/20 text-white placeholder:text-white/40 focus-visible:ring-[#C7A15E]" 
                                        {...field} 
                                    />
                                </FormControl>
                                <FormMessage className="text-red-400" />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="password"
                        render={({field}) => (
                            <FormItem>
                                <FormLabel className="text-white/90">Contraseña</FormLabel>
                                <FormControl>
                                    <Input 
                                        type="password" 
                                        placeholder="••••••••"
                                        className="bg-black/40 border-white/20 text-white placeholder:text-white/40 focus-visible:ring-[#C7A15E]" 
                                        {...field} 
                                    />
                                </FormControl>
                                <FormMessage className="text-red-400" />
                            </FormItem>
                        )}
                    />

                    <Button type="submit" className="w-full bg-[#C7A15E] hover:bg-[#b8923f] text-black font-semibold mt-4" disabled={isLoading}>
                        {isLoading ? "Iniciando..." : "Ingresar"}
                    </Button>

                    <div className="mt-6 text-center">
                        <Button variant="link" type="button" className="text-white/60 hover:text-[#C7A15E]" onClick={() => navigate("/signup")}>
                            ¿No tienes una cuenta? Regístrate
                        </Button>
                    </div>
                </form>
            </Form>
        </PublicAuthLayout>
    )
}

export default LoginCard;