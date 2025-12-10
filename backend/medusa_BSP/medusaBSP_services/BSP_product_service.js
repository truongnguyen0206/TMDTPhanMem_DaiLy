// const fetch = require("node-fetch");

async function getAllProducts() {
  const url = "http://100.65.202.126:9000/store/products";

  const response = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      "x-publishable-api-key": process.env.MEDUSA_API_KEY
    }
  });

  if (!response.ok) {
    throw new Error(`Medusa API trả lỗi: ${response.status}`);
  }

  return await response.json();
}

module.exports = { getAllProducts };