import React, { useState } from 'react';
import { useGetAllUsersQuery, useAdminCreateUserMutation, useUpdateUserRoleMutation, useAdminUpdateUserMutation, useAdminDeleteUserMutation } from "../../services/api/userApi.js";
import { Button } from "../../components/ui/button.tsx";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table.tsx";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../../components/ui/dialog.tsx";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "../../components/ui/alert-dialog.tsx";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../../components/ui/form.tsx";
import { Input } from "../../components/ui/input.tsx";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select.tsx";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { UserCog, UserPlus, Pencil, Trash2 } from "lucide-react";
import { toast } from "../../components/ui/use-toast.tsx";
import { RoleNames } from "../../utils/magicNumbers";

const ROLES = ["ADMIN", "USER", "TENANT", "REALTOR", "EMPLOYEE"];

const userFormSchema = z.object({
    email: z.string().email(),
    password: z.string().min(8),
    first_name: z.string().min(1),
    last_name: z.string().min(1),
    role: z.string().min(1),
});

const userEditSchema = z.object({
    email: z.string().email(),
    firstName: z.string().min(1),
    lastName: z.string().min(1),
});

export default function UserManagement() {
    const { data: usersResponse, isLoading, refetch } = useGetAllUsersQuery();
    const [createUser, { isLoading: isCreating }] = useAdminCreateUserMutation();
    const [updateRole, { isLoading: isUpdating }] = useUpdateUserRoleMutation();
    const [updateUser, { isLoading: isUpdatingUser }] = useAdminUpdateUserMutation();
    const [deleteUser, { isLoading: isDeletingUser }] = useAdminDeleteUserMutation();
    
    const [createModalOpen, setCreateModalOpen] = useState(false);
    const [roleModalOpen, setRoleModalOpen] = useState(false);
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);

    const users = usersResponse?.data || [];

    const form = useForm({
        resolver: zodResolver(userFormSchema),
        defaultValues: { email: '', password: '', first_name: '', last_name: '', role: 'USER' }
    });

    const editForm = useForm({
        resolver: zodResolver(userEditSchema),
        defaultValues: { email: '', firstName: '', lastName: '' }
    });

    const handleCreateUser = async (values) => {
        try {
            await createUser(values).unwrap();
            toast({ title: "Usuario creado", variant: "success" });
            setCreateModalOpen(false);
            form.reset();
            refetch();
        } catch (error) {
            toast({ title: "Error al crear", description: error.data?.message || "Ocurrió un error", variant: "error" });
        }
    };

    const handleDeleteUser = async () => {
        if (!selectedUser) return;
        try {
            await deleteUser(selectedUser.id).unwrap();
            toast({ title: "Usuario eliminado", variant: "success" });
            setDeleteModalOpen(false);
            setSelectedUser(null);
            refetch();
        } catch (error) {
            toast({ title: "Error al eliminar", description: error.data?.message || "Ocurrió un error", variant: "error" });
        }
    };

    const handleEditUser = async (values) => {
        if (!selectedUser) return;
        try {
            await updateUser({ id: selectedUser.id, ...values }).unwrap();
            toast({ title: "Usuario actualizado", variant: "success" });
            setEditModalOpen(false);
            setSelectedUser(null);
            refetch();
        } catch (error) {
            toast({ title: "Error al actualizar", description: error.data?.message || "Ocurrió un error", variant: "error" });
        }
    };

    const openEditModal = (user) => {
        setSelectedUser(user);
        editForm.reset({
            email: user.email || '',
            firstName: user.firstName || '',
            lastName: user.lastName || ''
        });
        setEditModalOpen(true);
    };

    const handleUpdateRole = async (role) => {
        if (!selectedUser) return;
        try {
            await updateRole({ id: selectedUser.id, role }).unwrap();
            toast({ title: "Rol actualizado", variant: "success" });
            setRoleModalOpen(false);
            setSelectedUser(null);
            refetch();
        } catch (error) {
            toast({ title: "Error al actualizar", variant: "error" });
        }
    };

    if (isLoading) return <div className="p-8">Cargando usuarios...</div>;

    return (
        <div className="p-8">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Gestión de Usuarios</h1>
                    <p className="text-muted-foreground mt-2">Administra los accesos y roles del sistema.</p>
                </div>
                
                <Dialog open={createModalOpen} onOpenChange={setCreateModalOpen}>
                    <DialogTrigger asChild>
                        <Button className="gap-2 bg-primary hover:bg-primary/90"><UserPlus size={18}/> Nuevo Usuario</Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Crear Usuario</DialogTitle>
                        </DialogHeader>
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(handleCreateUser)} className="space-y-4">
                                <FormField control={form.control} name="email" render={({field}) => (
                                    <FormItem><FormLabel>Email</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage/></FormItem>
                                )} />
                                <div className="grid grid-cols-2 gap-4">
                                    <FormField control={form.control} name="first_name" render={({field}) => (
                                        <FormItem><FormLabel>Nombre</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage/></FormItem>
                                    )} />
                                    <FormField control={form.control} name="last_name" render={({field}) => (
                                        <FormItem><FormLabel>Apellido</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage/></FormItem>
                                    )} />
                                </div>
                                <FormField control={form.control} name="password" render={({field}) => (
                                    <FormItem><FormLabel>Contraseña</FormLabel><FormControl><Input type="password" {...field} /></FormControl><FormMessage/></FormItem>
                                )} />
                                <FormField control={form.control} name="role" render={({field}) => (
                                    <FormItem>
                                        <FormLabel>Rol</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger><SelectValue placeholder="Selecciona un rol" /></SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {ROLES.map(r => <SelectItem key={r} value={r}>{RoleNames[r] || r}</SelectItem>)}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage/>
                                    </FormItem>
                                )} />
                                <Button type="submit" disabled={isCreating} className="w-full">Guardar Usuario</Button>
                            </form>
                        </Form>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="border rounded-md bg-card">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Nombre</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Rol</TableHead>
                            <TableHead>Creado el</TableHead>
                            <TableHead className="text-right">Acciones</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {users.map(user => (
                            <TableRow key={user.id}>
                                <TableCell className="font-medium">{user.name || `${user.firstName || ''} ${user.lastName || ''}`}</TableCell>
                                <TableCell>{user.email}</TableCell>
                                <TableCell>
                                        <span className={`px-3 py-1 rounded-full text-xs font-semibold
                                        ${user.role === 'ADMIN' ? 'bg-red-100 text-red-800 border border-red-200' : 
                                          user.role === 'EMPLOYEE' ? 'bg-blue-100 text-blue-800 border border-blue-200' : 
                                          'bg-gray-100 text-gray-800 border border-gray-200'}`}>
                                        {RoleNames[user.role] || user.role}
                                    </span>
                                </TableCell>
                                <TableCell>{new Date(user.createdAt).toLocaleDateString()}</TableCell>
                                <TableCell className="text-right">
                                    <Button variant="outline" size="sm" onClick={() => openEditModal(user)} className="mr-2">
                                        <Pencil size={16} className="mr-2"/> Editar
                                    </Button>
                                    <Button variant="outline" size="sm" onClick={() => {
                                        setSelectedUser(user);
                                        setRoleModalOpen(true);
                                    }} className="mr-2">
                                        <UserCog size={16} className="mr-2"/> Cambiar Rol
                                    </Button>
                                    <Button variant="destructive" size="sm" onClick={() => {
                                        setSelectedUser(user);
                                        setDeleteModalOpen(true);
                                    }}>
                                        <Trash2 size={16} className="mr-2"/> Eliminar
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            {/* Change Role Modal */}
            <Dialog open={roleModalOpen} onOpenChange={(open) => {
                setRoleModalOpen(open);
                if (!open) setSelectedUser(null);
            }}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Cambiar Rol</DialogTitle>
                    </DialogHeader>
                    {selectedUser && (
                        <div className="space-y-4">
                            <p>Usuario: <strong>{selectedUser.email}</strong></p>
                            <p className="text-sm text-muted-foreground mb-4">Selecciona el nuevo rol para este usuario:</p>
                            <div className="grid grid-cols-2 gap-3">
                                {ROLES.map(r => (
                                    <Button 
                                        key={r} 
                                        variant={selectedUser.role === r ? 'default' : 'outline'}
                                        onClick={() => handleUpdateRole(r)}
                                        disabled={isUpdating}
                                        className={selectedUser.role === r ? "ring-2 ring-primary ring-offset-2" : ""}
                                    >
                                        {RoleNames[r] || r}
                                    </Button>
                                ))}
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            {/* Edit User Modal */}
            <Dialog open={editModalOpen} onOpenChange={(open) => {
                setEditModalOpen(open);
                if (!open) setSelectedUser(null);
            }}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Editar Usuario</DialogTitle>
                    </DialogHeader>
                    <Form {...editForm}>
                        <form onSubmit={editForm.handleSubmit(handleEditUser)} className="space-y-4">
                            <FormField control={editForm.control} name="email" render={({field}) => (
                                <FormItem><FormLabel>Email</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage/></FormItem>
                            )} />
                            <div className="grid grid-cols-2 gap-4">
                                <FormField control={editForm.control} name="firstName" render={({field}) => (
                                    <FormItem><FormLabel>Nombre</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage/></FormItem>
                                )} />
                                <FormField control={editForm.control} name="lastName" render={({field}) => (
                                    <FormItem><FormLabel>Apellido</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage/></FormItem>
                                )} />
                            </div>
                            <Button type="submit" disabled={isUpdatingUser} className="w-full">Guardar Cambios</Button>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Modal */}
            <AlertDialog open={deleteModalOpen} onOpenChange={(open) => {
                setDeleteModalOpen(open);
                if (!open) setSelectedUser(null);
            }}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>¿Estás completamente seguro?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Esta acción no se puede deshacer. Esto eliminará permanentemente al usuario 
                            <strong> {selectedUser?.email}</strong> y removerá todos sus datos de nuestros servidores.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDeleteUser} disabled={isDeletingUser} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                            Eliminar
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
