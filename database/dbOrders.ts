import { IOrder } from "@/interfaces";
import { isValidObjectId } from "mongoose";
import { connect } from "./db";
import { db } from ".";
import { Order } from "@/models";
import mongoose from "mongoose";

export const getOrderById = async (id: string): Promise<IOrder | null> => {
  if (!isValidObjectId(id)) return null;

  await db.connect();
  const order = await Order.findById(id).lean();
  await db.disconnect();

  if (!order) return null;

  // se serializa por los objetos como ObjectId('sadfsda')
  return JSON.parse(JSON.stringify(order));
};

export const getOrdersByUser = async( userId: string ): Promise<IOrder[]> => {
    
  if ( !isValidObjectId(userId) ){
      return [];
  }

  await db.connect();
  const orders = await Order.find({ user: userId }).lean();
  await db.disconnect();


  return JSON.parse(JSON.stringify(orders));


}