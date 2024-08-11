import QRCode from "qrcode";

const generateQrCode = async (text) => {
  try {
    const url = `http://localhost/5500/${text}/confirm`;
    const data = await QRCode.toDataURL(url);

    return data;
  } catch (err) {
    console.error(err);
  }
};

export default generateQrCode;
