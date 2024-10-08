const cloudinary = require("cloudinary");

// Configuration
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
});

// uploadImage

const cloudinaryUploadPhoto = async (fileUpload) => {
  try {
    const data = await cloudinary.uploader.upload(fileUpload, {
      resource_type: "auto",
    });
    return data;
  } catch (error) {
    console.log(error);
  }
};

// removeImage
const removeImageCloudinary = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result;
  } catch (error) {
    console.log(error);
  }
};


const removeImagesCloudinary = async (publicIds) => {
  try {
    const results = await Promise.all(
      publicIds.map((publicId) => cloudinary.uploader.destroy(publicId))
    );
    return results;
  } catch (error) {
    console.log(error);
  }
};

module.exports = {
  cloudinaryUploadPhoto,
  removeImageCloudinary,
  removeImagesCloudinary,
};
