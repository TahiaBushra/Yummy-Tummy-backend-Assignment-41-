import { Request, Response } from "express";
import Restaurant from "../models/restaurant.model";
import cloudinary from "cloudinary";
import mongoose from "mongoose";

export const createMyRestaurant = async (req: Request, res: Response) => {
  try {
    const exitingRestaurant = await Restaurant.findOne({ user: req.userId });

    if (exitingRestaurant) {
      return res
        .status(409)
        .json({ message: "User restaurant already exists" });
    }
    //Getting image file from Multer
    const image = req.file as Express.Multer.File;

    //Convert image file into base64
    const base64Image = Buffer.from(image.buffer).toString("base64");

    const dataURI = `data:${image.mimetype};base64,${base64Image}`;

    const uploadResponse = await cloudinary.v2.uploader.upload(dataURI);

    const restaurant = new Restaurant(req.body);

    restaurant.imageUrl = uploadResponse.url;
    restaurant.user = new mongoose.Types.ObjectId(req.userId);

    await restaurant.save();

    res.status(201).send(restaurant);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

export const getMyRestaurant = async (req: Request, res: Response) => {
  try {
    const restaurant = await Restaurant.findOne({ user: req.userId });

    if (!restaurant) {
      return res.status(404).json({ message: "Restaurant not found" });
    }

    res.status(200).json(restaurant);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Something went wrong" });
  }
};