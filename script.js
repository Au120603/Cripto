const apiURL =
  "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,binancecoin,cardano,solana,ripple,dogecoin,polkadot,chainlink,litecoin&vs_currencies=usd";

const cryptoIcons = {
  bitcoin: "https://assets.coingecko.com/coins/images/1/thumb/bitcoin.png",
  ethereum: "https://assets.coingecko.com/coins/images/279/thumb/ethereum.png",
  binancecoin:
    "https://assets.coingecko.com/coins/images/825/thumb/binance-coin-logo.png",
  cardano: "https://assets.coingecko.com/coins/images/975/thumb/cardano.png",
  solana: "https://assets.coingecko.com/coins/images/4128/thumb/solana.png",
  ripple:
    "https://assets.coingecko.com/coins/images/44/thumb/xrp-symbol-white-128.png",
  dogecoin: "https://assets.coingecko.com/coins/images/5/thumb/dogecoin.png",
  polkadot:
    "https://assets.coingecko.com/coins/images/12171/thumb/polkadot.png",
  chainlink:
    "https://assets.coingecko.com/coins/images/877/thumb/chainlink-new-logo.png",
  litecoin: "https://assets.coingecko.com/coins/images/2/thumb/litecoin.png",
};

const cryptoMap = {
  bitcoin: "Bitcoin",
  ethereum: "Ethereum",
  binancecoin: "Binance Coin",
  cardano: "Cardano",
  solana: "Solana",
  ripple: "XRP",
  dogecoin: "Dogecoin",
  polkadot: "Polkadot",
  chainlink: "Chainlink",
  litecoin: "Litecoin",
};

let alerts = JSON.parse(localStorage.getItem("cryptoAlerts")) || [];

async function fetchPrices() {
  const res = await fetch(apiURL);
  const data = await res.json();
  displayPrices(data);
  checkAlerts(data);
}

function displayPrices(data) {
  const list = document.getElementById("crypto-list");
  const select = document.getElementById("crypto");
  list.classList.remove("loader");
  list.innerHTML = "";
  select.innerHTML = "";

  for (const [key, value] of Object.entries(data)) {
    const icon = cryptoIcons[key] || "https://via.placeholder.com/36";
    list.innerHTML += `
      <div class="crypto-item">
        <img src="${icon}" alt="${cryptoMap[key]}" class="crypto-icon" />
        <div>
          <strong>${cryptoMap[key]}</strong><br />
          $${value.usd}
        </div>
      </div>`;
    select.innerHTML += `<option value="${key}">${cryptoMap[key]}</option>`;
  }
}

function setAlert() {
  const crypto = document.getElementById("crypto").value;
  const price = parseFloat(document.getElementById("price").value);
  if (isNaN(price)) return alert("Ingresa un precio válido");
  alerts.push({ crypto, price });
  saveAlerts();
  showAlerts();
}

function showAlerts() {
  const alertBox = document.getElementById("alerts");
  alertBox.innerHTML = "<h3>Alertas activas:</h3>";
  alerts.forEach((a, index) => {
    alertBox.innerHTML += `
      <p>
        ${cryptoMap[a.crypto]}: $${a.price.toFixed(2)}
        <button onclick="removeAlert(${index})" class="delete-btn">Eliminar</button>
      </p>`;
  });
}

function checkAlerts(prices) {
  alerts = alerts.filter((alert) => {
    const current = prices[alert.crypto].usd;
    console.log(
      `[DEBUG] Revisando ${
        cryptoMap[alert.crypto]
      } - Actual: $${current} / Meta: $${alert.price}`
    );
    if (current >= alert.price) {
      alertUser(
        `${cryptoMap[alert.crypto]} ha alcanzado $${current} (meta: $${
          alert.price
        })`
      );
      return false;
    }
    return true;
  });
  saveAlerts();
  showAlerts();
}

function saveAlerts() {
  localStorage.setItem("cryptoAlerts", JSON.stringify(alerts));
}

function removeAlert(index) {
  alerts.splice(index, 1);
  saveAlerts();
  showAlerts();
}

function alertUser(message) {
  console.log("🔔 ALERTA:", message);
  if ("Notification" in window) {
    if (Notification.permission === "granted") {
      new Notification("Alerta Cripto", { body: message });
    } else {
      alert(message);
    }
  } else {
    alert(message);
  }
}

if ("Notification" in window && Notification.permission !== "granted") {
  Notification.requestPermission();
}

fetchPrices();
setInterval(fetchPrices, 5000);
showAlerts();
