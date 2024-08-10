import QRCode from "qrcode";

const generateQrCode = async (text) => {
  try {
    const data = await QRCode.toDataURL(text);

    return data;
  } catch (err) {
    console.error(err);
  }
};

export default generateQrCode;
