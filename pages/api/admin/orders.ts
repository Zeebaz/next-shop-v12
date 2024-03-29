import { db } from "@/database";
import { IOrder } from "@/interfaces";
import { Order } from "@/models";
import type { NextApiRequest, NextApiResponse } from "next";

type Data =
  | {
      message: string;
    }
  | IOrder[];

export default function api(req: NextApiRequest, res: NextApiResponse<Data>) {
  switch (req.method) {
    case "GET":
      return getOrders(req, res);

    default:
      return res.status(400).json({ message: "Bad request" });
  }
}
async function getOrders(req: NextApiRequest, res: NextApiResponse<Data>) {
  await db.connect();
  const orders = await Order.find()
    .sort({ createAt: "desc" })
    .populate("user", "name email")
    .lean();
  await db.disconnect();

  return res.status(200).json(orders);
}
