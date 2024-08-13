const apiKey = "0366c0fcffd273a27a234593";
const BASE_URL = `https://v6.exchangerate-api.com/v6/${apiKey}/latest/`;
const selectors = document.getElementsByTagName("select");
const btn = document.querySelector("button");
const fromCurrency = document.querySelector("#from");
const toCurrency = document.querySelector("#to");
const msg = document.querySelector("#msg");
const swap = document.querySelector("#swap");

swap.addEventListener("click", () => {
  const temp = fromCurrency.value;
  fromCurrency.value = toCurrency.value;
  toCurrency.value = temp;
  updateFlag(fromCurrency);
  updateFlag(toCurrency);
  calculateConversion(new Event("submit"));
});

const populateCurrencyOptions = () => {
  Array.from(selectors).forEach((select) => {
    Object.keys(countryList).forEach((currencyCode) => {
      const newOption = document.createElement("option");
      newOption.value = currencyCode;
      newOption.textContent = currencyCode;
      if (select.name === "from" && currencyCode === "USD") {
        newOption.selected = true;
        fromCurrency.value = "USD";
      } else if (select.name === "to" && currencyCode === "PKR") {
        newOption.selected = true;
        toCurrency.value = "PKR";
      }
      select.appendChild(newOption);
    });
    select.addEventListener("change", (evt) => {
      updateFlag(evt.target);
    });
  });
};

const updateFlag = (element) => {
  const currencyCode = element.value;
  const countryCode = countryList[currencyCode];
  const img = element.parentElement.querySelector("img");
  img.alt = `${currencyCode} flag`;
  img.src = `https://flagsapi.com/${countryCode}/flat/32.png`;
};

const fetchConversionRates = async () => {
  const fromCountry = fromCurrency.value;
  const localStorageKey = `conversionRates_${fromCountry}`;

  const getStoredData = () => {
    const storedData = localStorage.getItem(localStorageKey);
    return storedData ? JSON.parse(storedData) : null;
  };

  const isDataStale = (nextUpdate) => {
    return Date.now() >= nextUpdate * 1000;
  };

  const storeData = (data) => {
    const storageObject = {
      base_currency: data.base_code,
      next_update: data.time_next_update_unix,
      conversion_rates: data.conversion_rates,
      timestamp: Date.now(),
    };
    localStorage.setItem(localStorageKey, JSON.stringify(storageObject));
  };

  const storedData = getStoredData();
  if (storedData && !isDataStale(storedData.next_update)) {
    return storedData.conversion_rates;
  }

  localStorage.removeItem(localStorageKey);

  try {
    const response = await fetch(`${BASE_URL}${fromCountry}`);
    if (!response.ok) throw new Error("Network response was not ok");
    const data = await response.json();
    storeData(data);
    return data.conversion_rates;
  } catch (error) {
    console.error("Fetch error:", error);
    msg.textContent =
      "Failed to fetch conversion rates. Please try again later.";
    msg.style.display = "block";
    return null;
  }
};

const calculateConversion = async (evt) => {
  evt.preventDefault();

  if (fromCurrency.value === toCurrency.value) {
    msg.innerHTML = `<span class="text-red-500">The selected currencies are the same. <br/> Please select different currencies.</span>`;
    msg.style.display = "block";
    return;
  }

  const amountInput = document.querySelector("form input");
  let amountValue = parseFloat(amountInput.value) || 1;
  amountInput.value = amountValue;

  const conversionRates = await fetchConversionRates();
  if (!conversionRates) return;

  const fromCurrencyCode = fromCurrency.value.toUpperCase();
  const toCurrencyCode = toCurrency.value.toUpperCase();
  const fromRate = conversionRates[fromCurrencyCode];
  const toRate = conversionRates[toCurrencyCode];

  if (toRate === undefined || fromRate === undefined) {
    msg.innerHTML = `<span class="text-red-500">Conversion rate not available for the selected currencies. <br/> Please try again later.</span>`;
    msg.style.display = "block";
    return;
  }

  const formatNumber = (num) => {
    return new Intl.NumberFormat(navigator.language, {
      minimumFractionDigits: 0,
      maximumFractionDigits: 4,
    }).format(num);
  };

  const rate = formatNumber(toRate / fromRate);
  const finalAmount = formatNumber(rate * amountValue);

  msg.innerHTML =
    amountValue === 1
      ? `<span>${amountValue} ${fromCurrencyCode} = ${finalAmount} ${toCurrencyCode}</span>`
      : `<span>1 ${fromCurrencyCode} = ${rate} ${toCurrencyCode}</span> <br/> <span>${amountValue} ${fromCurrencyCode} = ${finalAmount} ${toCurrencyCode}</span>`;

  msg.style.display = "block";
};

const init = () => {
  populateCurrencyOptions();
  btn.addEventListener("click", calculateConversion);
};

init();
