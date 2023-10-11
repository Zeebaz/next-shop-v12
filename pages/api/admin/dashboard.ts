import { db } from "@/database";
import { Order, Product, User } from "@/models";
import type { NextApiRequest, NextApiResponse } from "next";

type Data = {
  numberOfOrders: number;
  paidOrders: number;
  notPaidOrders: number;
  numberOfClients: number;
  numberOfProducts: number;
  productWithNoInventory: number;
  lowInventory: number;
};

export default async function (
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  await db.connect();

  const numberOfOrders = await Order.find().count();
  const paidOrders = await Order.find({ isPaid: true }).count();
  const notPaidOrders = numberOfOrders - paidOrders;

  const numberOfClients = await User.find({ role: "client" }).count();

  const numberOfProducts = await Product.find().count();
  const productWithNoInventory = await Product.find({ inStock: 0 }).count();
  const lowInventory = await Product.find({ inStock: { $lt: 10 } }).count();

  await db.disconnect();

  res.status(200).json({
    numberOfOrders,
    paidOrders,
    notPaidOrders,
    numberOfClients,
    numberOfProducts,
    productWithNoInventory,
    lowInventory,
  });
}
