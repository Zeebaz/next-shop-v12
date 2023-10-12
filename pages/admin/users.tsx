import { tesloApi } from "@/api";
import { AdminLayout } from "@/components/layouts";
import { FullScreenLoading } from "@/components/ui";
import { IUser } from "@/interfaces";
import { PeopleOutline } from "@mui/icons-material";
import { Grid, MenuItem, Select, SelectChangeEvent } from "@mui/material";
import { DataGrid, GridColDef, GridValueGetterParams } from "@mui/x-data-grid";
import { useEffect, useState } from "react";
import useSWR from "swr";

const UsersPage = () => {
  const { data, error } = useSWR<IUser[]>("/api/admin/users");
  const [users, setUsers] = useState<IUser[]>([]);

  useEffect(() => {
    if (data) setUsers(data);
  }, [data]);

  if (!data && !error) {
    return <FullScreenLoading />;
  }

  const onRoleUpdeted = async (userId: string, newRole: string) => {
    const previousUsers = users.map((user) => ({ ...user }));

    const updatedUsers = users.map((user) => ({
      ...user,
      role: user._id === userId ? newRole : user.role,
    }));
    setUsers(updatedUsers);

    try {
      await tesloApi.put("/admin/users", { userId, role: newRole });
    } catch (error) {
      setUsers(previousUsers);
      console.log(error);
      alert("No se pudo actualizar el rol del usuario");
    }
  };

  const columns: GridColDef[] = [
    { field: "email", headerName: "Email", width: 250 },
    { field: "name", headerName: "Full name", width: 300 },
    {
      field: "role",
      headerName: "Rol",
      width: 300,
      renderCell: ({ row }: GridValueGetterParams) => {
        return (
          <Select
            value={row.role}
            label="Rol"
            sx={{ width: "300px" }}
            onChange={({ target }) => onRoleUpdeted(row.id, target.value)}
          >
            <MenuItem value={"admin"}>Admin</MenuItem>
            <MenuItem value={"client"}>Client</MenuItem>
            <MenuItem value={"super-user"}>Super User</MenuItem>
            <MenuItem value={"SEO"}>SEO</MenuItem>
          </Select>
        );
      },
    },
  ];

  const rows = users.map((user) => ({
    id: user._id,
    email: user.email,
    name: user.name,
    role: user.role,
  }));

  return (
    <AdminLayout
      title={"Usuarios"}
      subtitle={"Mantenimiento de usuarios"}
      icon={<PeopleOutline />}
    >
      <Grid container className="fadeIn">
        <Grid item xs={12} sx={{ height: 650, width: "100%" }}>
          <DataGrid
            rows={rows}
            columns={columns}
            pageSize={10}
            rowsPerPageOptions={[10]}
          />
        </Grid>
      </Grid>
    </AdminLayout>
  );
};

export default UsersPage;
