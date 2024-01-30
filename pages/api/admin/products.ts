import { db } from "@/database";
import { IProduct } from "@/interfaces";
import { Product } from "@/models";
import { STATUS_CODES } from "http";
import { isValidObjectId } from "mongoose";
import type { NextApiRequest, NextApiResponse } from "next";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config(process.env.CLOUDINARY_URL || "");

type Data = { message: string } | IProduct[] | IProduct;

export default function api(req: NextApiRequest, res: NextApiResponse<Data>) {
  switch (req.method) {
    case "GET":
      return getProducts(req, res);

    case "PUT":
      return updateProduct(req, res);

    case "POST":
      return createProduct(req, res);

    default:
      return res.status(400).json({ message: "Bad request" });
  }
}

async function getProducts(req: NextApiRequest, res: NextApiResponse<Data>) {
  await db.connect();
  const products = await Product.find().sort({ title: "asc" }).lean();
  await db.disconnect();
  const updateProducts = products.map((product) => {
    product.images = product.images.map((image) =>
      image.startsWith("http")
        ? image
        : `${process.env.HOST_NAME}products/${image}`
    );
    return product;
  });


  res.status(200).json(updateProducts);
}
async function updateProduct(req: NextApiRequest, res: NextApiResponse<Data>) {
  const { _id = "", images = [] } = req.body as IProduct;

  if (!isValidObjectId(_id)) {
    return res.status(400).json({ message: "El id del producto no es valido" });
  }

  if (images.length < 2) {
    return res
      .status(400)
      .json({ message: "Es necesario al menos dos imagenes" });
  }

  // TODO: posiblemente tendremos un localhost:3000/products/imag.jpg
  try {
    db.connect();
    const product = await Product.findById(_id);
    if (!product) {
      db.disconnect();
      return res
        .status(400)
        .json({ message: "No existe un producto con ese ID" });
    }

    product.images.forEach(async (image) => {
      if (!images.includes(image)) {
        // TODO: eliminar imagen https://res.cloudinary.com/dqu7u3rpg/image/upload/v1697218566/lrs21nzsuk6moa4uvys3.webp
        const [fileId, extension] = image
          .substring(image.lastIndexOf("/") + 1)
          .split(".");
        await cloudinary.uploader.destroy(fileId);
      }
    });
    // TODO: eliminar fotos de Cloudinary
    await product.update(req.body);

    db.disconnect();
    return res.status(200).json(product);
  } catch (error) {
    console.log(error);
    db.disconnect();
    return res.status(400).json({ message: "Revisar la consola del servidor" });
  }
}
async function createProduct(req: NextApiRequest, res: NextApiResponse<Data>) {
  const { images = [] } = req.body as IProduct;

  if (images.length < 2) {
    return res
      .status(400)
      .json({ message: "Es necesario al menos dos imagenes" });
  }

  // TODO: posiblemente tendremos un localhost:3000/products/imag.jpg
  try {
    await db.connect();
    const productInDB = await Product.findOne({ slug: req.body.slug });
    if (productInDB) {
      return res
        .status(400)
        .json({ message: "Ya existe un producto con ese slug" });
    }

    const product = new Product(req.body);
    await product.save();

    await db.disconnect();
    return res.status(201).json(product);
  } catch (error) {
    console.log(error);
    await db.disconnect();

    return res.status(400).json({ message: "Revisar la consola del servidor" });
  }
}
