import { GetServerSideProps, NextPage } from "next";
import { PayPalButtons } from "@paypal/react-paypal-js";
import {
  Box,
  Card,
  CardContent,
  Divider,
  Grid,
  Typography,
  Chip,
  CircularProgress,
} from "@mui/material";
import {
  ConfirmationNumberOutlined,
  CreditCardOffOutlined,
  CreditScoreOutlined,
  MoneyOffCsred,
} from "@mui/icons-material";

import { dbOrders } from "@/database";
import { IOrder } from "@/interfaces";
import { OrderResponseBody } from "@paypal/paypal-js/types/apis/orders";
import { tesloApi } from "@/api";
import { useRouter } from "next/router";
import { useState } from "react";
import { AdminLayout } from "@/components/layouts";
import { CartList, OrderSummary } from "@/components/cart";

interface Props {
  order: IOrder;
}

const OrderPage: NextPage<Props> = ({ order }) => {
  return (
    <AdminLayout
      subtitle={`Orden ${order._id}`}
      title={"Resumen de orden"}
      icon={<ConfirmationNumberOutlined />}
    >
      {order.isPaid ? (
        <Chip
          sx={{ my: 2 }}
          label="Orden ya fue pagada"
          variant="outlined"
          color="success"
          icon={<CreditScoreOutlined />}
        />
      ) : (
        <Chip
          sx={{ my: 2 }}
          label="Pendiente de pago"
          variant="outlined"
          color="error"
          icon={<CreditCardOffOutlined />}
        />
      )}

      <Grid container className="fadeIn">
        <Grid item xs={12} sm={7}>
          <CartList products={order.orderItems!} editable={false} />
        </Grid>
        <Grid item xs={12} sm={5}>
          <Card className="summary-card">
            <CardContent>
              <Typography variant="h2">
                Resumen ({order.numberOfItems}
                {order.numberOfItems > 1 ? " productos" : " producto"} )
              </Typography>
              <Divider sx={{ my: 1 }} />

              <Box display="flex" justifyContent="space-between">
                <Typography variant="subtitle1">
                  Dirección de entrega
                </Typography>
              </Box>

              <Typography>
                {order.shippingAddress.firstName}{" "}
                {order.shippingAddress.lastName}
              </Typography>
              <Typography>
                {order.shippingAddress.address}{" "}
                {order.shippingAddress.address2 && ", "}{" "}
                {order.shippingAddress.address2}
              </Typography>
              <Typography>
                {order.shippingAddress.country}, {order.shippingAddress.city},
                {order.shippingAddress.zip}
              </Typography>
              <Typography>{order.shippingAddress.phone}</Typography>

              <Divider sx={{ my: 1 }} />

              <OrderSummary
                orderValues={{
                  numberOfItems: order.numberOfItems,
                  subTotal: order.subTotal,
                  total: order.total,
                  tax: order.tax,
                }}
              />

              <Box sx={{ mt: 3 }} display={"flex"} flexDirection={"column"}>
                {order.isPaid ? (
                  <Chip
                    sx={{ my: 2 }}
                    label="Orden ya fue pagada"
                    variant="outlined"
                    color="success"
                    icon={<CreditScoreOutlined />}
                  />
                ) : (
                  <Chip
                    sx={{ my: 2 }}
                    label="Orden no ha sido pagada"
                    variant="outlined"
                    color="error"
                    icon={<CreditCardOffOutlined />}
                  />
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </AdminLayout>
  );
};

export const getServerSideProps: GetServerSideProps = async ({
  req,
  query,
}) => {
  const { id = "" } = query;

  const order = await dbOrders.getOrderById(id.toString());

  if (!order) {
    return {
      redirect: {
        destination: "/orders/history",
        permanent: false,
      },
    };
  }

  return {
    props: {
      order,
    },
  };
};

export default OrderPage;
