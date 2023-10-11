import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";
import { IOrder } from "@/interfaces";
import { db } from "@/database";
import { Order, Product } from "@/models";
import mongoose, { ObjectId } from "mongoose";

type Data =
  | {
      message: string;
    }
  | IOrder;

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  switch (req.method) {
    case "POST":
      return createOrder(req, res);

    default:
      return res.status(400).json({ message: "Bad request" });
  }
}
async function createOrder(req: NextApiRequest, res: NextApiResponse<Data>) {
  const { orderItems, total } = req.body as IOrder;
  const session = await getServerSession(req, res, authOptions);

  if (!session) {
    return res
      .status(401)
      .json({ message: "Debe de estar autenticado par hacer esto" });
  }

  // crear arreglo con los productos
  const productsIds = orderItems.map((product) => product._id);

  await db.connect();
  const dbProducts = await Product.find({ _id: { $in: productsIds } });

  try {
    const subTotal = orderItems.reduce((prev, current) => {
      const currentPrice = dbProducts.find(
        (p) => p._id.valueOf() === current._id
      )?.price;
      if (!currentPrice) {
        throw new Error("Verifique el carrito de nuevo, producto no existe");
      }

      return currentPrice * current.quantity + prev;
    }, 0);

    const taxRate = Number(process.env.NEXT_PUBLIC_TAX_RATE || 0);
    const backendTotal = subTotal * (taxRate + 1);

    if (backendTotal !== total) {
      throw new Error("El total no cuadra con el monto");
    }

    // TODO todo bien
    const userId = session.user._id;

    console.log({ userId });
    const newOrder = new Order({
      ...req.body,
      isPaid: false,
      user: userId,
    });
    newOrder.total = Math.round(newOrder.total * 100) / 100;

    await newOrder.save();
    await db.disconnect();

    return res.status(201).json(newOrder);
  } catch (error: any) {
    await db.disconnect();
    console.log(error);
    return res.status(400).json({
      message: error.message || "Revise log del servidor",
    });
  }
}
